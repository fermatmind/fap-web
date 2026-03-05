import type { Metadata } from "next";
import { RiasecTestClient } from "@/components/career/RiasecTestClient";
import { Container } from "@/components/layout/Container";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/tests/riasec" : "/en/career/tests/riasec",
    title: locale === "zh" ? "霍兰德职业兴趣测试" : "RIASEC Career Interest Test",
    description:
      locale === "zh" ? "36 题 RIASEC 兴趣测评，快速生成职业兴趣画像。" : "36-question RIASEC test for quick career-interest profiling.",
    alternatesByLocale: {
      en: "/en/career/tests/riasec",
      zh: "/zh/career/tests/riasec",
      xDefault: "/",
    },
  });
}

export default async function RiasecTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <Container as="main" className="py-10">
      <RiasecTestClient locale={locale} />
    </Container>
  );
}
