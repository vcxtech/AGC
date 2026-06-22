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
  title: "Programs",
  description:
    "Our core focus areas - forums and expert roundtables advancing governance excellence across Africa.",
};

type ProgramItem = {
  title: string;
  description: string;
  backgroundImage?: string;
};

type ProgramsWorkMerged = typeof workContent.programs & {
  heroImage?: string;
  programs?: ProgramItem[];
};

const PROGRAMS_SECTION_DESCRIPTION =
  "AGC designs and manages programmes that bring together multiple initiatives to address evolving governance challenge. These programmes provide structured frameworks for sustained engagement, combining research, dialogue, capacity building, and policy support within a coherent strategy. Through our programmes, we work with diverse stakeholders across sectors to drive long-term institutional strengthening and governance outcomes.";

export default async function ProgramsPage() {
  const [merged, bc] = await Promise.all([
    getMergedPageContent<ProgramsWorkMerged>(
      "programs",
      cmsStaticOrEmpty(workContent.programs as ProgramsWorkMerged),
    ),
    getBreadcrumbLabels(),
  ]);
  const content = merged;
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    undefined;
  const rawPrograms =
    Array.isArray(content.programs) && content.programs.length > 0
      ? content.programs
      : (workContent.programs.programs as ProgramItem[]);
  const programs = await Promise.all(
    rawPrograms.map(async (program) => ({
      ...program,
      backgroundImage:
        cardImageUrlOrNull(
          (await resolveImageUrl(program.backgroundImage)) ?? null,
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
        imageAlt="Programs"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: bc.programs },
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
                Programs
              </h2>
              <RichTextContent
                html={content.description?.trim() || PROGRAMS_SECTION_DESCRIPTION}
                className="max-w-none text-black"
              />

              <ProgramsCarousel programs={programs} />
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
