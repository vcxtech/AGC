"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { donationSettingsFormSchema } from "@/lib/validations";
import { ADMIN_DB_ERROR_MESSAGE } from "@/lib/admin-flash-messages";
import { DEFAULT_DONATION_SETTINGS } from "@/data/donation-settings-defaults";
import { getPaystackPublicKey, isPaystackConfigured, isPaystackSecretConfigured } from "@/lib/paystack";

function parsePresetAmounts(raw: string): number[] {
  return raw
    .split(/[,\n]/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export async function updateDonationSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const parsed = donationSettingsFormSchema.safeParse({
    enabled: formData.get("enabled"),
    testMode: formData.get("testMode"),
    sendReceiptEmail: formData.get("sendReceiptEmail"),
    currency: formData.get("currency"),
    currencySymbol: formData.get("currencySymbol"),
    presetAmounts: formData.get("presetAmounts"),
    minAmount: formData.get("minAmount"),
    maxAmount: formData.get("maxAmount"),
    publicKey: formData.get("publicKey") || undefined,
    channels: formData.get("channels") || undefined,
    successMessage: formData.get("successMessage"),
    cancelledMessage: formData.get("cancelledMessage"),
    unavailableMessage: formData.get("unavailableMessage"),
    receiptEmail: formData.get("receiptEmail"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid input";
    redirect(`/admin/donation-settings?error=${encodeURIComponent(msg)}`);
  }

  const data = parsed.data;
  const presetAmounts = parsePresetAmounts(data.presetAmounts);
  if (presetAmounts.length === 0) {
    redirect(`/admin/donation-settings?error=${encodeURIComponent("Enter at least one preset amount")}`);
  }
  if (data.minAmount >= data.maxAmount) {
    redirect(`/admin/donation-settings?error=${encodeURIComponent("Min amount must be less than max amount")}`);
  }

  const channels = (data.channels || "card")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const contentJson = {
    enabled: data.enabled,
    testMode: data.testMode,
    sendReceiptEmail: data.sendReceiptEmail,
    currency: data.currency.toUpperCase(),
    currencySymbol: data.currencySymbol,
    presetAmounts,
    minAmount: data.minAmount,
    maxAmount: data.maxAmount,
    publicKey: data.publicKey || "",
    channels: channels.length > 0 ? channels : ["card"],
    successMessage: data.successMessage,
    cancelledMessage: data.cancelledMessage,
    unavailableMessage: data.unavailableMessage,
    receiptEmail: data.receiptEmail,
    webhookNote: DEFAULT_DONATION_SETTINGS.webhookNote,
  };

  try {
    await prisma.pageContent.upsert({
      where: { slug: "donation-settings" },
      create: {
        slug: "donation-settings",
        title: "Donation Settings",
        status: "published",
        contentJson: contentJson as Prisma.InputJsonValue,
      },
      update: {
        contentJson: contentJson as Prisma.InputJsonValue,
      },
    });
  } catch {
    redirect(`/admin/donation-settings?error=${encodeURIComponent(ADMIN_DB_ERROR_MESSAGE)}`);
  }

  revalidatePath("/donate");
  revalidatePath("/admin/donation-settings");
  updateTag("page-content");
  redirect("/admin/donation-settings?saved=1");
}

export async function getDonationSettingsAdminStatus(testMode: boolean, cmsPublicKey: string) {
  const publicKey = getPaystackPublicKey(testMode, cmsPublicKey);
  const secretConfigured = isPaystackSecretConfigured(testMode);
  return {
    secretConfigured,
    publicKeyConfigured: Boolean(publicKey),
    publicKeyPreview: publicKey ? `${publicKey.slice(0, 12)}…` : null,
  };
}
