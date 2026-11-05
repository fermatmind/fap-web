import type { Copy } from "./types";

export const CHANGAN_SLUG = "changan-history-quiz";
export const CHANGAN_INTERLUDE_AFTER = 4;

export const firstChoiceRule: Copy = {
  zh: "每道题给一种人物画像记一次。次数最高的人物就是你的结果。如果同分，从第一题往后找，最先被选中的领先人物胜出。",
  en: "Each answer adds one point to a portrait. The highest total wins. If totals tie, the tied portrait you picked first in the story wins.",
};

export function changanPortraitPath(id: string) {
  return `/images/changan/${id}.jpg`;
}
