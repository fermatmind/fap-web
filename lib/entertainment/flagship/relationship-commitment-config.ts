import { standardFacetConfig } from "./standard-facet-config";

export const relationshipCommitmentConfig = standardFacetConfig(24, 7, 6, {
  en: { headline: "Original commitment reflection · Full results free", stylesTitle: "Four parts of a relationship to think through separately", focus: "Your own experience in a current relationship during the past month", output: "Four frequency means and four public readings" },
  zh: { headline: "原创关系投入回顾 · 完整结果免费", stylesTitle: "一段关系里，四件值得分开想的事", focus: "回看过去一个月你在当前关系中的经历", output: "四项独立频率均分与公开指南" },
  "zh-TW": { headline: "原創關係投入回顧 · 完整結果免費", stylesTitle: "在一段關係裡，可以分開想的四件事", focus: "回想過去一個月目前這段關係的實際經驗", output: "四項各自的頻率均分與公開指南" },
}, ["3".repeat(24), "543252321434543212345432", "N" + "3".repeat(23)]);
