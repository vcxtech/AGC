import { getInvolvedContent } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { Button } from "@/components/Button";
import { getMergedPageContent } from "@/lib/page-content";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Volunteer",
  description:
    "Contribute your time and skills to support Africa Governance Centre's research and advocacy efforts.",
};

export default async function VolunteerPage() {
  const volunteerFallback = {
    ...getInvolvedContent.volunteer,
    sectionEyebrow: "Volunteering",
    sectionHeading: "Volunteer with us",
    impactEyebrow: "Impact roles",
    impactText: "Research, events, communications, and administration support.",
    waysHeading: "Ways to contribute",
    readyEyebrow: "Ready?",
    readyHeading: "Apply",
    readyBody:
      "Complete the volunteer application — we welcome people who want to strengthen governance dialogue and research.",
    backLabel: "Back to Get Involved",
    questionsLabel: "Questions?",
  };
  const [merged, siteSettings] = await Promise.all([
    getMergedPageContent<typeof volunteerFallback>(
      "get-involved-volunteer",
      volunteerFallback,
    ),
    getSiteSettings(),
  ]);
  const c = merged;
  const cMap = c as unknown as Record<string, unknown>;
  const getString = (key: string, fallback: string) =>
    typeof cMap[key] === "string" && String(cMap[key]).trim().length > 0
      ? String(cMap[key])
      : fallback;
  const heroImage =
    (await resolveImageUrl(
      (c as Record<string, unknown>).heroImage as string | undefined,
    )) || placeholderImages.getInvolved;
  const impactPanelImage =
    (await resolveImageUrl(
      (cMap.impactPanelImage as string | undefined) ??
        (cMap.panelImage as string | undefined),
    )) || heroImage;
  const sectionEyebrow = getString(
    "sectionEyebrow",
    volunteerFallback.sectionEyebrow || "Volunteering",
  );
  const sectionHeading = getString(
    "sectionHeading",
    volunteerFallback.sectionHeading || "Volunteer with us",
  );
  const impactEyebrow = getString(
    "impactEyebrow",
    volunteerFallback.impactEyebrow || "Impact roles",
  );
  const impactText = getString(
    "impactText",
    volunteerFallback.impactText ||
      "Research, events, communications, and administration support.",
  );
  const waysHeading = getString(
    "waysHeading",
    volunteerFallback.waysHeading || "Ways to contribute",
  );
  const readyEyebrow = getString(
    "readyEyebrow",
    volunteerFallback.readyEyebrow || "Ready?",
  );
  const readyHeading = getString(
    "readyHeading",
    volunteerFallback.readyHeading || "Apply",
  );
  const readyBody = getString(
    "readyBody",
    volunteerFallback.readyBody ||
      "Complete the volunteer application — we welcome people who want to strengthen governance dialogue and research.",
  );
  const backLabel = getString(
    "backLabel",
    volunteerFallback.backLabel || "Back to Get Involved",
  );
  const questionsLabel = getString(
    "questionsLabel",
    volunteerFallback.questionsLabel || "Questions?",
  );
  const heroTitle = getString("title", c.title || volunteerFallback.title);
  const heroSubtitle = getString(
    "subtitle",
    c.subtitle || volunteerFallback.subtitle,
  );
  const ctaLabel = getString("cta", volunteerFallback.cta || "Apply");
  const applicationHref = getString(
    "applicationHref",
    volunteerFallback.applicationHref || "#",
  );

  const intro = getString("intro", volunteerFallback.intro);
  const description = getString("description", volunteerFallback.description);

  return (
    <>
      <PageHero
        variant="immersive"
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
        imageAlt="Volunteer"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          {
            label: siteSettings.chrome.breadcrumbs.getInvolved,
            href: "/get-involved",
          },
          { label: siteSettings.chrome.breadcrumbs.volunteer },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">
                  {sectionEyebrow}
                </p>
                <h2 className="mt-3 font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                  {sectionHeading}
                </h2>
                <p className="mt-4 page-prose text-[1.08rem] leading-relaxed">
                  {intro}
                </p>
                <p className="mt-6 page-prose">{description}</p>
              </div>
              <div className="self-start">
                <div
                  className="relative min-h-[340px] overflow-hidden border border-border/80 bg-black"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.25), rgba(15,23,42,0.62)), url('${impactPanelImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="bg-white/90 p-4 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-800">
                        {impactEyebrow}
                      </p>
                      <p className="mt-2 text-sm text-black">{impactText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-800">
                {waysHeading}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {c.items.map((item, i) => (
                  <li
                    key={item}
                    className="flex gap-4 border border-border/70 bg-white p-4"
                  >
                    <span className="font-sans text-2xl font-semibold tabular-nums text-accent-800">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="page-prose flex-1 pt-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </HomeScrollReveal>

      <HomeScrollReveal
        variant="slideRight"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-y border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="page-card border-l-[4px] border-l-accent-600 p-8 sm:p-10">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-black">
                {readyEyebrow}
              </p>
              <h2 className="page-heading mt-2 text-xl text-black">
                {readyHeading}
              </h2>
              <p className="mt-3 page-prose">{readyBody}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  href={applicationHref}
                  variant="primary"
                  className="!rounded-none"
                >
                  {ctaLabel}
                </Button>
                <Button
                  asChild
                  href="/get-involved"
                  variant="outline"
                  className="!rounded-none"
                >
                  {backLabel}
                </Button>
              </div>
              <p className="mt-8 text-sm text-black">
                {questionsLabel}{" "}
                <a
                  href={`mailto:${siteSettings.email.programs}`}
                  className="font-medium text-accent-800 hover:underline"
                >
                  {siteSettings.email.programs}
                </a>
              </p>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
