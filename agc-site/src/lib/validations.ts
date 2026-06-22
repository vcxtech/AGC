import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const subscribeTopics = [
  "AGC insights",
  "Events and Convenings",
  "Governance & Policy Research",
  "Global Affairs Briefings",
] as const;

export const subscribeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Valid email is required"),
  jobTitle: z.string().min(1, "Job title is required").max(150),
  company: z.string().min(1, "Company/Organisation is required").max(200),
  sector: z.string().min(1, "Sector is required").max(120),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  topics: z.array(z.enum(subscribeTopics)).default([]),
  website: z.string().max(0).optional(),
});

export const applicationSchema = z.object({
  applicationType: z
    .enum(["volunteer", "staff", "fellow"])
    .optional()
    .default("volunteer"),
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(50).optional(),
  position: z.string().max(200).optional(),
  organization: z.string().max(200).optional(),
  country: z.string().min(1, "Country is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  experience: z.string().max(2000).optional(),
  skills: z.string().max(2000).optional(),
  motivation: z.string().min(1, "Motivation is required").max(2000),
  availability: z.string().max(50).optional(),
});

export const partnershipInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  organization: z.string().max(200).optional(),
  focusArea: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const joinUsInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(50).optional(),
  organization: z.string().max(200).optional(),
  interestArea: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const eventRegistrationSchema = z.object({
  eventSlug: z.string().min(1, "Event is required").max(200),
  eventId: z.number().optional(),
  eventTitle: z.string().min(1).max(500),
  eventStartDate: z.string(),
  eventEndDate: z.string().optional(),
  eventLocation: z.string().max(200).optional(),
  registrationDeadline: z.string().optional(),
  capacity: z.number().optional(),
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(50).optional(),
  organization: z.string().max(200).optional(),
  dietaryReqs: z.string().max(500).optional(),
});

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().max(255).optional(),
  shortDescription: z.string().max(50000).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  image: z.string().max(500).optional(),
  link: z.string().max(255).optional(),
  category: z.string().max(255).optional(),
  eventType: z.string().max(100).optional(),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().max(500).optional(),
  capacity: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return undefined;
      const n = parseInt(v, 10);
      return isNaN(n) ? undefined : n;
    }),
  registrationDeadline: z.string().optional(),
  status: z.enum(["draft", "published"]),
  /** Client-serialized JSON array of { time?, title, description? } */
  agendaJson: z.string().max(200000).optional(),
});

export const newsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().max(255).optional(),
  image: z.string().max(500).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().optional(),
  author: z.string().max(255).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  socialFacebook: z.string().max(2000).optional(),
  socialX: z.string().max(2000).optional(),
  socialLinkedin: z.string().max(2000).optional(),
  socialInstagram: z.string().max(2000).optional(),
  socialEmail: z.string().max(2000).optional(),
  status: z.enum(["draft", "published"]),
  datePublished: z.string().optional(),
});

export const teamFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  role: z.string().max(255).optional(),
  bio: z.string().max(5000).optional(),
  image: z.string().max(500).optional(),
  section: z
    .enum([
      "executive_council",
      "advisory_board",
      "management_team",
      "fellows",
      "associate_fellows",
    ])
    .optional(),
  order: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  status: z.enum(["draft", "published"]),
});

export const publicationFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().max(255).optional(),
  excerpt: z.string().max(50000).optional(),
  content: z.string().max(200000).optional(),
  types: z.array(z.string()).optional(),
  file: z.string().max(500).optional(),
  image: z.string().max(500).optional(),
  datePublished: z.string().optional(),
  author: z.string().max(255).optional(),
  status: z.enum(["draft", "published"]),
});

export const programFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(50000).optional(),
  image: z.string().max(500).optional(),
  order: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  status: z.enum(["draft", "published"]),
});

export const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(50000).optional(),
  image: z.string().max(500).optional(),
  order: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  status: z.enum(["draft", "published"]),
});

export const advisoryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  image: z.string().max(500).optional(),
  order: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  status: z.enum(["draft", "published"]),
});

export const partnerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  logo: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
  order: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "" || !v) return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  status: z.enum(["draft", "published"]),
});

export const pageContentFormSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100),
  title: z.string().max(255).optional(),
  mainTitle: z.string().max(255).optional(),
  status: z.enum(["draft", "published"]),
  heroSubtitle: z.string().max(1000).optional(),
  heroTitle: z.string().max(255).optional(),
  intro: z.string().max(5000).optional(),
  description: z.string().max(10000).optional(),
  mission: z.string().max(5000).optional(),
  objectivesTitle: z.string().max(255).optional(),
  objectivesContent: z.string().max(10000).optional(),
  objectivesPrinciples: z.string().max(10000).optional(),
  objectivesAgenda2063: z.string().max(10000).optional(),
  contentJson: z.string().max(500000).optional(),
});

export const siteSettingsFormSchema = z.object({
  name: z.string().min(1, "Site name is required").max(255),
  tagline: z.string().min(1, "Tagline is required").max(1000),
  logo: z.string().max(500).optional(),
  footerLogo: z.string().max(500).optional(),
  phone: z.string().min(1, "Phone is required").max(100),
  address: z.string().min(1, "Address is required").max(500),
  officeHours: z.string().min(1, "Office hours are required").max(255),
  emailPrograms: z.string().email("Programs email must be valid"),
  emailMedia: z.string().email("Media email must be valid"),
  emailInfo: z.string().email("Info email must be valid"),
  socialTwitter: z.string().max(500).optional(),
  socialLinkedin: z.string().max(500).optional(),
  socialInstagram: z.string().max(500).optional(),
  socialFacebook: z.string().max(500).optional(),
  languages: z.string().max(5000).optional(),
  skipToContentLabel: z.string().max(120).optional(),
  headerContactCta: z.string().max(80).optional(),
  headerSearchAriaLabel: z.string().max(80).optional(),
  mobileDrawerAriaLabel: z.string().max(120).optional(),
  mobileDrawerCloseAriaLabel: z.string().max(80).optional(),
  mobileSearchButtonLabel: z.string().max(120).optional(),
  mobileDrawerContactCta: z.string().max(80).optional(),
  mobileLanguageEyebrow: z.string().max(80).optional(),
  footerContactHeading: z.string().max(80).optional(),
  footerQuickLinksHeading: z.string().max(80).optional(),
  footerOurWorkHeading: z.string().max(80).optional(),
  footerGetInvolvedLabel: z.string().max(80).optional(),
  footerRightsReserved: z.string().max(120).optional(),
  footerAdminLabel: z.string().max(80).optional(),
  chromeNavJson: z.string().max(50000).optional(),
  chromeBottomNavJson: z.string().max(10000).optional(),
  chromeFooterQuickLinksJson: z.string().max(20000).optional(),
  chromeFooterLegalJson: z.string().max(10000).optional(),
  chromeFooterWorkThumbsJson: z.string().max(20000).optional(),
  searchDialogAriaLabel: z.string().max(120).optional(),
  searchPlaceholder: z.string().max(200).optional(),
  searchCloseAriaLabel: z.string().max(80).optional(),
  searchLoading: z.string().max(80).optional(),
  searchEmptyNoQuery: z.string().max(200).optional(),
  searchEmptyNoResults: z.string().max(200).optional(),
  searchTypeEvent: z.string().max(80).optional(),
  searchTypeNews: z.string().max(80).optional(),
  searchTypePublication: z.string().max(80).optional(),
  newsletterHeading: z.string().max(120).optional(),
  newsletterDescription: z.string().max(500).optional(),
  newsletterPlaceholder: z.string().max(120).optional(),
  newsletterEmailAriaLabel: z.string().max(120).optional(),
  newsletterSubmit: z.string().max(80).optional(),
  newsletterSubmitLoading: z.string().max(20).optional(),
  newsletterSubscribed: z.string().max(80).optional(),
  newsletterSuccessMessage: z.string().max(200).optional(),
  newsletterErrorGeneric: z.string().max(200).optional(),
  bcHome: z.string().max(120).optional(),
  bcAbout: z.string().max(120).optional(),
  bcOurWork: z.string().max(120).optional(),
  bcPrograms: z.string().max(120).optional(),
  bcProjects: z.string().max(120).optional(),
  bcAdvisory: z.string().max(120).optional(),
  bcResearch: z.string().max(120).optional(),
  bcTraining: z.string().max(120).optional(),
  bcOurPartnerships: z.string().max(120).optional(),
  bcGetInvolved: z.string().max(120).optional(),
  bcVolunteer: z.string().max(120).optional(),
  bcPartnership: z.string().max(120).optional(),
  bcJoinUs: z.string().max(120).optional(),
  bcContact: z.string().max(120).optional(),
  bcDonate: z.string().max(120).optional(),
  bcSubscribe: z.string().max(120).optional(),
  bcNews: z.string().max(120).optional(),
  bcEvents: z.string().max(120).optional(),
  bcPublications: z.string().max(120).optional(),
  bcPrivacyPolicy: z.string().max(120).optional(),
  bcTermsOfService: z.string().max(120).optional(),
  bcAppSummit: z.string().max(120).optional(),
  bcTeam: z.string().max(120).optional(),
  bcEventRegister: z.string().max(120).optional(),
});

export const homeSettingsFormSchema = z.object({
  heroEyebrow: z.string().max(255),
  heroTitle: z.string().min(1).max(255),
  heroSubtitle: z.string().max(3000),
  heroCta: z.string().min(1).max(120),
  heroCtaHref: z.string().min(1).max(255),
  heroCtaSecondary: z.string().min(1).max(120),
  heroCtaSecondaryHref: z.string().min(1).max(255),
  heroSliderImages: z.string().max(10000).optional(),
  heroBackgroundVideoSrc: z.string().max(500).optional(),
  homeReachTitle: z.string().min(1).max(255),
  homeReachIntro: z.string().max(50000),
  homeImpactMethodology: z.string().max(50000),
  homePartnerBlurb: z.string().min(1).max(50000),
  impactStats: z.string().max(20000).optional(),
  testimonialQuote: z.string().min(1).max(50000),
  testimonialName: z.string().min(1).max(255),
  testimonialTitle: z.string().min(1).max(255),
  testimonialOrganization: z.string().max(255).optional(),
  testimonialInitials: z.string().min(1).max(10),
  spotlightLabel: z.string().min(1).max(120),
  spotlightHeadline: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().max(255).optional(),
  ),
  spotlightBody: z.string().min(1).max(50000),
  spotlightParagraphs: z.string().max(50000).optional(),
  spotlightName: z.string().min(1).max(255),
  spotlightRole: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().max(255).optional(),
  ),
  spotlightInitials: z.string().max(10).optional(),
  spotlightImage: z.string().max(500).optional(),
  spotlightCtaLabel: z.string().min(1).max(120),
  spotlightCtaHref: z.string().min(1).max(255),
  ctaBandEyebrow: z.string().max(200).optional(),
  ctaBandTitle: z.string().max(600).optional(),
  ctaBandBody: z.string().max(50000).optional(),
  ctaBandImage: z.string().max(500).optional(),
  ctaBandPrimaryCta: z.string().max(120).optional(),
  ctaBandPrimaryHref: z.string().max(255).optional(),
  ctaBandSecondaryCta: z.string().max(120).optional(),
  ctaBandSecondaryHref: z.string().max(255).optional(),
  homeEventsTitle: z.string().max(255).optional(),
  homeNewsTitle: z.string().max(255).optional(),
  homeNewsSubtitle: z.string().max(500).optional(),
  pillarRowTitlePrimary: z.string().max(255).optional(),
  pillarRowDescriptionPrimary: z.string().max(50000).optional(),
  pillarRowTitleSecondary: z.string().max(255).optional(),
  pillarRowDescriptionSecondary: z.string().max(50000).optional(),
  pillarReadMoreLabel: z.string().max(120).optional(),
  pillarImagePrograms: z.string().max(500).optional(),
  pillarImageProjects: z.string().max(500).optional(),
  pillarImageAdvisory: z.string().max(500).optional(),
  pillarImageResearch: z.string().max(500).optional(),
  pillarImageTraining: z.string().max(500).optional(),
  pillarImagePartnership: z.string().max(500).optional(),
});

export const aboutSettingsFormSchema = z.object({
  title: z.string().min(1).max(255),
  heroSubtitle: z.string().min(1).max(1000),
  intro: z.string().max(50000).optional(),
  description: z.string().max(50000).optional(),
  mission: z.string().max(50000).optional(),
  strategicTitle: z.string().max(255).optional(),
  strategicContent: z.string().max(50000).optional(),
  strategicPrinciples: z.string().max(50000).optional(),
  strategicAgenda2063: z.string().max(50000).optional(),
  heroImage: z.string().max(500).optional(),
  aboutSectionEyebrow: z.string().max(120).optional(),
  aboutSectionHeading: z.string().max(255).optional(),
  aboutSectionImage: z.string().max(500).optional(),
  leadParagraphs: z.string().max(12000).optional(),
  deliverySectionHeading: z.string().max(255).optional(),
  partnershipsHeading: z.string().max(255).optional(),
  partnershipsText: z.string().max(50000).optional(),
  deliveryTitle1: z.string().max(255).optional(),
  deliveryBody1: z.string().max(50000).optional(),
  deliveryImage1: z.string().max(500).optional(),
  deliveryTitle2: z.string().max(255).optional(),
  deliveryBody2: z.string().max(50000).optional(),
  deliveryImage2: z.string().max(500).optional(),
  deliveryTitle3: z.string().max(255).optional(),
  deliveryBody3: z.string().max(50000).optional(),
  deliveryImage3: z.string().max(500).optional(),
  deliveryTitle4: z.string().max(255).optional(),
  deliveryBody4: z.string().max(50000).optional(),
  deliveryImage4: z.string().max(500).optional(),
  teamPageTitle: z.string().min(1).max(255),
  teamPageSubtitle: z.string().min(1).max(1000),
  teamHeroImage: z.string().max(500).optional(),
  teamTabsConfig: z.string().max(5000).optional(),
});

export const donationInitializeSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Valid email is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  message: z.string().max(2000).optional(),
  website: z.string().max(0).optional(),
});

export const donationVerifySchema = z.object({
  reference: z.string().min(1).max(100),
});

export const donationSettingsFormSchema = z.object({
  enabled: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  testMode: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  sendReceiptEmail: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  currency: z.string().min(3).max(10),
  currencySymbol: z.string().min(1).max(5),
  presetAmounts: z.string().min(1, "At least one preset amount is required").max(500),
  minAmount: z.coerce.number().positive(),
  maxAmount: z.coerce.number().positive(),
  publicKey: z.string().max(200).optional(),
  channels: z.string().max(200).optional(),
  successMessage: z.string().min(1).max(2000),
  cancelledMessage: z.string().min(1).max(2000),
  unavailableMessage: z.string().min(1).max(2000),
  receiptEmail: z.string().email(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;
export type NewsFormInput = z.infer<typeof newsFormSchema>;
