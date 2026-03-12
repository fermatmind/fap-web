import type { Metadata } from "next";
import { getMbtiCompareInvite } from "@/lib/api/v0_3";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildCompareMetadataCopy } from "@/lib/og/mbtiCompare";
import { buildPageMetadata } from "@/lib/seo/metadata";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadCompareMetadata({
  inviteId,
  locale,
}: {
  inviteId: string;
  locale: "en" | "zh";
}) {
  try {
    return await getMbtiCompareInvite({
      inviteId,
      locale,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; inviteId: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, inviteId } = await params;
  const locale = resolveLocale(localeParam);
  const data = await loadCompareMetadata({
    inviteId,
    locale,
  });
  const copy = buildCompareMetadataCopy(data);
  const pathname = `/${locale}/compare/mbti/${inviteId}`;

  return buildPageMetadata({
    locale,
    pathname,
    title: copy.title,
    description: copy.description,
    imagePath: `/og/compare/mbti/${inviteId}`,
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
