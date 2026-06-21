import { placeholderImages } from "@/data/images";

/**
 * Africa Governance Centre - Content Data
 * Scraped and structured from africagovernancecentre.org
 */

/** Canonical org intro — used on About, homepage, SEO meta, and structured data. */
export const ORG_INTRO_PARAGRAPHS = [
  "The Africa Governance Centre (AGC) is an independent policy, advocacy, and research think tank working to strengthen governance systems across Africa. We focus on advancing democratic governance, economic transformation, political cooperation, institutional development, and regulatory strengthening across the continent.",
  "Since its establishment, the Centre has convened strategic stakeholder dialogues, developed policy recommendations, and supported evidence-based governance reforms at local, regional, and continental levels.",
] as const;

export const ORG_SEO_DESCRIPTION = ORG_INTRO_PARAGRAPHS[0];

export const siteConfig = {
  name: "Africa Governance Centre",
  logo: "",
  footerLogo: "",
  tagline: ORG_SEO_DESCRIPTION,
  email: {
    programs: "programs@africagovernancecentre.org",
    media: "media@africagovernancecentre.org",
    info: "info@africagovernancecentre.org",
  },
  phone: "+233 53 054 5528",
  address: "32 Hackman Owusu Agyeman Street, East Legon, Accra – Ghana",
  officeHours: "Monday - Friday: 8:00 AM - 5:00 PM",
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
  },
  languages: [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "pt", label: "Português" },
    { code: "sw", label: "Kiswahili" },
    { code: "am", label: "አማርኛ" },
    { code: "es", label: "Español" },
    { code: "ha", label: "Hausa" },
  ],
};

/**
 * Header top bar “Donate” link target.
 * Set `NEXT_PUBLIC_DONATE_HREF` in `.env` (e.g. `/your-page` or `https://…`). Defaults to `/contact`.
 */
export const donateHref =
  typeof process.env.NEXT_PUBLIC_DONATE_HREF === "string" &&
  process.env.NEXT_PUBLIC_DONATE_HREF.trim() !== ""
    ? process.env.NEXT_PUBLIC_DONATE_HREF.trim()
    : "/contact";

/** Default hero backdrop when no CMS images are set (Earth from space — subtle black scrim applied in `HeroConsultar`). */
export const defaultHomeHeroBackgroundImage =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=80";

/** Main home hero headline (`HeroConsultar` `h1`; CMS Home Settings title aligns with this default). */
export const HOME_HERO_DISPLAY_TAGLINE =
  "When governance works, people can thrive";

export const heroContent = {
  eyebrow: "",
  title: HOME_HERO_DISPLAY_TAGLINE,
  subtitle: "",
  cta: "See what we do",
  ctaHref: "/our-work" as const,
  ctaSecondary: "Work with us",
  ctaSecondaryHref: "/get-involved/partnership" as const,
};

/** Shown below hero — names only until logos are available */
export const heroPartnerStrip = [
  "African Union frameworks",
  "National reform teams",
  "Universities & fellows",
  "Civil society networks",
];

/** Home impact stats — figures should be verified in admin. */
export const homeImpactStats = [
  {
    value: "50+",
    label: "African countries in our networks",
    note: "Convenings, studies, and policy conversations over the years",
  },
  {
    value: "25+",
    label: "Fellows & advisors",
    note: "Scholars and practitioners who shape our work",
  },
  {
    value: "30+",
    label: "Programmes & initiatives",
    note: "From roundtables to long-term capacity support",
  },
  {
    value: "2018",
    label: "Year we opened our doors",
    note: "Carrying forward decades of combined experience",
  },
] as const;

/** Optional italic note below impact stats — empty by default. */
export const homeImpactMethodology = "";

/** Homepage testimonial — edit live copy under Admin → Home settings (seed/bootstrap supplies initial text). */
export const homeTestimonial = {
  quote:
    "The African Political Parties Initiative does not tell parties whom to elect—it asks how parties govern between ballots. After Accra, our national executive used the same evidence briefs AGC prepared for the summit to reopen a stalled debate on internal accountability. That is unusual continental work.",
  name: "Margaret Asante",
  title: "Director of Party Administration & Research",
  organization: "Major governing party, West Africa",
  initials: "MA",
};

/** Fellow spotlight — edit under Admin → Home settings. */
export const homeSpotlightStory = {
  label: "Fellow spotlight",
  headline: "Eight months with the team behind the Africa Governance Review",
  paragraphs: [
    "Dr. Ibrahim Danladi joined as a Research and Policy Fellow while AGC was finalising scoping for the Africa Governance Review—desk work on how countries compare on transparency benchmarks, paired with interviews alongside programmes staff.",
    "His secondment overlapped with follow-up from the African Political Parties Summit: he helped turn themes from the Accra Declaration into short discussion guides for party academies that asked for practical language, not slogans. One secretariat later said they used his annex on youth participation in a rules review.",
  ],
  name: "Dr. Ibrahim Danladi",
  role: "Research & Policy Fellow (Governance Review & APPI support)",
  initials: "",
  image: placeholderImages.hero,
  ctaLabel: "Fellowships & summit coverage",
  ctaHref: "/news/category/fellowships" as const,
};

export const aboutContent = {
  title: "About Africa Governance Centre",
  hero: {
    subtitle: "Advancing Democratic Governance",
  },
  intro:
    "Africa Governance Centre is an independent think tank committed to promoting governance excellence, policy development, and institutional capacity building to support Africa's economic transformation.",
  description:
    "Through research, capacity development, and strategic collaborations, we aim to strengthen government institutions and facilitate systemic change to achieve a prosperous and inclusive continent. Our focus is on fostering transparent, accountable, and inclusive governance systems that contribute to sustainable economic growth. Guided by the vision of a prosperous, inclusive, and empowered Africa, we believe that effective governance is essential to unlocking the continent's full potential.",
  mission:
    "Our mission is to equip African nations with the tools, knowledge, and partnerships necessary to transform governance into a catalyst for economic prosperity and sustainable development. We welcome collaboration with governments, institutions, civil society organizations, and partners committed to advancing good governance and driving Africa's economic progress.",
  strategicObjectives: {
    title: "Mission and Strategic Objectives",
    content:
      "Our primary mission is to promote governance excellence as a key driver of economic transformation and sustainable development across Africa. We are committed to equipping African governments, institutions, and stakeholders with the knowledge, tools, and partnerships necessary to establish transparent, accountable, and inclusive governance systems that foster socio-economic growth and improve living standards for all.",
    principles:
      "Upholding principles of excellence, transparency, and intellectual rigor, we believe that open-minded inquiry and innovative ideas are essential for Africa's pursuit of a prosperous, peaceful, and influential future.",
    agenda2063:
      "Aligned with the vision of the African Union's Agenda 2063: The Africa We Want, there are significant opportunities for economic transformation as the continent seeks to leverage its vast resources. The Africa Governance Centre aims to lead evidence-based policy engagement to facilitate change in global governance structures and empower stakeholders across the continent to deliver effective governance in Africa.",
  },
  aboutSectionEyebrow: "About us",
  aboutSectionHeading: "Who we are",
  aboutSectionImage: "",
  teamSections: [
    "Executive Council",
    "Advisory Board",
    "Management Team",
    "Fellows",
    "Associate Fellows",
  ],
  teamTabs: {
    executiveCouncil: "Executive Council",
    advisoryBoard: "Advisory Board",
    managementTeam: "Management Team",
    fellows: "Fellows",
    associateFellows: "Associate Fellows",
  },
  /** Public /about/team hero; overridable via PageContent slug `about` (content_json.teamPage). */
  teamPage: {
    title: "Our Team",
    subtitle: "Advisory Board, Management Team, Fellows, and Associate Fellows",
  },
};

/** Fallback team when CMS returns no members */
export const fallbackTeam = [
  {
    id: 1,
    name: "Dr. Mamphela Ramphele",
    role: "Advisory Board Member",
    bio: "Dr. Mamphela Ramphele is a respected activist, medical professional, academic, business leader, and thought leader. She holds a PhD in Social Anthropology, a BCom degree, as well as diplomas in Tropical Hygiene and Public Health. Her notable career includes serving as Vice Chancellor of the University of Cape Town in 1996 and as Managing Director of the World Bank from 2000 to 2004.",
    section: "advisory_board",
  },
  {
    id: 2,
    name: "Most Honourable Percival Noel James Patterson",
    role: "Advisory Board Member",
    bio: "Most Honorable Percival Noel James Patterson is a former Jamaican politician who served as the sixth Prime Minister of Jamaica from 1992 to 2006, becoming the longest-serving Prime Minister in Jamaica's history. Throughout his political career, Mr. Patterson held several Cabinet positions, including Minister of Industry and Tourism, Minister of Foreign Affairs and Foreign Trade, Minister of Development, Planning and Production, and Minister of Finance and Planning.",
    section: "advisory_board",
  },
  {
    id: 3,
    name: "His Excellency Dr. Thomas Yayi Boni",
    role: "Advisory Board Member",
    bio: "His Excellency Dr. Thomas Yayi Boni is a Beninese politician and banker. He served as the President of Benin from 2006 to 2016. His professional background includes employment at the Benin Commercial Bank from 1975 to 1978 and subsequently at the Central Bank of West African States (BCEAO) from 1977 to 1989. From 1992 to 1994, he served as an economic adviser to then-President Nicéphore Soglo of Benin. In 1994, he assumed the role of President of the West African Development Bank (BOAD). Following his presidency, he led the African Union's observer mission for the April 2016 presidential election in Equatorial Guinea.",
    section: "advisory_board",
  },
  {
    id: 4,
    name: "Dr. Muhkisa Kituyi",
    role: "Advisory Board Member",
    bio: "Dr. Muhkisa Kituyi was the seventh Secretary-General of UNCTAD from 1 September 2013 to 15 February 2021. He has extensive experience as an academic, public servant, trade negotiator, and diplomat. Dr Kituyi served as a researcher at Norway's Christian Michelsen Institute from 1989 to 1991, and as Programme Director of the African Centre for Technology Studies in Nairobi from 1991 till 1992, when he was elected to the Kenyan Parliament. He later became Minister of Trade and Industry for the Republic of Kenya from 2002 to 2007 within which period, he chaired the Council of Ministers of the Common Market for Eastern and Southern Africa (COMESA) and the African Trade Ministers' Council.",
    section: "advisory_board",
  },
  {
    id: 5,
    name: "Prof. Alex Kwaku Danso-Boafo",
    role: "Advisory Board Member",
    bio: "Prof. Danso-Boafo began his academic career at the University of Ghana in 1982, contributing extensively as a Political Science lecturer and serving in various roles, including Secretary of the University Teachers Association of Ghana. His academic pursuits extended internationally, leading to positions at Clark Atlanta University, where he was Head of Public Administration and later Head of the Post-Graduate Program in International Affairs, achieving the rank of Associate Professor. His diplomatic service includes roles such as Ghana's Ambassador to Cuba from 1997 to 2000, with concurrent accreditation to Jamaica, Trinidad and Tobago, Nicaragua, and Panama. He also served as Ghana's High Commissioner to the United Kingdom and Ireland from 2009 to 2014.",
    section: "advisory_board",
  },
  {
    id: 6,
    name: "H.E Jeffrey Thamsanqa Radebe",
    role: "Advisory Board Member",
    bio: "H.E. Jeffrey Thamsanqa Radebe, born on 18 February 1953, is a distinguished South African political leader and experienced government official. He is currently serving as a Special Investment Envoy for President Cyril Ramaphosa. President Ramaphosa has appointed Mr. Radebe as the Special Envoy to the Great Lakes region. Throughout his career, Mr. Radebe has held significant positions within the African National Congress (ANC), including membership on the National Executive Committee since 1991, as well as leadership roles such as Chairperson of the National Planning Commission and Chair of the ANC Disciplinary Committee. His government service began in 1994, during which he served as a Cabinet Minister under five South African presidents. His ministerial portfolios have included Public Works, Public Enterprises, Transport, Justice, Planning, Monitoring and Evaluation, and Energy, reflecting his broad expertise and commitment to governance.",
    section: "advisory_board",
  },
];

export const workContent = {
  hero: {
    title: "Our Work",
    subtitle: "Making a Difference",
  },
  approach: {
    title: "Our Approach",
    intro:
      "The Africa Governance Centre's work and engagements are grounded in open-minded, innovative, independent, and peer-reviewed inquiry, reflecting a diversity of perspectives. Our programs address topics such as innovations in public service delivery, human rights, economic development, natural resources and extractives frameworks, institutional structures, political leadership, government machinery, and sustainable development. Our work maintains a nonpartisan stance, and our positions are independent of our funding sources.",
    objectivesLead: "The Africa Governance Centre's objectives include:",
    objectives: [
      "Producing knowledge that critically examines the impacts of current socioeconomic and political governance systems, and promoting systemic change aimed at achieving just outcomes and inclusive development.",
      "Influencing the discourse, expanding policy spaces, and proposing alternative policy solutions in key areas to promote meaningful governance outcomes.",
      "Supporting the development of collective power by fostering communities of practice within state institutions and among key societal actors.",
      "Enhancing the Centre's role as a catalyst for innovative thinking and action in African governance and economic transformation.",
    ],
  },
  tabs: {
    programs: "Programs",
    projects: "Projects",
    advisory: "Advisory",
  },
  programs: {
    title: "Programs",
    subtitle: "Our core focus areas",
    description:
      "Through forums and expert roundtables, the Africa Governance Centre promotes a culture of collaboration, knowledge sharing, and collective action to advance good governance practices and support economic transformation in Africa.",
    programs: [
      {
        title: "African Political Parties Initiative",
        description:
          "The African Political Parties Initiative (APPI) is a project developed by the Africa Governance Centre dedicated to supporting the role of political parties in Africa's development.",
        backgroundImage: "",
      },
      {
        title: "Africa Governance Review",
        description:
          "The Africa Governance Review Project is a comprehensive initiative dedicated to conducting detailed assessments, offering policy recommendations, and facilitating discussions on governance challenges and opportunities across African nations.",
        backgroundImage: "",
      },
      {
        title: "Africa Resource Governance Initiative",
        description:
          "The Africa Resource Governance Initiative (ARGI), a project of the Africa Governance Centre, is dedicated to promoting transparency, accountability, and sustainable management of natural resources across Africa.",
        backgroundImage: "",
      },
      {
        title: "Public Sector Efficiency and Innovation Project",
        description:
          "The Public Sector Efficiency and Innovation Project is dedicated to addressing the critical need for streamlined operations, improved public service delivery, and the integration of innovative solutions to support Africa's development.",
        backgroundImage: "",
      },
      {
        title: "Media and Democracy Initiative",
        description:
          "The Media and Democracy Initiative of the Africa Governance Centre seek to empower media professionals, support independent journalism, and strengthen the media's ability to facilitate informed citizen participation in governance processes.",
        backgroundImage: "",
      },
    ],
    cards: [
      {
        title: "Youth and Women Empowerment Workshops",
        description:
          "AGC organizes workshops and forums dedicated to empowering youth and women in governance and leadership positions.",
      },
      {
        title: "Research and Policy Forums",
        description:
          "AGC hosts research and policy forums to highlight recent findings, policy analyses, and best practices in governance.",
      },
      {
        title: "Annual Summits and Meetings",
        description:
          "AGC organizes annual meetings and events that bring together distinguished leaders, experts, and policymakers.",
      },
      {
        title: "Public-Private Dialogues",
        description:
          "AGC organizes public-private dialogues to promote collaboration between government entities and the private sector.",
      },
      {
        title: "Expert Forums on Good Governance",
        description:
          "AGC conducts regular forums focused on good governance, bringing together policymakers, experts, civil society organizations, and stakeholders from across Africa.",
      },
      {
        title: "Regional Governance Conferences",
        description:
          "AGC collaborates with regional organizations such as the African Union, ECOWAS, and SADC to convene governance conferences.",
      },
      {
        title: "Sector-Specific Roundtables",
        description:
          "AGC organizes expert roundtables focused on sector-specific governance challenges, involving key stakeholders from sectors such as health, education, infrastructure, agriculture, and energy.",
      },
    ],
  },
  projects: {
    title: "Projects",
    subtitle: "Our targeted interventions",
    description:
      "The Africa Governance Centre's projects are strategically aimed at strengthening the governance frameworks of African countries to promote transformative and sustainable development.",
    cards: [
      {
        title: "Africa Governance Review",
        description:
          "The Africa Governance Review Project is a comprehensive initiative dedicated to conducting detailed assessments, offering policy recommendations, and facilitating discussions on governance challenges and opportunities across African nations.",
      },
      {
        title: "Media and Democracy Initiative",
        description:
          "The Media and Democracy Initiative of the Africa Governance Centre seeks to empower media professionals, support independent journalism, and strengthen the media's ability to facilitate informed citizen participation in governance processes.",
      },
      {
        title: "Public Sector Efficiency and Innovation Project",
        description:
          "The Public Sector Efficiency and Innovation Project is dedicated to addressing the critical need for streamlined operations, improved public service delivery, and the integration of innovative solutions to support Africa's development.",
      },
      {
        title: "African Political Parties Initiative",
        description:
          "The African Political Parties Initiative (APPI) is a project developed by the Africa Governance Centre dedicated to supporting the role of political parties in Africa's development.",
      },
      {
        title: "Africa Resource Governance Initiative",
        description:
          "The Africa Resource Governance Initiative (ARGI), a project of the Africa Governance Centre, is dedicated to promoting transparency, accountability, and sustainable management of natural resources across Africa.",
      },
    ],
  },
  advisory: {
    title: "Advisory",
    subtitle: "Our expert services",
    description:
      "The Africa Governance Review Project is a comprehensive initiative dedicated to conducting detailed assessments, offering policy recommendations, and facilitating discussions on governance challenges and opportunities across African nations.",
    cards: [
      {
        title: "Policy Research and Analysis",
        description:
          "We provide in-depth research and analysis on key governance issues to inform policy development and decision-making.",
      },
      {
        title: "Capacity Building and Training",
        description:
          "We offer training programs and workshops to enhance the skills and knowledge of policymakers, civil society actors, and other stakeholders.",
      },
      {
        title: "Strategic Advocacy and Engagement",
        description:
          "We engage in strategic advocacy to influence policy agendas and promote positive governance outcomes at local, national, and regional levels.",
      },
      {
        title: "Institutional Strengthening",
        description:
          "We support the development and strengthening of institutions to improve their effectiveness, accountability, and responsiveness.",
      },
    ],
  },
  /** Homepage pillar + `/our-work/research` — placeholder until expanded in Admin → Pages. */
  research: {
    title: "Research",
    subtitle: "Evidence and inquiry",
    description:
      "Placeholder copy for Research. Edit this section in Admin → Pages → our-work-research (or the main Our Work JSON for titles). Describe flagship studies, fellows, and knowledge products.",
  },
  training: {
    title: "Capacity Building",
    subtitle: "Capacity building",
    description:
      "Placeholder copy for Training. Edit in Admin → Pages → our-work-training. Highlight workshops, fellowships, and tailored learning for practitioners.",
  },
  partnership: {
    title: "Partnership",
    subtitle: "Collaborate with us",
    description:
      "Placeholder copy for Partnership. Edit in Admin → Pages → our-work-partnership. Outline how institutions, donors, and peers co-create programmes with AGC.",
  },
};

export type OurWorkPageContent = typeof workContent;

export const getInvolvedContent = {
  title: "Get Involved",
  description: "Make a Difference",
  intro:
    "There are many ways to get involved with our work. Whether you're a researcher, policymaker, or concerned citizen, we welcome your participation.",
  bottomSection: {
    getInTouch: {
      title: "Get in Touch",
      text: "Ready to get involved? We'd love to hear from you. Contact us to discuss how you can contribute to our mission.",
    },
    upcomingEvents: {
      title: "Upcoming Events",
      description: "Join us at our upcoming events and workshops",
      events: [
        {
          startDate: "2025-08-12",
          endDate: "2025-08-14",
          label: "August 12, 2025 - August 14, 2025",
          registerHref: "/events",
        },
        {
          startDate: "2026-03-03",
          endDate: "2026-03-06",
          label: "March 3, 2026 - March 6, 2026",
          registerHref: "/events",
        },
        {
          startDate: "2026-03-28",
          endDate: "2026-03-30",
          label: "March 28, 2026 - March 30, 2026",
          registerHref: "/events",
        },
      ],
    },
  },
  opportunities: [
    {
      id: "volunteer",
      title: "Volunteer",
      description:
        "Contribute your time and skills to support our research and advocacy efforts.",
      items: [
        "Research assistance",
        "Event coordination",
        "Communications support",
        "Administrative tasks",
      ],
      cta: "Apply to Volunteer",
      href: "/applications",
      pageHref: "/get-involved/volunteer",
    },
    {
      id: "join-us",
      title: "Work with us",
      description:
        "Join our team and contribute to advancing governance excellence across Africa.",
      items: [
        "Research opportunities",
        "Policy development",
        "Program management",
        "Capacity building",
      ],
      cta: "Work with us",
      href: "/contact",
      pageHref: "/get-involved/join-us",
    },
  ],
  volunteer: {
    title: "Volunteer",
    subtitle:
      "Contribute your time and skills to advance governance excellence",
    intro:
      "Volunteers play a vital role in supporting our research, advocacy, and capacity-building initiatives. Whether you bring expertise in policy analysis, event coordination, communications, or administration, we welcome your contribution.",
    description:
      "Through volunteering with the Africa Governance Centre, you will work alongside researchers and policymakers to advance good governance practices across the continent. Our volunteers gain hands-on experience in evidence-based policy development and contribute to meaningful change.",
    items: [
      "Research assistance",
      "Event coordination",
      "Communications support",
      "Administrative tasks",
    ],
    cta: "Apply to Volunteer",
    applicationHref: "/applications",
  },
  partnership: {
    title: "Partnerships",
    subtitle: "Collaborate with us on research, events, and policy initiatives",
    intro:
      "Partnerships are central to AGC's approach. We collaborate with regional and international institutions, development partners, academia, civil society, and the private sector to advance shared governance objectives.",
    description:
      "Through these collaborations, we leverage complementary expertise, expand our reach, and support coordinated responses to governance challenges across different contexts.",
    items: [
      "Research collaboration",
      "Joint events",
      "Policy advocacy",
      "Capacity building",
    ],
    cards: [
      {
        id: 1,
        title: "Strategic institutional partnerships",
        description:
          "AGC collaborates with regional and continental bodies such as ECOWAS and the African Union, as well as international partners including the European Union and UNDP. These partnerships enable us to contribute to high-level policy processes, support regional governance initiatives, and align our work with broader development priorities across Africa.",
      },
      {
        id: 2,
        title: "Multi-stakeholder collaboration platforms",
        description:
          "We create and sustain platforms that bring together governments, political actors, civil society, academia, and the private sector to engage on governance and development challenges. These platforms foster dialogue, shared learning, and coordinated responses to complex issues.",
      },
      {
        id: 3,
        title: "Academic and research collaborations",
        description:
          "AGC works with universities, research institutions, and scholars to strengthen knowledge production and promote evidence-based policy engagement. These collaborations support joint research, publications, and the exchange of ideas across disciplines and regions.",
      },
      {
        id: 4,
        title: "Diplomatic and development engagement",
        description:
          "We engage with the diplomatic community and development partners to facilitate policy dialogue, provide insights on governance trends, and support collaborative initiatives. This engagement helps bridge national, regional, and global perspectives on governance and development.",
      },
    ],
    cta: "Partner With Us",
    contactHref: "/contact",
  },
  joinUs: {
    title: "Work with us",
    subtitle: "Join our team and advance governance excellence across Africa",
    intro:
      "We are always looking for talented individuals who are passionate about governance, policy development, and Africa's economic transformation.",
    description:
      "Our team works on research, policy development, program management, and capacity building. We offer opportunities to contribute to evidence-based governance reforms and to support African nations in establishing effective governance systems.",
    items: [
      "Research opportunities",
      "Policy development",
      "Program management",
      "Capacity building",
    ],
    cta: "Get in Touch",
    contactHref: "/contact",
  },
};

export const contactContent = {
  title: "Get In Touch",
  subtitle: "Connect With Us",
  intro:
    "We welcome inquiries from individuals and organizations interested in our work. Please feel free to reach out to us.",
  formTitle: "Send us a Message",
  formDescription:
    "Fill out the form below and we'll get back to you as soon as possible.",
  formPlaceholders: {
    name: "Your name",
    email: "your.email@africagovernancecentre.org",
    subject: "What is this regarding?",
    message: "Tell us more about your inquiry...",
  },
  submitLabel: "Send Message",
  divisions: [
    { name: "Programs Division", email: "programs@africagovernancecentre.org" },
    {
      name: "Public Relations and Media Division",
      email: "media@africagovernancecentre.org",
    },
  ],
};

export const eventsContent = {
  title: "Upcoming Events",
  description:
    "Discover upcoming events, conferences, and workshops that advance governance excellence across Africa.",
  intro:
    "We convene high-level summits, policy dialogues, workshops, and roundtable discussions. These engagements serve as strategic platforms for policymakers, development partners, civil society, and the public to engage with our research, exchange ideas, and contribute to shaping governance outcomes across the continent.\n\nOur events are designed to foster evidence-based dialogue on critical issues including democratic governance, institutional reform, public policy, and Africa's economic transformation.\n\nOur events feature distinguished speakers and thought leaders from across Africa and beyond, bringing deep expertise and diverse perspectives to the conversations we host.",
  emptyContact:
    "For event inquiries, contact our Programs Division at programs@africagovernancecentre.org.",
  sections: { upcoming: "Upcoming Events", past: "Past Events" },
  /** Schedule grid (Brookings-style) */
  gridHeadings: { upcoming: "Upcoming", past: "Recent Past Events" },
  gridBadges: { upcoming: "Upcoming event", past: "Past event" },
  gridEmpty: {
    upcoming:
      "No upcoming events are scheduled right now. Check back soon or contact our Programs team.",
    past: "Past event summaries will appear here when available.",
  },
  seeAllPastEvents: "See all past events",
  /** `/events` category chips (substring match on event `category` / `event_type`; edit labels in Admin → Pages → events JSON). */
  filterAriaLabel: "Filter events by type",
  eventCategoryFilters: [
    { id: "all", label: "All" },
    { id: "summits", label: "Summits" },
    { id: "high_level_dialogues", label: "High-level dialogues" },
    { id: "roundtable", label: "Roundtable discussion" },
    { id: "seminar", label: "Seminar" },
    { id: "media_engagement", label: "Media engagement" },
    { id: "workshop", label: "Workshop" },
    { id: "webinar", label: "Webinar" },
  ],
  /** Full past-events archive (`/events/past`) */
  pastArchive: {
    title: "Past Events",
    subtitle:
      "Search and browse our archive of workshops, dialogues, and convenings.",
    searchPlaceholder: "Search",
    filterBy: "Filter by",
    eventCheckboxLabel: "Event",
    topicLabel: "Topic",
    regionLabel: "Region",
    expertLabel: "Expert",
    researchLabel: "Research Program",
    dateHeading: "Date",
    dateAll: "All dates",
    date30d: "Past 30 days",
    date6m: "Past 6 months",
    date1y: "Last year",
    resultsFoundSuffix: "results found",
    showMore: "Show More",
    resultsAtATime: "results at a time",
    topicEmpty: "No topic categories on these events yet.",
    /** Placeholder for the small search inside Topic / Region dropdowns (Admin → Pages → events). */
    listFilterPlaceholder: "Filter list…",
    filterComingSoon:
      "No location or venue text was found on these archived events. Add location or venue fields on events in Admin to build the region list.",
  },
  /** Public registration page (`/events/register/[slug]`) — Brookings-style stack */
  registerToAttendHeading: "Register to attend in person",
  locationLabel: "Location:",
  buttons: {
    registerNow: "Register Now",
    viewMore: "View More",
    viewDetails: "View Details",
    viewEvent: "View Event",
  },
  badges: { upcoming: "upcoming", pastEvent: "Past Event" },
};

/** Fallback events when CMS returns no items */
export const fallbackEvents = [
  {
    id: 1,
    status: "published",
    title: "Our Programs Description",
    slug: "our-programs-description",
    description:
      "Join us for our flagship programs designed to advance governance excellence across Africa.",
    location: "Nairobi, Kenya",
    start_date: "2026-03-28",
    end_date: "2026-03-30",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "training",
  },
  {
    id: 2,
    status: "published",
    title: "Accra Declaration Implementation Workshop",
    slug: "accra-declaration-implementation-workshop-2026",
    description:
      "A working session for partners and practitioners on translating the Accra Declaration into measurable governance reforms.",
    location: "Accra, Ghana",
    start_date: "2026-04-15",
    end_date: "2026-04-17",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "workshop",
  },
  {
    id: 3,
    status: "published",
    title: "Research & Policy Fellows Colloquium",
    slug: "research-policy-fellows-colloquium-2026",
    description:
      "Fellows present policy briefs and research on governance, institutions, and inclusive development—with discussants from government and civil society.",
    location: "Virtual / Accra",
    start_date: "2026-05-20",
    end_date: "2026-05-22",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "forum",
  },
  {
    id: 4,
    status: "published",
    title: "African Political Parties Summit 2025",
    slug: "african-political-parties-summit-2025",
    description:
      "The premier continental political convening bringing together heads of state, political party leaders, and key stakeholders to advance democratic governance across Africa.",
    location: "Accra",
    start_date: "2025-08-12",
    end_date: "2025-08-14",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "app_summit",
  },
  {
    id: 5,
    status: "published",
    title: "AFRICA WOMEN POLITICAL LEADERSHIP SUMMIT",
    slug: "africa-women-political-leadership-summit",
    description:
      "The Africa Governance Centre developed the Africa Women Political Leadership Summit (AWPLS) with the goal of empowering women leaders and advancing gender-inclusive governance across the continent.",
    location: "Nairobi, Kenya",
    start_date: "2026-03-05",
    end_date: "2026-03-08",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "summit",
  },
  {
    id: 6,
    status: "published",
    title: "East Africa Governance Dialogue 2024",
    slug: "east-africa-governance-dialogue-2024",
    description:
      "Regional dialogue on electoral integrity, party systems, and inclusive participation—with policymakers and practitioners from across the East African Community.",
    location: "Kigali, Rwanda",
    start_date: "2024-11-18",
    end_date: "2024-11-20",
    image: "/uploads/placeholder.svg",
    link: "/events",
    category: "dialogue",
  },
];

export const newsContent = {
  title: "Latest News",
  subtitle:
    "Stay updated with the latest news, insights, and developments from Africa Governance Centre.",
  intro: "Stay up-to-date with our latest news and initiatives.",
  filters: {
    allCategories: "All Categories",
    allTags: "All Tags",
    filterBy: "Filter by",
    category: "Category",
    tag: "Tag",
    noResults: "No news found for this filter.",
    /** News index toolbar (listing layout) */
    filterLabel: "Filter:",
    textSearch: "Text search",
    theme: "Theme",
    region: "Region",
    country: "Country",
    programme: "Programme",
    reset: "Reset",
    previous: "Previous",
    next: "Next",
    allOption: "All",
    noMatchesFiltered: "No news matches these filters. Try adjusting or reset.",
  },
  /** Article detail page (sidebar + related grid) */
  articleDetail: {
    relatedHeading: "Related News",
    programmeLabel: "Programme",
    tagsLabel: "Tags",
  },
};

/** @deprecated Prefer `getSiteTaxonomy()` / `defaultNewsCategoryOptions` — kept for backwards-compatible imports */
export { defaultNewsCategoryOptions as newsCategories } from "./taxonomy-defaults";

/** @deprecated Prefer `getSiteTaxonomy().newsTags` / `defaultNewsTagOptions` */
export { defaultNewsTagOptions as newsTags } from "./taxonomy-defaults";

/** Fallback news when CMS returns no items (e.g. CMS not configured or no published news) */
export const fallbackNews = [
  {
    id: 1,
    status: "published",
    title:
      "Africa Governance Centre Deepens Engagement with Algerian Political Parties",
    slug: "agc-deepens-engagement-algerian-political-parties",
    categories: ["appi", "events"],
    author: "Africa Governance Centre",
    tags: ["political-parties", "governance", "algeria"],
    excerpt:
      "The Africa Governance Centre has advanced its continental outreach under the African Political Parties Initiative (APPI) with a series of high-level consultations in Algeria.",
    content: `<p>The Africa Governance Centre has advanced its continental outreach under the African Political Parties Initiative (APPI) with a series of high-level consultations in Algeria. The Chair of AGC's Executive Council, Benedicta Lasi Esq., led the mission to Algiers, where she met with the leaders and national executive committee members of three of the country's most significant political parties: the National Liberation Front (FLN), Front El Moustakbal, and the Movement of Society for Peace (MSP). The visit formed part of APPI's broader stakeholder consultation process, which seeks to strengthen political institutions, promote inclusive leadership, and support parties across Africa in contributing more effectively to governance and development.</p>
<p>Algeria holds a special place in Africa's political history and its contemporary governance landscape. The FLN's role in the country's independence struggle provided inspiration to liberation movements across the continent, and its continuing presence as Algeria's largest political force has made it a central pillar of governance. Alongside it, parties such as Front El Moustakbal reflect the drive for political renewal and inclusivity, while opposition movements like the MSP broaden the scope of dialogue and ensure that multiple perspectives are represented in national life. This diversity of traditions made Algeria an important setting for APPI's consultations, creating space to engage with institutions that reflect both continuity and reform within political systems.</p>
<p>In her consultations with the FLN, Ms. Lasi engaged Abdelkrim Benmbarek and members of the national executive on the party's institutional role and its enduring influence in Algeria's political life. With Front El Moustakbal, led by Fateh Boutbigh, the dialogue focused on renewal and inclusivity, reflecting the party's emphasis on youth participation and broader citizen engagement. In discussions with the MSP, Ms. Lasi met with Abdelaali Hassani Cherif and senior members of the executive. These consultations centred on the role of political parties in advancing Africa's development agenda, while also underlining the need to expand opportunities for youth and women within political institutions. Across all three meetings, a unifying theme was the recognition that political parties have a vital role to play in Africa's development and economic transformation, positioning themselves as institutions that connect governance with inclusive growth and long-term progress.</p>
<p>The discussions reaffirmed APPI's central objectives. They highlighted the need for political parties to strengthen their internal systems so that they remain credible and effective between electoral cycles. They also drew attention to the urgency of inclusive leadership, noting that Africa's demographic realities require greater representation of women and young people in decision-making. Dialogue was emphasised as a means of fostering stability and cooperation across political traditions, while national development planning was highlighted as an area where parties can provide continuity and policy direction. These themes echoed the commitments adopted at the African Political Parties Summit held in Accra in August 2025, while the Algerian consultations offered a national perspective to enrich the continental dialogue.</p>
<p>A highlight of the mission was Ms. Lasi's Keynote Address at the Summer University, organised by Front El Moustakbal and held at Oran University. The event brought together party leaders, national executives, scholars, and youth representatives for an exchange of ideas on the role of political parties in governance and policy development. In her address, Ms. Lasi emphasised that political institutions must rise above short-term competition for power to become enduring actors in national life, shaping long-term governance and development. "Political parties must not be reduced to instruments of electoral competition," she said. "They must evolve as enduring institutions of the state, capable of guiding transformation, safeguarding the public interest, and shaping national development strategies that extend beyond political cycles." Her keynote prompted reflection among participants on how parties could strengthen their policy capacity, embed evidence-based research into governance, and contribute to continuity in development planning.</p>
<p>The consultations concluded with a shared understanding of the importance of continued exchanges. These engagements form part of APPI's broader continental outreach.</p>`,
    date_created: "2025-09-19T00:00:00Z",
    date_published: "2025-09-19T00:00:00Z",
  },
  {
    id: 2,
    status: "published",
    title: "Summary Report of the African Political Parties Summit (APPS) 2025",
    slug: "apps-summary-report-2025",
    categories: ["appi", "reports", "events"],
    author: "Africa Governance Centre",
    tags: ["political-parties", "summit", "accra-declaration"],
    excerpt:
      "The Summary Report of the 2025 African Political Parties Summit is now available and can be downloaded.",
    downloadResources: [
      {
        label: "Download APPS 2025 Summary Report (PDF)",
        description:
          "Full summary report from the African Political Parties Summit in Accra.",
        href: "/uploads/documents/apps-2025-summary-report.pdf",
      },
    ],
    content: `<p>The Summary Report of the 2025 African Political Parties Summit is now available and can be downloaded.</p>
<p>The African Political Parties Summit (APPS), held from 12–14 August at the Accra International Conference Centre, marked a significant milestone in advancing political governance and party development across the continent.</p>
<p>Building on the Africa Governance Centre's African Political Parties Initiative, which was launched by President John Dramani Mahama on 7 March 2025, the summit convened over 700 delegates from 30 countries and 48 political parties to explore strategies for aligning party systems with Africa's economic transformation agenda.</p>
<p>The deliberations culminated in the adoption of the Accra Declaration, a landmark commitment by political parties to foster collaboration and institutional reform in Africa's democratic journey.</p>
<p>The Summary Report of the Summit is now available and can be downloaded below.</p>`,
    date_created: "2025-09-09T00:00:00Z",
    date_published: "2025-09-09T00:00:00Z",
  },
  {
    id: 3,
    status: "published",
    title: "Call for Applications: AGC Research and Policy Fellows",
    slug: "call-applications-agc-fellows",
    categories: ["announcements", "fellowships"],
    author: "Africa Governance Centre",
    tags: ["fellows", "research", "governance"],
    excerpt:
      "The Africa Governance Centre (AGC) is pleased to announce its call for Research and Policy Fellows, designed to engage leading scholars, policy experts, and thought leaders in advancing governance innovation across Africa.",
    downloadResources: [
      {
        label: "Call for fellows — application pack (PDF)",
        description:
          "Scope, eligibility, and how to apply for the Research and Policy Fellows programme.",
        href: "/uploads/documents/agc-research-policy-fellows-call.pdf",
      },
    ],
    content: `<p>The Africa Governance Centre (AGC) is pleased to announce its call for Research and Policy Fellows, designed to engage leading scholars, policy experts, and thought leaders in advancing governance innovation across Africa.</p>
<h2>What to expect</h2>
<p>This opportunity provides a dynamic platform for contributing to evidence-based policymaking, institutional reform, and strategic governance initiatives. Fellows will work closely with AGC teams and partners on flagship projects such as, the African Political Parties Initiative, Africa Governance Review, High-level expert roundtables, Targeted policy advisory efforts.</p>
<p>Click on the download link below for information on the application process.</p>`,
    date_created: "2025-09-02T00:00:00Z",
    date_published: "2025-09-02T00:00:00Z",
  },
  {
    id: 4,
    status: "published",
    title:
      "Africa Governance Centre Calls for Peaceful Participation in Akwatia By-Election",
    slug: "agc-calls-peaceful-akwatia-byelection",
    categories: ["announcements", "elections"],
    author: "Africa Governance Centre",
    tags: ["elections", "ghana", "governance"],
    excerpt:
      "As indigenes of Akwatia go to the polls for the parliamentary by-election in the Akwatia Constituency on Tuesday, September 2, 2025, the Africa Governance Centre (AGC) urges all stakeholders to uphold peace, tolerance, and democratic integrity throughout the electoral process.",
    content: `<p>As indigenes of Akwatia go to the polls for the parliamentary by-election in the Akwatia Constituency on Tuesday, September 2, 2025, the Africa Governance Centre (AGC) urges all stakeholders, political parties, security agencies, civil society, media, and citizens to uphold peace, tolerance, and democratic integrity throughout the electoral process.</p>
<p><strong>Accra, Ghana – September 1, 2025</strong> As indigenes of Akwatia go to the polls for the parliamentary by-election in the Akwatia Constituency on Tuesday, September 2, 2025, the Africa Governance Centre (AGC) urges all stakeholders, political parties, security agencies, civil society, media, and citizens to uphold peace, tolerance, and democratic integrity throughout the electoral process.</p>
<p>Akwatia, a historically competitive constituency in the Eastern Region, has become a focal point of national attention due to heightened political tensions and symbolic stakes for both the ruling National Democratic Congress (NDC) and the opposition New Patriotic Party (NPP). While political enthusiasm is welcome in any democracy, recent reports of inflammatory rhetoric, vote-buying allegations, and threats of violence have raised concerns about the safety and credibility of the polls. The AGC commends the Ghana Police Service for deploying 5,500 officers and initiating community assurance patrols to foster public confidence and deter electoral violence. We also recognize the Electoral Commission's commitment to transparency, logistical readiness, and peaceful conduct. However, peace is not the responsibility of institutions alone.</p>
<p><strong>We call on:</strong></p>
<ul>
<li>Political parties and candidates to refrain from provocative language, vigilante mobilization, and any form of electoral malpractice.</li>
<li>Media outlets to promote verified, non-sensational reporting and amplify peace messaging.</li>
<li>Civil society and religious leaders to use their platforms to encourage restraint, tolerance, and civic responsibility.</li>
<li>Voters and citizens to reject violence, report suspicious activities, and participate peacefully in shaping their future.</li>
</ul>
<p>The Akwatia by-election is more than a contest for a parliamentary seat. It is a test of Ghana's democratic maturity. Let us prove, once again, that Ghana remains a beacon of peace and democratic resilience in Africa.</p>
<p><strong>Signed,</strong><br>Moonn Cyriacus<br>Director of Communications<br>Africa Governance Centre</p>`,
    date_created: "2025-09-01T00:00:00Z",
    date_published: "2025-09-01T00:00:00Z",
  },
];

/** Fallback publications when CMS returns no items */
export const fallbackPublications = [
  {
    id: 1,
    status: "published",
    title: "African Political Parties Summit 2025 – Summary Report",
    slug: "apps-summary-report-2025",
    excerpt:
      "The Summary Report of the 2025 African Political Parties Summit, held in Accra, Ghana. The summit convened over 700 delegates from 30 countries and 48 political parties.",
    types: ["report"],
    file: "/uploads/documents/apps-2025-summary-report.pdf",
    date_published: "2025-09-09T00:00:00Z",
    author: "Africa Governance Centre",
  },
  {
    id: 2,
    status: "published",
    title: "Governance and Economic Transformation in Africa",
    slug: "governance-economic-transformation-africa",
    excerpt:
      "A policy brief examining the linkages between governance reforms and sustainable economic development across the continent.",
    types: ["policy_brief"],
    date_published: "2025-08-15T00:00:00Z",
    author: "AGC Research Team",
  },
  {
    id: 3,
    status: "published",
    title: "Political Party Institutional Capacity – Research Findings",
    slug: "political-party-institutional-capacity",
    excerpt:
      "Research findings on institutional capacity building for political parties in Africa, based on APPI stakeholder consultations.",
    types: ["research"],
    date_published: "2025-07-20T00:00:00Z",
    author: "Africa Governance Centre",
  },
];

export const publicationsContent = {
  title: "Publications",
  subtitle:
    "Reports, policy briefs, and research from the Africa Governance Centre.",
  intro:
    "Our publications contribute to evidence-based policymaking and governance dialogue across Africa.",
  /** Publication detail page (sidebar + related grid), aligned with `newsContent.articleDetail` */
  articleDetail: {
    relatedHeading: "Related publications",
    typeLabel: "Publication type",
    authorLabel: "Author",
  },
  /** Index listing toolbar (aligned with `newsContent.filters`) */
  filters: {
    filterLabel: "Filter:",
    textSearch: "Text search",
    publicationType: "Publication type",
    reset: "Reset",
    previous: "Previous",
    next: "Next",
    allOption: "All",
    noMatchesFiltered:
      "No publications match these filters. Try adjusting or reset.",
    noResults: "No publications found for this filter.",
  },
};

export const volunteerFormFields = {
  personalInfo: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Phone Number", type: "tel", required: false },
    {
      name: "position",
      label: "Current Position",
      type: "text",
      required: false,
    },
    {
      name: "organization",
      label: "Organization",
      type: "text",
      required: false,
    },
    { name: "country", label: "Country", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
  ],
  experience: [
    {
      name: "experience",
      label: "Relevant Experience",
      type: "textarea",
      required: false,
    },
    {
      name: "skills",
      label: "Skills & Expertise",
      type: "textarea",
      required: false,
    },
  ],
  motivation: [
    {
      name: "motivation",
      label: "Why do you want to volunteer with AGC?",
      type: "textarea",
      required: true,
    },
    {
      name: "availability",
      label: "Availability",
      type: "select",
      required: false,
    },
  ],
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/our-work", label: "Our Work" },
  { href: "/app-summit", label: "APP Summit" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

/** Our Work header dropdown (desktop + mobile drawer). Main hub still uses tabs on `/our-work`. */
export const ourWorkSubLinks: { href: string; label: string }[] = [
  { href: "/our-work/programs", label: "Programs" },
  { href: "/our-work/projects", label: "Projects" },
  { href: "/our-work/advisory", label: "Advisory" },
  { href: "/our-work/research", label: "Research" },
  { href: "/publications", label: "Publications" },
];

export const getInvolvedSubLinks = [
  { href: "/get-involved/volunteer", label: "Volunteer" },
  { href: "/get-involved/partnership", label: "Partnership" },
  { href: "/get-involved/join-us", label: "Work with us" },
];

export const footerLinks = {
  quickLinks: [
    { href: "/about", label: "About Us" },
    { href: "/our-work", label: "Our Work" },
    { href: "/events", label: "Events" },
    { href: "/app-summit", label: "APP Summit" },
    { href: "/news", label: "News" },
    { href: "/publications", label: "Publications" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};
