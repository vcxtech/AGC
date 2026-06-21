import { Prisma } from "@prisma/client";
import { aypfContent } from "@/data/aypf";
import { getInvolvedContent, workContent } from "@/data/content";
import { subscribePageContent } from "@/data/subscribe-page";
import { prisma } from "@/lib/db";
import { shouldSkipPrismaCalls } from "@/lib/skip-db";

/**
 * Baseline PageContent rows that were added after early deployments.
 * Ensures they exist when an admin opens Page Content (no full re-seed required).
 */
const BASELINE_PAGES: { slug: string; title: string; contentJson: Record<string, unknown> }[] = [
  {
    slug: "programs",
    title: "Programs",
    contentJson: workContent.programs as unknown as Record<string, unknown>,
  },
  {
    slug: "projects",
    title: "Projects",
    contentJson: workContent.projects as unknown as Record<string, unknown>,
  },
  {
    slug: "advisory",
    title: "Advisory",
    contentJson: workContent.advisory as unknown as Record<string, unknown>,
  },
  {
    slug: "research",
    title: "Research",
    contentJson: workContent.research as unknown as Record<string, unknown>,
  },
  {
    slug: "training",
    title: "Capacity Building",
    contentJson: workContent.training as unknown as Record<string, unknown>,
  },
  {
    slug: "our-work-partnership",
    title: "Partnership",
    contentJson: workContent.partnership as unknown as Record<string, unknown>,
  },
  {
    slug: "aypf",
    title: "African Youth in Politics Forum (AYPF)",
    contentJson: { ...aypfContent, heroImage: "/uploads/placeholder.svg" },
  },
  {
    slug: "awpls",
    title: "African Women Political Leadership Summit (AWPLS)",
    contentJson: {
      title: "African Women Political Leadership Summit",
      subtitle: "AWPLS",
      description:
        "The African Women Political Leadership Summit (AWPLS) brings together women in and around political life to share evidence, build skills, and strengthen how parties and institutions govern. Programme details, dates, and registration will be announced here.",
      heroImage: "/uploads/placeholder.svg",
    },
  },
  {
    slug: "get-involved-join-us",
    title: "Work with us",
    contentJson: {
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
    },
  },
  {
    slug: "get-involved-partnership",
    title: "Partnership",
    contentJson: {
      ...getInvolvedContent.partnership,
      cards: getInvolvedContent.partnership.cards ?? [],
      sectionEyebrow: "Collaboration",
      sectionHeading: "Partnerships",
      areasHeading: "Partnership areas",
      footerEyebrow: "Partners",
      footerHeading: "Start a conversation",
      footerBody:
        "Governments, institutions, civil society, and funders committed to good governance — we'd like to hear from you.",
      backLabel: "Back to Get Involved",
      programsLabel: "Programs:",
    },
  },
  {
    slug: "get-involved-volunteer",
    title: "Volunteer",
    contentJson: {
      ...getInvolvedContent.volunteer,
      sectionEyebrow: "Volunteering",
      sectionHeading: "Volunteer with us",
      impactEyebrow: "Impact roles",
      impactText: "Research, events, communications, and administration support.",
      waysHeading: "Ways to contribute",
      readyEyebrow: "Ready?",
      readyHeading: "Apply",
      readyBody:
        "Complete the volunteer application — we welcome people who want to strengthen governance dialogue and research.",
      backLabel: "Back to Get Involved",
      questionsLabel: "Questions?",
    },
  },
  {
    slug: "subscribe",
    title: "Subscribe",
    contentJson: subscribePageContent as unknown as Record<string, unknown>,
  },
];

export async function ensureMissingBaselinePageRows(): Promise<void> {
  if (shouldSkipPrismaCalls()) return;

  const workSlugRenames: { from: string; to: string; title: string }[] = [
    { from: "our-work-programs", to: "programs", title: "Programs" },
    { from: "our-work-projects", to: "projects", title: "Projects" },
    { from: "our-work-advisory", to: "advisory", title: "Advisory" },
    { from: "our-work-research", to: "research", title: "Research" },
    { from: "our-work-training", to: "training", title: "Capacity Building" },
  ];

  for (const rename of workSlugRenames) {
    try {
      const existingTo = await prisma.pageContent.findUnique({ where: { slug: rename.to } });
      if (existingTo) continue;
      const legacy = await prisma.pageContent.findUnique({ where: { slug: rename.from } });
      if (!legacy) continue;
      await prisma.pageContent.update({
        where: { slug: rename.from },
        data: { slug: rename.to, title: rename.title },
      });
    } catch {
      // Ignore uniqueness/schema issues; baseline creation below still runs.
    }
  }

  for (const p of BASELINE_PAGES) {
    try {
      const existing = await prisma.pageContent.findUnique({ where: { slug: p.slug } });
      if (!existing) {
        await prisma.pageContent.create({
          data: {
            slug: p.slug,
            title: p.title,
            status: "published",
            contentJson: p.contentJson as Prisma.InputJsonValue,
          },
        });
      }
    } catch {
      // DB unavailable or schema mismatch — list page still tries findMany below.
    }
  }
}
