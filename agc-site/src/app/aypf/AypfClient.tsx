"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { Button } from "@/components/Button";
import type { AypfCmsContent } from "@/data/aypf";
import type { SiteSettings } from "@/lib/site-settings";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextListItems } from "@/components/RichTextListItems";
import { resolveRichHtml } from "@/lib/rich-text";

function getNestedRegisterString(
  map: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const section =
    map.registerSection &&
    typeof map.registerSection === "object" &&
    !Array.isArray(map.registerSection)
      ? (map.registerSection as Record<string, unknown>)
      : null;
  return section &&
    typeof section[key] === "string" &&
    String(section[key]).trim().length > 0
    ? String(section[key])
    : fallback;
}

function getNestedRegisterArray(
  map: Record<string, unknown>,
  key: string,
  fallback: string[],
): string[] {
  const section =
    map.registerSection &&
    typeof map.registerSection === "object" &&
    !Array.isArray(map.registerSection)
      ? (map.registerSection as Record<string, unknown>)
      : null;
  if (!section || !Array.isArray(section[key])) return fallback;
  const values = (section[key] as unknown[]).filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
  return values.length > 0 ? values : fallback;
}

export function AypfClient({
  content,
  heroImage,
  siteSettings,
}: {
  content: AypfCmsContent;
  heroImage?: string;
  siteSettings: SiteSettings;
}) {
  const bc = content.breadcrumbLabel?.trim() || content.title;
  const regHref =
    content.registerSection.registrationHref?.trim() || "/contact";
  const contentMap = content as unknown as Record<string, unknown>;
  const getString = (key: string, fallback: string) =>
    typeof contentMap[key] === "string" &&
    String(contentMap[key]).trim().length > 0
      ? String(contentMap[key])
      : fallback;
  const getStringArray = (key: string, fallback: string[]) => {
    const value = contentMap[key];
    if (!Array.isArray(value)) return fallback;
    const list = value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    return list.length > 0 ? list : fallback;
  };
  const getObjectArray = <T extends Record<string, string>>(
    key: string,
    fallback: T[],
    shape: (item: Record<string, unknown>) => T,
  ) => {
    const value = contentMap[key];
    if (!Array.isArray(value)) return fallback;
    const list = value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item),
      )
      .map(shape)
      .filter((item) =>
        Object.values(item).every(
          (v) => typeof v === "string" && v.trim().length > 0,
        ),
      );
    return list.length > 0 ? list : fallback;
  };
  const focusSectionBgImage =
    typeof contentMap.focusSectionBgImage === "string" &&
    contentMap.focusSectionBgImage.trim()
      ? contentMap.focusSectionBgImage.trim()
      : "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2200&q=80";
  const strategicPrioritiesBgImage =
    typeof contentMap.strategicPrioritiesBgImage === "string" &&
    contentMap.strategicPrioritiesBgImage.trim()
      ? contentMap.strategicPrioritiesBgImage.trim()
      : "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2200&q=80";

  const focusAreasFallback = [
    "Building youth leadership pipelines within political parties",
    "Advancing institutional reforms that lower barriers to political entry",
    "Promoting issue-based political engagement, particularly on economic transformation",
    "Strengthening cross-border collaboration among young political actors",
    "Embedding youth influence in party systems through policy and structural change",
  ];

  const objectivesFallback = [
    "Institutionalise youth leadership as a transformative force in continental politics and economic governance.",
    "Reposition youth as co-architects of democratic renewal in party leadership, elections, and policymaking structures.",
    "Catalyze internal party reforms that promote intergenerational inclusion, transparency, and youth leadership pipelines.",
    "Promote alignment with the African Youth Charter, Agenda 2063, and SDG 16.",
  ];

  const strategicPrioritiesFallback = [
    {
      title: "Strengthening youth representation in political decision-making",
      body: "Advance practical pathways for increasing youth participation in party structures, public institutions, and policy spaces.",
    },
    {
      title: "Advancing political party reform and accountability",
      body: "Examine how political parties can become more transparent, inclusive, and responsive, with young people shaping reform agendas.",
    },
    {
      title: "Driving political innovation and digital democracy",
      body: "Explore how technology and digital platforms are reshaping civic participation, communication, and accountability.",
    },
    {
      title: "Promoting youth economic participation in governance",
      body: "Connect economic inclusion with political stability by integrating youth entrepreneurship, employment, and economic agency into governance priorities.",
    },
  ];
  const aboutEyebrow = getString("aboutEyebrow", "AYPF");
  const aboutHeading = getString(
    "aboutHeading",
    "Youth at the center of Africa’s political and economic transformation",
  );
  const fallbackAboutParagraphs = [
    typeof contentMap.leadParagraph === "string"
      ? String(contentMap.leadParagraph).trim()
      : "",
    typeof contentMap.launchParagraph === "string"
      ? String(contentMap.launchParagraph).trim()
      : "",
  ].filter(Boolean);
  const aboutParagraphs = getStringArray(
    "aboutParagraphs",
    fallbackAboutParagraphs.length > 0
      ? fallbackAboutParagraphs
      : [
          "The AYPF is a continental convening grounded in the conviction that Africa's transformation requires inclusive leadership with youth at its centre. It convenes young politicians, activists, reformers, and emerging leaders who are already shaping governance outcomes or aspire to do so.",
          "At its core is a simple belief: leadership gains legitimacy, creativity, and relevance when it reflects the full diversity, intelligence, and lived experiences of young people. The inaugural edition, held on International Youth Day in partnership with the Government of Ghana, brought together over 1,000 young people and youth political leaders from across the continent.",
        ],
  );
  const focusHeading = getString(
    "focusHeading",
    typeof contentMap.purposeSection === "object" &&
      contentMap.purposeSection &&
      !Array.isArray(contentMap.purposeSection) &&
      typeof (contentMap.purposeSection as Record<string, unknown>).heading ===
        "string"
      ? String((contentMap.purposeSection as Record<string, unknown>).heading)
      : "From symbolic inclusion to structured participation",
  );
  const focusIntro = getString(
    "focusIntro",
    typeof contentMap.purposeSection === "object" &&
      contentMap.purposeSection &&
      !Array.isArray(contentMap.purposeSection) &&
      typeof (contentMap.purposeSection as Record<string, unknown>).intro ===
        "string"
      ? String((contentMap.purposeSection as Record<string, unknown>).intro)
      : "The AYPF is designed as a reform-oriented and capacity-building platform within Africa's political ecosystem. It works to shift youth engagement from symbolic representation to structured political participation where young people can exercise their full agency.",
  );
  const focusAreasFallbackLegacy =
    typeof contentMap.purposeSection === "object" &&
    contentMap.purposeSection &&
    !Array.isArray(contentMap.purposeSection) &&
    Array.isArray(
      (contentMap.purposeSection as Record<string, unknown>).focusAreas,
    )
      ? (
          (contentMap.purposeSection as Record<string, unknown>)
            .focusAreas as unknown[]
        ).filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
      : [];
  const focusAreas = getStringArray(
    "focusAreas",
    focusAreasFallbackLegacy.length > 0
      ? focusAreasFallbackLegacy
      : focusAreasFallback,
  );
  const summit2026Heading = getString(
    "summit2026Heading",
    typeof contentMap.lookingAheadSection === "object" &&
      contentMap.lookingAheadSection &&
      !Array.isArray(contentMap.lookingAheadSection) &&
      typeof (contentMap.lookingAheadSection as Record<string, unknown>)
        .heading === "string"
      ? String(
          (contentMap.lookingAheadSection as Record<string, unknown>).heading,
        )
      : "AYPF 2026",
  );
  const legacy2026Intro =
    typeof contentMap.lookingAheadSection === "object" &&
    contentMap.lookingAheadSection &&
    !Array.isArray(contentMap.lookingAheadSection) &&
    typeof (contentMap.lookingAheadSection as Record<string, unknown>).intro ===
      "string"
      ? String(
          (contentMap.lookingAheadSection as Record<string, unknown>).intro,
        ).trim()
      : "";
  const legacy2026Invitation =
    typeof contentMap.lookingAheadSection === "object" &&
    contentMap.lookingAheadSection &&
    !Array.isArray(contentMap.lookingAheadSection) &&
    typeof (contentMap.lookingAheadSection as Record<string, unknown>)
      .invitationNote === "string"
      ? String(
          (contentMap.lookingAheadSection as Record<string, unknown>)
            .invitationNote,
        ).trim()
      : "";
  const summit2026Paragraphs = getString(
    "summit2026Paragraphs",
    legacy2026Intro ||
      legacy2026Invitation ||
      "The 2026 edition, themed \"Leveraging the Youth Dividend: Driving Africa's Economic and Political Transformation,\" underscores the central role of young Africans in shaping the continent's political and economic trajectory. The Forum aligns with Aspiration 6 of Agenda 2063 and draws inspiration from the African Youth Charter and youth economic inclusion initiatives such as WYFEI 2030.",
  );
  const objectivesHeading = getString(
    "objectivesHeading",
    "Objectives of AYPF 2026",
  );
  const objectives = getStringArray("objectives", objectivesFallback);
  const strategicPrioritiesHeading = getString(
    "strategicPrioritiesHeading",
    "AYPF 2026 Strategic Priorities",
  );
  const strategicPriorities = getObjectArray(
    "strategicPriorities",
    strategicPrioritiesFallback,
    (item) => ({
      title: typeof item.title === "string" ? item.title : "",
      body: typeof item.body === "string" ? item.body : "",
    }),
  );
  const registerHeading = getString(
    "registerHeading",
    getNestedRegisterString(contentMap, "heading", "Register Your Interest"),
  );
  const registerIntro = getString(
    "registerIntro",
    getNestedRegisterString(
      contentMap,
      "intro",
      "Participation in AYPF is by invitation. Register your interest to:",
    ),
  );
  const registerBenefits = getStringArray(
    "registerBenefits",
    getNestedRegisterArray(contentMap, "benefits", [
      "Receive official invitations",
      "Access early updates on the Forum",
      "Engage with preparatory dialogues and programming",
    ]),
  );
  const registerCtaLabel = getString(
    "registerCtaLabel",
    getNestedRegisterString(contentMap, "ctaLabel", "Register Now"),
  );
  const registerCardHeading = getString(
    "registerCardHeading",
    "Secure your spot at AYPF 2026",
  );
  const registerCardBody = getString(
    "registerCardBody",
    "Participation is by invitation. Register your interest to receive official updates and access preparatory dialogues.",
  );
  const registerCardCtaLabel = getString(
    "registerCardCtaLabel",
    registerCtaLabel,
  );
  const aboutBodyHtml = resolveRichHtml({
    html: typeof contentMap.aboutBody === "string" ? contentMap.aboutBody : undefined,
    paragraphs: aboutParagraphs,
  });
  const summit2026Html = resolveRichHtml({
    html:
      typeof contentMap.summit2026Body === "string"
        ? contentMap.summit2026Body
        : typeof contentMap.summit2026Paragraphs === "string"
          ? contentMap.summit2026Paragraphs
          : summit2026Paragraphs,
  });

  const [priorityIndex, setPriorityIndex] = useState(0);
  const activePriority = strategicPriorities[priorityIndex];

  const goPrevPriority = () => {
    setPriorityIndex((prev) =>
      prev === 0 ? strategicPriorities.length - 1 : prev - 1,
    );
  };

  const goNextPriority = () => {
    setPriorityIndex((prev) =>
      prev === strategicPriorities.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: bc },
        ]}
        title={content.title}
        subtitle={content.subtitle}
        image={heroImage}
        imageAlt={content.heroImageAlt || "African Youth in Politics Forum"}
      />
      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-b border-border/80 bg-white py-10 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent-800">
                  {aboutEyebrow}
                </p>
                <h2 className="mt-3 font-serif text-[2rem] font-semibold leading-tight text-black sm:text-[2.5rem]">
                  {aboutHeading}
                </h2>
                <RichTextContent
                  html={aboutBodyHtml}
                  className="mt-6 text-[1.08rem] font-medium leading-relaxed text-stone-800"
                />
              </div>
              <div className="self-start rounded-none border border-border/90 bg-white p-6 shadow-sm">
                <h3 className="font-serif text-xl font-semibold text-black">
                  {registerCardHeading}
                </h3>
                <RichTextContent
                  html={registerCardBody}
                  className="mt-2 text-sm text-black"
                />
                <Button
                  asChild
                  href={regHref}
                  variant="primary"
                  className="mt-5 w-full rounded-none bg-accent-600 hover:bg-accent-700"
                >
                  {registerCardCtaLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
      <HomeScrollReveal
        variant="slideLeft"
        start="top 88%"
        className="block w-full"
      >
        <section
          className="w-full border-t border-white/20 bg-cover bg-center bg-no-repeat py-12 sm:py-16 lg:py-20 text-white"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(32,20,13,0.22) 0%, rgba(12,10,9,0.64) 56%, rgba(5,5,6,0.88) 100%), radial-gradient(circle at 72% 30%, rgba(190,120,70,0.22), transparent 46%), url('${focusSectionBgImage}')`,
          }}
        >
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <h2 className="max-w-5xl font-serif text-[1.9rem] font-semibold sm:text-[2.3rem]">
              {focusHeading}
            </h2>
            <RichTextContent
              html={focusIntro}
              className="mt-5 max-w-4xl text-base font-medium leading-relaxed text-white/95 sm:text-[1.03rem] [&_a]:text-white [&_a]:underline"
            />
            <RichTextListItems
              items={focusAreas}
              as="ul"
              listClassName="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2"
              itemClassName="rounded-none border border-white/30 bg-white/5 px-4 py-4 text-sm font-medium leading-relaxed sm:px-5"
              className="text-sm font-medium leading-relaxed text-white/95"
            />
          </div>
        </section>
      </HomeScrollReveal>
      <HomeScrollReveal
        variant="scaleUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
              {summit2026Heading}
            </h2>
            <RichTextContent
              html={summit2026Html}
              className="mt-5 text-[1.08rem] font-medium leading-relaxed text-stone-800"
            />
          </div>
        </section>
      </HomeScrollReveal>
      <HomeScrollReveal
        variant="fadeIn"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
              {objectivesHeading}
            </h2>
            <RichTextListItems
              items={objectives}
              as="ul"
              listClassName="mt-6 grid gap-x-7 gap-y-5 sm:grid-cols-2"
              itemClassName="rounded-none border border-border/80 bg-white p-6 text-sm font-medium leading-relaxed text-black"
              className="text-sm font-medium leading-relaxed text-black"
            />
          </div>
        </section>
      </HomeScrollReveal>
      <HomeScrollReveal
        variant="tiltUp"
        start="top 86%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-12 sm:py-16 lg:py-20">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
              {strategicPrioritiesHeading}
            </h2>
            <div
              className="mt-8 overflow-hidden rounded-none border border-white/30 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(32,20,13,0.2) 0%, rgba(10,8,8,0.66) 54%, rgba(5,5,6,0.9) 100%), radial-gradient(circle at 72% 28%, rgba(190,120,70,0.2), transparent 45%), url('${strategicPrioritiesBgImage}')`,
              }}
            >
              <article className="min-h-[250px] px-6 py-7 sm:min-h-[280px] sm:px-8 sm:py-9 lg:px-10">
                <h3 className="max-w-4xl font-sans text-[1.85rem] font-semibold leading-tight text-white sm:text-[2.05rem]">
                  {activePriority.title}
                </h3>
                <RichTextContent
                  html={activePriority.body}
                  className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/95 sm:text-[1.03rem] [&_a]:text-white [&_a]:underline"
                />
              </article>
              <div className="flex items-center justify-between border-t border-white/30 bg-black/30 px-5 py-3.5 sm:px-7">
                <div className="text-sm font-medium text-white">
                  {priorityIndex + 1}/{strategicPriorities.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrevPriority}
                    aria-label="Previous strategic priority"
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNextPriority}
                    aria-label="Next strategic priority"
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
      <HomeScrollReveal
        variant="tiltUp"
        start="top 86%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-12 sm:py-16">
          <div className="mx-auto w-full max-w-4xl px-6 sm:px-8 lg:px-11">
            <div className="rounded-none border border-border/80 bg-accent-600 p-10 sm:p-12 text-white">
              <h2 className="font-serif text-3xl font-semibold text-white">
                {registerHeading}
              </h2>
              <RichTextContent
                html={registerIntro}
                className="mt-3 text-sm font-medium leading-relaxed text-white/95"
              />
              <RichTextListItems
                items={registerBenefits}
                as="ul"
                listClassName="mt-5 list-disc space-y-3 pl-6 text-white marker:text-white"
                className="text-sm font-medium leading-relaxed text-white/95"
              />
              <Button
                asChild
                href={regHref}
                variant="primary"
                className="mt-8 !rounded-none !bg-white font-semibold !text-accent-900 shadow-none hover:!bg-stone-100"
              >
                {registerCtaLabel}
              </Button>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
