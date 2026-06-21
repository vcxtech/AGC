import Link from "next/link";
import { RichTextContent } from "@/components/RichTextContent";

const DEFAULT_SUBSCRIBE_HREF = "/subscribe";
const DEFAULT_SUBSCRIBE_LABEL = "Subscribe";

type Props = {
  /** Lead line (e.g. “Stay up to date…”) — Home settings / CMS `homePartnerBlurb`. */
  blurb: string;
  subscribeHref?: string;
  subscribeLabel?: string;
};

/**
 * Full-width accent band — CMS blurb + Subscribe (homepage: below Fellow spotlight).
 */
export function HomePartnerStrip({
  blurb,
  subscribeHref = DEFAULT_SUBSCRIBE_HREF,
  subscribeLabel = DEFAULT_SUBSCRIBE_LABEL,
}: Props) {
  const line = blurb.trim();
  if (!line) return null;

  return (
    <section className="border-0 bg-accent-600 py-6 sm:py-7">
      <div className="mx-auto flex w-full max-w-none flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <RichTextContent
          html={line}
          className="max-w-2xl text-center text-base font-semibold leading-snug text-white sm:text-left sm:text-lg [&_a]:text-white [&_a]:underline"
        />
        <Link
          href={subscribeHref}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center bg-white px-7 py-3 text-sm font-semibold tracking-wide text-accent-700 transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {subscribeLabel}
        </Link>
      </div>
    </section>
  );
}
