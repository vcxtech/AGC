import Link from "next/link";
import { termsOfService } from "@/data/legal";
import { placeholderImages } from "@/data/images";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { getMergedPageContent } from "@/lib/page-content";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { RichTextContent } from "@/components/RichTextContent";
import { richTextToPlain } from "@/lib/rich-text";

/** CMS fields overlay static legal copy; ISR keeps hero media fresh without forcing every request dynamic. */
export const revalidate = 60;

export const metadata = {
  title: "Terms of Service",
  description: "Rules and guidelines for using the Africa Governance Centre website and services.",
};

type TermsMerged = typeof termsOfService & { heroImage?: string; sectionImage?: string };

export default async function TermsOfServicePage() {
  const [merged, siteSettings] = await Promise.all([
    getMergedPageContent<TermsMerged>("terms-of-service", termsOfService as TermsMerged),
    getSiteSettings(),
  ]);
  const content = merged;

  const heroRaw = content.heroImage?.trim() || content.sectionImage?.trim() || undefined;
  const resolved = await resolveImageUrl(heroRaw);
  const heroSrc = cardImageUrlOrNull(resolved) ?? undefined;
  const heroSubtitle = [content.subtitle?.trim(), `Last updated · ${content.lastUpdated}`]
    .filter(Boolean)
    .join(" · ");
  const introVisual = heroSrc ?? placeholderImages.about;
  const contentMap = content as Record<string, unknown>;
  const getImageRef = (key: string) =>
    typeof contentMap[key] === "string" ? String(contentMap[key]).trim() : "";
  const [sectionVisualAResolved, sectionVisualBResolved, sectionVisualCResolved] = await Promise.all([
    resolveImageUrl(getImageRef("sectionVisualA") || getImageRef("sectionImageA") || content.sectionImage?.trim() || undefined),
    resolveImageUrl(getImageRef("sectionVisualB") || getImageRef("sectionImageB") || undefined),
    resolveImageUrl(getImageRef("sectionVisualC") || getImageRef("sectionImageC") || undefined),
  ]);
  const sectionVisualA = cardImageUrlOrNull(sectionVisualAResolved) ?? placeholderImages.events;
  const sectionVisualB = cardImageUrlOrNull(sectionVisualBResolved) ?? placeholderImages.news;
  const sectionVisualC = cardImageUrlOrNull(sectionVisualCResolved) ?? placeholderImages.about;
  const introSection = content.sections.find((section) => section.title.trim().toLowerCase() === "introduction");
  const introSectionText = "content" in (introSection ?? {}) ? introSection?.content?.trim() : "";

  return (
    <>
      <PageHero
        variant={heroSrc ? "compact" : "minimal"}
        title={content.title}
        subtitle={heroSubtitle}
        image={heroSrc}
        imageAlt=""
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.termsOfService },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 90%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="border-l-[3px] border-accent-600 py-2 pl-5 text-sm page-prose leading-relaxed">
            <p>
              By using this site you agree to these terms. They govern access to our content, events registration, and
              acceptable use of our services.
            </p>
            {introSectionText ? (
              <RichTextContent html={introSectionText} className="mt-3 text-sm" />
            ) : null}
          </div>
            <div
              className="relative min-h-[220px] overflow-hidden border border-border/80 bg-black"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.28), rgba(15,23,42,0.62)), url('${introVisual}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex items-end p-5">
                <div className="bg-white/90 p-3 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-800">Terms</p>
                  <p className="mt-1 text-sm text-black">Clear rules for using our website, events, and services.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Fair use",
                body: "Clear expectations for using our website content, resources, and services responsibly.",
                image: sectionVisualA,
              },
              {
                title: "User responsibilities",
                body: "Guidelines to help maintain safe, respectful, and lawful participation on the site.",
                image: sectionVisualB,
              },
              {
                title: "Legal clarity",
                body: "Transparent terms that define rights, limitations, and important legal boundaries.",
                image: sectionVisualC,
              },
            ].map((item) => (
              <article key={item.title} className="relative min-h-[210px] overflow-hidden border border-border/80 bg-slate-900">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.35), rgba(2,6,23,0.78)), url('${item.image}')`,
                  }}
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">Terms of service</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white/95">{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {content.sections
              .filter((section) => section.title.trim().toLowerCase() !== "introduction")
              .map((section, index) => {
              const subs =
                "subsections" in section && Array.isArray(section.subsections) ? section.subsections : [];
              const lead = "content" in section ? section.content?.trim() ?? "" : "";
              const leadPlain = richTextToPlain(lead);
              const itemList = "items" in section && Array.isArray(section.items) ? section.items : [];
              const useSubGrid = subs.length >= 2;
              const useItemGrid = itemList.length >= 5;
              const isCompact = subs.length === 0 && itemList.length === 0 && leadPlain.length < 260;
              const spanFull = subs.length > 0;

              return (
                <article
                  key={section.title}
                  className={
                    spanFull
                      ? "page-card relative overflow-hidden border-border/90 p-6 sm:p-8 lg:col-span-2"
                      : isCompact
                        ? "page-card relative overflow-hidden border-border/90 p-6 sm:p-7"
                        : "page-card relative overflow-hidden border-border/90 p-6 sm:p-8"
                  }
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                    style={{
                      background:
                        index % 3 === 0
                          ? "linear-gradient(to right, rgb(14 116 144), rgb(59 130 246))"
                          : index % 3 === 1
                            ? "linear-gradient(to right, rgb(22 163 74), rgb(14 116 144))"
                            : "linear-gradient(to right, rgb(180 83 9), rgb(217 119 6))",
                    }}
                  />
                  <h2 className="page-heading text-xl text-black sm:text-2xl">{section.title}</h2>
                  {lead ? <RichTextContent html={lead} className="mt-4 text-[0.98rem]" /> : null}

                  {subs.length > 0 ? (
                    <div
                      className={
                        lead
                          ? useSubGrid
                            ? "mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10"
                            : "mt-8 space-y-8"
                          : useSubGrid
                            ? "mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10"
                            : "mt-6 space-y-8"
                      }
                    >
                      {subs.map((sub: { title: string; content: string; items?: string[] }) => (
                        <div
                          key={sub.title}
                          className="min-w-0 border border-border/70 bg-stone-50/40 px-5 py-6 sm:px-6"
                        >
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-800">{sub.title}</h3>
                          <RichTextContent html={sub.content} className="mt-3 text-[0.95rem]" />
                          {sub.items && (
                            <ul className="mt-4 list-none space-y-2 border-l-2 border-border pl-4 text-[0.95rem] text-black">
                              {sub.items.map((item: string) => (
                                <li
                                  key={item}
                                  className="relative before:absolute before:-left-3 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-accent-600"
                                >
                        <RichTextContent
                          html={item}
                          className="text-[0.95rem] text-black"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {itemList.length > 0 ? (
                    <ul
                      className={
                        useItemGrid
                          ? "mt-4 grid list-none grid-cols-1 gap-x-8 gap-y-2 border-l-2 border-border pl-4 text-[0.95rem] text-black sm:grid-cols-2"
                          : "mt-4 list-none space-y-2 border-l-2 border-border pl-4 text-[0.95rem] text-black"
                      }
                    >
                      {itemList.map((item: string) => (
                        <li
                          key={item}
                          className="relative before:absolute before:-left-3 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-accent-600"
                        >
                          <RichTextContent
                          html={item}
                          className="text-[0.95rem] text-black"
                        />
                        </li>
                      ))}
                    </ul>
                  ) : null}
              </article>
              );
            })}
          </div>
        </div>
      </section>
      </HomeScrollReveal>

      <HomeScrollReveal variant="fadeIn" start="top 92%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 text-black sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-800">Legal</p>
          <h2 className="page-heading mt-3 text-2xl text-black">Contact</h2>
          <p className="mt-4 text-sm leading-relaxed text-black">Questions about these terms:</p>
          <ul className="mt-6 space-y-2 text-sm text-black">
            <li>
              <a
                href={`mailto:${siteSettings.email.info}`}
                className="font-medium text-accent-700 underline decoration-accent-300/70 underline-offset-4 hover:text-accent-900 hover:decoration-accent-600"
              >
                {siteSettings.email.info}
              </a>
            </li>
            <li>{siteSettings.address}</li>
            <li>{siteSettings.phone}</li>
          </ul>
          <p className="mt-10 text-xs text-black">
            <Link href="/privacy-policy" className="text-accent-700 hover:text-accent-900">
              Privacy policy
            </Link>
            {" · "}
            <Link href="/" className="text-accent-700 hover:text-accent-900">
              Home
            </Link>
          </p>
        </div>
      </section>
      </HomeScrollReveal>
    </>
  );
}
