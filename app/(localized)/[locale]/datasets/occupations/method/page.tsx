import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { DatasetMethodPanel } from "@/components/datasets/DatasetMethodPanel";
import { adaptCareerDatasetMethod } from "@/lib/career/adapters/adaptCareerDatasetMethod";
import { fetchCareerDatasetMethod } from "@/lib/career/api/fetchCareerDatasetMethod";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
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
    pathname: locale === "zh" ? "/zh/datasets/occupations/method" : "/en/datasets/occupations/method",
    title: locale === "zh" ? "职业数据库方法说明" : "Occupations Dataset Method",
    description:
      locale === "zh"
        ? "职业数据库的方法、纳入/排除边界与使用说明。"
        : "Methodology, included/excluded boundaries, and usage notes for the occupations dataset.",
    alternatesByLocale: {
      en: "/en/datasets/occupations/method",
      zh: "/zh/datasets/occupations/method",
      xDefault: "/",
    },
  });
}

export default async function DatasetOccupationsMethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const payload = await fetchCareerDatasetMethod({ locale });
  const method = adaptCareerDatasetMethod({ payload });

  if (!method) {
    notFound();
  }

  const methodPath = localizedPath("/datasets/occupations/method", locale);
  const hubPath = localizedPath("/datasets/occupations", locale);
  const description = method.readerGuide?.intro ?? method.summary;

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-8 py-12 md:py-20" data-testid="dataset-method-page">
        <JsonLd id="dataset-method-webpage-jsonld" data={buildWebPageJsonLd({
          path: methodPath, title: method.title, description, locale,
        })} />
        <JsonLd id="dataset-method-breadcrumb-jsonld" data={buildBreadcrumbJsonLd([
          { path: hubPath, name: locale === "zh" ? "职业数据库" : "Occupations dataset" },
          { path: methodPath, name: method.title },
        ])} />

        <DatasetMethodPanel
          locale={locale}
          readerGuide={method.readerGuide}
          title={method.title}
          summary={method.summary}
          sourceSummary={method.sourceSummary}
          reviewDisciplineSummary={method.reviewDisciplineSummary}
          included={method.included}
          excluded={method.excluded}
          boundaryNotes={method.boundaryNotes}
          scopeSummary={method.scopeSummary}
          publication={method.publication}
        />

        <Link href={hubPath} className="inline-flex font-semibold text-orange-600 underline-offset-2 hover:underline" data-testid="dataset-hub-entry">
          {locale === "zh" ? "返回数据库主页" : "Back to dataset hub"}
        </Link>
      </Container>
    </main>
  );
}
