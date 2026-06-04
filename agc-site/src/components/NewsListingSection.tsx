"use client";

import { useMemo, useState } from "react";
import type { CmsNews } from "@/lib/content";
import type { TaxonomyOption } from "@/data/taxonomy-defaults";
import { getNewsCategorySlugs, getNewsTagSlugs } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";

export type NewsListingItem = { item: CmsNews; imageUrl: string };

const PAGE_SIZE = 9;

/** Tag slugs treated as geography “country” filters (subset of taxonomy). */
const COUNTRY_TAG_SLUGS = new Set([
  "ghana",
  "algeria",
  "senegal",
  "nigeria",
  "kenya",
  "south-africa",
]);

/** Region groups → tag slugs that imply that region (expand as content grows). */
const REGION_TO_TAGS: Record<string, string[]> = {
  "west-africa": ["ghana", "senegal", "nigeria"],
  "north-africa": ["algeria"],
  "southern-africa": [],
  "east-africa": ["kenya"],
};

const selectClass =
  "min-h-[44px] w-full min-w-0 rounded-none border border-border/90 bg-white px-3 py-2.5 text-sm text-black shadow-none focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-500 sm:min-w-[140px] sm:flex-1";

const inputClass =
  "min-h-[44px] w-full min-w-0 rounded-none border border-border/90 bg-white px-3 py-2.5 text-sm text-black shadow-none placeholder:text-black focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-500 sm:min-w-[160px] sm:flex-1";

type NewsListingSectionProps = {
  items: NewsListingItem[];
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  labels: {
    filter: string;
    textSearch: string;
    theme: string;
    region: string;
    country: string;
    programme: string;
    reset: string;
    previous: string;
    next: string;
    all: string;
    noMatches: string;
  };
  intro?: React.ReactNode;
  draftsNotice?: React.ReactNode;
};

function textMatches(item: CmsNews, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const title = (item.title || "").toLowerCase();
  const excerpt = (item.excerpt || item.content || "")
    .replace(/<[^>]*>/g, "")
    .toLowerCase();
  return title.includes(s) || excerpt.includes(s);
}

export function NewsListingSection({
  items,
  categoryOptions,
  tagOptions,
  labels,
  intro,
  draftsNotice,
}: NewsListingSectionProps) {
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [programme, setProgramme] = useState("");
  const [page, setPage] = useState(1);

  const programmeTags = useMemo(() => {
    const t = tagOptions.filter((x) => !COUNTRY_TAG_SLUGS.has(x.slug));
    return t.length > 0 ? t : tagOptions;
  }, [tagOptions]);
  const countryTags = useMemo(
    () => tagOptions.filter((t) => COUNTRY_TAG_SLUGS.has(t.slug)),
    [tagOptions],
  );

  const filtered = useMemo(() => {
    return items.filter(({ item }) => {
      if (!textMatches(item, search)) return false;
      if (theme) {
        const cats = getNewsCategorySlugs(item);
        if (!cats.includes(theme)) return false;
      }
      if (programme) {
        const tags = getNewsTagSlugs(item);
        if (!tags.includes(programme)) return false;
      }
      if (country) {
        const tags = getNewsTagSlugs(item);
        if (!tags.includes(country)) return false;
      }
      if (region) {
        const allow = REGION_TO_TAGS[region];
        if (allow && allow.length > 0) {
          const tags = getNewsTagSlugs(item);
          if (!tags.some((t) => allow.includes(t))) return false;
        }
      }
      return true;
    });
  }, [items, search, theme, region, country, programme]);

  const totalPages =
    filtered.length === 0 ? 0 : Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const pageSlice = useMemo(() => {
    if (totalPages === 0) return [];
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, totalPages]);

  function resetFilters() {
    setSearch("");
    setTheme("");
    setRegion("");
    setCountry("");
    setProgramme("");
    setPage(1);
  }

  return (
    <>
      {(intro || draftsNotice) && (
        <div className="mb-8 max-w-2xl space-y-4 border-b border-border/80 pb-8">
          {intro}
          {draftsNotice}
        </div>
      )}

      <div className="border-b border-border/80 pb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <span className="shrink-0 text-sm font-semibold text-black">
            {labels.filter}
          </span>
          <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:justify-end">
            <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[140px] sm:flex-1">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-black">
                {labels.textSearch}
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={labels.textSearch}
                className={inputClass}
                autoComplete="off"
              />
            </label>
            <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[140px] sm:flex-1">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-black">
                {labels.theme}
              </span>
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  setPage(1);
                }}
                className={selectClass}
                aria-label={labels.theme}
              >
                <option value="">{labels.all}</option>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[140px] sm:flex-1">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-black">
                {labels.region}
              </span>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setPage(1);
                }}
                className={selectClass}
                aria-label={labels.region}
              >
                <option value="">{labels.all}</option>
                <option value="west-africa">West Africa</option>
                <option value="north-africa">North Africa</option>
                <option value="southern-africa">Southern Africa</option>
                <option value="east-africa">East Africa</option>
              </select>
            </label>
            <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[140px] sm:flex-1">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-black">
                {labels.country}
              </span>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className={selectClass}
                aria-label={labels.country}
              >
                <option value="">{labels.all}</option>
                {countryTags.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[140px] sm:flex-1">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-black">
                {labels.programme}
              </span>
              <select
                value={programme}
                onChange={(e) => {
                  setProgramme(e.target.value);
                  setPage(1);
                }}
                className={selectClass}
                aria-label={labels.programme}
              >
                <option value="">{labels.all}</option>
                {programmeTags.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 rounded-none border border-border bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-stone-50"
          >
            {labels.reset}
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pageSlice.map(({ item, imageUrl }) => (
              <NewsCard
                key={item.id}
                item={item}
                imageUrl={imageUrl}
                href="/news"
                variant="listing"
              />
            ))}
          </div>
          {totalPages > 1 && (
            <nav
              className="mt-14 flex justify-center"
              aria-label="News pagination"
            >
              <div className="inline-flex overflow-hidden rounded-none border border-amber-800/50 bg-white">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="!rounded-none min-w-[120px] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-amber-900/90 transition-colors hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  {labels.previous}
                </button>
                <div className="w-px shrink-0 bg-amber-800/50" aria-hidden />
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="!rounded-none min-w-[120px] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-amber-900/90 transition-colors hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  {labels.next}
                </button>
              </div>
            </nav>
          )}
        </>
      ) : items.length > 0 ? (
        <p className="mt-12 text-center text-base text-black">
          {labels.noMatches}
        </p>
      ) : null}
    </>
  );
}
