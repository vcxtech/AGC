"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";
import { AdminFormPreviewLink } from "../_components/AdminFormPreviewLink";
import { createProgram, updateProgram } from "./actions";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";
import { CmsRichTextField } from "@/components/admin/CmsRichTextField";

type ProgramFormProps = {
  item?: {
    id: number;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
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
      {pending ? "Saving…" : isEdit ? "Update" : "Create"}
    </button>
  );
}

export function ProgramForm({ item }: ProgramFormProps) {
  const isEdit = !!item;
  const action = isEdit ? updateProgram.bind(null, item.id) : createProgram;
  const [image, setImage] = useState(item?.image ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState(item?.description ?? "");

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title *</label>
        <input
          id="title"
          name="title"
          defaultValue={item?.title}
          required
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <CmsRichTextField
        label="Description"
        name="description"
        editorId="program-description"
        initialHtml={descriptionHtml}
        onHtmlChange={setDescriptionHtml}
        compact
      />

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-slate-700">Image URL</label>
        <div className="mt-1 flex gap-2">
          <input
            id="image"
            name="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="media-... or /uploads/program.jpg"
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
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-slate-700">Order</label>
        <input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={item?.order ?? 0}
          className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-slate-900"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
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
        {isEdit ? <AdminFormPreviewLink href="/our-work#programs">Preview on site</AdminFormPreviewLink> : null}
        <a
          href="/admin/programs"
          className="flex min-h-[44px] items-center rounded-lg border border-border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </a>
      </AdminFormStickyActions>
      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m: MediaItem) => setImage(m.id)}
      />
    </form>
  );
}
