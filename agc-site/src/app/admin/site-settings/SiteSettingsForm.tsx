"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "./actions";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { ImagePicker } from "@/components/ImagePicker";
import { SiteSettingsChromeLists } from "./SiteSettingsChromeLists";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-accent-500 px-6 py-2 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save settings"}
    </button>
  );
}

export function SiteSettingsForm({
  settings,
  saved = false,
}: {
  settings: SiteSettings;
  saved?: boolean;
}) {
  const languagesText = settings.languages
    .map((x) => `${x.code}|${x.label}`)
    .join("\n");
  const [logo, setLogo] = useState(settings.logo || "");
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [footerLogo, setFooterLogo] = useState(settings.footerLogo || "");
  const [footerLogoPickerOpen, setFooterLogoPickerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = "agc:admin:site-settings:draft:v1";
  /** Loaded in useEffect only — avoids reading localStorage during render (SSR vs client hydration mismatch). */
  const [localDraft, setLocalDraft] = useState<Record<string, string> | null>(
    null,
  );
  const [draftHydrated, setDraftHydrated] = useState(false);
  const initialDraft = localDraft;
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { values?: Record<string, string> };
      const v = parsed.values;
      if (v && typeof v === "object" && Object.keys(v).length > 0) {
        setLocalDraft(v);
        if (typeof v.logo === "string" && v.logo.trim()) setLogo(v.logo);
        if (typeof v.footerLogo === "string" && v.footerLogo.trim())
          setFooterLogo(v.footerLogo);
      }
    } catch {
      // ignore invalid draft
    } finally {
      setDraftHydrated(true);
    }
  }, [draftKey]);

  const bc = settings.chrome.breadcrumbs;

  const saveDraft = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const values: Record<string, string> = {};
    for (const [k, v] of fd.entries()) values[k] = String(v ?? "");
    const payload = { values, savedAt: new Date().toISOString() };
    window.localStorage.setItem(draftKey, JSON.stringify(payload));
    setLastSavedAt(payload.savedAt);
  }, [draftKey]);

  function clearDraft() {
    window.localStorage.removeItem(draftKey);
    window.location.reload();
  }

  useEffect(() => {
    if (!saved) return;
    window.localStorage.removeItem(draftKey);
  }, [saved, draftKey]);

  const showDraftRestoredBanner =
    draftHydrated &&
    initialDraft !== null &&
    Object.keys(initialDraft).length > 0 &&
    !saved;

  return (
    <form
      ref={formRef}
      action={updateSiteSettings}
      onInput={saveDraft}
      className="space-y-6"
      key={
        draftHydrated
          ? `site-settings-${initialDraft ? "draft" : "nodraft"}`
          : "site-settings-ssr"
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {showDraftRestoredBanner ? (
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
          Organization profile
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Site name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={initialDraft?.name ?? settings.name}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="tagline"
              className="block text-sm font-medium text-slate-700"
            >
              Tagline
            </label>
            <textarea
              id="tagline"
              name="tagline"
              defaultValue={initialDraft?.tagline ?? settings.tagline}
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-slate-700"
            >
              Header logo
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Shown in the top bar and light areas. Empty = default file in
              /public.
            </p>
            <div className="mt-1 flex gap-2">
              <input
                id="logo"
                name="logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="e.g. media-… or /uploads/logo.png"
                className="w-full rounded-lg border border-border px-4 py-2 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setLogoPickerOpen(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            <ImagePicker
              open={logoPickerOpen}
              onClose={() => setLogoPickerOpen(false)}
              onSelect={(item) => setLogo(item.id)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="footerLogo"
              className="block text-sm font-medium text-slate-700"
            >
              Footer &amp; mobile menu logo (optional)
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              For dark backgrounds (inverted display only when using the default
              PNG). Leave empty to reuse the header logo.
            </p>
            <div className="mt-1 flex gap-2">
              <input
                id="footerLogo"
                name="footerLogo"
                value={footerLogo}
                onChange={(e) => setFooterLogo(e.target.value)}
                placeholder="e.g. white/wordmark variant"
                className="w-full rounded-lg border border-border px-4 py-2 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setFooterLogoPickerOpen(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                title="Pick from Media Library"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
            </div>
            <ImagePicker
              open={footerLogoPickerOpen}
              onClose={() => setFooterLogoPickerOpen(false)}
              onSelect={(item) => setFooterLogo(item.id)}
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={initialDraft?.phone ?? settings.phone}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="officeHours"
              className="block text-sm font-medium text-slate-700"
            >
              Office hours
            </label>
            <input
              id="officeHours"
              name="officeHours"
              defaultValue={initialDraft?.officeHours ?? settings.officeHours}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-700"
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              defaultValue={initialDraft?.address ?? settings.address}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Email inboxes
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="emailPrograms"
              className="block text-sm font-medium text-slate-700"
            >
              Programs
            </label>
            <input
              id="emailPrograms"
              type="email"
              name="emailPrograms"
              defaultValue={
                initialDraft?.emailPrograms ?? settings.email.programs
              }
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="emailMedia"
              className="block text-sm font-medium text-slate-700"
            >
              Media
            </label>
            <input
              id="emailMedia"
              type="email"
              name="emailMedia"
              defaultValue={initialDraft?.emailMedia ?? settings.email.media}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="emailInfo"
              className="block text-sm font-medium text-slate-700"
            >
              Info
            </label>
            <input
              id="emailInfo"
              type="email"
              name="emailInfo"
              defaultValue={initialDraft?.emailInfo ?? settings.email.info}
              required
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Social links
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Full URLs for each platform. The <strong>footer</strong> shows
          brand-style icons for X, Facebook, LinkedIn, and Instagram in a fixed
          row (with built-in fallbacks for AGC when a field is empty). The{" "}
          <strong>header top bar</strong> uses its own compact set of links.
          Leave a field empty to use the matching{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            NEXT_PUBLIC_*_URL
          </code>{" "}
          build-time env var if configured.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="socialTwitter"
              className="block text-sm font-medium text-slate-700"
            >
              Twitter / X
            </label>
            <input
              id="socialTwitter"
              type="url"
              name="socialTwitter"
              defaultValue={
                initialDraft?.socialTwitter ?? settings.social.twitter
              }
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="socialFacebook"
              className="block text-sm font-medium text-slate-700"
            >
              Facebook
            </label>
            <input
              id="socialFacebook"
              type="url"
              name="socialFacebook"
              defaultValue={
                initialDraft?.socialFacebook ?? settings.social.facebook
              }
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="socialLinkedin"
              className="block text-sm font-medium text-slate-700"
            >
              LinkedIn
            </label>
            <input
              id="socialLinkedin"
              type="url"
              name="socialLinkedin"
              defaultValue={
                initialDraft?.socialLinkedin ?? settings.social.linkedin
              }
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="socialInstagram"
              className="block text-sm font-medium text-slate-700"
            >
              Instagram
            </label>
            <input
              id="socialInstagram"
              type="url"
              name="socialInstagram"
              defaultValue={
                initialDraft?.socialInstagram ?? settings.social.instagram
              }
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Languages
        </h2>
        <label
          htmlFor="languages"
          className="mt-3 block text-sm font-medium text-slate-700"
        >
          One per line as <code>code|label</code> (example:{" "}
          <code>en|English</code>)
        </label>
        <textarea
          id="languages"
          name="languages"
          defaultValue={initialDraft?.languages ?? languagesText}
          rows={4}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 font-mono text-sm"
        />
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Header, mobile &amp; footer labels
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Public navigation and footer copy. Use the editors below for menus and
          footer lists—no JSON required. Label fields keep built-in defaults
          when left empty on save.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="skipToContentLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Skip link
            </label>
            <input
              id="skipToContentLabel"
              name="skipToContentLabel"
              defaultValue={settings.chrome.skipToContentLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="headerContactCta"
              className="block text-sm font-medium text-slate-700"
            >
              Header contact button
            </label>
            <input
              id="headerContactCta"
              name="headerContactCta"
              defaultValue={settings.chrome.headerContactCta}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="headerSearchAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Search (aria-label)
            </label>
            <input
              id="headerSearchAriaLabel"
              name="headerSearchAriaLabel"
              defaultValue={settings.chrome.headerSearchAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="mobileDrawerAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Mobile drawer (dialog label)
            </label>
            <input
              id="mobileDrawerAriaLabel"
              name="mobileDrawerAriaLabel"
              defaultValue={settings.chrome.mobileDrawerAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="mobileDrawerCloseAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Mobile close (aria-label)
            </label>
            <input
              id="mobileDrawerCloseAriaLabel"
              name="mobileDrawerCloseAriaLabel"
              defaultValue={settings.chrome.mobileDrawerCloseAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="mobileSearchButtonLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Mobile search button
            </label>
            <input
              id="mobileSearchButtonLabel"
              name="mobileSearchButtonLabel"
              defaultValue={settings.chrome.mobileSearchButtonLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="mobileDrawerContactCta"
              className="block text-sm font-medium text-slate-700"
            >
              Mobile drawer contact CTA
            </label>
            <input
              id="mobileDrawerContactCta"
              name="mobileDrawerContactCta"
              defaultValue={settings.chrome.mobileDrawerContactCta}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="mobileLanguageEyebrow"
              className="block text-sm font-medium text-slate-700"
            >
              Mobile language eyebrow
            </label>
            <input
              id="mobileLanguageEyebrow"
              name="mobileLanguageEyebrow"
              defaultValue={settings.chrome.mobileLanguageEyebrow}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerContactHeading"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: Contact column
            </label>
            <input
              id="footerContactHeading"
              name="footerContactHeading"
              defaultValue={settings.chrome.footer.contactHeading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerQuickLinksHeading"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: Quick links column
            </label>
            <input
              id="footerQuickLinksHeading"
              name="footerQuickLinksHeading"
              defaultValue={settings.chrome.footer.quickLinksHeading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerOurWorkHeading"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: Our work column
            </label>
            <input
              id="footerOurWorkHeading"
              name="footerOurWorkHeading"
              defaultValue={settings.chrome.footer.ourWorkHeading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerGetInvolvedLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: Get involved link
            </label>
            <input
              id="footerGetInvolvedLabel"
              name="footerGetInvolvedLabel"
              defaultValue={settings.chrome.footer.getInvolvedLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerRightsReserved"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: Rights line
            </label>
            <input
              id="footerRightsReserved"
              name="footerRightsReserved"
              defaultValue={settings.chrome.footer.rightsReserved}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="footerAdminLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Footer: home shortcut label
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Copyright bar; links to home (scrolls to top if already on home).
            </p>
            <input
              id="footerAdminLabel"
              name="footerAdminLabel"
              defaultValue={settings.chrome.footer.adminLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
        <SiteSettingsChromeLists
          chrome={settings.chrome}
          initialDraft={initialDraft}
          onListsChange={saveDraft}
        />
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Breadcrumb labels
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Text for public page hero breadcrumbs. Empty fields keep built-in
          defaults when you save.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="bcHome"
              className="block text-sm font-medium text-slate-700"
            >
              Home
            </label>
            <input
              id="bcHome"
              name="bcHome"
              defaultValue={initialDraft?.bcHome ?? bc.home}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcAbout"
              className="block text-sm font-medium text-slate-700"
            >
              About
            </label>
            <input
              id="bcAbout"
              name="bcAbout"
              defaultValue={initialDraft?.bcAbout ?? bc.about}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcOurWork"
              className="block text-sm font-medium text-slate-700"
            >
              Our work
            </label>
            <input
              id="bcOurWork"
              name="bcOurWork"
              defaultValue={initialDraft?.bcOurWork ?? bc.ourWork}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcPrograms"
              className="block text-sm font-medium text-slate-700"
            >
              Programs
            </label>
            <input
              id="bcPrograms"
              name="bcPrograms"
              defaultValue={initialDraft?.bcPrograms ?? bc.programs}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcProjects"
              className="block text-sm font-medium text-slate-700"
            >
              Projects
            </label>
            <input
              id="bcProjects"
              name="bcProjects"
              defaultValue={initialDraft?.bcProjects ?? bc.projects}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcAdvisory"
              className="block text-sm font-medium text-slate-700"
            >
              Advisory
            </label>
            <input
              id="bcAdvisory"
              name="bcAdvisory"
              defaultValue={initialDraft?.bcAdvisory ?? bc.advisory}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcGetInvolved"
              className="block text-sm font-medium text-slate-700"
            >
              Get involved
            </label>
            <input
              id="bcGetInvolved"
              name="bcGetInvolved"
              defaultValue={initialDraft?.bcGetInvolved ?? bc.getInvolved}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcVolunteer"
              className="block text-sm font-medium text-slate-700"
            >
              Volunteer
            </label>
            <input
              id="bcVolunteer"
              name="bcVolunteer"
              defaultValue={initialDraft?.bcVolunteer ?? bc.volunteer}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcPartnership"
              className="block text-sm font-medium text-slate-700"
            >
              Partnership
            </label>
            <input
              id="bcPartnership"
              name="bcPartnership"
              defaultValue={initialDraft?.bcPartnership ?? bc.partnership}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcJoinUs"
              className="block text-sm font-medium text-slate-700"
            >
              Work with us
            </label>
            <input
              id="bcJoinUs"
              name="bcJoinUs"
              defaultValue={initialDraft?.bcJoinUs ?? bc.joinUs}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcContact"
              className="block text-sm font-medium text-slate-700"
            >
              Contact
            </label>
            <input
              id="bcContact"
              name="bcContact"
              defaultValue={initialDraft?.bcContact ?? bc.contact}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcNews"
              className="block text-sm font-medium text-slate-700"
            >
              News
            </label>
            <input
              id="bcNews"
              name="bcNews"
              defaultValue={initialDraft?.bcNews ?? bc.news}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcEvents"
              className="block text-sm font-medium text-slate-700"
            >
              Events
            </label>
            <input
              id="bcEvents"
              name="bcEvents"
              defaultValue={initialDraft?.bcEvents ?? bc.events}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcPublications"
              className="block text-sm font-medium text-slate-700"
            >
              Publications
            </label>
            <input
              id="bcPublications"
              name="bcPublications"
              defaultValue={initialDraft?.bcPublications ?? bc.publications}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcPrivacyPolicy"
              className="block text-sm font-medium text-slate-700"
            >
              Privacy policy
            </label>
            <input
              id="bcPrivacyPolicy"
              name="bcPrivacyPolicy"
              defaultValue={initialDraft?.bcPrivacyPolicy ?? bc.privacyPolicy}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcTermsOfService"
              className="block text-sm font-medium text-slate-700"
            >
              Terms of service
            </label>
            <input
              id="bcTermsOfService"
              name="bcTermsOfService"
              defaultValue={initialDraft?.bcTermsOfService ?? bc.termsOfService}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcAppSummit"
              className="block text-sm font-medium text-slate-700"
            >
              APP Summit
            </label>
            <input
              id="bcAppSummit"
              name="bcAppSummit"
              defaultValue={initialDraft?.bcAppSummit ?? bc.appSummit}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcTeam"
              className="block text-sm font-medium text-slate-700"
            >
              Our team
            </label>
            <input
              id="bcTeam"
              name="bcTeam"
              defaultValue={initialDraft?.bcTeam ?? bc.team}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="bcEventRegister"
              className="block text-sm font-medium text-slate-700"
            >
              Event register
            </label>
            <input
              id="bcEventRegister"
              name="bcEventRegister"
              defaultValue={initialDraft?.bcEventRegister ?? bc.eventRegister}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">
          Search modal &amp; newsletter
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Header site search and the footer newsletter block. Empty fields keep
          built-in defaults on save.
        </p>
        <h3 className="mt-5 text-sm font-semibold text-slate-800">
          Search modal
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="searchDialogAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Dialog (aria-label)
            </label>
            <input
              id="searchDialogAriaLabel"
              name="searchDialogAriaLabel"
              defaultValue={settings.chrome.search.dialogAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchCloseAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Close button (aria-label)
            </label>
            <input
              id="searchCloseAriaLabel"
              name="searchCloseAriaLabel"
              defaultValue={settings.chrome.search.closeAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="searchPlaceholder"
              className="block text-sm font-medium text-slate-700"
            >
              Input placeholder
            </label>
            <input
              id="searchPlaceholder"
              name="searchPlaceholder"
              defaultValue={settings.chrome.search.placeholder}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchLoading"
              className="block text-sm font-medium text-slate-700"
            >
              Loading text
            </label>
            <input
              id="searchLoading"
              name="searchLoading"
              defaultValue={settings.chrome.search.loading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchEmptyNoQuery"
              className="block text-sm font-medium text-slate-700"
            >
              Empty (no query yet)
            </label>
            <input
              id="searchEmptyNoQuery"
              name="searchEmptyNoQuery"
              defaultValue={settings.chrome.search.emptyNoQuery}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchEmptyNoResults"
              className="block text-sm font-medium text-slate-700"
            >
              No results
            </label>
            <input
              id="searchEmptyNoResults"
              name="searchEmptyNoResults"
              defaultValue={settings.chrome.search.emptyNoResults}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchTypeEvent"
              className="block text-sm font-medium text-slate-700"
            >
              Type label: Event
            </label>
            <input
              id="searchTypeEvent"
              name="searchTypeEvent"
              defaultValue={settings.chrome.search.typeEvent}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchTypeNews"
              className="block text-sm font-medium text-slate-700"
            >
              Type label: News
            </label>
            <input
              id="searchTypeNews"
              name="searchTypeNews"
              defaultValue={settings.chrome.search.typeNews}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="searchTypePublication"
              className="block text-sm font-medium text-slate-700"
            >
              Type label: Publication
            </label>
            <input
              id="searchTypePublication"
              name="searchTypePublication"
              defaultValue={settings.chrome.search.typePublication}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
        <h3 className="mt-8 text-sm font-semibold text-slate-800">
          Footer newsletter
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="newsletterHeading"
              className="block text-sm font-medium text-slate-700"
            >
              Heading
            </label>
            <input
              id="newsletterHeading"
              name="newsletterHeading"
              defaultValue={settings.chrome.newsletter.heading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="newsletterDescription"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <input
              id="newsletterDescription"
              name="newsletterDescription"
              defaultValue={settings.chrome.newsletter.description}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterPlaceholder"
              className="block text-sm font-medium text-slate-700"
            >
              Email placeholder
            </label>
            <input
              id="newsletterPlaceholder"
              name="newsletterPlaceholder"
              defaultValue={settings.chrome.newsletter.placeholder}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterEmailAriaLabel"
              className="block text-sm font-medium text-slate-700"
            >
              Email field (aria-label)
            </label>
            <input
              id="newsletterEmailAriaLabel"
              name="newsletterEmailAriaLabel"
              defaultValue={settings.chrome.newsletter.emailAriaLabel}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterSubmit"
              className="block text-sm font-medium text-slate-700"
            >
              Submit button
            </label>
            <input
              id="newsletterSubmit"
              name="newsletterSubmit"
              defaultValue={settings.chrome.newsletter.submit}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterSubmitLoading"
              className="block text-sm font-medium text-slate-700"
            >
              Submit (loading)
            </label>
            <input
              id="newsletterSubmitLoading"
              name="newsletterSubmitLoading"
              defaultValue={settings.chrome.newsletter.submitLoading}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterSubscribed"
              className="block text-sm font-medium text-slate-700"
            >
              After success (button)
            </label>
            <input
              id="newsletterSubscribed"
              name="newsletterSubscribed"
              defaultValue={settings.chrome.newsletter.subscribed}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="newsletterSuccessMessage"
              className="block text-sm font-medium text-slate-700"
            >
              Success message
            </label>
            <input
              id="newsletterSuccessMessage"
              name="newsletterSuccessMessage"
              defaultValue={settings.chrome.newsletter.successMessage}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="newsletterErrorGeneric"
              className="block text-sm font-medium text-slate-700"
            >
              Generic error
            </label>
            <input
              id="newsletterErrorGeneric"
              name="newsletterErrorGeneric"
              defaultValue={settings.chrome.newsletter.errorGeneric}
              className="mt-1 w-full rounded-lg border border-border px-4 py-2"
            />
          </div>
        </div>
      </section>

      <AdminFormStickyActions>
        <SubmitButton />
      </AdminFormStickyActions>
    </form>
  );
}
