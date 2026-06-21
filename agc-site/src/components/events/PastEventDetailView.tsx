import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Mail } from "lucide-react";
import type {
  CmsEvent,
  CmsEventAgendaItem,
  CmsTeamMember,
} from "@/lib/content";
import { eventsContent, siteConfig } from "@/data/content";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { getYouTubeEmbedSrc } from "@/lib/youtube-embed";
import { preferUnoptimizedImage } from "@/lib/image-delivery";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org"
).replace(/\/$/, "");

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeZoneShort(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(d);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

function formatTimeRangeLine(start: string, end?: string): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return "";
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const a = s.toLocaleTimeString("en-US", timeOpts);
  const tz = timeZoneShort(s);
  if (end && end !== start) {
    const e = new Date(end);
    if (!Number.isNaN(e.getTime())) {
      const b = e.toLocaleTimeString("en-US", timeOpts);
      return `${a} – ${b}${tz ? ` ${tz}` : ""}`;
    }
  }
  return `${a}${tz ? ` ${tz}` : ""}`;
}

function dateBlockParts(iso: string): {
  month: string;
  day: string;
  year: string;
} {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: "", day: "", year: "" };
  return {
    month: d.toLocaleDateString("en-GB", { month: "long" }).toUpperCase(),
    day: String(d.getDate()),
    year: String(d.getFullYear()),
  };
}

function ShareIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-none bg-accent-600 text-white transition-colors hover:bg-accent-700"
    >
      {children}
    </a>
  );
}

/** Simple X glyph (lucide `Twitter` is deprecated; keep markup minimal). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width={16}
      height={16}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PastEventDetailView({
  event,
  slug,
  breadcrumbs,
  speakers,
  agenda,
  heroImage,
}: {
  event: CmsEvent;
  slug: string;
  breadcrumbs: { home: string; events: string; current: string };
  speakers: CmsTeamMember[];
  agenda: CmsEventAgendaItem[];
  heroImage: string;
}) {
  const pageUrl = `${baseUrl}/events/register/${encodeURIComponent(slug)}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(event.title);

  const embedSrc = getYouTubeEmbedSrc(event.link);
  const { month, day, year } = dateBlockParts(event.start_date);
  const dateLine = formatLongDate(event.start_date);
  const timeLine = formatTimeRangeLine(event.start_date, event.end_date);

  return (
    <>
      <section className="border-b border-border/90 bg-white">
        <div className="mx-auto w-full max-w-none px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12 2xl:px-16">
          <nav aria-label="Breadcrumb" className="text-sm text-black">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href="/"
                  className="font-medium text-black transition-colors hover:text-accent-700"
                >
                  {breadcrumbs.home}
                </Link>
              </li>
              <span className="text-black/90">/</span>
              <li>
                <Link
                  href="/events"
                  className="font-medium text-black transition-colors hover:text-accent-700"
                >
                  {breadcrumbs.events}
                </Link>
              </li>
              <span className="text-black/90">/</span>
              <li>
                <span className="font-semibold text-accent-800">
                  {breadcrumbs.current}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7.5rem)_1fr] lg:items-start lg:gap-12">
            <div className="flex flex-col items-center text-center lg:items-stretch lg:text-left">
              <div className="h-px w-full bg-stone-300" aria-hidden />
              <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-black">
                {month}
              </p>
              <p className="font-sans text-5xl font-bold leading-none tracking-tight text-black sm:text-6xl">
                {day}
              </p>
              <p className="mt-2 text-sm font-medium text-black">{year}</p>
              <div className="mt-4 h-px w-full bg-stone-300" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">
                {eventsContent.gridBadges.past}
              </p>
              <h1 className="page-heading mt-3 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-[2.35rem] lg:leading-snug hover:underline hover:decoration-black hover:underline-offset-2">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-white">
        <div className="mx-auto grid w-full max-w-none gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_minmax(0,1.1fr)_auto] lg:items-center lg:gap-10 lg:px-8 xl:px-12 2xl:px-16 lg:py-8">
          <div className="min-w-0">
            {dateLine ? (
              <p className="text-base font-bold text-black">{dateLine}</p>
            ) : null}
            {timeLine ? (
              <p className="mt-1 text-sm text-black">{timeLine}</p>
            ) : null}
          </div>
          <div className="min-w-0 text-center lg:text-left">
            <p className="text-base font-bold text-black">{siteConfig.name}</p>
            {event.venue_name?.trim() ? (
              <p className="mt-1 text-base font-bold text-black">
                {event.venue_name.trim()}
              </p>
            ) : null}
            {event.venue_address?.trim() ? (
              <p className="mt-1 text-sm text-black">
                {event.venue_address.trim()}
              </p>
            ) : !event.venue_name && event.location?.trim() ? (
              <p className="mt-1 text-sm text-black">{event.location.trim()}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
            <ShareIconLink
              label="Share on X"
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            >
              <XIcon className="h-4 w-4" />
            </ShareIconLink>
            <ShareIconLink
              label="Share on Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            >
              <Facebook className="h-4 w-4" strokeWidth={2} aria-hidden />
            </ShareIconLink>
            <ShareIconLink
              label="Share on LinkedIn"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            >
              <Linkedin className="h-4 w-4" strokeWidth={2} aria-hidden />
            </ShareIconLink>
            <ShareIconLink
              label="Share by email"
              href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(pageUrl)}`}
            >
              <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
            </ShareIconLink>
          </div>
        </div>
      </div>

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            {embedSrc ? (
              <div className="aspect-video w-full overflow-hidden bg-stone-950 shadow-lg shadow-stone-900/10">
                <iframe
                  title={`Recording: ${event.title}`}
                  src={`${embedSrc}?rel=0`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : heroImage ? (
              <div className="relative aspect-video w-full overflow-hidden bg-white">
                <Image
                  src={heroImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1152px"
                  unoptimized={preferUnoptimizedImage(heroImage)}
                  priority
                />
              </div>
            ) : null}

            {event.description?.trim() ? (
              <RichTextContent
                html={event.description}
                className="prose prose-stone prose-lg mt-12 max-w-none text-black prose-headings:font-semibold prose-a:text-accent-700"
              />
            ) : null}

            {(event.event_type || speakers.length > 0 || agenda.length > 0) && (
              <div className="mt-12 max-w-none space-y-10 border-t border-border pt-10">
                {event.event_type ? (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
                      Type
                    </h2>
                    <p className="mt-2 capitalize text-black">
                      {event.event_type.replace(/_/g, " ")}
                    </p>
                  </div>
                ) : null}
                {speakers.length > 0 ? (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
                      Speakers
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {speakers.map((s) => (
                        <li key={s.id} className="text-black">
                          <span className="font-medium">{s.name}</span>
                          {s.role ? (
                            <span className="text-black"> · {s.role}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {agenda.length > 0 ? (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
                      Agenda
                    </h2>
                    <ul className="mt-3 space-y-4">
                      {agenda.map((item, i) => (
                        <li key={i} className="flex gap-4">
                          {item.time ? (
                            <span className="shrink-0 text-sm font-semibold text-accent-800">
                              {item.time}
                            </span>
                          ) : null}
                          <div>
                            <span className="font-medium text-black">
                              {item.title}
                            </span>
                            {item.description ? (
                              <RichTextContent
                                html={item.description}
                                className="mt-1 text-sm text-black"
                              />
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            <p className="mt-14">
              <Link
                href="/events/past"
                className="text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-2 transition-colors hover:text-accent-950"
              >
                ← Past events
              </Link>
              <span className="mx-2 text-black">·</span>
              <Link
                href="/events"
                className="text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-2 transition-colors hover:text-accent-950"
              >
                All events
              </Link>
            </p>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
