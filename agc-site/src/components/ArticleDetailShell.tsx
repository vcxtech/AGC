import Image from "next/image";
import { Calendar } from "lucide-react";
import { HeroDarkScrim } from "@/components/HeroDarkScrim";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { ARTICLE_DETAIL_BODY_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

type Props = {
  heroImage: string;
  heroImageAlt: string;
  eyebrow: string;
  title: string;
  dateLabel?: string;
  children: React.ReactNode;
  bodyClassName?: string;
};

export function ArticleDetailShell({
  heroImage,
  heroImageAlt,
  eyebrow,
  title,
  dateLabel,
  children,
  bodyClassName,
}: Props) {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden bg-slate-950">
        <Image
          src={heroImage}
          alt={heroImageAlt}
          fill
          unoptimized={preferUnoptimizedImage(heroImage)}
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <HeroDarkScrim />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
          <div className="mx-auto w-full max-w-3xl [text-shadow:0_1px_2px_rgba(0,0,0,0.2),0_2px_14px_rgba(0,0,0,0.22)]">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white">
              {eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              {title}
            </h1>
            {dateLabel ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-white/95">
                <Calendar className="h-4 w-4 shrink-0 text-white" aria-hidden />
                {dateLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-[1] -mt-6 bg-white sm:-mt-10">
        <div className={cn(ARTICLE_DETAIL_BODY_CLASS, bodyClassName)}>
          {children}
        </div>
      </div>
    </article>
  );
}
