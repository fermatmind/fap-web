import type { DisplayLocale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { bindFacetSampleAnswers } from "./facet-samples";

const sampleLabels = [
  { en: "All parts rated", zh: "各项都有读数", "zh-TW": "各項都有讀數" },
  { en: "Different readouts", zh: "分项读数不同", "zh-TW": "各分項讀數不同" },
  { en: "An unscored part", zh: "有一项资料不足", "zh-TW": "有一項資料不足" },
] as const;
const sampleIds = ["all-rated", "varied", "one-missing"] as const;

type PresentationInputs = Record<DisplayLocale, { headline: string; stylesTitle: string; focus: string; output: string }>;

export function facetPresentation(items: number, minutes: number, minimum: number, copy: PresentationInputs) {
  return {
    en: {
      ...copy.en, endStart: "Start test", stylesLink: "Read the result guides", guideFree: "All guides are open before you answer.",
      method: "How each part is scored", sample: "Illustrative readouts",
      trust: `${items} questions · About ${minutes} minutes · Free · No sign-up`,
      current: [copy.en.focus, `${items} questions · about ${minutes} minutes`, copy.en.output],
      legend: "Read each part on its own. The sample shows its mean and how many answers were rated.",
      insufficient: "Insufficient information",
      answerScore: (points: number) => `This answer contributes ${points} to this part.`,
      unscored: `This answer is unscored. A part needs at least ${minimum} rated answers to show a mean.`,
    },
    zh: {
      ...copy.zh, endStart: "免费开始测试", stylesLink: "浏览完整结果指南", guideFree: "作答前就可以免费阅读所有指南。",
      method: "各项结果分别怎么算", sample: "分项结果样张",
      trust: `${items} 题 · 约 ${minutes} 分钟 · 免费 · 免注册`,
      current: [copy.zh.focus, `${items} 题 · 约 ${minutes} 分钟`, copy.zh.output],
      legend: "各项分别读。样张同时列出均分和实际可计分的题数。",
      insufficient: "资料不足",
      answerScore: (points: number) => `这个答案给本项计 ${points} 分。`,
      unscored: `这个答案不计分。本项至少需要 ${minimum} 个计分答案才会显示均分。`,
    },
    "zh-TW": {
      ...copy["zh-TW"], endStart: "免費開始測驗", stylesLink: "看看完整結果指南", guideFree: "開始作答前，就能免費閱讀所有指南。",
      method: "每個分項怎麼計分？", sample: "分項結果範例",
      trust: `${items} 題 · 約 ${minutes} 分鐘 · 免費 · 免註冊`,
      current: [copy["zh-TW"].focus, `${items} 題 · 約 ${minutes} 分鐘`, copy["zh-TW"].output],
      legend: "每一項分開看。範例會列出均分以及實際計分的題數。",
      insufficient: "資料不足",
      answerScore: (points: number) => `這個答案會在該分項計入 ${points} 分。`,
      unscored: `這個答案不計分。該分項至少要有 ${minimum} 題計分才會顯示均分。`,
    },
  };
}

export function standardFacetConfig(
  items: number,
  minutes: number,
  minimum: number,
  copy: PresentationInputs,
  answers: readonly [string, string, string],
) {
  const cases = sampleIds.map((id, index) => ({ id, labels: sampleLabels[index], choices: answers[index] }));
  return {
    facets: {
      cases, showRated: true,
      answers: (quiz: Questionnaire, id: string) => {
        const sample = cases.find(example => example.id === id);
        if (!sample) throw new Error(`Unknown sample ${id} for ${quiz.slug}`);
        return bindFacetSampleAnswers(quiz, sample.choices);
      },
    },
    presentation: facetPresentation(items, minutes, minimum, copy),
  };
}
