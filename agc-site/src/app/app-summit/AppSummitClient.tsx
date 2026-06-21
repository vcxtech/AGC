"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CalendarDays, Handshake, MapPin, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import type { AppSummitCmsContent } from "@/data/app-summit";
import type { SiteSettings } from "@/lib/site-settings";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextListItems, RichTextBulletList } from "@/components/RichTextListItems";
import { resolveRichHtml } from "@/lib/rich-text";

/** Avoids the year (e.g. 2026) wrapping alone on its own line in plain registration subtitles */
function RegistrationCardSubtitle({ text }: { text: string }): ReactNode {
  const normalized = text
    .replace(/\b2025\b/g, "2026")
    .replace(/(Summit)\s+(20\d{2})/gi, "Summit\u00a0$2");
  const re = /(APP\s+Summit\s+20\d{2})/i;
  const match = normalized.match(re);
  if (!match || match.index === undefined) {
    return normalized;
  }
  const before = normalized.slice(0, match.index);
  const mid = match[0];
  const after = normalized.slice(match.index + mid.length);
  return (
    <>
      {before}
      <span className="whitespace-nowrap">{mid}</span>
      {after}
    </>
  );
}

export function AppSummitClient({
  content,
  heroImage,
  siteSettings,
}: {
  content: AppSummitCmsContent;
  /** Omit for gradient-only hero when no CMS image is set */
  heroImage?: string;
  siteSettings: SiteSettings;
}) {
  const [liveContent, setLiveContent] = useState<AppSummitCmsContent>(content);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/page-content?slug=${encodeURIComponent("app-summit")}`,
        );
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.content_json && typeof json.content_json === "object") {
          setLiveContent(
            (prev) =>
              ({
                ...(prev as Record<string, unknown>),
                ...(json.content_json as Record<string, unknown>),
              }) as AppSummitCmsContent,
          );
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const contentMap = liveContent as unknown as Record<string, unknown>;
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
  const registration = (liveContent.registration ??
    content.registration) as AppSummitCmsContent["registration"];
  const registrationTitle =
    registration.title?.trim() || "Secure your spot";
  const registrationSubtitle =
    registration.subtitle?.trim() ||
    "Secure your spot at APP Summit 2026";
  const registrationFootnote =
    registration.footnote?.trim() ||
    "Sponsorship prospectus available. To partner with APPS 2026, contact the Secretariat directly.";
  const detailDate =
    liveContent.details?.date?.trim() ||
    content.details?.date?.trim() ||
    "August 10-12, 2025";
  const detailLocation =
    liveContent.details?.location?.trim() ||
    content.details?.location?.trim() ||
    "Accra International Conference Centre, Ghana";
  const detailParticipants =
    liveContent.details?.participants?.trim() ||
    content.details?.participants?.trim() ||
    "Over 700 participants and 50+ political parties";
  const detailLabelDate = getString("detailLabelDate", "Date");
  const detailLabelLocation = getString("detailLabelLocation", "Location");
  const detailLabelParticipants = getString(
    "detailLabelParticipants",
    "Participants",
  );
  const aboutSectionEyebrow = getString("aboutSectionEyebrow", "APP Summit");
  const aboutSectionHeading = getString(
    "aboutSectionHeading",
    "A continental platform for democratic resilience and political transformation",
  );
  const highlightsHeading = getString(
    "highlightsHeading",
    "APPS 2025 Highlights",
  );
  const focusHeading = getString("focusSectionHeading", "Key Focus Areas");
  const summit2026Heading = getString("summit2026Heading", "APPS 2026");
  const outcomesHeading = getString("outcomesHeading", "Expected Outcomes");
  const structureHeading = getString(
    "structureHeading",
    "Summit Structure and Format",
  );
  const sponsorshipHeading = getString(
    "sponsorshipHeading",
    "Sponsorship & Partnership",
  );
  const keyFocusBgImage = getString(
    "keyFocusBgImage",
    "/uploads/placeholder.svg",
  );
  const sponsorshipBgImage = getString(
    "sponsorshipBgImage",
    "/uploads/placeholder.svg",
  );
  const highlightsImages = Array.from({ length: 10 }).map((_, i) =>
    getString(`highlightsImage${i + 1}`, "/uploads/placeholder.svg"),
  );

  const keyFocusAreas = getStringArray("keyFocusAreas", [
    "Political Cooperation and Party Dialogue",
    "Democratic Governance and Institutional Reform",
    "Political Party Financing and Campaign Transparency",
    "Youth and Women’s Political Leadership",
    "Conflict Prevention and Peacebuilding",
    "Digital Innovation and Political Communication",
    "Continental Integration and Development Planning",
  ]);

  const expectedOutcomes = getStringArray("expectedOutcomes", [
    "Adoption of a high-level declaration articulating shared continental principles on economic transformation and political responsibility.",
    "Establishment of a structured inter-party economic policy dialogue platform under the African Political Parties Initiative.",
    "Agreement on technical working groups focused on fiscal governance, youth employment, and industrial development.",
    "Strengthened partnerships between political actors and regional economic institutions.",
    "Enhanced continental visibility of political parties as constructive contributors to Africa’s development agenda.",
    "A dedicated set of recommendations from the Africa Women Political Leadership Summit and the Africa Youth in Politics Forum informing continental party reform agendas.",
  ]);
  const sponsorshipPoints = getStringArray("sponsorshipPoints", [
    "Brand visibility across venues, digital platforms, and summit materials",
    "Speaking opportunities and session branding",
    "Exhibition space for products and services",
    "Access to closed-door VIP sessions and publicity acknowledgements",
  ]);
  const aboutParagraphs = getStringArray("aboutParagraphs", [
    "The African Political Parties Summit (APPS) is a high-level continental platform that convenes political leaders, governance institutions, and policy influencers from across Africa. The concept for the Summit was inspired by growing concerns about the continent's changing governance landscape.",
    "Over the past decade, Africa has experienced a concerning decline in democratic development, evidenced by political unrest, electoral irregularities, and increasing public skepticism toward democratic institutions. Given that political parties serve as the primary vehicles for leadership selection and policy formulation, strengthening these institutions is crucial for safeguarding democracy and effectively addressing Africa's evolving political landscape.",
    "APPS offers a neutral, inclusive, and policy-oriented platform to advance reforms aimed at restoring public trust and strengthening democratic resilience. The inaugural edition, held in Accra from August 10-12, 2025, brought together over 700 participants from more than 50 countries for strategic dialogue and collaboration.",
  ]);
  const summit2026Paragraphs = getStringArray("summit2026Paragraphs", [
    "The second edition of APPS moves the conversation from broad democratic commitments to a focused and practical inquiry: how can political parties become credible, institutional drivers of economic transformation in Africa?",
    "APPS seeks to convene heads of state, political leaders, policymakers, economists, private sector actors, academia, civil society organisations and development partners to explore how party systems can contribute meaningfully to Africa's economic renewal.",
  ]);
  const aboutBodyHtml = resolveRichHtml({
    html: typeof contentMap.aboutBody === "string" ? contentMap.aboutBody : undefined,
    paragraphs: aboutParagraphs,
  });
  const summit2026Html = resolveRichHtml({
    html: typeof contentMap.summit2026Body === "string" ? contentMap.summit2026Body : undefined,
    paragraphs: summit2026Paragraphs,
  });
  const inauguralParagraph = getString("inauguralParagraph", "");
  const sponsorshipIntro = getString(
    "sponsorshipIntro",
    "APPS 2026 provides strategic opportunities for corporate and institutional sponsorship through high-visibility brand exposure, partnership recognition, and direct engagement with policy influencers from across Africa.",
  );
  const finalCtaHeading = getString(
    "finalCtaHeading",
    "Secure your spot at APP Summit 2026",
  );
  const finalCtaBody = getString(
    "finalCtaBody",
    "A sponsorship prospectus is available for download. Organizations interested in partnering with APPS 2026 are encouraged to contact the Secretariat directly.",
  );
  const finalAddress = getString(
    "finalAddress",
    "No 5 Teinor Street, Dzorwulu – Accra Ghana",
  );
  const finalParticipantsNote = getString(
    "finalParticipantsNote",
    "Participants include heads of state and government affiliated with political parties, party chairpersons and secretaries-general, members of parliament, economic advisors, private sector leaders, academia, and civil society actors.",
  );
  const structureCards = [
    {
      label: getString("dayOneLabel", "Day One"),
      title: getString("dayOneTitle", "Inclusive leadership platforms"),
      body: getString(
        "dayOneBody",
        "Africa Women Political Leadership Summit and African Youth in Politics Forum as foundational pillars.",
      ),
    },
    {
      label: getString("dayTwoLabel", "Day Two"),
      title: getString("dayTwoTitle", "Plenary and strategic dialogues"),
      body: getString(
        "dayTwoBody",
        "Full summit programme with thematic roundtables and moderated high-level discussions.",
      ),
    },
    {
      label: getString("dayThreeLabel", "Day Three"),
      title: getString("dayThreeTitle", "Consultations and commitments"),
      body: getString(
        "dayThreeBody",
        "Closed-door consultations among party leaders, with outputs informed by youth and women platforms.",
      ),
    },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.appSummit },
        ]}
        title={liveContent.title || content.title}
        subtitle={liveContent.subtitle || content.subtitle}
        image={heroImage}
        imageAlt={
          liveContent.heroImageAlt || content.heroImageAlt || "APP Summit"
        }
      />

      <section className="w-full border-b border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-14">
            <HomeScrollReveal
              variant="slideLeft"
              start="top 87%"
              className="block w-full lg:col-span-2"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent-800">
                  {aboutSectionEyebrow}
                </p>
                <h2 className="mt-3 font-serif text-[2rem] font-semibold leading-tight text-black sm:text-[2.5rem]">
                  {aboutSectionHeading}
                </h2>
                <RichTextContent html={aboutBodyHtml} className="mt-6 text-lg leading-relaxed" />
                {inauguralParagraph.trim() ? (
                  <RichTextContent html={inauguralParagraph} className="mt-4 text-lg leading-relaxed" />
                ) : null}
                <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                  <li className="rounded-none border border-border/80 bg-white p-4">
                    <CalendarDays className="h-5 w-5 text-accent-700" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-black">
                      {detailLabelDate}
                    </p>
                    <p className="mt-1 text-sm font-medium text-black">
                      {detailDate}
                    </p>
                  </li>
                  <li className="rounded-none border border-border/80 bg-white p-4">
                    <MapPin className="h-5 w-5 text-accent-700" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-black">
                      {detailLabelLocation}
                    </p>
                    <p className="mt-1 text-sm font-medium text-black">
                      {detailLocation}
                    </p>
                  </li>
                  <li className="rounded-none border border-border/80 bg-white p-4">
                    <Users className="h-5 w-5 text-accent-700" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-black">
                      {detailLabelParticipants}
                    </p>
                    <p className="mt-1 text-sm font-medium text-black">
                      {detailParticipants}
                    </p>
                  </li>
                </ul>
              </div>
            </HomeScrollReveal>
            <HomeScrollReveal
              variant="slideRight"
              start="top 86%"
              className="block w-full self-start"
            >
              <div className="rounded-none border border-border/90 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="page-heading text-xl">{registrationTitle}</h3>
                {/<(?:p|h[1-6]|ul|ol|li|blockquote|br|strong|em|a)\b/i.test(
                  registrationSubtitle,
                ) ? (
                  <RichTextContent
                    html={registrationSubtitle}
                    className="mt-2 text-sm text-black"
                  />
                ) : (
                  <p className="page-prose mt-2 text-sm text-black">
                    <RegistrationCardSubtitle text={registrationSubtitle} />
                  </p>
                )}
                <Button
                  asChild
                  href={registration.href}
                  variant="primary"
                  className="mt-5 w-full rounded-none bg-accent-600 hover:bg-accent-700"
                >
                  {registration.cta || "Register Now"}
                </Button>
                <RichTextContent
                  html={registrationFootnote}
                  className="mt-5 text-xs leading-relaxed text-black [&_a]:font-medium [&_a]:underline"
                />
              </div>
            </HomeScrollReveal>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <HomeScrollReveal
            variant="fadeUp"
            start="top 88%"
            className="block w-full"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
                {highlightsHeading}
              </h2>
            </div>
          </HomeScrollReveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {highlightsImages.map((image, i) => (
              <div
                key={i}
                className="relative aspect-4/3 overflow-hidden rounded-none border border-border/80 bg-stone-100"
              >
                <img
                  src={image}
                  alt={`APPS 2025 placeholder ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="relative overflow-hidden rounded-none border border-slate-800/70 bg-slate-950 px-6 py-10 text-white sm:px-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-slate-950/78" />
              <div className="absolute inset-0 bg-linear-to-br from-slate-950/92 via-slate-900/70 to-slate-800/45" />
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-55">
              <img
                src={keyFocusBgImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                {focusHeading}
              </p>
              <ul className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <RichTextBulletList
                  items={keyFocusAreas}
                  bulletClassName="bg-white"
                  className="text-sm leading-relaxed sm:text-base text-white"
                />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
            {summit2026Heading}
          </h2>
          <RichTextContent html={summit2026Html} className="mt-5 text-lg leading-relaxed" />
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
            {outcomesHeading}
          </h2>
          <RichTextListItems
            items={expectedOutcomes}
            as="ul"
            listClassName="mt-6 grid gap-4 sm:grid-cols-2"
            itemClassName="rounded-none border border-border/80 bg-white p-5 text-sm leading-relaxed text-black"
            className="text-sm leading-relaxed text-black"
          />
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
            {structureHeading}
          </h2>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {structureCards.map((card) => (
              <div
                key={card.label}
                className="rounded-none border border-border/80 bg-white p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-700">
                  {card.label}
                </p>
                <h3 className="mt-2 font-sans text-xl font-semibold text-black">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black">
                  <RichTextContent html={card.body} className="mt-2 text-sm text-black" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="relative overflow-hidden rounded-none border border-border/80 bg-black px-6 py-10 text-white sm:px-10">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <img
                src={sponsorshipBgImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative">
              <h2 className="font-serif text-[1.9rem] font-semibold sm:text-[2.3rem]">
                {sponsorshipHeading}
              </h2>
              <RichTextContent
                html={sponsorshipIntro}
                className="mt-4 max-w-4xl text-sm leading-relaxed text-white/90 sm:text-base [&_a]:text-white [&_a]:underline"
              />
              <RichTextListItems
                items={sponsorshipPoints}
                as="ul"
                listClassName="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2"
                className="text-sm leading-relaxed text-white/90"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="isolate w-full border-t border-border/80 bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl bg-white px-4 sm:px-6 lg:px-8">
          <HomeScrollReveal
            variant="scaleUp"
            start="top 88%"
            className="block w-full bg-white"
          >
            <div className="rounded-none border border-border/80 bg-white p-8 sm:p-10">
              <h2 className="font-serif text-3xl font-semibold text-black">
                {finalCtaHeading}
              </h2>
              <RichTextContent html={finalCtaBody} className="mt-3 text-black" />
              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  asChild
                  href={registration.href || "/contact"}
                  variant="primary"
                  className="rounded-none bg-accent-700 hover:bg-accent-800"
                >
                  {registration.cta || "Register Now"}
                </Button>
                <Button
                  asChild
                  href="/contact"
                  variant="outline"
                  className="rounded-none"
                >
                  Contact Secretariat
                </Button>
                <a
                  href={`mailto:${siteSettings.email.programs}`}
                  className="inline-flex items-center justify-center rounded-none border border-border/90 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:border-accent-300"
                >
                  {siteSettings.email.programs}
                </a>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-none border border-border/80 bg-stone-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-700" />
                <p className="text-sm text-black">{finalAddress}</p>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-none border border-border/80 bg-stone-50 p-4">
                <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-accent-700" />
                <p className="text-sm text-black">{finalParticipantsNote}</p>
              </div>
            </div>
          </HomeScrollReveal>
        </div>
      </section>
    </>
  );
}
