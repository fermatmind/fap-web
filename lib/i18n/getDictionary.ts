import en from "@/lib/i18n/dict/en.json";
import zh from "@/lib/i18n/dict/zh.json";
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/lib/i18n/locales";

const dictionaries = {
  en,
  zh,
};

export type Dictionary = typeof en;

export function getDictionarySync(locale?: string | null): Dictionary {
  if (locale && isSupportedLocale(locale)) {
    return dictionaries[locale];
  }

  return dictionaries[DEFAULT_LOCALE];
}

export async function getDictionary(locale?: string | null): Promise<Dictionary> {
  return getDictionarySync(locale);
}

export function resolveLocale(locale?: string | null): Locale {
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}
