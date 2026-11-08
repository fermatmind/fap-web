import type { DisplayLocale } from "@/lib/i18n/locales";
import copy from "@/lib/i18n/zh-TW/account.generated.json";

/** Convert only the explicit frontend-owned account strings, never user/API data. */
export function accountText(locale: DisplayLocale, source: string): string {
  if (locale !== "zh-TW") return source;
  const unit = (copy.units as Record<string, { text: string }>)[source];
  if (!unit) throw new Error("Traditional account copy is missing.");
  return unit.text;
}

/** Existing guest/history transport and commercial regions retain their legacy language. */
export function accountDataLocale(locale: DisplayLocale): "en" | "zh" {
  return locale === "zh-TW" ? "zh" : locale;
}
