/**
 * Seed initial content for AGC website
 * Run: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import { appSummitContent } from "../src/data/app-summit";
import { aypfContent } from "../src/data/aypf";
import {
  getInvolvedContent,
  workContent,
  eventsContent,
  newsContent,
  publicationsContent,
  siteConfig,
  fallbackEvents,
  fallbackNews,
  fallbackPublications,
} from "../src/data/content";
import { privacyPolicy, termsOfService } from "../src/data/legal";
import { getBootstrapHomePageCms } from "../src/lib/cms-bootstrap";
import { applicationsPageUiDefaults } from "../src/data/applications-page";
import { DEFAULT_SITE_CHROME } from "../src/data/site-chrome";

const prisma = new PrismaClient();

/** Deep-clone so Prisma JSON is plain objects (seed row matches what Admin saves after mergeSiteChrome). */
function cloneDefaultChrome(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(DEFAULT_SITE_CHROME)) as Record<
    string,
    unknown
  >;
}

/** When "1" or "true", seed overwrites existing PageContent rows from repo defaults (destructive). Default: only create missing slugs. */
const resetPageContent =
  process.env.SEED_RESET_PAGE_CONTENT === "1" ||
  process.env.SEED_RESET_PAGE_CONTENT === "true";

const defaultTaxonomyJson = {
  newsCategories: [
    {
      slug: "appi",
      label: "African Political Parties Initiative",
      description: "APPI-related news and engagements",
    },
    {
      slug: "reports",
      label: "Reports & Publications",
      description: "Summary reports and publications",
    },
    {
      slug: "announcements",
      label: "Announcements",
      description: "Official announcements and calls",
    },
    {
      slug: "elections",
      label: "Elections & Democracy",
      description: "Electoral processes and democratic governance",
    },
    {
      slug: "fellowships",
      label: "Fellowships & Opportunities",
      description: "Calls for applications and opportunities",
    },
    {
      slug: "events",
      label: "Events",
      description: "Summits, conferences, and events",
    },
  ],
  publicationTypes: [
    {
      slug: "report",
      label: "Report",
      description: "Summary and thematic reports",
    },
    {
      slug: "policy_brief",
      label: "Policy brief",
      description: "Short policy-oriented briefs",
    },
    {
      slug: "research",
      label: "Research",
      description: "Research papers and findings",
    },
    {
      slug: "working_paper",
      label: "Working paper",
      description: "Draft or discussion papers",
    },
    {
      slug: "toolkit",
      label: "Toolkit / guide",
      description: "Practical guides and toolkits",
    },
  ],
  newsTags: [
    { slug: "political-parties", label: "Political Parties" },
    { slug: "governance", label: "Governance" },
    { slug: "ghana", label: "Ghana" },
    { slug: "algeria", label: "Algeria" },
    { slug: "summit", label: "Summit" },
    { slug: "elections", label: "Elections" },
    { slug: "fellows", label: "Fellows" },
    { slug: "research", label: "Research" },
    { slug: "accra-declaration", label: "Accra Declaration" },
  ],
};

async function main() {
  const publicationsTypesColumn = await prisma.$queryRaw<
    Array<{ exists: boolean }>
  >`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'publications'
        AND column_name = 'types'
    ) AS "exists"
  `;
  const canWritePublicationTypes = Boolean(publicationsTypesColumn[0]?.exists);

  // Page content (about, contact, get-involved)
  const pages = [
    {
      slug: "about",
      title: "About Us",
      heroSubtitle: "Advancing Democratic Governance",
      intro:
        "Africa Governance Centre is an independent think tank committed to promoting governance excellence, policy development, and institutional capacity building to support Africa's economic transformation.",
      description:
        "Through research, capacity development, and strategic collaborations, we aim to strengthen government institutions and facilitate systemic change to achieve a prosperous and inclusive continent.",
      mission:
        "Our mission is to equip African nations with the tools, knowledge, and partnerships necessary to transform governance into a catalyst for economic prosperity and sustainable development.",
      objectivesTitle: "Mission and Strategic Objectives",
      objectivesContent:
        "Our primary mission is to promote governance excellence as a key driver of economic transformation and sustainable development across Africa.",
      objectivesPrinciples:
        "Upholding principles of excellence, transparency, and intellectual rigor.",
      objectivesAgenda2063:
        "Aligned with the vision of the African Union's Agenda 2063: The Africa We Want.",
      status: "published",
      contentJson: {
        teamPage: {
          title: "Our Team",
          subtitle:
            "Advisory Board, Management Team, Fellows, and Associate Fellows",
          heroImage: "/uploads/placeholder.svg",
        },
      },
    },
    {
      slug: "contact",
      title: "Contact",
      heroTitle: "Contact Us",
      heroSubtitle: "Get in touch with the Africa Governance Centre",
      intro: "We welcome your inquiries and look forward to hearing from you.",
      status: "published",
    },
    {
      slug: "home",
      title: "Homepage",
      status: "published",
      contentJson: getBootstrapHomePageCms(),
    },
    {
      slug: "site-settings",
      title: "Site Settings",
      status: "published",
      contentJson: { ...siteConfig, chrome: cloneDefaultChrome() },
    },
    {
      slug: "app-summit",
      title: "APP Summit",
      status: "published",
      contentJson: {
        ...appSummitContent,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "aypf",
      title: "African Youth in Politics Forum (AYPF)",
      status: "published",
      contentJson: { ...aypfContent, heroImage: "/uploads/placeholder.svg" },
    },
    {
      slug: "awpls",
      title: "African Women Political Leadership Summit (AWPLS)",
      status: "published",
      contentJson: {
        title: "African Women Political Leadership Summit",
        subtitle: "AWPLS",
        description:
          "The African Women Political Leadership Summit (AWPLS) brings together women in and around political life to share evidence, build skills, and strengthen how parties and institutions govern. Programme details, dates, and registration will be announced here.",
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "applications",
      title: "Applications",
      status: "published",
      contentJson: {
        heroTitle: "Volunteer application",
        heroSubtitle:
          "Your skills and time strengthen research, events, and policy dialogue across the continent. Tell us how you’d like to contribute — we read every submission.",
        applyIntro:
          "A few minutes now helps us match you to the right team. Fields marked * are required.",
        heroImage: "/uploads/placeholder.svg",
        ...applicationsPageUiDefaults,
      },
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      status: "published",
      contentJson: privacyPolicy,
    },
    {
      slug: "terms-of-service",
      title: "Terms of Service",
      status: "published",
      contentJson: termsOfService,
    },
    {
      slug: "our-work-programs",
      title: "Our Work — Programs",
      status: "published",
      contentJson: {
        ...workContent.programs,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "our-work",
      title: "Our Work",
      status: "published",
      contentJson: {
        ...workContent,
        heroImage: "/uploads/placeholder.svg",
        pillarReadMoreLabel: "Read more",
        pillarCardImages: {
          programs: "/uploads/placeholder.svg",
          projects: "/uploads/placeholder.svg",
          advisory: "/uploads/placeholder.svg",
          research: "/uploads/placeholder.svg",
          training: "/uploads/placeholder.svg",
          partnership: "/uploads/placeholder.svg",
        },
      },
    },
    {
      slug: "our-work-research",
      title: "Our Work — Research",
      status: "published",
      contentJson: {
        ...workContent.research,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "our-work-training",
      title: "Our Work — Training",
      status: "published",
      contentJson: {
        ...workContent.training,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "our-work-projects",
      title: "Our Work — Projects",
      status: "published",
      contentJson: {
        ...workContent.projects,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "our-work-advisory",
      title: "Our Work — Advisory",
      status: "published",
      contentJson: {
        ...workContent.advisory,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "events",
      title: "Events",
      status: "published",
      contentJson: { ...eventsContent, heroImage: "/uploads/placeholder.svg" },
    },
    {
      slug: "news",
      title: "News",
      status: "published",
      contentJson: { ...newsContent, heroImage: "/uploads/placeholder.svg" },
    },
    {
      slug: "publications",
      title: "Publications",
      status: "published",
      contentJson: {
        ...publicationsContent,
        heroImage: "/uploads/placeholder.svg",
      },
    },
    {
      slug: "get-involved",
      title: "Get Involved",
      heroTitle: "Get Involved",
      heroSubtitle: "Join us in advancing governance excellence across Africa",
      status: "published",
      contentJson: {
        ...getInvolvedContent,
        heroImage: "/uploads/placeholder.svg",
      },
    },
  ];

  let pageCreates = 0;
  let pageUpdates = 0;
  for (const p of pages) {
    const existing = await prisma.pageContent.findUnique({
      where: { slug: p.slug },
    });
    if (!existing) {
      await prisma.pageContent.create({ data: p });
      pageCreates++;
    } else if (resetPageContent) {
      await prisma.pageContent.update({
        where: { slug: p.slug },
        data: {
          title: p.title,
          heroTitle: p.heroTitle,
          heroSubtitle: p.heroSubtitle,
          intro: p.intro,
          status: p.status,
          contentJson: p.contentJson,
        },
      });
      pageUpdates++;
    }
  }
  console.log(
    `  Page content: ${pages.length} baseline slugs — created ${pageCreates}, skipped ${pages.length - pageCreates - pageUpdates} (unchanged)` +
      (resetPageContent
        ? `, reset ${pageUpdates} (SEED_RESET_PAGE_CONTENT)`
        : " (set SEED_RESET_PAGE_CONTENT=1 to overwrite CMS pages from seed)"),
  );

  // Programs (image optional — null in seed; admin sets /uploads/... or media id when needed)
  const programs = [
    {
      title: "Youth and Women Empowerment Workshops",
      description:
        "AGC organizes workshops and forums dedicated to empowering youth and women in governance and leadership positions.",
      order: 1,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Research and Policy Forums",
      description:
        "AGC hosts research and policy forums to highlight recent findings, policy analyses, and best practices in governance.",
      order: 2,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Annual Summits and Meetings",
      description:
        "AGC organizes annual meetings and events that bring together distinguished leaders, experts, and policymakers.",
      order: 3,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Public-Private Dialogues",
      description:
        "AGC organizes public-private dialogues to promote collaboration between government entities and the private sector.",
      order: 4,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Expert Forums on Good Governance",
      description:
        "AGC conducts regular forums focused on good governance, bringing together policymakers, experts, civil society organizations, and stakeholders from across Africa.",
      order: 5,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Regional Governance Conferences",
      description:
        "AGC collaborates with regional organizations such as the African Union, ECOWAS, and SADC to convene governance conferences.",
      order: 6,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Sector-Specific Roundtables",
      description:
        "AGC organizes expert roundtables focused on sector-specific governance challenges, involving key stakeholders from sectors such as health, education, infrastructure, agriculture, and energy.",
      order: 7,
      status: "published" as const,
      image: null as string | null,
    },
  ];

  const existingPrograms = await prisma.program.count();
  if (existingPrograms === 0) {
    await prisma.program.createMany({ data: programs });
  }
  // console.log(`  Programs: ${programs.length}`);

  // Projects (image optional — null in seed; admin sets image when needed)
  const projects = [
    {
      title: "Africa Governance Review",
      description:
        "The Africa Governance Review Project is a comprehensive initiative dedicated to conducting detailed assessments, offering policy recommendations, and facilitating discussions on governance challenges and opportunities across African nations.",
      order: 1,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Media and Democracy Initiative",
      description:
        "The Media and Democracy Initiative of the Africa Governance Centre seeks to empower media professionals, support independent journalism, and strengthen the media's ability to facilitate informed citizen participation in governance processes.",
      order: 2,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Public Sector Efficiency and Innovation Project",
      description:
        "The Public Sector Efficiency and Innovation Project is dedicated to addressing the critical need for streamlined operations, improved public service delivery, and the integration of innovative solutions to support Africa's development.",
      order: 3,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "African Political Parties Initiative",
      description:
        "The African Political Parties Initiative (APPI) is a project developed by the Africa Governance Centre dedicated to supporting the role of political parties in Africa's development.",
      order: 4,
      status: "published" as const,
      image: null as string | null,
    },
    {
      title: "Africa Resource Governance Initiative",
      description:
        "The Africa Resource Governance Initiative (ARGI), a project of the Africa Governance Centre, is dedicated to promoting transparency, accountability, and sustainable management of natural resources across Africa.",
      order: 5,
      status: "published" as const,
      image: null as string | null,
    },
  ];

  const existingProjects = await prisma.project.count();
  if (existingProjects === 0) {
    await prisma.project.createMany({ data: projects });
  }
  // console.log(`  Projects: ${projects.length}`);

  // Partners
  const partners = [
    {
      name: "African Union",
      url: "https://au.int",
      order: 1,
      status: "published" as const,
    },
    {
      name: "ECOWAS",
      url: "https://ecowas.int",
      order: 2,
      status: "published" as const,
    },
    {
      name: "SADC",
      url: "https://www.sadc.int",
      order: 3,
      status: "published" as const,
    },
    {
      name: "UNCTAD",
      url: "https://unctad.org",
      order: 4,
      status: "published" as const,
    },
  ];

  const existingPartners = await prisma.partner.count();
  if (existingPartners === 0) {
    await prisma.partner.createMany({ data: partners });
  }
  // console.log(`  Partners: ${partners.length}`);

  // Team (advisory board)
  const team = [
    {
      name: "Dr. Mamphela Ramphele",
      role: "Advisory Board Member",
      bio: "Dr. Mamphela Ramphele is a respected activist, medical professional, academic, business leader, and thought leader. She holds a PhD in Social Anthropology, a BCom degree, as well as diplomas in Tropical Hygiene and Public Health. Her notable career includes serving as Vice Chancellor of the University of Cape Town in 1996 and as Managing Director of the World Bank from 2000 to 2004.",
      order: 1,
      status: "published" as const,
    },
    {
      name: "Most Honourable Percival Noel James Patterson",
      role: "Advisory Board Member",
      bio: "Most Honorable Percival Noel James Patterson is a former Jamaican politician who served as the sixth Prime Minister of Jamaica from 1992 to 2006, becoming the longest-serving Prime Minister in Jamaica's history.",
      order: 2,
      status: "published" as const,
    },
    {
      name: "His Excellency Dr. Thomas Yayi Boni",
      role: "Advisory Board Member",
      bio: "His Excellency Dr. Thomas Yayi Boni is a Beninese politician and banker. He served as the President of Benin from 2006 to 2016.",
      order: 3,
      status: "published" as const,
    },
    {
      name: "Dr. Muhkisa Kituyi",
      role: "Advisory Board Member",
      bio: "Dr. Muhkisa Kituyi was the seventh Secretary-General of UNCTAD from 1 September 2013 to 15 February 2021. He has extensive experience as an academic, public servant, trade negotiator, and diplomat.",
      order: 4,
      status: "published" as const,
    },
    {
      name: "Prof. Alex Kwaku Danso-Boafo",
      role: "Advisory Board Member",
      bio: "Prof. Danso-Boafo began his academic career at the University of Ghana in 1982, contributing extensively as a Political Science lecturer.",
      order: 5,
      status: "published" as const,
    },
    {
      name: "H.E Jeffrey Thamsanqa Radebe",
      role: "Advisory Board Member",
      bio: "H.E. Jeffrey Thamsanqa Radebe is a distinguished South African political leader and experienced government official. He is currently serving as a Special Investment Envoy for President Cyril Ramaphosa.",
      order: 6,
      status: "published" as const,
    },
  ];

  const existingTeam = await prisma.team.count();
  if (existingTeam === 0) {
    await prisma.team.createMany({ data: team });
  }
  // console.log(`  Team: ${team.length} members`);

  // News (seed full existing fallback set so local admin matches public content inventory)
  const existingNews = await prisma.news.count();
  if (existingNews === 0) {
    const newsRows = fallbackNews.map((item) => ({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      image: "/uploads/placeholder.svg",
      datePublished: item.date_published ? new Date(item.date_published) : null,
      author: item.author ?? "Africa Governance Centre",
      categories: item.categories ?? [],
      tags: item.tags ?? [],
      status: "published" as const,
    }));
    await prisma.news.createMany({
      data: newsRows,
    });
    // console.log(`  News: ${newsRows.length} items`);
  }

  // Events (seed full existing fallback set so local admin matches public content inventory)
  const existingEvents = await prisma.event.count();
  if (existingEvents === 0) {
    const eventRows = fallbackEvents.map((item) => ({
      title: item.title,
      slug: item.slug,
      description: item.description ?? "",
      location: item.location ?? "",
      startDate: new Date(item.start_date),
      endDate: item.end_date ? new Date(item.end_date) : null,
      image: item.image ?? "/uploads/placeholder.svg",
      category: item.category ?? null,
      eventType: item.category ?? "event",
      status: "published" as const,
    }));
    await prisma.event.createMany({
      data: eventRows,
    });
    // console.log(`  Events: ${eventRows.length} items`);
  }

  // Publications (seed full existing fallback set so local admin matches public content inventory)
  const existingPubs = await prisma.publication.count();
  if (existingPubs === 0) {
    const publicationRows = fallbackPublications.map((item) => ({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? null,
      ...(canWritePublicationTypes
        ? {
            types:
              Array.isArray(item.types) && item.types.length > 0
                ? item.types
                : ["report"],
          }
        : {}),
      image: "/uploads/placeholder.svg",
      datePublished: item.date_published ? new Date(item.date_published) : null,
      author: item.author ?? "Africa Governance Centre",
      status: "published" as const,
    }));
    await prisma.publication.createMany({
      data: publicationRows,
    });
    // console.log(`  Publications: ${publicationRows.length} items`);
  }

  const hasTaxonomy = await prisma.pageContent.findUnique({
    where: { slug: "site-taxonomy" },
  });
  if (!hasTaxonomy) {
    await prisma.pageContent.create({
      data: {
        slug: "site-taxonomy",
        title: "Site taxonomy",
        status: "published",
        contentJson: defaultTaxonomyJson,
      },
    });
    console.log(
      "  Taxonomy: site defaults (news categories, publication types, news tags) — edit in Admin → Taxonomy",
    );
  }

  console.log(
    "\nSeed complete. Replace images and edit content via Admin (Media, News, Events, Publications, Partners, Page Content → home).",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
