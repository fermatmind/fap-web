import type { Questionnaire } from "@/lib/questionnaires/types";

export type MiniOrientationQuestionnaire = Omit<Questionnaire, "kind" | "instructions" | "resultHeading"> & {
  kind: "mini-orientation"; instructions: NonNullable<Questionnaire["instructions"]>; resultHeading: NonNullable<Questionnaire["resultHeading"]>;
};
export type OrientationDistribution = { numeric: number; uncertain: number; skipped: number; choices: Record<string, number> };
export type OrientationRecord = { status: "complete"; answered: 20; state: "FULLY_ANSWERED" | "PARTIALLY_SKIPPED" | "ALL_SKIPPED"; domains: Record<string, OrientationDistribution> };
export type OrientationResult = OrientationRecord | { status: "incomplete" | "invalid" | "unavailable"; answered: number };
const domains = ["ATTRACTION_AWARENESS", "ATTRACTION_DIFFERENTIATION", "PATTERN_CLARITY", "LABEL_COMFORT", "PRIVACY_SUPPORT"];
const profiles = ["noticing-attraction", "different-forms-of-attraction", "current-patterns-and-uncertainty", "choosing-or-not-using-labels", "privacy-and-support"];
const sections = ["scope", "counts", "context", "differences", "observation", "limits"];
const methods = ["source", "scope", "choices", "record", "privacy", "safety"];
const plain = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x) && [Object.prototype, null].includes(Object.getPrototypeOf(x));
const text = (x: unknown): boolean => plain(x) && typeof x.en === "string" && !!x.en.trim() && typeof x.zh === "string" && !!x.zh.trim();
const dense = (x: unknown, n: number, test: (entry: unknown, i: number) => boolean): boolean => Array.isArray(x) && x.length === n && Array.from(x).every(test);
export function isMiniOrientationConfigurationValid(q: unknown): q is MiniOrientationQuestionnaire {
  if (!plain(q) || q.kind !== "mini-orientation" || q.slug !== "orientation-exploration-test" || q.code !== "ORIENTATION_EXPLORATION"
    || typeof q.version !== "string" || !q.version.trim() || !text(q.title) || !text(q.seoTitle) || !text(q.description) || !text(q.instructions) || !text(q.resultHeading) || !text(q.introduction)
    || !plain(q.source) || q.source.kind !== "fermatmind_original_mini_orientation_reflection_20" || q.source.formCode !== "orientation_exploration_reflection_20"
    || q.source.itemBankVersion !== "orientation_mini_original_0.1.0_fm_en_working_v1" || q.source.scoringVersion !== "five4_complete_numeric_uncertain_subset_skip_distribution_only_v1"
    || q.source.resultContentVersion !== "orientation_five_full6_v1" || q.source.psychometricValidationCompleted !== false) return false;
  return dense(q.directions, 5, (d, i) => plain(d) && d.id === domains[i] && d.itemCount === 4 && text(d.title))
    && dense(q.questions, 20, (v, i) => plain(v) && v.id === `ORIENT_REF_${String(i + 1).padStart(3, "0")}` && v.reverse === false && v.correctOptionId === undefined && text(v.prompt)
      && dense(v.options, 6, (o, j) => plain(o) && o.id === (j === 5 ? "na" : String(j + 1)) && o.score === (j === 5 ? null : j + 1) && o.directionId === domains[Math.floor(i / 4)] && text(o.label)))
    && dense(q.profiles, 5, (p, i) => plain(p) && p.id === profiles[i] && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
      && plain(p.seo) && text(p.seo.title) && text(p.seo.description) && dense(p.directionIds, 1, x => x === domains[i])
      && dense(p.sections, 6, (s, j) => plain(s) && s.id === profiles[i] + "-" + sections[j] && text(s.title) && dense(s.paragraphs, 2, text)))
    && dense(q.guide, 6, (s, i) => plain(s) && s.id === methods[i] && text(s.title) && dense(s.paragraphs, 2, text))
    && dense(q.faq, 8, f => plain(f) && text(f.question) && text(f.answer));
}
export function recordMiniOrientationQuestionnaire(quiz: unknown, answers: unknown): OrientationResult {
  if (!isMiniOrientationConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const records: Record<string, OrientationDistribution> = Object.fromEntries(domains.map(id => [id, { numeric: 0, uncertain: 0, skipped: 0, choices: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, na: 0 } }]));
  const questions = new Map(quiz.questions.map((q, i) => [q.id, domains[Math.floor(i / 4)]]));
  let answered = 0, skipped = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const domain = questions.get(id), value: unknown = descriptor.value;
    if (!domain || typeof value !== "string" || (value !== "na" && !["1", "2", "3", "4", "5"].includes(value))) return { status: "invalid", answered };
    const record = records[domain]; record.choices[value]++;
    if (value === "na") { record.skipped++; skipped++; } else { record.numeric++; if (value === "3") record.uncertain++; }
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  return { status: "complete", answered: 20, state: skipped === 20 ? "ALL_SKIPPED" : skipped ? "PARTIALLY_SKIPPED" : "FULLY_ANSWERED", domains: records };
}
