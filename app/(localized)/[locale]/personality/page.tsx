import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDefaultPublicPersonalitySlug, listPersonalityProfiles } from "@/lib/cms/personality";
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

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname: locale === "zh" ? "/zh/personality" : "/en/personality",
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "浏览 16 型人格的优势、风险、人际模式与职业匹配建议。"
        : "Explore strengths, risks, relationship patterns, and career-fit guidance across 16 personality types.",
    alternatesByLocale: {
      en: "/en/personality",
      zh: "/zh/personality",
      xDefault: "/",
    },
  });
}

export default async function PersonalityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const { items: personalities, landingSurface } = await listPersonalityProfiles({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/personality" : "/en/personality";
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "personality-index",
    pageType: "hub",
    locale,
    canonicalPath,
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "浏览 16 型人格的优势、风险、人际模式与职业匹配建议。"
        : "Explore strengths, risks, relationship patterns, and career-fit guidance across 16 personality types.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "人格" : "Personality", path: canonicalPath },
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
          { label: locale === "zh" ? "人格" : "Personality" },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "MBTI Content Framework" : "MBTI Content Framework"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "人格类型" : "Personality types"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
            ? "16 型人格的优势、风险、关系模式与职业方向。"
            : "Strengths, risks, relationship patterns, and career direction across all 16 types.")}
        </p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "内容来自 Personality CMS，仅展示已发布且公开的 profile。"
            : "Powered by Personality CMS and showing published public profiles only."}
        </p>
        {landingSurface?.ctaBundle.length ? (
          <div className="flex flex-wrap gap-2 pt-1" data-testid="personality-index-landing-cta">
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
          ? "人格索引页集中展示 16 型人格入口，帮助用户先理解类型差异，再进入单个实体页、测试页和职业页。"
          : "The personality index concentrates all 16 type entry points so users can compare type differences before entering a single entity page, test page, or career page.")}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "索引口径" : "Index scope"}
        body={locale === "zh"
          ? "本页承担索引和导航角色，关键事实以 HTML 文本和可抓取链接呈现，结构化数据只帮助搜索系统识别这是一个人格聚合页。"
          : "This page acts as an index and navigation surface. Key facts appear as HTML text and crawlable links, while structured data only helps search systems recognize it as a personality hub."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      {personalities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {personalities.map((personality) => (
            <Card
              key={`${personality.locale}:${personality.slug}`}
              className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="font-serif text-[var(--fm-text)]">
                  {personality.typeCode} · {personality.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{personality.excerpt || personality.subtitle || "-"}</p>
                <Link
                  href={withLocale(`/personality/${buildDefaultPublicPersonalitySlug(personality.typeCode || personality.slug)}`)}
                  className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看人格页" : "View profile"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">
              {locale === "zh" ? "暂无已发布人格内容" : "No published personality profiles yet"}
            </CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "CMS 当前没有返回该语言的人格内容。"
                : "The CMS did not return any personality profiles for this locale."}
            </p>
          </CardHeader>
        </Card>
      )}
    </Container>
  );
}
