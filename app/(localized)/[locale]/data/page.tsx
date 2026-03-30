import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ConclusionSummaryBlock, MethodologyBlock, SampleInfoBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDataPages } from "@/lib/cms/data-pages";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return buildSeoMetadata({
    pageType: "data",
    locale,
    pathname: isZh ? "/zh/data" : "/en/data",
    title: isZh ? "数据页中心" : "Data pages",
    description: isZh
      ? "集中输出样本口径、时间窗口与可引用的数据结论。"
      : "Data pages that expose sample framing, time windows, and citation-ready findings.",
    alternatesByLocale: {
      en: "/en/data",
      zh: "/zh/data",
      xDefault: "/",
    },
  });
}

export default async function DataPagesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const { items: dataPages, landingSurface } = await listDataPages({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 100,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/data" : "/en/data";
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "data-index",
    pageType: "data",
    locale,
    canonicalPath,
    title: locale === "zh" ? "数据页中心" : "Data pages",
    description:
      locale === "zh"
        ? "集中输出样本口径、时间窗口与可引用的数据结论。"
        : "A public hub for sample framing, time windows, and citation-ready findings.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "数据" : "Data", path: canonicalPath },
    ],
  });

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "数据" : "Data" },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Data CMS" : "Data CMS"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "数据页中心" : "Data pages"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
            ? "围绕样本口径、时间窗口和聚合发现组织数据页，避免把核心结论藏在图表或截图里。"
            : "Data pages keep sample framing, time windows, and aggregated findings visible in HTML instead of hiding them inside charts or screenshots.")}
        </p>
        {landingSurface?.ctaBundle.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
          ? "数据页是费马测试公开样本洞察的主 URL，负责稳定输出样本口径、时间窗口和聚合结论。"
          : "Data pages are the canonical public URL for sample framing, time windows, and aggregated findings.")}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "数据口径" : "Data scope"}
        body={locale === "zh"
          ? "本页优先输出可见的样本说明、时间窗口和结论摘要，结构化数据只帮助搜索系统理解页面是数据型正文页。"
          : "This page prioritizes visible HTML for sample framing, time windows, and summary findings. Structured data only helps search systems understand that it is a data page."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <SampleInfoBlock
        title={locale === "zh" ? "索引层样本要求" : "Citation baseline"}
        items={[
          {
            label: locale === "zh" ? "必须出现" : "Required",
            value: locale === "zh" ? "样本量、时间窗口、统计口径、限制说明" : "Sample size, time window, methodology, and limitations",
          },
          {
            label: locale === "zh" ? "用途" : "Usage",
            value: locale === "zh" ? "支持引用复述与页面理解，不把结论藏在图表里" : "Support citation-ready summaries without hiding findings inside charts",
          },
        ]}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      {dataPages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dataPages.map((page) => (
            <Card key={`${page.locale}:${page.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
              <CardHeader className="space-y-3">
                <CardTitle className="font-serif text-[var(--fm-text)]">{page.title}</CardTitle>
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">{page.excerpt || page.subtitle || "-"}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                {page.sampleSizeLabel ? (
                  <p className="m-0">
                    {locale === "zh" ? "样本量" : "Sample"}: {page.sampleSizeLabel}
                  </p>
                ) : null}
                {page.timeWindowLabel ? (
                  <p className="m-0">
                    {locale === "zh" ? "时间窗口" : "Time window"}: {page.timeWindowLabel}
                  </p>
                ) : null}
                <Link
                  href={withLocale(`/data/${page.slug}`)}
                  className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看数据页" : "View data page"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">
              {locale === "zh" ? "暂无已发布数据页" : "No published data pages yet"}
            </CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "CMS 当前没有返回可展示的数据页，或当前环境尚未同步 data page 数据。"
                : "The CMS did not return any published data pages for this locale, or this environment does not expose data pages yet."}
            </p>
          </CardHeader>
        </Card>
      )}
    </Container>
  );
}
