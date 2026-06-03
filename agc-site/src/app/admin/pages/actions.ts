"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { pageContentFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";

export async function updatePageContent(slug: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    slug: formData.get("slug"),
    title: formData.get("title") || undefined,
    mainTitle: formData.get("mainTitle") || undefined,
    status: formData.get("status") || "published",
    heroSubtitle: formData.get("heroSubtitle") || undefined,
    heroTitle: formData.get("heroTitle") || undefined,
    intro: formData.get("intro") || undefined,
    description: formData.get("description") || undefined,
    mission: formData.get("mission") || undefined,
    objectivesTitle: formData.get("objectivesTitle") || undefined,
    objectivesContent: formData.get("objectivesContent") || undefined,
    objectivesPrinciples: formData.get("objectivesPrinciples") || undefined,
    objectivesAgenda2063: formData.get("objectivesAgenda2063") || undefined,
    contentJson: formData.get("contentJson") || undefined,
  };

  // console.log("[updatePageContent] slug:", slug);
  // console.log("[updatePageContent] mainTitle raw:", raw.mainTitle);
  // console.log(
  //   "[updatePageContent] contentJson raw:",
  //   raw.contentJson?.slice(0, 200),
  // );
  // console.log("[updatePageContent] ALL raw data keys:", Object.keys(raw));

  const parsed = pageContentFormSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "[updatePageContent] Validation failed:",
      parsed.error.issues,
    );
    redirect(
      `/admin/pages/${encodeURIComponent(slug)}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  const data = parsed.data;
  let parsedContentJson: Record<string, unknown> | null = null;
  if (data.contentJson && data.contentJson.trim().length > 0) {
    try {
      const json = JSON.parse(data.contentJson);
      if (typeof json !== "object" || json === null || Array.isArray(json)) {
        redirect(
          `/admin/pages/${encodeURIComponent(slug)}/edit?error=${encodeURIComponent(
            "Use one `{ … }` block for all fields here—not a list that starts with `[`.",
          )}`,
        );
      }
      parsedContentJson = json as Record<string, unknown>;
    } catch {
      redirect(
        `/admin/pages/${encodeURIComponent(slug)}/edit?error=${encodeURIComponent(
          "We couldn’t read that text. Check brackets, commas, and quotes—or use the fields above instead.",
        )}`,
      );
    }
  }

  try {
    await prisma.pageContent.update({
      where: { slug },
      data: {
        slug: data.slug,
        title: data.title || null,
        mainTitle: data.mainTitle || null,
        status: data.status,
        heroSubtitle: data.heroSubtitle || null,
        heroTitle: data.heroTitle || null,
        intro: data.intro || null,
        description: data.description || null,
        mission: data.mission || null,
        objectivesTitle: data.objectivesTitle || null,
        objectivesContent: data.objectivesContent || null,
        objectivesPrinciples: data.objectivesPrinciples || null,
        objectivesAgenda2063: data.objectivesAgenda2063 || null,
        contentJson: parsedContentJson
          ? (parsedContentJson as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
      },
    });
  } catch (err) {
    console.error("[updatePageContent] Database error:", err);
    console.error(
      "[updatePageContent] Error message:",
      err instanceof Error ? err.message : "Unknown error",
    );
    redirect(
      `/admin/pages/${encodeURIComponent(slug)}/edit?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`,
    );
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${slug}/edit`);
  revalidatePath("/");
  revalidatePublicRouteForPageSlug(data.slug);
  redirect(`/admin/pages/${encodeURIComponent(slug)}/edit?saved=1`);
}

/** Map CMS page slug to public URL so ISR cache updates after admin save (hero images, copy). */
function revalidatePublicRouteForPageSlug(slug: string) {
  if (slug === "home") return;
  const pathBySlug: Record<string, string> = {
    programs: "/our-work/programs",
    projects: "/our-work/projects",
    advisory: "/our-work/advisory",
    research: "/our-work/research",
    training: "/our-work/training",
    "our-work-programs": "/our-work/programs",
    "our-work-projects": "/our-work",
    "our-work-advisory": "/our-work",
    "our-work-research": "/our-work/research",
    "our-work-training": "/our-work/training",
    "our-work-partnership": "/our-work/partnership",
    "get-involved-join-us": "/get-involved/join-us",
    "get-involved-partnership": "/get-involved/partnership",
    "get-involved-volunteer": "/get-involved/volunteer",
    subscribe: "/subscribe",
  };
  const primary = pathBySlug[slug] ?? `/${slug}`;
  revalidatePath(primary);
  if (slug === "events") {
    revalidatePath("/events/past");
  }
}
