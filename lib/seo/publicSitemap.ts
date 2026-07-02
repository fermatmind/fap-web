import { buildApiUrl } from "@/lib/api-base";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { CANONICAL_SITE_URL } from "@/lib/site";

export type BackendPublicSitemapItem = {
  loc?: unknown;
  lastmod?: unknown;
};

export type BackendPublicSitemapPayload = {
  ok?: unknown;
  items?: BackendPublicSitemapItem[];
};

export type PublicSitemapEntry = {
  loc: string;
  lastmod?: string;
};

const BACKEND_SITEMAP_SOURCE_TIMEOUT_MS = 20_000;
const OWNED_SITEMAP_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

function normalizeSiteUrl(siteUrl: string): string {
  return String(siteUrl || CANONICAL_SITE_URL).trim().replace(/\/+$/, "") || CANONICAL_SITE_URL;
}

function normalizePath(pathname: string): string {
  const value = String(pathname || "").trim() || "/";
  if (value === "/") return "/";
  return (value.startsWith("/") ? value : `/${value}`).replace(/\/+$/, "");
}

function normalizeLastmod(value: unknown): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}

function xmlEscape(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toOwnedPublicPath(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  try {
    const url = raw.startsWith("/") ? new URL(raw, CANONICAL_SITE_URL) : new URL(raw);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || !OWNED_SITEMAP_HOSTS.has(hostname) || url.search || url.hash) {
      return "";
    }

    return normalizePath(url.pathname);
  } catch {
    return "";
  }
}

function buildCanonicalLoc(pathname: string, siteUrl: string): string {
  const base = normalizeSiteUrl(siteUrl);
  const path = normalizePath(pathname);
  return path === "/" ? base : `${base}${path}`;
}

export function buildPublicSitemapEntries(
  payload: BackendPublicSitemapPayload,
  siteUrl: string = CANONICAL_SITE_URL
): PublicSitemapEntry[] {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const entriesByLoc = new Map<string, PublicSitemapEntry>();

  for (const item of items) {
    const path = toOwnedPublicPath(item?.loc);
    if (!path || !shouldIncludeInSitemap(path, { indexEligible: true, indexState: "indexed" })) {
      continue;
    }

    const loc = buildCanonicalLoc(path, siteUrl);
    const lastmod = normalizeLastmod(item?.lastmod);
    const existing = entriesByLoc.get(loc);
    if (!existing || lastmod) {
      entriesByLoc.set(loc, lastmod ? { loc, lastmod } : existing || { loc });
    }
  }

  return [...entriesByLoc.values()].sort((left, right) => left.loc.localeCompare(right.loc));
}

export function buildPublicSitemapXml(entries: PublicSitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = ["  <url>", `    <loc>${xmlEscape(entry.loc)}</loc>`];
      if (entry.lastmod) {
        parts.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
      }
      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function createTimeoutSignal(parentSignal: AbortSignal | undefined): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();

  if (parentSignal?.aborted) {
    controller.abort();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  const timer = setTimeout(() => controller.abort(), BACKEND_SITEMAP_SOURCE_TIMEOUT_MS);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

export async function fetchBackendPublicSitemapSource(signal?: AbortSignal): Promise<BackendPublicSitemapPayload> {
  const timeoutSignal = createTimeoutSignal(signal);

  try {
    const response = await fetch(buildApiUrl("/v0.5/seo/sitemap-source"), {
      headers: { Accept: "application/json" },
      signal: timeoutSignal.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch backend sitemap source: ${response.status}`);
    }

    return (await response.json()) as BackendPublicSitemapPayload;
  } finally {
    timeoutSignal.cleanup();
  }
}
