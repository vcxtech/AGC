import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export default function SubscribeLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="h-48 bg-stone-200/80 sm:h-56" />
      <div className={`${PAGE_LISTING_INNER_CLASS} py-8 sm:py-12`}>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-4 w-28 rounded bg-stone-200" />
            <div className="h-8 max-w-md rounded bg-stone-200" />
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="h-4 w-[90%] rounded bg-stone-100" />
          </div>
          <div className="rounded border border-border bg-white p-6">
            <div className="h-10 w-full rounded bg-stone-100" />
            <div className="mt-4 h-12 w-36 rounded bg-accent-200/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
