import type { DisplayLocale } from "@/lib/i18n/locales";

/** Editorial labels for the existing eight activity metaphors; never used for scoring. */
export const moonPhasePresentations = {
  "new-moon": { name: { zh: "新月", en: "New Moon" }, conclusion: { zh: "先留白，再决定从哪里开始。", en: "Make space before choosing a beginning." } },
  "waxing-crescent": { name: { zh: "渐盈月牙", en: "Waxing Crescent" }, conclusion: { zh: "先试一小步，随时可以改主意。", en: "Try one small step, with room to change it." } },
  "first-quarter": { name: { zh: "上弦月", en: "First Quarter" }, conclusion: { zh: "说清取舍，选这次更合适的路。", en: "Name the tradeoff and choose a route for now." } },
  "waxing-gibbous": { name: { zh: "盈凸月", en: "Waxing Gibbous" }, conclusion: { zh: "改好一个细节，就让这一版够用。", en: "Refine one detail and let this version be enough." } },
  "full-moon": { name: { zh: "满月", en: "Full Moon" }, conclusion: { zh: "收好这一小版，决定怎样呈现。", en: "Gather a small version and choose how to show it." } },
  "waning-gibbous": { name: { zh: "亏凸月", en: "Waning Gibbous" }, conclusion: { zh: "把有用的经验，分享给想听的人。", en: "Offer a useful experience to someone who wants it." } },
  "last-quarter": { name: { zh: "下弦月", en: "Last Quarter" }, conclusion: { zh: "放下一项额外要求，留下合适的范围。", en: "Drop an optional extra and keep a scope that fits." } },
  "waning-crescent": { name: { zh: "渐亏月牙", en: "Waning Crescent" }, conclusion: { zh: "留一个安静间隔，不急着接下一件事。", en: "Leave a quiet interval before the next activity." } },
} as const;
export type MoonPhaseId = keyof typeof moonPhasePresentations;
export function moonPhasePresentation(id: string) { return Object.hasOwn(moonPhasePresentations, id) ? moonPhasePresentations[id as MoonPhaseId] : undefined; }
export function moonPhaseImage(id: string) { return `/images/moon-phases/${id}.svg`; }
export const moonPhaseDiagramNote = {
  zh: "月相图采用北半球常见示意方向：渐盈右侧亮、渐亏左侧亮；实际天空中的朝向会随观察位置和时间变化。这里只作趣味意象，不表示出生或当日月相。",
  en: "Diagrams use a common Northern Hemisphere orientation: waxing lit on the right, waning on the left. The sky’s actual orientation varies with place and time. These are playful metaphors, not your birth phase or today’s Moon.",
};
export function moonPhaseDisplayCopy(translate?: (text: string) => string) {
  return (text: string) => translate
    ? translate(text).replaceAll("漸盈月牙", "眉月").replaceAll("漸虧月牙", "殘月")
      .replaceAll("測試", "測驗").replaceAll("標籤頁", "分頁").replaceAll("橫版", "橫式").replaceAll("豎版", "直式")
    : text;
}

export function moonPhaseSharePath(locale: DisplayLocale, id?: string) { return `/og/fun/moon-phase?locale=${locale}${id ? `&portrait=${encodeURIComponent(id)}` : ""}&v=1.0.0-phases`; }
