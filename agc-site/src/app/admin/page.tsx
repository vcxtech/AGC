import Link from "next/link";
import {
  Image as ImageIcon,
  Calendar,
  Newspaper,
  Users,
  BookOpen,
  FolderKanban,
  Briefcase,
  Handshake,
  FileText,
  QrCode,
  Settings,
  SlidersHorizontal,
  House,
  CircleUserRound,
  Inbox,
  Tags,
  Mail,
  UserPlus,
  MessageSquare,
  Heart,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const sections = [
  { href: "/admin/media", label: "Media", icon: ImageIcon, desc: "Upload and manage images" },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox, desc: "Forms, newsletter, exports, and retention" },
  { href: "/admin/donations", label: "Donations", icon: Heart, desc: "Online gifts via Paystack" },
  { href: "/admin/donation-settings", label: "Donation settings", icon: CreditCard, desc: "Paystack gateway and amounts" },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Tags, desc: "News categories, tags, publication types" },
  { href: "/admin/events", label: "Events", icon: Calendar, desc: "Manage events and registrations" },
  { href: "/admin/events/scan", label: "Check-in Scanner", icon: QrCode, desc: "Scan QR codes at events" },
  { href: "/admin/news", label: "News", icon: Newspaper, desc: "News articles and updates" },
  { href: "/admin/team", label: "Team", icon: Users, desc: "Team members and bios" },
  { href: "/admin/publications", label: "Publications", icon: BookOpen, desc: "Reports and policy briefs" },
  { href: "/admin/programs", label: "Programs", icon: FolderKanban, desc: "Program descriptions" },
  { href: "/admin/projects", label: "Projects", icon: Briefcase, desc: "Project descriptions" },
  { href: "/admin/partners", label: "Partners", icon: Handshake, desc: "Partner logos and links" },
  { href: "/admin/pages", label: "Page Content", icon: FileText, desc: "Hero text and page content" },
  { href: "/admin/home-settings", label: "Home Settings", icon: House, desc: "Homepage hero, stats, stories" },
  { href: "/admin/about-settings", label: "About Settings", icon: CircleUserRound, desc: "About page narrative and objectives" },
  { href: "/admin/site-settings", label: "Site Settings", icon: SlidersHorizontal, desc: "Global name, contact, social links" },
  { href: "/admin/settings", label: "Website Settings", icon: Settings, desc: "Run migrations and seed manually" },
];

const snapshotItems = [
  { key: "newsletter", label: "Newsletter", icon: Mail, countKey: "newsletter" as const },
  { key: "applications", label: "Applications", icon: UserPlus, countKey: "applications" as const },
  { key: "partnership", label: "Partnership", icon: Handshake, countKey: "partnership" as const },
  { key: "joinus", label: "Work with us", icon: Briefcase, countKey: "joinUs" as const },
  { key: "contact", label: "Contact", icon: MessageSquare, countKey: "contact" as const },
] as const;

export default async function AdminDashboardPage() {
  await requireAdminSession();

  let counts = {
    newsletter: 0,
    applications: 0,
    partnership: 0,
    joinUs: 0,
    contact: 0,
  };
  try {
    const [newsletter, applications, partnership, joinUs, contact] = await prisma.$transaction([
      prisma.newsletterSignup.count(),
      prisma.volunteerApplication.count(),
      prisma.partnershipInquiry.count(),
      prisma.joinUsInquiry.count(),
      prisma.contactSubmission.count(),
    ]);
    counts = { newsletter, applications, partnership, joinUs, contact };
  } catch {
    /* dashboard still usable if DB unavailable */
  }

  const inboxTotal =
    counts.newsletter + counts.applications + counts.partnership + counts.joinUs + counts.contact;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Manage all site content from one place.</p>

      <section className="mt-8 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Submission inbox</h2>
            <p className="mt-1 text-sm text-slate-500">
              Stored form data (no auto-expiry).{" "}
              <Link href="/admin/submissions" className="font-medium text-accent-600 hover:underline">
                Open submissions
              </Link>
            </p>
          </div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold tabular-nums text-slate-900">{inboxTotal}</span> total
          </p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {snapshotItems.map((item) => {
            const Icon = item.icon;
            const n = counts[item.countKey];
            return (
              <li key={item.key}>
                <Link
                  href="/admin/submissions"
                  className="flex items-center gap-3 rounded-lg border border-border bg-slate-50/80 px-3 py-3 transition-colors hover:border-accent-200 hover:bg-accent-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-accent-600 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</span>
                    <span className="text-lg font-semibold tabular-nums text-slate-900">{n}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:border-accent-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-accent-600">{item.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
