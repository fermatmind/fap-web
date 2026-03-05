import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/i18n/locales";

export const LOCALE_COOKIE_NAME = "fm_locale";

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguage,
  defaultLocale = DEFAULT_LOCALE,
}: {
  cookieLocale: string | null | undefined;
  acceptLanguage: string | null | undefined;
  defaultLocale?: Locale;
}): Locale {
  const cookieRaw = String(cookieLocale ?? "").trim();
  if (cookieRaw.length > 0) {
    return normalizeLocale(cookieRaw);
  }

  const accepted = String(acceptLanguage ?? "").trim().toLowerCase();
  if (accepted.includes("zh")) return "zh";
  if (accepted.includes("en")) return "en";

  return defaultLocale;
}
