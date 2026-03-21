import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { resolveLocale } from "@/lib/i18n/getDict";
import TeamWorkspaceClient from "./TeamWorkspaceClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return {
    title: locale === "zh" ? "团队工作区" : "Team workspace",
    description: locale === "zh" ? "受保护的团队协作洞察工作区。" : "Protected team collaboration workspace.",
    robots: NOINDEX_ROBOTS,
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; orgId: string; assessmentId: string }>;
}) {
  const { orgId, assessmentId } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <TeamWorkspaceClient orgId={orgId} assessmentId={assessmentId} />
    </main>
  );
}
