import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listMethods } from "@/lib/cms/methods";
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
    pageType: "method",
    locale,
    pathname: isZh ? "/zh/methods" : "/en/methods",
    title: isZh ? "方法页中心" : "Methods",
    description: isZh
      ? "集中解释费马测试的方法定义、解释边界与测评口径。"
      : "Method pages that explain definitions, interpretation boundaries, and assessment framing.",
    alternatesByLocale: {
      en: "/en/methods",
      zh: "/zh/methods",
      xDefault: "/",
    },
  });
}

export default async function MethodsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const { items: methods, landingSurface } = await listMethods({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 100,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/methods" : "/en/methods";
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "methods-index",
    pageType: "method",
    locale,
    canonicalPath,
    title: locale === "zh" ? "方法页中心" : "Methods",
    description:
      locale === "zh"
        ? "集中解释费马测试的方法定义、解释边界与测评口径。"
        : "A public hub for method definitions, interpretation boundaries, and assessment framing.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "方法" : "Methods", path: canonicalPath },
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
          { label: locale === "zh" ? "方法" : "Methods" },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Method CMS" : "Method CMS"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "方法页中心" : "Methods"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
            ? "围绕定义、解释边界与测评口径组织方法页，减少把方法信息拆散到多个弱页面。"
            : "Method pages keep definitions, interpretation boundaries, and assessment framing in a single public layer instead of scattering them across weak URLs.")}
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
          ? "方法页是费马测试公开方法论的主 URL，负责稳定输出定义、解释边界和相关测试入口。"
          : "Method pages are the canonical public URL for definitions, interpretation boundaries, and related assessment entry points.")}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "页面口径" : "Method scope"}
        body={locale === "zh"
          ? "本页优先输出方法定义和口径说明的 HTML 文本，结构化数据只帮助搜索系统理解它是方法型正文页。"
          : "This page prioritizes visible HTML for definitions and methodology. Structured data only helps search systems understand that it is a method page."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      {methods.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <Card key={`${method.locale}:${method.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
              <CardHeader className="space-y-3">
                <CardTitle className="font-serif text-[var(--fm-text)]">{method.title}</CardTitle>
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">{method.excerpt || method.subtitle || "-"}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh" ? "方法代码" : "Method code"}: {method.methodCode || method.slug}
                </p>
                <Link
                  href={withLocale(`/methods/${method.slug}`)}
                  className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看方法页" : "View method page"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">
              {locale === "zh" ? "暂无已发布方法页" : "No published methods yet"}
            </CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "CMS 当前没有返回可展示的方法页，或当前环境尚未同步 methods 数据。"
                : "The CMS did not return any published method pages for this locale, or this environment does not expose methods yet."}
            </p>
          </CardHeader>
        </Card>
      )}
    </Container>
  );
}
