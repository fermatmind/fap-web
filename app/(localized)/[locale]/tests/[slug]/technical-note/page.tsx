import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { EnneagramTechnicalNotePage } from "@/components/result/enneagram/EnneagramTechnicalNotePage";
import { SCALE_CANONICAL_SLUG_MAP, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { getTestBySlug, resolveTestTitleByLocale } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);
  const test = await getTestBySlug(slug, locale);
  const title = test ? resolveTestTitleByLocale(test, locale) : "九型人格技术说明";

  return {
    title: `${title} - Technical Note`,
    alternates: {
      canonical: localizedPath(`/tests/${slug}/technical-note`, locale),
    },
  };
}

export default async function EnneagramTechnicalNoteRoute({
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
  if (!test || slug !== SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM || test.scale_code !== "ENNEAGRAM") {
    return notFound();
  }

  return (
    <EnneagramTechnicalNotePage
      locale={locale}
      testSlug={slug}
      testTitle={resolveTestTitleByLocale(test, locale)}
    />
  );
}
