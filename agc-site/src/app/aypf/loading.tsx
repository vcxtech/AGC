import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export default function AypfLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="h-56 bg-stone-200/80 sm:h-64 md:h-72" />
      <div className={`${PAGE_LISTING_INNER_CLASS} space-y-12 py-10 sm:py-14`}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="h-4 w-16 rounded bg-stone-200" />
            <div className="h-9 max-w-xl rounded bg-stone-200" />
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="h-4 w-[88%] rounded bg-stone-100" />
          </div>
          <div className="h-64 rounded border border-border bg-stone-100" />
        </div>
      </div>
    </div>
  );
}
