import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
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
        ? "342 个职业的公开数据库入口：覆盖范围、下载、使用方式与方法边界。"
        : "Public database hub for 342 tracked occupations: coverage, download, usage, and method boundaries.",
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
  const includedExcluded = `${dataset.collectionSummary.includedCount} / ${dataset.collectionSummary.excludedCount}`;
  const publicDetailIndexableCount = dataset.collectionSummary.publicDetailIndexableCount;
  const publicDetailConservativeCount = dataset.collectionSummary.publicDetailConservativeCount;
  const facetDistributions = dataset.facetDistributions;

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-8 py-12 md:py-20" data-testid="dataset-hub-page">
        {dataset.structuredData.dataset ? <JsonLd id="dataset-hub-jsonld" data={dataset.structuredData.dataset} /> : null}
        {dataset.structuredData.breadcrumbList ? <JsonLd id="dataset-hub-breadcrumb-jsonld" data={dataset.structuredData.breadcrumbList} /> : null}

        <DatasetHubShell
          eyebrow={locale === "zh" ? "职业数据库" : "Career Dataset"}
          title={locale === "zh" ? dataset.datasetNameZh : dataset.datasetName}
          summary={
            locale === "zh"
              ? "覆盖 342 个职业，前置展示可公开使用的数据边界、下载入口和方法说明。"
              : "Covers 342 tracked occupations with public-use boundaries, download access, and method notes up front."
          }
        >
          <section className="grid gap-4 md:grid-cols-4" data-testid="dataset-collection-summary">
            <Metric label="Tracked occupations" value={String(dataset.collectionSummary.memberCount)} />
            <Metric label="Included / Excluded" value={includedExcluded} />
            <Metric label="Public details" value={`${publicDetailIndexableCount + publicDetailConservativeCount}`} />
            <Metric label="Discoverable" value={String(dataset.collectionSummary.discoverableCount)} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{locale === "zh" ? "如何使用" : "How to use it"}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <CopyBlock title={locale === "zh" ? "看覆盖" : "Check coverage"} body={locale === "zh" ? "先确认数据库覆盖的职业范围和可公开展示边界。" : "Start with scope and public display boundaries."} />
              <CopyBlock title={locale === "zh" ? "下载数据" : "Download"} body={locale === "zh" ? "使用下载入口获取可公开使用的数据格式。" : "Use the download link for available public formats."} />
              <CopyBlock title={locale === "zh" ? "读方法" : "Read method"} body={locale === "zh" ? "查看为什么有些职业只适合保守展示或暂不展示。" : "See why some roles are conservative or not public-detail ready."} />
            </div>
          </section>

          <DatasetFilterHub
            familyEnabled={dataset.filters.family}
            publishTrackEnabled={dataset.filters.publishTrack}
            indexPostureEnabled={dataset.filters.indexPosture}
            includedCount={dataset.scopeSummary.includedCount}
            excludedCount={dataset.scopeSummary.excludedCount}
            familyFacet={facetDistributions.family ?? {}}
            publishTrackFacet={facetDistributions.publish_track ?? {}}
            releaseCohortFacet={facetDistributions.release_cohort ?? {}}
            publicIndexStateFacet={facetDistributions.public_index_state ?? {}}
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

          <Link href={methodPath} className="inline-flex font-semibold text-orange-600 underline-offset-2 hover:underline" data-testid="dataset-method-entry">
            {locale === "zh" ? "查看方法页" : "Read method page"}
          </Link>
        </DatasetHubShell>
      </Container>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="m-0 mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function CopyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="m-0 text-base font-semibold text-slate-950">{title}</h3>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}
