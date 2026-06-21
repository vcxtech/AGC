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
import { filterNewsByTag, getActiveCategorySlugs, getTagLabel } from "@/lib/news";
import { resolveImageUrl } from "@/lib/media";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { resolveNewsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { newsTags } = await getSiteTaxonomy();
  return newsTags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { newsTags } = await getSiteTaxonomy();
  const label = getTagLabel(slug, newsTags);
  return {
    title: `${label} | News`,
    description: `News tagged with ${label} from Africa Governance Centre.`,
  };
}

export const revalidate = 60;

export default async function NewsTagPage({ params }: Props) {
  const { slug } = await params;
  const [cmsNews, taxonomy, bc, merged] = await Promise.all([
    getNews(50),
    getSiteTaxonomy(),
    getBreadcrumbLabels(),
    getMergedPageContent<typeof newsContent>("news", cmsStaticOrEmpty(newsContent)),
  ]);
  const tag = taxonomy.newsTags.find((t) => t.slug === slug);
  if (!tag) notFound();

  const pageCopy = merged as unknown as typeof newsContent & { heroImage?: string };
  const heroImage = (await resolveImageUrl(pageCopy.heroImage)) || placeholderImages.news;
  const { items: allNews, cmsDraftsOnly: newsDraftsOnly } = await resolveNewsForPublic(
    cmsNews,
    fallbackNews as CmsNews[]
  );
  const newsItems = filterNewsByTag(allNews, slug);
  const activeCategories = getActiveCategorySlugs(allNews, taxonomy.newsCategories);
  const itemsWithImages = await Promise.all(
    newsItems.map(async (item) => ({
      item,
      imageUrl: (await resolveImageUrl(item.image)) || placeholderImages.news,
    }))
  );

  return (
    <>
      <PageHero
        title={tag.label}
        subtitle={`Stories and updates tagged “${tag.label}”. Explore related topics via categories below.`}
        image={heroImage}
        imageAlt={tag.label}
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.news, href: "/news" },
          { label: `#${tag.label}` },
        ]}
      />

      <HomeScrollReveal variant="slideRight" start="top 88%" className="block w-full">
        <ListingPageSection>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">Tag</p>
              <p className="mt-1 font-mono text-sm text-black">#{tag.slug}</p>
            </div>
            <Link
              href="/news"
              className="text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-4 hover:text-accent-950"
            >
              All news
            </Link>
          </div>
          {newsDraftsOnly && (
            <div className="mb-6">
              <CmsDraftNotice entityLabel="news articles" adminHref="/admin/news" />
            </div>
          )}

          {activeCategories.length > 0 && (
            <NewsFilters
              categoryOptions={taxonomy.newsCategories}
              activeCategorySlugs={activeCategories}
              currentCategory={undefined}
            />
          )}

          {newsItems.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {itemsWithImages.map(({ item, imageUrl }) => (
                <NewsCard key={item.id} item={item} imageUrl={imageUrl} href="/news" />
              ))}
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
