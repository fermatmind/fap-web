import type { Questionnaire, Text } from "./types";

export const miniFrictionDefinitions = [
  { id: "DIRECTNESS_IMPACT", profileId: "directness-reading" },
  { id: "WITHDRAWAL_DISTANCE", profileId: "pause-reading" },
  { id: "EXPECTATION_MISMATCH", profileId: "expectations-reading" },
  { id: "FOLLOW_THROUGH_GAPS", profileId: "updates-reading" },
  { id: "BOUNDARY_STYLE_MISMATCH", profileId: "boundaries-reading" },
] as const;
export type MiniFrictionResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 20;
  miniFriction: { id: string; profileId: string; rawSum: number; mean: number }[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** Closed projection of the original DISLIKED_REASON 20-item five-by-four form. */
export function isMiniFrictionConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "mini-friction" || quiz.slug !== "annoying-person-test"
    || quiz.code !== "DISLIKED_REASON" || !object(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_reuse"
    || quiz.source.formCode !== "disliked_reason_likert_20"
    || quiz.source.itemBankVersion !== "0.1.0-preview" || quiz.source.scoringVersion !== "0.1.0-preview"
    || quiz.source.resultContentVersion !== "0.2.0-editorial-candidate"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5 || !text(quiz.instructions)) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === miniFrictionDefinitions[i].id
    && d.itemCount === 4 && text(d.title))) return false;
  for (const [index, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `DISLIKED_LK_${String(index + 1).padStart(3, "0")}` || !text(q.prompt)
      || q.reverse !== false || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 5) return false;
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === String(position + 1)
      && o.directionId === miniFrictionDefinitions[Math.floor(index / 4)].id
      && o.score === position + 1 && text(o.label))) return false;
  }
  if (!text(quiz.title) || !text(quiz.seoTitle) || !text(quiz.description) || !text(quiz.introduction)
    || !Array.isArray(quiz.guide) || quiz.guide.length < 3
    || !Array.from(quiz.guide).every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
    || new Set(quiz.guide.map(s => s.id)).size !== quiz.guide.length
    || !Array.isArray(quiz.faq) || quiz.faq.length === 0
    || !Array.from(quiz.faq).every(f => object(f) && text(f.question) && text(f.answer))
    || (quiz.references !== undefined && (!Array.isArray(quiz.references)
      || !Array.from(quiz.references).every(r => object(r) && text(r.title) && typeof r.url === "string"
        && /^https:\/\//.test(r.url))))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === miniFrictionDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === miniFrictionDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 8
    && Array.from(p.sections).every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
    && new Set(p.sections.map(s => s.id)).size === 8);
}

export function scoreMiniFrictionQuestionnaire(quiz: Questionnaire, answers: unknown): MiniFrictionResult {
  if (!isMiniFrictionConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!ids.has(id) || !["1", "2", "3", "4", "5"].some(option => option === value)) return { status: "invalid", answered };
    answered++;
  }
  // Source suppresses every factor interpretation until all twenty responses are valid.
  // Source midpoint 3 is numeric; this form has no unscored/NA answer.
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, miniFriction: miniFrictionDefinitions.map((part, index) => {
    const rawSum = quiz.questions.slice(index * 4, index * 4 + 4).reduce((sum, q) => sum + Number(answers[q.id]), 0);
    return { id: part.id, profileId: part.profileId, rawSum, mean: rawSum / 4 };
  }) };
}
