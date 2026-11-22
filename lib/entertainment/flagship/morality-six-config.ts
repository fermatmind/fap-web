import { standardFacetConfig } from "./standard-facet-config";

export const moralitySixConfig = standardFacetConfig(36, 7, 6, {
  en: { headline: "Licensed MFQ-2 items · Six full guides free", stylesTitle: "Six possible concerns when people weigh a decision", focus: "How you respond to the six sets of MFQ-2 statements", output: "Six independent means and guide pages" },
  zh: { headline: "MFQ-2 授权原题 · 六份完整指南免费", stylesTitle: "遇到取舍时，人们可能考虑的六件事", focus: "你怎样回应 MFQ-2 的六组陈述", output: "六项独立均分和解读指南" },
  "zh-TW": { headline: "MFQ-2 授權原題 · 六份完整指南免費", stylesTitle: "做取捨時，六種可以分開想的考量", focus: "你如何回應 MFQ-2 六組題目", output: "六項各自的均分與閱讀指南" },
}, ["3".repeat(36), "543211".repeat(6), "N" + "3".repeat(35)]);
