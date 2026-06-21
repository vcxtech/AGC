import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { newsContent, fallbackNews } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getNews, getNewsBySlug } from "@/lib/content";
import { resolveImageUrl } from "@/lib/media";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { getSiteSettings } from "@/lib/site-settings";
import {
  getNewsCategorySlugs,
  getCategoryLabel,
  getNewsTagSlugs,
  getTagLabel,
} from "@/lib/news";
import type { CmsNews } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { resolveNewsForPublic } from "@/lib/cms-fallback";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { normalizeNewsDownloads } from "@/lib/news-downloads";
import { ArticleDetailShell } from "@/components/ArticleDetailShell";
import { ArticleDownloadSection } from "@/components/ArticleDownloadSection";
import { NewsArticleShareLinks } from "@/components/NewsArticleShareLinks";
import { NewsCard } from "@/components/NewsCard";
import { ARTICLE_PROSE_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";

function pickRelatedNews(
  pool: CmsNews[],
  current: CmsNews,
  limit: number,
): CmsNews[] {
  const currentSlug = current.slug;
  const catSet = new Set(getNewsCategorySlugs(current));
  return pool
    .filter((n) => n.id !== current.id && n.slug && n.slug !== currentSlug)
    .map((n) => ({
      n,
      score: getNewsCategorySlugs(n).filter((c) => catSet.has(c)).length,
      t: new Date(n.date_published || n.date_created).getTime(),
    }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.t - a.t))
    .slice(0, limit)
    .map((x) => x.n);
}

function formatArticleDateShort(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerptToLeadHtml(excerpt: string | undefined): string {
  const raw = excerpt?.trim();
  if (!raw) return "";
  if (raw.includes("<")) return sanitizeHtml(raw);
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return sanitizeHtml(`<p>${escaped}</p>`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let cmsItem: CmsNews | null = null;
  try {
    cmsItem = await getNewsBySlug(slug);
  } catch (e) {
    console.error("[news detail metadata] CMS read failed for slug:", slug, e);
  }
  const fallback = (fallbackNews as CmsNews[]).find((n) => n.slug === slug);
  const item = cmsItem ?? fallback;
  if (!item) return { title: "News" };
  const description = (item.excerpt || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);
  const imageUrl =
    (await resolveImageUrl(item.image)) || placeholderImages.news;
  const ogImage = imageUrl.startsWith("http")
    ? imageUrl
    : `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
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

async function getNewsItem(slug: string): Promise<CmsNews | null> {
  try {
    const cmsItem = await getNewsBySlug(slug);
    if (cmsItem) return cmsItem;
  } catch (e) {
    console.error("[news detail] CMS read failed for slug:", slug, e);
  }
  const fallback = (fallbackNews as CmsNews[]).find((n) => n.slug === slug);
  return fallback ?? null;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, taxonomy, merged, siteSettings, cmsNewsList] = await Promise.all(
    [
      getNewsItem(slug),
      getSiteTaxonomy(),
      getMergedPageContent<typeof newsContent>(
        "news",
        cmsStaticOrEmpty(newsContent),
      ),
      getSiteSettings(),
      getNews(80),
    ],
  );
  if (!item) notFound();

  const pageCopy = merged as unknown as typeof newsContent & {
    heroImage?: string;
  };
  const detailCopy = pageCopy.articleDetail ?? newsContent.articleDetail;
  const imageUrl =
    (await resolveImageUrl(item.image)) ||
    (await resolveImageUrl(pageCopy.heroImage)) ||
    placeholderImages.news;
  const bc = siteSettings.chrome.breadcrumbs;
  const date = item.date_published || item.date_created;
  const dateStrHero = date
    ? new Date(date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const dateStrSidebar = formatArticleDateShort(date);
  const documentDownloads = normalizeNewsDownloads(item);

  const { items: newsPool } = await resolveNewsForPublic(
    cmsNewsList,
    fallbackNews as CmsNews[],
  );
  const related = pickRelatedNews(newsPool, item, 6);
  const relatedWithImages = await Promise.all(
    related.map(async (n) => ({
      item: n,
      imageUrl: (await resolveImageUrl(n.image)) || placeholderImages.news,
    })),
  );

  const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/news/${encodeURIComponent(slug)}`;
  const leadHtml = excerptToLeadHtml(item.excerpt);
  const bodyHtml = sanitizeHtml(
    item.content ||
      `<p>${(item.excerpt || "Full content coming soon.").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
  );

  // console.log("Document downloads:", documentDownloads);

  const categorySlugs = getNewsCategorySlugs(item);
  const tagSlugs = getNewsTagSlugs(item);

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
          <nav
            aria-label="Breadcrumb"
            className="mb-10 border-b border-border/90 pb-6 text-sm text-black"
          >
            <Link href="/" className="transition-colors hover:text-accent-700">
              {bc.home}
            </Link>
            <span className="mx-2 text-black">/</span>
            <Link href="/news" className="transition-colors hover:text-accent-700">
              {bc.news}
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

          <div
            className={cn(ARTICLE_PROSE_CLASS)}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <ArticleDownloadSection
            heading="Documents"
            subheading="Download PDFs and resources linked to this article."
            items={documentDownloads}
          />
        </div>

        <aside className="min-w-0 border-t border-border pt-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-border lg:pl-10 lg:pt-0">
              <div className="lg:sticky lg:top-28">
                {dateStrSidebar ? (
                  <p className="text-lg font-bold text-accent-600">
                    {dateStrSidebar}
                  </p>
                ) : null}

                {categorySlugs.length > 0 ? (
                  <div className="mt-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-600">
                      {detailCopy.programmeLabel}
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      {categorySlugs.map((catSlug) => (
                        <Link
                          key={catSlug}
                          href={`/news/category/${catSlug}`}
                          className="text-sm font-semibold text-accent-800 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-950"
                        >
                          {getCategoryLabel(catSlug, taxonomy.newsCategories)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {tagSlugs.length > 0 ? (
                  <div className="mt-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-600">
                      {detailCopy.tagsLabel}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-black">
                      {tagSlugs.map((tagSlug, i) => (
                        <span key={tagSlug}>
                          {i > 0 ? ", " : null}
                          <Link
                            href={`/news/tag/${tagSlug}`}
                            className="font-semibold text-accent-800 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-950"
                          >
                            {getTagLabel(tagSlug, taxonomy.newsTags)}
                          </Link>
                        </span>
                      ))}
                    </p>
                  </div>
                ) : null}

                <NewsArticleShareLinks
                  url={canonicalUrl}
                  title={item.title}
                  links={item.socialLinks}
                />
              </div>
            </aside>
          </div>

          {relatedWithImages.length > 0 ? (
            <section
              className="mt-20 lg:mt-24"
              aria-labelledby="related-news-heading"
            >
              <div className="border-t border-b border-border py-4">
                <h2
                  id="related-news-heading"
                  className="font-sans text-2xl font-semibold tracking-tight text-accent-800 sm:text-3xl"
                >
                  {detailCopy.relatedHeading}
                </h2>
              </div>
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedWithImages.map(({ item: rel, imageUrl }) => (
                  <NewsCard
                    key={rel.id}
                    item={rel}
                    imageUrl={imageUrl}
                    href="/news"
                    variant="related"
                  />
                ))}
              </div>
            </section>
          ) : null}
    </ArticleDetailShell>
  );
}
