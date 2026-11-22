import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

export const communicationStyleSamples = [
  { id: "all-rated", answers: "333333333333333333333333", labels: { en: "All four parts rated", zh: "四项都有读数", "zh-TW": "四項都有讀數" } },
  { id: "varied", answers: "543254325432543254325432", labels: { en: "Different frequencies", zh: "四种不同频率", "zh-TW": "四種不同頻率" } },
  { id: "one-missing", answers: "N333N333N333333333333333", labels: { en: "One part unscored", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export function communicationStyleSampleAnswers(quiz: Questionnaire, id: string) {
  const sample = communicationStyleSamples.find(example => example.id === id);
  if (!sample) throw new Error(`Unknown communication style sample ${id}`);
  return bindFacetSampleAnswers(quiz, sample.answers);
}

export const communicationStylePresentation = {
  en: {
    endStart: "Take the communication style test", stylesLink: "Read all four communication guides",
    headline: "Original communication reflection · Full results free", guideFree: "All four guides are open before you answer.",
    stylesTitle: "Four ways you might handle a difficult conversation", method: "How reported frequency becomes a mean", sample: "Illustrative communication readouts",
    trust: "24 questions · About 6 minutes · Free · No sign-up", current: ["What you tend to do when there is something to say", "24 questions · about 6 minutes", "Four independent means and four full guides"],
    legend: "The examples keep all four topics separate and show both the mean and the number of rated answers.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer adds a frequency rating of ${points}.`,
    unscored: "This answer is not counted. This topic needs at least four rated items.",
  },
  zh: {
    endStart: "开始沟通风格测试", stylesLink: "浏览四份沟通指南",
    headline: "原创沟通行为回顾 · 完整结果免费", guideFree: "答题前就可以免费阅读四份指南。",
    stylesTitle: "有件事需要说出口时，四种不同做法", method: "怎样计算做法的频率均分", sample: "沟通风格结果样张",
    trust: "24 题 · 约 6 分钟 · 免费 · 免注册", current: ["有话要说时你通常怎么做", "24 题 · 约 6 分钟", "四项独立均分和四份完整指南"],
    legend: "四组分别解读，样张同时显示均分和有效回答数量。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项给本项计 ${points} 分。`,
    unscored: "这个回答不计分。每项至少有四题可计分才显示均分。",
  },
  "zh-TW": {
    endStart: "開始溝通風格測驗", stylesLink: "看看四份溝通指南",
    headline: "原創溝通行為回顧 · 完整結果免費", guideFree: "作答前就能免費閱讀四份指南。",
    stylesTitle: "有件事得談談時，四種不同的做法", method: "作答頻率怎麼算成均分？", sample: "溝通風格結果範例",
    trust: "24 題 · 約 6 分鐘 · 免費 · 免註冊", current: ["有些話得說出口時，你通常怎麼做", "24 題 · 約 6 分鐘", "四組獨立均分、四份完整指南"],
    legend: "四個主題各自呈現，範例同時列出均分和有效作答的題數。",
    insufficient: "資料不足", answerScore: (points: number) => `這個答案會在該主題計入 ${points} 分。`,
    unscored: "這個回答不計分。該主題至少要有四題可計分，才會顯示均分。",
  },
};
