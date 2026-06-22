import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export default function OurWorkLoading() {
  return (
    <div className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
      <div className="h-44 bg-stone-200/80 sm:h-52" />
      <div className={PAGE_LISTING_INNER_CLASS}>
        <div className="py-12">
          <div className="h-5 w-32 rounded bg-stone-200" />
          <div className="mt-4 h-8 max-w-xl rounded bg-stone-200" />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-6 w-40 rounded bg-stone-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-stone-100" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-40 rounded bg-stone-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-stone-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
