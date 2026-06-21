"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { preferUnoptimizedImage } from "@/lib/image-delivery";
import { NewsletterSignup } from "./NewsletterSignup";
import { SocialBrandIcon } from "@/components/SocialBrandIcon";
import { publicSocialSlots } from "@/data/public-social-row";
import { donateHref } from "@/data/content";

const iconBoxLightClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-accent-200/80 bg-white text-accent-600";

/**
 * Newsletter strip (accent) + light panel: brand | quick links | contact + legal | Donate, tel|email, socials (far right).
 */
export function Footer({ siteSettings, brandLogoSrc }: { siteSettings: SiteSettings; brandLogoSrc: string }) {
  const pathname = usePathname();
  const { footer: footerChrome, newsletter: newsletterCopy } = siteSettings.chrome;
  const socialRow = publicSocialSlots(siteSettings);
  const phoneClean = siteSettings.phone.replace(/\s/g, "");
  const contactLine = (
    <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-black">
      <span className="inline-flex shrink-0 items-center gap-x-2">
        <span className="font-medium">Tel:</span>
        <a
          href={`tel:${phoneClean}`}
          className="whitespace-nowrap underline decoration-slate-300 underline-offset-2 hover:text-accent-600"
        >
          {siteSettings.phone}
        </a>
      </span>
      <span className="text-border shrink-0" aria-hidden>
        |
      </span>
      <a
        href={`mailto:${siteSettings.email.programs}`}
        className="min-w-0 max-w-full break-all underline decoration-slate-300 underline-offset-2 hover:text-accent-600"
      >
        {siteSettings.email.programs}
      </a>
    </p>
  );

  return (
    <footer className="relative overflow-hidden md:pb-0">
      {/* —— Tier 1: Newsletter — */}
      <div
        id="newsletter"
        className="scroll-mt-24 bg-accent-600 px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:px-12 2xl:px-16"
      >
        <div className="mx-auto w-full max-w-none text-center">
          <h2 className="font-sans text-[1.35rem] font-semibold leading-tight tracking-tight text-white sm:text-2xl md:text-[1.75rem]">
            {newsletterCopy.heading}
          </h2>
          <div className="mx-auto mt-5 h-1.5 w-16 rounded-none bg-white" aria-hidden />
          {newsletterCopy.description?.trim() ? (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white sm:text-[15px]">
              {newsletterCopy.description}
            </p>
          ) : null}
          <div className="mx-auto mt-8 w-full max-w-2xl sm:max-w-3xl">
            <NewsletterSignup copy={newsletterCopy} variant="footerHero" />
          </div>
        </div>
      </div>

      {/* —— Tier 2: Light panel — brand | quick links | contact & legal | donate & socials — */}
      <div className="border-t border-white/15 bg-white text-black">
        <div className="mx-auto w-full max-w-none px-4 py-10 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-11 md:pb-11 lg:px-8 lg:py-12 xl:px-12 2xl:px-16">
          <div className="grid gap-9 lg:grid-cols-12 lg:gap-6 xl:gap-8">
            {/* Column 1 — brand: logo + tagline */}
            <div className="min-h-0 lg:col-span-3">
              <Link href="/" className="inline-block w-full max-w-[min(100%,18rem)] sm:max-w-[22rem] lg:max-w-[min(100%,24rem)]">
                <Image
                  src={brandLogoSrc}
                  alt={siteSettings.name}
                  width={400}
                  height={133}
                  className="h-auto w-full object-contain object-left"
                  unoptimized={preferUnoptimizedImage(brandLogoSrc)}
                />
              </Link>
              <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-black">{siteSettings.tagline}</p>
            </div>

            {/* Column 2 — quick links */}
            <div className="lg:col-span-3 lg:border-l lg:border-border/80 lg:pl-6 xl:pl-7">
              <h3 className="mb-5 font-sans text-base font-bold text-accent-600">{footerChrome.quickLinksHeading}</h3>
              <ul className="space-y-3">
                {footerChrome.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-black transition-colors hover:text-accent-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/get-involved" className="text-[15px] text-black transition-colors hover:text-accent-600">
                    {footerChrome.getInvolvedLabel}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — contact + legal */}
            <div className="lg:col-span-3 lg:border-l lg:border-border/80 lg:pl-6 xl:pl-7">
              <h3 className="mb-5 font-sans text-base font-bold text-black">{footerChrome.contactHeading}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[15px] text-black">
                  <span className={iconBoxLightClass}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="leading-relaxed">{siteSettings.address}</span>
                </li>
                <li>
                  <a
                    href={`tel:${phoneClean}`}
                    className="flex items-center gap-3 text-[15px] text-black transition-colors hover:text-accent-600"
                  >
                    <span className={iconBoxLightClass}>
                      <Phone className="h-4 w-4" />
                    </span>
                    {siteSettings.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteSettings.email.programs}`}
                    className="flex items-start gap-3 text-[15px] text-black transition-colors hover:text-accent-600"
                  >
                    <span className={iconBoxLightClass}>
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="break-all leading-relaxed">{siteSettings.email.programs}</span>
                  </a>
                </li>
              </ul>

              <h3 className="mb-5 mt-10 font-sans text-base font-bold text-accent-600">Legal</h3>
              <ul className="space-y-3">
                {footerChrome.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[15px] text-black transition-colors hover:text-accent-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Donate, tel|email, socials (far right) */}
            <div className="flex min-h-0 min-w-0 flex-col lg:col-span-3 lg:border-l lg:border-border/80 lg:pl-6 xl:pl-7">
              <Link
                href={donateHref}
                className="inline-flex min-h-[44px] w-fit max-w-full items-center justify-center rounded-none bg-accent-600 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
              >
                Donate
              </Link>
              {contactLine}
              <nav className="mt-6" aria-label="Social media">
                <ul className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {socialRow.map(({ href, brand, label }) => (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-accent-600 shadow-sm transition-colors hover:border-border hover:bg-slate-50"
                          aria-label={label}
                        >
                          <SocialBrandIcon brand={brand} />
                        </a>
                      ) : (
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-accent-600/35 shadow-sm"
                          aria-label={`${label} — add URL in Site settings`}
                          title="Add URL in Admin → Site settings → Social links"
                        >
                          <SocialBrandIcon brand={brand} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* —— Tier 3: Copyright bar — */}
        <div className="border-t border-accent-600/90 bg-accent-600 py-5">
          <div className="mx-auto flex w-full max-w-none flex-col items-center justify-between gap-3 px-4 text-center text-sm text-slate-600 sm:flex-row sm:px-6 sm:text-left lg:px-8 xl:px-12 2xl:px-16">
            <p className="text-white">
              © {new Date().getFullYear()}{" "}
              <Link href="/" className="font-medium text-white transition-colors hover:text-accent-100">
                {siteSettings.name}
              </Link>. {footerChrome.rightsReserved}
            </p>
            <Link
              href="/"
              className="text-white transition-colors hover:text-accent-100"
              onClick={(e) => {
                if (pathname !== "/") return;
                e.preventDefault();
                const instant =
                  typeof window !== "undefined" &&
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
              }}
            >
              {footerChrome.adminLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
