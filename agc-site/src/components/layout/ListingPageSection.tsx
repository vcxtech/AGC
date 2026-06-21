import { cn } from "@/lib/utils";
import {
  PAGE_LISTING_INNER_CLASS,
  PAGE_LISTING_SECTION_CLASS,
} from "@/lib/page-layout";

type Props = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export function ListingPageSection({
  children,
  className,
  innerClassName,
}: Props) {
  return (
    <section className={cn(PAGE_LISTING_SECTION_CLASS, className)}>
      <div className={cn(PAGE_LISTING_INNER_CLASS, innerClassName)}>
        {children}
      </div>
    </section>
  );
}
