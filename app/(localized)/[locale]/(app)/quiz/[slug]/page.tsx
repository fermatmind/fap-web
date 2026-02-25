import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

function appendQuery(path: string, query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          params.append(key, String(item));
        }
      }
      continue;
    }
    if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default async function DeprecatedQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const canonicalSlug = resolveCanonicalSlug(slug);

  // Deprecated: use /tests/[slug]/take as the single quiz engine.
  permanentRedirect(appendQuery(localizedPath(`/tests/${canonicalSlug}/take`, locale), query));
}
