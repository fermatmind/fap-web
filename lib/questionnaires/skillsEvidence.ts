import type { Questionnaire, Text } from "./types";

export const skillsEvidenceStates = ["recent", "older", "explore", "na"] as const;
export type SkillsEvidenceState = typeof skillsEvidenceStates[number];
export const skillsEvidenceDefinitions = [
  { id: "methods", profileId: "methods-reading" },
  { id: "tools", profileId: "tools-reading" },
  { id: "communication", profileId: "communication-reading" },
  { id: "domain", profileId: "domain-reading" },
] as const;
export type SkillsEvidenceResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 20;
  skillsEvidence: {
    id: string;
    profileId: string;
    counts: Record<SkillsEvidenceState, number>;
    rows: { questionId: string; stateId: SkillsEvidenceState }[];
  }[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** Closed, non-scoring projection of the original twenty-task example inventory. */
export function isSkillsEvidenceConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "skills-evidence" || quiz.slug !== "skills-audit"
    || quiz.code !== "FM_SKILL_EXAMPLE_INVENTORY20" || !object(quiz.source)
    || quiz.source.kind !== "fermatmind_original_skill_example_inventory"
    || quiz.source.formCode !== "fm_skills_example_inventory20_v1"
    || quiz.source.itemBankVersion !== "fm_skills_example_inventory20_v1"
    || quiz.source.scoringVersion !== "fm_skills_fourgroups_five_task_state_counts_no_score_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4 || !text(quiz.instructions)) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === skillsEvidenceDefinitions[i].id
    && d.itemCount === 5 && text(d.title))) return false;
  for (const [index, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `SKI_${String(index + 1).padStart(2, "0")}` || !text(q.prompt)
      || q.reverse !== undefined || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 4) return false;
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === skillsEvidenceStates[position]
      && o.directionId === skillsEvidenceDefinitions[Math.floor(index / 5)].id
      && o.score === undefined && text(o.label))) return false;
  }
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === skillsEvidenceDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === skillsEvidenceDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
    && new Set(p.sections.map(s => s.id)).size === 6);
}

export function scoreSkillsEvidenceQuestionnaire(quiz: Questionnaire, answers: unknown): SkillsEvidenceResult {
  if (!isSkillsEvidenceConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questionIds = new Set(quiz.questions.map(q => q.id));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!questionIds.has(id) || !skillsEvidenceStates.some(state => state === value)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, skillsEvidence: skillsEvidenceDefinitions.map((part, index) => {
    const counts: Record<SkillsEvidenceState, number> = { recent: 0, older: 0, explore: 0, na: 0 };
    const rows = quiz.questions.slice(index * 5, index * 5 + 5).map(q => {
      const stateId = answers[q.id] as SkillsEvidenceState;
      counts[stateId]++;
      return { questionId: q.id, stateId };
    });
    return { id: part.id, profileId: part.profileId, counts, rows };
  }) };
}
