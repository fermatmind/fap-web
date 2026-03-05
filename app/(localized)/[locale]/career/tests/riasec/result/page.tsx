import type { Metadata } from "next";
import { RiasecResultClient } from "@/components/career/RiasecResultClient";
import { Container } from "@/components/layout/Container";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname:
      locale === "zh"
        ? "/zh/career/tests/riasec/result"
        : "/en/career/tests/riasec/result",
    title: locale === "zh" ? "职业兴趣测试结果" : "RIASEC Test Result",
    description:
      locale === "zh"
        ? "查看六维职业兴趣结果并进入个性化职业推荐。"
        : "Review your six-dimension interest result and continue to personalized recommendations.",
    alternatesByLocale: {
      en: "/en/career/tests/riasec/result",
      zh: "/zh/career/tests/riasec/result",
      xDefault: "/",
    },
  });
}

export default async function RiasecResultPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <Container as="main" className="py-10">
      <RiasecResultClient locale={locale} />
    </Container>
  );
}
