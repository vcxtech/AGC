import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getUploadsDir } from "@/lib/media";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".txt": "text/plain",
  ".csv": "text/csv",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> },
) {
  try {
    const { file } = await params;
    if (!Array.isArray(file) || file.length === 0) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      );
    }

    // Prevent traversal outside the uploads directory.
    if (
      file.some(
        (segment) =>
          segment === ".." || segment.includes("/") || segment.includes("\\"),
      )
    ) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const relativePath = path.join(...file);
    const uploadsDir = getUploadsDir();
    const absolutePath = path.join(uploadsDir, relativePath);
    const normalizedUploadsDir = path.resolve(uploadsDir);
    const normalizedAbsolutePath = path.resolve(absolutePath);

    if (
      !normalizedAbsolutePath.startsWith(`${normalizedUploadsDir}${path.sep}`)
    ) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!existsSync(normalizedAbsolutePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(normalizedAbsolutePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(normalizedAbsolutePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Upload file serve error:", err);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
