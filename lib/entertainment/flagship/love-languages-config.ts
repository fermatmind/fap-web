import { standardFacetConfig } from "./standard-facet-config";

export const loveLanguagesConfig = standardFacetConfig(50, 10, 3, {
  en: { headline: "Original expression and reception reflection · Full results free", stylesTitle: "Five ways care can show up", focus: "Which gestures matter when you give and when you receive", output: "Ten separate averages and five guides" },
  zh: { headline: "原创关心方式自评 · 完整结果免费", stylesTitle: "关心可以用这五种方式说出来", focus: "表达关心与接收关心时，哪些举动对你有意义", output: "十项独立均分和五份指南" },
  "zh-TW": { headline: "原創關心方式自評 · 完整結果免費", stylesTitle: "關心對方，可以有五種做法", focus: "表達與收到關心時，你在意哪些舉動", output: "十個分開算的均分與五份指南" },
}, ["3".repeat(50), "5555544444333332222211111".repeat(2), "NNN" + "3".repeat(47)]);
