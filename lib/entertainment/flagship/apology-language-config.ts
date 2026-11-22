import { standardFacetConfig } from "./standard-facet-config";

export const apologyLanguageConfig = standardFacetConfig(20, 5, 4, {
  en: { headline: "Original everyday repair reflection · Full results free", stylesTitle: "Five things an apology can do", focus: "Which parts matter to you after ordinary mistakes", output: "Five separate ratings and guides" },
  zh: { headline: "原创道歉偏好回顾 · 完整结果免费", stylesTitle: "一次道歉可以做好这五件事", focus: "普通失误发生后，你看重道歉里的哪些行动", output: "五项独立读数与指南" },
  "zh-TW": { headline: "原創道歉偏好回顧 · 完整結果免費", stylesTitle: "聽到一句道歉，你可能在意這五件事", focus: "日常出了小差錯時，你重視哪些修補方式", output: "五項各自的讀數與指南" },
}, ["3".repeat(20), "55554444333322221111", "N" + "3".repeat(19)]);
