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

  return {
    title: `${title} - Technical Note`,
    alternates: {
      canonical: localizedPath(`/tests/${slug}/technical-note`, locale),
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
