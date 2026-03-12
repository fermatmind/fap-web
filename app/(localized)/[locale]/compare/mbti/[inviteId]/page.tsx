import type { Metadata } from "next";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; inviteId: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, inviteId } = await params;
  const locale = resolveLocale(localeParam);
  const pathname = `/${locale}/compare/mbti/${inviteId}`;

  return buildPageMetadata({
    locale,
    pathname,
    title: locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite",
    description: locale === "zh"
      ? "公开 MBTI 对比邀请页，只展示安全可分享的摘要与对比信息。"
      : "Public MBTI compare invite page with share-safe summary and compare data only.",
    noindex: true,
    alternatesByLocale: {
      en: `/en/compare/mbti/${inviteId}`,
      zh: `/zh/compare/mbti/${inviteId}`,
      xDefault: pathname,
    },
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string; inviteId: string }>;
}) {
  const { locale: localeParam, inviteId } = await params;
  const locale = resolveLocale(localeParam);

  return <CompareClient locale={locale} inviteId={inviteId} />;
}
