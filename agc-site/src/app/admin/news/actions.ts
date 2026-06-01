"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

function parseNewsDownloadResourcesFromForm(
  formData: FormData,
):
  | { ok: true; value: Prisma.InputJsonValue | null }
  | { ok: false; message: string } {
  const raw = formData.get("downloadResourcesJson");
  if (typeof raw !== "string") {
    return { ok: true, value: null };
  }
  const trimmed = raw.trim();
  const socialLinks = {
    facebook:
      typeof formData.get("socialFacebook") === "string"
        ? String(formData.get("socialFacebook")).trim()
        : "",
    x:
      typeof formData.get("socialX") === "string"
        ? String(formData.get("socialX")).trim()
        : "",
    linkedin:
      typeof formData.get("socialLinkedin") === "string"
        ? String(formData.get("socialLinkedin")).trim()
        : "",
    instagram:
      typeof formData.get("socialInstagram") === "string"
        ? String(formData.get("socialInstagram")).trim()
        : "",
    email:
      typeof formData.get("socialEmail") === "string"
        ? String(formData.get("socialEmail")).trim()
        : "",
  };
  const hasSocialLinks = Object.values(socialLinks).some(Boolean);
  if (trimmed === "" || trimmed === "[]") {
    if (!hasSocialLinks) return { ok: true, value: null };
    return {
      ok: true,
      value: {
        downloads: [],
        socialLinks,
      } as Prisma.InputJsonValue,
    };
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        message:
          'Document downloads must be a JSON array, e.g. [{ "label": "…", "href": "/uploads/…" }].',
      };
    }
    const cleaned: { label: string; href: string; description?: string }[] = [];
    for (const x of parsed) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      const label =
        typeof o.label === "string" ? o.label.trim().slice(0, 500) : "";
      const href =
        typeof o.href === "string" ? o.href.trim().slice(0, 2000) : "";
      if (!label || !href) continue;
      const row: { label: string; href: string; description?: string } = {
        label,
        href,
      };
      if (typeof o.description === "string" && o.description.trim()) {
        row.description = o.description.trim().slice(0, 2000);
      }
      cleaned.push(row);
    }
    if (!cleaned.length && !hasSocialLinks) {
      return { ok: true, value: null };
    }
    if (!hasSocialLinks) {
      return { ok: true, value: cleaned as Prisma.InputJsonValue };
    }
    return {
      ok: true,
      value: {
        downloads: cleaned,
        socialLinks,
      } as Prisma.InputJsonValue,
    };
  } catch {
    return {
      ok: false,
      message:
        "Document downloads must be valid JSON (array of objects with label and href).",
    };
  }
}
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { newsFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";

async function filterNewsCategories(slugs: string[]): Promise<string[]> {
  const t = await getSiteTaxonomy();
  const allow = new Set(t.newsCategories.map((c) => c.slug));
  return slugs.filter((s) => allow.has(s));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function isNewsSlugTaken(
  slug: string,
  excludeId?: number,
): Promise<boolean> {
  const existing = await prisma.news.findFirst({
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

export async function createNews(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    image: formData.get("image") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    author: formData.get("author") || undefined,
    categories: formData
      .getAll("categories")
      .filter((x): x is string => typeof x === "string"),
    tags: formData.get("tags")
      ? (formData.get("tags") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    socialFacebook: formData.get("socialFacebook") || undefined,
    socialX: formData.get("socialX") || undefined,
    socialLinkedin: formData.get("socialLinkedin") || undefined,
    socialInstagram: formData.get("socialInstagram") || undefined,
    socialEmail: formData.get("socialEmail") || undefined,
    status: formData.get("status") || "draft",
    datePublished: formData.get("datePublished") || undefined,
  };

  const parsed = newsFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(
      `/admin/news/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  const dr = parseNewsDownloadResourcesFromForm(formData);
  if (!dr.ok) {
    redirect(`/admin/news/new?error=${encodeURIComponent(dr.message)}`);
  }

  const {
    title,
    slug,
    image,
    excerpt,
    content,
    author,
    categories: rawCats,
    tags,
    status,
    datePublished,
  } = parsed.data;
  const finalSlug = slug?.trim() || slugify(title);
  if (!finalSlug) {
    redirect(
      `/admin/news/new?error=${encodeURIComponent("Please provide a valid slug.")}`,
    );
  }
  if (await isNewsSlugTaken(finalSlug)) {
    redirect(
      `/admin/news/new?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`,
    );
  }
  const categories = await filterNewsCategories(rawCats ?? []);

  let created;
  try {
    created = await prisma.news.create({
      data: {
        title,
        slug: finalSlug,
        image: image || null,
        excerpt: excerpt || null,
        content: content || null,
        author: author || null,
        categories: categories?.length ? categories : [],
        tags: tags?.length ? tags : [],
        downloadResources: dr.value === null ? Prisma.JsonNull : dr.value,
        status,
        datePublished: datePublished ? new Date(datePublished) : null,
      },
    });
  } catch (err) {
    if (isSlugUniqueConstraintError(err)) {
      redirect(
        `/admin/news/new?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`,
      );
    }
    console.error("createNews:", err);
    redirect(
      `/admin/news/new?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`,
    );
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  redirect(`/admin/news/${created.id}/edit?saved=created`);
}

export async function updateNews(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    image: formData.get("image") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    author: formData.get("author") || undefined,
    categories: formData
      .getAll("categories")
      .filter((x): x is string => typeof x === "string"),
    tags: formData.get("tags")
      ? (formData.get("tags") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    socialFacebook: formData.get("socialFacebook") || undefined,
    socialX: formData.get("socialX") || undefined,
    socialLinkedin: formData.get("socialLinkedin") || undefined,
    socialInstagram: formData.get("socialInstagram") || undefined,
    socialEmail: formData.get("socialEmail") || undefined,
    status: formData.get("status") || "draft",
    datePublished: formData.get("datePublished") || undefined,
  };

  const parsed = newsFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(
      `/admin/news/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  const dr = parseNewsDownloadResourcesFromForm(formData);
  if (!dr.ok) {
    redirect(`/admin/news/${id}/edit?error=${encodeURIComponent(dr.message)}`);
  }

  const {
    title,
    slug,
    image,
    excerpt,
    content,
    author,
    categories: rawCats,
    tags,
    status,
    datePublished,
  } = parsed.data;
  const finalSlug = slug?.trim() || slugify(title);
  if (!finalSlug) {
    redirect(
      `/admin/news/${id}/edit?error=${encodeURIComponent("Please provide a valid slug.")}`,
    );
  }
  if (await isNewsSlugTaken(finalSlug, id)) {
    redirect(
      `/admin/news/${id}/edit?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`,
    );
  }
  const categories = await filterNewsCategories(rawCats ?? []);

  try {
    await prisma.news.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        image: image || null,
        excerpt: excerpt || null,
        content: content || null,
        author: author || null,
        categories: categories?.length ? categories : [],
        tags: tags?.length ? tags : [],
        downloadResources: dr.value === null ? Prisma.JsonNull : dr.value,
        status,
        datePublished: datePublished ? new Date(datePublished) : null,
      },
    });
  } catch (err) {
    if (isSlugUniqueConstraintError(err)) {
      redirect(
        `/admin/news/${id}/edit?error=${encodeURIComponent("Slug already exists. Use a different slug.")}`,
      );
    }
    console.error("updateNews:", err);
    redirect(
      `/admin/news/${id}/edit?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`,
    );
  }

  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${id}/edit`);
  revalidatePath("/news");
  revalidatePath("/");
  redirect(`/admin/news/${id}/edit?saved=1`);
}

export async function deleteNews(id: number, _formData?: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  try {
    await prisma.news.delete({ where: { id } });
  } catch (err) {
    console.error("deleteNews:", err);
    redirect(`/admin/news?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/news?saved=deleted");
}
