import { getInvolvedContent } from "@/data/content";
import { placeholderImages } from "@/data/images";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { Button } from "@/components/Button";
import { getMergedPageContent } from "@/lib/page-content";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { JoinUsInquiryForm } from "@/components/JoinUsInquiryForm";
import { RichTextContent } from "@/components/RichTextContent";

export const metadata = {
  title: "Work with us",
  description: "Join the Africa Governance Centre team and advance governance excellence across Africa.",
};

export default async function JoinUsPage() {
  const joinUsFallback = {
    ...getInvolvedContent.joinUs,
    sectionEyebrow: "Careers",
    sectionHeading: "Work with us",
    opportunitiesHeading: "Opportunities",
    panelEyebrow: "Work with us",
    panelText: "Join research, policy, programme, and capacity-building teams.",
    inquiryEyebrow: "Enquiry",
    inquiryHeading: "Tell us you're interested",
    inquiryBody: "Use the form for a structured inquiry or use the contact options on the right.",
    quickContactEyebrow: "Quick contact",
    quickContactBody:
      "We're always interested in people passionate about governance, policy, and Africa's economic transformation.",
    backLabel: "Back to Get Involved",
  };
  const [merged, siteSettings] = await Promise.all([
    getMergedPageContent<typeof joinUsFallback>("get-involved-join-us", joinUsFallback),
    getSiteSettings(),
  ]);
  const c = merged;
  const cMap = c as unknown as Record<string, unknown>;
  const getString = (key: string, fallback: string) =>
    typeof cMap[key] === "string" && String(cMap[key]).trim().length > 0 ? String(cMap[key]) : fallback;
  const heroImage = (await resolveImageUrl((c as Record<string, unknown>).heroImage as string | undefined)) || placeholderImages.applications;
  const sidePanelImage =
    (await resolveImageUrl((cMap.panelImage as string | undefined) ?? (cMap.sidePanelImage as string | undefined))) ||
    heroImage;
  return (
    <>
      <PageHero
        variant="immersive"
        title={c.title}
        subtitle={c.subtitle}
        image={heroImage}
        imageAlt="Work with us"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.getInvolved, href: "/get-involved" },
          { label: siteSettings.chrome.breadcrumbs.joinUs },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 88%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">{getString("sectionEyebrow", "Careers")}</p>
                <h2 className="mt-3 font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                  {getString("sectionHeading", "Work with us")}
                </h2>
                <RichTextContent html={c.intro} className="mt-4 text-[1.08rem] leading-relaxed" />
                <RichTextContent html={c.description} className="mt-6" />

                <div className="mt-12">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-800">
                    {getString("opportunitiesHeading", "Opportunities")}
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {c.items.map((item, i) => (
                      <li key={item} className="flex gap-4 border border-border/70 bg-white p-4">
                        <span className="font-sans text-2xl font-semibold tabular-nums text-accent-800">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <RichTextContent html={item} className="page-prose flex-1 pt-1" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="self-start">
                <div
                  className="relative min-h-85 overflow-hidden border border-border/80 bg-black"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.28), rgba(15,23,42,0.62)), url('${sidePanelImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="bg-white/90 p-4 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-800">
                        {getString("panelEyebrow", "Work with us")}
                      </p>
                      <RichTextContent
                        html={getString("panelText", "Join research, policy, programme, and capacity-building teams.")}
                        className="mt-2 text-sm text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </HomeScrollReveal>

      <HomeScrollReveal variant="slideLeft" start="top 88%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div className="max-w-3xl">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">
                  {getString("inquiryEyebrow", "Enquiry")}
                </p>
                <h2 className="page-heading mt-3 text-2xl text-black">
                  {getString("inquiryHeading", "Tell us you're interested")}
                </h2>
                <RichTextContent
                  html={getString("inquiryBody", "Use the form for a structured inquiry or use the contact options on the right.")}
                  className="mt-2 text-black"
                />
                <div className="mt-8">
                  <JoinUsInquiryForm programsEmail={siteSettings.email.programs} />
                </div>
              </div>
              <aside className="border border-border/80 bg-white p-5 lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-800">
                  {getString("quickContactEyebrow", "Quick contact")}
                </p>
                <RichTextContent
                  html={getString(
                    "quickContactBody",
                    "We're always interested in people passionate about governance, policy, and Africa's economic transformation."
                  )}
                  className="mt-3 text-sm leading-relaxed text-black"
                />
                <div className="mt-5 flex flex-col gap-3">
                  <Button asChild href={c.contactHref} variant="primary" className="rounded-none! justify-center">
                    {c.cta}
                  </Button>
                  <Button
                    asChild
                    href="/get-involved"
                    variant="outline"
                    className="rounded-none! border-border text-black hover:bg-white"
                  >
                    {getString("backLabel", "Back to Get Involved")}
                  </Button>
                </div>
                <p className="mt-6 text-sm text-black">
                  <a
                    href={`mailto:${siteSettings.email.programs}`}
                    className="font-medium text-accent-800 underline decoration-accent-300/60 underline-offset-4 hover:text-accent-950"
                  >
                    {siteSettings.email.programs}
                  </a>
                  {" · "}
                  <a
                    href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                    className="font-medium text-accent-800 underline decoration-accent-300/60 underline-offset-4 hover:text-accent-950"
                  >
                    {siteSettings.phone}
                  </a>
                </p>
              </aside>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
