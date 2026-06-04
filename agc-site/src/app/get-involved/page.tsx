import Link from "next/link";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { getInvolvedContent } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";

const icons = [User, Mail, Briefcase] as const;

export const metadata = {
  title: "Get Involved",
  description:
    "Volunteer, partner, or work with Africa Governance Centre to advance governance excellence.",
};

export default async function GetInvolvedPage() {
  const [merged, siteSettings] = await Promise.all([
    getMergedPageContent<typeof getInvolvedContent>(
      "get-involved",
      cmsStaticOrEmpty(getInvolvedContent),
    ),
    getSiteSettings(),
  ]);
  const content = merged as unknown as typeof getInvolvedContent & {
    heroImage?: string;
  };
  const heroImage =
    (await resolveImageUrl(content.heroImage)) || placeholderImages.getInvolved;
  const { bottomSection } = content;
  const opportunities = content.opportunities.filter(
    (opp) => opp.id !== "partnership",
  );

  const firstOpportunity = opportunities[0];
  if (!firstOpportunity) {
    return (
      <>
        <PageHero
          title={(content.title as string) ?? getInvolvedContent.title}
          subtitle={
            (content.description as string) ?? getInvolvedContent.description
          }
          image={heroImage}
          imageAlt="Get Involved"
          breadcrumbs={[
            { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
            { label: siteSettings.chrome.breadcrumbs.getInvolved },
          ]}
        />
      </>
    );
  }
  const firstHrefTrim =
    typeof firstOpportunity?.href === "string"
      ? firstOpportunity.href.trim()
      : "";
  const firstContactDefault = firstOpportunity?.id === "join-us";
  const volunteerCardHref =
    firstHrefTrim !== ""
      ? firstHrefTrim
      : firstContactDefault
        ? "/contact"
        : (firstOpportunity?.pageHref ?? "/applications");

  return (
    <>
      <PageHero
        title={(content.title as string) ?? getInvolvedContent.title}
        subtitle={
          (content.description as string) ?? getInvolvedContent.description
        }
        image={heroImage}
        imageAlt="Get Involved"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.getInvolved },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-b border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="max-w-none">
              <p className="text-sm font-medium text-accent-800">
                Ways to connect
              </p>
              <h2 className="page-heading mt-2 text-2xl sm:text-3xl lg:text-4xl">
                Join the work
              </h2>
              <p className="page-prose mt-4 text-lg">{content.intro}</p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
              <Link
                href={volunteerCardHref}
                className="group relative overflow-hidden rounded-none border border-border/90 bg-white p-8 shadow-sm transition-all duration-300 hover:border-accent-300/60 hover:shadow-lg sm:p-10 lg:col-span-2 lg:flex lg:flex-col lg:justify-between"
              >
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-accent-100/60 opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-700 text-white transition-transform duration-300 group-hover:scale-[1.02]">
                    <User className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-sans text-2xl font-semibold text-black sm:text-3xl">
                    {firstOpportunity.title}
                  </h3>
                  <p className="page-prose mt-3">
                    {firstOpportunity.description}
                  </p>
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {firstOpportunity.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-black"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-800 transition-all group-hover:gap-3">
                  {firstOpportunity.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>

              <div className="flex flex-col gap-6 lg:gap-8">
                {opportunities.slice(1).map((opp, i) => {
                  const Icon = icons[i + 1] ?? Briefcase;
                  const hrefTrim =
                    typeof opp.href === "string" ? opp.href.trim() : "";
                  const contactDefault = opp.id === "join-us";
                  const cardHref =
                    hrefTrim !== ""
                      ? hrefTrim
                      : contactDefault
                        ? "/contact"
                        : opp.pageHref;
                  return (
                    <Link
                      key={opp.id}
                      href={cardHref}
                      className="group page-card rounded-none flex flex-1 flex-col p-7 transition-all duration-300 hover:border-accent-200/50 hover:shadow-md sm:p-8"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-none bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-200/80">
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                      <h3 className="mt-4 font-sans text-xl font-semibold text-black">
                        {opp.title}
                      </h3>
                      <p className="page-prose-tight mt-2 text-sm">
                        {opp.description}
                      </p>
                      <ul className="mt-4 space-y-1.5">
                        {opp.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm text-black"
                          >
                            <span className="h-1 w-1 shrink-0 rounded-full bg-accent-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-800 transition-all group-hover:gap-3">
                        {opp.cta}
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom section: bento-style two columns */}
            <section className="mt-20 rounded-none border border-border/80 bg-white p-8 sm:p-10 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="page-heading text-xl sm:text-2xl">
                    {bottomSection.getInTouch.title}
                  </h2>
                  <p className="page-prose mt-3">
                    {bottomSection.getInTouch.text}
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white shadow-sm ring-1 ring-border/60">
                        <Mail className="h-5 w-5 text-accent-700" />
                      </div>
                      <a
                        href={`mailto:${siteSettings.email.programs}`}
                        className="text-black transition-colors hover:text-accent-700"
                      >
                        {siteSettings.email.programs}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white shadow-sm ring-1 ring-border/60">
                        <Phone className="h-5 w-5 text-accent-700" />
                      </div>
                      <a
                        href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                        className="text-black transition-colors hover:text-accent-700"
                      >
                        {siteSettings.phone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white shadow-sm ring-1 ring-border/60">
                        <MapPin className="h-5 w-5 text-accent-700" />
                      </div>
                      <span className="text-black">{siteSettings.address}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="page-heading text-xl sm:text-2xl">
                    {bottomSection.upcomingEvents.title}
                  </h2>
                  <p className="page-prose mt-3">
                    {bottomSection.upcomingEvents.description}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {bottomSection.upcomingEvents.events.map((evt) => (
                      <li key={evt.label}>
                        <Link
                          href={evt.registerHref}
                          className="group flex flex-wrap items-center justify-between gap-3 rounded-none border border-border/80 bg-white p-4 transition-all hover:border-accent-300/60 hover:shadow-sm"
                        >
                          <span className="text-black">{evt.label}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-none bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-accent-800">
                            Register
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
