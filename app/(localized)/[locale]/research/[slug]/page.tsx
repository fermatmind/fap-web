import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchReportPage } from "@/components/research/ResearchReportPage";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildResearchReportPath, getResearchReport } from "@/lib/research/reports";

export const dynamic = "force-dynamic";

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataDescription(value: string): string {
  const description = stripMarkdown(value);
  return description.length > 180 ? `${description.slice(0, 177).trimEnd()}...` : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const report = await getResearchReport(slug, locale);

  if (!report) {
    return {
      title: "Research Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildResearchReportPath(report.slug, locale);
  const title = report.seoTitle || report.title;
  const description = report.seoDescription || metadataDescription(report.executiveSummary);

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    canonicalPathname: canonicalPath,
    canonicalCandidate: report.canonicalPath,
    canonicalRouteFamily: "research_detail",
    title,
    description,
    imagePath: DEFAULT_SHARE_IMAGE_URL,
    alternatesByLocale: {
      en: buildResearchReportPath(report.slug, "en"),
      zh: buildResearchReportPath(report.slug, "zh"),
      xDefault: "/",
    },
  });
}

export default async function ResearchReportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const report = await getResearchReport(slug, locale);

  if (!report) {
    notFound();
  }

  return <ResearchReportPage report={report} locale={locale} />;
}
