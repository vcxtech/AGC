"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { CmsRichTextField } from "@/components/admin/CmsRichTextField";
import { updateAboutSettings } from "./actions";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { aboutContent as aboutDefaults } from "@/data/content";

type AboutSettings = {
  title: string;
  hero: { subtitle: string };
  intro: string;
  description: string;
  mission: string;
  strategicObjectives: {
    title: string;
    content: string;
    principles: string;
    agenda2063: string;
  };
  heroImage?: string;
  aboutSectionEyebrow?: string;
  aboutSectionHeading?: string;
  aboutSectionImage?: string;
  leadParagraphs?: string[];
  deliverySectionHeading?: string;
  partnershipsHeading?: string;
  partnershipsText?: string;
  deliveryPoints?: { title?: string; body?: string; image?: string }[];
  teamPage?: { title: string; subtitle: string; heroImage?: string };
  teamTabsList?: { key: string; label: string }[];
};

function defaultTeamTabsConfig(content: AboutSettings): string {
  const configured = content.teamTabsList ?? [];
  if (configured.length > 0) {
    return configured.map((x) => `${x.key}|${x.label}`).join("\n");
  }
  return [
    `all|All`,
    `advisory_board|${aboutDefaults.teamTabs.advisoryBoard}`,
    `executive_council|${aboutDefaults.teamTabs.executiveCouncil}`,
    `management_team|${aboutDefaults.teamTabs.managementTeam}`,
    `fellows|${aboutDefaults.teamTabs.fellows}`,
  ].join("\n");
}

export function AboutSettingsForm({
  content,
  saved = false,
}: {
  content: AboutSettings;
  saved?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = "agc:admin:about-settings:draft:v1";
  const initialDraft = useMemo(() => {
    if (typeof window === "undefined")
      return null as Record<string, string> | null;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { values?: Record<string, string> };
      return parsed.values || null;
    } catch {
      return null;
    }
  }, []);
  const [heroImage, setHeroImage] = useState(
    initialDraft?.heroImage ?? content.heroImage ?? "",
  );
  const [teamHeroImage, setTeamHeroImage] = useState(
    initialDraft?.teamHeroImage ?? content.teamPage?.heroImage?.trim() ?? "",
  );
  const [deliveryImage1, setDeliveryImage1] = useState(
    initialDraft?.deliveryImage1 ?? content.deliveryPoints?.[0]?.image ?? "",
  );
  const [deliveryImage2, setDeliveryImage2] = useState(
    initialDraft?.deliveryImage2 ?? content.deliveryPoints?.[1]?.image ?? "",
  );
  const [deliveryImage3, setDeliveryImage3] = useState(
    initialDraft?.deliveryImage3 ?? content.deliveryPoints?.[2]?.image ?? "",
  );
  const [deliveryImage4, setDeliveryImage4] = useState(
    initialDraft?.deliveryImage4 ?? content.deliveryPoints?.[3]?.image ?? "",
  );
  const [aboutSectionImage, setAboutSectionImage] = useState(
    initialDraft?.aboutSectionImage ?? content.aboutSectionImage ?? "",
  );
  const [pickerTarget, setPickerTarget] = useState<
    | "heroImage"
    | "teamHeroImage"
    | "deliveryImage1"
    | "deliveryImage2"
    | "deliveryImage3"
    | "deliveryImage4"
    | "aboutSectionImage"
    | null
  >(null);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [draftRestored] = useState(!!initialDraft);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [introHtml, setIntroHtml] = useState(
    initialDraft?.intro ?? content.intro ?? "",
  );
  const [descriptionHtml, setDescriptionHtml] = useState(
    initialDraft?.description ?? content.description ?? "",
  );
  const [missionHtml, setMissionHtml] = useState(
    initialDraft?.mission ?? content.mission ?? "",
  );
  const [strategicContentHtml, setStrategicContentHtml] = useState(
    initialDraft?.strategicContent ?? content.strategicObjectives.content ?? "",
  );
  const [strategicPrinciplesHtml, setStrategicPrinciplesHtml] = useState(
    initialDraft?.strategicPrinciples ??
      content.strategicObjectives.principles ??
      "",
  );
  const [strategicAgendaHtml, setStrategicAgendaHtml] = useState(
    initialDraft?.strategicAgenda2063 ??
      content.strategicObjectives.agenda2063 ??
      "",
  );
  const [partnershipsHtml, setPartnershipsHtml] = useState(
    initialDraft?.partnershipsText ?? content.partnershipsText ?? "",
  );
  const [deliveryBody1Html, setDeliveryBody1Html] = useState(
    initialDraft?.deliveryBody1 ?? content.deliveryPoints?.[0]?.body ?? "",
  );
  const [deliveryBody2Html, setDeliveryBody2Html] = useState(
    initialDraft?.deliveryBody2 ?? content.deliveryPoints?.[1]?.body ?? "",
  );
  const [deliveryBody3Html, setDeliveryBody3Html] = useState(
    initialDraft?.deliveryBody3 ?? content.deliveryPoints?.[2]?.body ?? "",
  );
  const [deliveryBody4Html, setDeliveryBody4Html] = useState(
    initialDraft?.deliveryBody4 ?? content.deliveryPoints?.[3]?.body ?? "",
  );

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
        // ignore preview fetch failures; picker still works
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const heroPreview = useMemo(() => {
    const raw = heroImage.trim();
    if (!raw) return "";
    if (raw.startsWith("media-")) return mediaMap[raw] || "";
    return raw;
  }, [heroImage, mediaMap]);

  const teamHeroPreview = useMemo(() => {
    const raw = teamHeroImage.trim();
    if (!raw) return "";
    if (raw.startsWith("media-")) return mediaMap[raw] || "";
    return raw;
  }, [teamHeroImage, mediaMap]);

  const aboutSectionImagePreview = useMemo(() => {
    const raw = aboutSectionImage.trim();
    if (!raw) return "";
    if (raw.startsWith("media-")) return mediaMap[raw] || "";
    return raw;
  }, [aboutSectionImage, mediaMap]);

  function onSelectMedia(media: MediaItem) {
    if (pickerTarget === "heroImage") setHeroImage(media.id);
    if (pickerTarget === "teamHeroImage") setTeamHeroImage(media.id);
    if (pickerTarget === "deliveryImage1") setDeliveryImage1(media.id);
    if (pickerTarget === "deliveryImage2") setDeliveryImage2(media.id);
    if (pickerTarget === "deliveryImage3") setDeliveryImage3(media.id);
    if (pickerTarget === "deliveryImage4") setDeliveryImage4(media.id);
    if (pickerTarget === "aboutSectionImage") setAboutSectionImage(media.id);
    setPickerTarget(null);
  }

  function saveDraft() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const values: Record<string, string> = {};
    for (const [k, v] of fd.entries()) values[k] = String(v ?? "");
    const payload = { values, savedAt: new Date().toISOString() };
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

  return (
    <form
      ref={formRef}
      action={updateAboutSettings}
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
          About hero
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Controls the About page hero title, subtitle, and background image.
        </p>
        <div className="mt-4 grid gap-4">
          <input
            name="title"
            defaultValue={initialDraft?.title ?? content.title}
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Page title"
          />
          <input
            name="heroSubtitle"
            defaultValue={initialDraft?.heroSubtitle ?? content.hero.subtitle}
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Hero subtitle"
          />
          <div>
            <div className="flex gap-2">
              <input
                name="heroImage"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2"
                placeholder="Hero image media-id/url/path"
              />
              <button
                type="button"
                onClick={() => setPickerTarget("heroImage")}
                className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            {heroPreview ? (
              <div className="mt-2 relative h-28 w-full overflow-hidden rounded-lg border border-border bg-slate-100">
                <Image
                  src={heroPreview}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                  unoptimized={preferUnoptimizedImage(heroPreview)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Who we are section
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Controls the heading and lead paragraphs on the main About page.
        </p>
        <div className="mt-4 grid gap-4">
          <input
            name="aboutSectionEyebrow"
            defaultValue={
              initialDraft?.aboutSectionEyebrow ??
              content.aboutSectionEyebrow ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Eyebrow (e.g. Who we are)"
          />
          <input
            name="aboutSectionHeading"
            defaultValue={
              initialDraft?.aboutSectionHeading ??
              content.aboutSectionHeading ??
              content.title
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Section heading"
          />
          <textarea
            name="leadParagraphs"
            defaultValue=""
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
          <CmsRichTextField
            label="Lead copy (primary)"
            name="intro"
            editorId="about-intro"
            initialHtml={introHtml}
            onHtmlChange={setIntroHtml}
            hint="Main “Who we are” paragraphs — headings and lists supported."
            placeholder="Describe who AGC is and what you do…"
          />
          <CmsRichTextField
            label="Supporting copy (optional)"
            name="description"
            editorId="about-description"
            initialHtml={descriptionHtml}
            onHtmlChange={setDescriptionHtml}
            hint="Additional context shown after the lead copy."
            placeholder="Optional second block…"
          />
          <div>
            {/* <div className="flex gap-2">
              <input
                name="aboutSectionImage"
                value={aboutSectionImage}
                onChange={(e) => setAboutSectionImage(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2"
                placeholder="About section image media-id/url/path"
              />
              <button
                type="button"
                onClick={() => setPickerTarget("aboutSectionImage")}
                className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div> */}
            {aboutSectionImagePreview ? (
              <div className="mt-2 relative h-28 w-full overflow-hidden rounded-lg border border-border bg-slate-100">
                <Image
                  src={aboutSectionImagePreview}
                  alt="About section preview"
                  fill
                  className="object-cover"
                  unoptimized={preferUnoptimizedImage(aboutSectionImagePreview)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Mission and strategic objectives
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Shown on the public About page below the lead copy.
        </p>
        <div className="mt-4 grid gap-4">
          <CmsRichTextField
            label="Mission"
            name="mission"
            editorId="about-mission"
            initialHtml={missionHtml}
            onHtmlChange={setMissionHtml}
            placeholder="Our mission is…"
          />
          <input
            name="strategicTitle"
            defaultValue={
              initialDraft?.strategicTitle ??
              content.strategicObjectives.title ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Strategic objectives heading"
          />
          <CmsRichTextField
            label="Strategic objectives — overview"
            name="strategicContent"
            editorId="about-strategic-content"
            initialHtml={strategicContentHtml}
            onHtmlChange={setStrategicContentHtml}
          />
          <CmsRichTextField
            label="Principles"
            name="strategicPrinciples"
            editorId="about-strategic-principles"
            initialHtml={strategicPrinciplesHtml}
            onHtmlChange={setStrategicPrinciplesHtml}
            compact
          />
          <CmsRichTextField
            label="Agenda 2063 alignment"
            name="strategicAgenda2063"
            editorId="about-strategic-agenda"
            initialHtml={strategicAgendaHtml}
            onHtmlChange={setStrategicAgendaHtml}
            compact
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Delivery cards and partnerships
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Controls the “We deliver our work by” cards and partnerships copy.
        </p>
        <div className="mt-4 grid gap-4">
          <input
            name="deliverySectionHeading"
            defaultValue={
              initialDraft?.deliverySectionHeading ??
              content.deliverySectionHeading ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Delivery section heading"
          />
          {[
            {
              n: 1,
              title: content.deliveryPoints?.[0]?.title ?? "",
              body: content.deliveryPoints?.[0]?.body ?? "",
              image: deliveryImage1,
              setImage: setDeliveryImage1,
              target: "deliveryImage1" as const,
            },
            {
              n: 2,
              title: content.deliveryPoints?.[1]?.title ?? "",
              body: content.deliveryPoints?.[1]?.body ?? "",
              image: deliveryImage2,
              setImage: setDeliveryImage2,
              target: "deliveryImage2" as const,
            },
            {
              n: 3,
              title: content.deliveryPoints?.[2]?.title ?? "",
              body: content.deliveryPoints?.[2]?.body ?? "",
              image: deliveryImage3,
              setImage: setDeliveryImage3,
              target: "deliveryImage3" as const,
            },
            {
              n: 4,
              title: content.deliveryPoints?.[3]?.title ?? "",
              body: content.deliveryPoints?.[3]?.body ?? "",
              image: deliveryImage4,
              setImage: setDeliveryImage4,
              target: "deliveryImage4" as const,
            },
          ].map((card) => (
            <div key={card.n} className="rounded-lg border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Card {card.n}
              </p>
              <div className="mt-2 grid gap-3">
                <input
                  name={`deliveryTitle${card.n}`}
                  defaultValue={
                    (initialDraft?.[`deliveryTitle${card.n}`] ??
                      card.title) as string
                  }
                  className="rounded-lg border border-border px-4 py-2"
                  placeholder="Card title"
                />
                <CmsRichTextField
                  label="Card description"
                  name={`deliveryBody${card.n}`}
                  editorId={`about-delivery-body-${card.n}`}
                  initialHtml={
                    card.n === 1
                      ? deliveryBody1Html
                      : card.n === 2
                        ? deliveryBody2Html
                        : card.n === 3
                          ? deliveryBody3Html
                          : deliveryBody4Html
                  }
                  onHtmlChange={
                    card.n === 1
                      ? setDeliveryBody1Html
                      : card.n === 2
                        ? setDeliveryBody2Html
                        : card.n === 3
                          ? setDeliveryBody3Html
                          : setDeliveryBody4Html
                  }
                  compact
                  showPreviewToggle={false}
                />
                <div className="flex gap-2">
                  <input
                    name={`deliveryImage${card.n}`}
                    value={card.image}
                    onChange={(e) => card.setImage(e.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2"
                    placeholder="Card image media-id/url/path"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget(card.target)}
                    className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                    title="Pick from Media Library"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <input
            name="partnershipsHeading"
            defaultValue={
              initialDraft?.partnershipsHeading ??
              content.partnershipsHeading ??
              ""
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Partnerships heading"
          />
          <CmsRichTextField
            label="Partnerships and network"
            name="partnershipsText"
            editorId="about-partnerships"
            initialHtml={partnershipsHtml}
            onHtmlChange={setPartnershipsHtml}
            placeholder="Describe institutional partnerships…"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Our Team page
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Hero for individual team profile pages (opened from the About section
          cards). If no team hero image is set, the main About hero image is
          used.
        </p>
        <div className="mt-4 grid gap-4">
          <input
            name="teamPageTitle"
            defaultValue={
              initialDraft?.teamPageTitle ??
              content.teamPage?.title ??
              aboutDefaults.teamPage.title
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Team page title"
          />
          <input
            name="teamPageSubtitle"
            defaultValue={
              initialDraft?.teamPageSubtitle ??
              content.teamPage?.subtitle ??
              aboutDefaults.teamPage.subtitle
            }
            className="rounded-lg border border-border px-4 py-2"
            placeholder="Team page subtitle"
          />
          <div>
            <label
              htmlFor="teamTabsConfig"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Team tabs
            </label>
            <textarea
              id="teamTabsConfig"
              name="teamTabsConfig"
              defaultValue={
                initialDraft?.teamTabsConfig ?? defaultTeamTabsConfig(content)
              }
              rows={5}
              className="w-full rounded-lg border border-border px-4 py-2 font-mono text-sm"
              placeholder="section_key|Tab label"
            />
            <p className="mt-1 text-xs text-slate-500">
              One per line:{" "}
              <code className="rounded bg-slate-100 px-1">
                section_key|Tab label
              </code>
              . Example:
              <code className="ml-1 rounded bg-slate-100 px-1">
                fellows|Fellows
              </code>
            </p>
          </div>
          <div>
            <div className="flex gap-2">
              <input
                name="teamHeroImage"
                value={teamHeroImage}
                onChange={(e) => setTeamHeroImage(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2"
                placeholder="Team hero image (optional)"
              />
              <button
                type="button"
                onClick={() => setPickerTarget("teamHeroImage")}
                className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            {teamHeroPreview ? (
              <div className="mt-2 relative h-28 w-full overflow-hidden rounded-lg border border-border bg-slate-100">
                <Image
                  src={teamHeroPreview}
                  alt="Team hero preview"
                  fill
                  className="object-cover"
                  unoptimized={preferUnoptimizedImage(teamHeroPreview)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-6 py-2 font-medium text-white hover:bg-accent-700"
      >
        Save About Settings
      </button>

      <ImagePicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={onSelectMedia}
      />
    </form>
  );
}
