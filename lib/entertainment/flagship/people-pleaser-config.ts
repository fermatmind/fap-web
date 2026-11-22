import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

export const peoplePleaserSamples = [
  { id: "all-rated", answers: "3333333333", labels: { en: "All three parts rated", zh: "三项都有读数", "zh-TW": "三項都有讀數" } },
  { id: "varied", answers: "5555444333", labels: { en: "Different means", zh: "三项均分不同", "zh-TW": "三項均分不同" } },
  { id: "one-missing", answers: "NN33333333", labels: { en: "One part unscored", zh: "有一项资料不足", "zh-TW": "有一項資料不足" } },
] as const;

export function peoplePleaserSampleAnswers(quiz: Questionnaire, id: string) {
  const sample = peoplePleaserSamples.find(example => example.id === id);
  if (!sample) throw new Error(`Unknown people-pleasing sample ${id}`);
  return bindFacetSampleAnswers(quiz, sample.answers);
}

export const peoplePleaserPresentation = {
  en: {
    endStart: "Take the people-pleasing test", stylesLink: "Read all three reflection guides",
    headline: "10-item People Pleasing Scale · Full results free", guideFree: "The three full guides are open before you answer.",
    stylesTitle: "Three situations where it can be hard to say what you need", method: "How the three parts are calculated", sample: "Illustrative people-pleasing readouts",
    trust: "10 questions · About 4 minutes · Free · No sign-up", current: ["What you report about your needs, responsibility and expectations", "10 questions · about 4 minutes", "Three separate means and full guides"],
    legend: "Each of the three parts needs at least three rated answers. Their means and rated counts are shown separately.",
    insufficient: "Insufficient information", answerScore: (points: number) => `This answer contributes ${points} to this part.`,
    unscored: "This answer is excluded from the mean. Each part needs at least three rated answers.",
  },
  zh: {
    endStart: "开始讨好倾向测试", stylesLink: "浏览三份解读指南",
    headline: "PPS 10 条自评 · 完整结果免费", guideFree: "答题前就可以免费阅读三份指南。",
    stylesTitle: "三个容易把自己的需求放到后面的时刻", method: "三项均分分别怎么算", sample: "讨好倾向结果样张",
    trust: "10 题 · 约 4 分钟 · 免费 · 免注册", current: ["需求、责任和他人期待方面的自我回顾", "10 题 · 约 4 分钟", "三项独立均分和完整指南"],
    legend: "每项至少要有三题可计分。样张分别给出均分和有效题数。",
    insufficient: "资料不足", answerScore: (points: number) => `这个选项给本项计 ${points} 分。`,
    unscored: "这个回答不计分。本项至少需要三个可计分的答案。",
  },
  "zh-TW": {
    endStart: "開始討好傾向測驗", stylesLink: "看看三份解讀指南",
    headline: "PPS 10 題自評 · 完整結果免費", guideFree: "作答前就能免費閱讀三份指南。",
    stylesTitle: "三種容易把自己的需要放在後面的情況", method: "三個分項的均分怎麼算？", sample: "討好傾向結果範例",
    trust: "10 題 · 約 4 分鐘 · 免費 · 免註冊", current: ["自己的需要、責任與他人期待", "10 題 · 約 4 分鐘", "三組獨立均分與完整閱讀指南"],
    legend: "每一項至少需要三個計分答案。範例會分開列出均分和有效作答題數。",
    insufficient: "資料不足", answerScore: (points: number) => `這個答案會在該分項計入 ${points} 分。`,
    unscored: "這個回答不計分。這個分項至少需要三個計分答案。",
  },
};
