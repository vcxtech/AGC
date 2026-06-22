"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Image as ImageIcon,
  Calendar,
  LogOut,
  LayoutDashboard,
  Newspaper,
  Users,
  BookOpen,
  FolderKanban,
  Briefcase,
  Layers,
  Handshake,
  FileText,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  QrCode,
  Inbox,
  Tags,
  Settings,
  House,
  CreditCard,
  Heart,
  CircleUserRound,
} from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { getAdminBreadcrumbs } from "@/lib/admin-breadcrumbs";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/events/scan", label: "Check-in Scanner", icon: QrCode },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/publications", label: "Publications", icon: BookOpen },
  { href: "/admin/programs", label: "Programs", icon: FolderKanban },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/advisory", label: "Advisory", icon: Layers },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/donations", label: "Donations", icon: Heart },
  { href: "/admin/donation-settings", label: "Donation settings", icon: CreditCard },
  { href: "/admin/pages", label: "Page Content", icon: FileText },
  { href: "/admin/home-settings", label: "Home Settings", icon: House },
  { href: "/admin/about-settings", label: "About Settings", icon: CircleUserRound },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Tags },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/settings", label: "Operations", icon: Settings },
];

export function AdminShell({ children, siteSettings }: { children: React.ReactNode; siteSettings: SiteSettings }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
          {children}
        </div>
      </div>
    );
  }

  const crumbs = pathname ? getAdminBreadcrumbs(pathname) : [];

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f5]">
      <div className="flex min-h-0 flex-1">
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-white shadow-[4px_0_24px_-8px_rgba(15,23,42,0.08)] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-accent-500/25" aria-hidden />

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-slate-50/80 px-4">
          <Link href="/" className="flex items-center gap-2 rounded-lg pr-2 hover:opacity-90">
            <Image
              src="/agc-logo.png"
              alt={siteSettings.name}
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Admin navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Manage</p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              let active = false;
              if (pathname.startsWith("/admin/pages")) {
                active = item.href === "/admin/pages";
              } else if (item.href === "/admin") active = pathname === "/admin";
              else if (item.href === "/admin/events/scan")
                active = pathname.startsWith("/admin/events/scan");
              else if (item.href === "/admin/events")
                active =
                  pathname.startsWith("/admin/events") && !pathname.startsWith("/admin/events/scan");
              else if (item.href === "/admin/taxonomy") active = pathname.startsWith("/admin/taxonomy");
              else if (item.href === "/admin/home-settings") active = pathname.startsWith("/admin/home-settings");
              else if (item.href === "/admin/about-settings") active = pathname.startsWith("/admin/about-settings");
              else if (item.href === "/admin/site-settings") active = pathname.startsWith("/admin/site-settings");
              else if (item.href === "/admin/settings") active = pathname.startsWith("/admin/settings");
              else active = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-accent-50 text-accent-800 shadow-sm ring-1 ring-accent-200/80"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? "text-accent-600" : "text-slate-500"}`} aria-hidden />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <ChevronRight className="h-4 w-4 shrink-0 text-accent-600" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border bg-slate-50/50 p-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent-200 hover:bg-accent-50/50 hover:text-accent-800"
          >
            <ExternalLink className="h-4 w-4" />
            View public site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-border/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            {crumbs.length > 0 && (
              <nav className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-slate-500 sm:text-sm" aria-label="Breadcrumb">
                {crumbs.map((c, i) => (
                  <span key={`${c.label}-${i}`} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />}
                    {c.href ? (
                      <Link href={c.href} className="hover:text-accent-600">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-800">{c.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          <form action={async () => signOut({ callbackUrl: "/admin/login" })} className="shrink-0">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-border hover:bg-white"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      </div>
    </div>
  );
}
