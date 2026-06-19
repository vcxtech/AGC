import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  listMedia,
  addMediaItem,
  removeMediaItem,
  getUploadsDir,
  isAllowedMimeType,
  isImageMimeType,
  isDocumentMimeType,
  assertUploadWithinLimit,
  mediaFileIsAvailable,
  type MediaItem,
} from "@/lib/media";
import { requireAdmin } from "@/lib/auth-api";
import {
  parseOptionalDimensionsFromForm,
  probeRasterDimensions,
} from "@/lib/image-dimensions";
import { formatMaxUploadBytes } from "@/lib/media-limits";

function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  const head = buffer
    .subarray(0, Math.min(buffer.length, 1024))
    .toString("utf8")
    .trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) {
    return "image/svg+xml";
  }
  return null;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const items = await listMedia();
    const uploadsDir = getUploadsDir();
    const itemsWithDisk = items.map((item) => ({
      ...item,
      fileMissing: !mediaFileIsAvailable(item, uploadsDir),
    }));
    return NextResponse.json({ items: itemsWithDisk });
  } catch (err) {
    console.error("Media list error:", err);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = (formData.get("alt") as string) || undefined;
    const title = (formData.get("title") as string) || undefined;
    const widthForm = formData.get("width");
    const heightForm = formData.get("height");

    if (!file || !(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      assertUploadWithinLimit(file.size);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "File too large.";
      return NextResponse.json(
        { error: `${msg} Limit: ${formatMaxUploadBytes()}.` },
        { status: 400 },
      );
    }

    const mime = file.type || "application/octet-stream";
    if (!isAllowedMimeType(mime)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, PDF, Word, Excel, PowerPoint, ZIP, CSV, TXT",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let detectedMime = mime;
    let ext = "bin";

    // For images, detect MIME type from buffer
    if (isImageMimeType(mime)) {
      const bufferDetectedMime = detectMimeFromBuffer(buffer);
      if (
        !bufferDetectedMime ||
        !isImageMimeType(bufferDetectedMime) ||
        (mime !== "application/octet-stream" && mime !== bufferDetectedMime)
      ) {
        return NextResponse.json(
          { error: "File content does not match an allowed image format." },
          { status: 400 },
        );
      }
      detectedMime = bufferDetectedMime;
      ext =
        detectedMime === "image/svg+xml"
          ? "svg"
          : detectedMime.split("/")[1] || "jpg";
    } else if (isDocumentMimeType(mime)) {
      // For documents, extract extension from filename or MIME type
      const nameExt = path.extname(file.name).toLowerCase().slice(1);
      if (nameExt) {
        ext = nameExt;
      } else {
        // Fallback: extract from MIME type
        const mimeExt: Record<string, string> = {
          "application/pdf": "pdf",
          "application/msword": "doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "docx",
          "application/vnd.ms-excel": "xls",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "xlsx",
          "application/vnd.ms-powerpoint": "ppt",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            "pptx",
          "application/zip": "zip",
          "text/plain": "txt",
          "text/csv": "csv",
        };
        ext = mimeExt[mime] || "bin";
      }
    }

    const id = `media-${randomUUID()}`;
    const filename = `${id}.${ext}`;
    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, filename);

    await mkdir(uploadsDir, { recursive: true });

    // Probe dimensions only for images
    const fromForm = parseOptionalDimensionsFromForm(
      typeof widthForm === "string" ? widthForm : undefined,
      typeof heightForm === "string" ? heightForm : undefined,
    );
    const probed =
      isImageMimeType(detectedMime) && detectedMime !== "image/svg+xml"
        ? probeRasterDimensions(buffer, detectedMime)
        : {};
    const width = isImageMimeType(detectedMime)
      ? (fromForm.width ?? probed.width)
      : undefined;
    const height = isImageMimeType(detectedMime)
      ? (fromForm.height ?? probed.height)
      : undefined;

    const url = `/uploads/${filename}`;
    const item: MediaItem = {
      id,
      filename,
      url,
      alt,
      title,
      size: file.size,
      mimeType: detectedMime,
      uploadedAt: new Date().toISOString(),
      ...(width && height ? { width, height } : {}),
    };

    try {
      // Metadata first, then file write; rollback metadata if the binary write fails.
      await addMediaItem(item);
      await writeFile(filePath, buffer);
    } catch (persistErr) {
      try {
        await unlink(filePath);
      } catch {
        // Ignore if the file was not created.
      }
      try {
        await removeMediaItem(id);
      } catch {
        // Best-effort rollback; leave a server log for operators.
      }
      throw persistErr;
    }

    return NextResponse.json({ item: { ...item, fileMissing: false } });
  } catch (err) {
    console.error("Media upload error:", err);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
