import { isLikertConfigurationValid } from "./scoring";
import type { Questionnaire } from "./types";

export const SD4_SUBSCALES = ["machiavellianism", "narcissism", "psychopathy", "sadism"] as const;
const ANCHORS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export function isSd4ConfigurationValid(quiz: Questionnaire): boolean {
  return isLikertConfigurationValid(quiz) && quiz.slug === "dark-tetrad-sd4"
    && quiz.code === "SD4_28" && quiz.minimumRatedItems === 7 && quiz.questions.length === 28
    && quiz.directions.length === 4
    && quiz.directions.every((d, i) => d.id === SD4_SUBSCALES[i] && d.itemCount === 7)
    && quiz.questions.every((q, i) => q.id === `SD4_${String(i + 1).padStart(3, "0")}`
      && q.reverse === false && q.options.every(o => o.directionId === SD4_SUBSCALES[Math.floor(i / 7)])
      && q.options.slice(0, 5).every((o, j) => o.id === String(j + 1) && o.label.en === ANCHORS[j])
      && q.options[5].id === "na");
}
