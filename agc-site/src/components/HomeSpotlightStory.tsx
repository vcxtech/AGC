import Image from "next/image";
import Link from "next/link";
import type { HomePageCms } from "@/lib/home-page-data";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { RichTextContent } from "@/components/RichTextContent";

export function HomeSpotlightStory({
  story,
  portraitSrc,
}: {
  story: HomePageCms["homeSpotlightStory"];
  /** Resolved URL (e.g. after `resolveImageUrl` for media ids). */
  portraitSrc: string;
}) {
  const s = story;
  const headline = s.headline?.trim();
  const role = s.role?.trim();
  const name = s.name?.trim();
  const label = s.label?.trim();
  const paragraphs = s.paragraphs.filter((paragraph) => paragraph.trim());
  const bodyHtml = s.bodyHtml?.trim();
  const hasAuthorInfo = Boolean(name || role);

  return (
    <section className="border-y border-border/80 bg-white py-9 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
          <div className="flex flex-col items-center gap-4 lg:shrink-0 lg:items-start">
            <div className="relative aspect-[5/6] w-full max-w-[320px] shrink-0 overflow-hidden shadow-md sm:max-w-[360px] lg:w-[400px] lg:max-w-none">
              <Image
                src={portraitSrc}
                alt={name ? `Portrait: ${name}` : "Fellow spotlight portrait"}
                fill
                sizes="(max-width: 1024px) 360px, 400px"
                className="object-cover object-center"
                unoptimized={preferUnoptimizedImage(portraitSrc)}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {label ? (
              <h2 className="mt-2 font-serif text-[2rem] font-semibold leading-snug tracking-tight text-black sm:text-[2.45rem]">
                {label}
              </h2>
            ) : null}
            {/* {headline ? (
              <h2 className="mt-2 font-serif border-4 text-[2rem] font-semibold leading-snug tracking-tight text-black sm:text-[2.45rem]">
                {headline}
              </h2>
            ) : null} */}
            <div className="mt-6 text-[17px] font-medium leading-relaxed text-black">
              {bodyHtml ? (
                <RichTextContent html={bodyHtml} />
              ) : (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
            {hasAuthorInfo ? (
              <div className="mt-8 border-t border-border pt-6">
                {name ? (
                  <p className="text-lg font-medium text-black">{name}</p>
                ) : null}
                {role ? (
                  <p className="text-base font-medium text-black">{role}</p>
                ) : null}
              </div>
            ) : null}
            {/* <Link
              href={s.ctaHref}
              className="mt-6 inline-flex text-base font-medium text-black underline decoration-black/40 underline-offset-4 hover:text-black"
            >
              {s.ctaLabel}
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
}
