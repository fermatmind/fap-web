import type { DisplayLocale } from "@/lib/i18n/locales";
import { axisReadings } from "./wave3c-copy/axes";
import { dimensionReadings, dimensionStates } from "./wave3c-copy/dimensions";
import { fieldsReadings, practiceReadings } from "./wave3c-copy/practice";
import { wave3cScope } from "./wave3cScope";

export type Wave3cReadingId = "overview" | "tied" | keyof typeof practiceReadings;

export const wave3cHonorCopy = {
  axes: axisReadings, dimensions: dimensionReadings, dimensionStates, practice: practiceReadings, fields: fieldsReadings,
};

export function getWave3cHonorCopy(slug: keyof typeof wave3cScope, id: Wave3cReadingId, locale: DisplayLocale, fields = false) {
  const item = wave3cScope[slug];
  const topics = item.shell === "scalar" ? axisReadings : dimensionReadings;
  const rows = item.shell === "practice"
    ? (fields ? fieldsReadings : practiceReadings)[id as keyof typeof practiceReadings]
    : id === "missing" || id === "tied" ? dimensionStates[id] : id === "overview" ? topics[slug as keyof typeof topics] : undefined;
  if (!rows) throw new Error(`Unknown archive honor reading: ${slug}/${id}`);
  const [first, second, third, soulVerdict] = rows[locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0];
  return { personalityTags: [first, second, third] as [string, string, string], soulVerdict };
}
