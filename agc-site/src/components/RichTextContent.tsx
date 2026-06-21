import { sanitizeHtml } from "@/lib/sanitize";
import { plainTextToHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type Props = {
  html?: string | null;
  className?: string;
  /** When true, wrap legacy plain text automatically. Default true. */
  allowPlainText?: boolean;
};

const PROSE =
  "rich-text-content [&_p]:page-prose [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h2]:page-heading [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:page-prose [&_blockquote]:border-l-4 [&_blockquote]:border-accent-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:font-medium [&_a]:text-accent-800 [&_a]:underline [&_a]:decoration-accent-300 [&_a]:underline-offset-4";

export function RichTextContent({ html, className, allowPlainText = true }: Props) {
  const raw = html?.trim();
  if (!raw) return null;
  const safe = sanitizeHtml(allowPlainText ? plainTextToHtml(raw) : raw);
  if (!safe.trim()) return null;
  return (
    <div
      className={cn(PROSE, className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
