import { contactContent as contactDefaults } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { ContactPageClient } from "./contact-page-client";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Africa Governance Centre.",
};

export const revalidate = 60;

function normalizeContactContent(merged: Record<string, unknown>) {
  const m = merged as Record<string, unknown>;
  const ph = m.formPlaceholders;
  const placeholders =
    ph && typeof ph === "object" && ph !== null && !Array.isArray(ph)
      ? { ...(contactDefaults.formPlaceholders as Record<string, string>), ...(ph as Record<string, string>) }
      : contactDefaults.formPlaceholders;
  const divs = m.divisions;
  const divisions = Array.isArray(divs) ? divs : contactDefaults.divisions;

  return {
    title: typeof m.title === "string" ? m.title : contactDefaults.title,
    subtitle: typeof m.subtitle === "string" ? m.subtitle : contactDefaults.subtitle,
    intro: typeof m.intro === "string" ? m.intro : contactDefaults.intro,
    sidebarEyebrow:
      typeof m.sidebarEyebrow === "string" ? m.sidebarEyebrow : contactDefaults.sidebarEyebrow,
    sidebarHeading:
      typeof m.sidebarHeading === "string" ? m.sidebarHeading : contactDefaults.sidebarHeading,
    mapHeading: typeof m.mapHeading === "string" ? m.mapHeading : contactDefaults.mapHeading,
    formTitle: typeof m.formTitle === "string" ? m.formTitle : contactDefaults.formTitle,
    formDescription: typeof m.formDescription === "string" ? m.formDescription : contactDefaults.formDescription,
    formPlaceholders: {
      name: typeof placeholders.name === "string" ? placeholders.name : contactDefaults.formPlaceholders.name,
      email: typeof placeholders.email === "string" ? placeholders.email : contactDefaults.formPlaceholders.email,
      subject: typeof placeholders.subject === "string" ? placeholders.subject : contactDefaults.formPlaceholders.subject,
      message: typeof placeholders.message === "string" ? placeholders.message : contactDefaults.formPlaceholders.message,
    },
    submitLabel: typeof m.submitLabel === "string" ? m.submitLabel : contactDefaults.submitLabel,
    divisions: divisions.filter(
      (d): d is { name: string; email: string } =>
        !!d && typeof d === "object" && typeof (d as { name?: string }).name === "string" && typeof (d as { email?: string }).email === "string"
    ),
  };
}

export default async function ContactPage() {
  const [raw, siteSettings] = await Promise.all([
    getMergedPageContent<typeof contactDefaults>("contact", cmsStaticOrEmpty(contactDefaults)),
    getSiteSettings(),
  ]);
  const content = normalizeContactContent(raw as Record<string, unknown>);
  const heroImage =
    (await resolveImageUrl((raw as Record<string, unknown>).heroImage as string | undefined)) || placeholderImages.contact;
  return <ContactPageClient contactContent={content} heroImage={heroImage} siteSettings={siteSettings} />;
}
