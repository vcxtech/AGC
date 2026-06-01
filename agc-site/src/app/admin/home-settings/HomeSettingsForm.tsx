"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import type { HomePageCms } from "@/lib/home-page-data";
import { updateHomeSettings } from "./actions";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { useImageFieldPreview } from "@/hooks/useImageFieldPreview";

function textAreaLines(arr: string[]) {
  return arr.join("\n");
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeDraftValues(
  values: Record<string, string> | undefined | null,
) {
  if (!values) return null as Record<string, string> | null;
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== "string") continue;
    if (value.trim() === "") continue;
    normalized[key] = value;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

type MediaPickerTarget =
  | "heroSlider"
  | "spotlightPortrait"
  | "ctaBandImage"
  | "pillarPrograms"
  | "pillarProjects"
  | "pillarAdvisory"
  | "pillarResearch"
  | "pillarTraining"
  | "pillarPartnership";

type WorkPillarSettings = {
  pillarRowTitlePrimary?: string;
  pillarRowDescriptionPrimary?: string;
  pillarRowTitleSecondary?: string;
  pillarRowDescriptionSecondary?: string;
  pillarReadMoreLabel?: string;
  pillarCardImages?: {
    programs?: string;
    projects?: string;
    advisory?: string;
    research?: string;
    training?: string;
    partnership?: string;
  };
};

export function HomeSettingsForm({
  home,
  workPillars,
  saved = false,
}: {
  home: HomePageCms;
  workPillars: WorkPillarSettings;
  saved?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = "agc:admin:home-settings:draft:v1";
  const initialDraft = useMemo(() => {
    if (typeof window === "undefined")
      return null as Record<string, string> | null;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { values?: Record<string, string> };
      return normalizeDraftValues(parsed.values);
    } catch {
      return null;
    }
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [heroSliderImages, setHeroSliderImages] = useState(
    initialDraft?.heroSliderImages ?? textAreaLines(home.heroSliderImages),
  );
  const [spotlightImage, setSpotlightImage] = useState(
    initialDraft?.spotlightImage ?? home.homeSpotlightStory.image ?? "",
  );
  const [ctaBandImage, setCtaBandImage] = useState(
    initialDraft?.ctaBandImage ?? home.homeCtaBand.image ?? "",
  );
  const [pillarImagePrograms, setPillarImagePrograms] = useState(
    initialDraft?.pillarImagePrograms ??
      workPillars.pillarCardImages?.programs ??
      "",
  );
  const [pillarImageProjects, setPillarImageProjects] = useState(
    initialDraft?.pillarImageProjects ??
      workPillars.pillarCardImages?.projects ??
      "",
  );
  const [pillarImageAdvisory, setPillarImageAdvisory] = useState(
    initialDraft?.pillarImageAdvisory ??
      workPillars.pillarCardImages?.advisory ??
      "",
  );
  const [pillarImageResearch, setPillarImageResearch] = useState(
    initialDraft?.pillarImageResearch ??
      workPillars.pillarCardImages?.research ??
      "",
  );
  const [pillarImageTraining, setPillarImageTraining] = useState(
    initialDraft?.pillarImageTraining ??
      workPillars.pillarCardImages?.training ??
      "",
  );
  const [pillarImagePartnership, setPillarImagePartnership] = useState(
    initialDraft?.pillarImagePartnership ??
      workPillars.pillarCardImages?.partnership ??
      "",
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<MediaPickerTarget | null>(
    null,
  );
  const { previewUrl: spotlightPreviewUrl, loading: spotlightPreviewLoading } =
    useImageFieldPreview(spotlightImage);
  const { previewUrl: ctaBandPreviewUrl, loading: ctaBandPreviewLoading } =
    useImageFieldPreview(ctaBandImage);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [draftRestored] = useState(!!initialDraft);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await fetch("/api/media");
        if (!res.ok) return;
        const data = await res.json();
        const map: Record<string, string> = {};
        for (const item of (data.items || []) as MediaItem[]) {
          map[item.id] = item.url;
        }
        if (mounted) setMediaMap(map);
      } catch {
        // preview lookup is optional
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function onSelectMedia(media: MediaItem) {
    if (pickerTarget === "heroSlider") {
      setHeroSliderImages((prev) =>
        prev.trim() ? `${prev}\n${media.id}` : media.id,
      );
    } else if (pickerTarget === "spotlightPortrait") {
      setSpotlightImage(media.id);
    } else if (pickerTarget === "ctaBandImage") {
      setCtaBandImage(media.id);
    } else if (pickerTarget === "pillarPrograms") {
      setPillarImagePrograms(media.id);
    } else if (pickerTarget === "pillarProjects") {
      setPillarImageProjects(media.id);
    } else if (pickerTarget === "pillarAdvisory") {
      setPillarImageAdvisory(media.id);
    } else if (pickerTarget === "pillarResearch") {
      setPillarImageResearch(media.id);
    } else if (pickerTarget === "pillarTraining") {
      setPillarImageTraining(media.id);
    } else if (pickerTarget === "pillarPartnership") {
      setPillarImagePartnership(media.id);
    }
    setPickerOpen(false);
    setPickerTarget(null);
  }

  function setLines(next: string[]) {
    setHeroSliderImages(next.join("\n"));
  }

  function moveLine(index: number, direction: -1 | 1) {
    const lines = parseLines(heroSliderImages);
    const to = index + direction;
    if (to < 0 || to >= lines.length) return;
    const copy = [...lines];
    [copy[index], copy[to]] = [copy[to], copy[index]];
    setLines(copy);
  }

  function removeLine(index: number) {
    const lines = parseLines(heroSliderImages).filter((_, i) => i !== index);
    setLines(lines);
  }

  function reorderLines(from: number, to: number) {
    if (from === to) return;
    const lines = parseLines(heroSliderImages);
    if (from < 0 || to < 0 || from >= lines.length || to >= lines.length)
      return;
    const copy = [...lines];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setLines(copy);
  }

  const sliderPreviews = useMemo(() => {
    const lines = parseLines(heroSliderImages).slice(0, 12);
    return lines
      .map((line, index) => {
        if (line.startsWith("media-"))
          return { raw: line, url: mediaMap[line] || "" };
        return { raw: line, url: line, index };
      })
      .map((x, i) => ({ ...x, index: i }))
      .filter((x) => !!x.url);
  }, [heroSliderImages, mediaMap]);

  function saveDraft() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const values: Record<string, string> = {};
    for (const [k, v] of fd.entries()) values[k] = String(v ?? "");
    const normalizedValues = normalizeDraftValues(values) || {};
    const payload = {
      values: normalizedValues,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(draftKey, JSON.stringify(payload));
    setLastSavedAt(payload.savedAt);
  }

  function clearDraft() {
    window.localStorage.removeItem(draftKey);
    window.location.reload();
  }

  useEffect(() => {
    if (!saved) return;
    window.localStorage.removeItem(draftKey);
  }, [saved, draftKey]);

  if (!mounted) return null;

  return (
    <form
      ref={formRef}
      action={updateHomeSettings}
      onInput={saveDraft}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {draftRestored && !saved ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
            Restored unsaved local draft.
          </span>
        ) : null}
        {lastSavedAt ? (
          <span>
            Autosaved locally: {new Date(lastSavedAt).toLocaleTimeString()}
          </span>
        ) : null}
        <button
          type="button"
          onClick={clearDraft}
          className="rounded-md border border-border px-2 py-1 text-slate-600 hover:bg-slate-100"
        >
          Clear local draft
        </button>
      </div>
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Hero
        </h2>
        <div className="mt-4 grid gap-4">
          {/* Hero CTA fields stay hidden for schema/back-compat; headline remains editable. */}
          <input
            type="hidden"
            name="heroEyebrow"
            value={initialDraft?.heroEyebrow ?? home.heroContent.eyebrow}
          />
          <input
            type="hidden"
            name="heroSubtitle"
            value={initialDraft?.heroSubtitle ?? home.heroContent.subtitle}
          />
          <input
            type="hidden"
            name="heroCta"
            value={initialDraft?.heroCta ?? home.heroContent.cta}
          />
          <input
            type="hidden"
            name="heroCtaHref"
            value={initialDraft?.heroCtaHref ?? home.heroContent.ctaHref}
          />
          <input
            type="hidden"
            name="heroCtaSecondary"
            value={
              initialDraft?.heroCtaSecondary ?? home.heroContent.ctaSecondary
            }
          />
          <input
            type="hidden"
            name="heroCtaSecondaryHref"
            value={
              initialDraft?.heroCtaSecondaryHref ??
              home.heroContent.ctaSecondaryHref
            }
          />
          <div>
            <label
              htmlFor="heroTitle"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Main hero headline
            </label>
            <input
              id="heroTitle"
              name="heroTitle"
              defaultValue={initialDraft?.heroTitle ?? home.heroContent.title}
              className="w-full rounded-lg border border-border px-4 py-2"
              placeholder="When governance works, people can thrive"
            />
          </div>
          <p className="text-sm text-slate-600">
            Hero CTA buttons are fixed by design. You can edit the headline,
            background video, and slider images below.
          </p>
          <div className="sm:col-span-2">
            <label
              htmlFor="heroBackgroundVideoSrc"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Hero background video (MP4 path)
            </label>
            <input
              id="heroBackgroundVideoSrc"
              name="heroBackgroundVideoSrc"
              defaultValue={
                initialDraft?.heroBackgroundVideoSrc ??
                home.heroBackgroundVideoSrc ??
                ""
              }
              className="w-full rounded-lg border border-border px-4 py-2 font-mono text-sm"
              placeholder="/media/hero-video-background.mp4"
            />
            <p className="mt-1 text-xs text-slate-500">
              File must live under{" "}
              <code className="rounded bg-slate-100 px-1">public</code>. Clear
              the field to use the image slider only (no video).
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Hero slider images (one per line)
            </label>
            <div className="flex gap-2">
              <textarea
                name="heroSliderImages"
                value={heroSliderImages}
                onChange={(e) => setHeroSliderImages(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2 font-mono text-sm"
                placeholder="media-id/url/path"
              />
              <button
                type="button"
                onClick={() => {
                  setPickerTarget("heroSlider");
                  setPickerOpen(true);
                }}
                className="inline-flex h-fit items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            {sliderPreviews.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sliderPreviews.map((item) => (
                  <div
                    key={`${item.raw}-${item.index}`}
                    draggable
                    onDragStart={() => {
                      setDragFrom(item.index);
                      setDragOver(item.index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOver !== item.index) setDragOver(item.index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null) reorderLines(dragFrom, item.index);
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    onDragEnd={() => {
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    className={`rounded-lg border bg-slate-50 p-2 transition ${
                      dragOver === item.index
                        ? "border-accent-400 ring-1 ring-accent-200"
                        : "border-border"
                    }`}
                  >
                    <div className="relative aspect-16/10 overflow-hidden rounded-md border border-border bg-slate-100">
                      <Image
                        src={item.url}
                        alt={item.raw}
                        fill
                        className="object-cover"
                        unoptimized={preferUnoptimizedImage(item.url)}
                      />
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-600">
                      {item.raw}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="mr-1 text-[10px] uppercase tracking-wide text-slate-400">
                        Drag
                      </span>
                      <button
                        type="button"
                        onClick={() => moveLine(item.index, -1)}
                        className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        title="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLine(item.index, 1)}
                        className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        title="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(item.index)}
                        className="ml-auto inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Impact and newsletter band
        </h2>
        <div className="mt-4 grid gap-4">
          <input
            name="homeReachTitle"
            defaultValue={initialDraft?.homeReachTitle ?? home.homeReach.title}
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Section title"
          />
          {/* Keep persisted values for compatibility; these are not part of the live Scope cards UI. */}
          <input
            type="hidden"
            name="homeReachIntro"
            value={initialDraft?.homeReachIntro ?? home.homeReach.intro}
          />
          <input
            type="hidden"
            name="homeImpactMethodology"
            value={
              initialDraft?.homeImpactMethodology ?? home.homeImpactMethodology
            }
          />
          <textarea
            name="impactStats"
            defaultValue={
              initialDraft?.impactStats ??
              home.homeImpactStats
                .map((s) => `${s.value}|${s.label}|${s.note}`)
                .join("\n")
            }
            rows={5}
            className="rounded-lg border border-border px-4 py-2 font-mono text-sm"
            placeholder="Impact stats lines: value|label|note"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Homepage — subscribe band
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Controls the sentence shown in the blue strip with the Subscribe
          button.
        </p>
        <div className="mt-4 grid gap-4">
          <textarea
            name="homePartnerBlurb"
            defaultValue={
              initialDraft?.homePartnerBlurb ?? home.homePartnerBlurb
            }
            rows={2}
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Our work is always collaborative—we don't arrive with ready-made answers."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Homepage — work pillar cards
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Controls the two row headings, read-more label, and image overrides
          for the six homepage work cards.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Card titles (Programs, Projects, Advisory, Research, Training,
          Partnership) come from their respective Our Work pages.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="pillarRowTitlePrimary"
            defaultValue={
              initialDraft?.pillarRowTitlePrimary ??
              workPillars.pillarRowTitlePrimary ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Intro sub heading"
          />
          {/* <input
            name="pillarRowTitleSecondary"
            defaultValue={
              initialDraft?.pillarRowTitleSecondary ??
              workPillars.pillarRowTitleSecondary ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Row 2 heading (Research / Training / Partnership)"
          /> */}
          <textarea
            name="pillarRowDescriptionPrimary"
            defaultValue={
              initialDraft?.pillarRowDescriptionPrimary ??
              workPillars.pillarRowDescriptionPrimary ??
              ""
            }
            rows={3}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Intro sub description"
          />
          {/* <textarea
            name="pillarRowDescriptionSecondary"
            defaultValue={
              initialDraft?.pillarRowDescriptionSecondary ??
              workPillars.pillarRowDescriptionSecondary ??
              ""
            }
            rows={3}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Row 2 description (appears below Row 2 heading)"
          /> */}
          <input
            name="pillarReadMoreLabel"
            defaultValue={
              initialDraft?.pillarReadMoreLabel ??
              workPillars.pillarReadMoreLabel ??
              ""
            }
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Read-more label"
          />
          <div className="sm:col-span-2 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Row 1 card images
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div className="flex gap-2">
                <input
                  name="pillarImagePrograms"
                  value={pillarImagePrograms}
                  onChange={(e) => setPillarImagePrograms(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Programs image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarPrograms");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  name="pillarImageProjects"
                  value={pillarImageProjects}
                  onChange={(e) => setPillarImageProjects(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Projects image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarProjects");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  name="pillarImageAdvisory"
                  value={pillarImageAdvisory}
                  onChange={(e) => setPillarImageAdvisory(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Advisory image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarAdvisory");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Row 2 card images
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div className="flex gap-2">
                <input
                  name="pillarImageResearch"
                  value={pillarImageResearch}
                  onChange={(e) => setPillarImageResearch(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Research image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarResearch");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  name="pillarImageTraining"
                  value={pillarImageTraining}
                  onChange={(e) => setPillarImageTraining(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Training image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarTraining");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  name="pillarImagePartnership"
                  value={pillarImagePartnership}
                  onChange={(e) => setPillarImagePartnership(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  placeholder="Partnership image (media-id/url/path)"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget("pillarPartnership");
                    setPickerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Homepage testimonial
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Edits the quote card shown below the partner band on the homepage.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <textarea
            name="testimonialQuote"
            defaultValue={
              initialDraft?.testimonialQuote ?? home.homeTestimonial.quote
            }
            rows={4}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Quote"
          />
          <input
            name="testimonialName"
            defaultValue={
              initialDraft?.testimonialName ?? home.homeTestimonial.name
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Name"
          />
          <input
            name="testimonialInitials"
            defaultValue={
              initialDraft?.testimonialInitials ?? home.homeTestimonial.initials
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Initials"
          />
          <input
            name="testimonialTitle"
            defaultValue={
              initialDraft?.testimonialTitle ?? home.homeTestimonial.title
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Title"
          />
          <input
            name="testimonialOrganization"
            defaultValue={
              initialDraft?.testimonialOrganization ??
              home.homeTestimonial.organization
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Organization (optional)"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Fellow spotlight
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Matches the spotlight component: label, body, person role/title,
          portrait, and CTA.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="spotlightLabel"
            defaultValue={
              initialDraft?.spotlightLabel ?? home.homeSpotlightStory.label
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Section label (e.g. Fellow spotlight)"
          />
          <textarea
            name="spotlightParagraphs"
            defaultValue={
              initialDraft?.spotlightParagraphs ??
              textAreaLines(home.homeSpotlightStory.paragraphs)
            }
            rows={4}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Body paragraphs (one per line)"
          />
          <input
            name="spotlightName"
            defaultValue={
              initialDraft?.spotlightName ?? home.homeSpotlightStory.name
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Person name"
          />
          <input
            name="spotlightRole"
            defaultValue={
              initialDraft?.spotlightRole ?? home.homeSpotlightStory.role
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Person role/title (optional)"
          />
          <div className="sm:col-span-2">
            <label
              htmlFor="spotlightImage"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Spotlight portrait
            </label>
            <div className="flex gap-2">
              <input
                id="spotlightImage"
                name="spotlightImage"
                value={spotlightImage}
                onChange={(e) => setSpotlightImage(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2"
                placeholder="media-… or /uploads/… (square)"
              />
              <button
                type="button"
                onClick={() => {
                  setPickerTarget("spotlightPortrait");
                  setPickerOpen(true);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                title="Pick or upload from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
                Library
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Use <strong>Library</strong> to pick or upload. You can still
              paste a path manually.
            </p>
            {spotlightPreviewLoading ? (
              <p className="mt-2 text-xs text-slate-500">Loading preview…</p>
            ) : spotlightPreviewUrl ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-600">Preview</p>
                <div className="relative mt-1 h-40 w-40 overflow-hidden rounded-lg border border-border bg-slate-100">
                  <Image
                    src={spotlightPreviewUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={preferUnoptimizedImage(spotlightPreviewUrl)}
                  />
                </div>
              </div>
            ) : spotlightImage.trim() ? (
              <p className="mt-2 text-xs text-amber-800">
                No preview — for{" "}
                <code className="rounded bg-amber-100 px-1">media-…</code> IDs
                the file must exist in{" "}
                <Link href="/admin/media" className="font-medium underline">
                  Media Library
                </Link>
                .
              </p>
            ) : null}
          </div>
          <input
            type="hidden"
            name="spotlightInitials"
            value={
              initialDraft?.spotlightInitials ??
              home.homeSpotlightStory.initials
            }
          />
          <input
            name="spotlightCtaLabel"
            defaultValue={
              initialDraft?.spotlightCtaLabel ??
              home.homeSpotlightStory.ctaLabel
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Spotlight CTA label"
          />
          <input
            name="spotlightCtaHref"
            defaultValue={
              initialDraft?.spotlightCtaHref ?? home.homeSpotlightStory.ctaHref
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Spotlight CTA href"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Mid-page CTA band
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Accent section above events (formerly hard-coded on the homepage).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="ctaBandEyebrow"
            defaultValue={
              initialDraft?.ctaBandEyebrow ?? home.homeCtaBand.eyebrow
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Eyebrow"
          />
          <input
            name="ctaBandTitle"
            defaultValue={initialDraft?.ctaBandTitle ?? home.homeCtaBand.title}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Headline"
          />
          <textarea
            name="ctaBandBody"
            defaultValue={initialDraft?.ctaBandBody ?? home.homeCtaBand.body}
            rows={4}
            className="sm:col-span-2 rounded-lg border border-border px-4 py-2"
            placeholder="Body"
          />
          <div className="sm:col-span-2">
            <label
              htmlFor="ctaBandImage"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Background image (media-id/url/path)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="ctaBandImage"
                name="ctaBandImage"
                value={ctaBandImage}
                onChange={(e) => setCtaBandImage(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2"
                placeholder="media-... or /uploads/... or https://..."
              />
              <button
                type="button"
                onClick={() => {
                  setPickerTarget("ctaBandImage");
                  setPickerOpen(true);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-slate-700 hover:bg-slate-50"
                aria-label="Pick CTA background image"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            {ctaBandPreviewLoading ? (
              <p className="mt-2 text-xs text-slate-500">Loading preview…</p>
            ) : ctaBandPreviewUrl ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-600">Preview</p>
                <div className="relative mt-1 h-28 w-full overflow-hidden rounded-lg border border-border bg-slate-100">
                  <Image
                    src={ctaBandPreviewUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={preferUnoptimizedImage(ctaBandPreviewUrl)}
                  />
                </div>
              </div>
            ) : ctaBandImage.trim() ? (
              <p className="mt-2 text-xs text-amber-800">
                No preview — for{" "}
                <code className="rounded bg-amber-100 px-1">media-…</code> IDs
                the file must exist in{" "}
                <Link href="/admin/media" className="font-medium underline">
                  Media Library
                </Link>
                .
              </p>
            ) : null}
          </div>
          <input
            name="ctaBandPrimaryCta"
            defaultValue={
              initialDraft?.ctaBandPrimaryCta ?? home.homeCtaBand.primaryCta
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Primary button label"
          />
          <input
            name="ctaBandPrimaryHref"
            defaultValue={
              initialDraft?.ctaBandPrimaryHref ?? home.homeCtaBand.primaryHref
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Primary href"
          />
          <input
            name="ctaBandSecondaryCta"
            defaultValue={
              initialDraft?.ctaBandSecondaryCta ?? home.homeCtaBand.secondaryCta
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Secondary button label"
          />
          <input
            name="ctaBandSecondaryHref"
            defaultValue={
              initialDraft?.ctaBandSecondaryHref ??
              home.homeCtaBand.secondaryHref
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Secondary href"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Homepage — news and events headings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Matches the section titles shown on the homepage: Latest News and
          Events.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="homeNewsTitle"
            defaultValue={
              initialDraft?.homeNewsTitle ?? home.homeNewsTeaser.title
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Latest News heading"
          />
          <input
            name="homeEventsTitle"
            defaultValue={initialDraft?.homeEventsTitle ?? home.homeEventsTitle}
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Events heading"
          />
          <input
            type="hidden"
            name="homeNewsSubtitle"
            value={
              initialDraft?.homeNewsSubtitle ?? home.homeNewsTeaser.subtitle
            }
          />
        </div>
      </section>

      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-6 py-2 font-medium text-white hover:bg-accent-700"
      >
        Save Home Settings
      </button>

      <ImagePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerTarget(null);
        }}
        onSelect={onSelectMedia}
      />
    </form>
  );
}
