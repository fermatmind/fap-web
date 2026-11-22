import { standardFacetConfig } from "./standard-facet-config";

export const humorStyleConfig = standardFacetConfig(24, 6, 3, {
  en: { headline: "Original humour reflection · Full results free", stylesTitle: "Six ways to get a laugh in ordinary company", focus: "How you use different kinds of humour in recent interactions", output: "Six frequency averages and example guides" },
  zh: { headline: "原创幽默习惯回顾 · 完整结果免费", stylesTitle: "平常相处时，六种让人笑出来的方式", focus: "最近几周你多常用到不同的幽默方式", output: "六项频率均分和生活实例指南" },
  "zh-TW": { headline: "原創幽默習慣回顧 · 完整結果免費", stylesTitle: "平常跟人相處，你會用哪種幽默？", focus: "最近幾週你多常用不同方式逗人笑", output: "六項頻率均分和生活例子" },
}, ["3".repeat(24), "543214543214543214543214", "N33333N33333333333333333"]);
