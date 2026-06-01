import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminDatabaseUnavailable } from "../../../_components/AdminDatabaseUnavailable";
import { AdminFormErrorSuspense } from "../../../_components/AdminFormErrorSuspense";
import { AdminFormSuccessSuspense } from "../../../_components/AdminFormSuccessSuspense";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { PageContentForm } from "../../PageContentForm";
import { requireAdminSession } from "@/lib/require-admin";
import { ensureMissingBaselinePageRows } from "@/lib/ensure-missing-page-rows";
import { isPrismaUnreachable, markDevDatabaseUnreachable } from "@/lib/skip-db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminPagesEditPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  if (decodedSlug === "site-settings") {
    redirect("/admin/site-settings");
  }

  if (decodedSlug === "home") {
    redirect("/admin/home-settings");
  }

  if (decodedSlug === "about") {
    redirect("/admin/about-settings");
  }

  try {
    await ensureMissingBaselinePageRows();
    const item = await prisma.pageContent.findUnique({
      where: { slug: decodedSlug },
      select: {
        slug: true,
        title: true,
        mainTitle: true,
        status: true,
        heroTitle: true,
        heroSubtitle: true,
        description: true,
        mission: true,
        intro: true,
        objectivesTitle: true,
        objectivesContent: true,
        objectivesPrinciples: true,
        objectivesAgenda2063: true,
        contentJson: true,
      },
    });
    if (!item) notFound();

    return (
      <div>
        <AdminPageHeader
          title={`Edit page: ${item.title || item.slug}`}
          description="Update hero text, intros, and status. Draft pages keep built-in defaults on the live site until you publish."
        />
        <AdminFormErrorSuspense />
        <AdminFormSuccessSuspense />
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-8">
          <PageContentForm item={item} />
        </div>
      </div>
    );
  } catch (e) {
    if (process.env.NODE_ENV === "development" && isPrismaUnreachable(e)) {
      markDevDatabaseUnreachable();
      return (
        <div>
          <AdminPageHeader
            title="Page content"
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
