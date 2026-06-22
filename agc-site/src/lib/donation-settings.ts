import { cache } from "react";
import {
  DEFAULT_DONATION_SETTINGS,
  type DonationSettings,
} from "@/data/donation-settings-defaults";
import { getPaystackPublicKey, isPaystackConfigured } from "@/lib/paystack";
import { prisma } from "@/lib/db";
import { shouldSkipPrismaCalls } from "@/lib/skip-db";

function parsePresetAmounts(value: unknown): number[] {
  if (!Array.isArray(value)) return [...DEFAULT_DONATION_SETTINGS.presetAmounts];
  const nums = value
    .map((x) => (typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length > 0 ? nums : [...DEFAULT_DONATION_SETTINGS.presetAmounts];
}

function parseChannels(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_DONATION_SETTINGS.channels];
  const channels = value.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  return channels.length > 0 ? channels : [...DEFAULT_DONATION_SETTINGS.channels];
}

export function mergeDonationSettings(raw: unknown): DonationSettings {
  const src =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const pickNum = (key: string, fallback: number) => {
    const v = src[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  };

  const pickStr = (key: string, fallback: string) =>
    typeof src[key] === "string" && String(src[key]).trim() !== ""
      ? String(src[key]).trim()
      : fallback;

  const pickBool = (key: string, fallback: boolean) =>
    typeof src[key] === "boolean" ? src[key] : fallback;

  return {
    enabled: pickBool("enabled", DEFAULT_DONATION_SETTINGS.enabled),
    currency: pickStr("currency", DEFAULT_DONATION_SETTINGS.currency).toUpperCase(),
    currencySymbol: pickStr("currencySymbol", DEFAULT_DONATION_SETTINGS.currencySymbol),
    presetAmounts: parsePresetAmounts(src.presetAmounts),
    minAmount: pickNum("minAmount", DEFAULT_DONATION_SETTINGS.minAmount),
    maxAmount: pickNum("maxAmount", DEFAULT_DONATION_SETTINGS.maxAmount),
    publicKey: pickStr("publicKey", DEFAULT_DONATION_SETTINGS.publicKey),
    testMode: pickBool("testMode", DEFAULT_DONATION_SETTINGS.testMode),
    channels: parseChannels(src.channels),
    successMessage: pickStr("successMessage", DEFAULT_DONATION_SETTINGS.successMessage),
    cancelledMessage: pickStr("cancelledMessage", DEFAULT_DONATION_SETTINGS.cancelledMessage),
    unavailableMessage: pickStr(
      "unavailableMessage",
      DEFAULT_DONATION_SETTINGS.unavailableMessage,
    ),
    receiptEmail: pickStr("receiptEmail", DEFAULT_DONATION_SETTINGS.receiptEmail),
    sendReceiptEmail: pickBool("sendReceiptEmail", DEFAULT_DONATION_SETTINGS.sendReceiptEmail),
    webhookNote: pickStr("webhookNote", DEFAULT_DONATION_SETTINGS.webhookNote),
  };
}

export type PublicDonationSettings = DonationSettings & {
  publicKey: string;
  paystackReady: boolean;
};

export const getDonationSettings = cache(async (): Promise<PublicDonationSettings> => {
  let base = mergeDonationSettings(DEFAULT_DONATION_SETTINGS);

  if (!shouldSkipPrismaCalls()) {
    try {
      const row = await prisma.pageContent.findUnique({
        where: { slug: "donation-settings" },
        select: { contentJson: true },
      });
      if (row?.contentJson) {
        base = mergeDonationSettings(row.contentJson);
      }
    } catch {
      // fall back to defaults
    }
  }

  const publicKey = getPaystackPublicKey(base.testMode, base.publicKey) || "";
  const paystackReady = base.enabled && isPaystackConfigured(base.testMode, base.publicKey);

  return { ...base, publicKey, paystackReady };
});
