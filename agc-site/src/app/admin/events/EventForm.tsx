"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { createEvent, updateEvent } from "./actions";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { CmsRichTextField } from "@/components/admin/CmsRichTextField";
import { useImageFieldPreview } from "@/hooks/useImageFieldPreview";
import { AdminFormPreviewLink } from "../_components/AdminFormPreviewLink";

export type EventTeamOption = { id: number; name: string };

type AgendaRow = { time: string; title: string; description: string };

type EventFormProps = {
  teamOptions: EventTeamOption[];
  item?: {
    id: number;
    title: string;
    slug: string | null;
    shortDescription?: string | null;
    description: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    image: string | null;
    link: string | null;
    category: string | null;
    eventType: string | null;
    venueName: string | null;
    venueAddress: string | null;
    capacity: number | null;
    registrationDeadline: Date | null;
    allowWaitlist?: boolean;
    status: string;
    agenda?: unknown;
    speakerIds?: unknown;
  };
};

function normalizeAgendaInitial(raw: unknown): AgendaRow[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;
      return {
        time: typeof o.time === "string" ? o.time : "",
        title: typeof o.title === "string" ? o.title : "",
        description: typeof o.description === "string" ? o.description : "",
      };
    })
    .filter((r): r is AgendaRow => r !== null);
}

function parseSpeakerIdsInitial(raw: unknown): number[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter((x): x is number => typeof x === "number" && x > 0);
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-accent-500 px-6 py-3 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create"}
    </button>
  );
}

export function EventForm({ item, teamOptions }: EventFormProps) {
  const isEdit = !!item;
  const action = isEdit ? updateEvent.bind(null, item.id) : createEvent;
  const [image, setImage] = useState(item?.image ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(item?.description ?? "");
  const [shortDescriptionHtml, setShortDescriptionHtml] = useState(
    item?.shortDescription ?? "",
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const { previewUrl: imagePreviewUrl, loading: imagePreviewLoading } = useImageFieldPreview(image);

  const formatDate = (d: Date) => d.toISOString().slice(0, 16);
  const formatDateOnly = (d: Date) => d.toISOString().slice(0, 10);

  const initialAgenda = useMemo(() => normalizeAgendaInitial(item?.agenda), [item?.agenda]);
  const [agendaRows, setAgendaRows] = useState<AgendaRow[]>(() =>
    initialAgenda.length > 0 ? initialAgenda : []
  );

  const selectedSpeakerIds = useMemo(() => parseSpeakerIdsInitial(item?.speakerIds), [item?.speakerIds]);

  const agendaJson = useMemo(() => {
    const payload = agendaRows
      .filter((r) => r.title.trim())
      .map((r) => ({
        time: r.time.trim() || undefined,
        title: r.title.trim(),
        description: r.description.trim() || undefined,
      }));
    return JSON.stringify(payload);
  }, [agendaRows]);

  const addAgendaRow = () => {
    setAgendaRows((prev) => [...prev, { time: "", title: "", description: "" }]);
  };

  const removeAgendaRow = (index: number) => {
    setAgendaRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAgendaRow = (index: number, field: keyof AgendaRow, value: string) => {
    setAgendaRows((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      next[index] = { ...row, [field]: value };
      return next;
    });
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="agendaJson" value={agendaJson} aria-hidden />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Title *
        </label>
        <input
          id="title"
          name="title"
          defaultValue={item?.title}
          required
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
          Slug (optional, auto-generated)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={item?.slug ?? ""}
          placeholder="my-event-slug"
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <div className="rounded-xl border border-border bg-slate-50/80 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Event descriptions</h2>
        <p className="mt-1 text-xs text-slate-600">
          Use a short description for cards/lists and a full description for the main event page.
        </p>
        <div className="mt-4 grid gap-4">
          <CmsRichTextField
            label="Short description"
            name="shortDescription"
            editorId="event-short-description"
            initialHtml={shortDescriptionHtml}
            onHtmlChange={setShortDescriptionHtml}
            hint="Shown on event cards and listings. Keep it concise."
            compact
            showPreviewToggle={false}
          />
          <CmsRichTextField
            label="Full description"
            name="description"
            editorId="event-description"
            initialHtml={descriptionHtml}
            onHtmlChange={setDescriptionHtml}
            hint="Rich text for the event detail and registration pages."
            placeholder="Describe the event programme, audience, and outcomes…"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
            Start date *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            defaultValue={item ? formatDate(item.startDate) : ""}
            required
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            defaultValue={item?.endDate ? formatDate(item.endDate) : ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={item?.location ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <input
            id="category"
            name="category"
            defaultValue={item?.category ?? ""}
            placeholder="e.g. summit, conference"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-slate-700">
            Event type
          </label>
          <input
            id="eventType"
            name="eventType"
            defaultValue={item?.eventType ?? ""}
            placeholder="e.g. summit, workshop, webinar"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">Shown on the public registration page.</p>
        </div>
        <div className="hidden sm:block" aria-hidden />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="venueName" className="block text-sm font-medium text-slate-700">
            Venue name
          </label>
          <input
            id="venueName"
            name="venueName"
            defaultValue={item?.venueName ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="venueAddress" className="block text-sm font-medium text-slate-700">
            Venue address
          </label>
          <input
            id="venueAddress"
            name="venueAddress"
            defaultValue={item?.venueAddress ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-slate-700">
            Image URL
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="image"
              name="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="media-... or /uploads/event.jpg"
              className="w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              title="Pick from Media Library"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          </div>
          {imagePreviewLoading ? (
            <p className="mt-2 text-xs text-slate-500">Loading preview…</p>
          ) : imagePreviewUrl ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-600">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- Admin preview; bypass optimizer for /uploads */}
              <img
                src={imagePreviewUrl}
                alt=""
                className="mt-1 max-h-44 max-w-full rounded-lg border border-border bg-slate-50 object-contain object-left"
              />
            </div>
          ) : image.trim() ? (
            <p className="mt-2 text-xs text-amber-800">
              No preview — for <code className="rounded bg-amber-100 px-1">media-…</code> IDs the file must exist in{" "}
              <Link href="/admin/media" className="font-medium underline">
                Media Library
              </Link>
              . You can also paste a <code className="rounded bg-amber-100 px-1">/uploads/…</code> URL.
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-slate-700">
            External link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={item?.link ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-slate-700">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            defaultValue={item?.capacity ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="registrationDeadline" className="block text-sm font-medium text-slate-700">
            Registration deadline
          </label>
          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="date"
            defaultValue={item?.registrationDeadline ? formatDateOnly(item.registrationDeadline) : ""}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-slate-50/80 px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="allowWaitlist"
            value="on"
            defaultChecked={Boolean(item?.allowWaitlist)}
            className="mt-1 h-4 w-4 rounded border-border text-accent-600 focus:ring-accent-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">Allow waitlist when capacity is full</span>
            <span className="mt-0.5 block text-xs text-slate-600">
              Waitlisted guests receive a badge but cannot check in until staff promotes them from the registrations
              table.
            </span>
          </span>
        </label>
      </div>

      <div className="rounded-xl border border-border bg-slate-50/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Agenda</h2>
            <p className="text-xs text-slate-600">Optional schedule shown on the public registration page.</p>
          </div>
          <button
            type="button"
            onClick={addAgendaRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add item
          </button>
        </div>

        {agendaRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No agenda items. Add items to display a schedule to registrants.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {agendaRows.map((row, index) => (
              <li key={index} className="rounded-lg border border-border bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAgendaRow(index)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove agenda item ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-600">Time (optional)</label>
                    <input
                      value={row.time}
                      onChange={(e) => updateAgendaRow(index, "time", e.target.value)}
                      placeholder="09:00"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600">Title *</label>
                    <input
                      value={row.title}
                      onChange={(e) => updateAgendaRow(index, "title", e.target.value)}
                      placeholder="Session title"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <CmsRichTextField
                      label="Description (optional)"
                      editorId={`agenda-item-${index}-description`}
                      initialHtml={row.description}
                      onHtmlChange={(html) =>
                        updateAgendaRow(index, "description", html)
                      }
                      compact
                      showPreviewToggle={false}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-slate-50/80 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Speakers</h2>
        <p className="text-xs text-slate-600">Optional — select team members to highlight on the registration page.</p>
        {teamOptions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No team members yet. Add people under Admin → Team.</p>
        ) : (
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-white p-3">
            {teamOptions.map((m) => (
              <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  name="speakerIds"
                  value={String(m.id)}
                  defaultChecked={selectedSpeakerIds.includes(m.id)}
                  className="rounded border-border text-accent-600 focus:ring-accent-500"
                />
                <span>{m.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={item?.status ?? "draft"}
          className="mt-1 rounded-lg border border-border px-4 py-2 text-slate-900"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <AdminFormStickyActions>
        <SubmitButton isEdit={!!isEdit} />
        {isEdit && item?.slug ? (
          <AdminFormPreviewLink href={`/events/${encodeURIComponent(item.slug)}`}>
            Preview on site
          </AdminFormPreviewLink>
        ) : null}
        <Link
          href="/admin/events"
          className="flex min-h-[44px] items-center rounded-lg border border-border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </AdminFormStickyActions>
      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m: MediaItem) => setImage(m.id)}
      />
    </form>
  );
}
