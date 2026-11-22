import type { DisplayLocale } from "@/lib/i18n/locales";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { scorePairedDimensionsQuestionnaire } from "@/lib/questionnaires/pairedDimensions";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { facetPresentation } from "./standard-facet-config";

type Sample = {
  id: string;
  answers: string | readonly string[];
  labels: Record<DisplayLocale, string>;
};

export function countSamples(
  quiz: Questionnaire,
  locale: DisplayLocale,
  localeKey: "zh" | "en",
  examples: readonly Sample[],
) {
  return examples.map(({ id, answers, labels }) => {
    const form = Object.fromEntries(quiz.questions.map((question, index) => [question.id, answers[index]]));
    const title = labels[locale];
    if (quiz.kind === "paired-dimensions") {
      const result = scorePairedDimensionsQuestionnaire(quiz, form);
      if (result.status !== "complete") throw new Error(`Invalid landing sample ${id} for ${quiz.slug}`);
      return { id, title, axes: quiz.pairedDimensions!.map(({ id: axis, title: axisTitle, poleIds: [left, right], comparisons }, index) => {
        const { counts } = result.pairedDimensions[index];
        return { id: axis, title: axisTitle[localeKey], value: counts[left], maximum: comparisons, score: `${counts[left]} : ${counts[right]}` };
      }) };
    }
    const result = scoreDirectionalQuestionnaire(quiz, form);
    if (result.status !== "complete") throw new Error(`Invalid landing sample ${id} for ${quiz.slug}`);
    return { id, title, axes: quiz.directions.map(direction => ({
      id: direction.id, title: direction.title[localeKey], value: result.counts[direction.id], maximum: direction.comparisons!,
      score: `${result.counts[direction.id]} / ${direction.comparisons}`,
    })) };
  });
}

export function countSamplePresentation(
  questions: number,
  minutes: number,
  copy: Parameters<typeof facetPresentation>[3],
  legends: Record<DisplayLocale, string>,
) {
  const presentation = facetPresentation(questions, minutes, 0, copy);
  return {
    en: { ...presentation.en, method: "How choices are counted", legend: legends.en },
    zh: { ...presentation.zh, method: "每道选择怎样计数", legend: legends.zh },
    "zh-TW": { ...presentation["zh-TW"], method: "每個選項如何計次？", legend: legends["zh-TW"] },
  };
}
