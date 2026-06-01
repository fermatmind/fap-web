import type { Metadata } from "next";
import { getShareSummary } from "@/lib/api/v0_3";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";
import { buildShareMetadataCopy } from "@/lib/og/mbtiShare";
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
  const viewModel = buildSharePageViewModel(shareSummary);
  const copy = buildShareMetadataCopy(viewModel);
  const pathname = `/${locale}/share`;
  const seoSurface = viewModel.seoSurface
    ? {
        ...viewModel.seoSurface,
        canonicalUrl: pathname,
        canonicalPath: pathname,
        alternates: {},
        og: {
          ...viewModel.seoSurface.og,
          image: null,
          url: null,
        },
        twitter: {
          ...viewModel.seoSurface.twitter,
          image: null,
        },
      }
    : null;

  return buildPageMetadata({
    locale,
    pathname,
    title: viewModel.seoSurface?.title || copy.title,
    description: viewModel.seoSurface?.description || copy.description,
    imagePath: DEFAULT_SHARE_IMAGE_URL,
    seoSurface,
    noindex: true,
    alternatesByLocale: {
      en: "/en/share",
      zh: "/zh/share",
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
