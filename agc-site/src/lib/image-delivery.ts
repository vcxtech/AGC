/**
 * Local media under `/public/uploads` should not go through the Next.js image optimizer
 * unless the deployment hostname is fully covered by `next.config` `images.remotePatterns`.
 * Relative `/uploads/*` paths use `localPatterns` and are optimized in production by default.
 * Set `NEXT_PUBLIC_IMAGE_UNOPTIMIZED_UPLOADS=1` to restore legacy full-size delivery.
 */
export function isLocalUploadImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/uploads/")) return true;
  try {
    if (src.includes("/uploads/")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function isAbsoluteUploadUrl(src: string): boolean {
  return /^https?:\/\//i.test(src) && src.includes("/uploads/");
}

function isSameOriginUploadUrl(src: string): boolean {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!site || !isAbsoluteUploadUrl(src)) return false;
  try {
    return new URL(src).origin === new URL(site).origin;
  } catch {
    return false;
  }
}

/** SVG is always passed through unoptimized for predictable rendering. */
export function preferUnoptimizedImage(src: string): boolean {
  if (!src) return false;
  if (src.endsWith(".svg")) return true;

  if (process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED_UPLOADS === "1") {
    return isLocalUploadImageSrc(src);
  }

  // Relative uploads — optimized via next.config `localPatterns`.
  if (src.startsWith("/uploads/")) return false;

  // Absolute upload URLs on unknown hosts (e.g. staging without remotePatterns) — skip optimizer.
  if (isAbsoluteUploadUrl(src)) {
    return !isSameOriginUploadUrl(src);
  }

  return false;
}

/** Seeded Programs/Projects used this path as “no custom image”; cards should hide the image strip. */
export const UPLOADS_PLACEHOLDER_SVG = "/uploads/placeholder.svg";

/** True for the default SVG placeholder or empty refs — hide in heroes instead of flashing “Image placeholder”. */
export function isPlaceholderHeroSrc(src: string | undefined | null): boolean {
  const u = src?.trim();
  if (!u) return true;
  if (u === UPLOADS_PLACEHOLDER_SVG) return true;
  return u.endsWith("/placeholder.svg");
}

/** Use after `resolveImageUrl`: no image area when empty or default placeholder. */
export function cardImageUrlOrNull(resolved: string | null | undefined): string | null {
  const u = resolved?.trim();
  if (!u || isPlaceholderHeroSrc(u)) return null;
  return u;
}
