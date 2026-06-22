import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User } from "lucide-react";
import { aboutContent } from "@/data/content";
import { getPublishedTeamMember, type CmsTeamMemberPublic } from "@/lib/content";
import { cardImageUrlOrNull, preferUnoptimizedImage } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { getBreadcrumbLabels } from "@/lib/breadcrumbs";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { richTextToPlain } from "@/lib/rich-text";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { normalizeTeamTabs } from "@/lib/team-tabs";
import { PAGE_LISTING_INNER_CLASS } from "@/lib/page-layout";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

function profileSummary(member: Pick<CmsTeamMemberPublic, "name" | "role" | "bio">, orgName: string): string {
  if (member.role?.trim()) {
    const r = member.role.trim();
    const titled = /^the\s/i.test(r) ? r : /^a\s|^an\s/i.test(r) ? r : `the ${r}`;
    return `${member.name} is ${titled} at ${orgName}.`;
  }
  const bio = member.bio?.trim();
  if (!bio) return `${member.name} contributes to programmes and partnerships at ${orgName}.`;
  const firstPara = richTextToPlain(bio).split(/\n\n+/)[0]?.trim() ?? richTextToPlain(bio);
  if (firstPara.length <= 280) return firstPara.endsWith(".") ? firstPara : `${firstPara}.`;
  return `${firstPara.slice(0, 277).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const num = Number.parseInt(id, 10);
  if (!Number.isFinite(num)) return { title: "Team" };
  const member = await getPublishedTeamMember(num);
  if (!member) return { title: "Team" };
  const desc =
    richTextToPlain(member.bio, 155) ||
    `${member.name} — ${member.role ?? "Africa Governance Centre"}`;
  return {
    title: member.name,
    description: desc,
  };
}

export default async function TeamMemberProfilePage({ params }: Props) {
  const { id } = await params;
  const num = Number.parseInt(id, 10);
  if (!Number.isFinite(num)) notFound();

  const [member, siteSettings, bc, aboutMerged] = await Promise.all([
    getPublishedTeamMember(num),
    getSiteSettings(),
    getBreadcrumbLabels(),
    getMergedPageContent<typeof aboutContent & { teamTabsList?: { key: string; label: string }[] }>(
      "about",
      cmsStaticOrEmpty(aboutContent as typeof aboutContent & { teamTabsList?: { key: string; label: string }[] })
    ),
  ]);
  if (!member) notFound();

  const imageResolved = cardImageUrlOrNull(await resolveImageUrl(member.image ?? undefined));
  const orgName = siteSettings.name;
  const configuredTabs = Array.isArray((aboutMerged as { teamTabsList?: { key: string; label: string }[] }).teamTabsList)
    ? (aboutMerged as { teamTabsList?: { key: string; label: string }[] }).teamTabsList!
    : [];
  const tabMap = new Map(
    normalizeTeamTabs(
      configuredTabs.length > 0
        ? configuredTabs
        : [
            { key: "advisory_board", label: aboutContent.teamTabs.advisoryBoard },
            { key: "executive_council", label: aboutContent.teamTabs.executiveCouncil },
            { key: "management_team", label: aboutContent.teamTabs.managementTeam },
            { key: "fellows", label: aboutContent.teamTabs.fellows },
          ]
    ).map((t) => [String(t.key).trim().toLowerCase(), String(t.label).trim()])
  );
  const programme = member.section ? tabMap.get(member.section) ?? null : null;
  const summary = profileSummary(member, orgName);

  const categoryLine = programme != null ? `Team · ${programme}` : "Our team";

  return (
    <>
      <PageHero
        variant="minimal"
        title={member.name}
        subtitle={categoryLine}
        breadcrumbs={[
          { label: bc.home, href: "/" },
          { label: bc.about, href: "/about" },
          { label: bc.team ?? "Our Team", href: "/about#team" },
          { label: member.name },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 88%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className={PAGE_LISTING_INNER_CLASS}>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 lg:items-start">
              <aside className="lg:col-span-4">
                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-slate-100 lg:mx-0 lg:max-w-none">
                  {imageResolved ? (
                    <Image
                      src={imageResolved}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 320px"
                      priority
                      unoptimized={preferUnoptimizedImage(imageResolved)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-24 w-24 text-slate-300" strokeWidth={1} aria-hidden />
                    </div>
                  )}
                </div>

                <dl className="mt-10 space-y-8 border-t border-border pt-10">
                  {member.role?.trim() ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
                        Work title
                      </dt>
                      <dd className="mt-2 font-sans text-base leading-snug text-black">{member.role.trim()}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
                      Organisation
                    </dt>
                    <dd className="mt-2 font-sans text-base leading-snug text-black">{orgName}</dd>
                  </div>
                  {programme ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
                        Programme
                      </dt>
                      <dd className="mt-2 font-sans text-base leading-snug text-accent-800">{programme}</dd>
                    </div>
                  ) : null}
                </dl>
              </aside>

              <article className="lg:col-span-8">
                <p className="text-sm font-medium text-accent-600">{categoryLine}</p>
                <p className="mt-5 font-sans text-lg leading-relaxed text-black md:text-xl">{summary}</p>
                <hr className="my-10 border-border" />
                {member.bio?.trim() ? (
                  <RichTextContent
                    html={member.bio}
                    className="font-sans text-base leading-[1.75] text-stone-700"
                  />
                ) : (
                  <p className="font-sans text-stone-600">A full biography will appear here when available.</p>
                )}

                <p className="mt-12">
                  <Link
                    href="/about#team"
                    className="text-sm font-medium text-accent-700 no-underline hover:underline hover:underline-offset-4"
                  >
                    ← Back to team
                  </Link>
                </p>
              </article>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
