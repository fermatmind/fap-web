import { tests } from "../../.velite";

export type SitemapLocale = "en" | "zh";

export type SitemapSourceItem = {
  slug: string;
  lastmod?: string;
  is_indexable?: boolean;
};

type SourcePayload = {
  items?: SitemapSourceItem[];
};

function uniqueBySlug(items: SitemapSourceItem[]): SitemapSourceItem[] {
  const bySlug = new Map<string, SitemapSourceItem>();
  for (const item of items) {
    const slug = String(item.slug ?? "").trim();
    if (!slug) continue;
    bySlug.set(slug, {
      slug,
      lastmod: item.lastmod,
      is_indexable: item.is_indexable,
    });
  }
  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function fallbackFromVelite(): SitemapSourceItem[] {
  return uniqueBySlug(
    tests.map((test) => ({
      slug: test.slug,
      lastmod: test.last_updated ?? test.updated_at,
      is_indexable: true,
    }))
  );
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export function buildSitemapXml(urls: Array<{ loc: string; lastmod?: string }>): string {
  const body = urls
    .map((item) => {
      const lastmod = parseDate(item.lastmod);
      return [
        "  <url>",
        `    <loc>${item.loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, body, `</urlset>`].join("\n");
}

export function buildSitemapIndexXml(urls: string[]): string {
  const body = urls
    .map((loc) => {
      return ["  <sitemap>", `    <loc>${loc}</loc>`, "  </sitemap>"].join("\n");
    })
    .join("\n");

  return [`<?xml version="1.0" encoding="UTF-8"?>`, `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, body, `</sitemapindex>`].join("\n");
}

export async function loadSitemapSource(locale: SitemapLocale, origin: string): Promise<SitemapSourceItem[]> {
  const localeHeader = locale === "zh" ? "zh-CN" : "en";
  const endpoint = `${origin.replace(/\/$/, "")}/api/v0.3/scales/sitemap-source?locale=${locale}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "X-FAP-Locale": localeHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackFromVelite();
    }

    const payload = (await response.json()) as SourcePayload;
    if (!Array.isArray(payload.items)) {
      return fallbackFromVelite();
    }

    const normalized = uniqueBySlug(
      payload.items.map((item) => ({
        slug: String(item.slug ?? "").trim(),
        lastmod: item.lastmod,
        is_indexable: item.is_indexable,
      }))
    );

    return normalized.length > 0 ? normalized : fallbackFromVelite();
  } catch {
    return fallbackFromVelite();
  }
}
