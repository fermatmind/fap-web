import { standardFacetConfig } from "./standard-facet-config";

export const attachmentStylesConfig = standardFacetConfig(24, 6, 8, {
  en: { headline: "Original attachment reflection · Full results free", stylesTitle: "Four terms you may see when reading about attachment", focus: "Worry and distance in one close adult relationship", output: "Two separate means and four reference guides" },
  zh: { headline: "原创依恋情境回顾 · 完整结果免费", stylesTitle: "了解依恋时可能遇到的四个术语", focus: "一段成年亲近关系里的担忧与回避", output: "两项独立均分和四份术语指南" },
  "zh-TW": { headline: "原創依附情境回顧 · 完整結果免費", stylesTitle: "談到依附時常見的四個說法", focus: "回想一段成年親密關係裡的擔心與退開", output: "兩項各自的均分和四篇術語說明" },
}, ["3".repeat(24), "555555551111444444442222", "NNNNN" + "3".repeat(19)]);
