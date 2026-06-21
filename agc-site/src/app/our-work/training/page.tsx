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
import { Section } from "@/components/Section";

export const metadata = {
  title: "Capacity Building",
  description:
    "Capacity building and learning programmes from the Africa Governance Centre.",
};

type TrainingItem = {
  title: string;
  description: string;
  backgroundImage?: string;
};

type TrainingWorkMerged = typeof workContent.training & {
  heroImage?: string;
  cards?: TrainingItem[];
};

const TRAINING_SECTION_DESCRIPTION =
  "AGC delivers training and capacity-building initiatives designed to equip leaders, practitioners, and emerging actors with the skills and knowledge required to navigate governance challenges. Our programmes combine theoretical grounding with practical application, offering participants opportunities to engage with real-world policy issues, develop leadership capabilities, and strengthen their contributions to governance processes.";

const TRAINING_FALLBACK_CARDS: TrainingItem[] = [
  {
    title: "Leadership and governance development",
    description:
      "We deliver training programmes designed to strengthen leadership capacity and deepen understanding of governance systems, public policy, and institutional processes. These programmes are tailored to both emerging and experienced leaders across sectors.",
  },
  {
    title: "Policy and research skills training",
    description:
      "AGC equips participants with practical skills in policy analysis, research methodologies, and evidence-based decision-making. Our training emphasises applied learning, enabling participants to engage effectively with real-world governance challenges.",
  },
  {
    title: "Workshops and executive short courses",
    description:
      "We organise targeted workshops and short courses focused on specific governance and policy issues. These sessions provide intensive learning opportunities for professionals, practitioners, and public sector actors seeking to deepen their expertise.",
  },
  {
    title: "Mentorship and professional development",
    description:
      "Through structured mentorship and coaching programmes, we support the growth of young leaders and practitioners in governance and public policy. Participants benefit from guided learning, practical exposure, and opportunities to contribute to research and policy work.",
  },
];

export default async function TrainingWorkPage() {
  const [merged, bc] = await Promise.all([
    getMergedPageContent<TrainingWorkMerged>(
      "training",
      cmsStaticOrEmpty(workContent.training as TrainingWorkMerged),
    ),
    getBreadcrumbLabels(),
  ]);
  const content = merged;
  const displayTitle =
    (content.title || "").trim().toLowerCase() === "training"
      ? "Capacity Building"
      : content.title;
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    undefined;
  const rawTraining =
    Array.isArray(content.cards) && content.cards.length > 0
      ? content.cards
      : TRAINING_FALLBACK_CARDS;
  const training = await Promise.all(
    rawTraining.map(async (item) => ({
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
        title={displayTitle}
        subtitle={content.subtitle}
        image={heroSrc}
        imageAlt="Capacity Building"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: displayTitle },
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
                {displayTitle}
              </h2>
              <RichTextContent
                html={content.description?.trim() || TRAINING_SECTION_DESCRIPTION}
                className="max-w-none text-black"
              />

              <ProgramsCarousel programs={training} />
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
                href="/events"
                variant="primary"
                className="rounded-none"
              >
                View Events
              </Button>
            </div>
          </div>
        </Section>
      </HomeScrollReveal>
    </>
  );
}
