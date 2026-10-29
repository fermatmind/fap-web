import bank from "./technical30Bank.json";
import type { Questionnaire, Text } from "./types";
import { readAfqt32Clock } from "./afqt32";

/** One fixed original practice edition, not an official ASVAB form or calibrated score. */
export const TECHNICAL30_SECTIONS = ["general-science", "mechanical", "electronics", "auto-shop", "assembling"] as const;
export const TECHNICAL30_LIMITS = [180, 240, 240, 180, 300] as const;
export type Technical30SectionId = typeof TECHNICAL30_SECTIONS[number];
export type Technical30Mode = "timed" | "study";
export type Technical30Closure = { id: Technical30SectionId; reason: "finished" | "expired"; elapsedMs: number };
export type Technical30Readout = { correct: number; wrong: number; unanswered: number; total: number };
export type Technical30Result = { mode: Technical30Mode; parts: (Technical30Readout & Technical30Closure)[]; overall: Technical30Readout; items: { id: string; selectedOptionId: string | null; correctOptionId: string; outcome: "correct" | "wrong" | "unanswered" }[] };
export type Technical30Questionnaire = Questionnaire & { kind: "technical30"; technical30: { sections: { id: Technical30SectionId; code: string; count: 6; limitSeconds: number; title: Text }[]; subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v)) && Reflect.ownKeys(v).length === Object.keys(v).length;
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const texts = (v: unknown) => Array.isArray(v) && v.length === 2 && Array.from(v).every(text);
export function isTechnical30ConfigurationValid(q: unknown): q is Technical30Questionnaire {
  if (!record(q) || q.slug !== "asvab-science-mechanical-practice-test" || q.kind !== "technical30" || q.code !== "FM_TECHNICAL30" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 24 || !record(q.source)
    || q.source.kind !== "fermatmind_original_technical_five_area_practice" || q.source.formCode !== "fm_technical30_original_english_v1"
    || q.source.itemBankVersion !== "fm_technical30_fixed_english_bilingual_explanations_v1" || q.source.scoringVersion !== "raw_correct_wrong_unanswered_5x6_site_caps_or_study_v1"
    || q.source.resultContentVersion !== "fm_technical30_five_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "0aa86ef57644ea96bfac7b5f4e6a116200301c986d20475a010763c641c423d4" || q.source.resultContentSha256 !== "62830e1a3cab4b7a966126cf6946e093471e3044a7c972cc9713422a8aef2f70"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.technical30) || ![q.technical30.subtitle, q.technical30.privacy, q.technical30.editionNotice, q.technical30.attribution].every(text)
    || !Array.isArray(q.technical30.sections) || q.technical30.sections.length !== 5
    || !Array.from(q.technical30.sections).every((s, i) => record(s) && s.id === TECHNICAL30_SECTIONS[i] && s.code === ["GS", "MC", "EI", "AS", "AO"][i] && s.count === 6 && s.limitSeconds === TECHNICAL30_LIMITS[i] && text(s.title))
    || !Array.isArray(q.questions) || q.questions.length !== 30 || !Array.isArray(q.directions) || q.directions.length !== 5
    || !Array.isArray(q.profiles) || q.profiles.length !== 5) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === TECHNICAL30_SECTIONS[i] && d.itemCount === 6 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === bank[i].id && question.reverse === false
    && question.correctOptionId === bank[i].correctOptionId && record(question.explanation)
    && question.explanation.en === bank[i].explanation.en && question.explanation.zh === bank[i].explanation.zh
    && record(question.prompt) && question.prompt.en === bank[i].prompt.en && question.prompt.zh === bank[i].prompt.zh
    && Array.isArray(question.options) && question.options.length === 4 && Array.from(question.options).every((o, j) => record(o)
      && o.id === ["A", "B", "C", "D"][j] && o.score === undefined && o.directionId === TECHNICAL30_SECTIONS[Math.floor(i / 6)]
      && record(o.label) && o.label.en === bank[i].options[j].label.en && o.label.zh === bank[i].options[j].label.zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === TECHNICAL30_SECTIONS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title) && texts(s.paragraphs)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "timing", "scoring", "use"][i] && text(s.title) && texts(s.paragraphs))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 9 && Array.from(q.references).every((r, i) => record(r) && text(r.title) && r.url === [
      "https://www.officialasvab.com/applicants/subtests/", "https://www.officialasvab.com/applicants/scores/", "https://www.officialasvab.com/applicants/asvab-test-preparation-disclaimer/",
      "https://www.energy.gov/cmei/vehicles/articles/internal-combustion-engine-basics", "https://afdc.energy.gov/vehicles/how-do-gasoline-cars-work", "https://science.nasa.gov/moon/moon-phases/",
      "https://www.noaa.gov/education/resource-collections/freshwater/water-cycle", "https://www.nhlbi.nih.gov/health/anemia/diagnosis", "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
    ][i]);
}
/** Reuse the already shipped dual-clock deadline behaviour without changing its four-area edition. */
export const readTechnical30Clock = readAfqt32Clock;

export function scoreTechnical30(q: unknown, attempt: unknown): { status: "unavailable" | "invalid" | "incomplete" } | { status: "complete"; result: Technical30Result } {
  if (!isTechnical30ConfigurationValid(q)) return { status: "unavailable" };
  if (!record(attempt) || Object.keys(attempt).some(k => !["mode", "answers", "sections"].includes(k)) || typeof attempt.mode !== "string" || !["timed", "study"].includes(attempt.mode)
    || !record(attempt.answers) || !Array.isArray(attempt.sections) || attempt.sections.length > 5) return { status: "invalid" };
  const answers = attempt.answers;
  if (Object.entries(answers).some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !["A", "B", "C", "D", "skip"].includes(v))) return { status: "invalid" };
  if (!Array.from(attempt.sections).every((s, i) => record(s) && Object.keys(s).length === 3 && s.id === TECHNICAL30_SECTIONS[i] && typeof s.reason === "string" && ["finished", "expired"].includes(s.reason)
    && typeof s.elapsedMs === "number" && Number.isFinite(s.elapsedMs) && s.elapsedMs >= 0
    && (attempt.mode === "study" ? s.reason === "finished" && s.elapsedMs === 0 : s.reason === "expired" ? s.elapsedMs >= TECHNICAL30_LIMITS[i] * 1000 : s.elapsedMs < TECHNICAL30_LIMITS[i] * 1000))) return { status: "invalid" };
  if (attempt.sections.length !== 5) return { status: "incomplete" };
  const closures = attempt.sections as Technical30Closure[];
  const items: Technical30Result["items"] = q.questions.map(s => {
    const selectedOptionId = answers[s.id] === undefined || answers[s.id] === "skip" ? null : answers[s.id] as string;
    return { id: s.id, selectedOptionId, correctOptionId: s.correctOptionId!, outcome: selectedOptionId === null ? "unanswered" : selectedOptionId === s.correctOptionId ? "correct" : "wrong" };
  });
  const count = (part: typeof items): Technical30Readout => ({ correct: part.filter(s => s.outcome === "correct").length, wrong: part.filter(s => s.outcome === "wrong").length, unanswered: part.filter(s => s.outcome === "unanswered").length, total: part.length });
  return { status: "complete", result: { mode: attempt.mode as Technical30Mode, parts: closures.map((s, i) => ({ ...s, ...count(items.slice(i * 6, i * 6 + 6)) })), overall: count(items), items } };
}
