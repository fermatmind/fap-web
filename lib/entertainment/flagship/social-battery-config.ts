import { standardFacetConfig } from "./standard-facet-config";

export const socialBatteryConfig = standardFacetConfig(20, 5, 3, {
  en: { headline: "Original social energy reflection · Full results free", stylesTitle: "Four experiences behind your social energy", focus: "Recent social demands, quiet recovery and easy company", output: "Four independent frequency averages" },
  zh: { headline: "原创社交耗能回顾 · 完整结果免费", stylesTitle: "社交电量背后的四种生活体验", focus: "近两周的互动压力、协调负担与恢复方式", output: "四项独立的频率均分" },
  "zh-TW": { headline: "原創社交電量回顧 · 完整結果免費", stylesTitle: "四種讓你耗電或回電的社交情境", focus: "最近兩週的互動負荷、安靜休息與自在相處", output: "四項各自的頻率均分" },
}, ["3".repeat(20), "54325432123454321234", "N333N333N33333333333"]);
