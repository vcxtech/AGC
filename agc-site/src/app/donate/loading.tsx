import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

/** Neutral skeleton — avoid showing the default Unsplash hero before CMS image resolves. */
export default function DonateLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="min-h-[min(60vh,440px)] bg-stone-300/70 sm:min-h-[min(66vh,500px)] lg:min-h-[min(72vh,560px)]" />
      <div className={`${PAGE_LISTING_INNER_CLASS} py-8 sm:py-12 lg:py-14`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-stone-200" />
            <div className="h-8 max-w-md rounded bg-stone-200" />
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="h-4 w-[92%] rounded bg-stone-100" />
          </div>
          <div className="rounded border border-border bg-white p-6">
            <div className="h-4 w-32 rounded bg-stone-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-20 rounded bg-stone-100" />
              ))}
            </div>
            <div className="mt-6 h-10 w-full rounded bg-stone-100" />
            <div className="mt-3 h-10 w-full rounded bg-stone-100" />
            <div className="mt-6 h-12 w-full rounded bg-accent-200/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
