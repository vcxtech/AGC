/**
 * Media Library - WordPress-style central image management
 * Images stored in public/uploads/, metadata in data/media-library.json
 */
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { MAX_MEDIA_UPLOAD_BYTES } from "@/lib/media-limits";
import {
  isSupabaseMediaEnabled,
  remoteMediaLibraryJsonUrl,
  resolvePublicMediaUrl,
} from "@/lib/media-public-url";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const METADATA_PATH = path.join(process.cwd(), "data", "media-library.json");

export { MAX_MEDIA_UPLOAD_BYTES } from "@/lib/media-limits";

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  uploadedAt: string;
}

const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
  "text/csv",
];
let metadataWriteQueue: Promise<unknown> = Promise.resolve();

async function ensureDirs(): Promise<void> {
  await mkdir(path.dirname(METADATA_PATH), { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
}

async function loadMediaLibraryJson(raw: string): Promise<MediaItem[]> {
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

async function listMediaFromSupabase(): Promise<MediaItem[]> {
  const url = remoteMediaLibraryJsonUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return loadMediaLibraryJson(await res.text());
  } catch {
    return [];
  }
}

export async function listMedia(): Promise<MediaItem[]> {
  try {
    if (existsSync(METADATA_PATH)) {
      const raw = await readFile(METADATA_PATH, "utf-8");
      return loadMediaLibraryJson(raw);
    }
    if (isSupabaseMediaEnabled()) {
      return listMediaFromSupabase();
    }
    return [];
  } catch {
    return [];
  }
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const items = await listMedia();
  const normalized = id.trim();
  if (!normalized) return null;
  const exact = items.find((m) => m.id === normalized);
  if (exact) return exact;
  return (
    items.find((m) => m.id.trim().toLowerCase() === normalized.toLowerCase()) ??
    null
  );
}

/**
 * If library JSON is missing an entry but the binary was uploaded (e.g. JSON reset,
 * Docker vs host dev, or manual copy), resolve `/uploads/<id>.<ext>` when a file matches.
 */
async function findUploadUrlForMediaIdOnDisk(
  mediaId: string,
): Promise<string | null> {
  const dir = getUploadsDir();
  if (!existsSync(dir)) return null;
  const prefix = mediaId.trim();
  if (!prefix || !/^media-/i.test(prefix)) return null;
  try {
    const files = await readdir(dir);
    const match = files.find(
      (f) =>
        f === prefix ||
        f.startsWith(`${prefix}.`) ||
        f.toLowerCase().startsWith(`${prefix.toLowerCase()}.`),
    );
    if (match && !match.includes("..")) {
      return `/uploads/${match}`;
    }
  } catch {
    return null;
  }
  return null;
}

/** Resolve media-xxx ID to full URL (for use in components) */
export async function getMediaUrlById(
  id: string | undefined,
): Promise<string | null> {
  const t = id?.trim();
  if (!t || !/^media-/i.test(t)) return null;
  const item = await getMediaById(t);
  if (item) return getMediaUrl(item);
  return findUploadUrlForMediaIdOnDisk(t);
}

export async function saveMediaMetadata(items: MediaItem[]): Promise<void> {
  await ensureDirs();
  await writeFile(METADATA_PATH, JSON.stringify(items, null, 2), "utf-8");
}

async function withMediaMetadataWriteLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const run = metadataWriteQueue.then(operation, operation);
  metadataWriteQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function addMediaItem(item: MediaItem): Promise<void> {
  await withMediaMetadataWriteLock(async () => {
    const items = await listMedia();
    items.unshift(item);
    await saveMediaMetadata(items);
  });
}

export async function removeMediaItem(id: string): Promise<boolean> {
  return withMediaMetadataWriteLock(async () => {
    const items = await listMedia();
    const idx = items.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    await saveMediaMetadata(items);
    return true;
  });
}

export async function updateMediaItem(
  id: string,
  patch: { alt?: string; title?: string },
): Promise<MediaItem | null> {
  return withMediaMetadataWriteLock(async () => {
    const items = await listMedia();
    const idx = items.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const current = items[idx];
    const next: MediaItem = {
      ...current,
      ...(patch.alt !== undefined ? { alt: patch.alt } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
    };
    items[idx] = next;
    await saveMediaMetadata(items);
    return next;
  });
}

export function getMediaUrl(item: MediaItem): string {
  const local = item.url.startsWith("/")
    ? item.url
    : `/${item.url.replace(/^\//, "")}`;
  return resolvePublicMediaUrl(local);
}

/** Single segment under uploads/ (flat library); rejects traversal. */
function uploadsBasename(segment: string | undefined): string | null {
  if (!segment?.trim()) return null;
  const base = path.basename(segment.trim().replace(/^\/+/, ""));
  if (!base || base === "." || base === ".." || base.includes(".."))
    return null;
  return base;
}

/**
 * True if the binary exists on disk. Checks both `filename` and path derived from `url`
 * so legacy or inconsistent JSON still detects missing files correctly.
 */
export function mediaFileExistsOnDisk(
  item: MediaItem,
  uploadsDir: string,
): boolean {
  const names = new Set<string>();
  const fromFilename = uploadsBasename(item.filename);
  if (fromFilename) names.add(fromFilename);
  if (item.url?.startsWith("/uploads/")) {
    const fromUrl = uploadsBasename(item.url.slice("/uploads/".length));
    if (fromUrl) names.add(fromUrl);
  }
  for (const n of names) {
    if (existsSync(path.join(uploadsDir, n))) return true;
  }
  return false;
}

/** Resolve image reference: media ID (media-xxx), full URL, or path. Use for server components. */
export async function resolveImageUrl(
  ref: string | { id: string } | undefined,
): Promise<string | null> {
  if (ref === undefined || ref === null) return null;
  const id =
    typeof ref === "object"
      ? ref?.id?.trim()
      : typeof ref === "string"
        ? ref.trim()
        : "";
  if (!id) return null;
  if (/^media-/i.test(id)) return getMediaUrlById(id);
  if (id.startsWith("http")) return id;
  if (id.startsWith("/")) return resolvePublicMediaUrl(id);
  // Content layer paths (uploads/xxx)
  if (id.includes("/") || id.startsWith("uploads")) {
    const path = id.startsWith("/") ? id : `/${id}`;
    return resolvePublicMediaUrl(path);
  }
  return null;
}

export function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_TYPES.includes(mime);
}

export function isImageMimeType(mime: string): boolean {
  return [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ].includes(mime);
}

export function isDocumentMimeType(mime: string): boolean {
  return !isImageMimeType(mime) && ALLOWED_TYPES.includes(mime);
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

export function assertUploadWithinLimit(size: number): void {
  if (size > MAX_MEDIA_UPLOAD_BYTES) {
    throw new Error(
      `File too large. Maximum size is ${Math.round(MAX_MEDIA_UPLOAD_BYTES / (1024 * 1024))} MB.`,
    );
  }
}
