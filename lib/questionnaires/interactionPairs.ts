import type { Questionnaire, Text } from "./types";

export const interactionPairDefinitions = [
  { id: "ENERGY_PRESENCE", poleIds: ["EXPRESSIVE_ENERGY", "CALM_PRESENCE"], profileId: "energy-presence-reading" },
  { id: "CLARITY_PACING", poleIds: ["DIRECT_CLARITY", "TACTFUL_PACING"], profileId: "clarity-pacing-reading" },
  { id: "SUPPORT_TIMING", poleIds: ["IMMEDIATE_RESPONSE", "FOLLOW_THROUGH"], profileId: "support-timing-reading" },
  { id: "SHARING_BOUNDARY", poleIds: ["OPEN_SHARING", "BOUNDARIED_RESERVE"], profileId: "sharing-boundary-reading" },
] as const;

export type InteractionPairsResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 24;
  interactionPairs: { id: string; counts: Record<string, number>; leaders: string[]; profileId: string }[];
};

const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** Closed projection of the original PERSONALITY_ATTRACTION four-by-six paired form. */
export function isInteractionPairsConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "interaction-pairs" || quiz.code !== "PERSONALITY_ATTRACTION"
    || quiz.slug !== "mote-type" || !object(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_reuse"
    || quiz.source.formCode !== "personality_attraction_paired_choice_24"
    || quiz.source.itemBankVersion !== "0.2.0-preview" || quiz.source.scoringVersion !== "0.2.0-preview"
    || quiz.source.psychometricValidationCompleted !== false
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 24
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 8
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  const poles = interactionPairDefinitions.flatMap(d => [...d.poleIds]);
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === poles[i] && text(d.title) && d.comparisons === 6)) return false;
  for (const [index, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `ATTRACTION_PC_${String(index + 1).padStart(3, "0")}` || !text(q.prompt)
      || q.reverse !== undefined || q.correctOptionId !== undefined || !Array.isArray(q.options) || q.options.length !== 2) return false;
    const pair = interactionPairDefinitions[Math.floor(index / 6)].poleIds;
    const expected = index % 2 === 0 ? pair : [pair[1], pair[0]];
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === (position === 0 ? "A" : "B")
      && o.directionId === expected[position] && o.score === undefined && text(o.label))) return false;
  }
  return Array.from(quiz.profiles).every((p, index) => {
    const d = interactionPairDefinitions[index];
    return object(p) && p.id === d.profileId && Array.isArray(p.directionIds) && p.directionIds.length === 2
      && Array.from(p.directionIds).every((id, i) => id === d.poleIds[i]) && text(p.title) && text(p.summary)
      && text(p.headline) && text(p.scoreReading) && object(p.seo) && text(p.seo.title) && text(p.seo.description)
      && Array.isArray(p.sections) && p.sections.length === 6
      && Array.from(p.sections).every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
        && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
      && new Set(p.sections.map(s => s.id)).size === 6;
  });
}

export function scoreInteractionPairsQuestionnaire(quiz: Questionnaire, answers: unknown): InteractionPairsResult {
  if (!isInteractionPairsConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<string, number> = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++;
    answered++;
  }
  // Source policy: suppress every interpretation until all 24 paired choices are valid.
  if (answered !== 24) return { status: "incomplete", answered };
  return {
    status: "complete", answered: 24,
    interactionPairs: interactionPairDefinitions.map(d => {
      const maximum = Math.max(...d.poleIds.map(id => counts[id]));
      return { id: d.id, counts: Object.fromEntries(d.poleIds.map(id => [id, counts[id]])),
        leaders: d.poleIds.filter(id => counts[id] === maximum).sort(), profileId: d.profileId };
    }),
  };
}
