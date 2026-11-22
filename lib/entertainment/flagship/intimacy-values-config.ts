import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

export const intimacyValuesSamples = [
  { id: "all-rated", answers: "3333333333333333333333333", labels: { en: "All five parts rated", zh: "五项都有读数", "zh-TW": "五項都有讀數" } },
  { id: "varied", answers: "5432154321543215432154321", labels: { en: "Different priorities", zh: "五项重视程度不同", "zh-TW": "五項重視程度不同" } },
  { id: "one-missing", answers: "N3333N3333333333333333333", labels: { en: "One part unscored", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export function intimacyValuesSampleAnswers(quiz: Questionnaire, id: string) {
  const sample = intimacyValuesSamples.find(example => example.id === id);
  if (!sample) throw new Error(`Unknown intimacy values sample ${id}`);
  return bindFacetSampleAnswers(quiz, sample.answers);
}

export const intimacyValuesPresentation = {
  en: {
    endStart: "Take the intimacy values reflection", stylesLink: "Read all five values guides",
    headline: "Original intimacy values reflection · Full results free", guideFree: "All five guides are open before or after answering.",
    stylesTitle: "Five conditions that might matter in a close relationship", method: "How the five priorities are scored", sample: "Illustrative priorities",
    trust: "25 questions · About 5 minutes · Free · No sign-up", current: ["Which conditions you value when getting close to someone", "25 questions · about 5 minutes", "Five separate means and full guides"],
    legend: "Each topic has five prompts. A mean from 1 to 5 requires at least four rated items.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer contributes a rating of ${points}.`,
    unscored: "This answer is unscored. This topic needs at least four rated items to show a mean.",
  },
  zh: {
    endStart: "开始亲密价值观测试", stylesLink: "浏览五份亲密偏好指南",
    headline: "原创亲密价值观回顾 · 完整结果免费", guideFree: "作答前后都可以免费阅读五份指南。",
    stylesTitle: "和别人走近时，哪些条件对你重要", method: "五项重视程度怎样算分", sample: "亲密价值观结果样张",
    trust: "25 题 · 约 5 分钟 · 免费 · 免注册", current: ["和别人建立亲近感时会看重什么", "25 题 · 约 5 分钟", "五项独立读数和完整指南"],
    legend: "每项五道题，至少四题可计分才显示 1–5 分均值。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项给本项计 ${points} 分。`,
    unscored: "这个回答不计分。本项至少需要四题可计分才显示均分。",
  },
  "zh-TW": {
    endStart: "開始親密價值觀測驗", stylesLink: "看看五份親密偏好指南",
    headline: "原創親密價值觀回顧 · 完整結果免費", guideFree: "五份指南在作答前後都能免費閱讀。",
    stylesTitle: "和人拉近距離時，有哪些條件對你重要", method: "五種重視的程度怎麼計分？", sample: "親密價值觀結果範例",
    trust: "25 題 · 約 5 分鐘 · 免費 · 免註冊", current: ["和別人建立親近感時，你重視什麼", "25 題 · 約 5 分鐘", "五組獨立讀數和完整閱讀指南"],
    legend: "每組各有五題，至少四題可計分才會顯示介於 1 至 5 的均分。",
    insufficient: "資料不足", answerScore: (points: number) => `這個答案會在這個分項計入 ${points} 分。`,
    unscored: "這個回答不計分。這一組至少有四題計分才會顯示均分。",
  },
};
