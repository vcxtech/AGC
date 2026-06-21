import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { getSiteSettings } from "@/lib/site-settings";
import { resolveImageUrl } from "@/lib/media";

/** Header/footer/nav come from DB — avoid stale full-route or CDN HTML on refresh after deploy. */
export const dynamic = "force-dynamic";

/** Body / UI — geometric sans, strong at small sizes */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/** Editorial serif for hero / headings (TBI-style contrast with Manrope UI). */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const description = siteSettings.tagline;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteSettings.name} | Governance Excellence Across Africa`,
      template: `%s | ${siteSettings.name}`,
    },
    description,
    keywords: [
      "Africa",
      "governance",
      "think tank",
      "policy",
      "economic transformation",
      "capacity building",
    ],
    openGraph: {
      type: "website",
      siteName: siteSettings.name,
      description,
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const brandLogoSrc =
    (await resolveImageUrl(siteSettings.logo || undefined)) || "/logo.png";
  const footerLogoResolved =
    siteSettings.footerLogo?.trim() !== ""
      ? await resolveImageUrl(siteSettings.footerLogo)
      : null;
  const footerLogoSrc = footerLogoResolved || brandLogoSrc;
  return (
    <html lang="en" className={`${manrope.variable} ${sourceSerif.variable}`}>
      <body
        className={`min-h-screen flex flex-col antialiased ${manrope.className}`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          {siteSettings.chrome.skipToContentLabel}
        </a>
        <JsonLd siteSettings={siteSettings} />
        <Analytics />
        <SiteChrome
          siteSettings={siteSettings}
          brandLogoSrc={brandLogoSrc}
          footerLogoSrc={footerLogoSrc}
        >
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </SiteChrome>
      </body>
    </html>
  );
}
