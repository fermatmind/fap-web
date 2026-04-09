import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SbtiResultClient } from "@/components/sbti/SbtiResultClient";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const pathname = locale === "zh" ? "/zh/fun/sbti/result" : "/en/fun/sbti/result";

  return buildPageMetadata({
    locale,
    pathname,
    title: locale === "zh" ? "SBTI 娱乐结果" : "SBTI Fun Result",
    description:
      locale === "zh"
        ? "查看你的 SBTI 娱乐版主类型、匹配度与 15 维画像。"
        : "Review your SBTI fun result, match score, and 15-dimension profile.",
    noindex: true,
    alternatesByLocale: {
      en: "/en/fun/sbti/result",
      zh: "/zh/fun/sbti/result",
      xDefault: "/",
    },
  });
}

export default async function SbtiResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <Container as="main" className="space-y-6 py-8 md:py-10">
      <SbtiResultClient locale={locale} />
    </Container>
  );
}
