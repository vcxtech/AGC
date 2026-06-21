import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicationsContent, fallbackPublications } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getPublicationBySlug, getContentFileUrl, getPublications } from "@/lib/content";
import type { CmsPublication } from "@/lib/content";
import { resolveImageUrl } from "@/lib/media";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTaxonomy, labelForPublicationTypeSlug } from "@/lib/site-taxonomy";
import { sanitizeHtml } from "@/lib/sanitize";
import { resolvePublicationsForPublic } from "@/lib/cms-fallback";
import { ArticleDetailShell } from "@/components/ArticleDetailShell";
import { ArticleDownloadSection } from "@/components/ArticleDownloadSection";
import { RichTextContent } from "@/components/RichTextContent";
import { NewsArticleShareLinks } from "@/components/NewsArticleShareLinks";
import { PublicationCard } from "@/components/PublicationCard";
import { ARTICLE_PROSE_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";

function publicationTypeSlugs(p: CmsPublication): string[] {
  if (p.types?.length) return p.types;
  if (p.type) return [p.type];
  return [];
}

function pickRelatedPublications(pool: CmsPublication[], current: CmsPublication, limit: number): CmsPublication[] {
  const currentSlug = current.slug;
  const typeSet = new Set(publicationTypeSlugs(current));
  return pool
    .filter((pub) => pub.id !== current.id && pub.slug && pub.slug !== currentSlug)
    .map((pub) => ({
      pub,
      score: publicationTypeSlugs(pub).filter((t) => typeSet.has(t)).length,
      t: new Date(pub.date_published || pub.date_created || 0).getTime(),
    }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.t - a.t))
    .slice(0, limit)
    .map((x) => x.pub);
}

function formatArticleDateShort(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function excerptToLeadHtml(excerpt: string | undefined): string {
  const raw = excerpt?.trim();
  if (!raw) return "";
  if (raw.includes("<")) return sanitizeHtml(raw);
  const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return sanitizeHtml(`<p>${escaped}</p>`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let cmsItem: CmsPublication | null = null;
  try {
    cmsItem = await getPublicationBySlug(slug);
  } catch (e) {
    console.error("[publication detail metadata] CMS read failed for slug:", slug, e);
  }
  const fallback = (fallbackPublications as CmsPublication[]).find((p) => p.slug === slug);
  const item = cmsItem ?? fallback;
  if (!item) return { title: "Publications" };
  const description = (item.excerpt || "").replace(/<[^>]*>/g, "").slice(0, 160);
  const imageUrl = (await resolveImageUrl(item.image)) || placeholderImages.publications;
  const ogImage = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  return {
    title: item.title,
    description,
    openGraph: {
      title: item.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

async function getPublicationItem(slug: string): Promise<CmsPublication | null> {
  try {
    const cmsItem = await getPublicationBySlug(slug);
    if (cmsItem) return cmsItem;
  } catch (e) {
    console.error("[publication detail] CMS read failed for slug:", slug, e);
  }
  const fallback = (fallbackPublications as CmsPublication[]).find((p) => p.slug === slug);
  return fallback ?? null;
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, taxonomy, merged, siteSettings, cmsPublications] = await Promise.all([
    getPublicationItem(slug),
    getSiteTaxonomy(),
    getMergedPageContent<typeof publicationsContent>("publications", cmsStaticOrEmpty(publicationsContent)),
    getSiteSettings(),
    getPublications(80),
  ]);
  if (!item) notFound();

  const pageCopy = merged as unknown as typeof publicationsContent & { heroImage?: string };
  const detailCopy = pageCopy.articleDetail ?? publicationsContent.articleDetail;
  const imageUrl =
    (await resolveImageUrl(item.image)) ||
    (await resolveImageUrl(pageCopy.heroImage)) ||
    placeholderImages.publications;
  const bc = siteSettings.chrome.breadcrumbs;
  const date = item.date_published || item.date_created;
  const dateStrHero = date
    ? new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const dateStrSidebar = formatArticleDateShort(date);
  const fileUrl = getContentFileUrl(item.file ?? undefined);
  const typeSlugs = publicationTypeSlugs(item);
  const typeLabel =
    typeSlugs.length > 0
      ? typeSlugs.map((s) => labelForPublicationTypeSlug(s, taxonomy.publicationTypes)).join(" · ")
      : "Publication";

  const { items: publicationPool } = await resolvePublicationsForPublic(
    cmsPublications,
    fallbackPublications as CmsPublication[]
  );
  const related = pickRelatedPublications(publicationPool, item, 6);
  const relatedWithImages = await Promise.all(
    related.map(async (p) => ({
      item: p,
      imageUrl: (await resolveImageUrl(p.image)) || placeholderImages.publications,
    }))
  );

  const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/publications/${encodeURIComponent(slug)}`;
  const leadHtml = excerptToLeadHtml(item.excerpt);

  return (
    <ArticleDetailShell
      heroImage={imageUrl}
      heroImageAlt={item.title}
      eyebrow={pageCopy.title}
      title={item.title}
      dateLabel={dateStrHero}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-8">
          <nav aria-label="Breadcrumb" className="mb-10 border-b border-border/90 pb-6 text-sm text-black">
            <Link href="/" className="transition-colors hover:text-accent-700">
              {bc.home}
            </Link>
            <span className="mx-2 text-black">/</span>
            <Link href="/publications" className="transition-colors hover:text-accent-700">
              {bc.publications}
            </Link>
            <span className="mx-2 text-black">/</span>
            <span className="line-clamp-1 text-black">{item.title}</span>
          </nav>

          {leadHtml ? (
            <>
              <div
                className="article-lead text-xl font-medium leading-relaxed text-accent-950 [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: leadHtml }}
              />
              <hr className="my-10 border-0 border-t border-border" />
            </>
          ) : null}

          {item.content?.trim() ? (
            <RichTextContent
              html={item.content}
              className={cn(ARTICLE_PROSE_CLASS, leadHtml ? "mt-10" : "")}
            />
          ) : null}

          {fileUrl ? (
            <ArticleDownloadSection
              bordered={Boolean(leadHtml || item.content?.trim())}
              subheading="Full text as PDF — for research, teaching, and policy use."
              items={[{ label: item.title, href: fileUrl }]}
              downloadLabel="Download PDF"
            />
          ) : (
            <p className="page-prose text-black">
              A downloadable file is not linked for this publication yet. For a copy, please{" "}
              <Link
                href="/contact"
                className="font-medium text-accent-800 underline decoration-accent-300 underline-offset-4 hover:text-accent-950"
              >
                contact us
              </Link>
              .
            </p>
          )}
        </div>

        <aside className="min-w-0 border-t border-border pt-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-border lg:pl-10 lg:pt-0">
              <div className="lg:sticky lg:top-28">
                {dateStrSidebar ? <p className="text-lg font-bold text-accent-600">{dateStrSidebar}</p> : null}

                {typeSlugs.length > 0 ? (
                  <div className="mt-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-600">
                      {detailCopy.typeLabel}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-black">{typeLabel}</p>
                  </div>
                ) : null}

                {item.author ? (
                  <div className="mt-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-600">
                      {detailCopy.authorLabel}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-black">{item.author}</p>
                  </div>
                ) : null}

                <NewsArticleShareLinks url={canonicalUrl} title={item.title} />
              </div>
            </aside>
          </div>

          {relatedWithImages.length > 0 ? (
            <section className="mt-20 lg:mt-24" aria-labelledby="related-publications-heading">
              <div className="border-t border-b border-border py-4">
                <h2
                  id="related-publications-heading"
                  className="font-sans text-2xl font-semibold tracking-tight text-accent-800 sm:text-3xl"
                >
                  {detailCopy.relatedHeading}
                </h2>
              </div>
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedWithImages.map(({ item: rel, imageUrl: relImage }) => (
                  <PublicationCard
                    key={rel.id}
                    item={rel}
                    imageUrl={relImage}
                    href="/publications"
                    publicationTypes={taxonomy.publicationTypes}
                    variant="related"
                  />
                ))}
              </div>
            </section>
          ) : null}
    </ArticleDetailShell>
  );
}
