import { donatePageContent, donateDefaultHeroImage } from "@/data/donate-page";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { getDonationSettings } from "@/lib/donation-settings";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { DonatePageClient } from "./donate-page-client";

export const metadata = {
  title: "Donate",
  description:
    "Support the Africa Governance Centre with a secure worldwide card donation via Paystack.",
};

export const revalidate = 60;

function normalizeDonateContent(merged: Record<string, unknown>) {
  const d = donatePageContent;
  const impact = merged.impactItems;
  return {
    title: typeof merged.title === "string" ? merged.title : d.title,
    subtitle: typeof merged.subtitle === "string" ? merged.subtitle : d.subtitle,
    heroImage: typeof merged.heroImage === "string" ? merged.heroImage : d.heroImage,
    intro: typeof merged.intro === "string" ? merged.intro : d.intro,
    sectionEyebrow: typeof merged.sectionEyebrow === "string" ? merged.sectionEyebrow : d.sectionEyebrow,
    sectionHeading: typeof merged.sectionHeading === "string" ? merged.sectionHeading : d.sectionHeading,
    typeQuestion: typeof merged.typeQuestion === "string" ? merged.typeQuestion : d.typeQuestion,
    typeLabel: typeof merged.typeLabel === "string" ? merged.typeLabel : d.typeLabel,
    typeDescription: typeof merged.typeDescription === "string" ? merged.typeDescription : d.typeDescription,
    amountHeading: typeof merged.amountHeading === "string" ? merged.amountHeading : d.amountHeading,
    otherAmountLabel: typeof merged.otherAmountLabel === "string" ? merged.otherAmountLabel : d.otherAmountLabel,
    formTitle: typeof merged.formTitle === "string" ? merged.formTitle : d.formTitle,
    formDescription: typeof merged.formDescription === "string" ? merged.formDescription : d.formDescription,
    namePlaceholder: typeof merged.namePlaceholder === "string" ? merged.namePlaceholder : d.namePlaceholder,
    emailPlaceholder: typeof merged.emailPlaceholder === "string" ? merged.emailPlaceholder : d.emailPlaceholder,
    messagePlaceholder: typeof merged.messagePlaceholder === "string" ? merged.messagePlaceholder : d.messagePlaceholder,
    submitLabel: typeof merged.submitLabel === "string" ? merged.submitLabel : d.submitLabel,
    processingLabel: typeof merged.processingLabel === "string" ? merged.processingLabel : d.processingLabel,
    successTitle: typeof merged.successTitle === "string" ? merged.successTitle : d.successTitle,
    successMessage: typeof merged.successMessage === "string" ? merged.successMessage : d.successMessage,
    footnote: typeof merged.footnote === "string" ? merged.footnote : d.footnote,
    impactItems: Array.isArray(impact)
      ? impact.filter((x): x is string => typeof x === "string")
      : [...d.impactItems],
  };
}

type PageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function DonatePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [raw, siteSettings, donationSettings] = await Promise.all([
    getMergedPageContent("donate", cmsStaticOrEmpty(donatePageContent)),
    getSiteSettings(),
    getDonationSettings(),
  ]);
  const content = normalizeDonateContent(raw as Record<string, unknown>);
  const heroRef = content.heroImage.trim();
  const heroSource =
    !heroRef || heroRef === "/uploads/placeholder.svg" ? donateDefaultHeroImage : heroRef;
  const heroImage =
    (await resolveImageUrl(heroSource)) || donateDefaultHeroImage;

  return (
    <DonatePageClient
      content={content}
      heroImage={heroImage}
      siteSettings={siteSettings}
      donationSettings={donationSettings}
      initialReference={params.reference}
    />
  );
}
