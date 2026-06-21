"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  /** Form field name — renders a hidden input when set. */
  name?: string;
  initialHtml: string;
  onHtmlChange: (html: string) => void;
  placeholder?: string;
  hint?: string;
  editorId?: string;
  className?: string;
  compact?: boolean;
  showPreviewToggle?: boolean;
};

export function CmsRichTextField({
  label,
  name,
  initialHtml,
  onHtmlChange,
  placeholder,
  hint,
  editorId,
  className,
  compact,
  showPreviewToggle = true,
}: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [showPreview, setShowPreview] = useState(false);

  function handleChange(next: string) {
    setHtml(next);
    onHtmlChange(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label ? (
          <label
            htmlFor={editorId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : (
          <span />
        )}
        {showPreviewToggle ? (
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="text-xs font-medium text-accent-600 hover:text-accent-700"
          >
            {showPreview ? "Hide preview" : "Preview"}
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {name ? <input type="hidden" name={name} value={html} /> : null}
      <RichTextEditor
        editorId={editorId}
        initialHtml={initialHtml}
        onHtmlChange={handleChange}
        placeholder={placeholder}
        compact={compact}
      />
      {showPreview && html.trim() ? (
        <div
          className="rounded-lg border border-border bg-[#fffcf7] p-4 text-sm text-slate-800 [&_a]:text-accent-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-2 [&_h3]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      ) : null}
    </div>
  );
}
