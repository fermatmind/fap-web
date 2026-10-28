import type { Questionnaire, Text } from "./types";

export const miniVirtuesDefinitions = [
  { id: "RECOGNITION_SELF_VIEW", profileId: "recognition-reading" },
  { id: "RESOURCE_SECURITY_SHARING", profileId: "resources-reading" },
  { id: "DESIRE_BOUNDARY", profileId: "desire-boundaries-reading" },
  { id: "COMPARISON_APPRECIATION", profileId: "comparison-reading" },
  { id: "REWARD_MODERATION", profileId: "rewards-reading" },
  { id: "ANGER_PATIENCE", profileId: "anger-reading" },
  { id: "ACTIVATION_REST", profileId: "starting-rest-reading" },
] as const;

type MiniVirtuesQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-virtues" };
export type MiniVirtuesResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 28;
  miniVirtues: { id: string; profileId: string; rawSum: number; mean: number }[];
  equalFactorGroups: string[][];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
const sections = (v: unknown): boolean => Array.isArray(v) && v.length > 0
  && Array.from(v).every(s => object(s) && typeof s.id === "string" && Boolean(s.id.trim()) && text(s.title)
    && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
  && new Set(v.map(s => s.id)).size === v.length;

/** Exact original VIRTUES_EXPLORATION form; seven mixed observation groups, never a moral scale. */
export function isMiniVirtuesConfigurationValid(input: unknown): input is MiniVirtuesQuestionnaire {
  if (!object(input) || input.kind !== "mini-virtues" || input.slug !== "seven-sins-virtues-test"
    || input.code !== "VIRTUES_EXPLORATION" || !object(input.source)
    || input.source.kind !== "fermatmind_original_mini_reuse"
    || input.source.formCode !== "virtues_exploration_likert_28"
    || input.source.itemBankVersion !== "0.1.0-preview" || input.source.scoringVersion !== "0.1.0-preview"
    || input.source.resultContentVersion !== "0.2.0-editorial-candidate"
    || input.source.psychometricValidationCompleted !== false || input.minimumRatedItems !== undefined
    || !Array.isArray(input.questions) || input.questions.length !== 28
    || !Array.isArray(input.directions) || input.directions.length !== 7
    || !Array.isArray(input.profiles) || input.profiles.length !== 7 || !text(input.instructions)) return false;
  const quiz = input as unknown as MiniVirtuesQuestionnaire;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === miniVirtuesDefinitions[i].id
    && d.itemCount === 4 && d.comparisons === undefined && text(d.title))) return false;
  for (const [index, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `VIRTUES_LK_${String(index + 1).padStart(3, "0")}` || !text(q.prompt)
      || q.reverse !== false || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 5) return false;
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === String(position + 1)
      && o.directionId === miniVirtuesDefinitions[Math.floor(index / 4)].id
      && o.score === position + 1 && text(o.label))) return false;
  }
  if (!text(quiz.title) || !text(quiz.seoTitle) || !text(quiz.description) || !text(quiz.introduction)
    || !sections(quiz.guide) || quiz.guide.length < 3
    || !["virtues-scoring", "virtues-complete", "virtues-source"].every((id, i) => quiz.guide[i]?.id === id && quiz.guide[i]?.paragraphs.length === 1)
    || !Array.isArray(quiz.faq) || quiz.faq.length === 0
    || !Array.from(quiz.faq).every(f => object(f) && text(f.question) && text(f.answer))
    || (quiz.references !== undefined && (!Array.isArray(quiz.references)
      || !Array.from(quiz.references).every(r => object(r) && text(r.title) && typeof r.url === "string"
        && /^https:\/\//.test(r.url))))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === miniVirtuesDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === miniVirtuesDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && sections(p.sections) && p.sections.length === 8);
}

export function scoreMiniVirtuesQuestionnaire(quiz: unknown, answers: unknown): MiniVirtuesResult {
  if (!isMiniVirtuesConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!ids.has(id) || !["1", "2", "3", "4", "5"].some(option => option === value)) return { status: "invalid", answered };
    answered++;
  }
  // Numeric midpoint3 is a valid source response. No NA option; all28 are required.
  if (answered !== 28) return { status: "incomplete", answered };
  const miniVirtues = miniVirtuesDefinitions.map((part, index) => {
    const rawSum = quiz.questions.slice(index * 4, index * 4 + 4).reduce((sum, q) => sum + Number(answers[q.id]), 0);
    return { id: part.id, profileId: part.profileId, rawSum, mean: rawSum / 4 };
  });
  const groups = new Map<number, string[]>();
  for (const part of miniVirtues) groups.set(part.rawSum, [...(groups.get(part.rawSum) ?? []), part.id]);
  return { status: "complete", answered: 28, miniVirtues, equalFactorGroups: [...groups.values()].filter(group => group.length > 1) };
}
