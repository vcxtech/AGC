"use client";

import type { HomePageCms } from "@/lib/home-page-data";
import { HOME_HERO_DISPLAY_TAGLINE } from "@/data/content";
import gsap from "gsap";
import Image from "next/image";
import { HeroDarkScrim } from "@/components/HeroDarkScrim";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useLayoutEffect, useRef, useSyncExternalStore } from "react";

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

/** Home hero: single headline; slider/video from CMS. */
type HeroProps = {
  /** Retained for callers; headline fixed in `content.ts` (`HOME_HERO_DISPLAY_TAGLINE`). */
  hero?: HomePageCms["heroContent"];
  /** Hero carousel image URLs. From CMS when set; otherwise pass default from page. */
  sliderImages: string[];
  /**
   * Looped MP4 from /public (e.g. `/media/hero-video-background.mp4`).
   * When set and motion is allowed, used instead of the image carousel.
   */
  backgroundVideoSrc?: string;
};

export function HeroConsultar({ hero: _hero, sliderImages, backgroundVideoSrc }: HeroProps) {
  const heroHeadline = _hero?.title?.trim() || HOME_HERO_DISPLAY_TAGLINE;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [current, setCurrent] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot
  );
  const slides = sliderImages.filter((s) => typeof s === "string" && s.length > 0);
  const activeSlide = slides[current] ?? slides[0];
  const videoPoster = slides[0];
  const useVideoBackground =
    Boolean(backgroundVideoSrc?.trim()) && !reducedMotion;

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (reducedMotion || slides.length <= 1 || useVideoBackground) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, reducedMotion, slides.length, useVideoBackground]);

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    if (reducedMotion) {
      gsap.set(title, { autoAlpha: 1, y: 0, clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(title, { autoAlpha: 0, y: 36 });
      gsap.to(title, { autoAlpha: 1, y: 0, duration: 1.35, ease: "power4.out", delay: 0.12 });
    }, title);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section className="group relative flex min-h-[min(64vh,480px)] w-full flex-col overflow-hidden sm:min-h-[min(68vh,520px)] lg:min-h-[min(72vh,560px)] xl:min-h-[min(84vh,620px)]">
      {/* Video (preferred when configured), else CMS slides, else dark neutral fallback */}
      {useVideoBackground && backgroundVideoSrc ? (
        <div className="absolute inset-0 z-0" aria-hidden>
          <video
            className="h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={videoPoster}
          >
            <source src={backgroundVideoSrc} type="video/mp4" />
          </video>
          <HeroDarkScrim />
        </div>
      ) : slides.length === 0 ? (
        <div className="absolute inset-0 z-0 bg-slate-950" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
          <HeroDarkScrim />
        </div>
      ) : activeSlide ? (
        <div className="absolute inset-0 z-0" aria-hidden>
          <Image
            key={activeSlide}
            src={activeSlide}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized={preferUnoptimizedImage(activeSlide)}
          />
          <HeroDarkScrim />
        </div>
      ) : null}

      {/* Main copy — large serif headline only */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-32 xl:py-36">
        <div className="max-w-4xl [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          <h1
            ref={titleRef}
            className="text-balance font-serif text-[clamp(2.25rem,5.8vw,4.2rem)] font-semibold leading-[1.1] tracking-tight text-white sm:leading-[1.08] lg:text-[clamp(2.85rem,5.2vw,5rem)] lg:leading-[1.06] xl:text-[clamp(4.1rem,5.25vw,6.45rem)]"
          >
            {heroHeadline}
          </h1>
          {!useVideoBackground && slides.length > 1 && (
            <div className="mt-6 flex justify-center gap-1.5 sm:mt-8" role="tablist" aria-label="Hero slides">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!useVideoBackground && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/3 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 sm:left-4 lg:top-[42%]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/3 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 sm:right-4 lg:top-[42%]"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

    </section>
  );
}
