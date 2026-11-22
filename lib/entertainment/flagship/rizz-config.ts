import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

export const rizzSamples = [
  { id: "all-rated", answers: "33333333333333333333", labels: { en: "All four parts rated", zh: "四项都有读数", "zh-TW": "四項都有讀數" } },
  { id: "varied", answers: "543254325432NNNNNNNN", labels: { en: "Different frequencies", zh: "不同做法的频率", "zh-TW": "不同做法的頻率" } },
  { id: "one-missing", answers: "N333N333N33333333333", labels: { en: "One part unscored", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export function rizzSampleAnswers(quiz: Questionnaire, id: string) {
  const sample = rizzSamples.find(example => example.id === id);
  if (!sample) throw new Error(`Unknown Rizz sample ${id}`);
  return bindFacetSampleAnswers(quiz, sample.answers);
}

export const rizzPresentation = {
  en: {
    endStart: "Take the conversation quiz", stylesLink: "Read all four conversation guides",
    headline: "Original conversation reflection · Full results free", guideFree: "Read all four guides before or after answering.",
    stylesTitle: "Four moments worth noticing in a conversation", method: "How reported frequency becomes a mean", sample: "Illustrative conversation readouts",
    trust: "20 questions · About 6 minutes · Free · No sign-up", current: ["How often you tried a given conversational move", "20 questions · about 6 minutes", "Four separate means, counts and guides"],
    legend: "Each topic has five items. The readout shows its mean from 1 to 5 and how many items you could rate.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer adds a rating of ${points} to this topic.`,
    unscored: "This response is not counted. A topic needs at least three rated items to have a mean.",
  },
  zh: {
    endStart: "开始聊天互动测试", stylesLink: "浏览四份对话指南",
    headline: "原创聊天互动回顾 · 完整结果免费", guideFree: "作答前后都可以免费阅读四份指南。",
    stylesTitle: "回看一次聊天中的四个时刻", method: "怎样用回答频率计算均分", sample: "聊天互动结果样张",
    trust: "20 题 · 约 6 分钟 · 免费 · 免注册", current: ["过去四周你多常用某种聊天做法", "20 题 · 约 6 分钟", "四项独立均分、有效题数和指南"],
    legend: "每项都含五道题。样张显示有效频率的 1–5 分均值和可计分题数。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项给本项计 ${points} 分。`,
    unscored: "这个回答不计分。每项至少有三题可计分，才显示均分。",
  },
  "zh-TW": {
    endStart: "開始聊天互動測驗", stylesLink: "看看四份對話指南",
    headline: "原創聊天互動回顧 · 完整結果免費", guideFree: "四份指南在作答前後都能免費閱讀。",
    stylesTitle: "回看對話中四個值得留意的時刻", method: "回答的頻率怎麼算成均分？", sample: "聊天互動結果範例",
    trust: "20 題 · 約 6 分鐘 · 免費 · 免註冊", current: ["過去四週你多常在對話中這麼做", "20 題 · 約 6 分鐘", "四組獨立均分、有效題數與閱讀指南"],
    legend: "每個主題有五道題。這裡會顯示介於 1 至 5 的均分和可計分的題數。",
    insufficient: "資料不足", answerScore: (points: number) => `這個答案會在該主題計入 ${points} 分。`,
    unscored: "這個回答不計分。該主題至少有三題可計分才會顯示均分。",
  },
};
