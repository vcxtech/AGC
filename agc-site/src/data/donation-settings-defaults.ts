/** Default Paystack / donation gateway settings (Admin → Donation settings). */
export const DEFAULT_DONATION_SETTINGS = {
  enabled: true,
  currency: "GHS",
  currencySymbol: "₵",
  presetAmounts: [100, 250, 500, 1000],
  minAmount: 10,
  maxAmount: 500000,
  /** Optional CMS override; env `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` takes precedence when set. */
  publicKey: "",
  testMode: false,
  /** Restrict to card for worldwide single donations. */
  channels: ["card"] as string[],
  successMessage:
    "Thank you — your donation has been received. A receipt will be sent to your email.",
  cancelledMessage: "Payment was cancelled. You can try again when ready.",
  unavailableMessage:
    "Online donations are temporarily unavailable. Please contact secretariat@africagovernancecentre.org.",
  receiptEmail: "programs@africagovernancecentre.org",
  sendReceiptEmail: true,
  /** Shown in admin only — helps configure Paystack dashboard webhook. */
  webhookNote:
    "Set your Paystack webhook URL to: {siteUrl}/api/donations/webhook — events: charge.success",
} as const;

export type DonationSettings = {
  enabled: boolean;
  currency: string;
  currencySymbol: string;
  presetAmounts: number[];
  minAmount: number;
  maxAmount: number;
  publicKey: string;
  testMode: boolean;
  channels: string[];
  successMessage: string;
  cancelledMessage: string;
  unavailableMessage: string;
  receiptEmail: string;
  sendReceiptEmail: boolean;
  webhookNote: string;
};
