import { workContent } from "@/data/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { Button } from "@/components/Button";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import { ProgramsCarousel } from "@/components/ProgramsCarousel";
import { RichTextContent } from "@/components/RichTextContent";
import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";
import { Section } from "@/components/Section";

export const metadata = {
  title: "Research",
  description:
    "Evidence and inquiry driving governance excellence across Africa.",
};

type ResearchItem = {
  title: string;
  description: string;
  backgroundImage?: string;
};

type ResearchWorkMerged = typeof workContent.research & {
  heroImage?: string;
  cards?: ResearchItem[];
};

const RESEARCH_SECTION_DESCRIPTION =
  "Our research generates rigorous, evidence-based analysis on governance, political economy, and institutional development across Africa. We prioritise work that is policy-relevant and grounded in African contexts, ensuring that our outputs contribute meaningfully to decision-making processes and public discourse. Through our research, we seek to bridge the gap between knowledge and practice while elevating African perspectives in continental and global debates.";

const RESEARCH_FALLBACK_CARDS: ResearchItem[] = [
  {
    title: "Policy research and analysis",
    description:
      "AGC conducts rigorous research on governance, political economy, and institutional development across Africa. Our work is grounded in local realities and designed to generate insights that directly inform policy decisions and governance reforms.",
  },
  {
    title: "Publications and policy briefs",
    description:
      "We produce a range of knowledge products, including reports, policy briefs, and analytical papers that translate complex research into clear, accessible, and actionable recommendations for policymakers and practitioners.",
  },
  {
    title: "Governance assessments",
    description:
      "We undertake data-driven assessments of governance systems, institutions, and policy environments to identify gaps, challenges, and opportunities. These diagnostics provide a foundation for targeted interventions and evidence-based reform strategies.",
  },
  {
    title: "Thematic and comparative research initiatives",
    description:
      "We lead and contribute to research initiatives focused on key governance themes such as democratic processes, regional integration, political participation, and institutional accountability. Our work often includes comparative analysis that draws lessons across countries and regions.",
  },
];

export default async function ResearchWorkPage() {
  const [merged, bc] = await Promise.all([
    getMergedPageContent<ResearchWorkMerged>(
      "research",
      cmsStaticOrEmpty(workContent.research as ResearchWorkMerged),
    ),
    getBreadcrumbLabels(),
  ]);
  const content = merged;
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    undefined;
  const rawResearch =
    Array.isArray(content.cards) && content.cards.length > 0
      ? content.cards
      : RESEARCH_FALLBACK_CARDS;
  const research = await Promise.all(
    rawResearch.map(async (item) => ({
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
        imageAlt="Research"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: bc.research ?? content.title },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <Section className="bg-white">
          <div className={PAGE_LISTING_INNER_CLASS}>
            <div className="space-y-8">
              <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                Research
              </h2>
              <RichTextContent
                html={content.description?.trim() || RESEARCH_SECTION_DESCRIPTION}
                className="max-w-none text-black"
              />

              <ProgramsCarousel programs={research} />
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
                href="/publications"
                variant="primary"
                className="rounded-none"
              >
                Publications
              </Button>
            </div>
          </div>
        </Section>
      </HomeScrollReveal>
    </>
  );
}
