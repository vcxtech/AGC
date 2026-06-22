import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getDonationSettings } from "@/lib/donation-settings";
import { paystackInitialize, toSubunits } from "@/lib/paystack";
import { rateLimit } from "@/lib/rate-limit";
import { donationInitializeSchema } from "@/lib/validations";
import { logApi } from "@/lib/api-log";

const ROUTE = "POST /api/donations/initialize";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function makeReference(): string {
  return `agc_don_${randomBytes(12).toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    const settings = await getDonationSettings();
    if (!settings.enabled || !settings.paystackReady) {
      return NextResponse.json({ error: settings.unavailableMessage }, { status: 503 });
    }

    const ip = getClientIp(request);
    const { success, retryAfter } = await rateLimit(`donation:${ip}`);
    if (!success) {
      logApi(ROUTE, "warn", "rate_limited");
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } },
      );
    }

    const body = await request.json();
    const parsed = donationInitializeSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { fullName, email, amount, message } = parsed.data;

    if (amount < settings.minAmount || amount > settings.maxAmount) {
      return NextResponse.json(
        {
          error: `Amount must be between ${settings.currencySymbol}${settings.minAmount} and ${settings.currencySymbol}${settings.maxAmount}.`,
        },
        { status: 400 },
      );
    }

    const reference = makeReference();
    const subunits = toSubunits(amount);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.africagovernancecentre.org";

    await prisma.donation.create({
      data: {
        reference,
        amount: subunits,
        currency: settings.currency,
        email,
        fullName,
        message: message ?? null,
        status: "pending",
      },
    });

    const paystack = await paystackInitialize(
      {
        email,
        amount: subunits,
        currency: settings.currency,
        reference,
        callbackUrl: `${siteUrl}/donate?reference=${encodeURIComponent(reference)}`,
        channels: settings.channels,
        metadata: {
          full_name: fullName,
          message: message ?? "",
          custom_fields: [
            { display_name: "Donor name", variable_name: "donor_name", value: fullName },
          ],
        },
      },
      settings.testMode,
    );

    logApi(ROUTE, "info", "initialized", { reference });
    return NextResponse.json({
      accessCode: paystack.access_code,
      authorizationUrl: paystack.authorization_url,
      reference: paystack.reference,
      publicKey: settings.publicKey,
    });
  } catch (err) {
    logApi(ROUTE, "error", "unhandled_exception");
    console.error("Donation initialize error:", err);
    return NextResponse.json(
      { error: "Unable to start payment. Please try again." },
      { status: 500 },
    );
  }
}
