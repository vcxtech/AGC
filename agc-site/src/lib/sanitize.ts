/**
 * HTML sanitization - strip dangerous content, allow safe formatting only.
 * Uses `sanitize-html` (Node-safe) instead of jsdom/DOMPurify for Vercel serverless.
 */
import sanitizeHtmlLib from "sanitize-html";

/** Allowed tags for rich text (no script, iframe, etc.) */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
];

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
};

/** Sanitize HTML for safe render. Returns empty string if input is invalid. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== "string") return "";
  try {
    return sanitizeHtmlLib(html, SANITIZE_OPTIONS);
  } catch (e) {
    console.error("[sanitizeHtml] sanitize-html failed; stripping tags instead.", e);
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
