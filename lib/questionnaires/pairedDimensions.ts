import type { Questionnaire, Text } from "./types";

export type PairedDimensionConfiguration = { id: string; title: Text; poleIds: [string, string]; comparisons: 12 };
export type PairedDimensionsResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 24;
  pairedDimensions: { id: string; counts: Record<string, number>; leaders: string[]; profileId: string }[];
  pairedProfileIds: string[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
const signature = (ids: string[]) => [...ids].sort().join("|");

/** Original LOVE_TYPE: two separately counted 12-choice comparisons, without a combined type. */
export function isPairedDimensionsConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "paired-dimensions" || quiz.code !== "LOVE_TYPE"
    || !object(quiz.source) || quiz.source.formCode !== "love_type_paired_choice_24"
    || !Array.isArray(quiz.pairedDimensions) || quiz.pairedDimensions.length !== 2
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 24
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 6) return false;
  const dimensions = quiz.pairedDimensions;
  if (!dimensions.every(d => object(d) && typeof d.id === "string" && /^[A-Z][A-Z_]+$/.test(d.id) && text(d.title)
    && d.comparisons === 12 && Array.isArray(d.poleIds) && d.poleIds.length === 2
    && d.poleIds.every(p => typeof p === "string" && /^[A-Z][A-Z_]+$/.test(p)) && new Set(d.poleIds).size === 2)
    || new Set(dimensions.map(d => d.id)).size !== 2) return false;
  const allPoles = dimensions.flatMap(d => d.poleIds);
  if (new Set(allPoles).size !== 4 || !quiz.directions.every(d => object(d) && allPoles.includes(d.id) && text(d.title) && d.comparisons === 12)
    || new Set(quiz.directions.map(d => d.id)).size !== 4) return false;
  const ids = new Set<string>(), counts = Object.fromEntries(allPoles.map(p => [p, { A: 0, B: 0 }]));
  const questionsPerDimension = Object.fromEntries(dimensions.map(d => [d.id, 0]));
  for (const q of quiz.questions) {
    if (!object(q) || typeof q.id !== "string" || !q.id || ids.has(q.id) || !text(q.prompt)
      || q.correctOptionId !== undefined || q.reverse !== undefined || !Array.isArray(q.options) || q.options.length !== 2) return false;
    ids.add(q.id);
    if (!q.options.every((o, i) => object(o) && o.id === (i === 0 ? "A" : "B") && typeof o.directionId === "string"
      && allPoles.includes(o.directionId) && text(o.label) && o.score === undefined)) return false;
    const pair = q.options.map(o => o.directionId), dimension = dimensions.find(d => signature(d.poleIds) === signature(pair));
    if (!dimension) return false;
    questionsPerDimension[dimension.id]++;
    for (const o of q.options) counts[o.directionId][o.id as "A" | "B"]++;
  }
  if (Object.values(questionsPerDimension).some(n => n !== 12) || Object.values(counts).some(n => n.A !== 6 || n.B !== 6)) return false;
  const sets = dimensions.flatMap(d => [[d.poleIds[0]], [d.poleIds[1]], d.poleIds]).map(signature);
  if (!quiz.profiles.every(p => object(p) && typeof p.id === "string" && /^[a-z][a-z-]+$/.test(p.id)
    && Array.isArray(p.directionIds) && p.directionIds.length > 0 && new Set(p.directionIds).size === p.directionIds.length
    && p.directionIds.every(id => allPoles.includes(id)) && sets.includes(signature(p.directionIds))
    && text(p.title) && text(p.scoreReading) && Array.isArray(p.sections) && p.sections.length > 0)) return false;
  return new Set(quiz.profiles.map(p => p.id)).size === 6 && new Set(quiz.profiles.map(p => signature(p.directionIds))).size === 6;
}

export function scorePairedDimensionsQuestionnaire(quiz: Questionnaire, answers: unknown): PairedDimensionsResult {
  if (!isPairedDimensionsConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  // Neither dimension is interpreted from a partial attempt, even if one has all 12 choices.
  if (answered !== 24) return { status: "incomplete", answered };
  const pairedDimensions: Extract<PairedDimensionsResult, { status: "complete" }>["pairedDimensions"] = [];
  for (const d of quiz.pairedDimensions!) {
    const maximum = Math.max(...d.poleIds.map(id => counts[id]));
    // Match the original source's sorted leader order; equal counts keep both sides.
    const leaders = d.poleIds.filter(id => counts[id] === maximum).sort();
    const profile = quiz.profiles.find(p => signature(p.directionIds) === signature(leaders));
    if (!profile) return { status: "unavailable", answered };
    pairedDimensions.push({ id: d.id, counts: Object.fromEntries(d.poleIds.map(id => [id, counts[id]])), leaders, profileId: profile.id });
  }
  return { status: "complete", answered: 24, pairedDimensions, pairedProfileIds: pairedDimensions.map(d => d.profileId) };
}
