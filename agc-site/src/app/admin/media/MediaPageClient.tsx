"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Copy,
  Trash2,
  Check,
  ImagePlus,
  Pencil,
  Save,
  X,
  FileIcon,
  File,
  FileArchive,
} from "lucide-react";
import {
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { OrphanMediaPanel } from "../_components/OrphanMediaPanel";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  formatMaxUploadBytes,
} from "@/lib/media-limits";
import { rasterDimensionsFromFile } from "@/lib/media-upload-client";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  title?: string;
  size?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  fileMissing?: boolean;
};

const MEDIA_PAGE_SIZE = 24;

export default function AdminMediaPageClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metaDraft, setMetaDraft] = useState<{ alt: string; title: string }>({
    alt: "",
    title: "",
  });
  const [savingMetaId, setSavingMetaId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  /** Thumbnail 404 / network errors after API said file exists (CDN, race, or path drift). */
  const [thumbLoadFailed, setThumbLoadFailed] = useState<Record<string, true>>(
    {},
  );

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else setError(data.error || "Failed to load");
    } catch {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this image? It must not be used on any page or content item.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setItems((prev) => prev.filter((m) => m.id !== id));
      else if (res.status === 409 && Array.isArray(data.references)) {
        const lines = data.references.map(
          (r: { kind: string; label: string; href: string }) =>
            `• ${r.kind}: ${r.label}`,
        );
        setError(
          `${data.error || "Cannot delete — in use."}\n${lines.join("\n")}`,
        );
      } else {
        setError(data.error || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
  };

  const startEditMetadata = (item: MediaItem) => {
    setEditingId(item.id);
    setMetaDraft({ alt: item.alt || "", title: item.title || "" });
  };

  const saveMetadata = async (id: string) => {
    setSavingMetaId(id);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: metaDraft.alt,
          title: metaDraft.title,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to update metadata");
        return;
      }
      if (data.item) {
        setItems((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...data.item } : m)),
        );
      }
      setEditingId(null);
    } catch {
      setError("Failed to update metadata");
    } finally {
      setSavingMetaId(null);
    }
  };

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
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name")
        return (a.title || a.filename).localeCompare(b.title || b.filename);
      const at = new Date(a.uploadedAt).getTime();
      const bt = new Date(b.uploadedAt).getTime();
      return sortBy === "oldest" ? at - bt : bt - at;
    });
    return sorted;
  }, [items, query, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleItems.length / MEDIA_PAGE_SIZE),
  );
  const pagedItems = visibleItems.slice(
    (page - 1) * MEDIA_PAGE_SIZE,
    page * MEDIA_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [query, sortBy, items.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fullUrl = (url: string) =>
    typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

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

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-slate-500">Loading media library…</div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload images and documents and reuse them across news, events, and pages. Select a file to copy its URL or media ID. Deletion is blocked while an asset is referenced; orphaned files (not linked anywhere) can be removed safely."
      />

      <OrphanMediaPanel
        onLibraryItemRemoved={(id) =>
          setItems((prev) => prev.filter((m) => m.id !== id))
        }
      />

      {error && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mt-6 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          dragOver ? "border-accent-500 bg-accent-50" : "border-border bg-white"
        }`}
      >
        <input
          type="file"
          id="media-upload"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,text/plain,text/csv"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files?.length) handleUpload(files);
            e.target.value = "";
          }}
        />
        <label
          htmlFor="media-upload"
          className={`cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <ImagePlus className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 font-medium text-slate-700">
            {uploading ? "Uploading…" : "Drop files here or click to upload"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Images (JPEG, PNG, GIF, WebP, SVG) or documents (PDF, Word, Excel,
            PowerPoint, ZIP, CSV, TXT). Files can be reused across the site.
          </p>
        </label>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-lg font-bold text-slate-900">
            Library ({visibleItems.length}{" "}
            {visibleItems.length === 1 ? "file" : "files"})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename, title, alt, ID"
              className="w-64 rounded-lg border border-border px-3 py-2 text-sm text-slate-900"
              aria-label="Search media library"
            />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "name")
              }
              className="rounded-lg border border-border px-3 py-2 text-sm text-slate-900"
              aria-label="Sort media library"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-slate-500">
            No files yet. Upload some to get started.
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-slate-500">
            No files match your search.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {pagedItems.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {item.fileMissing || thumbLoadFailed[item.id] ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-amber-50 p-2 text-center">
                        <span className="text-[0.65rem] font-semibold uppercase text-amber-900">
                          {thumbLoadFailed[item.id] && !item.fileMissing
                            ? "Preview failed"
                            : "File missing"}
                        </span>
                        <span className="text-[0.7rem] text-amber-800">
                          {thumbLoadFailed[item.id] && !item.fileMissing
                            ? "URL returned 404 — re-upload or fix volume"
                            : "Mount persists public/uploads + data/media-library.json"}
                        </span>
                      </div>
                    ) : isDocument(item.filename) ? (
                      <div className="absolute inset-0 text-red-400 flex flex-col items-center justify-center gap-2 bg-slate-50">
                        <span className="text-5xl">
                          {getDocumentIcon(item.filename)}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                          {item.filename.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- Admin thumbs: bypass optimizer (dev 400 on /uploads). */}
                        <img
                          src={item.url}
                          alt={item.alt || item.title || item.filename}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setThumbLoadFailed((p) => ({
                              ...p,
                              [item.id]: true,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>
                  <div className="p-3">
                    <p
                      className="truncate text-sm font-medium text-slate-900"
                      title={item.filename}
                    >
                      {item.title || item.filename}
                    </p>
                    <p
                      className="mt-0.5 truncate text-xs text-slate-500"
                      title={item.alt || undefined}
                    >
                      Alt: {item.alt || "—"}
                    </p>
                    {item.width && item.height ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.width} × {item.height}px
                      </p>
                    ) : null}

                    {editingId === item.id ? (
                      <div className="mt-2 space-y-2 rounded-lg border border-border bg-slate-50 p-2">
                        <input
                          value={metaDraft.title}
                          onChange={(e) =>
                            setMetaDraft((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Title"
                          className="w-full rounded border border-border px-2 py-1 text-xs text-slate-900"
                          aria-label={`Edit title for ${item.filename}`}
                        />
                        <input
                          value={metaDraft.alt}
                          onChange={(e) =>
                            setMetaDraft((prev) => ({
                              ...prev,
                              alt: e.target.value,
                            }))
                          }
                          placeholder="Alt text"
                          className="w-full rounded border border-border px-2 py-1 text-xs text-slate-900"
                          aria-label={`Edit alt text for ${item.filename}`}
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => saveMetadata(item.id)}
                            disabled={savingMetaId === item.id}
                            className="inline-flex items-center gap-1 rounded bg-accent-500 px-2 py-1 text-xs font-medium text-white hover:bg-accent-600 disabled:opacity-60"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(fullUrl(item.url), item.id)
                        }
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.id, item.id)}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        ID
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditMetadata(item)}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                        aria-label={`Edit metadata for ${item.filename}`}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="ml-auto flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        aria-label={`Delete ${item.filename}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
                <p className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
