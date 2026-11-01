import content from "./problem-solving-critical-thinking.json";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection } from "../types";

export function problemSolvingResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}

const originalExplanation = {"en": "The first plan totals 55 minutes and includes ten for review. The second totals 65 and exceeds the limit; the last two omit required review time even though their totals fit. Planning can reserve an opportunity to check work under these stated numbers. It cannot guarantee that mistakes will be found or that a project will receive any particular grade.", "zh": "第一项总55分钟且有10分钟复查。第二项65分钟超限，后两项虽总时长可行，却没有要求的复查。规划能在给定数量下留出检查机会，不能保证发现错误或获得某个成绩。"};
const clarifiedExplanation = {"en": "Option B totals 55 minutes and includes ten for review. Option A totals 65 and exceeds the limit; the last two omit required review time even though their totals fit. Planning can reserve an opportunity to check work under these stated numbers. It cannot guarantee that mistakes will be found or that a project will receive any particular grade.", "zh": "B方案总55分钟且有10分钟复查。A方案65分钟超限，后两项虽总时长可行，却没有要求的复查。规划能在给定数量下留出检查机会，不能保证发现错误或获得某个成绩。"};

/** Clarify the shuffled A/B plan references without changing tasks or keys. */
export function problemSolvingResultQuestions(questions: Questionnaire["questions"]): Questionnaire["questions"] {
  let changed = false;
  const prepared = questions.map(question => {
    if (question.id !== "PROBLEM_15" || question.explanation?.en !== originalExplanation.en || question.explanation?.zh !== originalExplanation.zh) return question;
    changed = true;
    return { ...question, explanation: { ...clarifiedExplanation } };
  });
  return changed ? prepared : questions;
}
