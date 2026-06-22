"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { HeroDarkScrim } from "@/components/HeroDarkScrim";
import { preferUnoptimizedImage } from "@/lib/image-delivery";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribePrefersReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getPrefersReducedMotionServerSnapshot() {
  return false;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type PageHeroVariant = "immersive" | "compact" | "minimal";

type PageHeroProps = {
  title: string;
  /** Optional override for the title typography class (page-specific consistency tuning). */
  titleClassName?: string;
  subtitle?: string;
  /** Required for immersive & compact */
  image?: string;
  imageAlt?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** immersive = full-bleed image; compact = shorter bar; minimal = editorial strip, no hero image */
  variant?: PageHeroVariant;
  /**
   * Immersive only. `dark` (default) = uniform black veil like the home hero. `brand` = legacy accent wash.
   */
  immersiveOverlay?: "brand" | "dark";
  /** Immersive only — taller min-height so more of the hero image shows (default on). */
  immersiveTall?: boolean;
  /**
   * Compact only — min-heights aligned with the home hero (`HeroConsultar`) for a full-viewport image strip.
   */
  compactTall?: boolean;
  /**
   * Immersive + compact: staggered fade-up intro on hero copy (home-hero style). Default on; set `false` to disable.
   */
  animateTextIntro?: boolean;
};

/**
 * Inner page headers — use `minimal` for legal/long-form, `compact` for dense sections.
 */
export function PageHero({
  title,
  titleClassName,
  subtitle,
  image,
  imageAlt,
  breadcrumbs,
  variant = "immersive",
  immersiveOverlay = "dark",
  immersiveTall = true,
  compactTall = false,
  animateTextIntro = true,
}: PageHeroProps) {
  const items = breadcrumbs ?? [{ label: "Home", href: "/" }, { label: title }];
  const immersiveTitleRef = useRef<HTMLHeadingElement>(null);
  const immersiveSubtitleRef = useRef<HTMLParagraphElement>(null);
  const immersiveCrumbsRef = useRef<HTMLElement>(null);
  const compactNavRef = useRef<HTMLElement>(null);
  const compactTitleRef = useRef<HTMLHeadingElement>(null);
  const compactSubtitleRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot
  );

  useLayoutEffect(() => {
    if (!animateTextIntro || variant === "minimal") return;

    if (variant === "immersive") {
      const h = immersiveTitleRef.current;
      const sub = immersiveSubtitleRef.current;
      const nav = immersiveCrumbsRef.current;
      if (!h || !nav) return;

      if (reducedMotion) {
        const nodes = sub ? [nav, h, sub] : [nav, h];
        gsap.set(nodes, { autoAlpha: 1, y: 0, clearProps: "transform" });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.set(nav, { autoAlpha: 0, y: 18 });
        gsap.set(h, { autoAlpha: 0, y: 40 });
        if (sub) gsap.set(sub, { autoAlpha: 0, y: 28 });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(nav, { autoAlpha: 1, y: 0, duration: 0.75 });
        tl.to(h, { autoAlpha: 1, y: 0, duration: 1.15 }, "+=0.2");
        if (sub) {
          tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.95 }, "+=0.28");
        }
      });

      return () => ctx.revert();
    }

    if (variant === "compact") {
      const nav = compactNavRef.current;
      const h = compactTitleRef.current;
      const sub = compactSubtitleRef.current;
      if (!nav || !h) return;

      if (reducedMotion) {
        const nodes = sub ? [nav, h, sub] : [nav, h];
        gsap.set(nodes, { autoAlpha: 1, y: 0, clearProps: "transform" });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.set(nav, { autoAlpha: 0, y: 18 });
        gsap.set(h, { autoAlpha: 0, y: 36 });
        if (sub) gsap.set(sub, { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(nav, { autoAlpha: 1, y: 0, duration: 0.75 });
        tl.to(h, { autoAlpha: 1, y: 0, duration: 1.05 }, "+=0.2");
        if (sub) {
          tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.9 }, "+=0.24");
        }
      });

      return () => ctx.revert();
    }
  }, [variant, animateTextIntro, reducedMotion, title, subtitle]);

  if (variant === "minimal") {
    return (
      <section className="border-b border-border/90 bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-black">
            <ol className="flex flex-wrap items-center gap-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {item.href ? (
                    <Link href={item.href} className="font-medium text-black transition-colors hover:text-accent-700">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="relative inline-block pb-2 font-semibold text-accent-800">
                      {item.label}
                      <span className="absolute left-0 right-0 -bottom-0.5 mx-auto h-1 rounded-full bg-accent-500/85" aria-hidden />
                    </span>
                  )}
                  {i < items.length - 1 && <span className="text-black/90">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className={titleClassName || "page-heading mt-4 text-3xl sm:text-4xl"}>
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-black">{subtitle}</p>}
        </div>
      </section>
    );
  }

  if (variant === "compact") {
    const src = image ?? "";
    const alt = imageAlt ?? "";
    const compactMinH = compactTall
      ? "min-h-[min(64vh,480px)] sm:min-h-[min(68vh,520px)] lg:min-h-[min(72vh,560px)] xl:min-h-[min(84vh,620px)]"
      : "min-h-[min(50vh,360px)] sm:min-h-[min(56vh,420px)] lg:min-h-[min(60vh,480px)]";
    return (
      <section className={`relative flex ${compactMinH} flex-col justify-center`}>
        <div className="absolute inset-0">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
              unoptimized={preferUnoptimizedImage(src)}
            />
          ) : (
            <div className="relative h-full w-full bg-slate-950" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" aria-hidden />
            </div>
          )}
          <HeroDarkScrim />
        </div>
        <div className="container relative z-10 mx-auto w-full px-4 py-12 text-left sm:px-6 sm:py-14 lg:px-8 lg:py-16 [text-shadow:0_1px_2px_rgba(0,0,0,0.18),0_2px_14px_rgba(0,0,0,0.22)]">
          <nav ref={compactNavRef} aria-label="Breadcrumb" className="text-sm text-white/90">
            <ol className="flex flex-wrap items-center gap-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {item.href ? (
                    <Link href={item.href} className="font-medium text-white/80 transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="relative inline-block pb-2 font-semibold text-accent-200">
                      {item.label}
                      <span className="absolute left-0 right-0 -bottom-0.5 mx-auto h-1 rounded-full bg-accent-300/90" aria-hidden />
                    </span>
                  )}
                  {i < items.length - 1 && <span className="text-white/45">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1
            ref={compactTitleRef}
            className={
              titleClassName ||
              "mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p ref={compactSubtitleRef} className="mt-2 max-w-2xl text-base text-white sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  /* immersive */
  const src = image ?? "";
  const alt = imageAlt ?? "";
  const sectionMinH = immersiveTall
    ? "min-h-[min(60vh,440px)] sm:min-h-[min(66vh,500px)] lg:min-h-[min(72vh,560px)] xl:min-h-[min(78vh,620px)]"
    : "min-h-[min(44vh,380px)] sm:min-h-[min(48vh,440px)] lg:min-h-[min(52vh,520px)]";

  return (
    <section className={`relative flex ${sectionMinH} flex-col justify-center`}>
      <div className="absolute inset-0">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized={preferUnoptimizedImage(src)}
          />
        ) : immersiveOverlay === "dark" ? (
          <div className="relative h-full w-full bg-slate-950" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" aria-hidden />
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-700 to-accent-600" aria-hidden />
        )}
        {immersiveOverlay === "dark" ? (
          <HeroDarkScrim />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent-700/60 via-accent-600/44 to-accent-700/58"
            aria-hidden
          />
        )}
      </div>

      <div className="container relative z-10 mx-auto w-full px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl [text-shadow:0_1px_2px_rgba(0,0,0,0.2),0_2px_16px_rgba(0,0,0,0.28)]">
          <nav ref={immersiveCrumbsRef} aria-label="Breadcrumb" className="mb-6 sm:mb-8">
            <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-white sm:gap-2 sm:text-base">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-1 sm:gap-2">
                  {item.href ? (
                    <Link href={item.href} className="font-medium text-white/85 transition-colors hover:text-accent-200">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="relative inline-block pb-2 font-semibold text-accent-200">
                      {item.label}
                      <span className="absolute left-0 right-0 -bottom-0.5 mx-auto h-1 rounded-full bg-accent-300/90" aria-hidden />
                    </span>
                  )}
                  {i < items.length - 1 && (
                    <span className="text-white/50" aria-hidden>
                      /
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1
            ref={immersiveTitleRef}
            className={
              titleClassName ||
              "font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.75rem] xl:leading-tight"
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p ref={immersiveSubtitleRef} className="mt-4 text-lg text-white sm:text-xl lg:text-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
