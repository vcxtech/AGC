import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { siteConfig } from "@/data/content";
import { DEFAULT_SITE_CHROME, type SiteChrome, type SiteNavItem, type SiteNavLink } from "@/data/site-chrome";
import { SITE_SETTINGS_CACHE_TAG } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
import { resolveImageUrl } from "@/lib/media";
import { parseBottomNav, parseLinkList, parseNavList, parseWorkThumbs } from "@/lib/site-chrome-parse";
import { markDevDatabaseUnreachable, shouldSkipPrismaCalls } from "@/lib/skip-db";

export type SiteSettings = {
  name: string;
  tagline: string;
  /** Media library id, path, or URL — header & mobile nav */
  logo: string;
  /** Optional darker-background logo (footer, drawer). Empty = same as header logo. */
  footerLogo: string;
  email: {
    programs: string;
    media: string;
    info: string;
  };
  phone: string;
  address: string;
  officeHours: string;
  social: {
    twitter: string;
    linkedin: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
  languages: { code: string; label: string }[];
  /** Header, footer, and mobile navigation copy (Admin → Site settings). */
  chrome: SiteChrome;
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  ...siteConfig,
  chrome: DEFAULT_SITE_CHROME,
};

/**
 * Keeps `subLinks` on parents (e.g. About → careers / partner / newsletter) for mobile + admin;
 * skips duplicate `href` values across parents and children.
 */
function normalizeSiteNav(nav: SiteNavItem[]): SiteNavItem[] {
  const seen = new Set<string>();
  const out: SiteNavItem[] = [];
  for (const item of nav) {
    const h = item.href.trim();
    if (!h || seen.has(h)) continue;
    seen.add(h);
    const copy: SiteNavItem = { href: h, label: (item.label || h).trim() };
    if (item.subLinks?.length) {
      const subs: SiteNavLink[] = [];
      for (const s of item.subLinks) {
        const sh = s.href.trim();
        if (!sh || seen.has(sh)) continue;
        seen.add(sh);
        subs.push({ href: sh, label: (s.label || sh).trim() });
      }
      if (subs.length) copy.subLinks = subs;
    }
    out.push(copy);
  }
  return out;
}

export function mergeSiteChrome(patch: unknown): SiteChrome {
  const base = DEFAULT_SITE_CHROME;
  if (patch === null || patch === undefined || typeof patch !== "object" || Array.isArray(patch)) {
    return mergeSiteChrome({});
  }
  const p = patch as Record<string, unknown>;
  const footerPatch =
    p.footer && typeof p.footer === "object" && !Array.isArray(p.footer)
      ? (p.footer as Record<string, unknown>)
      : {};
  const searchPatch =
    p.search && typeof p.search === "object" && !Array.isArray(p.search)
      ? (p.search as Record<string, unknown>)
      : {};
  const newsletterPatch =
    p.newsletter && typeof p.newsletter === "object" && !Array.isArray(p.newsletter)
      ? (p.newsletter as Record<string, unknown>)
      : {};
  const breadcrumbPatch =
    p.breadcrumbs && typeof p.breadcrumbs === "object" && !Array.isArray(p.breadcrumbs)
      ? (p.breadcrumbs as Record<string, unknown>)
      : {};

  const rawNav =
    parseNavList(p.nav) ?? base.nav.map((i) => ({ ...i, subLinks: i.subLinks?.map((s) => ({ ...s })) }));
  const nav = normalizeSiteNav(rawNav);
  const bottomNav = parseBottomNav(p.bottomNav) ?? [...base.bottomNav];
  const quickLinks = parseLinkList(footerPatch.quickLinks);
  const legal = parseLinkList(footerPatch.legal);
  const workThumbnails = parseWorkThumbs(footerPatch.workThumbnails);

  const pickStr = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;

  const b = base.breadcrumbs;

  return {
    skipToContentLabel: pickStr(p.skipToContentLabel, base.skipToContentLabel),
    headerContactCta: pickStr(p.headerContactCta, base.headerContactCta),
    headerSearchAriaLabel: pickStr(p.headerSearchAriaLabel, base.headerSearchAriaLabel),
    mobileDrawerAriaLabel: pickStr(p.mobileDrawerAriaLabel, base.mobileDrawerAriaLabel),
    mobileDrawerCloseAriaLabel: pickStr(p.mobileDrawerCloseAriaLabel, base.mobileDrawerCloseAriaLabel),
    mobileSearchButtonLabel: pickStr(p.mobileSearchButtonLabel, base.mobileSearchButtonLabel),
    mobileDrawerContactCta: pickStr(p.mobileDrawerContactCta, base.mobileDrawerContactCta),
    mobileLanguageEyebrow: pickStr(p.mobileLanguageEyebrow, base.mobileLanguageEyebrow),
    nav,
    bottomNav,
    footer: {
      contactHeading: pickStr(footerPatch.contactHeading, base.footer.contactHeading),
      quickLinksHeading: pickStr(footerPatch.quickLinksHeading, base.footer.quickLinksHeading),
      ourWorkHeading: pickStr(footerPatch.ourWorkHeading, base.footer.ourWorkHeading),
      getInvolvedLabel: pickStr(footerPatch.getInvolvedLabel, base.footer.getInvolvedLabel),
      rightsReserved: pickStr(footerPatch.rightsReserved, base.footer.rightsReserved),
      adminLabel: pickStr(footerPatch.adminLabel, base.footer.adminLabel),
      quickLinks: quickLinks ?? base.footer.quickLinks.map((l) => ({ ...l })),
      legal: legal ?? base.footer.legal.map((l) => ({ ...l })),
      workThumbnails: workThumbnails ?? base.footer.workThumbnails.map((t) => ({ ...t })),
    },
    search: {
      dialogAriaLabel: pickStr(searchPatch.dialogAriaLabel, base.search.dialogAriaLabel),
      placeholder: pickStr(searchPatch.placeholder, base.search.placeholder),
      closeAriaLabel: pickStr(searchPatch.closeAriaLabel, base.search.closeAriaLabel),
      loading: pickStr(searchPatch.loading, base.search.loading),
      emptyNoQuery: pickStr(searchPatch.emptyNoQuery, base.search.emptyNoQuery),
      emptyNoResults: pickStr(searchPatch.emptyNoResults, base.search.emptyNoResults),
      typeEvent: pickStr(searchPatch.typeEvent, base.search.typeEvent),
      typeNews: pickStr(searchPatch.typeNews, base.search.typeNews),
      typePublication: pickStr(searchPatch.typePublication, base.search.typePublication),
    },
    newsletter: {
      heading: pickStr(newsletterPatch.heading, base.newsletter.heading),
      description: pickStr(newsletterPatch.description, base.newsletter.description),
      placeholder: pickStr(newsletterPatch.placeholder, base.newsletter.placeholder),
      emailAriaLabel: pickStr(newsletterPatch.emailAriaLabel, base.newsletter.emailAriaLabel),
      submit: pickStr(newsletterPatch.submit, base.newsletter.submit),
      submitLoading: pickStr(newsletterPatch.submitLoading, base.newsletter.submitLoading),
      subscribed: pickStr(newsletterPatch.subscribed, base.newsletter.subscribed),
      successMessage: pickStr(newsletterPatch.successMessage, base.newsletter.successMessage),
      errorGeneric: pickStr(newsletterPatch.errorGeneric, base.newsletter.errorGeneric),
    },
    breadcrumbs: {
      home: pickStr(breadcrumbPatch.home, b.home),
      about: pickStr(breadcrumbPatch.about, b.about),
      ourWork: pickStr(breadcrumbPatch.ourWork, b.ourWork),
      programs: pickStr(breadcrumbPatch.programs, b.programs),
      projects: pickStr(breadcrumbPatch.projects, b.projects),
      advisory: pickStr(breadcrumbPatch.advisory, b.advisory),
      research: pickStr(breadcrumbPatch.research, b.research),
      training: pickStr(breadcrumbPatch.training, b.training),
      ourPartnerships: pickStr(breadcrumbPatch.ourPartnerships, b.ourPartnerships),
      getInvolved: pickStr(breadcrumbPatch.getInvolved, b.getInvolved),
      volunteer: pickStr(breadcrumbPatch.volunteer, b.volunteer),
      partnership: pickStr(breadcrumbPatch.partnership, b.partnership),
      joinUs: pickStr(breadcrumbPatch.joinUs, b.joinUs),
      contact: pickStr(breadcrumbPatch.contact, b.contact),
      donate: pickStr(breadcrumbPatch.donate, b.donate),
      subscribe: pickStr(breadcrumbPatch.subscribe, b.subscribe),
      news: pickStr(breadcrumbPatch.news, b.news),
      events: pickStr(breadcrumbPatch.events, b.events),
      publications: pickStr(breadcrumbPatch.publications, b.publications),
      privacyPolicy: pickStr(breadcrumbPatch.privacyPolicy, b.privacyPolicy),
      termsOfService: pickStr(breadcrumbPatch.termsOfService, b.termsOfService),
      appSummit: pickStr(breadcrumbPatch.appSummit, b.appSummit),
      team: pickStr(breadcrumbPatch.team, b.team),
      eventRegister: pickStr(breadcrumbPatch.eventRegister, b.eventRegister),
    },
  };
}

/** Empty CMS values should not wipe env defaults (`NEXT_PUBLIC_*_URL` in `siteConfig.social`). */
function coalesceSocialUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const t = value.trim();
  if (!t || t === "#") return fallback;
  return t;
}

function sanitizeSiteSettings(value: unknown): SiteSettings {
  const src = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const email = src.email && typeof src.email === "object" && !Array.isArray(src.email)
    ? (src.email as Record<string, unknown>)
    : {};
  const social = src.social && typeof src.social === "object" && !Array.isArray(src.social)
    ? (src.social as Record<string, unknown>)
    : {};

  const languages = Array.isArray(src.languages)
    ? src.languages
        .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x))
        .map((x) => ({
          code: typeof x.code === "string" ? x.code : "",
          label: typeof x.label === "string" ? x.label : "",
        }))
        .filter((x) => x.code && x.label)
    : DEFAULT_SITE_SETTINGS.languages;

  return {
    name: typeof src.name === "string" ? src.name : DEFAULT_SITE_SETTINGS.name,
    tagline: typeof src.tagline === "string" ? src.tagline : DEFAULT_SITE_SETTINGS.tagline,
    logo: typeof src.logo === "string" ? src.logo : DEFAULT_SITE_SETTINGS.logo,
    footerLogo: typeof src.footerLogo === "string" ? src.footerLogo : DEFAULT_SITE_SETTINGS.footerLogo,
    email: {
      programs: typeof email.programs === "string" ? email.programs : DEFAULT_SITE_SETTINGS.email.programs,
      media: typeof email.media === "string" ? email.media : DEFAULT_SITE_SETTINGS.email.media,
      info: typeof email.info === "string" ? email.info : DEFAULT_SITE_SETTINGS.email.info,
    },
    phone: typeof src.phone === "string" ? src.phone : DEFAULT_SITE_SETTINGS.phone,
    address: typeof src.address === "string" ? src.address : DEFAULT_SITE_SETTINGS.address,
    officeHours: typeof src.officeHours === "string" ? src.officeHours : DEFAULT_SITE_SETTINGS.officeHours,
    social: {
      twitter: coalesceSocialUrl(social.twitter, DEFAULT_SITE_SETTINGS.social.twitter),
      linkedin: coalesceSocialUrl(social.linkedin, DEFAULT_SITE_SETTINGS.social.linkedin),
      instagram: coalesceSocialUrl(social.instagram, DEFAULT_SITE_SETTINGS.social.instagram),
      facebook: coalesceSocialUrl(social.facebook, DEFAULT_SITE_SETTINGS.social.facebook),
      youtube: coalesceSocialUrl(social.youtube, DEFAULT_SITE_SETTINGS.social.youtube),
    },
    languages,
    chrome: mergeSiteChrome(src.chrome),
  };
}

/** Resolve media ids / paths for footer “Our work” tile images (public + admin preview). */
async function resolveFooterWorkThumbnailImages(settings: SiteSettings): Promise<SiteSettings> {
  const thumbs = settings.chrome.footer.workThumbnails;
  if (thumbs.length === 0) return settings;
  const resolved = await Promise.all(
    thumbs.map(async (t) => {
      const raw = typeof t.image === "string" ? t.image.trim() : "";
      if (!raw) return t;
      const url = await resolveImageUrl(raw);
      return { ...t, image: url ?? raw };
    })
  );
  return {
    ...settings,
    chrome: {
      ...settings.chrome,
      footer: { ...settings.chrome.footer, workThumbnails: resolved },
    },
  };
}

/** Transient DB / pool issues — retry before falling back to bundled nav (avoids “flash” of default nav). */
const RETRYABLE_PRISMA_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // The database server was reached but timed out
  "P1008", // Operations timed out
  "P1017", // Server has closed the connection
  "P2024", // Timed out fetching a new connection from the pool
]);

function isRetryablePrismaError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_PRISMA_CODES.has(e.code)) {
    return true;
  }
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  return false;
}

/**
 * Loads settings from DB (retries). Wrapped in `unstable_cache` for cross-request reuse;
 * invalidated via `updateTag(SITE_SETTINGS_CACHE_TAG)` when admin saves site settings.
 */
async function loadSiteSettingsFromDatabase(): Promise<SiteSettings> {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const row = await prisma.pageContent.findUnique({
        where: { slug: "site-settings" },
        select: { contentJson: true },
      });
      if (!row?.contentJson) return DEFAULT_SITE_SETTINGS;
      const base = sanitizeSiteSettings(row.contentJson);
      return await resolveFooterWorkThumbnailImages(base);
    } catch (e) {
      if (isRetryablePrismaError(e) && attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
        continue;
      }
      throw e;
    }
  }
  throw new Error("getSiteSettings: exhausted retries");
}

const loadSiteSettingsCached = unstable_cache(
  loadSiteSettingsFromDatabase,
  ["agc-site-settings-v1"],
  {
    tags: [SITE_SETTINGS_CACHE_TAG],
    revalidate: 300,
  },
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (shouldSkipPrismaCalls()) return DEFAULT_SITE_SETTINGS;
  try {
    return await loadSiteSettingsCached();
  } catch (e) {
    // Keep public routes renderable in local dev when Postgres is offline.
    markDevDatabaseUnreachable();
    console.error("[getSiteSettings] Database read failed; using bundled defaults. Nav/chrome will match repo until DB is reachable.", e);
    return DEFAULT_SITE_SETTINGS;
  }
});

export type {
  SiteChrome,
  SiteNavItem,
  SiteNavLink,
  SiteSearchChrome,
  SiteNewsletterChrome,
  SiteBreadcrumbChrome,
} from "@/data/site-chrome";
