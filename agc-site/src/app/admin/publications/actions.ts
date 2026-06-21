"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { publicationFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";

async function filterPublicationTypes(slugs: string[]): Promise<string[]> {
  const t = await getSiteTaxonomy();
  const allow = new Set(t.publicationTypes.map((x) => x.slug));
  return slugs.filter((s) => allow.has(s));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function isPublicationSlugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const existing = await prisma.publication.findFirst({
    where: {
      slug,
      ...(typeof excludeId === "number" ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!existing;
}

function isSlugUniqueConstraintError(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== "P2002") return false;
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes("slug");
  return typeof target === "string" ? target.includes("slug") : false;
}

export async function createPublication(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    types: formData.getAll("types").filter((x): x is string => typeof x === "string"),
    file: formData.get("file") || undefined,
    image: formData.get("image") || undefined,
    datePublished: formData.get("datePublished") || undefined,
    author: formData.get("author") || undefined,
    status: formData.get("status") || "draft",
  };

  const parsed = publicationFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/publications/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }

  const { title, slug, excerpt, content, types: typeSlugs, file, image, datePublished, author, status } = parsed.data;
  const finalSlug = slug?.trim() || slugify(title);
  if (!finalSlug) {
    redirect(`/admin/publications/new?error=${encodeURIComponent("Please provide a valid slug.")}`);
  }
  if (await isPublicationSlugTaken(finalSlug)) {
    redirect(`/admin/publications/new?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`);
  }
  const types = await filterPublicationTypes(typeSlugs ?? []);

  let created;
  try {
    created = await prisma.publication.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content: content || null,
        types: types.length > 0 ? (types as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
        file: file || null,
        image: image || null,
        datePublished: datePublished ? new Date(datePublished) : null,
        author: author || null,
        status,
      },
    });
  } catch (err) {
    if (isSlugUniqueConstraintError(err)) {
      redirect(`/admin/publications/new?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`);
    }
    console.error("createPublication:", err);
    redirect(`/admin/publications/new?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/admin/publications");
  revalidatePath("/");
  redirect(`/admin/publications/${created.id}/edit?saved=created`);
}

export async function updatePublication(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    types: formData.getAll("types").filter((x): x is string => typeof x === "string"),
    file: formData.get("file") || undefined,
    image: formData.get("image") || undefined,
    datePublished: formData.get("datePublished") || undefined,
    author: formData.get("author") || undefined,
    status: formData.get("status") || "draft",
  };

  const parsed = publicationFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/publications/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }

  const { title, slug, excerpt, content, types: typeSlugs, file, image, datePublished, author, status } = parsed.data;
  const finalSlug = slug?.trim() || slugify(title);
  if (!finalSlug) {
    redirect(`/admin/publications/${id}/edit?error=${encodeURIComponent("Please provide a valid slug.")}`);
  }
  if (await isPublicationSlugTaken(finalSlug, id)) {
    redirect(`/admin/publications/${id}/edit?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`);
  }
  const types = await filterPublicationTypes(typeSlugs ?? []);

  try {
    await prisma.publication.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content: content || null,
        types: types.length > 0 ? (types as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
        file: file || null,
        image: image || null,
        datePublished: datePublished ? new Date(datePublished) : null,
        author: author || null,
        status,
      },
    });
  } catch (err) {
    if (isSlugUniqueConstraintError(err)) {
      redirect(`/admin/publications/${id}/edit?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`);
    }
    console.error("updatePublication:", err);
    redirect(`/admin/publications/${id}/edit?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/admin/publications");
  revalidatePath(`/admin/publications/${id}/edit`);
  revalidatePath("/");
  redirect(`/admin/publications/${id}/edit?saved=1`);
}

export async function deletePublication(id: number, _formData?: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  try {
    await prisma.publication.delete({ where: { id } });
  } catch (err) {
    console.error("deletePublication:", err);
    redirect(`/admin/publications?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/admin/publications");
  revalidatePath("/");
  redirect("/admin/publications?saved=deleted");
}
