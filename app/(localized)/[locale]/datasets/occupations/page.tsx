import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatasetDownloadInfo } from "@/components/datasets/DatasetDownloadInfo";
import { DatasetFilterHub } from "@/components/datasets/DatasetFilterHub";
import { DatasetHubShell } from "@/components/datasets/DatasetHubShell";
import { adaptCareerDatasetHub } from "@/lib/career/adapters/adaptCareerDatasetHub";
import { fetchCareerDatasetHub } from "@/lib/career/api/fetchCareerDatasetHub";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/datasets/occupations" : "/en/datasets/occupations",
    title: locale === "zh" ? "职业数据库（公开）" : "Occupations Dataset Hub",
    description:
      locale === "zh"
        ? "公开职业数据库入口：发布元数据、下载信息、方法页和可公开筛选维度。"
        : "Public occupations dataset hub: publication metadata, download information, method page, and public-safe filters.",
    alternatesByLocale: {
      en: "/en/datasets/occupations",
      zh: "/zh/datasets/occupations",
      xDefault: "/",
    },
  });
}

export default async function DatasetOccupationsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const payload = await fetchCareerDatasetHub({ locale });
  const dataset = adaptCareerDatasetHub({ payload });

  if (!dataset) {
    notFound();
  }

  const methodPath = localizedPath("/datasets/occupations/method", locale);

  return (
    <Container as="main" className="space-y-6 py-10" data-testid="dataset-hub-page">
      {dataset.structuredData.dataset ? <JsonLd id="dataset-hub-jsonld" data={dataset.structuredData.dataset} /> : null}
      {dataset.structuredData.breadcrumbList ? (
        <JsonLd id="dataset-hub-breadcrumb-jsonld" data={dataset.structuredData.breadcrumbList} />
      ) : null}

      <DatasetHubShell
        eyebrow="Career Dataset"
        title={locale === "zh" ? dataset.datasetNameZh : dataset.datasetName}
        summary={
          locale === "zh"
            ? "该页面只承载公开可消费的数据产品合同，不暴露内部审阅队列与原始证据字段。"
            : "This page only exposes the public-safe dataset product contract, without leaking internal review queues or raw evidence fields."
        }
      >
        <Card data-testid="dataset-collection-summary">
          <CardHeader>
            <CardTitle className="text-lg">Collection summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-[var(--fm-text-muted)] md:grid-cols-2">
            <p className="m-0">Scope: {dataset.datasetScope}</p>
            <p className="m-0">Member kind: {dataset.collectionSummary.memberKind}</p>
            <p className="m-0">Total members: {dataset.collectionSummary.memberCount}</p>
            <p className="m-0">Stable / Candidate / Hold: {`${dataset.collectionSummary.stableCount} / ${dataset.collectionSummary.candidateCount} / ${dataset.collectionSummary.holdCount}`}</p>
            <p className="m-0">Discoverable / Excluded: {`${dataset.collectionSummary.discoverableCount} / ${dataset.collectionSummary.excludedCount}`}</p>
            <p className="m-0">Manifest version: {dataset.collectionSummary.manifestVersion}</p>
          </CardContent>
        </Card>

        <DatasetFilterHub
          familyEnabled={dataset.filters.family}
          publishTrackEnabled={dataset.filters.publishTrack}
          indexPostureEnabled={dataset.filters.indexPosture}
        />

        <DatasetDownloadInfo
          publisherName={dataset.publication.publisherName}
          publisherUrl={dataset.publication.publisherUrl}
          licenseName={dataset.publication.licenseName}
          licenseUrl={dataset.publication.licenseUrl}
          usageSummary={dataset.publication.usageSummary}
          downloadUrl={dataset.publication.downloadUrl}
          formats={dataset.publication.formats}
        />

        <Link
          href={methodPath}
          className="inline-flex font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline"
          data-testid="dataset-method-entry"
        >
          {locale === "zh" ? "查看方法页" : "Read method page"}
        </Link>
      </DatasetHubShell>
    </Container>
  );
}

