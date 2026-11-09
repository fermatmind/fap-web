import { withTraditionalPersonalityLanguageAlternates } from "@/lib/seo/personalityLanguageAlternates";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TraditionalPersonalityCategoryBackLink } from "@/components/personality/TraditionalPersonalityCategoryLinks";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import { loadTraditionalMbtiCurrentReader, TraditionalMbtiCurrentReader } from "@/components/personality/TraditionalMbtiCurrentReader";
import { getTraditionalPersonalityPublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import { getTraditionalPublicAssetRoute, isTraditionalMbtiDetailPath } from "@/lib/personality/traditionalPublicAssetRoutes";

import { isConfiguredStagingSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ framework: string; slug?: string[] }> };

const loadContent = cache(async (pathname: string, key: string) => {
  if (isTraditionalMbtiDetailPath(pathname)) {
    const reader = await loadTraditionalMbtiCurrentReader(key);
    return reader ? { kind: "mbti" as const, reader } : null;
  }
  const route = getTraditionalPublicAssetRoute(pathname);
  if (!route) return null;
  const asset = await getTraditionalPersonalityPublicContentAsset(route.framework, route.entry);
  return asset ? { kind: "asset" as const, asset } : null;
});

async function loadPage({ params }: Props) {
  const { framework, slug = [] } = await params;
  const content = await loadContent("/zh-TW/personality/" + [framework, ...slug].join("/"), framework);
  if (!content) notFound();
  return content;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const content = await loadPage(props);
  if (content.kind === "mbti") {
    return withTraditionalPersonalityLanguageAlternates({
      ...content.reader.metadata,
      alternates: { canonical: content.reader.canonical },
      robots: { index: !isConfiguredStagingSiteUrl() && content.reader.indexEligible, follow: !isConfiguredStagingSiteUrl() },
    }, content.reader.traditionalLanguageAlternates);
  }
  const { asset } = content;
  return withTraditionalPersonalityLanguageAlternates({
    title: asset.seo.title,
    description: asset.seo.description,
    alternates: { canonical: asset.canonicalPath },
    robots: {
      index: !isConfiguredStagingSiteUrl() && asset.robots === "index,follow" && asset.indexEligible,
      follow: !isConfiguredStagingSiteUrl() && asset.robots !== "noindex,nofollow",
    },
  }, asset.traditionalLanguageAlternates);
}

export default async function TraditionalPersonalityAssetPage(props: Props) {
  const content = await loadPage(props);
  const canonical = content.kind === "mbti" ? content.reader.canonical : content.asset.canonicalPath;
  const suffix = canonical.slice("/zh-TW".length);
  return <>
    <nav aria-label="頁面語言" className="mb-6 flex flex-wrap gap-5 text-sm">
      <Link href={"/zh" + suffix} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={"/en" + suffix} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    {content.kind === "asset" && content.asset.entityType === "hub" ? <TraditionalPersonalityCategoryBackLink /> : null}
    {content.kind === "mbti" ? <TraditionalMbtiCurrentReader reader={content.reader} />
      : <PublicContentAssetRenderer asset={content.asset} locale="zh-TW" />}
  </>;
}
