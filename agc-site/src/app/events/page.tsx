import { eventsContent, fallbackEvents } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getEvents } from "@/lib/content";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { EventsPageCategoryFilters } from "@/components/events/EventsPageCategoryFilters";
import type { CmsEvent } from "@/lib/content";
import { resolveImageUrl } from "@/lib/media";
import { resolveEventsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";

export const metadata = {
  title: "Events",
  description:
    "Upcoming events, conferences, and workshops advancing governance excellence across Africa.",
};

export const revalidate = 30;

function EventsPageIntro({ intro }: { intro: string }) {
  const paragraphs = intro
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="page-prose text-lg text-black">
          {para}
        </p>
      ))}
    </div>
  );
}

export default async function EventsPage() {
  const [cmsEvents, merged, bc] = await Promise.all([
    getEvents(),
    getMergedPageContent<typeof eventsContent>(
      "events",
      cmsStaticOrEmpty(eventsContent),
    ),
    getBreadcrumbLabels(),
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
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-18">
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
              <div className="mt-16 page-card p-12 text-center">
                <div className="mx-auto max-w-none text-left">
                  <EventsPageIntro intro={introBody} />
                </div>
                <p className="page-prose mt-6">
                  {content.emptyContact ?? eventsContent.emptyContact}
                </p>
                <a
                  href="mailto:programs@africagovernancecentre.org"
                  className="mt-6 inline-block font-medium text-accent-600 transition-colors hover:text-accent-700"
                >
                  programs@africagovernancecentre.org
                </a>
              </div>
            )}
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
