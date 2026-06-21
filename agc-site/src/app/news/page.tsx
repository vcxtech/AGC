import { newsContent, fallbackNews } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getNews } from "@/lib/content";
import type { CmsNews } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { NewsListingSection } from "@/components/NewsListingSection";
import { ListingPageSection } from "@/components/layout/ListingPageSection";
import { EmptyListingCard } from "@/components/layout/EmptyListingCard";
import { resolveImageUrl } from "@/lib/media";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { getSiteSettings } from "@/lib/site-settings";
import { resolveNewsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";

export const metadata = {
  title: "News",
  description: "Latest news, insights, and developments from Africa Governance Centre.",
};

export const revalidate = 30;

export default async function NewsPage() {
  const [cmsNews, taxonomy, merged, siteSettings] = await Promise.all([
    getNews(120),
    getSiteTaxonomy(),
    getMergedPageContent<typeof newsContent>("news", cmsStaticOrEmpty(newsContent)),
    getSiteSettings(),
  ]);
  const content = merged as unknown as typeof newsContent & { heroImage?: string };
  const heroImage = (await resolveImageUrl(content.heroImage)) || placeholderImages.news;
  const { items: newsItems, cmsDraftsOnly: newsDraftsOnly } = await resolveNewsForPublic(
    cmsNews,
    fallbackNews as CmsNews[]
  );
  const itemsWithImages = await Promise.all(
    newsItems.map(async (item) => ({
      item,
      imageUrl: (await resolveImageUrl(item.image)) || placeholderImages.news,
    }))
  );

  const f = ((content.filters ?? newsContent.filters ?? {}) as typeof newsContent.filters) as typeof content.filters & {
    filterLabel?: string;
    textSearch?: string;
    theme?: string;
    region?: string;
    country?: string;
    programme?: string;
    reset?: string;
    previous?: string;
    next?: string;
    allOption?: string;
    noMatchesFiltered?: string;
  };
  const listingLabels = {
    filter: f.filterLabel ?? "Filter:",
    textSearch: f.textSearch ?? "Text search",
    theme: f.theme ?? "Theme",
    region: f.region ?? "Region",
    country: f.country ?? "Country",
    programme: f.programme ?? "Programme",
    reset: f.reset ?? "Reset",
    previous: f.previous ?? "Previous",
    next: f.next ?? "Next",
    all: f.allOption ?? f.allCategories ?? "All",
    noMatches: f.noMatchesFiltered ?? f.noResults ?? "No news matched your filters.",
  };

  return (
    <>
      <PageHero
        title={content.title || newsContent.title}
        subtitle={content.subtitle || newsContent.subtitle}
        image={heroImage}
        imageAlt="Latest News"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.news },
        ]}
      />

      <HomeScrollReveal variant="slideRight" start="top 88%" className="block w-full">
        <ListingPageSection>
          {newsItems.length > 0 ? (
            <NewsListingSection
              items={itemsWithImages}
              categoryOptions={taxonomy.newsCategories}
              tagOptions={taxonomy.newsTags}
              labels={listingLabels}
              intro={(content.intro || newsContent.intro)?.trim() ? <p className="page-prose max-w-2xl">{content.intro || newsContent.intro}</p> : undefined}
              draftsNotice={
                newsDraftsOnly ? <CmsDraftNotice entityLabel="news articles" adminHref="/admin/news" /> : undefined
              }
            />
          ) : (
            <EmptyListingCard
              intro={content.intro || newsContent.intro}
              programsEmail={siteSettings.email.programs}
            />
          )}
        </ListingPageSection>
      </HomeScrollReveal>
    </>
  );
}
