import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { getDonationSettings, mergeDonationSettings } from "@/lib/donation-settings";
import { DEFAULT_DONATION_SETTINGS } from "@/data/donation-settings-defaults";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminFormErrorSuspense } from "../_components/AdminFormErrorSuspense";
import { DonationSettingsForm } from "./DonationSettingsForm";
import { getDonationSettingsAdminStatus } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminDonationSettingsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;

  let settings = mergeDonationSettings(DEFAULT_DONATION_SETTINGS);
  try {
    const row = await prisma.pageContent.findUnique({
      where: { slug: "donation-settings" },
      select: { contentJson: true },
    });
    if (row?.contentJson) settings = mergeDonationSettings(row.contentJson);
  } catch {
    // use defaults
  }

  const paystackStatus = await getDonationSettingsAdminStatus(settings.testMode, settings.publicKey);
  const publicSettings = await getDonationSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";
  const webhookUrl = `${siteUrl}/api/donations/webhook`;

  return (
    <div>
      <AdminPageHeader
        title="Donation settings"
        description="Configure Paystack gateway, amounts, and donation messages. Page copy is under Page Content → donate."
      >
        <Link
          href="/admin/donations"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View donations
        </Link>
      </AdminPageHeader>
      <AdminFormErrorSuspense />
      {params.error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      ) : null}
      {!publicSettings.paystackReady ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Paystack is not fully configured — the public donate page will show the unavailable message until secret and
          public keys are set.
        </p>
      ) : null}
      <DonationSettingsForm
        settings={settings}
        paystackStatus={paystackStatus}
        webhookUrl={webhookUrl}
        saved={params.saved === "1"}
      />
    </div>
  );
}
