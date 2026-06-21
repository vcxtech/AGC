/**
 * HTML sanitization - strip dangerous content, allow safe formatting only
 */
import DOMPurify from "isomorphic-dompurify";

/** Allowed tags for rich text (no script, iframe, etc.) */
const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li", "h2", "h3", "h4", "blockquote"];

/** Sanitize HTML for safe render. Returns empty string if input is invalid. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== "string") return "";
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  } catch (e) {
    console.error("[sanitizeHtml] DOMPurify failed; stripping tags instead.", e);
    return html.replace(/<[^>]*>/g, "");
  }
}

/** Convert newlines to <br> and escape HTML (for plain text in email body) */
export function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

/** Escape string for use in HTML (e.g. email in email body) */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
