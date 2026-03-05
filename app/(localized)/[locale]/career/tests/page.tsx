import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/tests" : "/en/career/tests",
    title: locale === "zh" ? "职业测试" : "Career Tests",
    description:
      locale === "zh"
        ? "职业兴趣、职业匹配和职业能力测评入口。"
        : "Entry point for career interest, fit, and capability tests.",
    alternatesByLocale: {
      en: "/en/career/tests",
      zh: "/zh/career/tests",
      xDefault: "/",
    },
  });
}

export default async function CareerTestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Career Tests</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{locale === "zh" ? "职业测试" : "Career tests"}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "从职业兴趣开始，逐步建立更高质量的职业决策依据。" : "Start from interest signals and build stronger evidence for career decisions."}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
          <p className="m-0">
            {locale === "zh" ? "36 题，约 6-8 分钟，输出六维兴趣结构与主次兴趣代码。" : "36 questions in 6-8 minutes, outputs six-dimension interest structure and top-two codes."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocale("/career/tests/riasec")} className={buttonVariants({ size: "sm" })}>
              {locale === "zh" ? "开始测试" : "Start test"}
            </Link>
            <Link href={withLocale("/career/tests/riasec/result")} className={buttonVariants({ size: "sm", variant: "outline" })}>
              {locale === "zh" ? "查看最近结果" : "View latest result"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
