"use client";

import { CmsRichTextField } from "@/components/admin/CmsRichTextField";

type Props = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  hint?: string;
  editorId?: string;
};

/** Rich text field wired to PageContentForm `updateJsonField`. */
export function PageContentJsonRichText({
  label,
  value,
  onChange,
  hint,
  editorId,
}: Props) {
  return (
    <CmsRichTextField
      label={label}
      initialHtml={value}
      onHtmlChange={onChange}
      hint={hint ?? "Headings, lists, and links. No JSON required."}
      editorId={editorId}
      compact
    />
  );
}
