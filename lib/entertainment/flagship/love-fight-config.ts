import { standardFacetConfig } from "./standard-facet-config";

export const loveFightConfig = standardFacetConfig(20, 6, 5, {
  en: { headline: "Original relationship conflict reflection · Full results free", stylesTitle: "Four moments that can change a disagreement", focus: "What you did during disagreements in one relationship", output: "Four frequency readouts and guides" },
  zh: { headline: "原创争执行为回顾 · 完整结果免费", stylesTitle: "一场争执里的四个转折点", focus: "在一段关系里，你面对分歧时做过什么", output: "四项独立频率读数与指南" },
  "zh-TW": { headline: "原創爭執行為回顧 · 完整結果免費", stylesTitle: "一次爭執中，哪些做法會讓對話轉向？", focus: "回想一段關係中，有分歧時你做過的事", output: "四項各自的頻率讀數與指南" },
}, ["3".repeat(20), "55555444443333322222", "N" + "3".repeat(19)]);
