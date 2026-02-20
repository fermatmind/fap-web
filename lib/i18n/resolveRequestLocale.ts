import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/i18n/locales";

type HeaderReader = Pick<Headers, "get">;

export function resolveRequestLocale(requestHeaders: HeaderReader): Locale {
  const headerLocale = requestHeaders.get("x-locale");
  if (!headerLocale) return DEFAULT_LOCALE;
  return normalizeLocale(headerLocale);
}
