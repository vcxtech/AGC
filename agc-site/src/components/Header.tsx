"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { resolveHeaderPrimaryNav } from "@/data/site-chrome";
import { LanguageSelector } from "./LanguageSelector";
import { HeaderTopbar } from "./HeaderTopbar";
import { SearchModal } from "./SearchModal";
import { useMobileNav } from "./mobile/MobileNavContext";
import { preferUnoptimizedImage } from "@/lib/image-delivery";

function isActiveRoute(pathname: string, href: string): boolean {
  if (!href || href.startsWith("#")) return false;
  const cleanHref = href.split("#")[0].replace(/\/+$/, "") || "/";
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (cleanHref === "/") return cleanPath === "/";
  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
}

export function Header({
  siteSettings,
  brandLogoSrc,
}: {
  siteSettings: SiteSettings;
  brandLogoSrc: string;
}) {
  const mainNav = resolveHeaderPrimaryNav(siteSettings.chrome.nav);
  const {
    mobileOpen,
    setMobileOpen,
    searchOpen,
    setSearchOpen,
    menuTriggerRef,
  } = useMobileNav();
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const showTopbar = true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full overflow-visible bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_-8px_rgba(28,25,23,0.08)]" : ""
      }`}
    >
      {showTopbar && <HeaderTopbar siteSettings={siteSettings} />}

      <div className="wpo-site-header overflow-visible bg-white">
        <nav className="w-full overflow-visible px-4 py-0 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex min-h-[4rem] flex-wrap items-center justify-between gap-x-3 gap-y-3 overflow-visible py-2 lg:min-h-[3.75rem] lg:flex-nowrap lg:gap-x-4 lg:py-1.5">
            <Link
              href="/"
              className="flex shrink-0 items-center py-1 pr-1 lg:pr-2"
            >
              <Image
                src={brandLogoSrc}
                alt={siteSettings.name}
                width={480}
                height={148}
                className="h-12 w-auto max-h-[4rem] max-w-[min(360px,58vw)] object-contain object-left sm:h-14 sm:max-h-[4.25rem] md:h-16 md:max-h-[4.75rem] lg:h-[4.5rem] lg:max-h-[5rem] lg:max-w-[min(450px,44vw)]"
                priority
                unoptimized={preferUnoptimizedImage(brandLogoSrc)}
              />
            </Link>

            {/* One row: primary links sit just left of language / tools (not stretched across the bar). */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-x-2 overflow-visible sm:gap-x-3 lg:min-w-0 lg:gap-x-3">
              <nav
                className="hidden min-w-0 overflow-visible lg:block"
                aria-label="Primary"
              >
                {/* No overflow-x-auto here — it clips absolutely-positioned dropdowns in most browsers. */}
                <ul className="inline-flex max-w-[min(100%,52rem)] flex-nowrap items-center justify-end gap-x-0.5 overflow-visible xl:max-w-[min(100%,60rem)] xl:gap-x-1">
                  {mainNav.map((item) => {
                    const linkClass =
                      "relative flex items-center gap-0.5 whitespace-nowrap px-1.5 py-2.5 text-[0.8125rem] font-medium uppercase tracking-wide text-black transition-colors hover:text-black xl:px-2 xl:text-sm [&:focus-visible]:outline [&:focus-visible]:outline-2 [&:focus-visible]:outline-offset-2 [&:focus-visible]:outline-accent-500";
                    const itemActive =
                      isActiveRoute(pathname, item.href) ||
                      Boolean(
                        item.subLinks?.some((sub) =>
                          isActiveRoute(pathname, sub.href),
                        ),
                      );
                    const bar = itemActive ? (
                      <span className="absolute left-1/2 top-0 h-0.5 w-2/3 -translate-x-1/2 rounded-sm bg-accent-500 opacity-100 transition-all duration-300" />
                    ) : (
                      <span className="absolute left-1/2 top-0 h-0.5 w-0 -translate-x-1/2 rounded-sm bg-accent-500 opacity-0 transition-all duration-300 group-hover:w-2/3 group-hover:opacity-100" />
                    );
                    if (item.subLinks?.length) {
                      return (
                        <li
                          key={`${item.href}-${item.label}`}
                          className="group relative shrink-0 hover:z-[80] focus-within:z-[80]"
                        >
                          <Link
                            href={item.href}
                            className={`${linkClass} ${itemActive ? "text-black" : ""}`}
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            {bar}
                            {item.label}
                            <ChevronDown
                              className="h-3 w-3 shrink-0 opacity-55"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                          </Link>
                          {/* Hover bridge so moving to the panel does not close the menu */}
                          <span
                            className="pointer-events-none absolute left-0 top-full z-[99] h-2 w-full"
                            aria-hidden
                          />
                          <ul
                            role="menu"
                            aria-label={`${item.label} submenu`}
                            className="pointer-events-none invisible absolute left-0 top-[calc(100%+0.25rem)] z-[200] min-w-[18rem] border border-border/95 bg-white py-2 opacity-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] transition-[opacity,visibility] duration-150 ease-out group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                          >
                            {item.subLinks.map((sub) => (
                              <li key={sub.href} role="none">
                                <Link
                                  role="menuitem"
                                  href={sub.href}
                                  className={`block px-4 py-3 text-sm font-medium normal-case tracking-normal transition-colors hover:bg-stone-50 ${
                                    isActiveRoute(pathname, sub.href)
                                      ? "bg-stone-50 text-accent-700"
                                      : "text-black"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    }
                    return (
                      <li
                        key={`${item.href}-${item.label}`}
                        className="group shrink-0"
                      >
                        <Link
                          href={item.href}
                          className={`${linkClass} ${itemActive ? "text-black" : ""}`}
                        >
                          {bar}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <SearchModal
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  copy={siteSettings.chrome.search}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border-0 bg-transparent p-2 text-[rgb(65,130,163)] transition-colors hover:bg-stone-100/90 hover:text-[rgb(45,105,135)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(65,130,163)] lg:hidden"
                  aria-label={siteSettings.chrome.headerSearchAriaLabel}
                >
                  <Search className="h-5 w-5 shrink-0" aria-hidden />
                </button>
                <div className="hidden sm:block">
                  <LanguageSelector languages={siteSettings.languages} />
                </div>
                <button
                  ref={menuTriggerRef}
                  type="button"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  aria-controls="site-mobile-drawer"
                >
                  {mobileOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
