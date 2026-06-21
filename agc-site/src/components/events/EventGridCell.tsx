import Image from "next/image";
import Link from "next/link";
import { placeholderImages } from "@/data/images";
import type { CmsEvent } from "@/lib/content";
import { resolveImageUrlSync } from "@/lib/content";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { richTextToPlain } from "@/lib/rich-text";

function categoryLabel(event: CmsEvent): string {
  const raw =
    (event as CmsEvent & { event_type?: string }).event_type ||
    (event as CmsEvent & { category?: string }).category ||
    "event";
  return String(raw).replace(/_/g, " ").trim() || "event";
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

function excerpt(event: CmsEvent): string {
  const source = event.short_description || event.description || "";
  const text = richTextToPlain(source);
  if (!text) return "Read more about this event on our events page.";
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export function EventGridCell({
  event,
  isPast,
  upcomingBadge,
  pastBadge,
}: {
  event: CmsEvent;
  isPast: boolean;
  upcomingBadge: string;
  pastBadge: string;
}) {
  const eventSlug = event.slug;
  const eventLink = eventSlug
    ? isPast
      ? `/events/register/${eventSlug}`
      : `/events/${eventSlug}`
    : event.link || "#";
  const imageUrl = resolveImageUrlSync(event.image) || placeholderImages.events;
  const category = categoryLabel(event).toUpperCase();
  const date = eventDateLabel(event.start_date);

  return (
    <article className="group flex h-full flex-col bg-white">
      <Link href={eventLink} className="flex flex-col">
        <div className="relative aspect-[4/2] border w-full overflow-hidden rounded-none bg-stone-100">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            unoptimized={preferUnoptimizedImage(imageUrl)}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="pt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-black">
            {category}
          </p>
          <h3 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-black hover:underline">
            {event.title}
          </h3>
        </div>
        {date ? (
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black">
            {date}
          </p>
        ) : null}
        <p className="mt-3 text-base font-medium leading-relaxed text-black hover:underline">
          {excerpt(event)}
        </p>
      </Link>
    </article>
  );
}
