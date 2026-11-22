import { standardFacetConfig } from "./standard-facet-config";

export const parentingStyleConfig = standardFacetConfig(12, 4, 6, {
  en: { headline: "Original caregiver reflection · Full results free", stylesTitle: "Four familiar ways to discuss caregiving", focus: "Your own warm responses and clear boundaries in the past four weeks", output: "Two behavior averages and four background guides" },
  zh: { headline: "原创照顾行为回顾 · 完整结果免费", stylesTitle: "四份指南怎样帮助你谈论照顾方式", focus: "回看近四周自己的温暖回应与清楚界限", output: "两项行为均分和四份背景指南" },
  "zh-TW": { headline: "原創照顧行為回顧 · 完整結果免費", stylesTitle: "談到照顧孩子，常見的四種做法", focus: "回想近四週，你如何理解孩子並說清楚界線", output: "兩項行為均分和四份背景指南" },
}, ["3".repeat(12), "555555222222", "N" + "3".repeat(11)]);
