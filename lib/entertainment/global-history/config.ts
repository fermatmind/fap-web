import type { Locale } from "@/lib/i18n/locales";
import type { Copy } from "../types";

export const GLOBAL_HISTORY_SLUG = "global-history-quiz";
export const GLOBAL_HISTORY_VERSION = "1.0.0";
export const GLOBAL_HISTORY_UPDATED = "2026-11-06";
export const GLOBAL_HISTORY_MINUTES = 4;
export const GLOBAL_HISTORY_QUESTION_COUNT = 12;

export const globalHistoryTitle: Copy = {
  zh: "你的性格最像哪位历史人物？全球卷",
  en: "Which Historical Figure Are You Most Like? World Edition",
};
export const globalHistoryDescription: Copy = {
  zh: "一座历史展馆即将开门。做十二次情境选择，看看哪位历史人物的故事最贴近你的做事方式，带走一张原创插画人物卡。",
  en: "A history exhibition is about to open. Make twelve choices, meet the figure whose story is closest to how you approach them, and take home an illustrated portrait card.",
};
export const globalHistoryMethod: Copy = {
  zh: "十二次选择记录你在六个方面的做法。我们将它们与为每位人物单独编写的故事画像比较，选出整体最接近的一位。同分时优先选吻合维度更多的人物，再按固定编号决定。画像是对历史经历和作品的编辑演绎，结果仅供娱乐。",
  en: "Twelve choices describe your approach in six areas. We compare it with a story profile written for each figure and pick the closest overall. Ties favor more exact matches across the six areas, then a fixed identifier. Profiles are editorial interpretations of historical lives and work. The result is for fun.",
};

export const globalHistoryPath = (locale: Locale) => `/${locale}/tests/play/${GLOBAL_HISTORY_SLUG}`;
export const globalHistoryResultPath = (locale: Locale, id: string) => `${globalHistoryPath(locale)}/results/${id}`;
export const globalHistoryPortraitPath = (id: string) => `/images/global-history/${id}.jpg`;
export const globalHistoryImagePath = (locale: Locale, id: string) =>
  `/og/fun/${GLOBAL_HISTORY_SLUG}?locale=${locale}&portrait=${id}&v=${GLOBAL_HISTORY_VERSION}`;
export const globalHistoryFilename = (locale: Locale, id: string) => `fermatmind-history-${id}-${locale}.png`;
