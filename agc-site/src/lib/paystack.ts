import crypto from "crypto";

const PAYSTACK_API = "https://api.paystack.co";

export type PaystackInitializeParams = {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callbackUrl?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
};

export type PaystackInitializeResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyResult = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
  customer?: { email?: string };
};

function getSecretKey(testMode: boolean): string | null {
  if (testMode) {
    const test = process.env.PAYSTACK_TEST_SECRET_KEY?.trim();
    if (test) return test;
  }
  const live = process.env.PAYSTACK_SECRET_KEY?.trim();
  return live || null;
}

export function getPaystackPublicKey(testMode: boolean, cmsOverride?: string): string | null {
  if (testMode) {
    const test = process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY?.trim();
    if (test) return test;
  }
  const env = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  if (env) return env;
  const cms = cmsOverride?.trim();
  return cms || null;
}

export function isPaystackSecretConfigured(testMode: boolean): boolean {
  return Boolean(getSecretKey(testMode));
}

export function isPaystackConfigured(testMode: boolean, cmsPublicKey?: string): boolean {
  return Boolean(getSecretKey(testMode) && getPaystackPublicKey(testMode, cmsPublicKey));
}

export async function paystackInitialize(
  params: PaystackInitializeParams,
  testMode: boolean,
): Promise<PaystackInitializeResult> {
  const secretKey = getSecretKey(testMode);
  if (!secretKey) throw new Error("Paystack secret key is not configured");

  const body: Record<string, unknown> = {
    email: params.email,
    amount: params.amount,
    currency: params.currency,
    reference: params.reference,
    metadata: params.metadata,
  };
  if (params.callbackUrl) body.callback_url = params.callbackUrl;
  if (params.channels?.length) body.channels = params.channels;

  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: PaystackInitializeResult;
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Failed to initialize Paystack transaction");
  }

  return json.data;
}

export async function paystackVerify(
  reference: string,
  testMode: boolean,
): Promise<PaystackVerifyResult> {
  const secretKey = getSecretKey(testMode);
  if (!secretKey) throw new Error("Paystack secret key is not configured");

  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const json = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: PaystackVerifyResult;
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Failed to verify Paystack transaction");
  }

  return json.data;
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null,
  testMode: boolean,
): boolean {
  const secret = getSecretKey(testMode);
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

/** Convert major currency units (e.g. 100 GHS) to Paystack subunits (10000 pesewas). */
export function toSubunits(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert Paystack subunits back to major units for display. */
export function fromSubunits(amount: number): number {
  return amount / 100;
}
