"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Check,
  Upload,
  Loader2,
  FileIcon,
  FileArchive,
  File,
} from "lucide-react";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  formatMaxUploadBytes,
} from "@/lib/media-limits";
import { rasterDimensionsFromFile } from "@/lib/media-upload-client";
import {
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  title?: string;
  uploadedAt?: string;
  width?: number;
  height?: number;
  /** True when metadata exists but the file is not under public/uploads (volume / deploy mismatch). */
  fileMissing?: boolean;
};

type ImagePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
};

export function ImagePicker({ open, onClose, onSelect }: ImagePickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [thumbFailed, setThumbFailed] = useState<Record<string, true>>({});

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else setError(data?.error || "Failed to load media library.");
    } catch {
      setError("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  // const handleUpload = useCallback(
  //   async (files: FileList | File[]) => {
  //     const fileList = Array.isArray(files) ? files : Array.from(files);
  //     const imageFiles = fileList.filter((f) =>
  //       ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"].includes(f.type)
  //     );
  //     if (imageFiles.length === 0) {
  //       setError("Please select image files (JPEG, PNG, GIF, WebP, SVG).");
  //       return;
  //     }

  //     setUploading(true);
  //     setError(null);
  //     try {
  //       for (const file of imageFiles) {
  //         if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
  //           setError(`"${file.name}" is too large. Maximum size is ${formatMaxUploadBytes()}.`);
  //           continue;
  //         }
  //         const formData = new FormData();
  //         formData.append("file", file);
  //         const dims = await rasterDimensionsFromFile(file);
  //         if (dims.width) formData.append("width", dims.width);
  //         if (dims.height) formData.append("height", dims.height);
  //         const res = await fetch("/api/media", { method: "POST", body: formData });
  //         const data = await res.json();
  //         if (res.ok && data.item) {
  //           setItems((prev) => [{ ...(data.item as MediaItem), fileMissing: false }, ...prev]);
  //         } else {
  //           setError(data?.error || `Upload failed for ${file.name}`);
  //         }
  //       }
  //     } catch {
  //       setError("Upload failed. Please try again.");
  //     } finally {
  //       setUploading(false);
  //     }
  //   },
  //   []
  // );

  const isDocument = (filename: string): boolean => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return /^(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|csv)$/.test(ext);
  };

  const getDocumentIcon = (filename: string): React.ReactNode => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf":
        return <FileIcon />;
      case "doc":
      case "docx":
        return <FaFileWord />;
      case "xls":
      case "xlsx":
        return <FaFileExcel />;
      case "ppt":
      case "pptx":
        return <FaFilePowerpoint />;
      case "zip":
        return <FileArchive />;
      case "csv":
      case "txt":
        return <FaFileAlt />;
      default:
        return <File />;
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    const fileList = Array.isArray(files) ? files : Array.from(files);
    const supportedFiles = fileList.filter((f) => {
      const type = f.type;
      const name = f.name.toLowerCase();
      // Images
      if (
        [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ].includes(type)
      )
        return true;
      // Documents
      if (
        [
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
        ].includes(type)
      )
        return true;
      // Fallback: check by extension
      return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|csv)$/i.test(name);
    });
    if (supportedFiles.length === 0) {
      setError(
        "Please select image files (JPEG, PNG, GIF, WebP, SVG) or documents (PDF, Word, Excel, PowerPoint, ZIP, CSV, TXT).",
      );
      return;
    }
    setUploading(true);
    setError(null);
    for (const file of supportedFiles) {
      if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
        setError(
          `"${file.name}" is too large. Maximum size is ${formatMaxUploadBytes()}.`,
        );
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      const dims = await rasterDimensionsFromFile(file);
      if (dims.width) formData.append("width", dims.width);
      if (dims.height) formData.append("height", dims.height);
      try {
        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.item) {
          setItems((prev) => [data.item, ...prev]);
        } else {
          setError(data.error || "Upload failed");
        }
      } catch {
        setError("Upload failed");
      }
    }
    setUploading(false);
  };

  useEffect(() => {
    if (open) {
      setError(null);
      setThumbFailed({});
      fetchMedia();
    }
  }, [open, fetchMedia]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((item) =>
          [item.filename, item.title || "", item.alt || "", item.id]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : items;
    return [...filtered].sort((a, b) => {
      if (sortBy === "name")
        return (a.title || a.filename).localeCompare(b.title || b.filename);
      const at = new Date(a.uploadedAt || 0).getTime();
      const bt = new Date(b.uploadedAt || 0).getTime();
      return sortBy === "oldest" ? at - bt : bt - at;
    });
  }, [items, query, sortBy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-slate-900">
            Select from Media Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="mb-5 rounded-xl border border-border bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="picker-upload"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload from computer"}
              </label>
              <input
                id="picker-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files?.length) void handleUpload(files);
                  e.target.value = "";
                }}
              />
              <Link
                href="/admin/media"
                className="text-sm font-medium text-accent-700 hover:underline"
              >
                Open full Media Library
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search filename, title, alt, ID"
                className="w-64 rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900"
                aria-label="Search media picker"
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "name")
                }
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900"
                aria-label="Sort media picker"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Max {formatMaxUploadBytes()} per file. Upload then click an image
              to use it in this form. If a row shows “file missing”, the
              database lists it but the binary is not on this server (check
              Docker/Coolify{" "}
              <strong className="font-medium">uploads volume</strong> is mounted
              at{" "}
              <code className="rounded bg-slate-200/80 px-1">
                public/uploads
              </code>
              ).
            </p>
            {error ? (
              <p className="mt-2 text-xs text-red-700">{error}</p>
            ) : null}
          </div>
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No images in library yet. Upload from your computer above.
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No images match your search.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.fileMissing || thumbFailed[item.id]}
                  title={
                    item.fileMissing || thumbFailed[item.id]
                      ? "File not on disk — remove this entry from Media Library (orphans/cleanup) or restore the volume"
                      : undefined
                  }
                  onClick={() => {
                    if (item.fileMissing || thumbFailed[item.id]) return;
                    onSelect(item);
                    onClose();
                  }}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 transition-all ${
                    item.fileMissing || thumbFailed[item.id]
                      ? "cursor-not-allowed border-amber-300 opacity-90"
                      : "border-transparent hover:border-accent-500 hover:shadow-md"
                  }`}
                >
                  {item.fileMissing || thumbFailed[item.id] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-amber-50/95 p-2 text-center">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-amber-900">
                        {thumbFailed[item.id] && !item.fileMissing
                          ? "Preview failed"
                          : "Missing file"}
                      </span>
                      <span className="text-[0.7rem] leading-tight text-amber-800">
                        Not in uploads folder
                      </span>
                    </div>
                  ) : isDocument(item.filename) ? (
                    <>
                      <div className="absolute inset-0 text-red-400 flex flex-col items-center justify-center gap-2 bg-slate-50">
                        <span className="text-5xl">
                          {getDocumentIcon(item.filename)}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                          {item.filename.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                        <span className="rounded-full bg-white p-2 text-accent-600">
                          <Check className="h-6 w-6" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- Picker thumbs: bypass optimizer (dev 400 on /uploads). */}
                      <img
                        src={item.url}
                        alt={item.alt || item.title || item.filename}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={() =>
                          setThumbFailed((p) => ({ ...p, [item.id]: true }))
                        }
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                        <span className="rounded-full bg-white p-2 text-accent-600">
                          <Check className="h-6 w-6" />
                        </span>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
