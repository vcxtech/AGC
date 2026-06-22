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
  title: "Projects",
  description:
    "Our targeted interventions - strengthening governance frameworks across African countries.",
};

type ProjectItem = {
  title: string;
  description: string;
  backgroundImage?: string;
};

type ProjectsWorkMerged = typeof workContent.projects & {
  heroImage?: string;
  cards?: ProjectItem[];
};

const PROJECTS_SECTION_DESCRIPTION =
  "Our projects are targeted initiatives developed in response to specific governance needs and opportunities. Each project is designed with clear objectives, defined outputs, and measurable outcomes, allowing for focused delivery within particular contexts. These interventions often contribute to broader programme goals while generating practical insights that inform future policy and institutional development.";

export default async function ProjectsPage() {
  const [merged, bc] = await Promise.all([
    getMergedPageContent<ProjectsWorkMerged>(
      "projects",
      cmsStaticOrEmpty(workContent.projects as ProjectsWorkMerged),
    ),
    getBreadcrumbLabels(),
  ]);
  const content = merged;
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    undefined;
  const rawProjects =
    Array.isArray(content.cards) && content.cards.length > 0
      ? content.cards
      : ((workContent.projects.cards ?? []) as ProjectItem[]);
  const projects = await Promise.all(
    rawProjects.map(async (project) => ({
      ...project,
      backgroundImage:
        cardImageUrlOrNull(
          (await resolveImageUrl(project.backgroundImage)) ?? null,
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
        imageAlt="Projects"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: bc.projects },
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
                Projects
              </h2>
              <RichTextContent
                html={content.description?.trim() || PROJECTS_SECTION_DESCRIPTION}
                className="max-w-none text-black"
              />

              <ProgramsCarousel programs={projects} />
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
                href="/get-involved/partnership"
                variant="primary"
                className="rounded-none"
              >
                Partner With Us
              </Button>
            </div>
          </div>
        </Section>
      </HomeScrollReveal>
    </>
  );
}
