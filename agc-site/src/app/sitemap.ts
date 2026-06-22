import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { shouldSkipPrismaCalls } from "@/lib/skip-db";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let news: { slug: string | null; datePublished: Date | null }[] = [];
  let publications: { slug: string | null; datePublished: Date | null }[] = [];
  let events: { slug: string | null; startDate: Date; endDate: Date | null }[] = [];
  let teamIds: number[] = [];

  if (!shouldSkipPrismaCalls()) {
    try {
      [news, publications, events, teamIds] = await Promise.all([
        prisma.news.findMany({
          where: { status: "published" },
          select: { slug: true, datePublished: true },
        }),
        prisma.publication.findMany({
          where: { status: "published" },
          select: { slug: true, datePublished: true },
        }),
        prisma.event.findMany({
          where: { status: "published" },
          select: { slug: true, startDate: true, endDate: true },
        }),
        prisma.team.findMany({
          where: { status: "published" },
          select: { id: true },
        }).then((rows) => rows.map((r) => r.id)),
      ]);
    } catch {
      // DB unavailable at runtime: use static entries only
    }
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/our-work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/our-work/research`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/our-work/training`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/our-work/partnership`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/app-summit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/aypf`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/awpls`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/events/past`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/publications`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/get-involved`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/get-involved/volunteer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/get-involved/partnership`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/get-involved/join-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/applications`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const newsEntries: MetadataRoute.Sitemap = news
    .filter((n) => n.slug)
    .map((n) => ({
      url: `${baseUrl}/news/${n.slug}`,
      lastModified: n.datePublished ? new Date(n.datePublished) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const publicationEntries: MetadataRoute.Sitemap = publications
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${baseUrl}/publications/${p.slug}`,
      lastModified: p.datePublished ? new Date(p.datePublished) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const teamEntries: MetadataRoute.Sitemap = teamIds.map((id) => ({
    url: `${baseUrl}/about/team/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const eventEntries: MetadataRoute.Sitemap = events
    .filter((e) => e.slug)
    .map((e) => {
      const end = e.endDate ?? e.startDate;
      const isPast = end.getTime() < Date.now();
      return {
        url: `${baseUrl}${isPast ? "/events/register/" : "/events/"}${e.slug}`,
        lastModified: new Date(e.startDate),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  return [...staticEntries, ...newsEntries, ...publicationEntries, ...teamEntries, ...eventEntries];
}
