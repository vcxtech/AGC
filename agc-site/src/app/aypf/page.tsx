import { aypfContent } from "@/data/aypf";
import { getMergedPageContent } from "@/lib/page-content";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { AypfClient } from "./AypfClient";

export const revalidate = 60;

const PLACEHOLDER_HERO = "/uploads/placeholder.svg";

type AypfMerged = typeof aypfContent & { heroImage?: string };

const aypfBuildFallback: AypfMerged = {
  ...aypfContent,
  heroImage: PLACEHOLDER_HERO,
};

async function resolveAypfHeroImage(content: AypfMerged): Promise<string | undefined> {
  const ref = content.heroImage;
  if (typeof ref !== "string" || ref.trim() === "" || ref.trim() === PLACEHOLDER_HERO) {
    return undefined;
  }
  const url = await resolveImageUrl(ref);
  if (url && url !== PLACEHOLDER_HERO) return url;
  return undefined;
}

async function resolveAypfInlineImages(content: AypfMerged): Promise<AypfMerged> {
  const next = { ...content } as AypfMerged & Record<string, unknown>;
  const imageKeys = ["focusSectionBgImage", "strategicPrioritiesBgImage"];

  for (const key of imageKeys) {
    const raw = next[key];
    if (typeof raw !== "string" || raw.trim() === "") continue;
    const resolved = await resolveImageUrl(raw.trim());
    if (resolved) next[key] = resolved;
  }

  return next;
}

export default async function AypfPage() {
  /** Full static base so the page renders when no CMS row exists; CMS JSON still deep-merges over this. */
  const [merged, siteSettings] = await Promise.all([
    getMergedPageContent<AypfMerged>("aypf", aypfBuildFallback),
    getSiteSettings(),
  ]);
  const [heroImage, resolvedContent] = await Promise.all([
    resolveAypfHeroImage(merged),
    resolveAypfInlineImages(merged),
  ]);

  return <AypfClient content={resolvedContent} heroImage={heroImage} siteSettings={siteSettings} />;
}
