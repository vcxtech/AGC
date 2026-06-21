import Link from "next/link";
import { notFound } from "next/navigation";
import { newsContent, fallbackNews } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getNews } from "@/lib/content";
import type { CmsNews } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { NewsCard } from "@/components/NewsCard";
import { NewsFilters } from "@/components/NewsFilters";
import { ListingPageSection } from "@/components/layout/ListingPageSection";
import { Button } from "@/components/Button";
import { filterNewsByCategory, getActiveCategorySlugs, getCategoryLabel } from "@/lib/news";
import { resolveImageUrl } from "@/lib/media";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { resolveNewsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { newsCategories } = await getSiteTaxonomy();
  return newsCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const taxonomy = await getSiteTaxonomy();
  const label = getCategoryLabel(slug, taxonomy.newsCategories);
  return {
    title: `${label} | News`,
    description: `Latest news in ${label} from Africa Governance Centre.`,
  };
}

export const revalidate = 60;

export default async function NewsCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [taxonomy, cmsNews, bc, merged] = await Promise.all([
    getSiteTaxonomy(),
    getNews(50),
    getBreadcrumbLabels(),
    getMergedPageContent<typeof newsContent>("news", cmsStaticOrEmpty(newsContent)),
  ]);
  const category = taxonomy.newsCategories.find((c) => c.slug === slug);
  if (!category) notFound();
  const pageCopy = merged as unknown as typeof newsContent & { heroImage?: string };
  const heroImage = (await resolveImageUrl(pageCopy.heroImage)) || placeholderImages.news;
  const { items: allNews, cmsDraftsOnly: newsDraftsOnly } = await resolveNewsForPublic(
    cmsNews,
    fallbackNews as CmsNews[]
  );
  const newsItems = filterNewsByCategory(allNews, slug);
  const activeCategories = getActiveCategorySlugs(allNews, taxonomy.newsCategories);
  const itemsWithImages = await Promise.all(
    newsItems.map(async (item) => ({
      item,
      imageUrl: (await resolveImageUrl(item.image)) || placeholderImages.news,
    }))
  );
  const hasSingleResult = newsItems.length === 1;

  return (
    <>
      <PageHero
        title={category.label}
        subtitle={category.description || pageCopy.subtitle}
        image={heroImage}
        imageAlt={category.label}
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.news, href: "/news" },
          { label: category.label },
        ]}
      />

      <HomeScrollReveal variant="slideLeft" start="top 88%" className="block w-full">
        <ListingPageSection>
          <div className="mb-10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">Category</p>
                <p className="mt-1 page-prose max-w-xl text-sm">
                  {newsItems.length} {newsItems.length === 1 ? "story" : "stories"} in this topic. Browse others below.
                </p>
              </div>
              <Link
                href="/news"
                className="text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-4 hover:text-accent-950"
              >
                All news
              </Link>
            </div>
            <div className="mt-5">
              <NewsFilters
                categoryOptions={taxonomy.newsCategories}
                activeCategorySlugs={activeCategories}
                currentCategory={slug}
              />
            </div>
            {newsDraftsOnly && (
              <div className="mt-4">
                <CmsDraftNotice entityLabel="news articles" adminHref="/admin/news" />
              </div>
            )}
          </div>

          {newsItems.length > 0 ? (
            <div className="bg-white">
              <div className={hasSingleResult ? "mx-auto w-full max-w-[760px]" : "grid gap-8 sm:grid-cols-2 xl:grid-cols-3"}>
                {itemsWithImages.map(({ item, imageUrl }) => (
                  <NewsCard key={item.id} item={item} imageUrl={imageUrl} href="/news" variant="listing" />
                ))}
              </div>
            </div>
          ) : (
            <div className="page-card max-w-2xl p-8">
              <p className="page-prose">{pageCopy.filters.noResults}</p>
              <Button asChild href="/news" variant="outline" className="mt-6">
                View all news
              </Button>
            </div>
          )}
        </ListingPageSection>
      </HomeScrollReveal>
    </>
  );
}
