"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { RichTextContent } from "@/components/RichTextContent";
import { cn } from "@/lib/utils";

export type HomePillarCard = {
  title: string;
  /** Optional; kept for CMS payloads — not shown in the accordion UI. */
  description?: string;
  href: string;
  image?: string;
};

type Props = {
  /** Link label under each title (e.g. “Read more”) — from Admin → Page Content → our-work */
  readMoreLabel?: string;
  /** Heading above the first row (Programs / Projects / Advisory) — `pillarRowTitlePrimary` */
  rowTitlePrimary?: string;
  /** Description below the first row heading — `pillarRowDescriptionPrimary` */
  rowDescriptionPrimary?: string;
  /** Heading above the second row (Research / Training / Partnership) — `pillarRowTitleSecondary` */
  rowTitleSecondary?: string;
  /** Description below the second row heading — `pillarRowDescriptionSecondary` */
  rowDescriptionSecondary?: string;
  cards: HomePillarCard[];
};

/** Default row headings (single line each; no eyebrow). CMS may override via `pillarRowTitlePrimary` / `Secondary`. */
const DEFAULT_ROW_TITLE_PRIMARY = "Engagement and delivery";
const DEFAULT_ROW_TITLE_SECONDARY = "Knowledge and partnerships";
const DEFAULT_ROW_DESCRIPTION_PRIMARY =
  "Our programmes, projects, and advisory services support institutions and leaders to deliver better governance outcomes.";
const DEFAULT_ROW_DESCRIPTION_SECONDARY =
  "We generate evidence, build capacity, and strengthen partnerships to sustain reforms across sectors and countries.";

const READ_MORE_FALLBACK = "Read more";

function chunkCards<T>(items: T[], chunkSize: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    rows.push(items.slice(i, i + chunkSize));
  }
  return rows;
}

/**
 * Homepage work pillars — **up to three cards per row**. Each row uses a horizontal flex strip where the
 * hovered/focused card grows (Brookings-style); image on top, serif title, “Read more” reveals on hover (md+).
 * Touch: press feedback + image nudge without requiring hover.
 */
export function HeroFeaturesOverlap({
  readMoreLabel = "",
  rowTitlePrimary,
  rowDescriptionPrimary,
  rowTitleSecondary,
  rowDescriptionSecondary,
  cards,
}: Props) {
  if (cards.length === 0) return null;

  const cta = readMoreLabel.trim() || READ_MORE_FALLBACK;
  const rows = chunkCards(cards, 3);
  const titleForRow = (index: number) => {
    if (index === 0) return (rowTitlePrimary ?? "").trim() || DEFAULT_ROW_TITLE_PRIMARY;
    if (index === 1) return (rowTitleSecondary ?? "").trim() || DEFAULT_ROW_TITLE_SECONDARY;
    return "";
  };
  const descriptionForRow = (index: number) => {
    if (index === 0) return (rowDescriptionPrimary ?? "").trim() || DEFAULT_ROW_DESCRIPTION_PRIMARY;
    if (index === 1) return (rowDescriptionSecondary ?? "").trim() || DEFAULT_ROW_DESCRIPTION_SECONDARY;
    return "";
  };

  return (
    <section className="relative isolate border-0 bg-white pb-8 pt-9 sm:pb-10 sm:pt-7 lg:pb-11 lg:pt-8">
      {/* Match “The Scope of Our Work” + site header: same horizontal inset */}
      <div className="mx-auto w-full max-w-none bg-white px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
        <div className="bg-white">
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={cn("flex flex-col gap-4 sm:gap-5")}
              >
                {rowIndex === 0 && titleForRow(rowIndex) ? (
                  <header className="text-center">
                    <h2 className="text-balance font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                      {titleForRow(rowIndex)}
                    </h2>
                    {descriptionForRow(rowIndex) ? (
                      <RichTextContent
                        html={descriptionForRow(rowIndex)}
                        className="mx-auto mt-3 max-w-4xl text-[0.98rem] font-medium leading-relaxed text-black sm:text-[1.08rem]"
                      />
                    ) : null}
                  </header>
                ) : null}
                <div
                  className="flex lg:mt-2 flex-col gap-4 sm:gap-5 md:h-[min(56vh,560px)] md:flex-row md:gap-3 md:overflow-hidden lg:h-[min(58vh,600px)]"
                >
                {row.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={`${item.title} — ${cta}`}
                    className={cn(
                      "group/card relative flex min-h-[260px] flex-col overflow-hidden bg-[#ffffff] outline-none touch-manipulation",
                      "transition-[transform,box-shadow] duration-300 ease-out",
                      "active:scale-[0.99] active:brightness-[0.98] md:active:scale-100 md:active:brightness-100",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(65,130,163)]",
                      "md:min-h-0 md:min-w-[3.5rem] md:flex-[1_1_0%] md:transition-[flex-grow,flex-shrink,flex-basis,transform] md:duration-700 md:ease-[cubic-bezier(0.32,0.72,0,1)]",
                      "md:hover:flex-[2.7_1_0%] md:focus-visible:flex-[2.7_1_0%] md:hover:z-[1] md:focus-visible:z-[1]",
                      "md:hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] md:focus-visible:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]"
                    )}
                  >
                    <div
                      className={cn(
                        "relative min-h-[220px] flex-1 overflow-hidden sm:min-h-[250px] md:min-h-0",
                        item.image
                          ? "bg-white"
                          : "border border-border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                      )}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className={cn(
                            "object-cover object-center transition duration-700 ease-out",
                            "motion-reduce:transition-none motion-reduce:duration-0",
                            "scale-100 group-hover/card:scale-[1.03] group-focus-visible/card:scale-[1.03]",
                            "group-active/card:scale-[1.04] md:group-active/card:scale-[1.03]"
                          )}
                          sizes="(max-width: 768px) 100vw, 34vw"
                          unoptimized={preferUnoptimizedImage(item.image)}
                          aria-hidden
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center px-4 text-sm font-medium text-black">
                          Image placeholder
                        </span>
                      )}
                      <span
                        className="pointer-events-none absolute right-3 top-3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-border/90 transition duration-500 md:flex md:translate-y-1 md:opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100 group-active/card:translate-y-0 group-active/card:opacity-100"
                        aria-hidden
                      >
                        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      </span>
                    </div>

                    <div className="shrink-0 bg-transparent pt-3">
                      <h3 className="font-serif text-[1.6rem] font-semibold leading-snug tracking-tight text-black sm:text-[2.1rem] md:text-[clamp(1.3rem,1.9vw,2rem)] md:leading-[1.2] lg:text-[clamp(1.4rem,1.7vw,2.1rem)]">
                        {item.title}
                      </h3>
                      {item.description?.trim() ? (
                        <RichTextContent
                          html={item.description}
                          className="mt-2 overflow-hidden text-[0.95rem] font-medium leading-relaxed text-black transition-[opacity,transform,max-height] duration-500 ease-out max-h-0 translate-y-1 opacity-0 group-hover/card:max-h-24 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:max-h-24 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100 [&_p]:mb-0"
                        />
                      ) : null}
                    </div>
                  </Link>
                ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
