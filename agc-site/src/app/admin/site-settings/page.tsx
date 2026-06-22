import { AdminPageHeader } from "../_components/AdminPageHeader";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdminSession } from "@/lib/require-admin";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const [settings, params] = await Promise.all([getSiteSettings(), searchParams]);
  const saved = params.saved === "1";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div>
      <AdminPageHeader
        title="Site Settings"
        description="Global organization details used site-wide: address, phone, office hours, emails, logos, and navigation copy. These appear on Contact, Get Involved, footer, map, and form notifications."
      />
      {saved ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Site settings updated.
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <SiteSettingsForm settings={settings} saved={saved} />
    </div>
  );
}
