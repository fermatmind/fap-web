import { canonicalUrl } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/locales";
import type { BreadcrumbItem as SchemaBreadcrumbItem } from "@/lib/seo/generateSchema";

export type PublicContentKind =
  | "hub"
  | "entity"
  | "guide"
  | "method"
  | "data"
  | "test"
  | "career"
  | "support"
  | "business";

type LinkLike = {
  href: string | null | undefined;
};

const INTERNAL_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com", "localhost", "127.0.0.1"]);

function normalizePathname(pathname: string): string {
  const cleaned = pathname.replace(/\/{2,}/g, "/").trim();
  if (cleaned === "") {
    return "/";
  }

  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function resolveLocaleFromPath(pathname: string): Locale | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? null;
  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

function isInternalAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return INTERNAL_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function normalizeInternalPath(pathname: string, locale?: Locale): string {
  const normalizedPath = normalizePathname(pathname);
  const targetLocale = locale ?? resolveLocaleFromPath(normalizedPath) ?? DEFAULT_LOCALE;
  return localizedPath(stripLocalePrefix(normalizedPath), targetLocale);
}

export function normalizePublicHref(href: string | null | undefined, locale?: Locale): string {
  const text = String(href ?? "").trim();
  if (text === "") {
    return "";
  }

  if (text.startsWith("#") || text.startsWith("mailto:") || text.startsWith("tel:")) {
    return text;
  }

  if (/^https?:\/\//i.test(text)) {
    if (!isInternalAbsoluteUrl(text)) {
      return text;
    }

    const url = new URL(text);
    const normalizedPath = normalizeInternalPath(url.pathname, locale);
    return `${normalizedPath}${url.search}${url.hash}`;
  }

  const [pathWithQuery, hash = ""] = text.split("#", 2);
  const [pathname, query = ""] = pathWithQuery.split("?", 2);
  const normalizedPath = normalizeInternalPath(pathname, locale);
  const queryPart = query ? `?${query}` : "";
  const hashPart = hash ? `#${hash}` : "";

  return `${normalizedPath}${queryPart}${hashPart}`;
}

export function normalizePublicLinks<T extends LinkLike>(items: T[], locale?: Locale): T[] {
  return items.map((item) => ({
    ...item,
    href: normalizePublicHref(item.href, locale),
  }));
}

export function normalizeBreadcrumbItems(
  items: SchemaBreadcrumbItem[],
  locale?: Locale
): SchemaBreadcrumbItem[] {
  return items.map((item) => ({
    ...item,
    path: canonicalUrl(normalizePublicHref(item.path, locale)),
  }));
}

export function inferPublicContentKind(href: string | null | undefined): PublicContentKind | null {
  const normalized = normalizePublicHref(href);
  if (!normalized || normalized.startsWith("http") || normalized.startsWith("mailto:")) {
    return null;
  }

  const path = stripLocalePrefix(normalized);

  if (path === "/topics" || path.startsWith("/topics/")) return "hub";
  if (path === "/personality" || path.startsWith("/personality/")) return "entity";
  if (path === "/methods" || path.startsWith("/methods/")) return "method";
  if (path === "/data" || path.startsWith("/data/")) return "data";
  if (path === "/tests" || path.startsWith("/tests/")) return "test";
  if (path === "/career" || path.startsWith("/career/")) return "career";
  if (path === "/business" || path.startsWith("/business/")) return "business";
  if (
    path === "/help" ||
    path.startsWith("/help/") ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/refund"
  ) {
    return "support";
  }
  if (path === "/articles" || path.startsWith("/articles/")) return "guide";

  return null;
}

export function formatPublicContentKind(kind: PublicContentKind | null, locale: Locale): string | null {
  if (!kind) {
    return null;
  }

  if (locale === "zh") {
    return {
      hub: "专题 Hub",
      entity: "实体页",
      guide: "指南页",
      method: "方法页",
      data: "数据页",
      test: "测试页",
      career: "职业页",
      support: "支持页",
      business: "企业页",
    }[kind];
  }

  return {
    hub: "Hub",
    entity: "Entity",
    guide: "Guide",
    method: "Method",
    data: "Data",
    test: "Test",
    career: "Career",
    support: "Support",
    business: "Business",
  }[kind];
}
