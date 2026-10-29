import bank from "./critical30Bank.json";
import type { Questionnaire, Text } from "./types";
import { readAfqt32Clock } from "./afqt32";

/** One fixed original practice edition, not an official provider form or calibrated score. */
export const CRITICAL30_SECTIONS = ["inference", "assumptions", "deduction", "interpretation", "arguments"] as const;
export const CRITICAL30_LIMIT = 1800;
export type Critical30SectionId = typeof CRITICAL30_SECTIONS[number];
export type Critical30Mode = "timed" | "study";
export type Critical30Closure = { reason: "finished" | "expired"; elapsedMs: number };
export type Critical30Readout = { correct: number; wrong: number; unanswered: number; total: number };
export type Critical30Result = { mode: Critical30Mode; closure: Critical30Closure; parts: (Critical30Readout & { id: Critical30SectionId })[]; overall: Critical30Readout; items: { id: string; selectedOptionId: string | null; correctOptionId: string; outcome: "correct" | "wrong" | "unanswered" }[] };
export type Critical30Questionnaire = Questionnaire & { kind: "critical30"; critical30: { sections: { id: Critical30SectionId; code: string; count: 6; title: Text }[]; limitSeconds: 1800; subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v)) && Reflect.ownKeys(v).length === Object.keys(v).length;
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const texts = (v: unknown) => Array.isArray(v) && v.length === 2 && Array.from(v).every(text);
export function isCritical30ConfigurationValid(q: unknown): q is Critical30Questionnaire {
  if (!record(q) || q.slug !== "watson-glaser-practice-test" || q.kind !== "critical30" || q.code !== "FM_CRITICAL30" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 35 || !record(q.source)
    || q.source.kind !== "fermatmind_original_five_part_critical_thinking_practice" || q.source.formCode !== "fm_critical30_original_english_v1"
    || q.source.itemBankVersion !== "fm_critical30_five_response_rules_english_v1" || q.source.scoringVersion !== "raw_correct_wrong_unanswered_5x6_single_site_clock_or_study_v1"
    || q.source.resultContentVersion !== "fm_critical30_five_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "0389aee0f860f2bc43becb1391cb3cbbe374954e7fb81a85eb1c879a9c519a6b" || q.source.resultContentSha256 !== "12170b0af079ac034d7351037e7a8d349c5b442dd49667cfbb5a137694015654"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.critical30) || q.critical30.limitSeconds !== CRITICAL30_LIMIT || ![q.critical30.subtitle, q.critical30.privacy, q.critical30.editionNotice, q.critical30.attribution].every(text)
    || !Array.isArray(q.critical30.sections) || q.critical30.sections.length !== 5
    || !Array.from(q.critical30.sections).every((s, i) => record(s) && s.id === CRITICAL30_SECTIONS[i] && s.code === ["INF", "ASM", "DED", "INT", "ARG"][i] && s.count === 6 && text(s.title))
    || !Array.isArray(q.questions) || q.questions.length !== 30 || !Array.isArray(q.directions) || q.directions.length !== 5
    || !Array.isArray(q.profiles) || q.profiles.length !== 5) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === CRITICAL30_SECTIONS[i] && d.itemCount === 6 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === bank[i].id && question.reverse === false
    && question.correctOptionId === bank[i].correctOptionId && record(question.explanation)
    && question.explanation.en === bank[i].explanation.en && question.explanation.zh === bank[i].explanation.zh
    && record(question.prompt) && question.prompt.en === bank[i].prompt.en && question.prompt.zh === bank[i].prompt.zh
    && Array.isArray(question.options) && question.options.length === bank[i].options.length && Array.from(question.options).every((o, j) => record(o)
      && o.id === ["A", "B", "C", "D", "E"][j] && o.score === undefined && o.directionId === CRITICAL30_SECTIONS[Math.floor(i / 6)]
      && record(o.label) && o.label.en === bank[i].options[j].label.en && o.label.zh === bank[i].options[j].label.zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === CRITICAL30_SECTIONS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title) && texts(s.paragraphs)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "timing", "scoring", "use"][i] && text(s.title) && texts(s.paragraphs))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 2 && Array.from(q.references).every((r, i) => record(r) && text(r.title) && r.url === [
    "https://www.talentlens.com/practice-tests.html",
    "https://www.pearsonvue.com/content/dam/VUE/vue/en/documents/clients/phnro/wg_practice.pdf"
][i]);
}
/** Reuse the already shipped dual-clock deadline behaviour without changing its four-area edition. */
export const readCritical30Clock = readAfqt32Clock;

export function scoreCritical30(q: unknown, attempt: unknown): { status: "unavailable" | "invalid" | "incomplete" } | { status: "complete"; result: Critical30Result } {
  if (!isCritical30ConfigurationValid(q)) return { status: "unavailable" };
  if (!record(attempt) || Object.keys(attempt).some(k => !["mode", "answers", "closure"].includes(k)) || typeof attempt.mode !== "string" || !["timed", "study"].includes(attempt.mode) || !record(attempt.answers)) return { status: "invalid" };
  const answers = attempt.answers;
  if (Object.entries(answers).some(([id, value]) => typeof value !== "string" || !q.questions.some(item => item.id === id && (value === "skip" || item.options.some(o => o.id === value))))) return { status: "invalid" };
  if (attempt.closure === undefined) return { status: "incomplete" };
  const end = attempt.closure;
  if (!record(end) || Object.keys(end).length !== 2 || typeof end.reason !== "string" || !["finished", "expired"].includes(end.reason) || typeof end.elapsedMs !== "number" || !Number.isFinite(end.elapsedMs) || end.elapsedMs < 0
    || (attempt.mode === "study" ? end.reason !== "finished" || end.elapsedMs !== 0 : end.reason === "expired" ? end.elapsedMs < CRITICAL30_LIMIT * 1000 : end.elapsedMs >= CRITICAL30_LIMIT * 1000)) return { status: "invalid" };
  const items: Critical30Result["items"] = q.questions.map(item => {
    const selectedOptionId = answers[item.id] === undefined || answers[item.id] === "skip" ? null : answers[item.id] as string;
    return { id: item.id, selectedOptionId, correctOptionId: item.correctOptionId!, outcome: selectedOptionId === null ? "unanswered" : selectedOptionId === item.correctOptionId ? "correct" : "wrong" };
  });
  const count = (part: typeof items): Critical30Readout => ({ correct: part.filter(x => x.outcome === "correct").length, wrong: part.filter(x => x.outcome === "wrong").length, unanswered: part.filter(x => x.outcome === "unanswered").length, total: part.length });
  return { status: "complete", result: { mode: attempt.mode as Critical30Mode, closure: end as Critical30Closure, parts: CRITICAL30_SECTIONS.map((id, i) => ({ id, ...count(items.slice(i * 6, i * 6 + 6)) })), overall: count(items), items } };
}
