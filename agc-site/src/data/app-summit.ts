/**
 * APPS 2025 - African Political Parties Summit
 * Content from africagovernancecentre.org
 */

export const appSummitContent = {
  title: "African Political Parties Summit 2025",
  subtitle: "Strengthening Democratic Governance",
  /** Editable via Admin → Page Content → app-summit (empty = hide) */
  aboutSectionEyebrow: "Continental convening",
  aboutSectionHeading: "About APP Summit 2025",
  detailLabelDate: "Date",
  detailLabelLocation: "Location",
  detailLabelParticipants: "Participants",
  programmeEyebrow: "Programme",
  /** When false, the Programme / APPS agenda section (day tabs & schedule) is hidden on the public site. */
  programmeAgendaVisible: true,
  /** Prefix before tab number, e.g. "Day " + 1 */
  dayTabPrefix: "Day ",
  contactSectionCtaLabel: "Contact us",
  heroImageAlt: "APP Summit",
  intro:
    "The African Political Parties Summit (APPS) is conceptualized as the flagship annual convening designed to provide a high-level continental platform for dialogue, collaboration, and capacity building among political actors. The Summit aims to strengthen democratic institutions, promote inter-party cooperation, and advance inclusive and accountable governance across Africa.",
  /** Purpose & impact — editable via Admin → Page Content → app-summit (empty heading + intro hides section). */
  purposeImpact: {
    /** Optional line above the heading (empty = omit). */
    eyebrow: "",
    heading: "Purpose and Impact",
    intro:
      "The Summit serves as a continental forum to review political progress, align priorities, issue joint declarations, and consolidate reform commitments.",
    pillars: [
      {
        title: "Political Reform",
        description:
          "Shape collective agendas for political reform and institutional strengthening across African political systems.",
      },
      {
        title: "Policy Innovation",
        description:
          "Foster policy innovation and knowledge exchange between political parties and governance institutions.",
      },
      {
        title: "Inter-Party Cooperation",
        description:
          "Build bridges between political parties and facilitate cross-party collaboration on continental priorities.",
      },
    ],
  },
  /** Inaugural edition — venue, dates, opening, participants (editable in Admin → Page Content → app-summit). */
  inauguralParagraph:
    "The inaugural edition of the APPS was held from August 10-12, 2025 at the Accra International Conference Centre. It brought together a distinguished and diverse group of participants, including Heads of State, Prime Ministers, Ministers of State and Senior Party Officials from across the continent. The Summit was officially opened by H.E. Jane Naana opoku-Agyemang, Vice President of Ghana and the President of Sao Tome H.E. Carlos Manuel Vila Nova.",
  details: {
    date: "August 10-12, 2025",
    location: "Accra International Conference Centre, Ghana",
    participants: "Heads of State, Ministers & senior party officials",
  },
  registration: {
    title: "Secure your spot",
    subtitle: "Secure your spot at APP Summit 2026",
    footnote:
      "Sponsorship prospectus available. To partner with APPS 2026, contact the Secretariat via the Programs inbox.",
    cta: "Register Now",
    href: "/contact",
  },
  contactNote:
    "For summit inquiries, partnerships, or registration, please contact our Programs Division.",
  agenda: {
    title: "APPS 2025 AGENDA",
    subtitle: "Schedule",
    days: [
      {
        day: 1,
        date: "Tuesday, August 12, 2025",
        sessions: [
          { time: "9:00am – 10:30am", title: "Official Opening Ceremony" },
          {
            time: "10:45am – 12:00pm",
            title: "Presidential Panel",
            topic:
              "The Role of Political Parties in Shaping Development and Economic Transformation in Africa.",
          },
          {
            time: "12:00pm – 1:15pm",
            title: "Main Plenary",
            topic: "Political Parties and National Development Planning.",
          },
          { time: "1:15pm – 2:15pm", title: "Lunch Break" },
          {
            time: "2:15pm – 3:30pm",
            title: "Main Plenary",
            topic:
              "Political Party Development and Policy Making: Building Partnerships with Think Tanks and Academia.",
          },
          {
            time: "3:30pm – 5:00pm",
            title: "Parallel Sessions",
            topics: [
              "Session 5A: Inaugural African Youth in Politics Forum.",
              "Session 5B: High-Level Forum – Electoral Systems, Inclusion, and Institutional Legitimacy.",
              "Session 5C: AGC and Political Parties Leadership Roundtable.",
            ],
          },
          {
            time: "5:00pm – 5:30pm",
            title: "Reflective & Summative Remarks",
            topic: "By H.E. Bola Tinubu, Chaired by H.E. Azali Assoumani.",
          },
          {
            time: "7:00pm – 9:00pm",
            title: "Evening State Reception",
            topic: "By Invitation Only.",
          },
        ],
      },
      {
        day: 2,
        date: "Wednesday, August 13, 2025",
        sessions: [
          {
            time: "9:00am – 10:30am",
            title: "Keynote Plenary",
            topic:
              "Political Parties as Catalysts of AfCFTA Implementation: Advancing Industrialization and Infrastructure for Economic Transformation.",
          },
          {
            time: "10:30am – 12:15pm",
            title: "Reform Co-Creation Labs",
            topic:
              "Structuring the Political Reform Agenda for Political Renewal.",
          },
          {
            time: "12:30pm – 1:15pm",
            title: "The Compact Session",
            topic:
              "Consolidating Reform Commitments for the APPS Implementation Framework.",
          },
          { time: "1:15pm – 2:15pm", title: "Lunch Break" },
          {
            time: "2:15pm – 3:15pm",
            title: "Main Plenary: Global Lessons",
            topic: "Global Lessons in Political Reform.",
          },
          {
            time: "3:15pm – 5:15pm",
            title: "Political Innovation Showcase",
            topic: "Models That Move Politics.",
          },
          {
            time: "5:15pm – 6:00pm",
            title: "Reflective & Summative Remarks",
            topic:
              "By H.E. Felix-Antoine T. Tshisekedi, Chaired by H.E. Évariste Ndayishimiye.",
          },
          { time: "7:00pm – 10:00pm", title: "Official Networking Dinner" },
        ],
      },
      {
        day: 3,
        date: "Thursday, August 14, 2025",
        sessions: [
          {
            time: "9:00am – 9:15am",
            title: "Opening Segment",
            topic:
              "Day Three Framing Brief by Rt. Hon. Alban K. S. Bagbin (Speaker of Parliament, Ghana).",
          },
          {
            time: "9:15am – 10:45am",
            title: "Futures Forum",
            topic: "Reimagining the Political Party of Tomorrow.",
          },
          {
            time: "10:45am – 12:00pm",
            title: "High-Level Governance Forum",
            topic:
              "Democracy Under Pressure – Safeguarding Constitutional Order and Political Stability.",
          },
          {
            time: "12:00pm – 1:00pm",
            title: "Presentation and Adoption",
            topic: "Presentation and Adoption of the APPS Framework.",
          },
          {
            time: "1:00pm – 2:00pm",
            title: "Closing Ceremony",
            topic: "Summit Declaration and Closing Remarks.",
          },
          {
            time: "2:00pm – 3:00pm",
            title: "Summit Closing Lunch Reception",
            topic: "Networking.",
          },
          {
            time: "3:00pm – 6:30pm",
            title: "Guided Visit",
            topic: "Kwame Nkrumah Memorial Park.",
          },
        ],
      },
    ],
  },
};

export type AppSummitCmsContent = typeof appSummitContent;
