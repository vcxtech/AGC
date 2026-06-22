import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { fromSubunits } from "@/lib/paystack";
import { getDonationSettings } from "@/lib/donation-settings";
import { AdminPageHeader } from "../_components/AdminPageHeader";

export const dynamic = "force-dynamic";

function formatAmount(subunits: number, symbol: string) {
  return `${symbol}${fromSubunits(subunits).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminDonationsPage() {
  await requireAdminSession();
  const settings = await getDonationSettings();

  let donations: Awaited<ReturnType<typeof prisma.donation.findMany>> = [];
  let totalSuccess = 0;
  try {
    donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    totalSuccess = donations
      .filter((d) => d.status === "success")
      .reduce((sum, d) => sum + d.amount, 0);
  } catch {
    // DB unavailable
  }

  return (
    <div>
      <AdminPageHeader
        title="Donations"
        description="Recent online gifts processed via Paystack."
      >
        <Link
          href="/admin/donation-settings"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Donation settings
        </Link>
      </AdminPageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Successful gifts (shown)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatAmount(totalSuccess, settings.currencySymbol)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total records</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{donations.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Currency</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{settings.currency}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Donor</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No donations yet.
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {d.paidAt
                      ? new Date(d.paidAt).toLocaleString()
                      : new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{d.fullName}</div>
                    <div className="text-slate-500">{d.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {formatAmount(d.amount, settings.currencySymbol)} {d.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === "success"
                          ? "bg-green-100 text-green-800"
                          : d.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="max-w-[12rem] truncate px-4 py-3 font-mono text-xs text-slate-600">{d.reference}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
