import type { Questionnaire, Text } from "./types";

export const euphoriaDefinitions = [
  { id: "RUE", profileId: "rue-bennett" },
  { id: "JULES", profileId: "jules-vaughn" },
  { id: "CASSIE", profileId: "cassie-howard" },
  { id: "MADDY", profileId: "maddy-perez" },
  { id: "LEXI", profileId: "lexi-howard" },
  { id: "FEZCO", profileId: "fezco" },
  { id: "NATE", profileId: "nate-jacobs" },
  { id: "KAT", profileId: "kat-hernandez" },
] as const;
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());
const sections = (v: unknown): boolean => Array.isArray(v) && v.length > 0
  && Array.from(v).every(s => object(s) && typeof s.id === "string" && Boolean(s.id.trim()) && text(s.title)
    && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
  && new Set(v.map(s => s.id)).size === v.length;

/** Admission for this original fan-authored edition; counting stays with the existing archetype scorer. */
export function isEuphoriaConfigurationValid(input: unknown): input is Questionnaire {
  if (!object(input) || input.kind !== "archetype" || input.slug !== "euphoria-character-quiz"
    || input.code !== "FM_EUPHORIA_EVERYDAY20" || !object(input.source)
    || input.source.kind !== "fermatmind_original_unofficial_fan_quiz"
    || input.source.formCode !== "fm_euphoria_everyday20_v1"
    || input.source.itemBankVersion !== "fm_euphoria_everyday20_v1"
    || input.source.scoringVersion !== "fm_euphoria_balanced8_10exposure_counts_all_ties_v1"
    || input.source.resultContentVersion !== "fm_euphoria_eight_full6_s1s2_v1"
    || input.source.psychometricValidationCompleted !== false || input.minimumRatedItems !== undefined
    || !Array.isArray(input.questions) || input.questions.length !== 20
    || !Array.isArray(input.directions) || input.directions.length !== 8
    || !Array.isArray(input.profiles) || input.profiles.length !== 8 || !text(input.instructions)) return false;
  const quiz = input as unknown as Questionnaire;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === euphoriaDefinitions[i].id
    && d.comparisons === 10 && d.itemCount === undefined && text(d.title))) return false;
  const exposure = new Map(euphoriaDefinitions.map(d => [d.id as string, 0]));
  for (const [index, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `EUPHORIA_ORIGINAL_${String(index + 1).padStart(2, "0")}` || !text(q.prompt)
      || q.reverse !== undefined || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 4) return false;
    const seen = new Set<string>();
    for (const [position, o] of q.options.entries()) {
      if (!object(o) || o.id !== ["a", "b", "c", "d"][position] || typeof o.directionId !== "string"
        || !exposure.has(o.directionId) || seen.has(o.directionId) || o.score !== undefined || !text(o.label)) return false;
      seen.add(o.directionId); exposure.set(o.directionId, exposure.get(o.directionId)! + 1);
    }
  }
  if (![...exposure.values()].every(n => n === 10) || !text(quiz.title) || !text(quiz.seoTitle)
    || !text(quiz.description) || !text(quiz.introduction) || !sections(quiz.guide) || quiz.guide.length < 3
    || !["euphoria-counts", "euphoria-routes", "euphoria-edition"].every((id, i) => quiz.guide[i]?.id === id && quiz.guide[i]?.paragraphs.length === 1)
    || !Array.isArray(quiz.faq) || quiz.faq.length === 0
    || !Array.from(quiz.faq).every(f => object(f) && text(f.question) && text(f.answer))
    || !Array.isArray(quiz.references) || quiz.references.length === 0
    || !Array.from(quiz.references).every(r => object(r) && text(r.title) && typeof r.url === "string"
      && /^https:\/\//.test(r.url))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === euphoriaDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === euphoriaDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && sections(p.sections) && p.sections.length === 6);
}
