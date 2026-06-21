import { eventsContent, fallbackEvents } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getEvents } from "@/lib/content";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { EventsPageCategoryFilters } from "@/components/events/EventsPageCategoryFilters";
import { ListingPageSection } from "@/components/layout/ListingPageSection";
import { EmptyListingCard } from "@/components/layout/EmptyListingCard";
import { getSiteSettings } from "@/lib/site-settings";
import type { CmsEvent } from "@/lib/content";
import { resolveImageUrl } from "@/lib/media";
import { resolveEventsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import { RichTextContent } from "@/components/RichTextContent";

export const metadata = {
  title: "Events",
  description:
    "Upcoming events, conferences, and workshops advancing governance excellence across Africa.",
};

export const revalidate = 30;

function EventsPageIntro({ intro }: { intro: string }) {
  if (!intro.trim()) return null;
  return <RichTextContent html={intro} className="text-lg text-black" />;
}

export default async function EventsPage() {
  const [cmsEvents, merged, bc, siteSettings] = await Promise.all([
    getEvents(),
    getMergedPageContent<typeof eventsContent>(
      "events",
      cmsStaticOrEmpty(eventsContent),
    ),
    getBreadcrumbLabels(),
    getSiteSettings(),
  ]);
  const content = merged as unknown as typeof eventsContent & {
    heroImage?: string;
  };
  // console.log(content);

  const heroImage =
    (await resolveImageUrl(content.heroImage)) || placeholderImages.events;
  const { items: events, cmsDraftsOnly: eventsDraftsOnly } =
    await resolveEventsForPublic(cmsEvents, fallbackEvents as CmsEvent[]);
  /** Client cards use sync URL helpers; resolve media- IDs and paths here (same pattern as the home page). */
  const eventsWithDisplayImages: CmsEvent[] = await Promise.all(
    events.map(async (e) => ({
      ...e,
      image: (await resolveImageUrl(e.image)) || undefined,
    })),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = eventsWithDisplayImages.filter(
    (e) => new Date(e.end_date || e.start_date) >= today,
  );
  const past = eventsWithDisplayImages.filter(
    (e) => new Date(e.end_date || e.start_date) < today,
  );

  const introBody = String(content.intro ?? "").trim() || eventsContent.intro;

  return (
    <>
      <PageHero
        title={content.title ?? eventsContent.title}
        subtitle={content.description ?? eventsContent.description}
        image={heroImage}
        imageAlt="Events"
        breadcrumbs={[{ label: bc.home, href: "/" }, { label: bc.events }]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <ListingPageSection>
          <div className="max-w-none space-y-4">
            <p className="text-sm font-medium text-accent-800">Convenings</p>
            <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
              Events
            </h2>
            <EventsPageIntro intro={introBody} />
            {eventsDraftsOnly && (
              <CmsDraftNotice
                entityLabel="events"
                adminHref="/admin/events"
              />
            )}
          </div>

          {events.length > 0 && (
            <EventsPageCategoryFilters
              upcoming={upcoming}
              past={past}
              tabs={
                content.eventCategoryFilters ??
                eventsContent.eventCategoryFilters
              }
              filterAriaLabel={
                content.filterAriaLabel ?? eventsContent.filterAriaLabel
              }
            />
          )}

          {events.length === 0 && (
            <EmptyListingCard
              className="mt-16 text-left"
              intro={introBody}
              programsEmail={siteSettings.email.programs}
              contactLabel="Contact programs team"
            />
          )}
        </ListingPageSection>
      </HomeScrollReveal>
    </>
  );
}
