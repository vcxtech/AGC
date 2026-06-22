import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export default function ApplicationsLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="h-48 bg-stone-200/80 sm:h-56" />
      <div className={`${PAGE_LISTING_INNER_CLASS} py-8 sm:py-12`}>
        <div className="mx-auto max-w-2xl space-y-4 rounded border border-border bg-white p-6 sm:p-8">
          <div className="h-6 w-40 rounded bg-stone-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded bg-stone-100" />
          ))}
          <div className="h-24 w-full rounded bg-stone-100" />
          <div className="h-12 w-44 rounded bg-accent-200/60" />
        </div>
      </div>
    </div>
  );
}
