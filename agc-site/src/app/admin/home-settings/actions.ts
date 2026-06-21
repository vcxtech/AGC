"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getHomePageCmsForEdit } from "@/lib/home-page-data";
import { getBootstrapHomePageCms } from "@/lib/cms-bootstrap";
import { homeSettingsFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";
import { isRichTextHtml } from "@/lib/rich-text";

function splitLines(input: string | undefined): string[] {
  return (input || "").split("\n").map((x) => x.trim()).filter(Boolean);
}

function trimOrEmpty(value: string | undefined): string {
  return value?.trim() ?? "";
}

export async function updateHomeSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;
  const current = await getHomePageCmsForEdit();
  const bootstrap = getBootstrapHomePageCms();
  const preferNonEmpty = (currentValue: string, bootstrapValue: string): string => {
    const c = currentValue?.trim() ?? "";
    if (c.length > 0) return currentValue;
    const b = bootstrapValue?.trim() ?? "";
    return b.length > 0 ? bootstrapValue : "";
  };

  const requiredFallbacks: Record<string, string> = {
    heroEyebrow: preferNonEmpty(current.heroContent.eyebrow, bootstrap.heroContent.eyebrow),
    heroTitle: preferNonEmpty(current.heroContent.title, bootstrap.heroContent.title),
    heroSubtitle: preferNonEmpty(current.heroContent.subtitle, bootstrap.heroContent.subtitle),
    heroCta: preferNonEmpty(current.heroContent.cta, bootstrap.heroContent.cta),
    heroCtaHref: preferNonEmpty(current.heroContent.ctaHref, bootstrap.heroContent.ctaHref),
    heroCtaSecondary: preferNonEmpty(current.heroContent.ctaSecondary, bootstrap.heroContent.ctaSecondary),
    heroCtaSecondaryHref: preferNonEmpty(current.heroContent.ctaSecondaryHref, bootstrap.heroContent.ctaSecondaryHref),
    homeReachTitle: preferNonEmpty(current.homeReach.title, bootstrap.homeReach.title),
    homePartnerBlurb: preferNonEmpty(current.homePartnerBlurb, bootstrap.homePartnerBlurb),
    testimonialQuote: preferNonEmpty(current.homeTestimonial.quote, bootstrap.homeTestimonial.quote),
    testimonialName: preferNonEmpty(current.homeTestimonial.name, bootstrap.homeTestimonial.name),
    testimonialTitle: preferNonEmpty(current.homeTestimonial.title, bootstrap.homeTestimonial.title),
    testimonialInitials: preferNonEmpty(current.homeTestimonial.initials, bootstrap.homeTestimonial.initials),
    spotlightLabel: preferNonEmpty(current.homeSpotlightStory.label, bootstrap.homeSpotlightStory.label),
    spotlightParagraphs: preferNonEmpty(
      current.homeSpotlightStory.paragraphs.join("\n"),
      bootstrap.homeSpotlightStory.paragraphs.join("\n")
    ),
    spotlightBody: preferNonEmpty(
      (current.homeSpotlightStory as { bodyHtml?: string }).bodyHtml ??
        current.homeSpotlightStory.paragraphs.join("\n"),
      (bootstrap.homeSpotlightStory as { bodyHtml?: string }).bodyHtml ??
        bootstrap.homeSpotlightStory.paragraphs.join("\n")
    ),
    spotlightName: preferNonEmpty(current.homeSpotlightStory.name, bootstrap.homeSpotlightStory.name),
    spotlightCtaLabel: preferNonEmpty(current.homeSpotlightStory.ctaLabel, bootstrap.homeSpotlightStory.ctaLabel),
    spotlightCtaHref: preferNonEmpty(current.homeSpotlightStory.ctaHref, bootstrap.homeSpotlightStory.ctaHref),
  };

  for (const [key, fallback] of Object.entries(requiredFallbacks)) {
    const value = raw[key];
    if (typeof value === "string" && value.trim() === "") {
      raw[key] = fallback;
    }
  }

  const parsed = homeSettingsFormSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.length ? String(issue.path[0]) : "field";
    const message = issue?.message || "Invalid input";
    redirect(`/admin/home-settings?error=${encodeURIComponent(`${field}: ${message}`)}`);
  }
  const d = parsed.data;

  const spotlightRaw = (d.spotlightBody ?? d.spotlightParagraphs ?? "").trim();
  const spotlightBodyHtml = isRichTextHtml(spotlightRaw) ? spotlightRaw : undefined;
  const spotlightParagraphs = spotlightBodyHtml
    ? []
    : splitLines(spotlightRaw).length > 0
      ? splitLines(spotlightRaw)
      : splitLines(d.spotlightParagraphs);

  const impactStats = splitLines(d.impactStats).map((line) => {
    const [value = "", label = "", note = ""] = line.split("|").map((x) => x.trim());
    return { value, label, note };
  }).filter((s) => s.value || s.label || s.note);

  const payload = {
    heroSliderImages: splitLines(d.heroSliderImages),
    heroBackgroundVideoSrc: d.heroBackgroundVideoSrc?.trim() ?? "",
    heroContent: {
      eyebrow: d.heroEyebrow,
      title: d.heroTitle,
      subtitle: d.heroSubtitle,
      cta: d.heroCta,
      ctaHref: d.heroCtaHref,
      ctaSecondary: d.heroCtaSecondary,
      ctaSecondaryHref: d.heroCtaSecondaryHref,
    },
    homeReach: {
      title: d.homeReachTitle,
      intro: d.homeReachIntro,
    },
    homeImpactMethodology: d.homeImpactMethodology,
    homePartnerBlurb: d.homePartnerBlurb,
    homeImpactStats: impactStats,
    homeTestimonial: {
      quote: d.testimonialQuote,
      name: d.testimonialName,
      title: d.testimonialTitle,
      organization: d.testimonialOrganization,
      initials: d.testimonialInitials,
    },
    homeSpotlightStory: {
      label: d.spotlightLabel,
      headline: d.spotlightHeadline,
      paragraphs: spotlightParagraphs,
      ...(spotlightBodyHtml ? { bodyHtml: spotlightBodyHtml } : {}),
      name: d.spotlightName,
      role: d.spotlightRole,
      initials: d.spotlightInitials,
      image: d.spotlightImage?.trim() ?? "",
      ctaLabel: d.spotlightCtaLabel,
      ctaHref: d.spotlightCtaHref,
    },
    homeCtaBand: {
      eyebrow: d.ctaBandEyebrow ?? "",
      title: d.ctaBandTitle ?? "",
      body: d.ctaBandBody ?? "",
      image: d.ctaBandImage?.trim() ?? "",
      primaryCta: d.ctaBandPrimaryCta ?? "",
      primaryHref: d.ctaBandPrimaryHref ?? "/get-involved",
      secondaryCta: d.ctaBandSecondaryCta ?? "",
      secondaryHref: d.ctaBandSecondaryHref ?? "/about",
    },
    homeNewsTeaser: {
      title: d.homeNewsTitle ?? "",
      subtitle: d.homeNewsSubtitle ?? "",
    },
    homeEventsTitle: d.homeEventsTitle ?? "",
  };

  const workPillarPatch = {
    pillarRowTitlePrimary: trimOrEmpty(d.pillarRowTitlePrimary),
    pillarRowDescriptionPrimary: trimOrEmpty(d.pillarRowDescriptionPrimary),
    pillarRowTitleSecondary: trimOrEmpty(d.pillarRowTitleSecondary),
    pillarRowDescriptionSecondary: trimOrEmpty(d.pillarRowDescriptionSecondary),
    pillarReadMoreLabel: trimOrEmpty(d.pillarReadMoreLabel),
    pillarCardImages: {
      programs: trimOrEmpty(d.pillarImagePrograms),
      projects: trimOrEmpty(d.pillarImageProjects),
      advisory: trimOrEmpty(d.pillarImageAdvisory),
      research: trimOrEmpty(d.pillarImageResearch),
      training: trimOrEmpty(d.pillarImageTraining),
      partnership: trimOrEmpty(d.pillarImagePartnership),
    },
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pageContent.upsert({
        where: { slug: "home" },
        create: { slug: "home", title: "Homepage", status: "published", contentJson: payload as Prisma.InputJsonValue },
        update: { title: "Homepage", contentJson: payload as Prisma.InputJsonValue },
      });

      const existingOurWork = await tx.pageContent.findUnique({
        where: { slug: "our-work" },
        select: { contentJson: true },
      });
      const currentOurWorkJson =
        existingOurWork?.contentJson && typeof existingOurWork.contentJson === "object" && !Array.isArray(existingOurWork.contentJson)
          ? (existingOurWork.contentJson as Record<string, unknown>)
          : {};
      const currentPillarImages =
        currentOurWorkJson.pillarCardImages &&
        typeof currentOurWorkJson.pillarCardImages === "object" &&
        !Array.isArray(currentOurWorkJson.pillarCardImages)
          ? (currentOurWorkJson.pillarCardImages as Record<string, unknown>)
          : {};

      const mergedOurWork = {
        ...currentOurWorkJson,
        ...workPillarPatch,
        pillarCardImages: {
          ...currentPillarImages,
          ...workPillarPatch.pillarCardImages,
        },
      };

      await tx.pageContent.upsert({
        where: { slug: "our-work" },
        create: {
          slug: "our-work",
          title: "Our Work",
          status: "published",
          contentJson: mergedOurWork as Prisma.InputJsonValue,
        },
        update: {
          title: "Our Work",
          contentJson: mergedOurWork as Prisma.InputJsonValue,
        },
      });
    });
  } catch (err) {
    console.error("updateHomeSettings:", err);
    redirect(`/admin/home-settings?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/");
  revalidatePath("/our-work");
  revalidatePath("/admin/home-settings");
  redirect("/admin/home-settings?saved=1");
}
