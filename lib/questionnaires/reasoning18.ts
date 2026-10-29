import bank from "./reasoning18Bank.json";
import type { Questionnaire, Text } from "./types";
import { readAfqt32Clock } from "./afqt32";

/** One fixed original practice edition, not an official provider form or calibrated score. */
export const REASONING18_SECTIONS = ["verbal", "numerical", "logical"] as const;
export const REASONING18_LIMITS = [180, 300, 240] as const;
export type Reasoning18SectionId = typeof REASONING18_SECTIONS[number];
export type Reasoning18Mode = "timed" | "study";
export type Reasoning18Closure = { id: Reasoning18SectionId; reason: "finished" | "expired"; elapsedMs: number };
export type Reasoning18Readout = { correct: number; wrong: number; unanswered: number; total: number };
export type Reasoning18Result = { mode: Reasoning18Mode; parts: (Reasoning18Readout & Reasoning18Closure)[]; overall: Reasoning18Readout; items: { id: string; selectedOptionId: string | null; correctOptionId: string; outcome: "correct" | "wrong" | "unanswered" }[] };
export type Reasoning18Questionnaire = Questionnaire & { kind: "reasoning18"; reasoning18: { sections: { id: Reasoning18SectionId; code: string; count: 6; limitSeconds: number; title: Text }[]; subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v)) && Reflect.ownKeys(v).length === Object.keys(v).length;
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const texts = (v: unknown) => Array.isArray(v) && v.length === 2 && Array.from(v).every(text);
export function isReasoning18ConfigurationValid(q: unknown): q is Reasoning18Questionnaire {
  if (!record(q) || q.slug !== "employer-reasoning-practice-test" || q.kind !== "reasoning18" || q.code !== "FM_REASONING18" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 16 || !record(q.source)
    || q.source.kind !== "fermatmind_original_employer_reasoning_practice" || q.source.formCode !== "fm_reasoning18_original_english_v1"
    || q.source.itemBankVersion !== "fm_reasoning18_fixed_mixed_english_v1" || q.source.scoringVersion !== "raw_correct_wrong_unanswered_3x6_site_caps_or_study_v1"
    || q.source.resultContentVersion !== "fm_reasoning18_three_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "29347832655c83c86e4314c31ffd586f3ddff9f7fd9482f59b8b1dc9b08bd47f" || q.source.resultContentSha256 !== "ead7672fcb9987f2a6b617ef0962b10c22e5ad610f765a2ef8576db75a7a91f0"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.reasoning18) || ![q.reasoning18.subtitle, q.reasoning18.privacy, q.reasoning18.editionNotice, q.reasoning18.attribution].every(text)
    || !Array.isArray(q.reasoning18.sections) || q.reasoning18.sections.length !== 3
    || !Array.from(q.reasoning18.sections).every((s, i) => record(s) && s.id === REASONING18_SECTIONS[i] && s.code === ["VR", "NR", "LR"][i] && s.count === 6 && s.limitSeconds === REASONING18_LIMITS[i] && text(s.title))
    || !Array.isArray(q.questions) || q.questions.length !== 18 || !Array.isArray(q.directions) || q.directions.length !== 3
    || !Array.isArray(q.profiles) || q.profiles.length !== 3) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === REASONING18_SECTIONS[i] && d.itemCount === 6 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === bank[i].id && question.reverse === false
    && question.correctOptionId === bank[i].correctOptionId && record(question.explanation)
    && question.explanation.en === bank[i].explanation.en && question.explanation.zh === bank[i].explanation.zh
    && record(question.prompt) && question.prompt.en === bank[i].prompt.en && question.prompt.zh === bank[i].prompt.zh
    && Array.isArray(question.options) && question.options.length === bank[i].options.length && Array.from(question.options).every((o, j) => record(o)
      && o.id === ["A", "B", "C", "D"][j] && o.score === undefined && o.directionId === REASONING18_SECTIONS[Math.floor(i / 6)]
      && record(o.label) && o.label.en === bank[i].options[j].label.en && o.label.zh === bank[i].options[j].label.zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === REASONING18_SECTIONS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title) && texts(s.paragraphs)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "timing", "scoring", "use"][i] && text(s.title) && texts(s.paragraphs))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title) && r.url === [
    "https://support.shl.com/viewArticle.html?c=10_91_13_107_157_&d=5205e217-dc3b-46b7-g76d-77ee64815473&hl=en",
    "https://service.shl.com/docs/Fact%20Sheet%20-%20Verify%20-%20Verbal%20Ability.pdf",
    "https://www.kornferry.com/content/dam/kornferry-v2/pdf/careers/Candidate-Guide-Guide-to-taking-psychometric-assessments.pdf"
][i]);
}
/** Reuse the already shipped dual-clock deadline behaviour without changing its four-area edition. */
export const readReasoning18Clock = readAfqt32Clock;

export function scoreReasoning18(q: unknown, attempt: unknown): { status: "unavailable" | "invalid" | "incomplete" } | { status: "complete"; result: Reasoning18Result } {
  if (!isReasoning18ConfigurationValid(q)) return { status: "unavailable" };
  if (!record(attempt) || Object.keys(attempt).some(k => !["mode", "answers", "sections"].includes(k)) || typeof attempt.mode !== "string" || !["timed", "study"].includes(attempt.mode)
    || !record(attempt.answers) || !Array.isArray(attempt.sections) || attempt.sections.length > 3) return { status: "invalid" };
  const answers = attempt.answers;
  if (Object.entries(answers).some(([id, v]) => typeof v !== "string" || !q.questions.some(s => s.id === id && (v === "skip" || s.options.some(o => o.id === v))))) return { status: "invalid" };
  if (!Array.from(attempt.sections).every((s, i) => record(s) && Object.keys(s).length === 3 && s.id === REASONING18_SECTIONS[i] && typeof s.reason === "string" && ["finished", "expired"].includes(s.reason)
    && typeof s.elapsedMs === "number" && Number.isFinite(s.elapsedMs) && s.elapsedMs >= 0
    && (attempt.mode === "study" ? s.reason === "finished" && s.elapsedMs === 0 : s.reason === "expired" ? s.elapsedMs >= REASONING18_LIMITS[i] * 1000 : s.elapsedMs < REASONING18_LIMITS[i] * 1000))) return { status: "invalid" };
  if (attempt.sections.length !== 3) return { status: "incomplete" };
  const closures = attempt.sections as Reasoning18Closure[];
  const items: Reasoning18Result["items"] = q.questions.map(s => {
    const selectedOptionId = answers[s.id] === undefined || answers[s.id] === "skip" ? null : answers[s.id] as string;
    return { id: s.id, selectedOptionId, correctOptionId: s.correctOptionId!, outcome: selectedOptionId === null ? "unanswered" : selectedOptionId === s.correctOptionId ? "correct" : "wrong" };
  });
  const count = (part: typeof items): Reasoning18Readout => ({ correct: part.filter(s => s.outcome === "correct").length, wrong: part.filter(s => s.outcome === "wrong").length, unanswered: part.filter(s => s.outcome === "unanswered").length, total: part.length });
  return { status: "complete", result: { mode: attempt.mode as Reasoning18Mode, parts: closures.map((s, i) => ({ ...s, ...count(items.slice(i * 6, i * 6 + 6)) })), overall: count(items), items } };
}
