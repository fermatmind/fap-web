import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCareerIndustries } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname: locale === "zh" ? "/zh/career/industries" : "/en/career/industries",
    title: locale === "zh" ? "行业指南" : "Industry Guide",
    description:
      locale === "zh"
        ? "按行业了解职业机会、薪资趋势与长期发展前景。"
        : "Explore career opportunities, salary trends, and long-term outlook by industry.",
    alternatesByLocale: {
      en: "/en/career/industries",
      zh: "/zh/career/industries",
      xDefault: "/",
    },
  });
}

export default async function CareerIndustriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  const industries = listCareerIndustries(locale);
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "career-industries-index",
    pageType: "hub",
    locale,
    canonicalPath: withLocale("/career/industries"),
    title: locale === "zh" ? "行业指南" : "Industry Guide",
    description:
      locale === "zh"
        ? "按行业了解职业机会、薪资趋势与长期发展前景。"
        : "Explore career opportunities, salary trends, and long-term outlook by industry.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: withLocale("/") },
      { name: locale === "zh" ? "职业" : "Career", path: withLocale("/career") },
      { name: locale === "zh" ? "行业指南" : "Industries", path: withLocale("/career/industries") },
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
          { label: locale === "zh" ? "职业" : "Career", href: withLocale("/career") },
          { label: locale === "zh" ? "行业指南" : "Industries" },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Industry Guide</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{locale === "zh" ? "行业指南" : "Industry guide"}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "覆盖 12 个重点行业的结构化发展信息。" : "Structured development insights for 12 major industries."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {industries.map((industry) => (
          <Card key={industry.slug}>
            <CardHeader>
              <CardTitle className="text-lg">{industry.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">{industry.summary}</p>
              <Link href={withLocale(`/career/industries/${industry.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {locale === "zh" ? "查看行业详情" : "View industry details"}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
