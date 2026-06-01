import Link from "next/link";
import { prisma } from "@/lib/db";
import { Pencil } from "lucide-react";
import {
  AdminMobileEntityCard,
  AdminStatusPill,
} from "../_components/AdminMobileEntityCard";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminFormErrorSuspense } from "../_components/AdminFormErrorSuspense";
import { AdminFormSuccessSuspense } from "../_components/AdminFormSuccessSuspense";
import { AdminDatabaseUnavailable } from "../_components/AdminDatabaseUnavailable";
import { requireAdminSession } from "@/lib/require-admin";
import { ensureMissingBaselinePageRows } from "@/lib/ensure-missing-page-rows";
import { isPrismaUnreachable, markDevDatabaseUnreachable } from "@/lib/skip-db";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  await requireAdminSession();
  try {
    await ensureMissingBaselinePageRows();
    const items = (
      await prisma.pageContent.findMany({
        orderBy: { slug: "asc" },
      })
    ).filter(
      (x) =>
        x.slug !== "site-settings" && x.slug !== "home" && x.slug !== "about",
    );

    return (
      <div>
        <AdminPageHeader
          title="Page Content"
          description="Edit hero text, blocks, and settings per page. Draft pages keep built-in defaults on the live site until you publish."
        />
        <AdminFormErrorSuspense />
        <AdminFormSuccessSuspense />

        <ul className="space-y-3 md:hidden">
          {items.map((item) => (
            <li key={item.id}>
              <AdminMobileEntityCard
                title={item.title || item.slug}
                rows={[
                  {
                    label: "Slug",
                    value: (
                      <span className="font-mono text-sm">{item.slug}</span>
                    ),
                  },
                  {
                    label: "Status",
                    value: <AdminStatusPill status={item.status} />,
                  },
                ]}
                actions={
                  <Link
                    href={`/admin/pages/${item.slug}/edit`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label={`Edit ${item.slug}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                }
              />
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-xl border border-border bg-white shadow-sm md:block">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {item.slug}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {item.heroTitle || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/pages/${item.slug}/edit`}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="rounded-xl border border-border bg-white p-12 text-center text-slate-500">
            No page content yet. Create pages via the database or add a seed.
          </div>
        )}
      </div>
    );
  } catch (e) {
    if (process.env.NODE_ENV === "development" && isPrismaUnreachable(e)) {
      markDevDatabaseUnreachable();
      return (
        <div>
          <AdminPageHeader
            title="Page Content"
            description="CMS pages are loaded from the database when Postgres is available."
          />
          <div className="mt-6">
            <AdminDatabaseUnavailable />
          </div>
        </div>
      );
    }
    throw e;
  }
}
