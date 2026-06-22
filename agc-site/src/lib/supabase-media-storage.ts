import type { MediaItem } from "@/lib/media";
import { isSupabaseMediaEnabled } from "@/lib/media-public-url";

type SupabaseConfig = {
  url: string;
  key: string;
  bucket: string;
};

function getSupabaseConfig(): SupabaseConfig | null {
  if (!isSupabaseMediaEnabled()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = (
    process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"
  ).replace(/^\/+|\/+$/g, "");
  if (!url || !key || !bucket) return null;
  return { url, key, bucket };
}

/** True when public Supabase URLs are configured and the server can write to Storage. */
export function isSupabaseUploadEnabled(): boolean {
  return getSupabaseConfig() !== null;
}

function storageObjectUrl(cfg: SupabaseConfig, objectKey: string): string {
  const encoded = objectKey
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${cfg.url}/storage/v1/object/${cfg.bucket}/${encoded}`;
}

async function supabaseStorageRequest(
  method: string,
  objectKey: string,
  body?: BodyInit,
  contentType?: string,
): Promise<Response> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    throw new Error("Supabase Storage upload is not configured.");
  }
  return fetch(storageObjectUrl(cfg, objectKey), {
    method,
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
      "x-upsert": "true",
    },
    body,
  });
}

export async function uploadSupabaseObject(
  objectKey: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const res = await supabaseStorageRequest(
    "POST",
    objectKey,
    new Uint8Array(buffer),
    contentType,
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Supabase upload failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
}

export async function uploadMediaLibraryJson(items: MediaItem[]): Promise<void> {
  const body = JSON.stringify(items, null, 2);
  const res = await supabaseStorageRequest(
    "POST",
    "media-library.json",
    body,
    "application/json",
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Supabase media-library.json save failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
}

export async function deleteSupabaseObject(objectKey: string): Promise<void> {
  const cfg = getSupabaseConfig();
  if (!cfg) return;
  const encoded = objectKey
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = `${cfg.url}/storage/v1/object/${cfg.bucket}/${encoded}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${cfg.key}` },
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Supabase delete failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
}
