import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCareerIndustries } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
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

  return (
    <Container as="main" className="space-y-6 py-10">
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
