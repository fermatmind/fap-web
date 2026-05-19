import { notFound } from "next/navigation";
import { ResearchReportPage } from "@/components/research/ResearchReportPage";
import { resolveLocale } from "@/lib/i18n/getDict";
import { getResearchReport } from "@/lib/research/reports";

export const dynamic = "force-dynamic";

export default async function ResearchReportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const report = await getResearchReport(slug, locale).catch(() => null);

  if (!report) {
    notFound();
  }

  return <ResearchReportPage report={report} locale={locale} />;
}
