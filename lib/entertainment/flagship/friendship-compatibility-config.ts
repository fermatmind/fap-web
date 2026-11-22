import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

export const friendshipCompatibilitySamples = [
  { id: "all-rated", answers: "33333333333333333333", labels: { en: "All five parts rated", zh: "五项都有读数", "zh-TW": "五項都有讀數" } },
  { id: "varied", answers: "53142531425314253142", labels: { en: "Different frequencies", zh: "五项频率不同", "zh-TW": "五項頻率不同" } },
  { id: "one-missing", answers: "N3333333333333333333", labels: { en: "One part unscored", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export function friendshipCompatibilitySampleAnswers(quiz: Questionnaire, id: string) {
  const sample = friendshipCompatibilitySamples.find(example => example.id === id);
  if (!sample) throw new Error(`Unknown friendship compatibility sample ${id}`);
  return bindFacetSampleAnswers(quiz, sample.answers);
}

export const friendshipCompatibilityPresentation = {
  en: {
    endStart: "Take the friendship reflection", stylesLink: "Read all five friendship guides",
    headline: "One-person friendship reflection · Full results free", guideFree: "You can read all five guides before answering.",
    stylesTitle: "Five parts of an everyday friendship", method: "How four ratings become a mean", sample: "Illustrative friendship readouts",
    trust: "20 questions · About 5 minutes · Free · No sign-up", current: ["Your observations about one friendship over four weeks", "20 questions · about 5 minutes", "Five separate means and full guides"],
    legend: "Each example shows five separate topics. A topic produces a mean from 1 to 5 only when all four answers are rated.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer contributes a rating of ${points}.`,
    unscored: "This answer is unscored. This topic needs all four rated answers to have a mean.",
  },
  zh: {
    endStart: "开始友谊相处测试", stylesLink: "浏览五份友谊指南",
    headline: "单人友谊回顾 · 完整结果免费", guideFree: "答题前就可以免费阅读五份指南。",
    stylesTitle: "一段日常友谊里，五件值得回想的事", method: "四个回答怎样算成一个均分", sample: "友谊相处结果样张",
    trust: "20 题 · 约 5 分钟 · 免费 · 免注册", current: ["你对一段友谊过去四周的观察", "20 题 · 约 5 分钟", "五项独立读数和完整指南"],
    legend: "每份样张分开展示五个方面。本项四个答案均有效时，才算 1–5 分均值。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项给本项计 ${points} 分。`,
    unscored: "这个回答不计分。本项需要四个可计分答案才能算均分。",
  },
  "zh-TW": {
    endStart: "開始友誼相處測驗", stylesLink: "看看五份友誼指南",
    headline: "單人友誼回顧 · 完整結果免費", guideFree: "作答前就能免費閱讀五份指南。",
    stylesTitle: "一段平日的友誼，有五件事值得回想", method: "四個答案怎麼算出均分？", sample: "友誼相處結果範例",
    trust: "20 題 · 約 5 分鐘 · 免費 · 免註冊", current: ["你近四週對一段友誼的觀察", "20 題 · 約 5 分鐘", "五組獨立讀數與完整閱讀指南"],
    legend: "每份範例分開呈現五組主題。該主題四題都計分時，才會顯示介於 1 至 5 的均分。",
    insufficient: "資料不足", answerScore: (points: number) => `這個答案會在本項計入 ${points} 分。`,
    unscored: "這個回答不計分。該主題需要四個計分答案才會計算均分。",
  },
};
