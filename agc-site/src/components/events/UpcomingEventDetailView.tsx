import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Facebook, Linkedin, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/Button";
import type { CmsEvent } from "@/lib/content";
import { eventsContent } from "@/data/content";
import { formatEventTimeRangeLower } from "@/lib/event-display";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { preferUnoptimizedImage } from "@/lib/image-delivery";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org"
).replace(/\/$/, "");

function ShareIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
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

function dateParts(iso: string): { month: string; day: string; year: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: "", day: "", year: "" };
  return {
    month: d.toLocaleDateString("en-GB", { month: "long" }),
    day: String(d.getDate()),
    year: String(d.getFullYear()),
  };
}

export function UpcomingEventDetailView({
  event,
  slug,
  breadcrumbs,
  heroImage,
}: {
  event: CmsEvent;
  slug: string;
  breadcrumbs: { home: string; events: string; current: string };
  heroImage: string;
}) {
  const pageUrl = `${baseUrl}/events/${encodeURIComponent(slug)}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(event.title);
  const { month, day, year } = dateParts(event.start_date);
  const timeCol = formatEventTimeRangeLower(event.start_date, event.end_date);
  const registerHref = `/events/register/${encodeURIComponent(slug)}`;
  const hasExternalLink = Boolean(event.link?.trim());

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
                {eventsContent.gridBadges.upcoming}
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
            <p className="text-base font-bold text-black">
              {month} {day}, {year}
            </p>
            {timeCol ? (
              <p className="mt-1 text-sm text-black">{timeCol}</p>
            ) : null}
          </div>
          <div className="min-w-0 text-center lg:text-left">
            {event.venue_name?.trim() ? (
              <p className="text-base font-bold text-black">
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
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            {heroImage ? (
              <div className="relative aspect-video w-full overflow-hidden bg-white">
                <Image
                  src={heroImage}
                  alt={event.title}
                  fill
                  className="object-contain object-center"
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

            {event.event_type ? (
              <div className="mt-12 max-w-none border-t border-border pt-10">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
                  Type
                </h2>
                <p className="mt-2 capitalize text-black">
                  {event.event_type.replace(/_/g, " ")}
                </p>
              </div>
            ) : null}

            {hasExternalLink ? (
              <div className="mt-12 max-w-none border-t border-border pt-10">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-black">
                  External link
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={event.link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-2 transition-colors hover:text-accent-950"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Open external resource
                  </a>
                </div>
              </div>
            ) : null}

            <div className="mt-16 border-t border-border pt-14">
              <h2 className="text-center text-xl font-bold tracking-tight text-black sm:text-2xl">
                Register to attend
              </h2>
              <div className="mt-10 flex justify-center">
                <Button
                  asChild
                  href={registerHref}
                  variant="primary"
                  size="lg"
                  className="rounded-none! bg-accent-600! px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-accent-700!"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Register
                  </span>
                </Button>
              </div>
              <p className="mt-14 text-center">
                <Link
                  href="/events"
                  className="text-sm font-medium text-accent-800 underline decoration-accent-300 underline-offset-2 transition-colors hover:text-accent-950"
                >
                  ← Back to events
                </Link>
              </p>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
