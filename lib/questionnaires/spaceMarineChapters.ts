import type { Locale } from "@/lib/i18n/locales";

/** Editorial craft motifs, not official Chapter insignia or additional results. */
export const chapterHobbyLenses = {
  ultramarines: { color: "#2563eb", zh: "共同计划", en: "Shared plan", mark: "plan" },
  "imperial-fists": { color: "#a16207", zh: "稳固底座", en: "Steady base", mark: "base" },
  "iron-hands": { color: "#475569", zh: "接合试验", en: "Connection trial", mark: "joint" },
  salamanders: { color: "#15803d", zh: "手作纹理", en: "Handmade texture", mark: "texture" },
  "raven-guard": { color: "#6d28d9", zh: "可见细节", en: "Visible detail", mark: "detail" },
  "white-scars": { color: "#be123c", zh: "另一条路线", en: "Another route", mark: "route" },
} as const;

export type ChapterId = keyof typeof chapterHobbyLenses;
export function chapterHobbyLens(id: string) {
  return Object.hasOwn(chapterHobbyLenses, id) ? chapterHobbyLenses[id as ChapterId] : undefined;
}
export function chapterShareCardPath(locale: Locale, id: string, version: string) {
  return `/og/fun/space-marine-chapter?locale=${locale}&portrait=${encodeURIComponent(id)}&v=${encodeURIComponent(version)}-craft`;
}
