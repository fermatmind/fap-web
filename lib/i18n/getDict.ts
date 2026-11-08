import en from "@/lib/i18n/locales/en";
import zh from "@/lib/i18n/locales/zh";
import traditional from "@/lib/i18n/locales/zh-TW";
import type { I18nRegistry, SiteDictionary } from "@/lib/i18n/types";
import { DEFAULT_LOCALE, isSupportedLocale, normalizeDisplayLocale, normalizeLocale, type Locale } from "@/lib/i18n/locales";

const dictionaries: I18nRegistry = {
  en,
  zh,
};

export function resolveLocale(locale?: string | null): Locale {
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return normalizeLocale(locale) || DEFAULT_LOCALE;
}

export function getDictSync(locale?: string | null): SiteDictionary {
  // Reader copy is independent of the legacy form/report and commerce locale.
  if (normalizeDisplayLocale(locale) === "zh-TW") return traditional;
  return dictionaries[resolveLocale(locale)] ?? dictionaries[DEFAULT_LOCALE];
}

export async function getDict(locale?: string | null): Promise<SiteDictionary> {
  return getDictSync(locale);
}
