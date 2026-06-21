/** True when the string looks like HTML from TipTap (not legacy plain text). */
export function isRichTextHtml(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /<(?:p|h[1-6]|ul|ol|li|blockquote|br|strong|em|a)\b/i.test(value);
}

/** Wrap legacy plain text as a single paragraph for display. */
export function plainTextToHtml(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) return "";
  if (isRichTextHtml(raw)) return raw;
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<p>${escaped.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
}

/** Strip tags for meta descriptions and previews. */
export function richTextToPlain(value: string | null | undefined, maxLen?: number): string {
  const plain = (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (maxLen && plain.length > maxLen) return `${plain.slice(0, maxLen - 1)}…`;
  return plain;
}

/** Prefer stored HTML; otherwise build from legacy paragraph arrays. */
export function resolveRichHtml(options: {
  html?: string | null;
  paragraphs?: string[];
  fallbackParagraphs?: readonly string[];
}): string {
  const raw = options.html?.trim();
  if (raw) return plainTextToHtml(raw);
  if (options.paragraphs?.length) {
    return options.paragraphs.map((p) => plainTextToHtml(p)).join("");
  }
  if (options.fallbackParagraphs?.length) {
    return options.fallbackParagraphs.map((p) => plainTextToHtml(p)).join("");
  }
  return "";
}

/** Initial editor value when migrating from line-based paragraphs to HTML. */
export function richTextFieldInitial(body: unknown, paragraphs: unknown): string {
  if (typeof body === "string" && body.trim()) return body;
  if (Array.isArray(paragraphs)) {
    return paragraphs
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .join("\n\n");
  }
  return "";
}

/** Split legacy line-based paragraphs or HTML into renderable blocks. */
export function resolveLeadHtml(options: {
  leadBody?: string;
  leadParagraphs?: string[];
  intro?: string;
  description?: string;
  fallbackParagraphs?: readonly string[];
}): string {
  const { leadBody, leadParagraphs, intro, description, fallbackParagraphs } = options;
  if (leadBody?.trim()) return plainTextToHtml(leadBody);
  if (intro?.trim() || description?.trim()) {
    const parts = [intro, description].filter(Boolean).map((p) => plainTextToHtml(p!));
    return parts.join("");
  }
  if (leadParagraphs?.length) {
    return leadParagraphs.map((p) => plainTextToHtml(p)).join("");
  }
  if (fallbackParagraphs?.length) {
    return fallbackParagraphs.map((p) => plainTextToHtml(p)).join("");
  }
  return "";
}
