import type { Questionnaire, Text } from "./types";

export const workRoleStates = ["guided", "owned", "supported", "na"] as const;
export type WorkRoleState = typeof workRoleStates[number];
export const workRoleLabels: Record<WorkRoleState, Text> = {
  guided: { en: "Worked with step-by-step guidance", zh: "在逐步指导下参与" },
  owned: { en: "Owned the task with agreed checkpoints", zh: "按约定检查点承担任务" },
  supported: { en: "Supported another person's task", zh: "支持他人完成任务" },
  na: { en: "No instance / cannot assess / prefer not to answer", zh: "没有实例／无法判断／不愿回答" },
};
export const workRoleDefinitions = [
  { id: "problem-clarification", profileId: "problem-clarification-reading" },
  { id: "delivery-checking", profileId: "delivery-checking-reading" },
  { id: "shared-contribution", profileId: "shared-contribution-reading" },
] as const;
export type WorkRoleResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 12;
  workRole: {
    id: string;
    profileId: string;
    counts: Record<WorkRoleState, number>;
    rows: { questionId: string; stateId: WorkRoleState }[];
  }[];
};
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const text = (value: unknown): value is Text => object(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());

/** Original task-context records. Categories never imply an ordered proficiency scale. */
export function isWorkRole12ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "work-role12" || quiz.slug !== "work-role-reflection"
    || quiz.code !== "FM_WORK_ROLE_CONTEXT12" || !object(quiz.source)
    || quiz.source.kind !== "fermatmind_original_work_role_context_inventory"
    || quiz.source.formCode !== "fm_work_role_context12_v1"
    || quiz.source.itemBankVersion !== "original12_bilingual_task_contexts_v1"
    || quiz.source.scoringVersion !== "three_fourtask_categorical_counts_no_levels_v1"
    || quiz.source.resultContentVersion !== "three_full_work_role_readings_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 12
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3) return false;
  if (!Array.from(quiz.directions).every((part, index) => object(part) && part.id === workRoleDefinitions[index].id
    && part.itemCount === 4 && text(part.title))) return false;
  for (const [index, question] of quiz.questions.entries()) {
    if (!object(question) || question.id !== `WRC_${String(index + 1).padStart(2, "0")}` || !text(question.prompt)
      || question.reverse !== undefined || question.correctOptionId !== undefined || question.explanation !== undefined
      || !Array.isArray(question.options) || question.options.length !== 4) return false;
    if (!Array.from(question.options).every((option, position) => object(option) && option.id === workRoleStates[position]
      && option.directionId === workRoleDefinitions[Math.floor(index / 4)].id && option.score === undefined
      && text(option.label) && option.label.en === workRoleLabels[workRoleStates[position]].en
      && option.label.zh === workRoleLabels[workRoleStates[position]].zh)) return false;
  }
  return Array.from(quiz.profiles).every((profile, index) => object(profile) && profile.id === workRoleDefinitions[index].profileId
    && Array.isArray(profile.directionIds) && profile.directionIds.length === 1
    && profile.directionIds[0] === workRoleDefinitions[index].id && text(profile.title) && text(profile.headline)
    && text(profile.summary) && text(profile.scoreReading) && object(profile.seo)
    && text(profile.seo.title) && text(profile.seo.description) && Array.isArray(profile.sections)
    && profile.sections.length === 7
    && Array.from(profile.sections).every(section => object(section) && typeof section.id === "string" && Boolean(section.id)
      && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length === 2
      && Array.from(section.paragraphs).every(text))
    && new Set(profile.sections.map(section => section.id)).size === 7);
}

export function recordWorkRole12(quiz: Questionnaire, answers: unknown): WorkRoleResult {
  if (!isWorkRole12ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(question => question.id));
  let answered = 0;
  for (const [id, state] of Object.entries(answers)) {
    if (!ids.has(id) || !workRoleStates.some(allowed => allowed === state)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  return { status: "complete", answered: 12, workRole: workRoleDefinitions.map((part, index) => {
    const counts: Record<WorkRoleState, number> = { guided: 0, owned: 0, supported: 0, na: 0 };
    const rows = quiz.questions.slice(index * 4, index * 4 + 4).map(question => {
      const stateId = answers[question.id] as WorkRoleState;
      counts[stateId]++;
      return { questionId: question.id, stateId };
    });
    return { ...part, counts, rows };
  }) };
}
