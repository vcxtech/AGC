import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export default function VolunteerLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="h-48 bg-stone-200/80 sm:h-56 md:h-64" />
      <div className={`${PAGE_LISTING_INNER_CLASS} py-8 sm:py-12`}>
        <div className="h-4 w-24 rounded bg-stone-200" />
        <div className="mt-3 h-8 max-w-lg rounded bg-stone-200" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-48 rounded border border-border bg-stone-100" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded border border-border bg-stone-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
