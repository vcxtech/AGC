"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { placeholderImages } from "@/data/images";
import { RichTextContent } from "@/components/RichTextContent";

type Program = {
  id?: number;
  title: string;
  description: string;
  backgroundImage?: string;
};

type ProgramsCarouselProps = {
  programs: Program[];
};

export function ProgramsCarousel({ programs }: ProgramsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!programs || programs.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-none bg-slate-100 p-8 text-center">
        <p className="text-slate-600">No items to display.</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? programs.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
  };

  const current = programs[currentIndex];
  const bgImage = current.backgroundImage || placeholderImages.hero;

  return (
    <div className="relative w-full overflow-hidden rounded-none">
      {/* Background with gradient overlay */}
      <div
        className="relative min-h-[min(40vh,320px)] w-full bg-cover bg-center sm:min-h-[min(72vh,700px)] lg:min-h-[min(76vh,760px)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,13,20,0.1) 0%, rgba(6,10,16,0.62) 58%, rgba(0,0,0,0.86) 100%), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/10" aria-hidden />

        {/* Content */}
        <div className="relative z-10 flex min-h-[inherit] flex-col p-4 sm:p-10 lg:p-16">
          {/* Text content */}
          <div className="max-w-3xl pt-4 sm:pt-6 lg:pt-8 xl:pt-10">
            <h2 className="max-w-[18ch] font-serif text-[1.35rem] font-semibold leading-[1.08] text-white sm:max-w-[30ch] sm:text-[2.2rem] lg:text-[2.45rem] xl:text-[2.75rem]">
              {current.title}
            </h2>
            <RichTextContent
              html={current.description}
              className="mt-3 max-w-[60ch] text-[0.82rem] leading-relaxed text-white/95 sm:mt-5 sm:text-base lg:text-[1.05rem] [&_a]:text-white [&_a]:underline"
            />
          </div>

          <div className="flex-1" />

          {/* Navigation - bottom area */}
          <div className="mt-8 flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-0 lg:mt-0">
            {/* Left/Right arrows */}
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={goToPrevious}
                aria-label="Previous program"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-all hover:border-white hover:bg-white/10 sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={goToNext}
                aria-label="Next program"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-all hover:border-white hover:bg-white/10 sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Counter badge */}
            <div className="inline-flex h-9 w-fit items-center justify-center rounded-full border border-white/40 px-3 text-xs font-medium text-white sm:h-10 sm:px-4 sm:text-sm">
              {currentIndex + 1}/{programs.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
