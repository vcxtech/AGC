import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Download } from "lucide-react";
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
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { normalizeNewsDownloads } from "@/lib/news-downloads";
import { resolveNewsForPublic } from "@/lib/cms-fallback";
import { HeroDarkScrim } from "@/components/HeroDarkScrim";
import { NewsArticleShareLinks } from "@/components/NewsArticleShareLinks";
import { NewsCard } from "@/components/NewsCard";

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
  const cmsItem = await getNewsBySlug(slug);
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
  const cmsItem = await getNewsBySlug(slug);
  if (cmsItem) return cmsItem;
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

  console.log("Document downloads:", documentDownloads);

  const categorySlugs = getNewsCategorySlugs(item);
  const tagSlugs = getNewsTagSlugs(item);

  return (
    <article className="min-h-screen bg-white">
      <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden bg-slate-950">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          unoptimized={preferUnoptimizedImage(imageUrl)}
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <HeroDarkScrim />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-8 pt-0 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12 xl:px-12 2xl:px-16">
          <div className="mx-auto w-full max-w-none [text-shadow:0_1px_2px_rgba(0,0,0,0.2),0_2px_14px_rgba(0,0,0,0.22)]">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white">
              {pageCopy.title}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              {item.title}
            </h1>
            {dateStrHero ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-white/95">
                <Calendar className="h-4 w-4 shrink-0 text-white" aria-hidden />
                {dateStrHero}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-[1] -mt-6 bg-white sm:-mt-10">
        <div className="mx-auto w-full max-w-none px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12 2xl:px-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <nav
                aria-label="Breadcrumb"
                className="mb-10 border-b border-border/90 pb-6 text-sm text-black"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-accent-700"
                >
                  {bc.home}
                </Link>
                <span className="mx-2 text-black">/</span>
                <Link
                  href="/news"
                  className="transition-colors hover:text-accent-700"
                >
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

              {/* <div
                className="prose prose-lg max-w-4xl
                  prose-headings:page-heading prose-headings:mt-8 prose-headings:mb-6 prose-headings:text-black prose-headings:font-semibold prose-headings:leading-snug prose-headings:text-left
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:page-prose prose-p:mb-7 prose-p:text-black prose-p:leading-[1.75] prose-p:tracking-normal prose-p:text-justify
                  prose-a:text-accent-800 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-accent-400
                  prose-strong:text-black prose-strong:font-semibold
                  prose-em:text-black prose-em:italic
                  prose-li:text-black prose-li:leading-relaxed prose-li:text-justify
                  prose-ul:my-6 prose-ol:my-6 prose-li:mb-3
                  prose-blockquote:border-l-4 prose-blockquote:border-l-accent-600 prose-blockquote:bg-stone-50/80 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-black prose-blockquote:text-base prose-blockquote:leading-relaxed prose-blockquote:text-justify
                  prose-hr:my-8 prose-hr:border-border
                  prose-code:text-sm prose-code:bg-stone-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-black"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              /> */}
              <div
                className="prose prose-neutral max-w-3xl mx-auto
                prose-p:text-gray-800
                prose-p:leading-8
                prose-p:mb-6
                prose-p:text-left
                prose-headings:text-gray-900
                prose-headings:font-semibold
                prose-headings:tracking-tight
                prose-h1:text-4xl
                prose-h2:text-3xl
                prose-h3:text-2xl
                prose-a:text-[#1A2E4C]
                prose-a:no-underline
                hover:prose-a:underline
                prose-strong:text-black
                prose-blockquote:border-l-4
                prose-blockquote:border-[#1A2E4C]
                prose-blockquote:pl-4
                prose-blockquote:italic
                prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              {documentDownloads.length > 0 ? (
                <div className="mt-14 border-t border-border pt-10">
                  <h3 className="page-heading text-lg text-black">Documents</h3>
                  <p className="mt-1 text-sm text-black">
                    Download PDFs and resources linked to this article.
                  </p>
                  <ul className="mt-6 space-y-4">
                    {documentDownloads.map((doc) => (
                      <li key={`${doc.label}-${doc.href}`}>
                        <div className="rounded-none border border-border/90 bg-white p-6 shadow-sm sm:p-8">
                          <h4 className="page-heading text-xl text-black">
                            {doc.label}
                          </h4>
                          {doc.description ? (
                            <p className="mt-2 page-prose text-[0.98rem] text-black">
                              {doc.description}
                            </p>
                          ) : null}
                          <a
                            href={doc.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 rounded-none bg-accent-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-800"
                          >
                            <Download className="h-4 w-4" aria-hidden />
                            Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
        </div>
      </div>
    </article>
  );
}
