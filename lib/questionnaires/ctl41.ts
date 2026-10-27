import type { Questionnaire, Text } from "./types";

export const ctl41Definitions = [
  { id: "INT", first: 1, last: 7, profileId: "interest-reading" },
  { id: "BTR", first: 8, last: 16, profileId: "trust-reading" },
  { id: "GRT", first: 17, last: 23, profileId: "gratitude-reading" },
  { id: "CEI", first: 24, last: 31, profileId: "shared-ideal-reading" },
  { id: "PSP", first: 32, last: 33, profileId: "sexual-passion-reading" },
  { id: "LOM", first: 34, last: 41, profileId: "loss-reading" },
] as const;
const reversed = new Set([7, 13, 15, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
export type Ctl41Result = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete";
  answered: 41;
  ctl41: { id: string; profileId: string; rawSum: number; itemCount: number; mean: number }[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** 2018 Table 1 working projection; new Chinese translation, no inherited validation. */
export function isCtl41ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "ctl41" || quiz.slug !== "capacity-to-love-test"
    || quiz.code !== "CTL_I_2018_WORKING41" || !object(quiz.source)
    || quiz.source.kind !== "licensed_ctl2018_table1_working_projection"
    || quiz.source.formCode !== "ctl2018_41_working_v1"
    || quiz.source.itemBankVersion !== "ctl2018_table1_41_working_en_zh_v1"
    || quiz.source.scoringVersion !== "ctl2018_six_domain_sums_means_no_total_v1"
    || quiz.source.resultContentVersion !== "ctl2018_six_full8_working_v1"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 41
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 6
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 6 || !text(quiz.instructions)) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === ctl41Definitions[i].id
    && d.itemCount === ctl41Definitions[i].last - ctl41Definitions[i].first + 1 && text(d.title))) return false;
  for (const [index, q] of quiz.questions.entries()) {
    const part = ctl41Definitions.find(d => index + 1 >= d.first && index + 1 <= d.last)!;
    if (!object(q) || q.id !== `CTL2018_${String(index + 1).padStart(2, "0")}` || !text(q.prompt)
      || q.reverse !== reversed.has(index + 1) || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 4) return false;
    if (!Array.from(q.options).every((o, position) => object(o) && o.id === String(position + 1)
      && o.directionId === part.id && o.score === position + 1 && text(o.label))) return false;
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
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === ctl41Definitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === ctl41Definitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 8
    && Array.from(p.sections).every(s => object(s) && typeof s.id === "string" && Boolean(s.id) && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
    && new Set(p.sections.map(s => s.id)).size === 8);
}

export function scoreCtl41Questionnaire(quiz: Questionnaire, answers: unknown): Ctl41Result {
  if (!isCtl41ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!ids.has(id) || !["1", "2", "3", "4"].some(option => option === value)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 41) return { status: "incomplete", answered };
  return { status: "complete", answered: 41, ctl41: ctl41Definitions.map(part => {
    const items = quiz.questions.slice(part.first - 1, part.last);
    const rawSum = items.reduce((sum, q) => {
      const response = Number(answers[q.id]); return sum + (q.reverse ? 5 - response : response);
    }, 0);
    return { id: part.id, profileId: part.profileId, rawSum, itemCount: items.length, mean: rawSum / items.length };
  }) };
}
