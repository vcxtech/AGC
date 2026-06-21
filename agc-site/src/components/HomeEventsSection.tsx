import type { CmsEvent } from "@/lib/content";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { placeholderImages } from "@/data/images";
import { resolveImageUrlSync } from "@/lib/content";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { richTextToPlain } from "@/lib/rich-text";

type HomeEventsSectionProps = {
  pastEvents: CmsEvent[];
  upcomingEvents: CmsEvent[];
  title?: string;
};

const EVENTS_TITLE = "Events";

function eventHref(e: CmsEvent): string {
  const l = e.link?.trim();
  if (l && /^https?:\/\//i.test(l)) return l;
  if (!e.slug) return "/events";
  return `/events/${e.slug}`;
}

function upcomingEventHref(e: CmsEvent): string {
  const slug = e.slug?.trim();
  if (slug) return `/events/${encodeURIComponent(slug)}`;
  return eventHref(e);
}

function eventTypeLabel(e: CmsEvent): string {
  return (e.event_type || e.category || "Event")
    .replace(/_/g, " ")
    .toUpperCase();
}

function eventDateLabel(start: string): string {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

function excerpt(e: CmsEvent): string {
  const source = e.short_description || e.description || "";
  const text = richTextToPlain(source);
  if (!text) return "Read more about this event on our events page.";
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

/**
 * Homepage events: white intro (title + blurb), then **Upcoming** band,
 * then **Past** band — each shows up to three items and a “See all events” CTA.
 */
export function HomeEventsSection({
  pastEvents,
  upcomingEvents,
  title,
}: HomeEventsSectionProps) {
  const upcoming = upcomingEvents.slice(0, 3);
  const past = pastEvents.slice(0, 3);
  const hasAny = upcoming.length > 0 || past.length > 0;
  const eventsTitle = title?.trim() || EVENTS_TITLE;

  return (
    <>
      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="border-t border-border bg-white pt-8 pb-2 sm:pt-10 sm:pb-3 lg:pt-12 lg:pb-3">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="border-b border-border pb-3">
              <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                {eventsTitle}
              </h2>
            </div>

            {!hasAny ? (
              <div className="mt-10 border border-border bg-stone-50/90 p-8 text-center">
                <p className="text-slate-600">No published events yet.</p>
                <Button
                  asChild
                  href="/events"
                  variant="outline"
                  className="mt-6 rounded-none"
                >
                  Browse events
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </HomeScrollReveal>

      {hasAny ? (
        <HomeScrollReveal
          variant="fadeUp"
          start="top 88%"
          className="block w-full"
        >
          <section className="bg-white pb-10 pt-5 sm:pb-12 sm:pt-6 lg:pb-14 lg:pt-7">
            <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
              {upcoming.length > 0 ? (
                <div>
                  <h3 className="font-sans text-lg font-semibold text-black sm:text-xl">
                    Upcoming Events
                  </h3>
                  <div className="mt-4 grid gap-6 md:grid-cols-3">
                    {upcoming.map((event) => {
                      const href = upcomingEventHref(event);
                      const imageUrl =
                        resolveImageUrlSync(event.image) ||
                        placeholderImages.events;
                      return (
                        <Link
                          key={event.id}
                          href={href}
                          className="group block bg-white"
                        >
                          <div className="relative aspect-2/1 w-full overflow-hidden bg-stone-100">
                            <Image
                              src={imageUrl}
                              alt={event.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              unoptimized={preferUnoptimizedImage(imageUrl)}
                            />
                          </div>
                          <div className="pt-5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-black">
                              {eventTypeLabel(event)}
                            </p>
                            <h3 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-black hover:underline">
                              {event.title}
                            </h3>
                            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black">
                              {eventDateLabel(event.start_date)}
                            </p>
                            <p className="mt-3 text-base font-medium leading-relaxed text-black hover:underline">
                              {excerpt(event)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {past.length > 0 ? (
                <div className={upcoming.length > 0 ? "mt-10 sm:mt-12" : ""}>
                  <h3 className="font-sans text-lg font-semibold text-black sm:text-xl">
                    Past Events
                  </h3>
                  <div className="mt-4 grid gap-6 md:grid-cols-3">
                    {past.map((event) => {
                      const href = eventHref(event);
                      const imageUrl =
                        resolveImageUrlSync(event.image) ||
                        placeholderImages.events;
                      return (
                        <Link
                          key={event.id}
                          href={href}
                          className="group block bg-white"
                        >
                          <div className="relative aspect-2/1 w-full overflow-hidden bg-stone-100">
                            <Image
                              src={imageUrl}
                              alt={event.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              unoptimized={preferUnoptimizedImage(imageUrl)}
                            />
                          </div>
                          <div className="pt-5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-black">
                              {eventTypeLabel(event)}
                            </p>
                            <h3 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-black hover:underline">
                              {event.title}
                            </h3>
                            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black">
                              {eventDateLabel(event.start_date)}
                            </p>
                            <p className="mt-3 text-base font-medium leading-relaxed text-black hover:underline ">
                              {excerpt(event)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="mt-8 flex justify-center">
                <Button
                  asChild
                  href="/events"
                  variant="primary"
                  className="rounded-none"
                >
                  See all events
                </Button>
              </div>
            </div>
          </section>
        </HomeScrollReveal>
      ) : null}
    </>
  );
}
