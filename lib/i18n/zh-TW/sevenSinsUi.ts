import source from "./seven-sins-ui.source.json";
import generated from "./seven-sins-ui.generated.json";
import type { DisplayLocale } from "../locales";

const copies = new Map(Object.entries(source).map(([key, value]) => [value.zh,
  (generated.units as Record<string, { text: string }>)[`lib/i18n/zh-TW/seven-sins-ui.source.json/${key}`]?.text]));
export function sevenSinsDisplay(value: string, locale: DisplayLocale): string {
  if (locale !== "zh-TW") return value;
  const translated = copies.get(value);
  if (!translated) throw new Error("Missing Traditional Chinese seven-sins display copy");
  return translated;
}
