/**
 * News articles can attach one or more downloadable documents (PDFs, calls, reports).
 * Stored in CMS as JSON: array of { label, href, description? }.
 */

export type NewsDocumentDownload = {
  label: string;
  href: string;
  description?: string;
};

export type NewsSocialLinks = {
  facebook?: string;
  x?: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
};

function cleanSocialLinks(raw: unknown): NewsSocialLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const out: NewsSocialLinks = {};
  const keys: (keyof NewsSocialLinks)[] = [
    "facebook",
    "x",
    "linkedin",
    "instagram",
    "email",
  ];
  for (const k of keys) {
    if (typeof o[k] === "string" && o[k]!.trim()) out[k] = o[k]!.trim();
  }
  // Backward compatibility for older saved payloads.
  if (!out.instagram && typeof o.whatsapp === "string" && o.whatsapp.trim()) {
    out.instagram = o.whatsapp.trim();
  }
  return out;
}

function cleanDownloads(raw: unknown): NewsDocumentDownload[] {
  if (raw === undefined || raw === null) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        let label = typeof o.label === "string" ? o.label.trim() : "";
        const href = typeof o.href === "string" ? o.href.trim() : "";
        if (!href) return null;
        // Provide default label if empty
        if (!label) {
          // Try to extract filename from href
          const urlParts = href.split("/");
          const filename = urlParts[urlParts.length - 1];
          label = filename ? filename.replace(/\.[^.]+$/, "") : "Download";
        }
        const description =
          typeof o.description === "string" ? o.description.trim() : undefined;
        return {
          label,
          href,
          ...(description ? { description } : {}),
        } satisfies NewsDocumentDownload;
      })
      .filter((x): x is NewsDocumentDownload => x !== null);
  }

  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const href = typeof o.href === "string" ? o.href.trim() : "";
    if (!href) return [];
    let label =
      typeof o.label === "string" && o.label.trim() ? o.label.trim() : "";
    // Provide default label if empty
    if (!label) {
      const urlParts = href.split("/");
      const filename = urlParts[urlParts.length - 1];
      label = filename ? filename.replace(/\.[^.]+$/, "") : "Download";
    }
    const description =
      typeof o.description === "string" ? o.description.trim() : undefined;
    return [{ label, href, ...(description ? { description } : {}) }];
  }

  return [];
}

function splitNewsResources(raw: unknown): {
  downloads: NewsDocumentDownload[];
  socialLinks: NewsSocialLinks;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { downloads: cleanDownloads(raw), socialLinks: {} };
  }
  const o = raw as Record<string, unknown>;
  const downloads = Array.isArray(o.downloads)
    ? cleanDownloads(o.downloads)
    : cleanDownloads(raw);
  const socialLinks = cleanSocialLinks(o.socialLinks);
  return { downloads, socialLinks };
}

export function normalizeNewsDownloads(item: {
  downloadResources?: unknown;
}): NewsDocumentDownload[] {
  return splitNewsResources(item.downloadResources).downloads;
}

export function normalizeNewsSocialLinks(item: {
  downloadResources?: unknown;
}): NewsSocialLinks {
  return splitNewsResources(item.downloadResources).socialLinks;
}
