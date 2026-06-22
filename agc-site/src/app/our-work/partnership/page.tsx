import { workContent } from "@/data/content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { Button } from "@/components/Button";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import { getPartners } from "@/lib/content";
import { PartnerGrid } from "@/components/our-work/PartnerGrid";
import { ProgramsCarousel } from "@/components/ProgramsCarousel";
import { RichTextContent } from "@/components/RichTextContent";
import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";
import { Section } from "@/components/Section";

export const metadata = {
  title: "Our Partnerships",
  description: "Collaborate with the Africa Governance Centre on research, programmes, and convenings.",
};

type PartnershipCard = { id: number; title: string; description: string };
type PartnershipWorkMerged = typeof workContent.partnership & { heroImage?: string; cards?: PartnershipCard[] };

const PARTNERSHIP_SECTION_DESCRIPTION =
  "Partnerships are central to AGC’s approach. We collaborate with regional and international institutions, development partners, academia, civil society, and the private sector to advance shared governance objectives. Through these collaborations, we leverage complementary expertise, expand our reach, and support coordinated responses to governance challenges across different contexts.";

export default async function PartnershipWorkPage() {
  const [merged, bc, partnerRows] = await Promise.all([
    getMergedPageContent<PartnershipWorkMerged>(
      "our-work-partnership",
      cmsStaticOrEmpty(workContent.partnership as PartnershipWorkMerged)
    ),
    getBreadcrumbLabels(),
    getPartners(),
  ]);
  const content = merged;
  const partnersResolved = await Promise.all(
    partnerRows.map(async (p) => ({
      id: p.id,
      name: p.name,
      logoUrl: cardImageUrlOrNull((await resolveImageUrl(p.logo)) ?? null),
      url: p.url?.trim() || undefined,
    }))
  );
  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ?? undefined;
  
  const partnershipCards: PartnershipCard[] = Array.isArray(content.cards) && content.cards.length > 0
    ? content.cards
    : [
        { id: 1, title: "Strategic institutional partnerships", description: "AGC collaborates with regional and continental bodies such as ECOWAS and the African Union, as well as international partners including the European Union and UNDP. These partnerships enable us to contribute to high-level policy processes, support regional governance initiatives, and align our work with broader development priorities across Africa." },
        { id: 2, title: "Multi-stakeholder collaboration platforms", description: "We create and sustain platforms that bring together governments, political actors, civil society, academia, and the private sector to engage on governance and development challenges. These platforms foster dialogue, shared learning, and coordinated responses to complex issues." },
        { id: 3, title: "Academic and research collaborations", description: "AGC works with universities, research institutions, and scholars to strengthen knowledge production and promote evidence-based policy engagement. These collaborations support joint research, publications, and the exchange of ideas across disciplines and regions." },
        { id: 4, title: "Diplomatic and development engagement", description: "We engage with the diplomatic community and development partners to facilitate policy dialogue, provide insights on governance trends, and support collaborative initiatives. This engagement helps bridge national, regional, and global perspectives on governance and development." },
      ] as PartnershipCard[];

  return (
    <>
      <PageHero
        variant="compact"
        title={content.title}
        subtitle={content.subtitle}
        image={heroSrc}
        imageAlt="Partnership"
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.ourWork, href: "/our-work" },
          { label: bc.ourPartnerships ?? content.title },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 88%" className="block w-full">
        <Section className="bg-white">
          <div className={PAGE_LISTING_INNER_CLASS}>
            <div className="space-y-8">
              <RichTextContent
                html={content.description?.trim() || PARTNERSHIP_SECTION_DESCRIPTION}
                className="max-w-none text-black"
              />

              <ProgramsCarousel programs={partnershipCards} />
            </div>

            <div className="mt-14 sm:mt-16">
              <p className="text-sm font-medium text-accent-800">Partners</p>
              <h2 className="page-heading mt-2 text-2xl text-black sm:text-3xl">
                Institutions we work with
              </h2>
              <div className="mt-10">
                <PartnerGrid partners={partnersResolved} />
              </div>
            </div>

            <div className="mt-16 flex flex-wrap gap-4">
              <Button asChild href="/our-work" variant="outline" className="rounded-none">
                Back to Our Work
              </Button>
              <Button asChild href="/get-involved/partnership" variant="primary" className="rounded-none">
                Partner with us
              </Button>
            </div>
          </div>
        </Section>
      </HomeScrollReveal>
    </>
  );
}
