"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { AdminFormPreviewLink } from "../_components/AdminFormPreviewLink";
import { createPublication, updatePublication } from "./actions";
import type { TaxonomyOption } from "@/data/taxonomy-defaults";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { CmsRichTextField } from "@/components/admin/CmsRichTextField";

type PublicationFormProps = {
  typeOptions: TaxonomyOption[];
  item?: {
    id: number;
    title: string;
    slug: string | null;
    excerpt: string | null;
    content?: string | null;
    types: unknown;
    file: string | null;
    image: string | null;
    datePublished: Date | null;
    author: string | null;
    status: string;
  };
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-accent-500 px-6 py-2 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create"}
    </button>
  );
}

export function PublicationForm({ typeOptions, item }: PublicationFormProps) {
  const isEdit = !!item;
  const action = isEdit ? updatePublication.bind(null, item.id) : createPublication;
  const [image, setImage] = useState(item?.image ?? "");
  const [excerptHtml, setExcerptHtml] = useState(item?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(item?.content ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const rawTypes = item?.types as string[] | null | undefined;
  const selectedTypes = new Set(Array.isArray(rawTypes) ? rawTypes : []);

  return (
    <form action={action} className="space-y-6">
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
          Slug (optional)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={item?.slug ?? ""}
          placeholder="auto-generated from title"
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <CmsRichTextField
        label="Excerpt / summary"
        name="excerpt"
        editorId="publication-excerpt"
        initialHtml={excerptHtml}
        onHtmlChange={setExcerptHtml}
        hint="Shown as the lead on the publication detail page."
        compact
      />

      <CmsRichTextField
        label="Full article (optional)"
        name="content"
        editorId="publication-content"
        initialHtml={contentHtml}
        onHtmlChange={setContentHtml}
        hint="Use when the publication has web copy in addition to or instead of a PDF."
        placeholder="Write the publication summary or full text…"
      />

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Types (select any that apply)</legend>
        <p className="mb-3 text-xs text-slate-500">
          Options are defined in <strong>Admin → Taxonomy</strong>. Multiple types are allowed (e.g. Report + Research).
        </p>
        <ul className="space-y-2">
          {typeOptions.map((t) => (
            <li key={t.slug} className="flex items-start gap-3">
              <input
                id={`pub-type-${t.slug}`}
                name="types"
                type="checkbox"
                value={t.slug}
                defaultChecked={selectedTypes.has(t.slug)}
                className="mt-1 h-4 w-4 rounded border-border text-accent-600 focus:ring-accent-500"
              />
              <label htmlFor={`pub-type-${t.slug}`} className="text-sm text-slate-800">
                <span className="font-medium">{t.label}</span>
                {t.description && <span className="block text-xs text-slate-500">{t.description}</span>}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700">
          File URL
        </label>
        <input
          id="file"
          name="file"
          defaultValue={item?.file ?? ""}
          placeholder="/uploads/publication.pdf"
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

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
            placeholder="media-... or /uploads/cover.jpg"
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
        <p className="mt-1 text-xs text-slate-500">Use Media ID (`media-...`) or a `/uploads/...` path.</p>
      </div>

      <div>
        <label htmlFor="datePublished" className="block text-sm font-medium text-slate-700">
          Date Published
        </label>
        <input
          id="datePublished"
          name="datePublished"
          type="date"
          defaultValue={
            item?.datePublished
              ? new Date(item.datePublished).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)
          }
          className="mt-1 rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-slate-700">
          Author
        </label>
        <input
          id="author"
          name="author"
          defaultValue={item?.author ?? ""}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
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
        {isEdit && item.slug ? (
          <AdminFormPreviewLink href={`/publications/${encodeURIComponent(item.slug)}`}>Preview on site</AdminFormPreviewLink>
        ) : null}
        <Link
          href="/admin/publications"
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
