/**
 * Content data layer - Prisma
 * Single source of truth for all site content (managed via /admin)
 */

import { fallbackTeam } from "@/data/content";
import { prisma } from "@/lib/db";
import type {
  NewsDocumentDownload,
  NewsSocialLinks,
} from "@/lib/news-downloads";
import {
  normalizeNewsDownloads,
  normalizeNewsSocialLinks,
} from "@/lib/news-downloads";
import { devPublicRead } from "@/lib/skip-db";
import { resolvePublicMediaUrl } from "@/lib/media-public-url";

// ============ Shared types (compatible with former Cms* interfaces) ============

export interface CmsEventAgendaItem {
  time?: string;
  title: string;
  description?: string;
}

export interface CmsEvent {
  id: number;
  status: string;
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  image?: string;
  link?: string;
  category?: string;
  event_type?: string;
  venue_name?: string;
  venue_address?: string;
  capacity?: number;
  registration_deadline?: string;
  /** When capacity is full, visitors may still join the waitlist (CMS Events). */
  allow_waitlist?: boolean;
  agenda?: CmsEventAgendaItem[];
  speaker_ids?: number[];
}

export interface CmsTeamMember {
  id: number;
  status: string;
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  section?: string;
  order?: number;
}

export interface CmsPublication {
  id: number;
  status: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  /** Publication type slugs (multi-select) */
  types?: string[];
  /** @deprecated legacy single type (fallback content only) */
  type?: string;
  file?: string;
  image?: string;
  date_published?: string;
  date_created?: string;
  author?: string;
}

export interface CmsNews {
  id: number;
  status: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  date_created: string;
  date_published?: string;
  categories?: string[];
  tags?: string[];
  author?: string;
  /** PDFs / documents shown on the article (from `download_resources` JSON). */
  downloadResources?: NewsDocumentDownload[];
  /** Optional article-level social links (from `download_resources.socialLinks`). */
  socialLinks?: NewsSocialLinks;
}

export interface CmsProgram {
  id: number;
  status: string;
  title: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface CmsProject {
  id: number;
  status: string;
  title: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface CmsPartner {
  id: number;
  status: string;
  name: string;
  logo?: string;
  url?: string;
  order?: number;
}

// ============ Events ============

export async function getEvents() {
  return devPublicRead([], async () => {
    const rows = await prisma.event.findMany({
      where: { status: "published" },
      orderBy: { startDate: "desc" },
    });
    return rows.map((e) => ({
      id: e.id,
      status: e.status,
      title: e.title,
      slug: e.slug ?? undefined,
      short_description: (e as Record<string, unknown>).shortDescription as
        | string
        | undefined,
      description: e.description ?? undefined,
      location: e.location ?? undefined,
      start_date: e.startDate.toISOString(),
      end_date: e.endDate?.toISOString(),
      image: e.image ?? undefined,
      link: e.link ?? undefined,
      category: e.category ?? undefined,
      event_type: e.eventType ?? undefined,
      venue_name: e.venueName ?? undefined,
      venue_address: e.venueAddress ?? undefined,
      capacity: e.capacity ?? undefined,
      registration_deadline: e.registrationDeadline?.toISOString(),
      allow_waitlist: e.allowWaitlist,
      agenda: e.agenda as
        | { time?: string; title: string; description?: string }[]
        | undefined,
      speaker_ids: e.speakerIds as number[] | undefined,
    }));
  });
}

/** Admin: fetch event by slug (any status) */
export async function getEventBySlugAdmin(slug: string) {
  return devPublicRead(null, async () => {
    const e = await prisma.event.findFirst({
      where: { slug },
    });
    if (!e) return null;
    return {
      id: e.id,
      status: e.status,
      title: e.title,
      slug: e.slug ?? undefined,
      short_description: (e as Record<string, unknown>).shortDescription as
        | string
        | undefined,
      description: e.description ?? undefined,
      location: e.location ?? undefined,
      start_date: e.startDate.toISOString(),
      end_date: e.endDate?.toISOString(),
      image: e.image ?? undefined,
      link: e.link ?? undefined,
      category: e.category ?? undefined,
      event_type: e.eventType ?? undefined,
      venue_name: e.venueName ?? undefined,
      venue_address: e.venueAddress ?? undefined,
      capacity: e.capacity ?? undefined,
      registration_deadline: e.registrationDeadline?.toISOString(),
      allow_waitlist: e.allowWaitlist,
      agenda: e.agenda as
        | { time?: string; title: string; description?: string }[]
        | undefined,
      speaker_ids: e.speakerIds as number[] | undefined,
    };
  });
}

export async function getEventBySlug(slug: string) {
  return devPublicRead(null, async () => {
    const e = await prisma.event.findFirst({
      where: { slug, status: "published" },
    });
    if (!e) return null;
    return {
      id: e.id,
      status: e.status,
      title: e.title,
      slug: e.slug ?? undefined,
      short_description: (e as Record<string, unknown>).shortDescription as
        | string
        | undefined,
      description: e.description ?? undefined,
      location: e.location ?? undefined,
      start_date: e.startDate.toISOString(),
      end_date: e.endDate?.toISOString(),
      image: e.image ?? undefined,
      link: e.link ?? undefined,
      category: e.category ?? undefined,
      event_type: e.eventType ?? undefined,
      venue_name: e.venueName ?? undefined,
      venue_address: e.venueAddress ?? undefined,
      capacity: e.capacity ?? undefined,
      registration_deadline: e.registrationDeadline?.toISOString(),
      allow_waitlist: e.allowWaitlist,
      agenda: e.agenda as
        | { time?: string; title: string; description?: string }[]
        | undefined,
      speaker_ids: e.speakerIds as number[] | undefined,
    };
  });
}

// ============ News ============

export async function getNews(limit = 10) {
  return devPublicRead([], async () => {
    const rows = await prisma.news.findMany({
      where: { status: "published" },
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map((n) => {
      const downloads = normalizeNewsDownloads({
        downloadResources: n.downloadResources,
      });
      const socialLinks = normalizeNewsSocialLinks({
        downloadResources: n.downloadResources,
      });
      // console.log(
      //   `[getNews] Article "${n.title}": downloadResources =`,
      //   n.downloadResources,
      //   ", normalized downloads =",
      //   downloads,
      // );
      return {
        id: n.id,
        status: n.status,
        title: n.title,
        slug: n.slug ?? undefined,
        excerpt: n.excerpt ?? undefined,
        content: n.content ?? undefined,
        image: n.image ?? undefined,
        date_created: n.createdAt.toISOString(),
        date_published: n.datePublished?.toISOString(),
        author: n.author ?? undefined,
        categories: n.categories as string[] | undefined,
        tags: n.tags as string[] | undefined,
        ...(downloads.length ? { downloadResources: downloads } : {}),
        ...(Object.keys(socialLinks).length ? { socialLinks } : {}),
      };
    });
  });
}

export async function getNewsBySlug(slug: string) {
  return devPublicRead(null, async () => {
    const n = await prisma.news.findFirst({
      where: { slug, status: "published" },
    });
    if (!n) return null;
    const downloads = normalizeNewsDownloads({
      downloadResources: n.downloadResources,
    });
    const socialLinks = normalizeNewsSocialLinks({
      downloadResources: n.downloadResources,
    });
    return {
      id: n.id,
      status: n.status,
      title: n.title,
      slug: n.slug ?? undefined,
      excerpt: n.excerpt ?? undefined,
      content: n.content ?? undefined,
      image: n.image ?? undefined,
      date_created: n.createdAt.toISOString(),
      date_published: n.datePublished?.toISOString(),
      author: n.author ?? undefined,
      categories: n.categories as string[] | undefined,
      tags: n.tags as string[] | undefined,
      ...(downloads.length ? { downloadResources: downloads } : {}),
      ...(Object.keys(socialLinks).length ? { socialLinks } : {}),
    };
  });
}

// ============ Team ============

export async function getTeam(): Promise<CmsTeamMember[]> {
  return devPublicRead([], async () => {
    const rows = await prisma.team.findMany({
      where: { status: "published" },
      orderBy: { order: "asc" },
    });
    return rows.map((t) => ({
      id: t.id,
      status: t.status,
      name: t.name,
      role: t.role ?? undefined,
      bio: t.bio ?? undefined,
      image: t.image ?? undefined,
      section: (t as Record<string, unknown>).section as string | undefined,
      order: t.order,
    }));
  });
}

/** Public profile may include tab section (static fallback members only until the Team model gains a section field). */
export type CmsTeamMemberPublic = CmsTeamMember & { section?: string };

/**
 * Single published team member for profile pages. Uses static `fallbackTeam` only when the
 * CMS returns no published members (same rule as `TeamSectionTabs`).
 */
export async function getPublishedTeamMember(
  id: number,
): Promise<CmsTeamMemberPublic | null> {
  const fromDb = await devPublicRead<CmsTeamMember | null>(null, async () => {
    const row = await prisma.team.findFirst({
      where: { id, status: "published" },
    });
    if (!row) return null;
    return {
      id: row.id,
      status: row.status,
      name: row.name,
      role: row.role ?? undefined,
      bio: row.bio ?? undefined,
      image: row.image ?? undefined,
      order: row.order,
    };
  });
  if (fromDb) return fromDb;

  const allPublished = await getTeam();
  if (allPublished.length > 0) return null;

  const fb = fallbackTeam.find((m) => m.id === id);
  if (!fb) return null;
  return {
    id: fb.id,
    status: "published",
    name: fb.name,
    role: fb.role,
    bio: fb.bio,
    image: undefined,
    order: fb.id,
    section: fb.section,
  };
}

// ============ Publications ============

export async function getPublications(limit = 20) {
  return devPublicRead([], async () => {
    const rows = await prisma.publication.findMany({
      where: { status: "published" },
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map((p) => {
      const typesRaw = p.types as string[] | null | undefined;
      return {
        id: p.id,
        status: p.status,
        title: p.title,
        slug: p.slug ?? undefined,
        excerpt: p.excerpt ?? undefined,
        content: p.content ?? undefined,
        types: Array.isArray(typesRaw) ? typesRaw : undefined,
        file: p.file ?? undefined,
        image: p.image ?? undefined,
        date_published: p.datePublished?.toISOString(),
        date_created: p.createdAt.toISOString(),
        author: p.author ?? undefined,
      };
    });
  });
}

export async function getPublicationBySlug(slug: string) {
  return devPublicRead(null, async () => {
    const p = await prisma.publication.findFirst({
      where: { slug, status: "published" },
    });
    if (!p) return null;
    const typesRaw = p.types as string[] | null | undefined;
    return {
      id: p.id,
      status: p.status,
      title: p.title,
      slug: p.slug ?? undefined,
      excerpt: p.excerpt ?? undefined,
      content: p.content ?? undefined,
      types: Array.isArray(typesRaw) ? typesRaw : undefined,
      file: p.file ?? undefined,
      image: p.image ?? undefined,
      date_published: p.datePublished?.toISOString(),
      date_created: p.createdAt.toISOString(),
      author: p.author ?? undefined,
    };
  });
}

// ============ Programs, Projects, Partners ============

export async function getPrograms() {
  return devPublicRead([], async () => {
    const rows = await prisma.program.findMany({
      where: { status: "published" },
      orderBy: { order: "asc" },
    });
    return rows.map((p) => ({
      id: p.id,
      status: p.status,
      title: p.title,
      description: p.description ?? undefined,
      image: p.image ?? undefined,
      order: p.order,
    }));
  });
}

export async function getProjects() {
  return devPublicRead([], async () => {
    const rows = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: { order: "asc" },
    });
    return rows.map((p) => ({
      id: p.id,
      status: p.status,
      title: p.title,
      description: p.description ?? undefined,
      image: p.image ?? undefined,
      order: p.order,
    }));
  });
}

export async function getPartners() {
  return devPublicRead([], async () => {
    const rows = await prisma.partner.findMany({
      where: { status: "published" },
      orderBy: { order: "asc" },
    });
    return rows.map((p) => ({
      id: p.id,
      status: p.status,
      name: p.name,
      logo: p.logo ?? undefined,
      url: p.url ?? undefined,
      order: p.order,
    }));
  });
}

// ============ Page Content ============

export async function getPageContent(slug: string) {
  return devPublicRead(null, async () => {
    const p = await prisma.pageContent.findFirst({
      where: { slug, status: "published" },
    });
    if (!p) return null;
    const heroTitle = p.heroTitle;
    const heroSubtitle = p.heroSubtitle;
    const fromDb =
      p.contentJson != null &&
      typeof p.contentJson === "object" &&
      !Array.isArray(p.contentJson)
        ? (p.contentJson as Record<string, unknown>)
        : {};
    const contentJson: Record<string, unknown> = {
      ...fromDb,
      title: p.title ?? heroTitle,
      heroTitle: heroTitle,
      mainTitle: p.mainTitle,
      subtitle: heroSubtitle,
      hero: { title: heroTitle, subtitle: heroSubtitle },
      intro: p.intro,
      description: p.description,
      mission: p.mission,
      strategicObjectives: p.objectivesTitle
        ? {
            title: p.objectivesTitle,
            content: p.objectivesContent,
            principles: p.objectivesPrinciples,
            agenda2063: p.objectivesAgenda2063,
          }
        : undefined,
    };
    // Admin stores hero / section media IDs on `content_json`; keep them after column overlays.
    if (typeof fromDb.heroImage === "string" && fromDb.heroImage.trim()) {
      contentJson.heroImage = fromDb.heroImage.trim();
    }
    if (typeof fromDb.sectionImage === "string" && fromDb.sectionImage.trim()) {
      contentJson.sectionImage = fromDb.sectionImage.trim();
    }
    return {
      id: p.id,
      slug: p.slug,
      title: p.title ?? undefined,
      content_json: contentJson,
    };
  });
}

// ============ Media/Image URLs (uploads live in /public/uploads) ============

/** Resolve image path to URL. Use for content layer (paths). For media-xxx use resolveImageUrl from media. */
export function getContentImageUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const local = path.startsWith("/") ? path : `/${path}`;
  return resolvePublicMediaUrl(local);
}

export function getContentFileUrl(path: string | undefined): string | null {
  return getContentImageUrl(path);
}

/** Resolve event/image ref to URL for sync use. Content layer uses paths (uploads/xxx or /uploads/xxx). */
export function resolveImageUrlSync(
  ref: string | { id: string } | undefined,
): string | null {
  if (ref === undefined || ref === null) return null;
  const id =
    typeof ref === "object"
      ? ref?.id?.trim()
      : typeof ref === "string"
        ? ref.trim()
        : "";
  if (!id) return null;
  if (/^media-/i.test(id)) return null;
  if (id.startsWith("http")) return id;
  if (id.startsWith("/")) return resolvePublicMediaUrl(id);
  if (id.includes("/") || id.startsWith("uploads")) {
    const local = id.startsWith("/") ? id : `/${id}`;
    return resolvePublicMediaUrl(local);
  }
  return null;
}
