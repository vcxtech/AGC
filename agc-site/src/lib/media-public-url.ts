/**
 * Map `/uploads/...` paths to Supabase Storage public URLs on Vercel (no local disk).
 */
export function isSupabaseMediaEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
}

export function supabasePublicObjectUrl(objectKey: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = (
    process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"
  ).replace(/^\/+|\/+$/g, "");
  if (!base || !objectKey.trim()) return null;
  const key = objectKey.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${key}`;
}

/** Rewrite `/uploads/foo.jpg` → Supabase public URL when configured. */
export function resolvePublicMediaUrl(urlOrPath: string): string {
  const trimmed = urlOrPath.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (!isSupabaseMediaEnabled()) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (path.startsWith("/uploads/")) {
    const objectKey = `uploads/${path.slice("/uploads/".length)}`;
    const remote = supabasePublicObjectUrl(objectKey);
    if (remote) return remote;
  }

  return path;
}

export function remoteMediaLibraryJsonUrl(): string | null {
  return supabasePublicObjectUrl("media-library.json");
}
