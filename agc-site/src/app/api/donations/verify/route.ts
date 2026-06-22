import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { getDonationSettings } from "@/lib/donation-settings";
import { fromSubunits, paystackVerify } from "@/lib/paystack";
import { donationVerifySchema } from "@/lib/validations";
import { logApi } from "@/lib/api-log";
import { escapeHtml } from "@/lib/sanitize";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ROUTE = "POST /api/donations/verify";

async function markDonationSuccess(
  reference: string,
  paystackId: string,
  channel: string | undefined,
  paidAt: Date,
) {
  const donation = await prisma.donation.update({
    where: { reference },
    data: {
      status: "success",
      paystackId,
      channel: channel ?? null,
      paidAt,
    },
  });

  const settings = await getDonationSettings();
  if (resend && settings.sendReceiptEmail) {
    const amountDisplay = `${settings.currencySymbol}${fromSubunits(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: donation.email,
        bcc: settings.receiptEmail,
        subject: "Thank you for your donation to Africa Governance Centre",
        html: `
          <p>Dear ${escapeHtml(donation.fullName)},</p>
          <p>Thank you for your generous gift of <strong>${escapeHtml(amountDisplay)} ${escapeHtml(donation.currency)}</strong>.</p>
          <p>Reference: <strong>${escapeHtml(reference)}</strong></p>
          <p>Your support strengthens governance research, policy dialogue, and capacity building across Africa.</p>
          <p>With gratitude,<br/>Africa Governance Centre</p>
        `,
      });
    } catch (e) {
      console.error("Donation receipt email error:", e);
    }
  }

  return donation;
}

export async function POST(request: Request) {
  try {
    const settings = await getDonationSettings();
    if (!settings.paystackReady) {
      return NextResponse.json({ error: settings.unavailableMessage }, { status: 503 });
    }

    const body = await request.json();
    const parsed = donationVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    const { reference } = parsed.data;
    const existing = await prisma.donation.findUnique({ where: { reference } });
    if (!existing) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (existing.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
        message: settings.successMessage,
      });
    }

    const verified = await paystackVerify(reference, settings.testMode);
    if (verified.status !== "success") {
      await prisma.donation.update({
        where: { reference },
        data: { status: "failed" },
      });
      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 });
    }

    const paidAt = verified.paid_at ? new Date(verified.paid_at) : new Date();
    await markDonationSuccess(reference, String(verified.id), verified.channel, paidAt);

    logApi(ROUTE, "info", "verified", { reference });
    return NextResponse.json({
      success: true,
      status: "success",
      message: settings.successMessage,
    });
  } catch (err) {
    logApi(ROUTE, "error", "unhandled_exception");
    console.error("Donation verify error:", err);
    return NextResponse.json({ error: "Unable to verify payment" }, { status: 500 });
  }
}
