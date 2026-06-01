import { workContent } from "@/data/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { Button } from "@/components/Button";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import { ProgramsCarousel } from "@/components/ProgramsCarousel";
import { Section } from "@/components/Section";

export const metadata = {
  title: "Advisory",
  description:
    "Our expert services - the Africa Governance Review Project and policy recommendations.",
};

const AdvisoryHeading = {
  title: "",
  description:
    "AGC provides strategic advisory support to governments, public institutions, and development partners on governance, policy, and institutional reform. Our advisory work is grounded in evidence and practical experience, enabling us to support decision-making processes, policy design, and implementation strategies. We work closely with partners to navigate complex governance environments and strengthen institutional effectiveness.",
};

type AdvisoryItem = {
  title: string;
  description: string;
  backgroundImage?: string;
};

type AdvisoryWorkMerged = typeof workContent.advisory & {
  heroImage?: string;
  mainTitle?: string;
  cards?: AdvisoryItem[];
};

export default async function AdvisoryPage() {
  const [merged, bc] = await Promise.all([
    getMergedPageContent<AdvisoryWorkMerged>(
      "advisory",
      cmsStaticOrEmpty(workContent.advisory as AdvisoryWorkMerged),
    ),
    getBreadcrumbLabels(),
  ]);
  const content = merged;
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    undefined;
  const rawAdvisory =
    Array.isArray(content.cards) && content.cards.length > 0
      ? content.cards
      : ((workContent.advisory.cards ?? []) as AdvisoryItem[]);
  const advisory = await Promise.all(
    rawAdvisory.map(async (item) => ({
      ...item,
      backgroundImage:
        cardImageUrlOrNull(
          (await resolveImageUrl(item.backgroundImage)) ?? null,
        ) ?? undefined,
    })),
  );

  return (
    <>
      <PageHero
        variant="compact"
        title={content.title}
        subtitle={content.subtitle}
        image={heroSrc}
        imageAlt="Advisory"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: bc.advisory },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <Section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                {content.mainTitle || AdvisoryHeading.title}
              </h2>
              <p className="page-prose max-w-none text-black">
                {content.description || AdvisoryHeading.description}
              </p>

              <ProgramsCarousel programs={advisory} />
            </div>

            <div className="mt-16 flex flex-wrap gap-4">
              <Button
                asChild
                href="/our-work"
                variant="outline"
                className="rounded-none"
              >
                Back to Our Work
              </Button>
              <Button
                asChild
                href="/contact"
                variant="primary"
                className="rounded-none"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </Section>
      </HomeScrollReveal>
    </>
  );
}
