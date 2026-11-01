import content from "./ai-literacy.json";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection } from "../types";

export function aiLiteracyResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}

const originalExplanation = {"en": "The first request makes the intended output and constraints inspectable. A clear prompt can guide an output but does not guarantee compliance or truth. Check the resulting notice against the notes and length instead of treating the prompt itself as proof that the result meets every condition.", "zh": "首项使目标和约束便于检查。清楚提示可引导输出，但不保证遵守或真实。仍应按笔记及字数核结果，不能把写过提示当成已满足条件的证据。"};
const clarifiedExplanation = {"en": "The specified request makes the intended output and constraints inspectable. A clear prompt can guide an output but does not guarantee compliance or truth. Check the resulting notice against the notes and length instead of treating the prompt itself as proof that the result meets every condition.", "zh": "明确给出这些条件的请求使目标和约束便于检查。清楚提示可引导输出，但不保证遵守或真实。仍应按笔记及字数核结果，不能把写过提示当成已满足条件的证据。"};

/** Remove a stale positional reference from the reviewed request explanation. */
export function aiLiteracyResultQuestions(questions: Questionnaire["questions"]): Questionnaire["questions"] {
  let changed = false;
  const prepared = questions.map(question => {
    if (question.id !== "AI_06" || question.explanation?.en !== originalExplanation.en || question.explanation?.zh !== originalExplanation.zh) return question;
    changed = true;
    return { ...question, explanation: { ...clarifiedExplanation } };
  });
  return changed ? prepared : questions;
}
