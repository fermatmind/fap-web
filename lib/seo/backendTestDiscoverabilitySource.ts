import { buildApiUrl } from "@/lib/api-base";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import type { Locale } from "@/lib/i18n/locales";

type BackendScaleCatalogItem = {
  slug?: unknown;
  title?: unknown;
  title_i18n?: unknown;
  description?: unknown;
  scale_code?: unknown;
  highlight_excerpt_i18n?: unknown;
  is_public?: unknown;
  is_active?: unknown;
  is_indexable?: unknown;
};

export type BackendDiscoverabilityTestEntry = {
  locale: Locale;
  slug: string;
  path: string;
  title: string;
  description: string;
  scaleCode: string;
  highlightExcerptI18n: Record<string, string>;
};

const TEST_CATALOG_LOCALES: Array<{ locale: Locale; apiLocale: string }> = [
  { locale: "en", apiLocale: "en" },
  { locale: "zh", apiLocale: "zh-CN" },
];

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, recordValue]) => [key, cleanString(recordValue)] as const)
      .filter(([, recordValue]) => recordValue.length > 0)
  );
}

function isPublicIndexableCatalogItem(item: BackendScaleCatalogItem): boolean {
  return item.is_public !== false && item.is_active !== false && item.is_indexable !== false;
}

function localizedTitle(item: BackendScaleCatalogItem, locale: Locale): string {
  const titleI18n = cleanStringRecord(item.title_i18n);
  const fallbackTitle = cleanString(item.title);

  if (locale === "zh") {
    return titleI18n.zh || titleI18n["zh-CN"] || titleI18n.en || fallbackTitle;
  }

  return titleI18n.en || titleI18n.zh || titleI18n["zh-CN"] || fallbackTitle;
}

function normalizeCatalogItem(item: BackendScaleCatalogItem, locale: Locale): BackendDiscoverabilityTestEntry | null {
  const slug = cleanString(item.slug).toLowerCase();
  if (!slug || !isPublicIndexableCatalogItem(item)) {
    return null;
  }

  const path = `/${locale}/tests/${slug}`;
  if (!shouldIncludeInSitemap(path)) {
    return null;
  }

  return {
    locale,
    slug,
    path,
    title: localizedTitle(item, locale),
    description: cleanString(item.description),
    scaleCode: cleanString(item.scale_code),
    highlightExcerptI18n: cleanStringRecord(item.highlight_excerpt_i18n),
  };
}

async function fetchBackendCatalogItems(apiLocale: string): Promise<BackendScaleCatalogItem[]> {
  const response = await fetch(buildApiUrl(`/v0.3/scales/catalog?locale=${encodeURIComponent(apiLocale)}`), {
    headers: {
      Accept: "application/json",
      "X-FAP-Locale": apiLocale,
    },
    ...PUBLIC_API_CACHE_OPTIONS,
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json().catch(() => null)) as { items?: unknown } | null;
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return items.filter((item): item is BackendScaleCatalogItem => Boolean(item && typeof item === "object"));
}

export async function listBackendDiscoverabilityTestEntries(): Promise<BackendDiscoverabilityTestEntry[]> {
  const entries = await Promise.all(
    TEST_CATALOG_LOCALES.map(async ({ locale, apiLocale }) => {
      const items = await fetchBackendCatalogItems(apiLocale).catch(() => []);

      return filterVisiblePublicTestEntries(
        items
          .map((item) => normalizeCatalogItem(item, locale))
          .filter((item): item is BackendDiscoverabilityTestEntry => item !== null)
      );
    })
  );

  const dedupedByPath = new Map<string, BackendDiscoverabilityTestEntry>();
  for (const entry of entries.flat()) {
    dedupedByPath.set(entry.path, entry);
  }

  return [...dedupedByPath.values()].sort((left, right) => left.path.localeCompare(right.path));
}
