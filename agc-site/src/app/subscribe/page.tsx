import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { placeholderImages } from "@/data/images";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { SubscribeForm } from "./SubscribeForm";
import {
  subscribePageContent,
  type SubscribePageContent,
} from "@/data/subscribe-page";

export const metadata = {
  title: "Subscribe",
  description:
    "Subscribe to the Africa Governance Centre newsletter and events mailing list.",
};

export const revalidate = 60;

export default async function SubscribePage() {
  const [siteSettings, content] = await Promise.all([
    getSiteSettings(),
    getMergedPageContent<SubscribePageContent>(
      "subscribe",
      cmsStaticOrEmpty(subscribePageContent),
    ),
  ]);
  const heroImage = (await resolveImageUrl(content.heroImage || "")) || placeholderImages.news;
  const topics =
    Array.isArray(content.topics) && content.topics.length > 0
      ? content.topics
      : subscribePageContent.topics;

  return (
    <>
      <PageHero
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        image={heroImage}
        imageAlt="Africa Governance Centre updates"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.getInvolved, href: "/get-involved" },
          { label: siteSettings.chrome.breadcrumbs.subscribe },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-800">
                  {content.sectionEyebrow}
                </p>
                <h2 className="mt-3 font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                  {content.sectionHeading}
                </h2>
                <RichTextContent html={content.intro} className="mt-4 max-w-none text-black" />
                <RichTextContent
                  html={content.requiredNote}
                  className="mt-4 max-w-none text-black"
                />

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {topics.map((item) => (
                    <article
                      key={item.title}
                      className="border border-border/70 bg-slate-50 p-4"
                    >
                      <h3 className="font-medium text-black">{item.title}</h3>
                      <RichTextContent
                        html={item.text}
                        className="mt-2 text-sm leading-relaxed text-slate-600"
                      />
                    </article>
                  ))}
                </div>
              </div>

              <div className="self-start">
                <SubscribeForm programsEmail={siteSettings.email.programs} />
              </div>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
