"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ImagePlus,
} from "lucide-react";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { PageContentJsonRichText } from "@/components/admin/PageContentJsonRichText";
import { PageContentStringListRichText } from "@/components/admin/PageContentStringListRichText";
import { CmsRichTextField } from "@/components/admin/CmsRichTextField";
import { richTextFieldInitial } from "@/lib/rich-text";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { AdminFormPreviewLink } from "../_components/AdminFormPreviewLink";
import { publicPathForPageSlug } from "@/lib/admin-public-preview";
import { updatePageContent } from "./actions";

function parseJsonStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

/** Root keys use the quick editor; nested paths support Get Involved sub-page heroes. */
type PickerTarget = null | "heroImage" | "sectionImage" | { nested: string[] };

type PageContentFormProps = {
  item: {
    slug: string;
    heroTitle: string | null;
    status: string;
    // heroSubtitle: string | null;
    mainTitle: string | null;
    // intro: string | null;
    description: string | null;
    mission: string | null;
    objectivesTitle: string | null;
    objectivesContent: string | null;
    objectivesPrinciples: string | null;
    objectivesAgenda2063: string | null;
    contentJson?: unknown;
  };
};

/** Configuration for which fields should appear for each page */
const fieldVisibilityConfig: Record<
  string,
  { showMainTitle?: boolean; showDescription?: boolean }
> = {
  "app-summit": { showMainTitle: false, showDescription: false },
  applications: { showMainTitle: false },
  awpls: { showMainTitle: false, showDescription: false },
  aypf: { showMainTitle: false, showDescription: false },
  events: { showMainTitle: false },
  "get-involved": { showMainTitle: false },
  "get-involved-join-us": { showMainTitle: false, showDescription: false },
  "get-involved-partnership": { showDescription: false, showMainTitle: false },
  subscribe: { showMainTitle: false, showDescription: false },
  donate: { showMainTitle: false, showDescription: false },
  "get-involved-volunteer": { showMainTitle: false, showDescription: false },
  news: { showMainTitle: false, showDescription: false },
  "our-work": { showMainTitle: false, showDescription: false },
  "our-work-programs": { showMainTitle: false, showDescription: false },
  programs: { showMainTitle: false, showDescription: false },
  research: { showMainTitle: false, showDescription: false },
  advisory: { showMainTitle: false, showDescription: false },
  projects: { showMainTitle: false, showDescription: false },
  training: { showMainTitle: false, showDescription: false },
  "our-work-partnership": { showMainTitle: false, showDescription: false },
  partnership: { showMainTitle: false, showDescription: false },
  publications: { showMainTitle: false, showDescription: false },
  "site-taxonomy": { showMainTitle: false, showDescription: false },
  "terms-of-service": { showMainTitle: false, showDescription: false },
  "privacy-policy": { showMainTitle: false, showDescription: false },
};

function getFieldVisibility(slug: string) {
  return (
    fieldVisibilityConfig[slug] || {
      showMainTitle: true,
      showDescription: true,
    }
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-lg bg-accent-500 px-6 py-2 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function PageContentForm({ item }: PageContentFormProps) {
  const fieldVisibility = getFieldVisibility(item.slug);
  const showAboutExtendedFields = item.slug === "about";
  const showSubscribeFields = item.slug === "subscribe";
  const showDonateFields = item.slug === "donate";
  const action = updatePageContent.bind(null, item.slug);
  const initialJson = useMemo(
    () => (item.contentJson ? JSON.stringify(item.contentJson, null, 2) : ""),
    [item.contentJson],
  );
  const draftStorageKey = useMemo(
    () => `agc:page-content:draft:${item.slug}:contentJson`,
    [item.slug],
  );
  /** Server and first client paint must match — restore local draft in useEffect only (avoids hydration mismatch). */
  const [jsonText, setJsonText] = useState(initialJson);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [dragDayIdx, setDragDayIdx] = useState<number | null>(null);
  const [dragLegalIdx, setDragLegalIdx] = useState<number | null>(null);
  const [dragSession, setDragSession] = useState<{
    dayIdx: number;
    sessionIdx: number;
  } | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<number[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<number[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState(item.description ?? "");

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const payload = JSON.stringify({
          value: jsonText,
          savedAt: new Date().toISOString(),
        });
        window.localStorage.setItem(draftStorageKey, payload);
        setLastSavedAt(new Date().toISOString());
      } catch {
        // Best effort only; avoid blocking editing.
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [draftStorageKey, jsonText]);

  const { parsedJson, jsonError } = useMemo(() => {
    if (!jsonText.trim()) {
      return {
        parsedJson: {} as Record<string, unknown>,
        jsonError: null as string | null,
      };
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
          parsedJson: {} as Record<string, unknown>,
          jsonError:
            "Use one `{ … }` block for all fields here—not a list that starts with `[`." as
              | string
              | null,
        };
      }
      return {
        parsedJson: parsed as Record<string, unknown>,
        jsonError: null as string | null,
      };
    } catch {
      return {
        parsedJson: {} as Record<string, unknown>,
        jsonError:
          "We couldn’t read that text. Check brackets, commas, and quotes—or use the fields above instead." as
            | string
            | null,
      };
    }
  }, [jsonText]);

  const quickValues = {
    heroImage:
      typeof parsedJson.heroImage === "string" ? parsedJson.heroImage : "",
    sectionImage:
      typeof parsedJson.sectionImage === "string"
        ? parsedJson.sectionImage
        : "",
    subtitle:
      typeof parsedJson.subtitle === "string" ? parsedJson.subtitle : "",
    applyIntro:
      typeof parsedJson.applyIntro === "string" ? parsedJson.applyIntro : "",
  };

  function updateJsonObject(next: Record<string, unknown>) {
    setJsonText(JSON.stringify(next, null, 2));
  }

  function updateJsonField(key: string, value: string) {
    const next = { ...parsedJson };
    if (value.trim().length === 0) delete next[key];
    else next[key] = value;
    updateJsonObject(next);
  }

  function updateJsonFieldBoolean(key: string, value: boolean) {
    const next = { ...parsedJson };
    next[key] = value;
    updateJsonObject(next);
  }

  function getNestedString(path: string[]): string {
    let cur: unknown = parsedJson;
    for (const p of path) {
      if (!cur || typeof cur !== "object" || Array.isArray(cur)) return "";
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" ? cur : "";
  }

  function updateNestedString(path: string[], value: string) {
    const next = structuredClone(parsedJson) as Record<string, unknown>;
    let cur: Record<string, unknown> = next;
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i];
      const existing = cur[p];
      if (
        !existing ||
        typeof existing !== "object" ||
        Array.isArray(existing)
      ) {
        cur[p] = {};
      }
      cur = cur[p] as Record<string, unknown>;
    }
    const leaf = path[path.length - 1];
    /** Persist `""` so CMS JSON overrides deepMerge fallbacks; omitting keys would keep repo defaults. */
    cur[leaf] = value.trim() === "" ? "" : value;
    updateJsonObject(next);
  }

  function getNestedArray(path: string[]): Record<string, unknown>[] {
    let cur: unknown = parsedJson;
    for (const p of path) {
      if (!cur || typeof cur !== "object" || Array.isArray(cur)) return [];
      cur = (cur as Record<string, unknown>)[p];
    }
    return Array.isArray(cur)
      ? cur.filter(
          (x): x is Record<string, unknown> =>
            !!x && typeof x === "object" && !Array.isArray(x),
        )
      : [];
  }

  function updateNestedArray(
    path: string[],
    updater: (arr: Record<string, unknown>[]) => Record<string, unknown>[],
  ) {
    const next = structuredClone(parsedJson) as Record<string, unknown>;
    let cur: Record<string, unknown> = next;
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i];
      const existing = cur[p];
      if (
        !existing ||
        typeof existing !== "object" ||
        Array.isArray(existing)
      ) {
        cur[p] = {};
      }
      cur = cur[p] as Record<string, unknown>;
    }
    const leaf = path[path.length - 1];
    const existingLeaf = cur[leaf];
    const arr = Array.isArray(existingLeaf)
      ? existingLeaf.filter(
          (x): x is Record<string, unknown> =>
            !!x && typeof x === "object" && !Array.isArray(x),
        )
      : [];
    cur[leaf] = updater(arr);
    updateJsonObject(next);
  }

  function reorderNestedArray(path: string[], from: number, to: number) {
    if (from === to) return;
    updateNestedArray(path, (arr) => {
      if (from < 0 || to < 0 || from >= arr.length || to >= arr.length)
        return arr;
      const copy = [...arr];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  function toggleCollapsedDay(index: number) {
    setCollapsedDays((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index],
    );
  }

  function toggleCollapsedSection(index: number) {
    setCollapsedSections((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index],
    );
  }

  function clearLocalDraft() {
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore localStorage failures.
    }
    setJsonText(initialJson);
    setDraftRestored(false);
    setLastSavedAt(null);
  }

  function getNestedStringArray(path: string[]): string[] {
    let cur: unknown = parsedJson;
    for (const p of path) {
      if (!cur || typeof cur !== "object" || Array.isArray(cur)) return [];
      cur = (cur as Record<string, unknown>)[p];
    }
    return Array.isArray(cur)
      ? cur.filter((x): x is string => typeof x === "string")
      : [];
  }

  function updateNestedStringArray(path: string[], values: string[]) {
    const next = structuredClone(parsedJson) as Record<string, unknown>;
    let cur: Record<string, unknown> = next;
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i];
      const existing = cur[p];
      if (
        !existing ||
        typeof existing !== "object" ||
        Array.isArray(existing)
      ) {
        cur[p] = {};
      }
      cur = cur[p] as Record<string, unknown>;
    }
    const leaf = path[path.length - 1];
    cur[leaf] = values;
    updateJsonObject(next);
  }

  const legalSections = getNestedArray(["sections"]);
  const summitDays = getNestedArray(["agenda", "days"]);
  const ourWorkAdvisoryCards = getNestedArray(["advisory", "cards"]);
  const ourWorkPrograms = getNestedArray(["programs"]);
  const ourWorkProjects =
    item.slug === "our-work-projects" || item.slug === "projects"
      ? getNestedArray(["cards"])
      : [];
  const advisoryItems =
    item.slug === "our-work-advisory" ||
    item.slug === "advisory" ||
    item.slug === "our-work-partnership" ||
    item.slug === "partnership"
      ? getNestedArray(["cards"])
      : [];
  const researchItems =
    item.slug === "our-work-research" || item.slug === "research"
      ? getNestedArray(["cards"])
      : [];
  const trainingItems =
    item.slug === "our-work-training" || item.slug === "training"
      ? getNestedArray(["cards"])
      : [];
  const getInvolvedOpportunities = getNestedArray(["opportunities"]);
  const getInvolvedEvents = getNestedArray([
    "bottomSection",
    "upcomingEvents",
    "events",
  ]);
  const subscribeTopicItems = Array.isArray(parsedJson.topics)
    ? (parsedJson.topics as Array<Record<string, unknown>>).filter(
        (x): x is Record<string, unknown> =>
          !!x && typeof x === "object" && !Array.isArray(x),
      )
    : [];

  function updateProgram(index: number, key: string, value: string) {
    updateNestedArray(["programs"], (arr) =>
      arr.map((program, i) =>
        i === index ? { ...program, [key]: value } : program,
      ),
    );
  }

  function addProgram() {
    updateNestedArray(["programs"], (arr) => [
      ...arr,
      { title: "", description: "", backgroundImage: "" },
    ]);
  }

  function removeProgram(index: number) {
    updateNestedArray(["programs"], (arr) => arr.filter((_, i) => i !== index));
  }

  function moveProgram(index: number, direction: -1 | 1) {
    updateNestedArray(["programs"], (arr) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= arr.length) return arr;
      const copy = [...arr];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  /* Projects list (our-work-projects) — stored as top-level `cards` */
  function updateProject(index: number, key: string, value: string) {
    updateNestedArray(["cards"], (arr) =>
      arr.map((project, i) =>
        i === index ? { ...project, [key]: value } : project,
      ),
    );
  }

  function addProject() {
    updateNestedArray(["cards"], (arr) => [
      ...arr,
      { title: "", description: "", backgroundImage: "" },
    ]);
  }

  function removeProject(index: number) {
    updateNestedArray(["cards"], (arr) => arr.filter((_, i) => i !== index));
  }

  function moveProject(index: number, direction: -1 | 1) {
    updateNestedArray(["cards"], (arr) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= arr.length) return arr;
      const copy = [...arr];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  /* Advisory page items (our-work-advisory) — stored as top-level `cards` on that slug */
  function updateAdvisoryItem(index: number, key: string, value: string) {
    updateNestedArray(["cards"], (arr) =>
      arr.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    );
  }

  function addAdvisoryItem() {
    updateNestedArray(["cards"], (arr) => [
      ...arr,
      { title: "", description: "", backgroundImage: "" },
    ]);
  }

  function removeAdvisoryItem(index: number) {
    updateNestedArray(["cards"], (arr) => arr.filter((_, i) => i !== index));
  }

  function moveAdvisoryItem(index: number, direction: -1 | 1) {
    updateNestedArray(["cards"], (arr) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= arr.length) return arr;
      const copy = [...arr];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function updateResearchItem(index: number, key: string, value: string) {
    updateNestedArray(["cards"], (arr) =>
      arr.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    );
  }

  function addResearchItem() {
    updateNestedArray(["cards"], (arr) => [
      ...arr,
      { title: "", description: "", backgroundImage: "" },
    ]);
  }

  function removeResearchItem(index: number) {
    updateNestedArray(["cards"], (arr) => arr.filter((_, i) => i !== index));
  }

  function moveResearchItem(index: number, direction: -1 | 1) {
    updateNestedArray(["cards"], (arr) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= arr.length) return arr;
      const copy = [...arr];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function updateTrainingItem(index: number, key: string, value: string) {
    updateNestedArray(["cards"], (arr) =>
      arr.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    );
  }

  function addTrainingItem() {
    updateNestedArray(["cards"], (arr) => [
      ...arr,
      { title: "", description: "", backgroundImage: "" },
    ]);
  }

  function removeTrainingItem(index: number) {
    updateNestedArray(["cards"], (arr) => arr.filter((_, i) => i !== index));
  }

  function moveTrainingItem(index: number, direction: -1 | 1) {
    updateNestedArray(["cards"], (arr) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= arr.length) return arr;
      const copy = [...arr];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function onSelectMedia(media: MediaItem) {
    if (!pickerTarget) return;
    const value =
      pickerTarget !== "heroImage" &&
      pickerTarget !== "sectionImage" &&
      pickerTarget.nested.length === 1 &&
      (pickerTarget.nested[0] === "focusSectionBgImage" ||
        pickerTarget.nested[0] === "strategicPrioritiesBgImage")
        ? media.url
        : media.id;
    if (pickerTarget === "heroImage" || pickerTarget === "sectionImage") {
      updateJsonField(pickerTarget, media.id);
    } else {
      const path = pickerTarget.nested;
      // Support selecting into array items like ["programs", "0", "backgroundImage"]
      if (path.length >= 3 && /^[0-9]+$/.test(path[1])) {
        const arrayKey = path[0];
        const idx = Number(path[1]);
        const leaf = path.slice(2).join(".");
        updateNestedArray([arrayKey], (arr) =>
          arr.map((item, i) =>
            i === idx
              ? { ...(item as Record<string, unknown>), [leaf]: value }
              : item,
          ),
        );
      } else {
        updateNestedString(path, value);
      }
    }
    setPickerTarget(null);
  }

  return (
    <form action={action} className="space-y-6">
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-slate-700"
        >
          Slug *
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={item.slug}
          required
          readOnly
          className="mt-1 w-full rounded-lg border border-border bg-slate-50 px-4 py-2 text-slate-600"
        />
        <p className="mt-1 text-xs text-slate-500">
          Slug cannot be changed after creation.
        </p>
      </div>

      <div>
        <label
          htmlFor="heroTitle"
          className="block text-sm font-medium text-slate-700"
        >
          Hero Title
        </label>
        <input
          id="heroTitle"
          name="heroTitle"
          defaultValue={item.heroTitle ?? ""}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      {fieldVisibility.showMainTitle !== false && (
        <div>
          <label
            htmlFor="mainTitle"
            className="block text-sm font-medium text-slate-700"
          >
            Main Title
          </label>
          <input
            id="mainTitle"
            name="mainTitle"
            defaultValue={item.mainTitle ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      )}

      {/* <div>
        <label
          htmlFor="heroSubtitle"
          className="block text-sm font-medium text-slate-700"
        >
          Hero Subtitle
        </label>
        <textarea
          id="heroSubtitle"
          name="heroSubtitle"
          defaultValue={item.heroSubtitle ?? ""}
          rows={2}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div> */}

      {/* <div>
        <label
          htmlFor="intro"
          className="block text-sm font-medium text-slate-700"
        >
          Intro
        </label>
        <textarea
          id="intro"
          name="intro"
          defaultValue={item.intro ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div> */}

      {fieldVisibility.showDescription !== false && (
        <CmsRichTextField
          label="Description"
          name="description"
          editorId={`${item.slug}-description`}
          initialHtml={descriptionHtml}
          onHtmlChange={setDescriptionHtml}
          compact
        />
      )}

      {showAboutExtendedFields ? (
        <>
          <div>
            <label
              htmlFor="mission"
              className="block text-sm font-medium text-slate-700"
            >
              Mission
            </label>
            <textarea
              id="mission"
              name="mission"
              defaultValue={item.mission ?? ""}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="objectivesTitle"
              className="block text-sm font-medium text-slate-700"
            >
              Objectives Title
            </label>
            <input
              id="objectivesTitle"
              name="objectivesTitle"
              defaultValue={item.objectivesTitle ?? ""}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="objectivesContent"
              className="block text-sm font-medium text-slate-700"
            >
              Objectives Content
            </label>
            <textarea
              id="objectivesContent"
              name="objectivesContent"
              defaultValue={item.objectivesContent ?? ""}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="objectivesPrinciples"
              className="block text-sm font-medium text-slate-700"
            >
              Objectives Principles
            </label>
            <textarea
              id="objectivesPrinciples"
              name="objectivesPrinciples"
              defaultValue={item.objectivesPrinciples ?? ""}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="objectivesAgenda2063"
              className="block text-sm font-medium text-slate-700"
            >
              Objectives Agenda 2063
            </label>
            <textarea
              id="objectivesAgenda2063"
              name="objectivesAgenda2063"
              defaultValue={item.objectivesAgenda2063 ?? ""}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
        </>
      ) : null}

      {showSubscribeFields ? (
        <>
          <div className="rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Subscribe page helper
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Edit the hero copy and the four topic cards shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">/subscribe</code>.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Hero image
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={quickValues.heroImage}
                    onChange={(e) =>
                      updateJsonField("heroImage", e.target.value)
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    placeholder="media-... or /uploads/..."
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget("heroImage")}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    title="Pick from Media Library"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Library
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  This image is shown on the live{" "}
                  <code className="rounded bg-slate-100 px-0.5">
                    /subscribe
                  </code>{" "}
                  hero.
                </p>
              </div>
              {/* <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Hero title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.heroTitle === "string"
                      ? parsedJson.heroTitle
                      : ""
                  }
                  onChange={(e) => updateJsonField("heroTitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div> */}
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Hero subtitle"
                  editorId={`${item.slug}-hero-subtitle`}
                  value={
                    typeof parsedJson.heroSubtitle === "string"
                      ? parsedJson.heroSubtitle
                      : ""
                  }
                  onChange={(html) => updateJsonField("heroSubtitle", html)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Section eyebrow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionEyebrow === "string"
                      ? parsedJson.sectionEyebrow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sectionEyebrow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Section heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionHeading === "string"
                      ? parsedJson.sectionHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sectionHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Intro paragraph"
                  editorId={`${item.slug}-intro`}
                  value={
                    typeof parsedJson.intro === "string" ? parsedJson.intro : ""
                  }
                  onChange={(html) => updateJsonField("intro", html)}
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Required note"
                  editorId={`${item.slug}-required-note`}
                  value={
                    typeof parsedJson.requiredNote === "string"
                      ? parsedJson.requiredNote
                      : ""
                  }
                  onChange={(html) => updateJsonField("requiredNote", html)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Support eyebrow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.supportEyebrow === "string"
                      ? parsedJson.supportEyebrow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("supportEyebrow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Support body"
                  editorId={`${item.slug}-support-body`}
                  value={
                    typeof parsedJson.supportBody === "string"
                      ? parsedJson.supportBody
                      : ""
                  }
                  onChange={(html) => updateJsonField("supportBody", html)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-white p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Topic card {idx + 1}
                  </p>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Title
                      </label>
                      <input
                        type="text"
                        value={
                          typeof subscribeTopicItems[idx]?.title === "string"
                            ? String(subscribeTopicItems[idx].title)
                            : ""
                        }
                        onChange={(e) => {
                          const nextTopics = [...subscribeTopicItems];
                          nextTopics[idx] = {
                            ...(nextTopics[idx] ?? {}),
                            title: e.target.value,
                          };
                          updateJsonObject({
                            ...parsedJson,
                            topics: nextTopics,
                          });
                        }}
                        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <PageContentJsonRichText
                      label="Description"
                      editorId={`${item.slug}-subscribe-topic-${idx}`}
                      value={
                        typeof subscribeTopicItems[idx]?.text === "string"
                          ? String(subscribeTopicItems[idx].text)
                          : ""
                      }
                      onChange={(html) => {
                        const nextTopics = [...subscribeTopicItems];
                        nextTopics[idx] = {
                          ...(nextTopics[idx] ?? {}),
                          text: html,
                        };
                        updateJsonObject({
                          ...parsedJson,
                          topics: nextTopics,
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {showDonateFields ? (
        <>
          <div className="rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Donate page helper
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Copy for <code className="rounded bg-slate-100 px-0.5">/donate</code>. Paystack
              amounts and gateway are under{" "}
              <a href="/admin/donation-settings" className="font-medium text-accent-700 hover:underline">
                Donation settings
              </a>
              .
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Hero image</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={quickValues.heroImage}
                    onChange={(e) => updateJsonField("heroImage", e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    placeholder="media-... or /uploads/..."
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget("heroImage")}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    title="Pick from Media Library"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Library
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Hero title</label>
                <input
                  type="text"
                  value={typeof parsedJson.title === "string" ? parsedJson.title : ""}
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Hero subtitle</label>
                <input
                  type="text"
                  value={typeof parsedJson.subtitle === "string" ? parsedJson.subtitle : ""}
                  onChange={(e) => updateJsonField("subtitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Intro paragraph"
                  editorId={`${item.slug}-intro`}
                  value={typeof parsedJson.intro === "string" ? parsedJson.intro : ""}
                  onChange={(html) => updateJsonField("intro", html)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Section eyebrow</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionEyebrow === "string" ? parsedJson.sectionEyebrow : ""
                  }
                  onChange={(e) => updateJsonField("sectionEyebrow", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Section heading</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionHeading === "string" ? parsedJson.sectionHeading : ""
                  }
                  onChange={(e) => updateJsonField("sectionHeading", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Donation type question
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.typeQuestion === "string" ? parsedJson.typeQuestion : ""
                  }
                  onChange={(e) => updateJsonField("typeQuestion", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type card label</label>
                <input
                  type="text"
                  value={typeof parsedJson.typeLabel === "string" ? parsedJson.typeLabel : ""}
                  onChange={(e) => updateJsonField("typeLabel", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Type card description"
                  editorId={`${item.slug}-type-description`}
                  value={
                    typeof parsedJson.typeDescription === "string" ? parsedJson.typeDescription : ""
                  }
                  onChange={(html) => updateJsonField("typeDescription", html)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Amount heading</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.amountHeading === "string" ? parsedJson.amountHeading : ""
                  }
                  onChange={(e) => updateJsonField("amountHeading", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Other amount label</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.otherAmountLabel === "string"
                      ? parsedJson.otherAmountLabel
                      : ""
                  }
                  onChange={(e) => updateJsonField("otherAmountLabel", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Form title</label>
                <input
                  type="text"
                  value={typeof parsedJson.formTitle === "string" ? parsedJson.formTitle : ""}
                  onChange={(e) => updateJsonField("formTitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Form description</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.formDescription === "string" ? parsedJson.formDescription : ""
                  }
                  onChange={(e) => updateJsonField("formDescription", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Submit button label</label>
                <input
                  type="text"
                  value={typeof parsedJson.submitLabel === "string" ? parsedJson.submitLabel : ""}
                  onChange={(e) => updateJsonField("submitLabel", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Success page title</label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.successTitle === "string" ? parsedJson.successTitle : ""
                  }
                  onChange={(e) => updateJsonField("successTitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Success message"
                  editorId={`${item.slug}-success-message`}
                  value={
                    typeof parsedJson.successMessage === "string" ? parsedJson.successMessage : ""
                  }
                  onChange={(html) => updateJsonField("successMessage", html)}
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Footnote"
                  editorId={`${item.slug}-footnote`}
                  value={typeof parsedJson.footnote === "string" ? parsedJson.footnote : ""}
                  onChange={(html) => updateJsonField("footnote", html)}
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentStringListRichText
                  label="Impact points (left column)"
                  editorIdPrefix={`${item.slug}-impact-items`}
                  items={parseJsonStringList(parsedJson.impactItems)}
                  onChange={(impactItems) => updateJsonObject({ ...parsedJson, impactItems })}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={item.status ?? "published"}
          className="mt-1 rounded-lg border border-border px-4 py-2 text-slate-900"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div>
        <p className="mb-3 rounded-lg border border-accent-200/80 bg-accent-50/60 px-4 py-3 text-sm text-slate-700">
          Edit page copy using the visual fields below. You do not need to edit raw JSON unless
          your developer asked you to.
        </p>
        <label
          htmlFor="contentJson"
          className="sr-only"
        >
          Structured page data
        </label>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {draftRestored ? (
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
              Restored unsaved local draft for this page.
            </span>
          ) : null}
          {lastSavedAt ? (
            <span>
              Autosaved locally: {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          ) : null}
          <button
            type="button"
            onClick={clearLocalDraft}
            className="rounded-md border border-border px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            Clear local draft
          </button>
        </div>
        {(item.slug.startsWith("our-work-") ||
          ["programs", "projects", "research", "training", "advisory", "partnership"].includes(
            item.slug,
          )) && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Our Work helper
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.title === "string" ? parsedJson.title : ""
                  }
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section subtitle
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.subtitle === "string"
                      ? parsedJson.subtitle
                      : ""
                  }
                  onChange={(e) => updateJsonField("subtitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <PageContentJsonRichText
              label="Section description"
              editorId={`${item.slug}-description`}
              value={
                typeof parsedJson.description === "string"
                  ? parsedJson.description
                  : ""
              }
              onChange={(html) => updateJsonField("description", html)}
            />
          </div>
        )}
        {item.slug === "awpls" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              AWPLS helper
            </p>
            {/* <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.title === "string" ? parsedJson.title : ""
                  }
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section subtitle
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.subtitle === "string"
                      ? parsedJson.subtitle
                      : ""
                  }
                  onChange={(e) => updateJsonField("subtitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div> */}
            {/* <div>
              <label className="block text-xs font-medium text-slate-600">
                Section description
              </label>
              <textarea
                value={
                  typeof parsedJson.description === "string"
                    ? parsedJson.description
                    : ""
                }
                onChange={(e) => updateJsonField("description", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div> */}
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                AWPLS Images
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Intro card image", key: "introImage" },
                  { label: "Gallery image A", key: "sectionImageA" },
                  { label: "Gallery image B", key: "sectionImageB" },
                  { label: "Gallery image C", key: "sectionImageC" },
                  { label: "Targets background image", key: "targetsBgImage" },
                  {
                    label: "Deliver section background image",
                    key: "deliverBgImage",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600">
                      {field.label}
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={
                          typeof parsedJson[field.key] === "string"
                            ? String(parsedJson[field.key])
                            : ""
                        }
                        onChange={(e) =>
                          updateJsonField(field.key, e.target.value)
                        }
                        placeholder="media-... or /uploads/..."
                        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPickerTarget({ nested: [field.key] })}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        title="Pick from Media Library"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PageContentJsonRichText
              label="Page description"
              editorId={`${item.slug}-awpls-description`}
              value={
                typeof parsedJson.description === "string" ? parsedJson.description : ""
              }
              onChange={(html) => updateJsonField("description", html)}
            />
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Main section text
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Top eyebrow
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.aboutEyebrow === "string"
                        ? parsedJson.aboutEyebrow
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("aboutEyebrow", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Top heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.aboutHeading === "string"
                        ? parsedJson.aboutHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("aboutHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Top body"
                    editorId={`${item.slug}-awpls-about-body`}
                    value={richTextFieldInitial(
                      parsedJson.aboutBody,
                      parsedJson.aboutParagraphs,
                    )}
                    onChange={(html) => updateJsonField("aboutBody", html)}
                    hint="Replaces legacy line-based paragraphs when saved."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Register card heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerCardHeading === "string"
                        ? parsedJson.registerCardHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerCardHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Register card CTA label
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerCardCtaLabel === "string"
                        ? parsedJson.registerCardCtaLabel
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerCardCtaLabel", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Register card body"
                    editorId={`${item.slug}-awpls-register-body`}
                    value={
                      typeof parsedJson.registerCardBody === "string"
                        ? parsedJson.registerCardBody
                        : ""
                    }
                    onChange={(html) => updateJsonField("registerCardBody", html)}
                  />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                What AWPLS is
              </p>
              <div className="mt-2 grid gap-3">
                <label className="block text-xs font-medium text-slate-600">
                  Section heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.whatIsHeading === "string"
                      ? parsedJson.whatIsHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("whatIsHeading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-md border border-border p-3 ${idx === 4 ? "sm:col-span-2" : ""}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Card {idx + 1}
                    </p>
                    <label className="mt-2 block text-xs font-medium text-slate-600">
                      Title
                    </label>
                    <input
                      type="text"
                      value={getNestedString([
                        "whatIsCards",
                        String(idx),
                        "title",
                      ])}
                      onChange={(e) =>
                        updateNestedString(
                          ["whatIsCards", String(idx), "title"],
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                    <PageContentJsonRichText
                      label="Description"
                      editorId={`${item.slug}-what-is-${idx}`}
                      value={getNestedString(["whatIsCards", String(idx), "body"])}
                      onChange={(html) =>
                        updateNestedString(["whatIsCards", String(idx), "body"], html)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Targets and 2026 content
              </p>
              <div className="mt-2 grid gap-3">
                <label className="block text-xs font-medium text-slate-600">
                  Targets heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.targetsHeading === "string"
                      ? parsedJson.targetsHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("targetsHeading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentStringListRichText
                  label="Targets points"
                  editorIdPrefix={`${item.slug}-targets-points`}
                  items={parseJsonStringList(parsedJson.targetsPoints)}
                  onChange={(targetsPoints) =>
                    updateJsonObject({ ...parsedJson, targetsPoints })
                  }
                />
                <label className="block text-xs font-medium text-slate-600">
                  About 2026 heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.summit2026Heading === "string"
                      ? parsedJson.summit2026Heading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("summit2026Heading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentJsonRichText
                  label="About 2026 body"
                  editorId={`${item.slug}-summit2026-body`}
                  value={richTextFieldInitial(
                    parsedJson.summit2026Body,
                    parsedJson.summit2026Paragraphs,
                  )}
                  onChange={(html) => updateJsonField("summit2026Body", html)}
                  hint="Replaces legacy line-based paragraphs when saved."
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Deliverables and final CTA
              </p>
              <div className="mt-2 grid gap-3">
                <label className="block text-xs font-medium text-slate-600">
                  Deliverables heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.deliverHeading === "string"
                      ? parsedJson.deliverHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("deliverHeading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentStringListRichText
                  label="Deliverables points"
                  editorIdPrefix={`${item.slug}-deliver-points`}
                  items={parseJsonStringList(parsedJson.deliverPoints)}
                  onChange={(deliverPoints) =>
                    updateJsonObject({ ...parsedJson, deliverPoints })
                  }
                />
                <PageContentJsonRichText
                  label="Deliver closing paragraph"
                  editorId={`${item.slug}-deliver-closing`}
                  value={
                    typeof parsedJson.deliverClosingParagraph === "string"
                      ? parsedJson.deliverClosingParagraph
                      : ""
                  }
                  onChange={(html) => updateJsonField("deliverClosingParagraph", html)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Final CTA heading
                    </label>
                    <input
                      type="text"
                      value={
                        typeof parsedJson.finalCtaHeading === "string"
                          ? parsedJson.finalCtaHeading
                          : ""
                      }
                      onChange={(e) =>
                        updateJsonField("finalCtaHeading", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Final CTA button label
                    </label>
                    <input
                      type="text"
                      value={
                        typeof parsedJson.finalCtaButtonLabel === "string"
                          ? parsedJson.finalCtaButtonLabel
                          : ""
                      }
                      onChange={(e) =>
                        updateJsonField("finalCtaButtonLabel", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <PageContentJsonRichText
                  label="Final CTA body"
                  editorId={`${item.slug}-final-cta-body`}
                  value={
                    typeof parsedJson.finalCtaBody === "string"
                      ? parsedJson.finalCtaBody
                      : ""
                  }
                  onChange={(html) => updateJsonField("finalCtaBody", html)}
                />
              </div>
            </div>
          </div>
        )}
        {item.slug === "about" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              About page helper
            </p>
            <p className="text-xs text-slate-500">
              For hero, mission and team tabs use{" "}
              <strong>Admin → About settings</strong>. Use fields here for lead
              paragraphs, delivery cards, and partnerships copy/images.
            </p>
            <PageContentJsonRichText
              label="Lead body"
              editorId={`${item.slug}-lead-body`}
              value={richTextFieldInitial(
                parsedJson.leadBody,
                parsedJson.leadParagraphs,
              )}
              onChange={(html) => updateJsonField("leadBody", html)}
              hint="Replaces legacy lead paragraphs when saved."
            />
            <PageContentJsonRichText
              label="Partnerships and network text"
              editorId={`${item.slug}-partnerships-text`}
              value={
                typeof parsedJson.partnershipsText === "string"
                  ? parsedJson.partnershipsText
                  : ""
              }
              onChange={(html) => updateJsonField("partnershipsText", html)}
            />
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Delivery cards (4)
              </p>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Card {index + 1}
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={getNestedString([
                          "deliveryPoints",
                          String(index),
                          "title",
                        ])}
                        onChange={(e) =>
                          updateNestedString(
                            ["deliveryPoints", String(index), "title"],
                            e.target.value,
                          )
                        }
                        placeholder="Title"
                        className="rounded-md border border-border bg-white px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={getNestedString([
                            "deliveryPoints",
                            String(index),
                            "image",
                          ])}
                          onChange={(e) =>
                            updateNestedString(
                              ["deliveryPoints", String(index), "image"],
                              e.target.value,
                            )
                          }
                          placeholder="Card image (media-id/url/path)"
                          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPickerTarget({
                              nested: [
                                "deliveryPoints",
                                String(index),
                                "image",
                              ],
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          title="Pick from Media Library"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <PageContentJsonRichText
                      label="Card body"
                      editorId={`${item.slug}-delivery-${index}`}
                      value={getNestedString(["deliveryPoints", String(index), "body"])}
                      onChange={(html) =>
                        updateNestedString(["deliveryPoints", String(index), "body"], html)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {item.slug === "our-work" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Our Work main page helper
            </p>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Hero and section labels
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {/* <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Hero title
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["hero", "title"])}
                    onChange={(e) =>
                      updateNestedString(["hero", "title"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Hero subtitle
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["hero", "subtitle"])}
                    onChange={(e) =>
                      updateNestedString(["hero", "subtitle"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div> */}
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Approach eyebrow
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["approachEyebrow"])}
                    onChange={(e) =>
                      updateNestedString(["approachEyebrow"], e.target.value)
                    }
                    placeholder="How we work"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Work areas eyebrow
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["workAreasEyebrow"])}
                    onChange={(e) =>
                      updateNestedString(["workAreasEyebrow"], e.target.value)
                    }
                    placeholder="Programmes & projects"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Work area tabs and intros
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Set the tab labels and the paragraph shown under each tab on{" "}
                <code className="rounded bg-slate-100 px-0.5">/our-work</code>.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Tab label: Programs
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["tabs", "programs"])}
                    onChange={(e) =>
                      updateNestedString(["tabs", "programs"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Tab label: Projects
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["tabs", "projects"])}
                    onChange={(e) =>
                      updateNestedString(["tabs", "projects"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Tab label: Advisory
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["tabs", "advisory"])}
                    onChange={(e) =>
                      updateNestedString(["tabs", "advisory"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Programs intro text
                  </label>
                  <textarea
                    value={getNestedString(["programs", "description"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["programs", "description"],
                        e.target.value,
                      )
                    }
                    rows={4}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Projects intro text
                  </label>
                  <textarea
                    value={getNestedString(["projects", "description"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["projects", "description"],
                        e.target.value,
                      )
                    }
                    rows={4}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Advisory intro text
                  </label>
                  <textarea
                    value={getNestedString(["advisory", "description"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["advisory", "description"],
                        e.target.value,
                      )
                    }
                    rows={4}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Approach section
              </p>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Approach title
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["approach", "title"])}
                    onChange={(e) =>
                      updateNestedString(["approach", "title"], e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <PageContentStringListRichText
                  label="Approach intro paragraphs"
                  editorIdPrefix={`${item.slug}-approach-intro`}
                  items={getNestedStringArray(["approachIntroParagraphs"])}
                  onChange={(items) =>
                    updateNestedStringArray(["approachIntroParagraphs"], items)
                  }
                  hint="Each item is one paragraph on the Our Work page."
                />
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Objectives lead text
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["approach", "objectivesLead"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["approach", "objectivesLead"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <PageContentStringListRichText
                  label="Objectives points"
                  editorIdPrefix={`${item.slug}-approach-objectives`}
                  items={getNestedStringArray(["approach", "objectives"])}
                  onChange={(items) =>
                    updateNestedStringArray(["approach", "objectives"], items)
                  }
                />
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Objectives block background image
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={getNestedString(["approachObjectivesBgImage"])}
                      onChange={(e) =>
                        updateNestedString(
                          ["approachObjectivesBgImage"],
                          e.target.value,
                        )
                      }
                      placeholder="media-... or /uploads/..."
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPickerTarget({
                          nested: ["approachObjectivesBgImage"],
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      title="Pick from Media Library"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Advisory cards
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(["advisory", "cards"], (arr) => [
                      ...arr,
                      { title: "", description: "" },
                    ])
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add card
                </button>
              </div>
              <div className="space-y-2">
                {ourWorkAdvisoryCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={typeof card.title === "string" ? card.title : ""}
                        onChange={(e) =>
                          updateNestedArray(["advisory", "cards"], (arr) =>
                            arr.map((c, i) =>
                              i === idx ? { ...c, title: e.target.value } : c,
                            ),
                          )
                        }
                        placeholder="Card title"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateNestedArray(["advisory", "cards"], (arr) =>
                            arr.filter((_, i) => i !== idx),
                          )
                        }
                        className="justify-self-end rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                    <PageContentJsonRichText
                      label="Card description"
                      editorId={`${item.slug}-advisory-card-${idx}`}
                      value={
                        typeof card.description === "string" ? card.description : ""
                      }
                      onChange={(html) =>
                        updateNestedArray(["advisory", "cards"], (arr) =>
                          arr.map((c, i) =>
                            i === idx ? { ...c, description: html } : c,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(item.slug === "our-work-programs" || item.slug === "programs") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Programs page helper
            </p>
            <p className="text-[11px] text-slate-500">
              Edit the carousel items shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">
                /our-work/programs
              </code>
              . Leave{" "}
              <code className="rounded bg-slate-100 px-0.5">
                backgroundImage
              </code>{" "}
              blank to use the default image fallback.
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Use the arrows to reorder items. These values are saved into the
                page content JSON.
              </p>
              <button
                type="button"
                onClick={addProgram}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-3">
              {ourWorkPrograms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No program items yet. Add the first one above.
                </p>
              ) : (
                ourWorkPrograms.map((program, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Item {index + 1}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveProgram(index, -1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProgram(index, 1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProgram(index)}
                          className="inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={
                            typeof program.title === "string"
                              ? program.title
                              : ""
                          }
                          onChange={(e) =>
                            updateProgram(index, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <PageContentJsonRichText
                        label="Description"
                        editorId={`${item.slug}-program-${index}`}
                        value={
                          typeof program.description === "string"
                            ? program.description
                            : ""
                        }
                        onChange={(html) =>
                          updateProgram(index, "description", html)
                        }
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Background image
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={
                              typeof program.backgroundImage === "string"
                                ? program.backgroundImage
                                : ""
                            }
                            onChange={(e) =>
                              updateProgram(
                                index,
                                "backgroundImage",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                            placeholder="media id, image URL, or /uploads/..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPickerTarget({
                                nested: [
                                  "programs",
                                  String(index),
                                  "backgroundImage",
                                ],
                              })
                            }
                            className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                            title="Pick from Media Library"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {(item.slug === "our-work-projects" || item.slug === "projects") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Projects page helper
            </p>
            <p className="text-[11px] text-slate-500">
              Edit the carousel items shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">
                /our-work/projects
              </code>
              . Leave{" "}
              <code className="rounded bg-slate-100 px-0.5">
                backgroundImage
              </code>{" "}
              blank to use the default image fallback.
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Use the arrows to reorder items. These values are saved into the
                page content JSON.
              </p>
              <button
                type="button"
                onClick={addProject}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-3">
              {ourWorkProjects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No project items yet. Add the first one above.
                </p>
              ) : (
                ourWorkProjects.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Item {index + 1}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveProject(index, -1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProject(index, 1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={
                            typeof project.title === "string"
                              ? project.title
                              : ""
                          }
                          onChange={(e) =>
                            updateProject(index, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <PageContentJsonRichText
                        label="Description"
                        editorId={`${item.slug}-project-${index}`}
                        value={
                          typeof project.description === "string"
                            ? project.description
                            : ""
                        }
                        onChange={(html) =>
                          updateProject(index, "description", html)
                        }
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Background image
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={
                              typeof project.backgroundImage === "string"
                                ? project.backgroundImage
                                : ""
                            }
                            onChange={(e) =>
                              updateProject(
                                index,
                                "backgroundImage",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                            placeholder="media id, image URL, or /uploads/..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPickerTarget({
                                nested: [
                                  "cards",
                                  String(index),
                                  "backgroundImage",
                                ],
                              })
                            }
                            className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                            title="Pick from Media Library"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {(item.slug === "our-work-advisory" ||
          item.slug === "advisory" ||
          item.slug === "our-work-partnership" ||
          item.slug === "partnership") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {item.slug === "our-work-partnership" || item.slug === "partnership"
                ? "Partnership page helper"
                : "Advisory page helper"}
            </p>
            <p className="text-[11px] text-slate-500">
              Edit the carousel items shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">
                {item.slug === "our-work-partnership" || item.slug === "partnership"
                  ? "/our-work/partnership"
                  : "/our-work/advisory"}
              </code>
              .
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Use the arrows to reorder items. These values are saved into the
                page content JSON.
              </p>
              <button
                type="button"
                onClick={addAdvisoryItem}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-3">
              {advisoryItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No advisory items yet. Add the first one above.
                </p>
              ) : (
                advisoryItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Item {index + 1}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveAdvisoryItem(index, -1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveAdvisoryItem(index, 1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAdvisoryItem(index)}
                          className="inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={
                            typeof item.title === "string" ? item.title : ""
                          }
                          onChange={(e) =>
                            updateAdvisoryItem(index, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <PageContentJsonRichText
                        label="Description"
                        editorId={`${item.slug}-carousel-${index}`}
                        value={
                          typeof item.description === "string" ? item.description : ""
                        }
                        onChange={(html) =>
                          updateAdvisoryItem(index, "description", html)
                        }
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Background image
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={
                              typeof item.backgroundImage === "string"
                                ? item.backgroundImage
                                : ""
                            }
                            onChange={(e) =>
                              updateAdvisoryItem(
                                index,
                                "backgroundImage",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                            placeholder="media id, image URL, or /uploads/..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPickerTarget({
                                nested: [
                                  "cards",
                                  String(index),
                                  "backgroundImage",
                                ],
                              })
                            }
                            className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                            title="Pick from Media Library"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {(item.slug === "our-work-research" || item.slug === "research") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Research page helper
            </p>
            <p className="text-[11px] text-slate-500">
              Edit the carousel items shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">
                /our-work/research
              </code>
              .
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Use the arrows to reorder cards. These values are saved into the
                page content JSON.
              </p>
              <button
                type="button"
                onClick={addResearchItem}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                + Add card
              </button>
            </div>
            <div className="space-y-3">
              {researchItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No research cards yet. Add the first one above.
                </p>
              ) : (
                researchItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Card {index + 1}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveResearchItem(index, -1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveResearchItem(index, 1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeResearchItem(index)}
                          className="inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={
                            typeof item.title === "string" ? item.title : ""
                          }
                          onChange={(e) =>
                            updateResearchItem(index, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <PageContentJsonRichText
                        label="Description"
                        editorId={`${item.slug}-research-${index}`}
                        value={
                          typeof item.description === "string" ? item.description : ""
                        }
                        onChange={(html) =>
                          updateResearchItem(index, "description", html)
                        }
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Background image
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={
                              typeof item.backgroundImage === "string"
                                ? item.backgroundImage
                                : ""
                            }
                            onChange={(e) =>
                              updateResearchItem(
                                index,
                                "backgroundImage",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                            placeholder="media id, image URL, or /uploads/..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPickerTarget({
                                nested: [
                                  "cards",
                                  String(index),
                                  "backgroundImage",
                                ],
                              })
                            }
                            className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                            title="Pick from Media Library"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {(item.slug === "our-work-training" || item.slug === "training") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Training page helper
            </p>
            <p className="text-[11px] text-slate-500">
              Edit the carousel items shown on{" "}
              <code className="rounded bg-slate-100 px-0.5">
                /our-work/training
              </code>
              .
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Use the arrows to reorder cards. These values are saved into the
                page content JSON.
              </p>
              <button
                type="button"
                onClick={addTrainingItem}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                + Add card
              </button>
            </div>
            <div className="space-y-3">
              {trainingItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No training cards yet. Add the first one above.
                </p>
              ) : (
                trainingItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Card {index + 1}
                      </p>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveTrainingItem(index, -1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTrainingItem(index, 1)}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTrainingItem(index)}
                          className="inline-flex items-center rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Title
                        </label>
                        <input
                          type="text"
                          value={
                            typeof item.title === "string" ? item.title : ""
                          }
                          onChange={(e) =>
                            updateTrainingItem(index, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <PageContentJsonRichText
                        label="Description"
                        editorId={`${item.slug}-training-${index}`}
                        value={
                          typeof item.description === "string" ? item.description : ""
                        }
                        onChange={(html) =>
                          updateTrainingItem(index, "description", html)
                        }
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Background image
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={
                              typeof item.backgroundImage === "string"
                                ? item.backgroundImage
                                : ""
                            }
                            onChange={(e) =>
                              updateTrainingItem(
                                index,
                                "backgroundImage",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                            placeholder="media id, image URL, or /uploads/..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPickerTarget({
                                nested: [
                                  "cards",
                                  String(index),
                                  "backgroundImage",
                                ],
                              })
                            }
                            className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                            title="Pick from Media Library"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {item.slug === "site-settings" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Global site settings
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Site name
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.name === "string" ? parsedJson.name : ""
                  }
                  onChange={(e) => updateJsonField("name", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Phone
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.phone === "string" ? parsedJson.phone : ""
                  }
                  onChange={(e) => updateJsonField("phone", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Tagline
              </label>
              <textarea
                value={
                  typeof parsedJson.tagline === "string"
                    ? parsedJson.tagline
                    : ""
                }
                onChange={(e) => updateJsonField("tagline", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Address
              </label>
              <input
                type="text"
                value={
                  typeof parsedJson.address === "string"
                    ? parsedJson.address
                    : ""
                }
                onChange={(e) => updateJsonField("address", e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Office hours
              </label>
              <input
                type="text"
                value={
                  typeof parsedJson.officeHours === "string"
                    ? parsedJson.officeHours
                    : ""
                }
                onChange={(e) => updateJsonField("officeHours", e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Programs email
                </label>
                <input
                  type="email"
                  value={getNestedString(["email", "programs"])}
                  onChange={(e) =>
                    updateNestedString(["email", "programs"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Media email
                </label>
                <input
                  type="email"
                  value={getNestedString(["email", "media"])}
                  onChange={(e) =>
                    updateNestedString(["email", "media"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Info email
                </label>
                <input
                  type="email"
                  value={getNestedString(["email", "info"])}
                  onChange={(e) =>
                    updateNestedString(["email", "info"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={getNestedString(["social", "linkedin"])}
                  onChange={(e) =>
                    updateNestedString(["social", "linkedin"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Twitter/X
                </label>
                <input
                  type="url"
                  value={getNestedString(["social", "twitter"])}
                  onChange={(e) =>
                    updateNestedString(["social", "twitter"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Instagram
                </label>
                <input
                  type="url"
                  value={getNestedString(["social", "instagram"])}
                  onChange={(e) =>
                    updateNestedString(["social", "instagram"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Facebook
                </label>
                <input
                  type="url"
                  value={getNestedString(["social", "facebook"])}
                  onChange={(e) =>
                    updateNestedString(["social", "facebook"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
        {item.slug === "get-involved" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Get Involved helper
            </p>
            <PageContentJsonRichText
              label="Page intro"
              editorId={`${item.slug}-get-involved-intro`}
              value={
                typeof parsedJson.intro === "string" ? parsedJson.intro : ""
              }
              onChange={(html) => updateJsonField("intro", html)}
            />
            <p className="text-xs text-slate-500">
              Detail pages (<code>/get-involved/join-us</code>,{" "}
              <code>/get-involved/partnership</code>,{" "}
              <code>/get-involved/volunteer</code>) are now edited in their own
              entries under <strong>Admin → Page Content</strong>.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Get In Touch title
                </label>
                <input
                  type="text"
                  value={getNestedString([
                    "bottomSection",
                    "getInTouch",
                    "title",
                  ])}
                  onChange={(e) =>
                    updateNestedString(
                      ["bottomSection", "getInTouch", "title"],
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Upcoming Events title
                </label>
                <input
                  type="text"
                  value={getNestedString([
                    "bottomSection",
                    "upcomingEvents",
                    "title",
                  ])}
                  onChange={(e) =>
                    updateNestedString(
                      ["bottomSection", "upcomingEvents", "title"],
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <PageContentJsonRichText
              label="Upcoming events intro"
              editorId={`${item.slug}-upcoming-events-description`}
              value={getNestedString([
                "bottomSection",
                "upcomingEvents",
                "description",
              ])}
              onChange={(html) =>
                updateNestedString(
                  ["bottomSection", "upcomingEvents", "description"],
                  html,
                )
              }
            />
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Opportunities
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(["opportunities"], (arr) => [
                      ...arr,
                      {
                        id: `item-${arr.length + 1}`,
                        title: "",
                        description: "",
                        items: [],
                        cta: "",
                        href: "",
                        pageHref: "",
                      },
                    ])
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add opportunity
                </button>
              </div>
              <div className="space-y-2">
                {getInvolvedOpportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        value={typeof opp.id === "string" ? opp.id : ""}
                        onChange={(e) =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.map((o, i) =>
                              i === idx ? { ...o, id: e.target.value } : o,
                            ),
                          )
                        }
                        placeholder="id"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <input
                        value={typeof opp.title === "string" ? opp.title : ""}
                        onChange={(e) =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.map((o, i) =>
                              i === idx ? { ...o, title: e.target.value } : o,
                            ),
                          )
                        }
                        placeholder="title"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.filter((_, i) => i !== idx),
                          )
                        }
                        className="justify-self-end rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                    <PageContentJsonRichText
                      label="Description"
                      editorId={`${item.slug}-opportunity-${idx}`}
                      value={
                        typeof opp.description === "string" ? opp.description : ""
                      }
                      onChange={(html) =>
                        updateNestedArray(["opportunities"], (arr) =>
                          arr.map((o, i) =>
                            i === idx ? { ...o, description: html } : o,
                          ),
                        )
                      }
                    />
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <input
                        value={typeof opp.cta === "string" ? opp.cta : ""}
                        onChange={(e) =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.map((o, i) =>
                              i === idx ? { ...o, cta: e.target.value } : o,
                            ),
                          )
                        }
                        placeholder="CTA label"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <input
                        value={typeof opp.href === "string" ? opp.href : ""}
                        onChange={(e) =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.map((o, i) =>
                              i === idx ? { ...o, href: e.target.value } : o,
                            ),
                          )
                        }
                        placeholder="CTA href"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <input
                        value={
                          typeof opp.pageHref === "string" ? opp.pageHref : ""
                        }
                        onChange={(e) =>
                          updateNestedArray(["opportunities"], (arr) =>
                            arr.map((o, i) =>
                              i === idx
                                ? { ...o, pageHref: e.target.value }
                                : o,
                            ),
                          )
                        }
                        placeholder="Detail page href"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Upcoming events list
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(
                      ["bottomSection", "upcomingEvents", "events"],
                      (arr) => [
                        ...arr,
                        {
                          startDate: "",
                          endDate: "",
                          label: "",
                          registerHref: "/events",
                        },
                      ],
                    )
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add event
                </button>
              </div>
              <div className="space-y-2">
                {getInvolvedEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-4"
                  >
                    <input
                      value={
                        typeof evt.startDate === "string" ? evt.startDate : ""
                      }
                      onChange={(e) =>
                        updateNestedArray(
                          ["bottomSection", "upcomingEvents", "events"],
                          (arr) =>
                            arr.map((x, i) =>
                              i === idx
                                ? { ...x, startDate: e.target.value }
                                : x,
                            ),
                        )
                      }
                      placeholder="Start date"
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    />
                    <input
                      value={typeof evt.endDate === "string" ? evt.endDate : ""}
                      onChange={(e) =>
                        updateNestedArray(
                          ["bottomSection", "upcomingEvents", "events"],
                          (arr) =>
                            arr.map((x, i) =>
                              i === idx ? { ...x, endDate: e.target.value } : x,
                            ),
                        )
                      }
                      placeholder="End date"
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    />
                    <input
                      value={typeof evt.label === "string" ? evt.label : ""}
                      onChange={(e) =>
                        updateNestedArray(
                          ["bottomSection", "upcomingEvents", "events"],
                          (arr) =>
                            arr.map((x, i) =>
                              i === idx ? { ...x, label: e.target.value } : x,
                            ),
                        )
                      }
                      placeholder="Label"
                      className="rounded-md border border-border px-2 py-1 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        value={
                          typeof evt.registerHref === "string"
                            ? evt.registerHref
                            : ""
                        }
                        onChange={(e) =>
                          updateNestedArray(
                            ["bottomSection", "upcomingEvents", "events"],
                            (arr) =>
                              arr.map((x, i) =>
                                i === idx
                                  ? { ...x, registerHref: e.target.value }
                                  : x,
                              ),
                          )
                        }
                        placeholder="Register href"
                        className="w-full rounded-md border border-border px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateNestedArray(
                            ["bottomSection", "upcomingEvents", "events"],
                            (arr) => arr.filter((_, i) => i !== idx),
                          )
                        }
                        className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {item.slug === "get-involved-join-us" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Work with us page helper
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["sectionEyebrow", "Section eyebrow"],
                  ["sectionHeading", "Section heading"],
                  ["opportunitiesHeading", "Opportunities heading"],
                  ["panelEyebrow", "Side panel eyebrow"],
                  ["inquiryEyebrow", "Inquiry eyebrow"],
                  ["inquiryHeading", "Inquiry heading"],
                  ["quickContactEyebrow", "Quick contact eyebrow"],
                  ["backLabel", "Back button label"],
                  ["title", "Hero title"],
                  ["subtitle", "Hero subtitle"],
                  ["cta", "Primary CTA label"],
                  ["contactHref", "Primary CTA href"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson[key] === "string"
                        ? String(parsedJson[key])
                        : ""
                    }
                    onChange={(e) => updateJsonField(key, e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PageContentJsonRichText
                label="Intro"
                editorId={`${item.slug}-join-us-intro`}
                value={typeof parsedJson.intro === "string" ? parsedJson.intro : ""}
                onChange={(html) => updateJsonField("intro", html)}
              />
              <PageContentJsonRichText
                label="Description"
                editorId={`${item.slug}-join-us-description`}
                value={
                  typeof parsedJson.description === "string"
                    ? String(parsedJson.description)
                    : ""
                }
                onChange={(html) => updateJsonField("description", html)}
              />
              <PageContentJsonRichText
                label="Side panel text"
                editorId={`${item.slug}-join-us-panel`}
                value={
                  typeof parsedJson.panelText === "string" ? String(parsedJson.panelText) : ""
                }
                onChange={(html) => updateJsonField("panelText", html)}
              />
              <PageContentJsonRichText
                label="Inquiry body"
                editorId={`${item.slug}-join-us-inquiry`}
                value={
                  typeof parsedJson.inquiryBody === "string"
                    ? String(parsedJson.inquiryBody)
                    : ""
                }
                onChange={(html) => updateJsonField("inquiryBody", html)}
              />
              <PageContentJsonRichText
                label="Quick contact body"
                editorId={`${item.slug}-join-us-quick-contact`}
                value={
                  typeof parsedJson.quickContactBody === "string"
                    ? String(parsedJson.quickContactBody)
                    : ""
                }
                onChange={(html) => updateJsonField("quickContactBody", html)}
              />
            </div>
            <PageContentStringListRichText
              label="Opportunities list"
              editorIdPrefix={`${item.slug}-opportunity-items`}
              items={getNestedStringArray(["items"])}
              onChange={(items) => updateNestedStringArray(["items"], items)}
            />
            <div className="rounded-md border border-border bg-white p-3">
              <label className="block text-xs font-medium text-slate-600">
                Right-side panel image
              </label>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Optional. If empty, the hero image is used.
              </p>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={
                    typeof parsedJson.panelImage === "string"
                      ? String(parsedJson.panelImage)
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("panelImage", e.target.value)
                  }
                  placeholder="media-... or /uploads/..."
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget({ nested: ["panelImage"] })}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        {item.slug === "get-involved-partnership" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Partnerships page helper
            </p>
            <p className="text-[11px] text-slate-500">
              Standalone page editor for{" "}
              <code className="rounded bg-slate-100 px-0.5">
                /get-involved/partnership
              </code>
              .
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["sectionEyebrow", "Section eyebrow"],
                  ["sectionHeading", "Section heading"],
                  ["areasHeading", "Pillars heading"],
                  ["footerEyebrow", "Footer eyebrow"],
                  ["footerHeading", "Footer heading"],
                  ["backLabel", "Back button label"],
                  ["programsLabel", "Programs label"],
                  ["title", "Hero title"],
                  ["subtitle", "Hero subtitle"],
                  ["cta", "Primary CTA label"],
                  ["contactHref", "Primary CTA href"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson[key] === "string"
                        ? String(parsedJson[key])
                        : ""
                    }
                    onChange={(e) => updateJsonField(key, e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PageContentJsonRichText
                label="Intro paragraph"
                editorId={`${item.slug}-partnership-intro`}
                value={typeof parsedJson.intro === "string" ? parsedJson.intro : ""}
                onChange={(html) => updateJsonField("intro", html)}
              />
              <PageContentJsonRichText
                label="Supporting paragraph"
                editorId={`${item.slug}-partnership-description`}
                value={
                  typeof parsedJson.description === "string"
                    ? String(parsedJson.description)
                    : ""
                }
                onChange={(html) => updateJsonField("description", html)}
              />
              <PageContentJsonRichText
                label="Footer body"
                editorId={`${item.slug}-partnership-footer`}
                value={
                  typeof parsedJson.footerBody === "string"
                    ? String(parsedJson.footerBody)
                    : ""
                }
                onChange={(html) => updateJsonField("footerBody", html)}
              />
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Partnership pillars carousel cards
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(["cards"], (arr) => [
                      ...arr,
                      {
                        id: arr.length + 1,
                        title: "",
                        description: "",
                        backgroundImage: "",
                      },
                    ])
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add card
                </button>
              </div>
              <div className="space-y-2">
                {getNestedArray(["cards"]).map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={typeof card.title === "string" ? card.title : ""}
                        onChange={(e) =>
                          updateNestedArray(["cards"], (arr) =>
                            arr.map((x, i) =>
                              i === idx ? { ...x, title: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Pillar title (e.g., Strategic institutional partnerships)"
                        className="rounded-md border border-border px-2 py-1.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          value={
                            typeof card.backgroundImage === "string"
                              ? card.backgroundImage
                              : ""
                          }
                          onChange={(e) =>
                            updateNestedArray(["cards"], (arr) =>
                              arr.map((x, i) =>
                                i === idx
                                  ? { ...x, backgroundImage: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="Background image"
                          className="w-full rounded-md border border-border px-2 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPickerTarget({
                              nested: ["cards", String(idx), "backgroundImage"],
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                          title="Pick from Media Library"
                        >
                          <ImagePlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <PageContentJsonRichText
                      label="Pillar description"
                      editorId={`${item.slug}-partnership-pillar-${idx}`}
                      value={
                        typeof card.description === "string" ? card.description : ""
                      }
                      onChange={(html) =>
                        updateNestedArray(["cards"], (arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, description: html } : x,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {item.slug === "get-involved-volunteer" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Volunteer page helper
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["title", "Hero title"],
                  ["subtitle", "Hero subtitle"],
                  ["sectionEyebrow", "Section eyebrow"],
                  ["sectionHeading", "Section heading"],
                  ["impactEyebrow", "Impact card eyebrow"],
                  ["impactText", "Impact card text"],
                  ["waysHeading", "Ways heading"],
                  ["readyEyebrow", "Ready eyebrow"],
                  ["readyHeading", "Ready heading"],
                  ["backLabel", "Back button label"],
                  ["questionsLabel", "Questions label"],
                  ["cta", "Primary CTA label"],
                  ["applicationHref", "Primary CTA href"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson[key] === "string"
                        ? String(parsedJson[key])
                        : ""
                    }
                    onChange={(e) => updateJsonField(key, e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PageContentJsonRichText
                label="Intro"
                editorId={`${item.slug}-volunteer-intro`}
                value={typeof parsedJson.intro === "string" ? parsedJson.intro : ""}
                onChange={(html) => updateJsonField("intro", html)}
              />
              <PageContentJsonRichText
                label="Description"
                editorId={`${item.slug}-volunteer-description`}
                value={
                  typeof parsedJson.description === "string"
                    ? String(parsedJson.description)
                    : ""
                }
                onChange={(html) => updateJsonField("description", html)}
              />
            </div>
            <PageContentStringListRichText
              label="Ways to contribute list"
              editorIdPrefix={`${item.slug}-volunteer-items`}
              items={getNestedStringArray(["items"])}
              onChange={(items) => updateNestedStringArray(["items"], items)}
            />
            <div className="rounded-md border border-border bg-white p-3">
              <label className="block text-xs font-medium text-slate-600">
                Right-side impact panel image
              </label>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Optional. If empty, the hero image is used.
              </p>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={
                    typeof parsedJson.impactPanelImage === "string"
                      ? String(parsedJson.impactPanelImage)
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("impactPanelImage", e.target.value)
                  }
                  placeholder="media-... or /uploads/..."
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPickerTarget({ nested: ["impactPanelImage"] })
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  title="Pick from Media Library"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        {item.slug === "events" && (
          <div className="mb-3 grid gap-4">
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Main listing (/events)
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Body copy above the filters uses the{" "}
                <strong className="font-medium text-slate-800">Intro</strong>{" "}
                field at the top of this form (stored as{" "}
                <code className="rounded bg-white px-1 ring-1 ring-border">
                  intro
                </code>{" "}
                in page JSON). Blank lines create separate paragraphs. Category
                tabs read labels from{" "}
                <code className="rounded bg-white px-1 ring-1 ring-border">
                  eventCategoryFilters
                </code>
                ; matching uses the event’s Category / event type strings (e.g.{" "}
                <code className="text-[0.65rem]">summit</code>,{" "}
                <code className="text-[0.65rem]">webinar</code>,{" "}
                <code className="text-[0.65rem]">roundtable</code>
                ).
              </p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Past events archive (public /events/past)
              </p>
              <p className="text-xs text-slate-600">
                Copy for the archive filters, search, and list UI. Stored in{" "}
                <code className="rounded bg-white px-1 ring-1 ring-border">
                  content_json.pastArchive
                </code>{" "}
                and the empty-state line in{" "}
                <code className="rounded bg-white px-1 ring-1 ring-border">
                  content_json.gridEmpty.past
                </code>
                . The route hero uses the main Hero fields on this page when
                set.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["title", "In-page archive heading"],
                    ["subtitle", "In-page archive intro"],
                    ["searchPlaceholder", "Search placeholder"],
                    ["filterBy", "Filter section title"],
                    ["eventCheckboxLabel", "Event checkbox label"],
                    ["topicLabel", "Topic filter (dropdown label)"],
                    ["regionLabel", "Region filter (dropdown label)"],
                    [
                      "listFilterPlaceholder",
                      "Placeholder: topic/region list filter",
                    ],
                    ["dateHeading", "Date filter heading"],
                    ["dateAll", "Date option: All dates"],
                    ["date30d", "Date option: Past 30 days"],
                    ["date6m", "Date option: Past 6 months"],
                    ["date1y", "Date option: Last year"],
                    ["resultsFoundSuffix", "Suffix after result count"],
                    ["showMore", "“Show more” button label"],
                    [
                      "resultsAtATime",
                      "Pagination helper (e.g. results at a time)",
                    ],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={getNestedString(["pastArchive", key])}
                      onChange={(e) =>
                        updateNestedString(["pastArchive", key], e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Topic empty state
                  </label>
                  <textarea
                    value={getNestedString(["pastArchive", "topicEmpty"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["pastArchive", "topicEmpty"],
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Region modal empty state (no location/venue on events)
                  </label>
                  <textarea
                    value={getNestedString(["pastArchive", "filterComingSoon"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["pastArchive", "filterComingSoon"],
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Empty results (no matching past events)
                </label>
                <textarea
                  value={getNestedString(["gridEmpty", "past"])}
                  onChange={(e) =>
                    updateNestedString(["gridEmpty", "past"], e.target.value)
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
        {item.slug === "app-summit" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              APP Summit helper
            </p>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-3 text-sm text-slate-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
                checked={parsedJson.programmeAgendaVisible !== false}
                onChange={(e) =>
                  updateJsonFieldBoolean(
                    "programmeAgendaVisible",
                    e.target.checked,
                  )
                }
              />
              <span>
                <span className="font-medium text-slate-900">
                  Show Programme / APPS agenda
                </span>
                <span className="mt-1 block text-xs font-normal text-slate-600">
                  Uncheck to hide the day tabs and schedule block on the public
                  site. The rest of the APP Summit page stays visible.
                </span>
              </span>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  About section eyebrow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.aboutSectionEyebrow === "string"
                      ? parsedJson.aboutSectionEyebrow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("aboutSectionEyebrow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  About section heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.aboutSectionHeading === "string"
                      ? parsedJson.aboutSectionHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("aboutSectionHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Label: Date (detail row)
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.detailLabelDate === "string"
                      ? parsedJson.detailLabelDate
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("detailLabelDate", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Label: Location
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.detailLabelLocation === "string"
                      ? parsedJson.detailLabelLocation
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("detailLabelLocation", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Label: Participants
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.detailLabelParticipants === "string"
                      ? parsedJson.detailLabelParticipants
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("detailLabelParticipants", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Programme section eyebrow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.programmeEyebrow === "string"
                      ? parsedJson.programmeEyebrow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("programmeEyebrow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Day tab prefix
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.dayTabPrefix === "string"
                      ? parsedJson.dayTabPrefix
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("dayTabPrefix", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  placeholder="e.g. Day (space after if needed)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Contact section CTA label
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.contactSectionCtaLabel === "string"
                      ? parsedJson.contactSectionCtaLabel
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("contactSectionCtaLabel", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Hero image alt text
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.heroImageAlt === "string"
                      ? parsedJson.heroImageAlt
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("heroImageAlt", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Highlights heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.highlightsHeading === "string"
                      ? parsedJson.highlightsHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("highlightsHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Key focus heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.focusSectionHeading === "string"
                      ? parsedJson.focusSectionHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("focusSectionHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  APPS 2026 heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.summit2026Heading === "string"
                      ? parsedJson.summit2026Heading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("summit2026Heading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Expected outcomes heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.outcomesHeading === "string"
                      ? parsedJson.outcomesHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("outcomesHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Structure heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.structureHeading === "string"
                      ? parsedJson.structureHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("structureHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Sponsorship heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sponsorshipHeading === "string"
                      ? parsedJson.sponsorshipHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sponsorshipHeading", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                APP Summit Images
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Key focus background image",
                    key: "keyFocusBgImage",
                  },
                  {
                    label: "Sponsorship background image",
                    key: "sponsorshipBgImage",
                  },
                  ...Array.from({ length: 10 }).map((_, i) => ({
                    label: `Highlights image ${i + 1}`,
                    key: `highlightsImage${i + 1}`,
                  })),
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600">
                      {field.label}
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={
                          typeof parsedJson[field.key] === "string"
                            ? String(parsedJson[field.key])
                            : ""
                        }
                        onChange={(e) =>
                          updateJsonField(field.key, e.target.value)
                        }
                        placeholder="media-... or /uploads/..."
                        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPickerTarget({ nested: [field.key] })}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        title="Pick from Media Library"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PageContentStringListRichText
                label="Key focus areas"
                editorIdPrefix={`${item.slug}-key-focus-areas`}
                items={parseJsonStringList(parsedJson.keyFocusAreas)}
                onChange={(keyFocusAreas) =>
                  updateJsonObject({ ...parsedJson, keyFocusAreas })
                }
              />
              <PageContentStringListRichText
                label="Expected outcomes"
                editorIdPrefix={`${item.slug}-expected-outcomes`}
                items={parseJsonStringList(parsedJson.expectedOutcomes)}
                onChange={(expectedOutcomes) =>
                  updateJsonObject({ ...parsedJson, expectedOutcomes })
                }
              />
            </div>
            <PageContentStringListRichText
              label="Sponsorship points"
              editorIdPrefix={`${item.slug}-sponsorship-points`}
              items={parseJsonStringList(parsedJson.sponsorshipPoints)}
              onChange={(sponsorshipPoints) =>
                updateJsonObject({ ...parsedJson, sponsorshipPoints })
              }
            />
            <PageContentJsonRichText
              label="About intro (APPS vision & aims)"
              editorId={`${item.slug}-app-summit-intro`}
              value={
                typeof parsedJson.intro === "string" ? parsedJson.intro : ""
              }
              onChange={(html) => updateJsonField("intro", html)}
            />
            <PageContentJsonRichText
              label="About section body"
              editorId={`${item.slug}-apps-about-body`}
              value={richTextFieldInitial(
                parsedJson.aboutBody,
                parsedJson.aboutParagraphs,
              )}
              onChange={(html) => updateJsonField("aboutBody", html)}
              hint="Replaces legacy line-based paragraphs when saved."
            />
            <PageContentJsonRichText
              label="Inaugural edition paragraph"
              editorId={`${item.slug}-apps-inaugural`}
              value={
                typeof parsedJson.inauguralParagraph === "string"
                  ? parsedJson.inauguralParagraph
                  : ""
              }
              onChange={(html) => updateJsonField("inauguralParagraph", html)}
            />
            <PageContentJsonRichText
              label="APPS 2026 section body"
              editorId={`${item.slug}-apps-summit2026-body`}
              value={richTextFieldInitial(
                parsedJson.summit2026Body,
                parsedJson.summit2026Paragraphs,
              )}
              onChange={(html) => updateJsonField("summit2026Body", html)}
              hint="Replaces legacy line-based paragraphs when saved."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Date
                </label>
                <input
                  type="text"
                  value={getNestedString(["details", "date"])}
                  onChange={(e) =>
                    updateNestedString(["details", "date"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Location
                </label>
                <input
                  type="text"
                  value={getNestedString(["details", "location"])}
                  onChange={(e) =>
                    updateNestedString(["details", "location"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Participants
                </label>
                <input
                  type="text"
                  value={getNestedString(["details", "participants"])}
                  onChange={(e) =>
                    updateNestedString(
                      ["details", "participants"],
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Registration card title
                </label>
                <input
                  type="text"
                  value={getNestedString(["registration", "title"])}
                  onChange={(e) =>
                    updateNestedString(["registration", "title"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Registration CTA label
                </label>
                <input
                  type="text"
                  value={getNestedString(["registration", "cta"])}
                  onChange={(e) =>
                    updateNestedString(["registration", "cta"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Registration card subtitle"
                  editorId={`${item.slug}-registration-subtitle`}
                  value={getNestedString(["registration", "subtitle"])}
                  onChange={(html) =>
                    updateNestedString(["registration", "subtitle"], html)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Registration CTA href
                </label>
                <input
                  type="text"
                  value={getNestedString(["registration", "href"])}
                  onChange={(e) =>
                    updateNestedString(["registration", "href"], e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <PageContentJsonRichText
                  label="Registration card footnote"
                  editorId={`${item.slug}-registration-footnote`}
                  value={getNestedString(["registration", "footnote"])}
                  onChange={(html) =>
                    updateNestedString(["registration", "footnote"], html)
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Contact note
              </label>
              <textarea
                value={
                  typeof parsedJson.contactNote === "string"
                    ? parsedJson.contactNote
                    : ""
                }
                onChange={(e) => updateJsonField("contactNote", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Structure cards
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    day: "One",
                    labelKey: "dayOneLabel",
                    titleKey: "dayOneTitle",
                    bodyKey: "dayOneBody",
                  },
                  {
                    day: "Two",
                    labelKey: "dayTwoLabel",
                    titleKey: "dayTwoTitle",
                    bodyKey: "dayTwoBody",
                  },
                  {
                    day: "Three",
                    labelKey: "dayThreeLabel",
                    titleKey: "dayThreeTitle",
                    bodyKey: "dayThreeBody",
                  },
                ].map((card) => (
                  <div
                    key={card.day}
                    className="rounded-md border border-border p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Day {card.day}
                    </p>
                    <label className="mt-2 block text-xs font-medium text-slate-600">
                      Label
                    </label>
                    <input
                      type="text"
                      value={
                        typeof parsedJson[card.labelKey] === "string"
                          ? String(parsedJson[card.labelKey])
                          : ""
                      }
                      onChange={(e) =>
                        updateJsonField(card.labelKey, e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                    <label className="mt-2 block text-xs font-medium text-slate-600">
                      Title
                    </label>
                    <input
                      type="text"
                      value={
                        typeof parsedJson[card.titleKey] === "string"
                          ? String(parsedJson[card.titleKey])
                          : ""
                      }
                      onChange={(e) =>
                        updateJsonField(card.titleKey, e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                    <PageContentJsonRichText
                      label="Description"
                      editorId={`${item.slug}-${card.bodyKey}`}
                      value={
                        typeof parsedJson[card.bodyKey] === "string"
                          ? String(parsedJson[card.bodyKey])
                          : ""
                      }
                      onChange={(html) => updateJsonField(card.bodyKey, html)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Sponsorship & final CTA
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Sponsorship intro"
                    editorId={`${item.slug}-sponsorship-intro`}
                    value={
                      typeof parsedJson.sponsorshipIntro === "string"
                        ? parsedJson.sponsorshipIntro
                        : ""
                    }
                    onChange={(html) => updateJsonField("sponsorshipIntro", html)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Final CTA heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.finalCtaHeading === "string"
                        ? parsedJson.finalCtaHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("finalCtaHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Final address line
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.finalAddress === "string"
                        ? parsedJson.finalAddress
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("finalAddress", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Final CTA body"
                    editorId={`${item.slug}-apps-final-cta-body`}
                    value={
                      typeof parsedJson.finalCtaBody === "string"
                        ? parsedJson.finalCtaBody
                        : ""
                    }
                    onChange={(html) => updateJsonField("finalCtaBody", html)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Final participants note
                  </label>
                  <textarea
                    value={
                      typeof parsedJson.finalParticipantsNote === "string"
                        ? parsedJson.finalParticipantsNote
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("finalParticipantsNote", e.target.value)
                    }
                    rows={3}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Agenda days removed for app-summit per request */}
          </div>
        )}
        {item.slug === "aypf" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              AYPF helper
            </p>
            <p className="text-xs text-slate-500">
              Hero image uses the shared field below. List fields: one item per
              line.
            </p>
            {/* <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Breadcrumb label (last segment)
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.breadcrumbLabel === "string"
                      ? parsedJson.breadcrumbLabel
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("breadcrumbLabel", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Hero image alt
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.heroImageAlt === "string"
                      ? parsedJson.heroImageAlt
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("heroImageAlt", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Page title (hero)
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.title === "string" ? parsedJson.title : ""
                  }
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Hero subtitle
                </label>
                <textarea
                  value={
                    typeof parsedJson.subtitle === "string"
                      ? parsedJson.subtitle
                      : ""
                  }
                  onChange={(e) => updateJsonField("subtitle", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div> */}
            {/* <div>
              <label className="block text-xs font-medium text-slate-600">
                Lead paragraph
              </label>
              <textarea
                value={
                  typeof parsedJson.leadParagraph === "string"
                    ? parsedJson.leadParagraph
                    : ""
                }
                onChange={(e) =>
                  updateJsonField("leadParagraph", e.target.value)
                }
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div> */}
            {/* <div>
              <label className="block text-xs font-medium text-slate-600">
                Launch paragraph
              </label>
              <textarea
                value={
                  typeof parsedJson.launchParagraph === "string"
                    ? parsedJson.launchParagraph
                    : ""
                }
                onChange={(e) =>
                  updateJsonField("launchParagraph", e.target.value)
                }
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div> */}
            {/* <div>
              <label className="block text-xs font-medium text-slate-600">
                Theme (quoted)
              </label>
              <textarea
                value={
                  typeof parsedJson.themeQuote === "string"
                    ? parsedJson.themeQuote
                    : ""
                }
                onChange={(e) => updateJsonField("themeQuote", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Inaugural paragraph
              </label>
              <textarea
                value={
                  typeof parsedJson.inauguralParagraph === "string"
                    ? parsedJson.inauguralParagraph
                    : ""
                }
                onChange={(e) =>
                  updateJsonField("inauguralParagraph", e.target.value)
                }
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div> */}
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                AYPF Images
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Focus section background image",
                    key: "focusSectionBgImage",
                  },
                  {
                    label: "Strategic priorities background image",
                    key: "strategicPrioritiesBgImage",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600">
                      {field.label}
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={
                          typeof parsedJson[field.key] === "string"
                            ? String(parsedJson[field.key])
                            : ""
                        }
                        onChange={(e) =>
                          updateJsonField(field.key, e.target.value)
                        }
                        placeholder="media-... or /uploads/..."
                        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPickerTarget({ nested: [field.key] })}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        title="Pick from Media Library"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Purpose section
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["purposeSection", "eyebrow"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["purposeSection", "eyebrow"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["purposeSection", "heading"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["purposeSection", "heading"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-600">
                  Intro
                </label>
                <textarea
                  value={getNestedString(["purposeSection", "intro"])}
                  onChange={(e) =>
                    updateNestedString(
                      ["purposeSection", "intro"],
                      e.target.value,
                    )
                  }
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-2">
                <PageContentStringListRichText
                  label="Focus areas"
                  editorIdPrefix={`${item.slug}-purpose-focus-areas`}
                  items={getNestedStringArray(["purposeSection", "focusAreas"])}
                  onChange={(items) =>
                    updateNestedStringArray(["purposeSection", "focusAreas"], items)
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Legitimacy paragraph
              </label>
              <textarea
                value={
                  typeof parsedJson.legitimacyParagraph === "string"
                    ? parsedJson.legitimacyParagraph
                    : ""
                }
                onChange={(e) =>
                  updateJsonField("legitimacyParagraph", e.target.value)
                }
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                From dialogue to action
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["actionSection", "eyebrow"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["actionSection", "eyebrow"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["actionSection", "heading"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["actionSection", "heading"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-600">
                  Intro
                </label>
                <textarea
                  value={getNestedString(["actionSection", "intro"])}
                  onChange={(e) =>
                    updateNestedString(
                      ["actionSection", "intro"],
                      e.target.value,
                    )
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-2">
                <PageContentStringListRichText
                  label="Discussion points"
                  editorIdPrefix={`${item.slug}-action-discussion-points`}
                  items={getNestedStringArray([
                    "actionSection",
                    "discussionPoints",
                  ])}
                  onChange={(items) =>
                    updateNestedStringArray(
                      ["actionSection", "discussionPoints"],
                      items,
                    )
                  }
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Looking ahead
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["lookingAheadSection", "eyebrow"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["lookingAheadSection", "eyebrow"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["lookingAheadSection", "heading"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["lookingAheadSection", "heading"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-600">
                  Intro
                </label>
                <textarea
                  value={getNestedString(["lookingAheadSection", "intro"])}
                  onChange={(e) =>
                    updateNestedString(
                      ["lookingAheadSection", "intro"],
                      e.target.value,
                    )
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-2">
                <PageContentStringListRichText
                  label="Topics"
                  editorIdPrefix={`${item.slug}-looking-ahead-topics`}
                  items={getNestedStringArray(["lookingAheadSection", "topics"])}
                  onChange={(items) =>
                    updateNestedStringArray(["lookingAheadSection", "topics"], items)
                  }
                />
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-600">
                  Invitation note
                </label>
                <textarea
                  value={getNestedString([
                    "lookingAheadSection",
                    "invitationNote",
                  ])}
                  onChange={(e) =>
                    updateNestedString(
                      ["lookingAheadSection", "invitationNote"],
                      e.target.value,
                    )
                  }
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Register
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["registerSection", "heading"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["registerSection", "heading"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Intro
                  </label>
                  <textarea
                    value={getNestedString(["registerSection", "intro"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["registerSection", "intro"],
                        e.target.value,
                      )
                    }
                    rows={2}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    CTA label
                  </label>
                  <input
                    type="text"
                    value={getNestedString(["registerSection", "ctaLabel"])}
                    onChange={(e) =>
                      updateNestedString(
                        ["registerSection", "ctaLabel"],
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Registration URL
                  </label>
                  <input
                    type="url"
                    value={getNestedString([
                      "registerSection",
                      "registrationHref",
                    ])}
                    onChange={(e) =>
                      updateNestedString(
                        ["registerSection", "registrationHref"],
                        e.target.value,
                      )
                    }
                    placeholder="https://…"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Benefits list (one per line)
                  </label>
                  <textarea
                    value={getNestedStringArray([
                      "registerSection",
                      "benefits",
                    ]).join("\n")}
                    onChange={(e) =>
                      updateNestedStringArray(
                        ["registerSection", "benefits"],
                        e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    rows={4}
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
            </div> */}
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Main section text (new)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Top section eyebrow
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.aboutEyebrow === "string"
                        ? parsedJson.aboutEyebrow
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("aboutEyebrow", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Top section heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.aboutHeading === "string"
                        ? parsedJson.aboutHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("aboutHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Top section body"
                    editorId={`${item.slug}-aypf-about-body`}
                    value={richTextFieldInitial(
                      parsedJson.aboutBody,
                      parsedJson.aboutParagraphs,
                    )}
                    onChange={(html) => updateJsonField("aboutBody", html)}
                    hint="Replaces legacy line-based paragraphs when saved."
                  />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Sidebar register card
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Card heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerCardHeading === "string"
                        ? parsedJson.registerCardHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerCardHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Card CTA label
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerCardCtaLabel === "string"
                        ? parsedJson.registerCardCtaLabel
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerCardCtaLabel", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Card body"
                    editorId={`${item.slug}-aypf-register-card-body`}
                    value={
                      typeof parsedJson.registerCardBody === "string"
                        ? parsedJson.registerCardBody
                        : ""
                    }
                    onChange={(html) =>
                      updateJsonField("registerCardBody", html)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Focus, objectives and priorities (new)
              </p>
              <div className="grid gap-3">
                <label className="block text-xs font-medium text-slate-600">
                  Focus heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.focusHeading === "string"
                      ? parsedJson.focusHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("focusHeading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentJsonRichText
                  label="Focus intro"
                  editorId={`${item.slug}-aypf-focus-intro`}
                  value={
                    typeof parsedJson.focusIntro === "string"
                      ? parsedJson.focusIntro
                      : ""
                  }
                  onChange={(html) => updateJsonField("focusIntro", html)}
                />
                <PageContentStringListRichText
                  label="Focus points"
                  editorIdPrefix={`${item.slug}-aypf-focus-areas`}
                  items={parseJsonStringList(parsedJson.focusAreas)}
                  onChange={(focusAreas) =>
                    updateJsonObject({ ...parsedJson, focusAreas })
                  }
                />
                <label className="block text-xs font-medium text-slate-600">
                  AYPF 2026 heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.summit2026Heading === "string"
                      ? parsedJson.summit2026Heading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("summit2026Heading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentJsonRichText
                  label="AYPF 2026 body"
                  editorId={`${item.slug}-aypf-summit2026`}
                  value={
                    typeof parsedJson.summit2026Body === "string"
                      ? parsedJson.summit2026Body
                      : typeof parsedJson.summit2026Paragraphs === "string"
                        ? parsedJson.summit2026Paragraphs
                        : ""
                  }
                  onChange={(html) => updateJsonField("summit2026Body", html)}
                />
                <label className="block text-xs font-medium text-slate-600">
                  Objectives heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.objectivesHeading === "string"
                      ? parsedJson.objectivesHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("objectivesHeading", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <PageContentStringListRichText
                  label="Objectives points"
                  editorIdPrefix={`${item.slug}-aypf-objectives`}
                  items={parseJsonStringList(parsedJson.objectives)}
                  onChange={(objectives) =>
                    updateJsonObject({ ...parsedJson, objectives })
                  }
                />
                <label className="block text-xs font-medium text-slate-600">
                  Strategic priorities heading
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.strategicPrioritiesHeading === "string"
                      ? parsedJson.strategicPrioritiesHeading
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField(
                      "strategicPrioritiesHeading",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-border p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Priority {idx + 1}
                    </p>
                    <label className="mt-2 block text-xs font-medium text-slate-600">
                      Title
                    </label>
                    <input
                      type="text"
                      value={getNestedString([
                        "strategicPriorities",
                        String(idx),
                        "title",
                      ])}
                      onChange={(e) =>
                        updateNestedString(
                          ["strategicPriorities", String(idx), "title"],
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                    <PageContentJsonRichText
                      label="Description"
                      editorId={`${item.slug}-aypf-priority-${idx}`}
                      value={getNestedString([
                        "strategicPriorities",
                        String(idx),
                        "body",
                      ])}
                      onChange={(html) =>
                        updateNestedString(
                          ["strategicPriorities", String(idx), "body"],
                          html,
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Register section (new quick fields)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerHeading === "string"
                        ? parsedJson.registerHeading
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerHeading", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    CTA label
                  </label>
                  <input
                    type="text"
                    value={
                      typeof parsedJson.registerCtaLabel === "string"
                        ? parsedJson.registerCtaLabel
                        : ""
                    }
                    onChange={(e) =>
                      updateJsonField("registerCtaLabel", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <PageContentJsonRichText
                    label="Intro line"
                    editorId={`${item.slug}-aypf-register-intro`}
                    value={
                      typeof parsedJson.registerIntro === "string"
                        ? parsedJson.registerIntro
                        : ""
                    }
                    onChange={(html) => updateJsonField("registerIntro", html)}
                  />
                </div>
                <PageContentStringListRichText
                  label="Benefits"
                  editorIdPrefix={`${item.slug}-aypf-register-benefits`}
                  items={parseJsonStringList(parsedJson.registerBenefits)}
                  onChange={(registerBenefits) =>
                    updateJsonObject({ ...parsedJson, registerBenefits })
                  }
                />
              </div>
            </div>
          </div>
        )}
        {item.slug === "applications" && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Applications page helper
            </p>
            <p className="text-xs text-slate-500">
              Hero and intro also live here. Optional{" "}
              <code className="rounded bg-white px-1">fieldLabelOverrides</code>{" "}
              in the JSON below: object mapping field{" "}
              <code className="rounded bg-white px-1">name</code> to custom
              labels (e.g.{" "}
              <code className="rounded bg-white px-1">{`{"fullName":"Your name"}`}</code>
              ).
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Hero image alt
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.heroImageAlt === "string"
                      ? parsedJson.heroImageAlt
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("heroImageAlt", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Breadcrumb: Home
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.breadcrumbHome === "string"
                      ? parsedJson.breadcrumbHome
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("breadcrumbHome", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Breadcrumb: Get involved
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.breadcrumbGetInvolved === "string"
                      ? parsedJson.breadcrumbGetInvolved
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("breadcrumbGetInvolved", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Breadcrumb: Volunteer
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.breadcrumbVolunteer === "string"
                      ? parsedJson.breadcrumbVolunteer
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("breadcrumbVolunteer", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Breadcrumb: Current page
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.breadcrumbApplication === "string"
                      ? parsedJson.breadcrumbApplication
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("breadcrumbApplication", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Apply eyebrow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.formEyebrow === "string"
                      ? parsedJson.formEyebrow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("formEyebrow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Form card title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.formCardTitle === "string"
                      ? parsedJson.formCardTitle
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("formCardTitle", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section: Personal
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionPersonal === "string"
                      ? parsedJson.sectionPersonal
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sectionPersonal", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section: Experience
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionExperience === "string"
                      ? parsedJson.sectionExperience
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sectionExperience", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Section: Motivation
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.sectionMotivation === "string"
                      ? parsedJson.sectionMotivation
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("sectionMotivation", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Application type label
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.applicationTypeLabel === "string"
                      ? parsedJson.applicationTypeLabel
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("applicationTypeLabel", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Option: Volunteer
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.optionVolunteer === "string"
                      ? parsedJson.optionVolunteer
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("optionVolunteer", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Option: Staff
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.optionStaff === "string"
                      ? parsedJson.optionStaff
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("optionStaff", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Option: Fellow
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.optionFellow === "string"
                      ? parsedJson.optionFellow
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("optionFellow", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Availability placeholder
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.availabilityPlaceholder === "string"
                      ? parsedJson.availabilityPlaceholder
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("availabilityPlaceholder", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Availability: Full-time
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.availabilityFullTime === "string"
                      ? parsedJson.availabilityFullTime
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("availabilityFullTime", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Availability: Part-time
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.availabilityPartTime === "string"
                      ? parsedJson.availabilityPartTime
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("availabilityPartTime", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Availability: Flexible
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.availabilityFlexible === "string"
                      ? parsedJson.availabilityFlexible
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("availabilityFlexible", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Submit (idle)
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.submitIdle === "string"
                      ? parsedJson.submitIdle
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("submitIdle", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Submit (sending)
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.submitSending === "string"
                      ? parsedJson.submitSending
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("submitSending", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Success message
                </label>
                <textarea
                  value={
                    typeof parsedJson.successMessage === "string"
                      ? parsedJson.successMessage
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("successMessage", e.target.value)
                  }
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Email warning intro (before programs email)
                </label>
                <textarea
                  value={
                    typeof parsedJson.emailWarnIntro === "string"
                      ? parsedJson.emailWarnIntro
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("emailWarnIntro", e.target.value)
                  }
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Generic error fallback
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.errorFallback === "string"
                      ? parsedJson.errorFallback
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("errorFallback", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <PageContentJsonRichText
              label="Apply intro (above form)"
              editorId={`${item.slug}-apply-intro`}
              value={quickValues.applyIntro}
              onChange={(html) => updateJsonField("applyIntro", html)}
            />
          </div>
        )}
        {/* {(item.slug === "privacy-policy" ||
          item.slug === "terms-of-service") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Legal page helper
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Page title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.title === "string" ? parsedJson.title : ""
                  }
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Last updated
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.lastUpdated === "string"
                      ? parsedJson.lastUpdated
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("lastUpdated", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Sections
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(["sections"], (arr) => [
                      ...arr,
                      { title: "", content: "", items: [] },
                    ])
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add section
                </button>
              </div>
              <div className="space-y-2">
                {legalSections.map((sec, idx) =>
                  (() => {
                    const isCollapsed = collapsedSections.includes(idx);
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDragLegalIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragLegalIdx !== null)
                            reorderNestedArray(["sections"], dragLegalIdx, idx);
                          setDragLegalIdx(null);
                        }}
                        onDragEnd={() => setDragLegalIdx(null)}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleCollapsedSection(idx)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                            {typeof sec.title === "string" && sec.title
                              ? sec.title
                              : `Section ${idx + 1}`}
                          </button>
                        </div>
                        {!isCollapsed && (
                          <>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 sm:col-span-2">
                                <GripVertical className="h-3.5 w-3.5" /> Drag
                                section to reorder
                              </div>
                              <input
                                value={
                                  typeof sec.title === "string" ? sec.title : ""
                                }
                                onChange={(e) =>
                                  updateNestedArray(["sections"], (arr) =>
                                    arr.map((s, i) =>
                                      i === idx
                                        ? { ...s, title: e.target.value }
                                        : s,
                                    ),
                                  )
                                }
                                placeholder="Section title"
                                className="rounded-md border border-border px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateNestedArray(["sections"], (arr) =>
                                    arr.filter((_, i) => i !== idx),
                                  )
                                }
                                className="justify-self-end rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                              >
                                Remove
                              </button>
                              <div className="justify-self-end flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderNestedArray(
                                      ["sections"],
                                      idx,
                                      idx - 1,
                                    )
                                  }
                                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                  title="Move section up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderNestedArray(
                                      ["sections"],
                                      idx,
                                      idx + 1,
                                    )
                                  }
                                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                  title="Move section down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={
                                typeof sec.content === "string"
                                  ? sec.content
                                  : ""
                              }
                              onChange={(e) =>
                                updateNestedArray(["sections"], (arr) =>
                                  arr.map((s, i) =>
                                    i === idx
                                      ? { ...s, content: e.target.value }
                                      : s,
                                  ),
                                )
                              }
                              rows={3}
                              placeholder="Section content"
                              className="mt-2 w-full rounded-md border border-border px-2 py-1 text-xs"
                            />
                            <PageContentStringListRichText
                              label="Bullet items"
                              editorIdPrefix={`legal-section-${idx}-items`}
                              items={parseJsonStringList(sec.items)}
                              onChange={(items) =>
                                updateNestedArray(["sections"], (arr) =>
                                  arr.map((s, i) =>
                                    i === idx ? { ...s, items } : s,
                                  ),
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    );
                  })(),
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              For complex privacy subsections, use the advanced editor below for
              full control.
            </p>
          </div>
        )} */}
        {(item.slug === "privacy-policy" ||
          item.slug === "terms-of-service") && (
          <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Legal page helper
            </p>

            {/* Page Title & Last Updated */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Page title
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.title === "string" ? parsedJson.title : ""
                  }
                  onChange={(e) => updateJsonField("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Last updated
                </label>
                <input
                  type="text"
                  value={
                    typeof parsedJson.lastUpdated === "string"
                      ? parsedJson.lastUpdated
                      : ""
                  }
                  onChange={(e) =>
                    updateJsonField("lastUpdated", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* NEW SECTION: Card Section Visuals */}
            <div className="rounded-md border border-border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                Card Section Visuals
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { key: "sectionVisualA", label: "Fair Use Image" },
                  {
                    key: "sectionVisualB",
                    label: "User Responsibilities Image",
                  },
                  { key: "sectionVisualC", label: "Legal Clarity Image" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-medium text-slate-500">
                      {label}
                    </label>
                    <div className="mt-1 flex gap-1">
                      <input
                        type="text"
                        value={
                          typeof parsedJson[key] === "string"
                            ? String(parsedJson[key])
                            : ""
                        }
                        onChange={(e) => updateJsonField(key, e.target.value)}
                        placeholder="media-..."
                        className="w-full rounded-md border border-border bg-white px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setPickerTarget({ nested: [key] })}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        title="Pick from Media Library"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections Collection */}
            <div className="rounded-md border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Sections
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateNestedArray(["sections"], (arr) => [
                      ...arr,
                      { title: "", content: "", items: [] },
                    ])
                  }
                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  + Add section
                </button>
              </div>
              <div className="space-y-2">
                {legalSections.map((sec, idx) =>
                  (() => {
                    const isCollapsed = collapsedSections.includes(idx);
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDragLegalIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragLegalIdx !== null)
                            reorderNestedArray(["sections"], dragLegalIdx, idx);
                          setDragLegalIdx(null);
                        }}
                        onDragEnd={() => setDragLegalIdx(null)}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleCollapsedSection(idx)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                            {typeof sec.title === "string" && sec.title
                              ? sec.title
                              : `Section ${idx + 1}`}
                          </button>
                        </div>
                        {!isCollapsed && (
                          <>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 sm:col-span-2">
                                <GripVertical className="h-3.5 w-3.5" /> Drag
                                section to reorder
                              </div>
                              <input
                                value={
                                  typeof sec.title === "string" ? sec.title : ""
                                }
                                onChange={(e) =>
                                  updateNestedArray(["sections"], (arr) =>
                                    arr.map((s, i) =>
                                      i === idx
                                        ? { ...s, title: e.target.value }
                                        : s,
                                    ),
                                  )
                                }
                                placeholder="Section title"
                                className="rounded-md border border-border px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateNestedArray(["sections"], (arr) =>
                                    arr.filter((_, i) => i !== idx),
                                  )
                                }
                                className="justify-self-end rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                              >
                                Remove
                              </button>
                              <div className="justify-self-end flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderNestedArray(
                                      ["sections"],
                                      idx,
                                      idx - 1,
                                    )
                                  }
                                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                  title="Move section up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderNestedArray(
                                      ["sections"],
                                      idx,
                                      idx + 1,
                                    )
                                  }
                                  className="rounded-md border border-border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                  title="Move section down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <PageContentJsonRichText
                              label="Section content"
                              editorId={`legal-section-${idx}-content`}
                              value={
                                typeof sec.content === "string" ? sec.content : ""
                              }
                              onChange={(html) =>
                                updateNestedArray(["sections"], (arr) =>
                                  arr.map((s, i) =>
                                    i === idx ? { ...s, content: html } : s,
                                  ),
                                )
                              }
                            />
                            <PageContentStringListRichText
                              label="Bullet items"
                              editorIdPrefix={`legal-section-${idx}-items`}
                              items={parseJsonStringList(sec.items)}
                              onChange={(items) =>
                                updateNestedArray(["sections"], (arr) =>
                                  arr.map((s, i) =>
                                    i === idx ? { ...s, items } : s,
                                  ),
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    );
                  })(),
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              For complex privacy subsections, use the advanced editor below for
              full control.
            </p>
          </div>
        )}
        <div className="mb-3 grid gap-3 rounded-lg border border-border bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Hero image
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={quickValues.heroImage}
                onChange={(e) => updateJsonField("heroImage", e.target.value)}
                placeholder="media-... or /uploads/..."
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-900"
              />
              <button
                type="button"
                onClick={() => setPickerTarget("heroImage")}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Section image
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={quickValues.sectionImage}
                onChange={(e) =>
                  updateJsonField("sectionImage", e.target.value)
                }
                placeholder="media-... or /uploads/..."
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-900"
              />
              <button
                type="button"
                onClick={() => setPickerTarget("sectionImage")}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Subtitle
            </label>
            <input
              type="text"
              value={quickValues.subtitle}
              onChange={(e) => updateJsonField("subtitle", e.target.value)}
              placeholder="Page subtitle"
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>
        <details className="group mt-6 rounded-lg border border-border bg-slate-50/80">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              Advanced: raw JSON (optional)
            </span>
          </summary>
          <div className="border-t border-border px-4 pb-4 pt-2">
            <textarea
              id="contentJson"
              name="contentJson"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={18}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 font-mono text-sm text-slate-900"
              placeholder='{"heroImage":"media-...","intro":"..."}'
            />
            <p className="mt-1 text-xs text-slate-500">
              For developers only. Visual fields above update this JSON automatically on save.
            </p>
            {jsonError ? (
              <p className="mt-2 text-xs text-red-600">{jsonError}</p>
            ) : null}
          </div>
        </details>
      </div>

      <AdminFormStickyActions>
        <SubmitButton />
        <AdminFormPreviewLink href={publicPathForPageSlug(item.slug)}>
          Preview on site
        </AdminFormPreviewLink>
        <a
          href="/admin/pages"
          className="flex min-h-11 items-center rounded-lg border border-border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </a>
      </AdminFormStickyActions>

      <ImagePicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={onSelectMedia}
      />
    </form>
  );
}
