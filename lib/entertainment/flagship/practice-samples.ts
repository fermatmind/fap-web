import type { DisplayLocale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { facetPresentation } from "./standard-facet-config";

export function practiceSamplePresentation(
  questions: number,
  minutes: number,
  copy: Parameters<typeof facetPresentation>[3],
) {
  const presentation = facetPresentation(questions, minutes, 0, copy);
  return {
    en: {
      ...presentation.en, method: "How the practice is marked", sample: "Three illustrative answer sets",
      legend: "Each bar shows how many questions the sample answers correctly in that topic.",
      answer: (correct: boolean) => correct ? "Correct. Add 1 to this topic and the total." : "Incorrect. The counts stay the same.",
    },
    zh: {
      ...presentation.zh, method: "一道练习题怎样判分", sample: "三份示例答卷",
      legend: "每条长柱显示该主题答对的题数。",
      answer: (correct: boolean) => correct ? "答对。本项和总正确数各加 1。" : "答错。两项正确数都不变。",
    },
    "zh-TW": {
      ...presentation["zh-TW"], method: "一道練習題怎麼計分？", sample: "三份範例答卷",
      legend: "每條長條顯示該主題中答對幾題。",
      answer: (correct: boolean) => correct ? "答對。該主題和總答對題數各加 1。" : "答錯。兩個答對題數都不變。",
    },
  };
}

const modes: readonly { id: string; labels: Record<DisplayLocale, string> }[] = [
  { id: "all-correct", labels: { en: "Every question correct", zh: "全部答对", "zh-TW": "每題都答對" } },
  { id: "mixed", labels: { en: "An uneven practice run", zh: "各项表现有差异", "zh-TW": "各主題的答對題數不同" } },
  { id: "none-correct", labels: { en: "Every question for review", zh: "每题都可以复习", "zh-TW": "每題都可以再練習" } },
];

export function practiceSampleAnswers(quiz: Questionnaire) {
  return modes.map(({ id, labels }, mode) => ({
    id, labels,
    answers: quiz.questions.map((question, index) => {
      const keyed = mode === 0 || (mode === 1 && index % 4 <= Math.floor(index / 4) % 4);
      const option = keyed ? question.correctOptionId : question.options.find(item => item.id !== question.correctOptionId)?.id;
      if (!option) throw new Error(`Missing option for ${quiz.slug} sample ${id}`);
      return option;
    }),
  }));
}
