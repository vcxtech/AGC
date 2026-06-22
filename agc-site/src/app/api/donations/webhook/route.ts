import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDonationSettings } from "@/lib/donation-settings";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { logApi } from "@/lib/api-log";

const ROUTE = "POST /api/donations/webhook";

type WebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    id?: number;
    status?: string;
    channel?: string;
    paid_at?: string;
  };
};

export async function POST(request: Request) {
  try {
    const settings = await getDonationSettings();
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifyPaystackWebhookSignature(rawBody, signature, settings.testMode)) {
      logApi(ROUTE, "warn", "invalid_signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    if (payload.event !== "charge.success" || !payload.data?.reference) {
      return NextResponse.json({ received: true });
    }

    const reference = payload.data.reference;
    const existing = await prisma.donation.findUnique({ where: { reference } });
    if (!existing || existing.status === "success") {
      return NextResponse.json({ received: true });
    }

    if (payload.data.status !== "success") {
      return NextResponse.json({ received: true });
    }

    const paidAt = payload.data.paid_at ? new Date(payload.data.paid_at) : new Date();
    await prisma.donation.update({
      where: { reference },
      data: {
        status: "success",
        paystackId: payload.data.id ? String(payload.data.id) : null,
        channel: payload.data.channel ?? null,
        paidAt,
      },
    });

    logApi(ROUTE, "info", "charge_success", { reference });
    return NextResponse.json({ received: true });
  } catch (err) {
    logApi(ROUTE, "error", "unhandled_exception");
    console.error("Donation webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
