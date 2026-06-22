/** Default CMS content for `/donate` (Admin → Page Content → donate). */
export type DonatePageContent = {
  title: string;
  subtitle: string;
  heroImage: string;
  intro: string;
  sectionEyebrow: string;
  sectionHeading: string;
  typeQuestion: string;
  typeLabel: string;
  typeDescription: string;
  amountHeading: string;
  otherAmountLabel: string;
  formTitle: string;
  formDescription: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  processingLabel: string;
  successTitle: string;
  successMessage: string;
  footnote: string;
  impactItems: string[];
};

export const donatePageContent: DonatePageContent = {
  title: "Support Our Work",
  subtitle: "Make a Donation",
  heroImage: "/uploads/placeholder.svg",
  intro:
    "Your donation to the Africa Governance Centre helps sustain our independence and impact. Join supporters across Africa and around the world who believe in the power of open dialogue, evidence-based policy, and stronger governance institutions.",
  sectionEyebrow: "Give",
  sectionHeading: "Invest in better governance",
  typeQuestion: "What type of donation would you like to make?",
  typeLabel: "Single donation (Worldwide)",
  typeDescription:
    "Make a secure one-time gift by card. Payments are processed internationally via Paystack — Mastercard, Visa, and other major cards accepted.",
  amountHeading: "How much would you like to give?",
  otherAmountLabel: "Other amount",
  formTitle: "Your details",
  formDescription: "We will send a receipt to the email address you provide.",
  namePlaceholder: "Full name",
  emailPlaceholder: "Email address",
  messagePlaceholder: "Optional message (e.g. in memory of, or directed to a programme)",
  submitLabel: "Donate now",
  processingLabel: "Processing…",
  successTitle: "Thank you for your gift",
  successMessage:
    "Your donation has been received. A receipt will be sent to your email shortly. Your support strengthens governance research, policy dialogue, and capacity building across Africa.",
  footnote:
    "Africa Governance Centre is an independent think tank. Donations support our research, convenings, and policy engagement. For questions about giving, contact programs@africagovernancecentre.org.",
  impactItems: [
    "Evidence-based policy research and publications",
    "High-level governance dialogues and summits",
    "Capacity building for institutions and reform teams",
    "Independent advocacy for democratic governance",
  ],
};
