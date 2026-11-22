import { facetPresentation } from "./standard-facet-config";

export const optimismPresentation = facetPresentation(10, 3, 10, {
  en: { headline: "Public-domain IPIP item reflection · Full results free", stylesTitle: "Five ways to read the score range", focus: "Your expectations when an everyday plan or possibility is uncertain", output: "An outlook score and the matching score-band guide" },
  zh: { headline: "IPIP公有领域条目自评 · 完整结果免费", stylesTitle: "用五份指南读懂分数区间", focus: "日常计划还没有定下来时你会怎样预期", output: "期待倾向分数与相应区间指南" },
  "zh-TW": { headline: "IPIP 樂觀題組 · 完整結果免費", stylesTitle: "用五份指南閱讀不同的分數區間", focus: "日常計畫還有變數時，你通常抱持什麼期待", output: "期待傾向分數與對應區間指南" },
});

export const optimismSamples = [
  { id: "lower-outlook", answers: "1515151555", labels: { en: "Lower outlook in the sample", zh: "这份样张的总分偏低", "zh-TW": "這份範例的總分較低" } },
  { id: "middle-outlook", answers: "5555555555", labels: { en: "On the boundary of two readings", zh: "正好在两个区间之间", "zh-TW": "剛好落在兩個區間的界線" } },
  { id: "higher-outlook", answers: "5151515111", labels: { en: "Higher outlook in the sample", zh: "这份样张的总分偏高", "zh-TW": "這份範例的總分較高" } },
];

export const optimismSpectrum = {
  en: { scoreLabel: "Raw score", meanLabel: "Mean", endpoints: ["lower outlook", "higher outlook"] },
  zh: { scoreLabel: "原始总分", meanLabel: "平均分", endpoints: ["期待较低", "期待较高"] },
  "zh-TW": { scoreLabel: "原始總分", meanLabel: "平均分", endpoints: ["期待較低", "期待較高"] },
} as const;
