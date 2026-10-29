import * as engine from "./sbti31Engine.cjs";
import english from "./sbti31English.json";
import type { Text } from "./types";
export const SBTI31_SOURCE_SHA256 = "51a658b20df1c2e035320b9126b6495a792ccf92ab9102e21a9ffe2b612d3dbc";
export const SBTI31_THEME_IDS = ["self-critic", "initiator", "caregiver", "social-adapter", "detached-observer", "pause-taker", "action-starter", "pressure-speaker", "contingency-planner", "lightener", "expressive-styler", "easygoing", "resource-keeper", "risk-watcher", "quiet-observer", "venting-fixer", "appreciator", "improviser", "giver", "reflective-thinker", "independent-walker", "romantic-connector", "surprised-commentator", "atmosphere-seeker", "low-battery-rebuilder"] as const;
export const sbti31Questions = engine.SBTI_QUESTIONS.map((q, index) => ({ id: q.id, prompt: { zh: q.prompt.zh, en: english[index][0] } as Text, options: q.options.map((o, option) => ({ id: o.id, label: { zh: o.label.zh, en: english[index][option + 1] } as Text })) }));
export const sbti31Profiles = engine.SBTI_RESULT_PROFILES.map((profile, index) => ({ ...profile, id: SBTI31_THEME_IDS[index], displayNameZh: engine.getSbtiDisplayName(profile) }));
export function isSbti31BankValid() {
  return engine.SBTI_QUESTIONS.length === 31 && english.length === 31 && sbti31Profiles.length === 25
    && engine.SBTI_RESULT_DIMENSIONS.length === 15 && sbti31Questions.every((q, i) => q.id === `q${String(i + 1).padStart(2, "0")}`
      && english[i].length === q.options.length + 1 && q.prompt.en.trim() && q.options.every(o => o.label.en.trim()));
}
export type Sbti31Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 31; profileCode: string; profileId: string; matchPercent: number; similarity: number;
  mismatchCount: number; distance: number; presetRarity: string; scores: engine.Sbti31Vector; resultScores: engine.Sbti31Vector;
  dimensionCards: engine.Sbti31DimensionCard[];
};
export function scoreSbti31(answers: unknown): Sbti31Result {
  if (!isSbti31BankValid()) return { status: "unavailable", answered: 0 };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(answers)) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers), choices: Record<string, string> = {};
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const q = engine.SBTI_QUESTIONS.find(q => q.id === id);
    if (!Object.hasOwn(descriptor, "value") || !descriptor.enumerable || !q || typeof descriptor.value !== "string"
      || !q.options.some(o => o.id === descriptor.value)) return { status: "invalid", answered: Object.keys(choices).length };
    choices[id] = descriptor.value;
  }
  if (Object.keys(choices).length !== 31) return { status: "incomplete", answered: Object.keys(choices).length };
  const scores = engine.scoreSbtiAnswers(engine.SBTI_QUESTIONS, choices), resultScores = engine.mapSbtiScoreToResultDimensions(scores);
  const resolved = engine.resolveSbtiProfileFromResultScores(resultScores, engine.SBTI_RESULT_PROFILES);
  const profile = sbti31Profiles.find(p => p.code === resolved.primary.code);
  if (!profile) return { status: "unavailable", answered: 0 };
  return { status: "complete", answered: 31, profileCode: profile.code, profileId: profile.id,
    matchPercent: resolved.matchPercent, similarity: resolved.similarity, mismatchCount: resolved.mismatchCount, distance: resolved.distance,
    presetRarity: engine.formatSbtiRarityPercent(profile.code), scores, resultScores, dimensionCards: engine.getSbtiDimensionCards(scores, resolved.primary) };
}

export type Sbti31Questionnaire = Omit<import("./types").Questionnaire, "kind" | "instructions"> & { kind: "sbti31"; instructions: Text };
const record = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is Text => record(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
export function isSbti31ConfigurationValid(quiz: unknown): quiz is Sbti31Questionnaire {
  if (!isSbti31BankValid() || !record(quiz) || quiz.kind !== "sbti31" || quiz.slug !== "sbti-test" || quiz.code !== "SBTI"
    || quiz.version !== "sbti31_original_zh_working_en_web_v1" || !record(quiz.source)
    || quiz.source.kind !== "owned_mini_sbti31_original" || quiz.source.formCode !== "sbti_entertainment_31"
    || quiz.source.itemBankVersion !== "sbti-web-v1-43cc2f7f" || quiz.source.scoringVersion !== "sbti-web-v1-43cc2f7f"
    || quiz.source.psychometricValidationCompleted !== false || !Array.isArray(quiz.questions) || quiz.questions.length !== 31
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 15
    || !quiz.directions.every((d, i) => record(d) && d.id === engine.SBTI_RESULT_DIMENSIONS[i].key && text(d.title) && d.title.zh === engine.SBTI_RESULT_DIMENSIONS[i].nameZh)
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 25 || !text(quiz.title) || !text(quiz.description) || !text(quiz.instructions)) return false;
  if (!quiz.questions.every((q, i) => record(q) && q.id === sbti31Questions[i].id && text(q.prompt)
    && q.prompt.zh === sbti31Questions[i].prompt.zh && q.prompt.en === sbti31Questions[i].prompt.en
    && Array.isArray(q.options) && q.options.length === sbti31Questions[i].options.length
    && q.options.every((o: unknown, n: number) => record(o) && o.id === sbti31Questions[i].options[n].id
      && text(o.label) && o.label.zh === sbti31Questions[i].options[n].label.zh && o.label.en === sbti31Questions[i].options[n].label.en))) return false;
  return quiz.profiles.every((p, i) => record(p) && p.id === SBTI31_THEME_IDS[i] && text(p.title) && text(p.headline)
    && p.headline.zh === sbti31Profiles[i].displayNameZh && text(p.summary) && text(p.scoreReading)
    && Array.isArray(p.sections) && p.sections.length === 6 && p.sections.every((s: unknown) => record(s) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && s.paragraphs.every(text)));
}
