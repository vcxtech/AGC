/** Shared horizontal gutters for public listing pages, header, and footer. */
export const PAGE_GUTTER_CLASS =
  "px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24";

export const PAGE_LISTING_SECTION_CLASS =
  "w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14";

export const PAGE_LISTING_INNER_CLASS = `mx-auto w-full max-w-none ${PAGE_GUTTER_CLASS}`;

/** Article detail body container (news, publications). */
export const ARTICLE_DETAIL_BODY_CLASS = `mx-auto w-full max-w-none ${PAGE_GUTTER_CLASS} py-8 sm:py-10 lg:py-12`;

export const ARTICLE_PROSE_CLASS =
  "prose prose-neutral max-w-3xl mx-auto prose-p:text-gray-800 prose-p:leading-8 prose-p:mb-6 prose-p:text-left prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-[#1A2E4C] prose-a:no-underline hover:prose-a:underline prose-strong:text-black prose-blockquote:border-l-4 prose-blockquote:border-[#1A2E4C] prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-xl [&_p:empty]:min-h-[1.5rem] [&_p_br]:block [&_p_br]:content-[''] [&_p_br]:mt-4";

/** Mobile bottom nav clearance — use on main content OR footer, not both. */
export const MOBILE_BOTTOM_NAV_CLEARANCE =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0";
