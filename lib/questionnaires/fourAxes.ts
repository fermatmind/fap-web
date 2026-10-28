import type { Questionnaire, Text } from "./types";

export const FOUR_AXES_IDS = ["gender", "personality", "lifestyle", "political"] as const;
export type FourAxesId = typeof FOUR_AXES_IDS[number];
export type FourAxesConfiguration = {
  method: "original-four-domains-60-balanced-0to4-v1";
  axes: { id: FourAxesId; title: Text; low: Text; high: Text; definition: Text }[];
  privacy: Text;
  scoreExplanation: Text;
};
export type FourAxesQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "four-axes"; instructions: Text; resultHeading: Text; fourAxes: FourAxesConfiguration };
export type FourAxesResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 60;
  axes: Record<FourAxesId, { sum: number; count: 15; highPercent: number; lowPercent: number }>;
};
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
const sectionIds = ["meaning", "lower", "higher", "context", "reflection", "limits"];
const sections = (v: unknown, ids: readonly string[], paragraphs: number): boolean => Array.isArray(v) && v.length === ids.length
  && Array.from(v).every((s, i) => plain(s) && s.id === ids[i] && text(s.title) && Array.isArray(s.paragraphs)
    && s.paragraphs.length === paragraphs && Array.from(s.paragraphs).every(text));

/** A fixed original entertainment recipe; no population norms, sex assignment or clinical normality threshold. */
export function isFourAxesConfigurationValid(input: unknown): input is FourAxesQuestionnaire {
  if (!plain(input) || input.kind !== "four-axes" || input.slug !== "four-axes-test" || input.code !== "FM_FOUR_AXES_REFLECTION60"
    || !text(input.title) || !text(input.description) || !text(input.seoTitle) || !text(input.introduction) || !text(input.instructions) || !text(input.resultHeading)
    || !plain(input.source) || input.source.kind !== "fermatmind_original_four_axes_reflection"
    || input.source.formCode !== "fm_four_axes_original60_v1" || input.source.itemBankVersion !== "fm_four_axes_original60_v1"
    || input.source.scoringVersion !== "fm_four_axes_balanced_polarity_0to4_60_v1" || input.source.resultContentVersion !== "fm_four_axes_four_full_domain_readings_v1"
    || input.source.psychometricValidationCompleted !== false || typeof input.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.itemBankSha256)
    || typeof input.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.resultContentSha256)
    || !plain(input.fourAxes) || input.fourAxes.method !== "original-four-domains-60-balanced-0to4-v1"
    || !text(input.fourAxes.privacy) || !text(input.fourAxes.scoreExplanation) || !Array.isArray(input.fourAxes.axes) || input.fourAxes.axes.length !== 4
    || !Array.from(input.fourAxes.axes).every((a, i) => plain(a) && a.id === FOUR_AXES_IDS[i] && text(a.title) && text(a.low) && text(a.high) && text(a.definition))
    || !Array.isArray(input.directions) || input.directions.length !== 4
    || !Array.from(input.directions).every((d, i) => plain(d) && d.id === FOUR_AXES_IDS[i] && d.itemCount === 15 && text(d.title))
    || !Array.isArray(input.questions) || input.questions.length !== 60 || !Array.isArray(input.profiles) || input.profiles.length !== 4) return false;
  const counts = Object.fromEntries(FOUR_AXES_IDS.map(id => [id, { count: 0, reverse: 0 }]));
  if (!Array.from(input.questions).every((q, i) => {
    const axis = FOUR_AXES_IDS[i % 4];
    if (!plain(q) || q.id !== `four-axes-${String(i + 1).padStart(2, "0")}` || !text(q.prompt) || typeof q.reverse !== "boolean" || q.correctOptionId !== undefined
      || !Array.isArray(q.options) || q.options.length !== 5 || !Array.from(q.options).every((o, n) => plain(o)
        && o.id === String(n) && o.score === n && o.directionId === axis && text(o.label))) return false;
    counts[axis].count += 1; counts[axis].reverse += q.reverse ? 1 : 0; return true;
  }) || Object.values(counts).some(c => c.count !== 15 || c.reverse !== 7)) return false;
  if (!Array.from(input.profiles).every((p, i) => plain(p) && p.id === FOUR_AXES_IDS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && plain(p.seo) && text(p.seo.title) && text(p.seo.description) && sections(p.sections, sectionIds, 2))) return false;
  return sections(input.guide, ["four-domains", "scoring", "mixed", "privacy"], 2)
    && Array.isArray(input.faq) && input.faq.length === 6 && Array.from(input.faq).every(f => plain(f) && text(f.question) && text(f.answer))
    && Array.isArray(input.references) && input.references.length >= 3 && Array.from(input.references).every(r => plain(r) && text(r.title) && typeof r.url === "string" && /^https:\/\//.test(r.url));
}

export function scoreFourAxesQuestionnaire(input: unknown, answers: unknown): FourAxesResult {
  if (!isFourAxesConfigurationValid(input)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Reflect.ownKeys(answers).some(k => typeof k !== "string")) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const questions = new Map(input.questions.map(q => [q.id, q]));
  const sums = Object.fromEntries(FOUR_AXES_IDS.map(id => [id, 0])) as Record<FourAxesId, number>;
  let answered = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const value: unknown = descriptor.value;
    const q = questions.get(id), option = q?.options.find(o => o.id === value);
    if (!q || !option || typeof option.score !== "number") return { status: "invalid", answered };
    sums[option.directionId as FourAxesId] += q.reverse ? 4 - option.score : option.score; answered += 1;
  }
  if (answered !== 60) return { status: "incomplete", answered };
  const axes = Object.fromEntries(FOUR_AXES_IDS.map(id => {
    const highPercent = sums[id] / 60 * 100;
    return [id, { sum: sums[id], count: 15, highPercent, lowPercent: 100 - highPercent }];
  })) as Extract<FourAxesResult, { status: "complete" }>["axes"];
  return { status: "complete", answered: 60, axes };
}
