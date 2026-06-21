import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { placeholderImages } from "@/data/images";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { cmsStaticOrEmpty, getMergedPageContent } from "@/lib/page-content";
import { cardImageUrlOrNull } from "@/lib/image-delivery";
import { resolveImageUrl } from "@/lib/media";
import { getSiteSettings } from "@/lib/site-settings";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextListItems } from "@/components/RichTextListItems";
import { resolveRichHtml } from "@/lib/rich-text";

export const metadata = {
  title: "African Women Political Leadership Summit (AWPLS)",
  description:
    "African Women Political Leadership Summit — strengthening women’s leadership in political life across the continent.",
};

export const revalidate = 60;

const awplsFallback = {
  title: "African Women Political Leadership Summit",
  subtitle: "AWPLS",
  description:
    "The African Women Political Leadership Summit (AWPLS) brings together women in and around political life to share evidence, build skills, and strengthen how parties and institutions govern. Programme details, dates, and registration will be announced here.",
  heroImage: "/uploads/placeholder.svg",
};

export default async function AwplsPage() {
  const [siteSettings, content] = await Promise.all([
    getSiteSettings(),
    getMergedPageContent<typeof awplsFallback>(
      "awpls",
      cmsStaticOrEmpty(awplsFallback),
    ),
  ]);
  const contentMap = content as Record<string, unknown>;
  const getImageRef = (key: string) =>
    typeof contentMap[key] === "string" ? String(contentMap[key]) : undefined;
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
  const getObjectArray = (
    key: string,
    fallback: Array<{ title: string; body: string }>,
  ) => {
    const value = contentMap[key];
    if (!Array.isArray(value)) return fallback;
    const list = value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item),
      )
      .map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
      }))
      .filter(
        (item) => item.title.trim().length > 0 && item.body.trim().length > 0,
      );
    return list.length > 0 ? list : fallback;
  };

  const heroSrc =
    cardImageUrlOrNull((await resolveImageUrl(content.heroImage)) ?? null) ??
    placeholderImages.about;
  const sectionDescription =
    content.description?.trim() || awplsFallback.description;
  const [
    introImage,
    sectionImageA,
    sectionImageB,
    sectionImageC,
    targetsBgImageResolved,
    deliverBgImageResolved,
  ] = await Promise.all([
    resolveImageUrl(getImageRef("introImage")),
    resolveImageUrl(getImageRef("sectionImageA")),
    resolveImageUrl(getImageRef("sectionImageB")),
    resolveImageUrl(getImageRef("sectionImageC")),
    resolveImageUrl(getImageRef("targetsBgImage")),
    resolveImageUrl(getImageRef("deliverBgImage")),
  ]);
  const introVisual = introImage || placeholderImages.about;
  const galleryVisuals = [
    sectionImageA || placeholderImages.events,
    sectionImageB || placeholderImages.events,
    sectionImageC || placeholderImages.events,
  ];
  const targetsBgImage =
    targetsBgImageResolved ||
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=2200&q=80";
  const deliverBgImage =
    deliverBgImageResolved ||
    "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=2200&q=80";
  const aboutEyebrow = getString("aboutEyebrow", "AWPLS");
  const aboutHeading = getString(
    "aboutHeading",
    "A strategic platform for women’s political leadership in Africa",
  );
  const aboutParagraphs = getStringArray("aboutParagraphs", [
    sectionDescription,
    "AWPLS is a strategic platform for action that links senior-level deliberation to concrete policy output, research, institutional reform, and economic empowerment. It serves women who lead and seek to lead, institutions that shape leadership conditions, and partners who invest in making that leadership possible.",
  ]);
  const registerCardHeading = getString(
    "registerCardHeading",
    "Secure your spot at AWPLS 2026",
  );
  const registerCardBody = getString(
    "registerCardBody",
    "Register now to join high-level dialogues, ministerial roundtables, and continental leadership partnerships.",
  );
  const registerCardCtaLabel = getString(
    "registerCardCtaLabel",
    "Register Now",
  );
  const whatIsHeading = getString("whatIsHeading", "What AWPLS Is");
  const whatIsCards = getObjectArray("whatIsCards", [
    {
      title: "1. A high-level convening space",
      body: "AWPLS brings together heads of state, parliamentarians, cabinet ministers, party executives, and senior technocrats to deliberate on governance challenges and chart collective responses.",
    },
    {
      title: "2. A platform for redefining leadership",
      body: "AWPLS reframes women's authority in politics as central to democratic legitimacy and economic transformation.",
    },
    {
      title: "3. A research and policy production body",
      body: "The Summit generates gender-disaggregated research and policy briefs to inform the African Union, national governments, RECs, and development partners.",
    },
    {
      title: "4. A leadership development ecosystem",
      body: "Through fellowships, leadership academies, mentorship networks, and peer learning programmes, AWPLS aims to train and mentor more than 2,000 women leaders by 2030.",
    },
    {
      title: "5. An economic empowerment mechanism",
      body: "AWPLS aligns policy, capital, and institutional authority with women-led growth by convening ministers of trade, finance institutions, and public finance bodies.",
    },
  ]);
  const targetsHeading = getString("targetsHeading", "Targets");
  const targetsPoints = getStringArray("targetsPoints", [
    "2,000+ women leaders trained by 2030",
    "54 African Union member states engaged",
    "3 core pillars: policy, leadership, economy",
  ]);
  const summit2026Heading = getString(
    "summit2026Heading",
    "About the 2026 Africa Women Political Leadership Summit",
  );
  const summit2026Paragraphs = getStringArray("summit2026Paragraphs", [
    "Under the theme “Women in Power: Political Leadership for Africa's Economic Transformation”, AWPLS 2026 is designed as a high-impact, action-oriented convening that moves beyond dialogue to deliver concrete policy commitments, institutional frameworks, and transformative partnerships.",
    "The 2026 edition, scheduled for November 2026, builds on the inaugural Accra summit and positions Africa to lead the global conversation on women's political leadership and economic governance.",
  ]);
  const deliverHeading = getString(
    "deliverHeading",
    "What AWPLS 2026 Will Deliver",
  );
  const deliverPoints = getStringArray("deliverPoints", [
    "Establish a High-Level Advisory Council to strengthen women's leadership capacity in governance, economic policy, fiscal strategy, and industrial development.",
    "Forge an Intergenerational Leadership Compact bridging emerging and established women leaders across Africa.",
    "Adopt the Addis Ababa Declaration on Women's Political Leadership for Africa's Economic Transformation.",
    "Launch the African Women Leadership and Transformation Fund to sustain long-term initiatives beyond the Summit.",
    "Convene Ministerial Roundtables and Expert Policy Dialogues on inclusive governance, electoral reform, and accountability.",
    "Host the AWPLS Leadership Excellence Awards & Gala Night celebrating trailblazing women in governance.",
    "Produce the AWPLS 2026 Policy Brief as a continental reference document on women’s leadership in economic governance.",
  ]);
  const deliverClosingParagraph = getString(
    "deliverClosingParagraph",
    "Together, these initiatives ensure the Summit evolves into an institution that works with governments, continental bodies, political parties, research centres, the private sector, and development partners.",
  );
  const finalCtaHeading = getString(
    "finalCtaHeading",
    "Secure your spot at AWPLS 2026",
  );
  const finalCtaBody = getString(
    "finalCtaBody",
    "Join leaders, policymakers, and partners shaping Africa’s future.",
  );
  const finalCtaButtonLabel = getString("finalCtaButtonLabel", "Register Now");
  const aboutBodyHtml = resolveRichHtml({
    html: typeof contentMap.aboutBody === "string" ? contentMap.aboutBody : undefined,
    paragraphs: aboutParagraphs,
  });
  const summit2026Html = resolveRichHtml({
    html: typeof contentMap.summit2026Body === "string" ? contentMap.summit2026Body : undefined,
    paragraphs: summit2026Paragraphs,
  });

  return (
    <>
      <PageHero
        variant="immersive"
        title={content.title}
        subtitle={content.subtitle}
        image={heroSrc}
        imageAlt="African Women Political Leadership Summit"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: "AWPLS" },
        ]}
      />

      <HomeScrollReveal
        variant="fadeUp"
        start="top 88%"
        className="block w-full"
      >
        <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
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
                <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={introVisual}
                    alt="AWPLS visual"
                    fill
                    className="object-cover"
                    unoptimized={preferUnoptimizedImage(introVisual)}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <h3 className="font-serif text-xl font-semibold text-black">
                  {registerCardHeading}
                </h3>
                <RichTextContent html={registerCardBody} className="mt-2 text-sm text-black" />
                <Button
                  asChild
                  href="/contact"
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

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="mb-7 grid gap-4 md:grid-cols-3">
            {galleryVisuals.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="relative aspect-[16/10] overflow-hidden border border-border/80 bg-stone-100"
              >
                <Image
                  src={img}
                  alt={`AWPLS section visual ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={preferUnoptimizedImage(img)}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
          <h2 className="font-serif text-[1.9rem] font-semibold text-black sm:text-[2.3rem]">
            {whatIsHeading}
          </h2>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {whatIsCards.map((card, idx) => (
              <article
                key={`${card.title}-${idx}`}
                className={`rounded-none border border-border/80 p-6 ${idx === whatIsCards.length - 1 && whatIsCards.length % 2 === 1 ? "lg:col-span-2" : ""}`}
              >
                <h3 className="font-sans text-xl font-semibold text-black">
                  {card.title}
                </h3>
                <RichTextContent html={card.body} className="mt-3 text-sm font-medium leading-relaxed text-black" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div
            className="rounded-none border border-border/80 bg-cover bg-center bg-no-repeat px-6 py-10 text-white sm:px-10"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(28,18,12,0.2) 0%, rgba(10,9,10,0.66) 55%, rgba(4,5,6,0.9) 100%), radial-gradient(circle at 72% 28%, rgba(195,122,73,0.24), transparent 44%), url('${targetsBgImage}')`,
            }}
          >
            <h2 className="font-serif text-[1.9rem] font-semibold sm:text-[2.3rem]">
              {targetsHeading}
            </h2>
            <RichTextListItems
              items={targetsPoints}
              as="ul"
              listClassName="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-3"
              itemClassName="rounded-none border border-white/20 bg-white/5 p-5 text-sm leading-relaxed"
              className="text-sm leading-relaxed text-white/95"
            />
          </div>
        </div>
      </section>

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

      <section
        className="w-full border-t border-border/80 bg-cover bg-center bg-no-repeat py-10 sm:py-14 lg:py-16"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(24,16,12,0.24) 0%, rgba(10,9,10,0.68) 54%, rgba(5,5,6,0.9) 100%), radial-gradient(circle at 70% 24%, rgba(195,122,73,0.22), transparent 46%), url('${deliverBgImage}')`,
        }}
      >
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <h2 className="font-serif text-[1.9rem] font-semibold text-white sm:text-[2.3rem]">
            {deliverHeading}
          </h2>
          <RichTextListItems
            items={deliverPoints}
            as="ul"
            listClassName="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2"
            itemClassName="rounded-none border border-white/70 bg-white/88 p-5 text-sm font-medium leading-relaxed text-black shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] backdrop-blur-[1px]"
            className="text-sm font-medium leading-relaxed text-black"
          />
          <RichTextContent
            html={deliverClosingParagraph}
            className="mt-6 text-[1.02rem] font-medium leading-relaxed text-white/90"
          />
        </div>
      </section>

      <section className="w-full border-t border-border/80 bg-white py-12 sm:py-16">
        <div className="mx-auto w-full max-w-4xl px-6 sm:px-8 lg:px-11">
          <div className="rounded-none border border-border/80 bg-white p-8 sm:p-10">
            <h2 className="font-serif text-3xl font-semibold text-black">
              {finalCtaHeading}
            </h2>
            <RichTextContent html={finalCtaBody} className="mt-3 text-sm text-black" />
            <div className="mt-6">
              <Button
                asChild
                href="/contact"
                variant="primary"
                className="rounded-none bg-accent-700 hover:bg-accent-800"
              >
                {finalCtaButtonLabel}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
