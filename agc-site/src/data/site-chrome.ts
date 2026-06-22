import { footerLinks } from "./content";

export type SiteNavLink = { href: string; label: string };
export type SiteNavItem = SiteNavLink & { subLinks?: SiteNavLink[] };

export type SiteFooterChrome = {
  contactHeading: string;
  quickLinksHeading: string;
  ourWorkHeading: string;
  getInvolvedLabel: string;
  rightsReserved: string;
  adminLabel: string;
  quickLinks: SiteNavLink[];
  legal: SiteNavLink[];
  /** Optional image ref (media id, `/uploads/...`, or URL) — resolved at runtime for the public footer. */
  workThumbnails: { href: string; alt: string; image?: string }[];
};

/** Header search modal copy (Admin → Site settings). */
export type SiteSearchChrome = {
  dialogAriaLabel: string;
  placeholder: string;
  closeAriaLabel: string;
  loading: string;
  emptyNoQuery: string;
  emptyNoResults: string;
  typeEvent: string;
  typeNews: string;
  typePublication: string;
};

/** Public page breadcrumb segment labels (Admin → Site settings). */
export type SiteBreadcrumbChrome = {
  home: string;
  about: string;
  ourWork: string;
  programs: string;
  projects: string;
  advisory: string;
  getInvolved: string;
  volunteer: string;
  partnership: string;
  joinUs: string;
  contact: string;
  donate: string;
  news: string;
  events: string;
  publications: string;
  privacyPolicy: string;
  termsOfService: string;
  appSummit: string;
  team: string;
  eventRegister: string;
};

/** Footer newsletter block copy. */
export type SiteNewsletterChrome = {
  heading: string;
  description: string;
  placeholder: string;
  emailAriaLabel: string;
  submit: string;
  submitLoading: string;
  subscribed: string;
  successMessage: string;
  errorGeneric: string;
};

export type SiteChrome = {
  skipToContentLabel: string;
  headerContactCta: string;
  headerSearchAriaLabel: string;
  mobileDrawerAriaLabel: string;
  mobileDrawerCloseAriaLabel: string;
  mobileSearchButtonLabel: string;
  mobileDrawerContactCta: string;
  mobileLanguageEyebrow: string;
  nav: SiteNavItem[];
  bottomNav: { href: string; label: string }[];
  footer: SiteFooterChrome;
  search: SiteSearchChrome;
  newsletter: SiteNewsletterChrome;
  breadcrumbs: SiteBreadcrumbChrome;
};

function cloneLinks(links: readonly { href: string; label: string }[]): SiteNavLink[] {
  return links.map((l) => ({ href: l.href, label: l.label }));
}

/**
 * Desktop header primary row — fixed order and labels (independent of full `chrome.nav` order).
 * `Get Involved` and `Our Work` use `subLinks` for hover panels; newsletter opens `/subscribe`.
 */
export const HEADER_PRIMARY_NAV_SLOTS: readonly SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/app-summit", label: "App Summit" },
  { href: "/about", label: "About" },
  {
    href: "/our-work",
    label: "Our Work",
    subLinks: [
      { href: "/our-work/programs", label: "PROGRAMS" },
      { href: "/our-work/projects", label: "PROJECTS" },
      { href: "/our-work/advisory", label: "ADVISORY" },
      { href: "/our-work/research", label: "RESEARCH" },
      { href: "/publications", label: "PUBLICATIONS" },
    ],
  },
  {
    href: "/get-involved",
    label: "Get Involved",
    subLinks: [
      { href: "/get-involved/join-us", label: "CAREERS & OPPORTUNITIES" },
      { href: "/get-involved/partnership", label: "PARTNER / SPONSOR" },
      { href: "/donate", label: "DONATE" },
      { href: "/subscribe", label: "SUBSCRIBE TO OUR NEWSLETTER" },
    ],
  },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

/** Public header (lg+): always the slots above; `nav` is unused but kept for API stability. */
export function resolveHeaderPrimaryNav(_nav: SiteNavItem[]): SiteNavItem[] {
  const byHref = new Map(_nav.map((item) => [item.href, item]));
  return HEADER_PRIMARY_NAV_SLOTS.map((slot) => {
    const configured = byHref.get(slot.href);
    const label = configured?.label?.trim() || slot.label;
    const subLinks =
      slot.subLinks?.map((sub) => {
        const configuredSub = configured?.subLinks?.find((x) => x.href === sub.href);
        return {
          href: sub.href,
          label: configuredSub?.label?.trim() || sub.label,
        };
      }) ?? undefined;
    return {
      href: slot.href,
      label,
      ...(subLinks?.length ? { subLinks } : {}),
    };
  });
}

/** Additional destinations after the primary row (mobile drawer, defaults, etc.). */
const DEFAULT_SITE_NAV_TAIL: SiteNavItem[] = [
  { href: "/about", label: "About Us" },
  { href: "/get-involved/volunteer", label: "Volunteer" },
  { href: "/our-work#programs", label: "Programs" },
  { href: "/our-work#projects", label: "Projects" },
  { href: "/our-work#advisory", label: "Advisory" },
  { href: "/aypf", label: "AYPF" },
  { href: "/awpls", label: "AWPLS" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/publications", label: "Publications" },
  { href: "/donate", label: "Donate" },
];

/** Header + drawer menu: primary row order with optional `subLinks` (e.g. Get Involved); tail adds secondary pages without duplicating hrefs. */
export const defaultSiteNav: SiteNavItem[] = (() => {
  const seen = new Set<string>();
  const out: SiteNavItem[] = [];
  const mark = (href: string) => {
    seen.add(href);
  };
  for (const item of HEADER_PRIMARY_NAV_SLOTS) {
    if (seen.has(item.href)) continue;
    mark(item.href);
    if (item.subLinks) {
      for (const sub of item.subLinks) mark(sub.href);
    }
    out.push({
      href: item.href,
      label: item.label,
      ...(item.subLinks?.length ? { subLinks: item.subLinks.map((l) => ({ ...l })) } : {}),
    });
  }
  for (const item of DEFAULT_SITE_NAV_TAIL) {
    if (seen.has(item.href)) continue;
    mark(item.href);
    out.push({ href: item.href, label: item.label });
  }
  return out;
})();

export const DEFAULT_SITE_CHROME: SiteChrome = {
  skipToContentLabel: "Skip to content",
  headerContactCta: "Contact",
  headerSearchAriaLabel: "Search",
  mobileDrawerAriaLabel: "Site navigation",
  mobileDrawerCloseAriaLabel: "Close menu",
  mobileSearchButtonLabel: "Search the site",
  mobileDrawerContactCta: "Contact us",
  mobileLanguageEyebrow: "Language",
  nav: defaultSiteNav.map((item) => ({ href: item.href, label: item.label })),
  bottomNav: [
    { href: "/", label: "Home" },
    { href: "/our-work", label: "Work" },
    { href: "/events", label: "Events" },
    { href: "/news", label: "News" },
    { href: "__menu__", label: "Menu" },
  ],
  footer: {
    contactHeading: "Contact",
    quickLinksHeading: "Quick Links",
    ourWorkHeading: "Our Work",
    getInvolvedLabel: "Get Involved",
    rightsReserved: "All rights reserved.",
    adminLabel: "AGC",
    quickLinks: cloneLinks(footerLinks.quickLinks),
    legal: cloneLinks(footerLinks.legal),
    workThumbnails: [
      { href: "/our-work#programs", alt: "Programs" },
      { href: "/our-work#projects", alt: "Projects" },
      { href: "/our-work#advisory", alt: "Advisory" },
      { href: "/publications", alt: "Publications" },
      { href: "/app-summit", alt: "APP Summit" },
      { href: "/events", alt: "Events" },
    ],
  },
  search: {
    dialogAriaLabel: "Site search",
    placeholder: "Search events, news, publications…",
    closeAriaLabel: "Close search",
    loading: "Loading…",
    emptyNoQuery: "Start typing to search.",
    emptyNoResults: "No results found.",
    typeEvent: "Event",
    typeNews: "News",
    typePublication: "Publication",
  },
  newsletter: {
    heading: "Stay Updated",
    description: "Subscribe to our newsletter for updates.",
    placeholder: "your@email.com",
    emailAriaLabel: "Email for newsletter",
    submit: "Subscribe",
    submitLoading: "…",
    subscribed: "Subscribed",
    successMessage: "Thanks for subscribing!",
    errorGeneric: "Something went wrong.",
  },
  breadcrumbs: {
    home: "Home",
    about: "About Us",
    ourWork: "Our Work",
    programs: "Programs",
    projects: "Projects",
    advisory: "Advisory",
    getInvolved: "Get Involved",
    volunteer: "Volunteer",
    partnership: "Partnership",
    joinUs: "Work with us",
    contact: "Contact",
    donate: "Donate",
    news: "News",
    events: "Events",
    publications: "Publications",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    appSummit: "APP Summit",
    team: "Our Team",
    eventRegister: "Register",
  },
};
