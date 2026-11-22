import { standardFacetConfig } from "./standard-facet-config";

const basic = standardFacetConfig(48, 10, 6, {
  en: { headline: "Original everyday behaviour checklist · Full results free", stylesTitle: "Eight ways people respond in ordinary situations", focus: "How often you recall doing specific things over the past four weeks", output: "Eight separate frequency averages and guides" },
  zh: { headline: "原创日常行为回顾 · 完整结果免费", stylesTitle: "从八种日常做法回看过去四周", focus: "近四周你多常做过题目描述的事", output: "八项独立频率均分与指南" },
  "zh-TW": { headline: "原創日常行為回顧 · 完整結果免費", stylesTitle: "回想最近四週的八種日常反應", focus: "這四週，你多常出現題目提到的做法", output: "八項各自的頻率均分與閱讀指南" },
}, ["3".repeat(48), "54321432".repeat(6), "N" + "3".repeat(47)]);

export const freudianPersonalityConfig = { ...basic, facets: { ...basic.facets, decimals: 2 } };
