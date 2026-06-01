"use client";

import { useCallback, useEffect, useState } from "react";
import { File, FileArchive, FileIcon, RefreshCw, Trash2 } from "lucide-react";
import {
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";

type OrphanItem = {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  title?: string;
};

type Props = {
  /** Remove an item from the main library grid when an orphan is deleted. */
  onLibraryItemRemoved?: (id: string) => void;
};

export function OrphanMediaPanel({ onLibraryItemRemoved }: Props) {
  const [items, setItems] = useState<OrphanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbFailed, setThumbFailed] = useState<Record<string, true>>({});

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media/orphans");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load orphans");
        setItems([]);
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError("Failed to load orphans");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const isDocument = (filename: string): boolean => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return /^(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|csv)$/.test(ext);
  };

  console.log("ThumFailed", thumbFailed);

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

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this unused image from the library? This cannot be undone.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems((prev) => prev.filter((m) => m.id !== id));
        onLibraryItemRemoved?.(id);
      } else {
        setError(data.error || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-600">
        Scanning for unused images…
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Unused images (orphans)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Not referenced by CMS content — safe cleanup candidates. Delete only
            when obsolete.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-5">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500 sm:px-5">
          No orphaned images right now.
        </p>
      ) : (
        <ul className="divide-y divide-border p-3 sm:p-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {thumbFailed[item.id] ? (
                  <div className="flex h-full w-full items-center justify-center bg-amber-50 text-[0.6rem] font-medium text-amber-800">
                    =
                  </div>
                ) : isDocument(item.filename) ? (
                  <div className="absolute inset-0 text-red-500 flex flex-col items-center justify-center gap-2 bg-slate-50">
                    <span className="text-xl">
                      {getDocumentIcon(item.filename)}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {item.filename.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- avoid image optimizer on /uploads */}
                    <img
                      src={item.url}
                      alt={item.alt || item.title || item.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() =>
                        setThumbFailed((p) => ({ ...p, [item.id]: true }))
                      }
                    />
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-slate-900"
                  title={item.filename}
                >
                  {item.title || item.filename}
                </p>
                <p className="font-mono text-xs text-slate-500">{item.id}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
