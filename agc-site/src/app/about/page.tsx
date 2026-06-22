import { aboutContent, ORG_INTRO_PARAGRAPHS } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getTeam } from "@/lib/content";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { TeamSectionTabs } from "@/components/TeamSectionTabs";
import { Button } from "@/components/Button";
import { RichTextContent } from "@/components/RichTextContent";
import { resolveLeadHtml } from "@/lib/rich-text";
import { resolveImageUrl } from "@/lib/media";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import Image from "next/image";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { normalizeTeamTabs } from "@/lib/team-tabs";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Africa Governance Centre - an independent think tank promoting governance excellence across Africa.",
};

export const revalidate = 60;

const ABOUT_DELIVERY_POINTS = [
  {
    title: "Shaping African knowledge systems",
    body: "We produce high-quality research and analysis that centres African perspectives in continental and global governance debates. Our work contributes to advancing key frameworks such as the AfCFTA, Agenda 2063, and the Sustainable Development Goals.",
  },
  {
    title: "Convening multi-stakeholder dialogue",
    body: "Through platforms such as the African Political Parties Initiative, we bring together governments, political actors, civil society, the diplomatic community, media, and academia to engage on governance and development priorities. We convene structured dialogues that support practical solutions to critical governance and economic challenges.",
  },
  {
    title: "Advancing youth and women leadership",
    body: "Through initiatives such as the African Youth in Politics Forum and the Africa Women Political Leadership Summit, we equip young people and women with skills, knowledge, and networks to participate meaningfully in governance and public policy. Our work advances inclusive leadership in line with Agenda 2063.",
  },
  {
    title: "Building capacity for emerging leaders",
    body: "Our fellowships, bootcamps and training programmes strengthen the next generation of governance practitioners through practical learning and applied research development.",
  },
];

const ABOUT_PARTNERSHIPS_TEXT =
  "The Africa Governance Centre (AGC) works with a wide range of partners across Africa and beyond, including regional and continental institutions such as Economic Community of West African States and the African Union, as well as international development partners including the European Union and United Nations Development Program. We also engage closely with the diplomatic community, academia, civil society organisations, and corporate stakeholders seeking informed perspectives on governance, policy, and development across Africa. Through these partnerships, AGC provides evidence-based analysis, facilitates strategic dialogue, and supports collaborative approaches to addressing governance and development challenges on the continent.";

function resolveTeamTabs(
  content: typeof aboutContent & {
    teamTabsList?: { key: string; label: string }[];
  },
) {
  const configured = Array.isArray(content.teamTabsList)
    ? content.teamTabsList
    : [];
  const cleaned = configured
    .map((x) => ({
      key: String(x?.key ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_"),
      label: String(x?.label ?? "").trim(),
    }))
    .filter((x) => x.key && x.label);
  if (cleaned.length > 0) return normalizeTeamTabs(cleaned);
  return normalizeTeamTabs([
    { key: "advisory_board", label: aboutContent.teamTabs.advisoryBoard },
    { key: "executive_council", label: aboutContent.teamTabs.executiveCouncil },
    { key: "management_team", label: aboutContent.teamTabs.managementTeam },
    { key: "fellows", label: aboutContent.teamTabs.fellows },
  ]);
}

export default async function AboutPage() {
  const [cmsTeam, content, bc] = await Promise.all([
    getTeam(),
    getMergedPageContent<typeof aboutContent>(
      "about",
      cmsStaticOrEmpty(aboutContent),
    ),
    getBreadcrumbLabels(),
  ]);
  const heroImage =
    (await resolveImageUrl(
      (content as Record<string, unknown>).heroImage as string | undefined,
    )) || placeholderImages.about;
  const teamForTabs = await Promise.all(
    cmsTeam.map(async (m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      bio: m.bio,
      imageUrl: await resolveImageUrl(m.image ?? undefined),
      section: (m as { section?: string }).section || "advisory_board",
    })),
  );
  const teamTabs = resolveTeamTabs(
    content as typeof aboutContent & {
      teamTabsList?: { key: string; label: string }[];
    },
  );
  const contentMap = content as Record<string, unknown>;
  const introText =
    typeof contentMap.intro === "string" ? contentMap.intro.trim() : "";
  const descriptionText =
    typeof contentMap.description === "string"
      ? contentMap.description.trim()
      : "";
  const missionText =
    typeof contentMap.mission === "string" ? contentMap.mission.trim() : "";
  const strategicObjectives =
    contentMap.strategicObjectives &&
    typeof contentMap.strategicObjectives === "object" &&
    !Array.isArray(contentMap.strategicObjectives)
      ? (contentMap.strategicObjectives as Record<string, unknown>)
      : null;
  const leadHtml = resolveLeadHtml({
    leadBody:
      typeof contentMap.leadBody === "string" ? contentMap.leadBody : undefined,
    leadParagraphs:
      Array.isArray(contentMap.leadParagraphs) &&
      contentMap.leadParagraphs.every((item) => typeof item === "string")
        ? (contentMap.leadParagraphs as string[]).filter((item) => item.trim())
        : undefined,
    intro: introText || undefined,
    description: descriptionText || undefined,
    fallbackParagraphs: ORG_INTRO_PARAGRAPHS,
  });
  const partnershipsText =
    typeof contentMap.partnershipsText === "string" &&
    contentMap.partnershipsText.trim().length > 0
      ? contentMap.partnershipsText
      : ABOUT_PARTNERSHIPS_TEXT;
  const aboutSectionEyebrow =
    typeof contentMap.aboutSectionEyebrow === "string" &&
    contentMap.aboutSectionEyebrow.trim().length > 0
      ? contentMap.aboutSectionEyebrow
      : "Who we are";
  const aboutSectionHeading =
    typeof contentMap.aboutSectionHeading === "string" &&
    contentMap.aboutSectionHeading.trim().length > 0
      ? contentMap.aboutSectionHeading
      : content.title;
  const deliverySectionHeading =
    typeof contentMap.deliverySectionHeading === "string" &&
    contentMap.deliverySectionHeading.trim().length > 0
      ? contentMap.deliverySectionHeading
      : "We deliver our work by:";
  const partnershipsHeading =
    typeof contentMap.partnershipsHeading === "string" &&
    contentMap.partnershipsHeading.trim().length > 0
      ? contentMap.partnershipsHeading
      : "Partnerships and network";
  const deliveryPoints =
    Array.isArray(contentMap.deliveryPoints) &&
    contentMap.deliveryPoints.every(
      (item) => item && typeof item === "object" && !Array.isArray(item),
    )
      ? (
          contentMap.deliveryPoints as Array<{
            title?: unknown;
            body?: unknown;
            image?: unknown;
          }>
        )
          .map((item, index) => ({
            title:
              typeof item.title === "string" && item.title.trim().length > 0
                ? item.title
                : ABOUT_DELIVERY_POINTS[index]?.title || `Point ${index + 1}`,
            body:
              typeof item.body === "string" && item.body.trim().length > 0
                ? item.body
                : ABOUT_DELIVERY_POINTS[index]?.body || "",
            image: typeof item.image === "string" ? item.image : "",
          }))
          .filter((item) => item.title.trim().length > 0)
      : ABOUT_DELIVERY_POINTS.map((item) => ({ ...item, image: "" }));
  const resolvedDeliveryPoints = await Promise.all(
    deliveryPoints.map(async (point) => ({
      ...point,
      image: point.image ? (await resolveImageUrl(point.image)) || "" : "",
    })),
  );

  return (
    <>
      <PageHero
        title={content.title}
        titleClassName="font-serif text-[clamp(2.25rem,5.8vw,4.2rem)] font-semibold leading-[1.08] tracking-tight text-white lg:text-[clamp(2.85rem,5.2vw,5rem)] xl:text-[clamp(3.1rem,4.9vw,5.45rem)]"
        subtitle={content.hero.subtitle}
        image={heroImage}
        imageAlt="About Africa Governance Centre"
        breadcrumbs={[{ label: bc.home, href: "/" }, { label: bc.about }]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full bg-[#ffffff]"
      >
        <section className="w-full border-b border-border/80 bg-[#ffffff] py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <header>
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-black">
                {aboutSectionEyebrow}
              </p>
              <h2 className="mt-3 max-w-[16ch] font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                {aboutSectionHeading}
              </h2>
            </header>
            <RichTextContent html={leadHtml} className="mt-8 max-w-5xl font-medium text-black" />

            {missionText ? (
              <div className="mt-10 max-w-5xl border-t border-border/70 pt-8">
                <h3 className="font-serif text-2xl font-semibold text-black sm:text-3xl">
                  Our mission
                </h3>
                <RichTextContent html={missionText} className="mt-4 max-w-none font-medium text-black" />
              </div>
            ) : null}

            {strategicObjectives &&
            (typeof strategicObjectives.title === "string" ||
              typeof strategicObjectives.content === "string" ||
              typeof strategicObjectives.principles === "string" ||
              typeof strategicObjectives.agenda2063 === "string") ? (
              <div className="mt-10 max-w-5xl border-t border-border/70 pt-8">
                {typeof strategicObjectives.title === "string" &&
                strategicObjectives.title.trim() ? (
                  <h3 className="font-serif text-2xl font-semibold text-black sm:text-3xl">
                    {strategicObjectives.title}
                  </h3>
                ) : null}
                {typeof strategicObjectives.content === "string" &&
                strategicObjectives.content.trim() ? (
                  <RichTextContent
                    html={strategicObjectives.content}
                    className="mt-4 max-w-none font-medium text-black"
                  />
                ) : null}
                {typeof strategicObjectives.principles === "string" &&
                strategicObjectives.principles.trim() ? (
                  <RichTextContent
                    html={strategicObjectives.principles}
                    className="mt-4 max-w-none font-medium text-black"
                  />
                ) : null}
                {typeof strategicObjectives.agenda2063 === "string" &&
                strategicObjectives.agenda2063.trim() ? (
                  <RichTextContent
                    html={strategicObjectives.agenda2063}
                    className="mt-4 max-w-none font-medium text-black"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </HomeScrollReveal>

      <HomeScrollReveal
        variant="slideLeft"
        start="top 88%"
        className="block w-full bg-[#ffffff]"
      >
        <section className="w-full border-b border-border/80 bg-[#ffffff] py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <header>
              <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                {deliverySectionHeading}
              </h2>
            </header>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {resolvedDeliveryPoints.map((point, idx) => (
                <article
                  key={point.title}
                  className="page-card overflow-hidden p-0"
                >
                  <div className="relative aspect-video w-full bg-stone-100">
                    <Image
                      src={point.image || heroImage}
                      alt={`${point.title} visual`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      unoptimized={preferUnoptimizedImage(
                        point.image || heroImage,
                      )}
                    />
                    <div className="absolute inset-0 bg-black/25" aria-hidden />
                    <div className="absolute bottom-3 left-3 rounded-sm bg-white/90 px-2 py-1 text-xs font-semibold text-black">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="font-serif text-2xl font-semibold text-black">
                      {point.title}
                    </h3>
                    <RichTextContent html={point.body} className="mt-3 font-medium text-black" />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 border-t border-border/70 pt-8">
              <h3 className="font-serif text-2xl font-semibold text-black sm:text-3xl">
                {partnershipsHeading}
              </h3>
              <RichTextContent html={partnershipsText} className="mt-4 max-w-none font-medium text-black" />
            </div>
          </div>
        </section>
      </HomeScrollReveal>

      <HomeScrollReveal
        variant="scaleUp"
        start="top 88%"
        className="block w-full bg-[#ffffff]"
      >
        <section
          id="team"
          className="w-full border-t border-border/80 bg-[#ffffff] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <TeamSectionTabs cmsTeam={teamForTabs} tabs={teamTabs} />
            <div className="mt-14 flex justify-center">
              <Button
                asChild
                href="/get-involved"
                variant="primary"
                className="rounded-none px-8"
              >
                Get involved
              </Button>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
