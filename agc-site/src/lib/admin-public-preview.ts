/** Map CMS page slug to the public URL path. */
const PATH_BY_SLUG: Record<string, string> = {
  programs: "/our-work/programs",
  projects: "/our-work/projects",
  advisory: "/our-work/advisory",
  research: "/our-work/research",
  training: "/our-work/training",
  "our-work-programs": "/our-work/programs",
  "our-work-projects": "/our-work#projects",
  "our-work-advisory": "/our-work#advisory",
  "our-work-research": "/our-work/research",
  "our-work-training": "/our-work/training",
  "our-work-partnership": "/our-work/partnership",
  "get-involved-join-us": "/get-involved/join-us",
  "get-involved-partnership": "/get-involved/partnership",
  "get-involved-volunteer": "/get-involved/volunteer",
  subscribe: "/subscribe",
  donate: "/donate",
};

export function publicPathForPageSlug(slug: string): string {
  const s = slug.trim();
  if (s === "" || s === "home") return "/";
  return PATH_BY_SLUG[s] ?? `/${s}`;
}
