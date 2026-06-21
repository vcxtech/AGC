import Link from "next/link";
import type { Metadata } from "next";
import { workContent, fallbackNews, fallbackEvents, ORG_SEO_DESCRIPTION } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { getHomePageCms } from "@/lib/home-page-data";
import { getEvents, getNews } from "@/lib/content";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import type { CmsNews, CmsEvent } from "@/lib/content";
import { Button } from "@/components/Button";
import { HeroConsultar } from "@/components/HeroConsultar";
import { HeroFeaturesOverlap } from "@/components/HeroFeaturesOverlap";
import { HomePartnerStrip } from "@/components/HomePartnerStrip";
import { HomeSpotlightStory } from "@/components/HomeSpotlightStory";
import { NewsCard } from "@/components/NewsCard";
import { HomeEventsSection } from "@/components/HomeEventsSection";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { resolveEventsForPublic, resolveNewsForPublic } from "@/lib/cms-fallback";
import { CmsDraftNotice } from "@/components/CmsDraftNotice";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const description = siteSettings.tagline?.trim() || ORG_SEO_DESCRIPTION;
  return {
    description,
    openGraph: {
      title: `${siteSettings.name} | Governance Excellence Across Africa`,
      description,
      url: "/",
    },
    alternates: {
      canonical: "/",
    },
  };
}

type OurWorkCms = typeof workContent & {
  heroImage?: string;
  /** Homepage pillar: heading above Programs / Projects / Advisory row */
  pillarRowTitlePrimary?: string;
  /** Homepage pillar: description below Programs / Projects / Advisory row heading */
  pillarRowDescriptionPrimary?: string;
  /** Homepage pillar: heading above Research / Training / Partnership row */
  pillarRowTitleSecondary?: string;
  /** Homepage pillar: description below Research / Training / Partnership row heading */
  pillarRowDescriptionSecondary?: string;
  pillarReadMoreLabel?: string;
  pillarCardImages?: {
    programs?: string;
    projects?: string;
    advisory?: string;
    research?: string;
    training?: string;
    partnership?: string;
  };
};

/** CMS fields on Our Work — Programs / Projects / Advisory page records (slug `our-work-*`). */
type WorkSectionPageMerged = { heroImage?: string; sectionImage?: string };

/**
 * Homepage pillar image: optional override from main `our-work` (pillarCardImages), else the
 * matching section page hero, then section image — same assets as each `/our-work/*` section page.
 */
async function resolveHomePillarImage(
  pillarOverride: string | undefined,
  section: WorkSectionPageMerged
): Promise<string | undefined> {
  const candidates = [
    pillarOverride?.trim() || undefined,
    section.heroImage?.trim() || undefined,
    section.sectionImage?.trim() || undefined,
  ].filter((x): x is string => Boolean(x));

  for (const raw of candidates) {
    const url = cardImageUrlOrNull((await resolveImageUrl(raw)) ?? null);
    if (url) return url;
  }
  return undefined;
}

export default async function HomePage() {
  const workFallback = cmsStaticOrEmpty(workContent as OurWorkCms);

  const [
    events,
    news,
    home,
    workMerged,
    programsSectionMerged,
    projectsSectionMerged,
    advisorySectionMerged,
    researchSectionMerged,
    trainingSectionMerged,
    partnershipSectionMerged,
  ] = await Promise.all([
    getEvents(),
    getNews(6),
    getHomePageCms(),
    getMergedPageContent<OurWorkCms>("our-work", workFallback),
    getMergedPageContent<typeof workContent.programs & WorkSectionPageMerged>(
      "programs",
      cmsStaticOrEmpty(workContent.programs as typeof workContent.programs & WorkSectionPageMerged)
    ),
    getMergedPageContent<typeof workContent.projects & WorkSectionPageMerged>(
      "projects",
      cmsStaticOrEmpty(workContent.projects as typeof workContent.projects & WorkSectionPageMerged)
    ),
    getMergedPageContent<typeof workContent.advisory & WorkSectionPageMerged>(
      "advisory",
      cmsStaticOrEmpty(workContent.advisory as typeof workContent.advisory & WorkSectionPageMerged)
    ),
    getMergedPageContent<typeof workContent.research & WorkSectionPageMerged>(
      "research",
      cmsStaticOrEmpty(workContent.research as typeof workContent.research & WorkSectionPageMerged)
    ),
    getMergedPageContent<typeof workContent.training & WorkSectionPageMerged>(
      "training",
      cmsStaticOrEmpty(workContent.training as typeof workContent.training & WorkSectionPageMerged)
    ),
    getMergedPageContent<typeof workContent.partnership & WorkSectionPageMerged>(
      "our-work-partnership",
      cmsStaticOrEmpty(workContent.partnership as typeof workContent.partnership & WorkSectionPageMerged)
    ),
  ]);

  const { items: eventsList, cmsDraftsOnly: homeEventsDrafts } = await resolveEventsForPublic(
    events,
    fallbackEvents as CmsEvent[]
  );
  const { items: newsList, cmsDraftsOnly: homeNewsDrafts } = await resolveNewsForPublic(
    news,
    fallbackNews as CmsNews[]
  );
  const allEventsRaw: CmsEvent[] = eventsList;
  const allEvents: CmsEvent[] = await Promise.all(
    allEventsRaw.map(async (e) => ({
      ...e,
      image: (await resolveImageUrl(e.image)) || undefined,
    }))
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastEvents = allEvents
    .filter((e) => new Date(e.end_date || e.start_date) < today)
    .sort(
      (a, b) =>
        new Date(a.end_date || a.start_date).getTime() -
        new Date(b.end_date || b.start_date).getTime()
    )
    .slice(0, 3);
  const upcomingEvents = allEvents
    .filter((e) => new Date(e.end_date || e.start_date) >= today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);
  const latestNewsRaw: CmsNews[] = newsList.slice(0, 3);
  const latestNews = await Promise.all(
    latestNewsRaw.map(async (n) => ({
      item: n,
      imageUrl: (await resolveImageUrl(n.image)) || undefined,
    }))
  );

  const heroSlidesRaw = home.heroSliderImages ?? [];
  const heroSlides = (
    await Promise.all(
      heroSlidesRaw.map(async (ref) => {
        const url = await resolveImageUrl(ref);
        return url ?? ref;
      }),
    )
  ).filter((s): s is string => typeof s === "string" && s.length > 0);
  const rawHeroVideo = home.heroBackgroundVideoSrc;
  const heroBackgroundVideoSrc =
    rawHeroVideo === undefined || rawHeroVideo === null
      ? undefined
      : rawHeroVideo.trim() === ""
        ? undefined
        : rawHeroVideo.trim();
  const pillarImages = workMerged.pillarCardImages ?? {};
  const [
    imgPrograms,
    imgProjects,
    imgAdvisory,
    imgResearch,
    imgTraining,
    imgPartnership,
  ] = await Promise.all([
    resolveHomePillarImage(pillarImages.programs, programsSectionMerged),
    resolveHomePillarImage(pillarImages.projects, projectsSectionMerged),
    resolveHomePillarImage(pillarImages.advisory, advisorySectionMerged),
    resolveHomePillarImage(pillarImages.research, researchSectionMerged),
    resolveHomePillarImage(pillarImages.training, trainingSectionMerged),
    resolveHomePillarImage(pillarImages.partnership, partnershipSectionMerged),
  ]);

  const pillarCards = [
    {
      title:
        workMerged.programs?.title?.trim() ||
        programsSectionMerged.title?.trim() ||
        workContent.programs.title,
      description:
        workMerged.programs?.subtitle?.trim() ||
        programsSectionMerged.subtitle?.trim() ||
        workContent.programs.subtitle,
      href: "/our-work/programs",
      image: imgPrograms,
    },
    {
      title:
        workMerged.projects?.title?.trim() ||
        projectsSectionMerged.title?.trim() ||
        workContent.projects.title,
      description:
        workMerged.projects?.subtitle?.trim() ||
        projectsSectionMerged.subtitle?.trim() ||
        workContent.projects.subtitle,
      href: "/our-work/projects",
      image: imgProjects,
    },
    {
      title:
        workMerged.advisory?.title?.trim() ||
        advisorySectionMerged.title?.trim() ||
        workContent.advisory.title,
      description:
        workMerged.advisory?.subtitle?.trim() ||
        advisorySectionMerged.subtitle?.trim() ||
        workContent.advisory.subtitle,
      href: "/our-work/advisory",
      image: imgAdvisory,
    },
    {
      title:
        workMerged.research?.title?.trim() ||
        researchSectionMerged.title?.trim() ||
        workContent.research.title,
      description:
        workMerged.research?.subtitle?.trim() ||
        researchSectionMerged.subtitle?.trim() ||
        workContent.research.subtitle,
      href: "/our-work/research",
      image: imgResearch,
    },
    {
      title: "Capacity Building",
      description:
        workMerged.training?.subtitle?.trim() ||
        trainingSectionMerged.subtitle?.trim() ||
        workContent.training.subtitle,
      href: "/our-work/training",
      image: imgTraining,
    },
    {
      title:
        workMerged.partnership?.title?.trim() ||
        partnershipSectionMerged.title?.trim() ||
        workContent.partnership.title,
      description:
        workMerged.partnership?.subtitle?.trim() ||
        partnershipSectionMerged.subtitle?.trim() ||
        workContent.partnership.subtitle,
      href: "/our-work/partnership",
      image: imgPartnership,
    },
  ].filter((c) => c.title.trim());

  const impactStats = home.homeImpactStats.filter((s) => s.value?.trim() || s.label?.trim() || s.note?.trim());
  const showReach = Boolean(home.homeReach.title?.trim());
  const showCtaBand = Boolean(home.homeCtaBand.title?.trim());
  const newsSectionTitle = home.homeNewsTeaser.title?.trim() || "Latest News";
  const eventsSectionTitle = home.homeEventsTitle?.trim() || "Events";

  const spotlightImageRef = home.homeSpotlightStory.image?.trim() || placeholderImages.hero;
  const spotlightPortraitSrc =
    (await resolveImageUrl(spotlightImageRef)) ?? (spotlightImageRef.startsWith("/") ? spotlightImageRef : `/${spotlightImageRef}`);
  const ctaBandImageRef = home.homeCtaBand.image?.trim() || "";
  const ctaBandImage =
    (ctaBandImageRef ? await resolveImageUrl(ctaBandImageRef) : null) ||
    imgProjects ||
    imgPrograms ||
    imgAdvisory ||
    placeholderImages.hero;

  return (
    <>
      <HeroConsultar
        hero={home.heroContent}
        sliderImages={heroSlides}
        backgroundVideoSrc={heroBackgroundVideoSrc}
      />

      {(homeEventsDrafts || homeNewsDrafts) && (
        <HomeScrollReveal variant="fadeIn" className="block w-full">
          <div className="border-b border-amber-200/80 bg-amber-50/95">
            <div className="mx-auto w-full max-w-none px-6 py-3 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
              <CmsDraftNotice entityLabel="news or events" adminHref="/admin" />
            </div>
          </div>
        </HomeScrollReveal>
      )}

      <HomeScrollReveal variant="slideLeft" className="block w-full">
        <HeroFeaturesOverlap
          readMoreLabel={workMerged.pillarReadMoreLabel?.trim() ?? ""}
          rowTitlePrimary={workMerged.pillarRowTitlePrimary}
          rowDescriptionPrimary={workMerged.pillarRowDescriptionPrimary}
          rowTitleSecondary={workMerged.pillarRowTitleSecondary}
          rowDescriptionSecondary={workMerged.pillarRowDescriptionSecondary}
          cards={pillarCards}
        />
      </HomeScrollReveal>

      {(showReach || impactStats.length > 0) && (
        <HomeScrollReveal variant="clipOpen" className="block w-full">
          <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
            {/* Match site header (`Header.tsx` nav): same horizontal inset as logo row */}
            <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
              {showReach && (
                <HomeScrollReveal variant="fadeUp" start="top 90%" className="mb-10 block w-full sm:mb-11">
                  <div>
                    <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                      {home.homeReach.title}
                    </h2>
                    {home.homeReach.intro?.trim() ? (
                      <RichTextContent
                        html={home.homeReach.intro}
                        className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-black"
                      />
                    ) : null}
                  </div>
                </HomeScrollReveal>
              )}
              {impactStats.length > 0 && (
                <HomeScrollReveal
                  variant="scaleUp"
                  staggerSelector="> *"
                  stagger={0.12}
                  start="top 86%"
                  className="grid w-full gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
                >
                  {impactStats.map((stat, i) => (
                    <div
                      key={`${stat.label}-${i}`}
                      className="bg-white p-5 shadow-[0_6px_24px_-6px_rgba(15,23,42,0.14)] sm:p-6"
                    >
                      <p className="font-sans text-3xl font-semibold tabular-nums tracking-tight text-accent-800">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-black">{stat.label}</p>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-black">{stat.note}</p>
                    </div>
                  ))}
                </HomeScrollReveal>
              )}
            </div>
          </section>
        </HomeScrollReveal>
      )}

      <HomeScrollReveal variant="fadeUp" start="top 85%" className="block w-full">
        <HomeSpotlightStory story={home.homeSpotlightStory} portraitSrc={spotlightPortraitSrc} />
      </HomeScrollReveal>

      <HomeScrollReveal variant="slideRight" className="block w-full">
        <HomePartnerStrip blurb={home.homePartnerBlurb} />
      </HomeScrollReveal>

      {home.homeTestimonial.quote?.trim() ? (
        <HomeScrollReveal variant="scaleUp" start="top 84%" className="block w-full">
          <section className="bg-white py-14 sm:py-20">
            <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
              <div className="mx-auto grid max-w-4xl gap-8 rounded-none bg-white p-8 shadow-[0_6px_24px_-6px_rgba(15,23,42,0.14)] sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-10">
              <div
                className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent-100 font-sans text-2xl font-medium text-accent-900 sm:mx-0"
                aria-hidden
              >
                {home.homeTestimonial.initials}
              </div>
              <blockquote className="min-w-0">
                <div className="font-serif text-lg font-medium leading-relaxed text-black sm:text-xl sm:leading-relaxed">
                  <RichTextContent html={home.homeTestimonial.quote} />
                </div>
                <footer className="mt-8 border-t border-border/60 pt-6">
                  <cite className="not-italic">
                    <span className="text-lg font-medium text-black">{home.homeTestimonial.name}</span>
                    {([home.homeTestimonial.title, home.homeTestimonial.organization]
                      .map((x) => x?.trim())
                      .filter(Boolean)
                      .join(", ")) ? (
                      <span className="mt-1 block text-sm font-medium text-black">
                        {[home.homeTestimonial.title, home.homeTestimonial.organization]
                          .map((x) => x?.trim())
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : null}
                  </cite>
                </footer>
              </blockquote>
              </div>
            </div>
          </section>
        </HomeScrollReveal>
      ) : null}

      {showCtaBand && (
        <section className="bg-white py-12 sm:py-14 lg:py-16">
          <HomeScrollReveal variant="tiltUp" start="top 82%" className="block w-full">
            <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
              <div
                className="relative overflow-hidden rounded-none"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,13,20,0.1) 0%, rgba(6,10,16,0.62) 58%, rgba(0,0,0,0.86) 100%), radial-gradient(circle at 18% 30%, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 48%), url(${ctaBandImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/10" aria-hidden />
                <div className="relative z-[1] grid gap-8 px-6 py-12 sm:px-8 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:py-16">
              <div className="lg:col-span-6 lg:pt-1">
                {home.homeCtaBand.eyebrow?.trim() ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/90">{home.homeCtaBand.eyebrow}</p>
                ) : null}
                <h2 className="mt-4 max-w-[18ch] font-serif text-[1.75rem] font-semibold leading-[1.1] text-white sm:text-[2.1rem] lg:text-[2.7rem]">
                  {home.homeCtaBand.title}
                </h2>
              </div>
              <div className="flex flex-col justify-center pt-4 lg:col-span-6 lg:pt-0">
                {home.homeCtaBand.body?.trim() ? (
                  <RichTextContent
                    html={home.homeCtaBand.body}
                    className="max-w-[48ch] text-[17px] leading-[1.65] text-white/95 [&_a]:text-white [&_a]:underline"
                  />
                ) : null}
                <div className="mt-7 flex flex-wrap gap-3">
                  {home.homeCtaBand.primaryCta?.trim() ? (
                    <Button
                      asChild
                      href={home.homeCtaBand.primaryHref || "/get-involved"}
                      variant="primary"
                      size="lg"
                      className="rounded-none bg-white text-accent-900 shadow-md hover:bg-accent-50"
                    >
                      {home.homeCtaBand.primaryCta}
                    </Button>
                  ) : null}
                  {home.homeCtaBand.secondaryCta?.trim() ? (
                    <Button
                      asChild
                      href={home.homeCtaBand.secondaryHref || "/about"}
                      variant="outline"
                      size="lg"
                      className="rounded-none border-border/50 text-white hover:bg-white/10"
                    >
                      {home.homeCtaBand.secondaryCta}
                    </Button>
                  ) : null}
                </div>
              </div>
                </div>
              </div>
            </div>
          </HomeScrollReveal>
        </section>
      )}

      <HomeEventsSection pastEvents={pastEvents} upcomingEvents={upcomingEvents} title={eventsSectionTitle} />

      <section className="border-t border-border bg-white py-10 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <HomeScrollReveal variant="slideRight" start="top 88%" className="block w-full">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
              <h2 className="font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">{newsSectionTitle}</h2>
              <Link
                href="/news"
                className="shrink-0 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                View all
              </Link>
            </div>
            {home.homeNewsTeaser.subtitle?.trim() ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {home.homeNewsTeaser.subtitle}
              </p>
            ) : null}
          </HomeScrollReveal>

          {latestNews.length > 0 ? (
            <HomeScrollReveal
              variant="fadeUp"
              staggerSelector="> *"
              stagger={0.14}
              start="top 86%"
              className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3"
            >
              {latestNews.map(({ item, imageUrl }) => (
                <NewsCard key={item.id} item={item} imageUrl={imageUrl} href="/news" variant="homeTeaser" />
              ))}
            </HomeScrollReveal>
          ) : (
            <HomeScrollReveal variant="fadeUp" start="top 88%" className="mt-8 block">
              <div className="border border-border bg-stone-50/90 p-8 text-center">
                <p className="text-slate-600">No published news yet.</p>
                <Button asChild href="/news" variant="outline" className="mt-6 rounded-none">
                  News archive
                </Button>
              </div>
            </HomeScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
