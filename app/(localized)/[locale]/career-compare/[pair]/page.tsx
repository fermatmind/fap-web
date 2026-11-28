import { ModularCareerComparison } from "@/components/career/ModularCareerComparison";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/generateSchema";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fixedComparisonPath,
  comparisonDisplayMarkdown,
  isFixedComparisonLocale,
  isFixedComparisonPreviewEnabled,
  resolveFixedComparisonPair,
} from "@/lib/career/fixedComparisonPreview";
import {
  pruneModularComparisonSpec,
  resolveEffectiveModularPluginFlags,
  resolveModularPluginFlags,
} from "@/lib/career/modularComparison";
import { getModularComparisonSpec } from "@/lib/career/modularComparisons";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { CANONICAL_SITE_URL } from "@/lib/site";
import { readFixedComparisonDraft, comparisonPreviewMarkdown } from "@/lib/career/fixedComparisonDraft";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; pair: string }>;
  searchParams?: Promise<{ plugins?: string | string[] }>;
};

function getPreview(locale: string, pairSlug: string) {
  if (!isFixedComparisonPreviewEnabled() || !isFixedComparisonLocale(locale)) notFound();
  const pair = resolveFixedComparisonPair(pairSlug);
  if (!pair) notFound();
  const modularSpec = getModularComparisonSpec(locale, pairSlug);
  if (modularSpec) return { modularSpec, draft: null, pair, locale };
  const draft = readFixedComparisonDraft(locale, pairSlug);
  if (!draft) notFound();
  return { modularSpec: null, draft, pair, locale };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, pair: pairSlug } = await params;
  const { locale, pair, draft, modularSpec } = getPreview(input, pairSlug);
  const title = modularSpec ? modularSpec.title : draft.title;
  const description = modularSpec ? modularSpec.description : draft.description;
  return {
    title,
    description,
    alternates: {
      canonical: `${CANONICAL_SITE_URL}${fixedComparisonPath(locale, pair)}`,
      ...(modularSpec ? {
        languages: {
          "zh-CN": `${CANONICAL_SITE_URL}${fixedComparisonPath("zh", pair)}`,
          en: `${CANONICAL_SITE_URL}${fixedComparisonPath("en", pair)}`,
          "zh-TW": `${CANONICAL_SITE_URL}${fixedComparisonPath("zh-TW", pair)}`,
          "x-default": `${CANONICAL_SITE_URL}${fixedComparisonPath("en", pair)}`,
        },
      } : {}),
    },
    robots: { index: Boolean(modularSpec), follow: true },
  };
}

export default async function FixedComparisonPreviewPage({ params, searchParams }: Props) {
  const { locale: input, pair: pairSlug } = await params;
  const { draft, modularSpec, locale, pair } = getPreview(input, pairSlug);

  if (modularSpec) {
    const requestedFlags = resolveModularPluginFlags(modularSpec.defaultPlugins, (await searchParams)?.plugins);
    const effectiveFlags = resolveEffectiveModularPluginFlags(modularSpec, requestedFlags);
    const prunedSpec = pruneModularComparisonSpec(modularSpec, effectiveFlags);
    const pagePath = fixedComparisonPath(locale, pair);
    return (
      <>
        <JsonLd
          id="career-comparison-breadcrumb"
          data={buildBreadcrumbJsonLd([
            {
              name: locale === "en" ? "Career comparisons" : locale === "zh-TW" ? "職業對比" : "职业对比",
              path: `/${locale}/career-compare`,
            },
            { name: prunedSpec.title, path: pagePath },
          ])}
        />
        <JsonLd
          id="career-comparison-article"
          data={buildArticleJsonLd({
            path: pagePath,
            title: prunedSpec.title,
            description: prunedSpec.description,
            locale,
            datePublished: prunedSpec.datePublished,
            dateModified: prunedSpec.dateModified,
            authorName: prunedSpec.authorName,
          })}
        />
        <ModularCareerComparison
          spec={prunedSpec}
          locale={locale}
          pair={pair}
          pluginFlags={effectiveFlags}
        />
      </>
    );
  }

  const options = { allowImages: false, scrollableTables: true,
    scrollableTableLabel: locale === "en" ? "Horizontally scrollable table" : locale === "zh-TW" ? "可橫向捲動的表格" : "可横向滚动的表格" };
  const labels = { zh: "简体中文", en: "English", "zh-TW": "繁體中文" } as const;
  return (
    <main lang={locale === "zh" ? "zh-CN" : locale} data-fixed-comparison={pairSlug} className="bg-[var(--fm-surface)] px-4 pb-16 pt-8 text-[var(--fm-text)] sm:px-6">
      <article className="mx-auto max-w-[54rem]">
        <nav aria-label={locale === "zh" ? "职业对比导航" : locale === "zh-TW" ? "職業對比導覽" : "Career comparison navigation"} className="mb-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link href={`/${locale}/career-compare`} className="underline underline-offset-4">
            {locale === "en" ? "All comparisons" : locale === "zh-TW" ? "全部職業對比" : "全部职业对比"}
          </Link>
          <div data-comparison-languages className="flex flex-wrap gap-4">
            {(["zh", "en", "zh-TW"] as const).filter(language => pair.labels[language]).map(language => (
              <Link key={language} href={fixedComparisonPath(language, pair)} prefetch={false}
                hrefLang={language === "zh" ? "zh-CN" : language} lang={language === "zh" ? "zh-CN" : language}
                aria-current={language === locale ? "page" : undefined} className="underline underline-offset-4">
                {labels[language]}
              </Link>
            ))}
          </div>
        </nav>
        <h1 className="mb-8 text-3xl font-semibold leading-tight sm:text-4xl">{draft.title}</h1>
        <div className="space-y-5 leading-relaxed">
          {renderSimpleMarkdown(comparisonPreviewMarkdown(comparisonDisplayMarkdown(draft.beforeFaq)), { ...options, headingIdPrefix: "career-compare" })}
          <div data-fixed-comparison-faq className="space-y-3">
            {draft.faq.map(({ question, answer }) => (
              <details key={question} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 py-3">
                <summary className="cursor-pointer font-semibold">{question}</summary>
                <div className="mt-3">{renderSimpleMarkdown(comparisonPreviewMarkdown(answer), options)}</div>
              </details>
            ))}
          </div>
          {renderSimpleMarkdown(comparisonPreviewMarkdown(draft.afterFaq), options)}
          {draft.methods && (
            <details className="rounded-xl border border-[var(--fm-border)] px-4 py-3">
              <summary className="cursor-pointer font-semibold">{draft.methods.label}</summary>
              <div className="mt-3 space-y-3">{renderSimpleMarkdown(draft.methods.body, options)}</div>
            </details>
          )}
        </div>
      </article>
    </main>
  );
}
