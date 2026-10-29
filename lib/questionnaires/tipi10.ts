import type { Questionnaire } from "./types";

export const tipiDomains = ["extraversion", "agreeableness", "conscientiousness", "emotional-stability", "openness"] as const;
export type TipiDomain = typeof tipiDomains[number];
const items = [
  ["Extraverted, enthusiastic.", "extraversion", false],
  ["Critical, quarrelsome.", "agreeableness", true],
  ["Dependable, self-disciplined.", "conscientiousness", false],
  ["Anxious, easily upset.", "emotional-stability", true],
  ["Open to new experiences, complex.", "openness", false],
  ["Reserved, quiet.", "extraversion", true],
  ["Sympathetic, warm.", "agreeableness", false],
  ["Disorganized, careless.", "conscientiousness", true],
  ["Calm, emotionally stable.", "emotional-stability", false],
  ["Conventional, uncreative.", "openness", true],
] as const;
const anchors = ["Disagree strongly", "Disagree moderately", "Disagree a little", "Neither agree nor disagree", "Agree a little", "Agree moderately", "Agree strongly"];
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown) => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
type TipiQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "tipi10" };
export type Tipi10Result = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 10; tipi10: Record<TipiDomain, { mean: number; items: { id: string; response: number; keyed: number; reverse: boolean }[] }>;
};

/** Exact source English, seven anchors and five independent two-item means. */
export function isTipi10ConfigurationValid(quiz: unknown): quiz is TipiQuestionnaire {
  if (!object(quiz) || quiz.kind !== "tipi10" || quiz.slug !== "tipi-10" || quiz.code !== "TIPI10_GOSLING_2003"
    || !object(quiz.source) || quiz.source.kind !== "gosling_tipi10_author_permission_working_zh"
    || quiz.version !== "tipi10_gosling2003_en_fm_zh_working_v1" || quiz.source.formCode !== quiz.version
    || quiz.source.itemBankVersion !== quiz.version || quiz.source.scoringVersion !== "tipi10_source_pairs_reverse8_complete10_v1"
    || quiz.source.psychometricValidationCompleted !== false || !text(quiz.instructions)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 10
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === tipiDomains[i] && d.itemCount === 2 && text(d.title))) return false;
  if (!Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${tipiDomains[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === tipiDomains[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 8
    && new Set(p.sections.map(s => object(s) ? s.id : undefined)).size === 8
    && p.sections.every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && s.paragraphs.every(text)))) return false;
  return Array.from(quiz.questions).every((q, i) => object(q) && q.id === `tipi-${String(i + 1).padStart(2, "0")}`
    && object(q.prompt) && q.prompt.en === items[i][0] && text(q.prompt) && q.reverse === items[i][2]
    && q.correctOptionId === undefined && Array.isArray(q.options) && q.options.length === 7
    && q.options.every((o, n) => object(o) && o.id === String(n + 1) && o.score === n + 1
      && o.directionId === items[i][1] && object(o.label) && o.label.en === anchors[n] && text(o.label)));
}

export function scoreTipi10Questionnaire(quiz: unknown, answers: unknown): Tipi10Result {
  if (!isTipi10ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const records: { id: string; response: number; keyed: number; reverse: boolean; domain: TipiDomain }[] = [];
  for (const [id, value] of Object.entries(answers)) {
    const q = questions.get(id), option = q?.options.find(o => o.id === value);
    if (!q || !option || typeof option.score !== "number") return { status: "invalid", answered: records.length };
    records.push({ id, response: option.score, keyed: q.reverse ? 8 - option.score : option.score, reverse: Boolean(q.reverse), domain: option.directionId as TipiDomain });
  }
  if (records.length !== 10) return { status: "incomplete", answered: records.length };
  const tipi10 = Object.fromEntries(tipiDomains.map(domain => {
    const pair = records.filter(r => r.domain === domain).sort((a, b) => a.id.localeCompare(b.id));
    return [domain, { mean: pair.reduce((sum, r) => sum + r.keyed, 0) / 2, items: pair.map(({ id, response, keyed, reverse }) => ({ id, response, keyed, reverse })) }];
  })) as Extract<Tipi10Result, { status: "complete" }>["tipi10"];
  return { status: "complete", answered: 10, tipi10 };
}
