"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { siteSettingsFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";
import { SITE_SETTINGS_CACHE_TAG } from "@/lib/cache-tags";
import { mergeSiteChrome } from "@/lib/site-settings";

function parseOptionalJsonArray(raw: string | undefined, label: string): unknown[] | undefined {
  const t = (raw ?? "").trim();
  if (!t) return undefined;
  try {
    const v = JSON.parse(t) as unknown;
    if (!Array.isArray(v)) throw new Error("not array");
    return v;
  } catch {
    throw new Error(label);
  }
}

function parseLanguages(input: string | undefined): { code: string; label: string }[] {
  const raw = (input || "").trim();
  if (!raw) return [{ code: "en", label: "English" }];
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const items = lines
    .map((line) => {
      const [codeRaw, ...labelParts] = line.split("|");
      const code = (codeRaw || "").trim();
      const label = labelParts.join("|").trim();
      if (!code || !label) return null;
      return { code, label };
    })
    .filter((x): x is { code: string; label: string } => !!x);
  return items.length > 0 ? items : [{ code: "en", label: "English" }];
}

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const raw = {
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    logo: formData.get("logo") || undefined,
    footerLogo: formData.get("footerLogo") || undefined,
    phone: formData.get("phone"),
    address: formData.get("address"),
    officeHours: formData.get("officeHours"),
    emailPrograms: formData.get("emailPrograms"),
    emailMedia: formData.get("emailMedia"),
    emailInfo: formData.get("emailInfo"),
    socialTwitter: formData.get("socialTwitter") || undefined,
    socialLinkedin: formData.get("socialLinkedin") || undefined,
    socialInstagram: formData.get("socialInstagram") || undefined,
    socialFacebook: formData.get("socialFacebook") || undefined,
    languages: formData.get("languages") || undefined,
    skipToContentLabel: formData.get("skipToContentLabel") || undefined,
    headerContactCta: formData.get("headerContactCta") || undefined,
    headerSearchAriaLabel: formData.get("headerSearchAriaLabel") || undefined,
    mobileDrawerAriaLabel: formData.get("mobileDrawerAriaLabel") || undefined,
    mobileDrawerCloseAriaLabel: formData.get("mobileDrawerCloseAriaLabel") || undefined,
    mobileSearchButtonLabel: formData.get("mobileSearchButtonLabel") || undefined,
    mobileDrawerContactCta: formData.get("mobileDrawerContactCta") || undefined,
    mobileLanguageEyebrow: formData.get("mobileLanguageEyebrow") || undefined,
    footerContactHeading: formData.get("footerContactHeading") || undefined,
    footerQuickLinksHeading: formData.get("footerQuickLinksHeading") || undefined,
    footerOurWorkHeading: formData.get("footerOurWorkHeading") || undefined,
    footerGetInvolvedLabel: formData.get("footerGetInvolvedLabel") || undefined,
    footerRightsReserved: formData.get("footerRightsReserved") || undefined,
    footerAdminLabel: formData.get("footerAdminLabel") || undefined,
    chromeNavJson: formData.get("chromeNavJson") || undefined,
    chromeBottomNavJson: formData.get("chromeBottomNavJson") || undefined,
    chromeFooterQuickLinksJson: formData.get("chromeFooterQuickLinksJson") || undefined,
    chromeFooterLegalJson: formData.get("chromeFooterLegalJson") || undefined,
    chromeFooterWorkThumbsJson: formData.get("chromeFooterWorkThumbsJson") || undefined,
    searchDialogAriaLabel: formData.get("searchDialogAriaLabel") || undefined,
    searchPlaceholder: formData.get("searchPlaceholder") || undefined,
    searchCloseAriaLabel: formData.get("searchCloseAriaLabel") || undefined,
    searchLoading: formData.get("searchLoading") || undefined,
    searchEmptyNoQuery: formData.get("searchEmptyNoQuery") || undefined,
    searchEmptyNoResults: formData.get("searchEmptyNoResults") || undefined,
    searchTypeEvent: formData.get("searchTypeEvent") || undefined,
    searchTypeNews: formData.get("searchTypeNews") || undefined,
    searchTypePublication: formData.get("searchTypePublication") || undefined,
    newsletterHeading: formData.get("newsletterHeading") || undefined,
    newsletterDescription: formData.get("newsletterDescription") || undefined,
    newsletterPlaceholder: formData.get("newsletterPlaceholder") || undefined,
    newsletterEmailAriaLabel: formData.get("newsletterEmailAriaLabel") || undefined,
    newsletterSubmit: formData.get("newsletterSubmit") || undefined,
    newsletterSubmitLoading: formData.get("newsletterSubmitLoading") || undefined,
    newsletterSubscribed: formData.get("newsletterSubscribed") || undefined,
    newsletterSuccessMessage: formData.get("newsletterSuccessMessage") || undefined,
    newsletterErrorGeneric: formData.get("newsletterErrorGeneric") || undefined,
    bcHome: formData.get("bcHome") || undefined,
    bcAbout: formData.get("bcAbout") || undefined,
    bcOurWork: formData.get("bcOurWork") || undefined,
    bcPrograms: formData.get("bcPrograms") || undefined,
    bcProjects: formData.get("bcProjects") || undefined,
    bcAdvisory: formData.get("bcAdvisory") || undefined,
    bcResearch: formData.get("bcResearch") || undefined,
    bcTraining: formData.get("bcTraining") || undefined,
    bcOurPartnerships: formData.get("bcOurPartnerships") || undefined,
    bcGetInvolved: formData.get("bcGetInvolved") || undefined,
    bcVolunteer: formData.get("bcVolunteer") || undefined,
    bcPartnership: formData.get("bcPartnership") || undefined,
    bcJoinUs: formData.get("bcJoinUs") || undefined,
    bcContact: formData.get("bcContact") || undefined,
    bcDonate: formData.get("bcDonate") || undefined,
    bcSubscribe: formData.get("bcSubscribe") || undefined,
    bcNews: formData.get("bcNews") || undefined,
    bcEvents: formData.get("bcEvents") || undefined,
    bcPublications: formData.get("bcPublications") || undefined,
    bcPrivacyPolicy: formData.get("bcPrivacyPolicy") || undefined,
    bcTermsOfService: formData.get("bcTermsOfService") || undefined,
    bcAppSummit: formData.get("bcAppSummit") || undefined,
    bcTeam: formData.get("bcTeam") || undefined,
    bcEventRegister: formData.get("bcEventRegister") || undefined,
  };

  const parsed = siteSettingsFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/site-settings?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid input")}`);
  }
  const data = parsed.data;

  let navJson: unknown[] | undefined;
  let bottomNavJson: unknown[] | undefined;
  let footerQuickJson: unknown[] | undefined;
  let footerLegalJson: unknown[] | undefined;
  let footerThumbsJson: unknown[] | undefined;
  try {
    navJson = parseOptionalJsonArray(data.chromeNavJson, "Main nav must be valid JSON array");
    bottomNavJson = parseOptionalJsonArray(data.chromeBottomNavJson, "Bottom nav must be valid JSON array");
    footerQuickJson = parseOptionalJsonArray(
      data.chromeFooterQuickLinksJson,
      "Footer quick links must be valid JSON array"
    );
    footerLegalJson = parseOptionalJsonArray(data.chromeFooterLegalJson, "Footer legal links must be valid JSON array");
    footerThumbsJson = parseOptionalJsonArray(
      data.chromeFooterWorkThumbsJson,
      "Footer work thumbnails must be valid JSON array"
    );
  } catch (e) {
    redirect(
      `/admin/site-settings?error=${encodeURIComponent(e instanceof Error ? e.message : "Invalid JSON")}`
    );
  }

  const chromePatch: Record<string, unknown> = {
    skipToContentLabel: data.skipToContentLabel,
    headerContactCta: data.headerContactCta,
    headerSearchAriaLabel: data.headerSearchAriaLabel,
    mobileDrawerAriaLabel: data.mobileDrawerAriaLabel,
    mobileDrawerCloseAriaLabel: data.mobileDrawerCloseAriaLabel,
    mobileSearchButtonLabel: data.mobileSearchButtonLabel,
    mobileDrawerContactCta: data.mobileDrawerContactCta,
    mobileLanguageEyebrow: data.mobileLanguageEyebrow,
  };
  if (navJson !== undefined) chromePatch.nav = navJson;
  if (bottomNavJson !== undefined) chromePatch.bottomNav = bottomNavJson;

  const footerPatch: Record<string, unknown> = {
    contactHeading: data.footerContactHeading,
    quickLinksHeading: data.footerQuickLinksHeading,
    ourWorkHeading: data.footerOurWorkHeading,
    getInvolvedLabel: data.footerGetInvolvedLabel,
    rightsReserved: data.footerRightsReserved,
    adminLabel: data.footerAdminLabel,
  };
  if (footerQuickJson !== undefined) footerPatch.quickLinks = footerQuickJson;
  if (footerLegalJson !== undefined) footerPatch.legal = footerLegalJson;
  if (footerThumbsJson !== undefined) footerPatch.workThumbnails = footerThumbsJson;
  chromePatch.footer = footerPatch;

  chromePatch.search = {
    dialogAriaLabel: data.searchDialogAriaLabel,
    placeholder: data.searchPlaceholder,
    closeAriaLabel: data.searchCloseAriaLabel,
    loading: data.searchLoading,
    emptyNoQuery: data.searchEmptyNoQuery,
    emptyNoResults: data.searchEmptyNoResults,
    typeEvent: data.searchTypeEvent,
    typeNews: data.searchTypeNews,
    typePublication: data.searchTypePublication,
  };
  chromePatch.newsletter = {
    heading: data.newsletterHeading,
    description: data.newsletterDescription,
    placeholder: data.newsletterPlaceholder,
    emailAriaLabel: data.newsletterEmailAriaLabel,
    submit: data.newsletterSubmit,
    submitLoading: data.newsletterSubmitLoading,
    subscribed: data.newsletterSubscribed,
    successMessage: data.newsletterSuccessMessage,
    errorGeneric: data.newsletterErrorGeneric,
  };
  chromePatch.breadcrumbs = {
    home: data.bcHome,
    about: data.bcAbout,
    ourWork: data.bcOurWork,
    programs: data.bcPrograms,
    projects: data.bcProjects,
    advisory: data.bcAdvisory,
    research: data.bcResearch,
    training: data.bcTraining,
    ourPartnerships: data.bcOurPartnerships,
    getInvolved: data.bcGetInvolved,
    volunteer: data.bcVolunteer,
    partnership: data.bcPartnership,
    joinUs: data.bcJoinUs,
    contact: data.bcContact,
    donate: data.bcDonate,
    subscribe: data.bcSubscribe,
    news: data.bcNews,
    events: data.bcEvents,
    publications: data.bcPublications,
    privacyPolicy: data.bcPrivacyPolicy,
    termsOfService: data.bcTermsOfService,
    appSummit: data.bcAppSummit,
    team: data.bcTeam,
    eventRegister: data.bcEventRegister,
  };

  const existingRow = await prisma.pageContent.findUnique({
    where: { slug: "site-settings" },
    select: { contentJson: true },
  });
  const existingJson = (existingRow?.contentJson as Record<string, unknown> | undefined) ?? {};
  const existingChrome =
    existingJson.chrome && typeof existingJson.chrome === "object" && !Array.isArray(existingJson.chrome)
      ? (existingJson.chrome as Record<string, unknown>)
      : {};
  const existingFooter =
    existingChrome.footer && typeof existingChrome.footer === "object" && !Array.isArray(existingChrome.footer)
      ? (existingChrome.footer as Record<string, unknown>)
      : {};

  const mergedChromePatch: Record<string, unknown> = {
    ...existingChrome,
    ...chromePatch,
    footer: {
      ...existingFooter,
      ...(chromePatch.footer as Record<string, unknown>),
    },
  };

  const chrome = mergeSiteChrome(mergedChromePatch);

  const payload = {
    name: data.name,
    tagline: data.tagline,
    logo: data.logo?.trim() || "",
    footerLogo: data.footerLogo?.trim() || "",
    phone: data.phone,
    address: data.address,
    officeHours: data.officeHours,
    email: {
      programs: data.emailPrograms,
      media: data.emailMedia,
      info: data.emailInfo,
    },
    social: {
      twitter: data.socialTwitter || "",
      linkedin: data.socialLinkedin || "",
      instagram: data.socialInstagram || "",
      facebook: data.socialFacebook || "",
      youtube: "",
    },
    languages: parseLanguages(data.languages),
    chrome,
  };

  try {
    await prisma.pageContent.upsert({
      where: { slug: "site-settings" },
      create: {
        slug: "site-settings",
        title: "Site Settings",
        status: "published",
        contentJson: payload as Prisma.InputJsonValue,
      },
      update: {
        title: "Site Settings",
        status: "published",
        contentJson: payload as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("updateSiteSettings:", err);
    redirect(`/admin/site-settings?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  updateTag(SITE_SETTINGS_CACHE_TAG);
  // Root layout metadata (description, og tags) comes from site settings — invalidate layout, not just "/".
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/site-settings");
  revalidatePath("/admin/pages");
  redirect("/admin/site-settings?saved=1");
}
