"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { AdminFormPreviewLink } from "../_components/AdminFormPreviewLink";
import { createNews, updateNews } from "./actions";
import type { TaxonomyOption } from "@/data/taxonomy-defaults";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { DocumentPicker, type DocumentItem } from "@/components/DocumentPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useImageFieldPreview } from "@/hooks/useImageFieldPreview";
import { sanitizeHtml } from "@/lib/sanitize";

type NewsFormProps = {
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  item?: {
    id: number;
    title: string;
    slug: string | null;
    image: string | null;
    excerpt: string | null;
    content: string | null;
    author: string | null;
    categories: unknown;
    tags: unknown;
    status: string;
    datePublished: Date | null;
    downloadResources?: unknown;
  };
};

function socialLinksFromDownloadResources(input: unknown): {
  facebook: string;
  x: string;
  linkedin: string;
  instagram: string;
  email: string;
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { facebook: "", x: "", linkedin: "", instagram: "", email: "" };
  }
  const socialRaw = (input as Record<string, unknown>).socialLinks;
  if (!socialRaw || typeof socialRaw !== "object" || Array.isArray(socialRaw)) {
    return { facebook: "", x: "", linkedin: "", instagram: "", email: "" };
  }
  const s = socialRaw as Record<string, unknown>;
  return {
    facebook: typeof s.facebook === "string" ? s.facebook : "",
    x: typeof s.x === "string" ? s.x : "",
    linkedin: typeof s.linkedin === "string" ? s.linkedin : "",
    instagram:
      typeof s.instagram === "string"
        ? s.instagram
        : typeof s.whatsapp === "string"
          ? s.whatsapp
          : "",
    email: typeof s.email === "string" ? s.email : "",
  };
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent-500 px-6 py-2 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create"}
    </button>
  );
}

export function NewsForm({ categoryOptions, tagOptions, item }: NewsFormProps) {
  const isEdit = !!item;
  const action = isEdit ? updateNews.bind(null, item.id) : createNews;
  const [image, setImage] = useState(item?.image ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState(item?.content ?? "");
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const d = item?.downloadResources;
    if (d == null) return [];
    if (Array.isArray(d)) return d as DocumentItem[];
    if (typeof d === "object") {
      const obj = d as Record<string, unknown>;
      if (Array.isArray(obj.downloads)) return obj.downloads as DocumentItem[];
      return [d as DocumentItem];
    }
    return [];
  });
  const { previewUrl: imagePreviewUrl, loading: imagePreviewLoading } =
    useImageFieldPreview(image);

  const selectedCategories = new Set(
    (item?.categories as string[] | null) || [],
  );

  const tags = (item?.tags as string[] | null) || [];
  const socialLinks = socialLinksFromDownloadResources(item?.downloadResources);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="content" value={contentHtml} />

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-700"
        >
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
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-slate-700"
        >
          Slug (optional, auto-generated from title)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={item?.slug ?? ""}
          placeholder="my-article-slug"
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-slate-700"
        >
          Image URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="image"
            name="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="media-... or /uploads/news.jpg"
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
        <p className="mt-1 text-xs text-slate-500">
          Use Media ID (`media-...`) or a path like `/uploads/filename.jpg`.
        </p>
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
            No preview — for{" "}
            <code className="rounded bg-amber-100 px-1">media-…</code> IDs the
            file must exist in{" "}
            <Link href="/admin/media" className="font-medium underline">
              Media Library
            </Link>
            . You can also paste a{" "}
            <code className="rounded bg-amber-100 px-1">/uploads/…</code> URL.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-slate-50/80 p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          News descriptions
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Use a short description for cards/lists and full content for the
          article page.
        </p>
        <div className="mt-4">
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-slate-700"
          >
            Short description
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            defaultValue={item?.excerpt ?? ""}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="news-content-editor"
            className="block text-sm font-medium text-slate-700"
          >
            Full description
          </label>
          <button
            type="button"
            onClick={() => setShowContentPreview((v) => !v)}
            className="text-sm font-medium text-accent-600 hover:text-accent-700"
          >
            {showContentPreview ? "Hide preview" : "Preview content"}
          </button>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Rich text (headings, lists, links). Output is sanitized on the public
          article page.
        </p>
        <div className="mt-2">
          <RichTextEditor
            key={item?.id ?? "new"}
            editorId="news-content-editor"
            initialHtml={item?.content ?? ""}
            onHtmlChange={setContentHtml}
            placeholder="Write the article…"
          />
        </div>
        {showContentPreview ? (
          <div
            className="mt-3 rounded-lg border border-border bg-[#fffcf7] p-4 text-slate-800 [&_a]:text-accent-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
          />
        ) : null}
      </div>

      <div>
        <label
          htmlFor="author"
          className="block text-sm font-medium text-slate-700"
        >
          Author
        </label>
        <input
          id="author"
          name="author"
          defaultValue={item?.author ?? ""}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Categories (select any that apply)
        </legend>
        <p className="mb-3 text-xs text-slate-500">
          Options are defined in <strong>Admin → Taxonomy</strong>. You can
          select multiple categories.
        </p>
        <ul className="space-y-2">
          {categoryOptions.map((c) => (
            <li key={c.slug} className="flex items-start gap-3">
              <input
                id={`cat-${c.slug}`}
                name="categories"
                type="checkbox"
                value={c.slug}
                defaultChecked={selectedCategories.has(c.slug)}
                className="mt-1 h-4 w-4 rounded border-border text-accent-600 focus:ring-accent-500"
              />
              <label
                htmlFor={`cat-${c.slug}`}
                className="text-sm text-slate-800"
              >
                <span className="font-medium">{c.label}</span>
                {c.description && (
                  <span className="block text-xs text-slate-500">
                    {c.description}
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-slate-700"
        >
          Tags (comma-separated slugs)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={tags.join(", ")}
          placeholder="governance, ghana"
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
        <p className="mt-1 text-xs text-slate-500">
          Suggested slugs: {tagOptions.map((t) => t.slug).join(", ")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Document downloads (PDFs, reports, files)
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Upload documents from your device or select from the media library.
          Documents will be available as downloads on the news page.
        </p>
        <div className="mt-3">
          <DocumentPicker
            documents={documents}
            onDocumentsChange={setDocuments}
          />
        </div>
      </div>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">
          Sidebar social links (per article)
        </legend>
        <p className="mb-3 text-xs text-slate-500">
          Optional override for this article’s social icons. Leave blank to use
          default share links.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="socialFacebook"
              className="block text-sm font-medium text-slate-700"
            >
              Facebook URL
            </label>
            <input
              id="socialFacebook"
              name="socialFacebook"
              defaultValue={socialLinks.facebook}
              placeholder="https://facebook.com/..."
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label
              htmlFor="socialX"
              className="block text-sm font-medium text-slate-700"
            >
              X URL
            </label>
            <input
              id="socialX"
              name="socialX"
              defaultValue={socialLinks.x}
              placeholder="https://x.com/..."
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label
              htmlFor="socialLinkedin"
              className="block text-sm font-medium text-slate-700"
            >
              LinkedIn URL
            </label>
            <input
              id="socialLinkedin"
              name="socialLinkedin"
              defaultValue={socialLinks.linkedin}
              placeholder="https://linkedin.com/..."
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
          <div>
            <label
              htmlFor="socialInstagram"
              className="block text-sm font-medium text-slate-700"
            >
              Instagram URL
            </label>
            <input
              id="socialInstagram"
              name="socialInstagram"
              defaultValue={socialLinks.instagram}
              placeholder="https://instagram.com/..."
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="socialEmail"
              className="block text-sm font-medium text-slate-700"
            >
              Email link
            </label>
            <input
              id="socialEmail"
              name="socialEmail"
              defaultValue={socialLinks.email}
              placeholder="mailto:info@example.com"
              className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="datePublished"
          className="block text-sm font-medium text-slate-700"
        >
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
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700"
        >
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
          <AdminFormPreviewLink href={`/news/${encodeURIComponent(item.slug)}`}>
            Preview on site
          </AdminFormPreviewLink>
        ) : null}
        <Link
          href="/admin/news"
          className="flex min-h-11 items-center rounded-lg border border-border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
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
