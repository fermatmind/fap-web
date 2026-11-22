import { standardFacetConfig } from "./standard-facet-config";

export const difficultPersonConfig = standardFacetConfig(28, 7, 3, {
  en: { headline: "Original interaction reflection · Full results free", stylesTitle: "Seven behaviours that can strain a conversation", focus: "How often you recall doing specific things over the past four weeks", output: "Seven independent means and example guides" },
  zh: { headline: "原创相处行为回顾 · 完整结果免费", stylesTitle: "让谈话变得费劲的七种做法", focus: "过去四周里你多常做过这些具体的事", output: "七项独立均分与情境指南" },
  "zh-TW": { headline: "原創相處行為回顧 · 完整結果免費", stylesTitle: "聊天卡住時，可能發生的七種情況", focus: "回想近四週，自己多常採取這些做法", output: "七項各自的均分及情境指南" },
}, ["3".repeat(28), "5432143543214354321431234523", "N333333N33333333333333333333"]);
