export const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh";

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
  if (locale === "zh" && normalized === "/") return "/";
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function toggleLocalePath(pathname: string, targetLocale: Locale): string {
  return localizedPath(stripLocalePrefix(pathname), targetLocale);
}

export function toApiLocale(value: string | null | undefined): "en" | "zh-CN" {
  return normalizeLocale(value) === "zh" ? "zh-CN" : "en";
}

/** Display coverage is broader than the backend-owned assessment/CMS locale set. */
export const DISPLAY_LOCALES = ["en", "zh", "zh-TW"] as const;
export type DisplayLocale = (typeof DISPLAY_LOCALES)[number];
// Keep language names in their own language, independent of the current page.
export const LANGUAGE_MENU_LABELS = {
  zh: "简体中文",
  en: "English",
  "zh-TW": "繁體中文",
} satisfies Record<DisplayLocale, string>;

export const LANGUAGE_MENU_ORDER = ["zh", "en", "zh-TW"] as const;

export function normalizeDisplayLocale(value: string | null | undefined): DisplayLocale | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "zh-tw") return "zh-TW";
  if (normalized === "zh" || normalized === "zh-cn") return "zh";
  if (normalized === "en") return "en";
  return null;
}

/** A partial display locale must never silently acquire a backend form/report locale. */
export function apiLocaleForDisplay(value: DisplayLocale): "en" | "zh-CN" | null {
  return value === "zh-TW" ? null : value === "zh" ? "zh-CN" : "en";
}
