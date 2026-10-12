import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { EnneagramTechnicalNotePage, RiasecTechnicalNotePage } from "@/components/result/enneagram/EnneagramTechnicalNotePage";
import { SCALE_CANONICAL_SLUG_MAP, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { getTestBySlug, resolveTestTitleByLocale } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

const TECHNICAL_NOTE_ROUTE_CONFIG = {
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    scaleCode: "ENNEAGRAM",
    Component: EnneagramTechnicalNotePage,
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    scaleCode: "RIASEC",
    Component: RiasecTechnicalNotePage,
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);
  const test = await getTestBySlug(slug, locale);
  const title = test ? resolveTestTitleByLocale(test, locale) : "Technical Note";
  const routeConfig = TECHNICAL_NOTE_ROUTE_CONFIG[slug as keyof typeof TECHNICAL_NOTE_ROUTE_CONFIG];
  const routePath = `/tests/${slug}/technical-note`;

  return {
    title: `${title} - ${locale === "en" ? "Technical Note" : "技术说明"}`,
    description: locale === "en" ? `Methods, score interpretation, evidence status, and use boundaries for ${title}.` : `${title}的方法、分数解释、证据状态与使用边界。`,
    alternates: {
      canonical: localizedPath(routePath, locale),
      ...(test && routeConfig && test.scale_code === routeConfig.scaleCode ? {
        languages: {
          "zh-CN": localizedPath(routePath, "zh"),
          en: localizedPath(routePath, "en"),
        },
      } : {}),
    },
  };
}

export default async function TechnicalNoteRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);

  if (slug !== requestedSlug) {
    permanentRedirect(localizedPath(`/tests/${slug}/technical-note`, locale));
  }

  const test = await getTestBySlug(slug, locale);
  const routeConfig = TECHNICAL_NOTE_ROUTE_CONFIG[slug as keyof typeof TECHNICAL_NOTE_ROUTE_CONFIG];
  if (!test || !routeConfig || test.scale_code !== routeConfig.scaleCode) {
    return notFound();
  }

  const TechnicalNotePage = routeConfig.Component;

  return (
    <TechnicalNotePage
      locale={locale}
      testSlug={slug}
      testTitle={resolveTestTitleByLocale(test, locale)}
    />
  );
}
