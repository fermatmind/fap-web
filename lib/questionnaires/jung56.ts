import type { Text } from "./types";

/** Original Mini public-preview bank: relative choices, without psychometric or language-equivalence claims. */
export const JUNG56_DIRECTIONS = ["se", "si", "ne", "ni", "te", "ti", "fe", "fi"] as const;
export type Jung56Direction = typeof JUNG56_DIRECTIONS[number];
export type Jung56Bank = {
  edition: "fm_jung56_mini_public_preview_working_en_v1";
  source: { testId: string; formCode: string; itemBankVersion: string; scoringVersion: string; modelStatus: string; itemBankSha256: string; psychometricValidationCompleted: false; languageEquivalenceEstablished: false };
  questions: { id: string; pairCode: string; pairOccurrence: number; contextCode: string; instruction: Text; options: { id: "A" | "B"; directionId: Jung56Direction; sourceDirectionCode: string; label: Text }[] }[];
};
export type Jung56Result = {
  rows: { id: Jung56Direction; wins: number; scheduledComparisons: 14; rank: number }[];
  groups: { rank: number; wins: number; directionIds: Jung56Direction[] }[];
  topDirectionIds: Jung56Direction[];
};
const topology = "se,si|si,se|se,ne|ne,se|se,ni|ni,se|se,te|te,se|se,ti|ti,se|se,fe|fe,se|se,fi|fi,se|si,ne|ne,si|si,ni|ni,si|si,te|te,si|si,ti|ti,si|si,fe|fe,si|si,fi|fi,si|ne,ni|ni,ne|ne,te|te,ne|ne,ti|ti,ne|ne,fe|fe,ne|ne,fi|fi,ne|ni,te|te,ni|ni,ti|ti,ni|ni,fe|fe,ni|ni,fi|fi,ni|te,ti|ti,te|te,fe|fe,te|te,fi|fi,te|ti,fe|fe,ti|ti,fi|fi,ti|fe,fi|fi,fe".split("|").map(pair => pair.split(","));
const sourceCodes = { se: "EXTRAVERTED_SENSATION", si: "INTROVERTED_SENSATION", ne: "EXTRAVERTED_INTUITION", ni: "INTROVERTED_INTUITION", te: "EXTRAVERTED_THINKING", ti: "INTROVERTED_THINKING", fe: "EXTRAVERTED_FEELING", fi: "INTROVERTED_FEELING" } as const;
function record(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(v))) return false;
  const descriptors = Object.getOwnPropertyDescriptors(v);
  return Reflect.ownKeys(v).length === Object.keys(v).length && Object.values(descriptors).every(d => "value" in d && d.enumerable);
}
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
export function isJung56ConfigurationValid(q: unknown): q is Jung56Bank {
  if (!record(q) || q.edition !== "fm_jung56_mini_public_preview_working_en_v1" || !record(q.source)
    || q.source.testId !== "JUNG_PERSONALITY" || q.source.formCode !== "jung_function_attitude_56"
    || q.source.itemBankVersion !== "0.2.0-draft" || q.source.scoringVersion !== "0.2.0-draft"
    || q.source.modelStatus !== "provisional_raw_wins_not_validated"
    || q.source.itemBankSha256 !== "819c211a154e89136c3a48dc488ea72e1e5b591e0002c2b4c817542f72af5829"
    || q.source.psychometricValidationCompleted !== false || q.source.languageEquivalenceEstablished !== false
    || !Array.isArray(q.questions) || q.questions.length !== 56) return false;
  const pairs = new Map<string, number>(), exposures = Object.fromEntries(JUNG56_DIRECTIONS.map(id => [id, { A: 0, B: 0 }]));
  for (const [i, question] of Array.from(q.questions).entries()) {
    if (!record(question) || question.id !== `JUNG_FC_${String(i + 1).padStart(3, "0")}` || question.pairOccurrence !== i % 2 + 1
      || typeof question.pairCode !== "string" || typeof question.contextCode !== "string" || !question.contextCode.trim() || !text(question.instruction)
      || !Array.isArray(question.options) || question.options.length !== 2) return false;
    for (const [j, option] of Array.from(question.options).entries()) {
      const id = topology[i][j] as Jung56Direction, position = j ? "B" : "A";
      if (!record(option) || option.id !== position || option.directionId !== id || option.sourceDirectionCode !== sourceCodes[id] || !text(option.label)) return false;
      exposures[id][position]++;
    }
    const key = [...topology[i]].sort().join("|");pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  return pairs.size === 28 && [...pairs.values()].every(count => count === 2) && Object.values(exposures).every(x => x.A === 7 && x.B === 7);
}

/** Only complete, edition-matched A/B sheets produce a ranking. Stricter Web input rejection never imputes an answer. */
export function scoreJung56(q: unknown, attempt: unknown): { status: "unavailable" | "invalid" } | { status: "incomplete"; answered: number } | { status: "complete"; result: Jung56Result } {
  if (!isJung56ConfigurationValid(q)) return { status: "unavailable" };
  if (!record(attempt) || Object.keys(attempt).length !== 2 || attempt.edition !== q.edition || !record(attempt.answers)) return { status: "invalid" };
  const answers = attempt.answers, ids = new Set(q.questions.map(x => x.id));
  if (Object.entries(answers).some(([id, v]) => !ids.has(id) || (v !== null && (typeof v !== "string" || !["A", "B"].includes(v))))) return { status: "invalid" };
  const answered = q.questions.filter(x => answers[x.id] === "A" || answers[x.id] === "B").length;
  if (answered !== 56) return { status: "incomplete", answered };
  const wins = Object.fromEntries(JUNG56_DIRECTIONS.map(id => [id, 0])) as Record<Jung56Direction, number>;
  for (const question of q.questions) wins[question.options[answers[question.id] === "A" ? 0 : 1].directionId]++;
  let rank = 1;
  const groups: Jung56Result["groups"] = [...new Set(Object.values(wins))].sort((a, b) => b - a).map(count => {
    const directionIds = JUNG56_DIRECTIONS.filter(id => wins[id] === count), group = { rank, wins: count, directionIds };
    rank += directionIds.length;return group;
  });
  return { status: "complete", result: {
    rows: JUNG56_DIRECTIONS.map(id => ({ id, wins: wins[id], scheduledComparisons: 14, rank: groups.find(g => g.directionIds.includes(id))!.rank })),
    groups, topDirectionIds: groups[0].directionIds,
  } };
}

const cardTextKeys = ["display_name", "short_label", "result_headline", "one_sentence_summary", "construct_definition", "attention_focus", "processing_pattern", "interpretation_boundary"] as const;
const cardListKeys = ["observable_tendencies", "possible_contributions", "possible_blind_spots", "balance_practices", "reflection_questions", "does_not_mean"] as const;
const commonKeys = ["how_to_read", "forced_choice_method", "relative_score_explanation", "tie_explanation", "no_norms_or_percentiles", "not_a_fixed_identity", "not_a_diagnosis", "high_stakes_use_boundary", "evidence_status", "version_explanation", "retest_guidance", "web_privacy"] as const;
export type Jung56Card = { id: Jung56Direction; sourceDirectionCode: string } & Record<typeof cardTextKeys[number], Text> & Record<typeof cardListKeys[number], Text[]>;
export type Jung56Content = { edition: string; sourceAssetVersion: string; sourceContentSha256: string; contentSha256: string; psychometricValidationCompleted: false; languageEquivalenceEstablished: false; common: Record<typeof commonKeys[number], Text>; cards: Jung56Card[] };
export function isJung56ContentValid(content: unknown): content is Jung56Content {
  if (!record(content) || content.edition !== "fm_jung56_eight_public_cards_working_en_v1" || content.sourceAssetVersion !== "0.2.0-draft"
    || content.sourceContentSha256 !== "dcc202f3cf210b7a45c16b6dc608244d79502e6be2837f71efa3cf8cbe8d2ed5"
    || content.contentSha256 !== "9da9533fa6d300241b516eba6452b5ec82cd7ef91033801c38a2f17cfe1cb300"
    || content.psychometricValidationCompleted !== false || content.languageEquivalenceEstablished !== false || !record(content.common)
    || !commonKeys.every(key => text((content.common as Record<string, unknown>)[key])) || !Array.isArray(content.cards) || content.cards.length !== 8) return false;
  return Array.from(content.cards).every((card, i) => record(card) && card.id === JUNG56_DIRECTIONS[i] && card.sourceDirectionCode === sourceCodes[JUNG56_DIRECTIONS[i]]
    && cardTextKeys.every(key => text(card[key])) && cardListKeys.every(key => Array.isArray(card[key]) && card[key].length === (key === "observable_tendencies" ? 4 : key === "does_not_mean" ? i < 2 ? 5 : 6 : 3) && Array.from(card[key]).every(text)));
}
