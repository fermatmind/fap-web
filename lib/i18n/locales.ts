export const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("zh")) return "zh";
  return "en";
}

export function stripLocalePrefix(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!isSupportedLocale(segment)) return pathname;

  const stripped = pathname.replace(new RegExp(`^/${segment}`), "");
  return stripped.length ? stripped : "/";
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function toggleLocalePath(pathname: string, targetLocale: Locale): string {
  return localizedPath(stripLocalePrefix(pathname), targetLocale);
}

export function toApiLocale(value: string | null | undefined): "en" | "zh-CN" {
  return normalizeLocale(value) === "zh" ? "zh-CN" : "en";
}
