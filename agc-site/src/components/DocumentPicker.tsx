"use client";

import { useState } from "react";
import { Upload, FileText, Trash2, FileSpreadsheet, File } from "lucide-react";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  formatMaxUploadBytes,
} from "@/lib/media-limits";
import { ImagePicker, type MediaItem } from "@/components/ImagePicker";

export type DocumentItem = {
  label: string;
  href: string;
  description?: string;
};

type DocumentPickerProps = {
  documents: DocumentItem[];
  onDocumentsChange: (docs: DocumentItem[]) => void;
};

export function DocumentPicker({
  documents,
  onDocumentsChange,
}: DocumentPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
          setError(
            `File too large: ${file.name} (max ${formatMaxUploadBytes()})`,
          );
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        const uploadedItem = data.item as MediaItem;
        // Ensure label is not empty - use filename as fallback
        let label = file.name.replace(/\.[^.]+$/, "").trim();
        if (!label) {
          label = file.name || "Document";
        }
        const newDoc: DocumentItem = {
          label,
          href: uploadedItem.url,
        };
        onDocumentsChange([...documents, newDoc]);
      }
    } catch (err) {
      setError(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  const addMediaDocument = (item: MediaItem) => {
    // Ensure label is not empty - use filename as fallback
    let label = item.filename.replace(/\.[^.]+$/, "").trim();
    if (!label) {
      label = item.filename || "Document";
    }
    const newDoc: DocumentItem = {
      label,
      href: item.url,
    };
    onDocumentsChange([...documents, newDoc]);
    setPickerOpen(false);
  };

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditLabel(documents[index].label);
    setEditDescription(documents[index].description || "");
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...documents];
      updated[editingIndex] = {
        ...updated[editingIndex],
        label: editLabel,
        description: editDescription,
      };
      onDocumentsChange(updated);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const getFileIcon = (href: string) => {
    const ext = href.split(".").pop()?.toLowerCase() || "";
    if (["doc", "docx"].includes(ext)) return <FileText className="h-4 w-4" />;
    if (["xls", "xlsx"].includes(ext))
      return <FileSpreadsheet className="h-4 w-4" />;
    if (["ppt", "pptx"].includes(ext))
      return <FileSpreadsheet className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload from device"}
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={uploading}
        >
          <FileText className="h-4 w-4" />
          Select from media library
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Image Picker for Media Library */}
      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m: MediaItem) => addMediaDocument(m)}
      />

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border bg-slate-50/50 p-3">
          <p className="text-sm font-medium text-slate-700">
            Attached documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-white p-3"
              >
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Label *
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm text-slate-900"
                        placeholder="e.g., Download Report"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Description (optional)
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm text-slate-900"
                        placeholder="Short description shown under the label"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="flex-1 rounded bg-accent-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 rounded border border-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFileIcon(doc.href)}</span>
                        <p
                          className="font-medium text-slate-900 underline hover:text-accent-600 cursor-pointer"
                          title="Click to edit label"
                          onClick={() => startEditing(index)}
                        >
                          {doc.label}
                        </p>
                      </div>
                      {doc.description && (
                        <p className="mt-1 text-xs text-slate-600">
                          {doc.description}
                        </p>
                      )}
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {doc.href}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(index)}
                        className="rounded px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-slate-500 hover:text-red-600"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        type="hidden"
        name="downloadResourcesJson"
        value={JSON.stringify(documents)}
      />
    </div>
  );
}
