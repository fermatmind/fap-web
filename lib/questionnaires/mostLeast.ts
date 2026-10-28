import type { Questionnaire } from "./types";

export const MOST_LEAST_TOPICS = ["context", "options", "finish", "details", "constraints", "understanding", "followup", "pause"] as const;
export type MostLeastAnswer = { most?: string; least?: string };
export type MostLeastAnswers = Record<string, MostLeastAnswer>;
export type MostLeastCount = { most: number; least: number; difference: number };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const bilingual = (v: unknown) => record(v) && ["en", "zh"].every(l => typeof v[l] === "string" && (v[l] as string).trim().length > 0);

export function isMostLeastConfigurationValid(value: unknown): value is Questionnaire {
  if (!record(value) || value.kind !== "most-least" || value.slug !== "caliper-style-assessment-test" || value.code !== "FM_MOST_LEAST_PRACTICE" || value.version !== "1.0.0" ||
    !record(value.source) || value.source.kind !== "fermatmind_original_most_least_format_practice" || value.source.formCode !== "fm_most_least_blocks16_v1" ||
    value.source.itemBankVersion !== "fm_most_least_blocks16_v1" || value.source.scoringVersion !== "fm_most_least_raw_counts_v1" || value.source.resultContentVersion !== "fm_most_least_guides8_v1" ||
    value.source.psychometricValidationCompleted !== false || value.source.itemBankSha256 !== "4dace0f609e8ec9b76cbe2dffcd5df6642fbc868b8a5a7988fce120f155d53cc" ||
    value.source.resultContentSha256 !== "6826606ac7ef440f0b657a840a2e8b2691526c2c83cb1cdce5d90392120abb1c" ||
    ![value.title, value.description, value.seoTitle, value.introduction, value.instructions, value.resultHeading].every(bilingual) ||
    !Array.isArray(value.directions) || value.directions.length !== 8 || !Array.from(value.directions).every((d, i) => record(d) && d.id === MOST_LEAST_TOPICS[i] && d.comparisons === 8 && bilingual(d.title)) ||
    !Array.isArray(value.questions) || value.questions.length !== 16 || !Array.isArray(value.profiles) || value.profiles.length !== 8) return false;
  const questionsValid = Array.from(value.questions).every((q, i) => {
    if (!record(q) || q.id !== `ML_${String(i + 1).padStart(2, "0")}` || !bilingual(q.prompt) || !Array.isArray(q.options) || q.options.length !== 4) return false;
    const base = i < 8 ? [0, 1, 3, 4] : [0, 2, 4, 5];
    return Array.from(q.options).every((o, p) => record(o) && o.id === "ABCD"[p] && o.directionId === MOST_LEAST_TOPICS[(base[p] + i % 8) % 8] && bilingual(o.label) && o.score === undefined);
  });
  const sectionIds = ["meaning", "example", "most", "least", "tradeoff", "next", "reading"];
  return questionsValid && Array.from(value.profiles).every((p, i) => record(p) && p.id === MOST_LEAST_TOPICS[i] && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id &&
    [p.title, p.headline, p.summary, p.scoreReading].every(bilingual) && record(p.seo) && [p.seo.title, p.seo.description].every(bilingual) &&
    Array.isArray(p.sections) && p.sections.length === 7 && Array.from(p.sections).every((s, j) => record(s) && s.id === sectionIds[j] && bilingual(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(bilingual))) &&
    Array.isArray(value.guide) && value.guide.length === 4 && Array.from(value.guide).every((s, i) => record(s) && s.id === ["method", "counts", "privacy", "use"][i] && bilingual(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(bilingual)) &&
    Array.isArray(value.faq) && value.faq.length === 6 && Array.from(value.faq).every(f => record(f) && bilingual(f.question) && bilingual(f.answer)) &&
    Array.isArray(value.references) && value.references.length === 1 && record(value.references[0]) && bilingual(value.references[0].title) && value.references[0].url === "https://support.talogy.com/hc/en-us/articles/11134068643091-CALIPER-Design-of-the-Caliper-Profile-Assessment";
}

export function scoreMostLeast(quiz: Questionnaire, answers: unknown):
  | { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; counts: Record<string, MostLeastCount> } {
  if (!isMostLeastConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Object.keys(answers).some(id => !quiz.questions.some(q => q.id === id))) return { status: "invalid", answered: 0 };
  const counts: Record<string, MostLeastCount> = Object.fromEntries(MOST_LEAST_TOPICS.map(id => [id, { most: 0, least: 0, difference: 0 }]));
  let answered = 0;
  for (const q of quiz.questions) {
    if (!Object.hasOwn(answers, q.id)) continue;
    const pair = answers[q.id];
    if (!record(pair) || Object.keys(pair).some(k => k !== "most" && k !== "least") || Object.entries(pair).some(([, v]) => !q.options.some(o => o.id === v)) || (pair.most !== undefined && pair.most === pair.least)) return { status: "invalid", answered: 0 };
    if (pair.most === undefined || pair.least === undefined) continue;
    counts[q.options.find(o => o.id === pair.most)!.directionId].most++;
    counts[q.options.find(o => o.id === pair.least)!.directionId].least++;
    answered++;
  }
  if (answered !== 16) return { status: "incomplete", answered };
  for (const count of Object.values(counts)) count.difference = count.most - count.least;
  return { status: "complete", answered: 16, counts };
}
