import type { Metadata } from "next";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getShareSummary } from "@/lib/api/v0_3";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { resolveLocale } from "@/lib/i18n/getDict";
import {
  buildMbtiShareMetadataCopy,
} from "@/components/share/MbtiShareSummaryCard";
import ShareClient from "./ShareClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadShareMetadata({
  shareId,
  locale,
}: {
  shareId: string;
  locale: "en" | "zh";
}) {
  try {
    return await getShareSummary({
      shareId,
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
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, id } = await params;
  const locale = resolveLocale(localeParam);
  const shareSummary = await loadShareMetadata({
    shareId: id,
    locale,
  });
  const copy = buildMbtiShareMetadataCopy({
    locale,
    data: shareSummary,
  });
  const pathname = `/${locale}/share/${id}`;

  return buildPageMetadata({
    locale,
    pathname,
    title: copy.title,
    description: copy.description,
    imagePath: `/og/${SCALE_CANONICAL_SLUG_MAP.MBTI}`,
    noindex: true,
    alternatesByLocale: {
      en: `/en/share/${id}`,
      zh: `/zh/share/${id}`,
      xDefault: pathname,
    },
  });
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = resolveLocale(localeParam);

  return <ShareClient locale={locale} shareId={id} />;
}
