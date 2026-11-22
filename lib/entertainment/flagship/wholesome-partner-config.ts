import { standardFacetConfig } from "./standard-facet-config";

export const wholesomePartnerConfig = standardFacetConfig(32, 7, 4, {
  en: { headline: "Original relationship behaviour reflection · Full results free", stylesTitle: "Eight everyday actions that make up a relationship", focus: "Your own actions in one close relationship over the past four weeks", output: "Eight separate frequency means and guides" },
  zh: { headline: "原创伴侣行为回顾 · 完整结果免费", stylesTitle: "一段关系中的八种具体相处动作", focus: "回顾近四周自己在一段亲近关系里的做法", output: "八项独立频率均分和解读指南" },
  "zh-TW": { headline: "原創伴侶行為回顧 · 完整結果免費", stylesTitle: "親近相處中的八種日常做法", focus: "回想近四週，自己在一段親近關係裡的行動", output: "八項各自的頻率均分與解讀指南" },
}, ["3".repeat(32), "52341234143254325234123414325432", "N" + "3".repeat(31)]);
