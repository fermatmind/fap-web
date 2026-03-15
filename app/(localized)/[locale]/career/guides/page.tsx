import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/guides" : "/en/career/guides",
    title: locale === "zh" ? "职业发展" : "Career Guides",
    description:
      locale === "zh"
        ? "围绕职业规划、转型与成长的 20 篇结构化实战指南。"
        : "20 structured guides for career planning, transition, and professional growth.",
    alternatesByLocale: {
      en: "/en/career/guides",
      zh: "/zh/career/guides",
      xDefault: "/",
    },
  });
}

export default async function CareerGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  const guides = await listCareerGuidesFromCms(locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Career Guides</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{locale === "zh" ? "职业发展" : "Career development"}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "职业规划、职业转型与能力建设的长期指南。" : "Long-term guides for planning, transitioning, and capability building."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <Card key={guide.slug}>
            <CardHeader>
              <CardTitle className="text-lg">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">{guide.summary}</p>
              <p className="m-0 text-xs">{locale === "zh" ? "分类" : "Category"}: {guide.category}</p>
              <Link href={guide.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {locale === "zh" ? "阅读全文" : "Read guide"}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
