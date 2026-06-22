"use client";

import { useFormStatus } from "react-dom";
import type { DonationSettings } from "@/data/donation-settings-defaults";
import { updateDonationSettings } from "./actions";
import { AdminFormStickyActions } from "../_components/AdminFormStickyActions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-accent-500 px-6 py-2 font-medium text-white hover:bg-accent-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save donation settings"}
    </button>
  );
}

type Props = {
  settings: DonationSettings;
  paystackStatus: {
    secretConfigured: boolean;
    publicKeyConfigured: boolean;
    publicKeyPreview: string | null;
  };
  webhookUrl: string;
  saved?: boolean;
};

export function DonationSettingsForm({ settings, paystackStatus, webhookUrl, saved = false }: Props) {
  return (
    <form action={updateDonationSettings} className="space-y-8">
      {saved ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Donation settings saved.
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Paystack gateway</h2>
        <p className="mt-1 text-sm text-slate-600">
          Secret keys are set via environment variables only (never stored in the CMS).
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Secret key</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {paystackStatus.secretConfigured ? "Configured in env" : "Missing — set PAYSTACK_SECRET_KEY"}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Public key</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {paystackStatus.publicKeyConfigured
                ? `Ready (${paystackStatus.publicKeyPreview})`
                : "Missing — set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY or CMS override below"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          Webhook URL for Paystack dashboard:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{webhookUrl}</code>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Subscribe to <strong>charge.success</strong>. For test mode, use{" "}
          <code className="rounded bg-slate-100 px-1">PAYSTACK_TEST_SECRET_KEY</code> and{" "}
          <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY</code>.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Availability</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-4 w-4 rounded" />
            Accept online donations
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" name="testMode" defaultChecked={settings.testMode} className="h-4 w-4 rounded" />
            Test mode (use test Paystack keys)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              name="sendReceiptEmail"
              defaultChecked={settings.sendReceiptEmail}
              className="h-4 w-4 rounded"
            />
            Email receipt to donor (BCC programmes)
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Currency & amounts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Currency code
            <input
              name="currency"
              defaultValue={settings.currency}
              placeholder="USD"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Currency symbol
            <input
              name="currencySymbol"
              defaultValue={settings.currencySymbol}
              placeholder="$"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Preset amounts (comma-separated)
            <input
              name="presetAmounts"
              defaultValue={settings.presetAmounts.join(", ")}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Minimum amount
            <input
              name="minAmount"
              type="number"
              min={1}
              step="0.01"
              defaultValue={settings.minAmount}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Maximum amount
            <input
              name="maxAmount"
              type="number"
              min={1}
              step="0.01"
              defaultValue={settings.maxAmount}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Paystack public key override (optional)
            <input
              name="publicKey"
              defaultValue={settings.publicKey}
              placeholder="pk_live_… or pk_test_…"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Payment channels (comma-separated)
            <input
              name="channels"
              defaultValue={settings.channels.join(", ")}
              placeholder="card"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Use <code>card</code> for worldwide single donations.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Messages</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Success message
            <textarea
              name="successMessage"
              rows={3}
              defaultValue={settings.successMessage}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Cancelled message
            <textarea
              name="cancelledMessage"
              rows={2}
              defaultValue={settings.cancelledMessage}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Unavailable message (when gateway disabled)
            <textarea
              name="unavailableMessage"
              rows={2}
              defaultValue={settings.unavailableMessage}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Receipt BCC email
            <input
              name="receiptEmail"
              type="email"
              defaultValue={settings.receiptEmail}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
        </div>
      </section>

      <p className="text-sm text-slate-600">
        Page copy (headline, intro, impact list) is edited under{" "}
        <a href="/admin/pages/donate/edit" className="font-medium text-accent-700 hover:underline">
          Page Content → donate
        </a>
        .
      </p>

      <AdminFormStickyActions>
        <SubmitButton />
      </AdminFormStickyActions>
    </form>
  );
}
