"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageContentJsonRichText } from "@/components/admin/PageContentJsonRichText";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  editorIdPrefix: string;
  hint?: string;
  maxItems?: number;
};

/** Rich text editor for JSON string arrays (replaces one-per-line textareas). */
export function PageContentStringListRichText({
  label,
  items,
  onChange,
  editorIdPrefix,
  hint,
  maxItems = 24,
}: Props) {
  const list = items.length > 0 ? items : [""];

  const updateItem = (index: number, html: string) => {
    const next = [...list];
    next[index] = html;
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [""]);
  };

  const addItem = () => {
    if (list.length >= maxItems) return;
    onChange([...list, ""]);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-medium text-slate-600">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
      <div className="space-y-3">
        {list.map((value, index) => (
          <div
            key={`${editorIdPrefix}-${index}`}
            className="rounded-md border border-border bg-white p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Item {index + 1}
              </span>
              {list.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              ) : null}
            </div>
            <PageContentJsonRichText
              label=""
              editorId={`${editorIdPrefix}-${index}`}
              value={value}
              onChange={(html) => updateItem(index, html)}
            />
          </div>
        ))}
      </div>
      {list.length < maxItems ? (
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      ) : null}
    </div>
  );
}
