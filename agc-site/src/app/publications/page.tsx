import { publicationsContent, fallbackPublications } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getPublications } from "@/lib/content";
import type { CmsPublication } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { PublicationsListingSection } from "@/components/PublicationsListingSection";
import { ListingPageSection } from "@/components/layout/ListingPageSection";
import { EmptyListingCard } from "@/components/layout/EmptyListingCard";
import { resolveImageUrl } from "@/lib/media";
import { getSiteTaxonomy } from "@/lib/site-taxonomy";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { getSiteSettings } from "@/lib/site-settings";
import { resolvePublicationsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";

export const metadata = {
  title: "Publications",
  description: "Reports, policy briefs, and research from the Africa Governance Centre.",
};

export const revalidate = 30;

export default async function PublicationsPage() {
  const [cmsPublications, taxonomy, merged, siteSettings] = await Promise.all([
    getPublications(120),
    getSiteTaxonomy(),
    getMergedPageContent<typeof publicationsContent>("publications", cmsStaticOrEmpty(publicationsContent)),
    getSiteSettings(),
  ]);
  const content = merged as unknown as typeof publicationsContent & { heroImage?: string };
  const heroImage = (await resolveImageUrl(content.heroImage)) || placeholderImages.publications;
  const { items, cmsDraftsOnly: publicationsDraftsOnly } = await resolvePublicationsForPublic(
    cmsPublications,
    fallbackPublications as CmsPublication[]
  );
  const itemsWithImages = await Promise.all(
    items.map(async (item) => ({
      item,
      imageUrl: (await resolveImageUrl(item.image)) || placeholderImages.publications,
    }))
  );

  const filters = content.filters ?? publicationsContent.filters;
  const f = filters as typeof publicationsContent.filters & {
    filterLabel?: string;
    textSearch?: string;
    publicationType?: string;
    reset?: string;
    previous?: string;
    next?: string;
    allOption?: string;
    noMatchesFiltered?: string;
    noResults?: string;
  };
  const listingLabels = {
    filter: f.filterLabel ?? "Filter:",
    textSearch: f.textSearch ?? "Text search",
    publicationType: f.publicationType ?? "Publication type",
    reset: f.reset ?? "Reset",
    previous: f.previous ?? "Previous",
    next: f.next ?? "Next",
    all: f.allOption ?? "All",
    noMatches: f.noMatchesFiltered ?? f.noResults ?? "No publications match these filters. Try adjusting or reset.",
  };

  return (
    <>
      <PageHero
        title={content.title}
        subtitle={content.subtitle}
        image={heroImage}
        imageAlt="Publications"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.ourWork, href: "/our-work" },
          { label: siteSettings.chrome.breadcrumbs.publications },
        ]}
      />

      <HomeScrollReveal variant="slideRight" start="top 88%" className="block w-full">
        <ListingPageSection>
          {items.length > 0 ? (
            <PublicationsListingSection
              items={itemsWithImages}
              publicationTypes={taxonomy.publicationTypes}
              labels={listingLabels}
              intro={content.intro?.trim() ? <p className="page-prose max-w-2xl">{content.intro}</p> : undefined}
              draftsNotice={
                publicationsDraftsOnly ? (
                  <CmsDraftNotice entityLabel="publications" adminHref="/admin/publications" />
                ) : undefined
              }
            />
          ) : (
            <EmptyListingCard
              intro={content.intro}
              programsEmail={siteSettings.email.programs}
            />
          )}
        </ListingPageSection>
      </HomeScrollReveal>
    </>
  );
}
