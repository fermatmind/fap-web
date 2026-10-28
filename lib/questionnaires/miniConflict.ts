import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { FacetResult, FacetScore } from "@/lib/questionnaires/scoring";

export type MiniConflictQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-conflict"; instructions: Text; resultHeading: Text };

const directions = ["CONFLICT_ESCALATION", "BOUNDARY_OVERRIDE", "RESPONSIBILITY_DEFLECTION", "REPAIR_INCONSISTENCY"];
const profiles = ["pressure-during-disagreements", "responding-to-no-and-pauses", "responding-to-behavioral-impact", "following-through-after-repair"];
const methods = ["source", "scope", "arithmetic", "missing", "separate", "context", "privacy", "safety"];
const methodParagraphs = [2, 2, 2, 2, 2, 2, 2, 2];
const sections = ["scope", "items", "counts", "context", "response", "differences", "observation", "limits"];
const profileParagraphs = [2, 2, 2, 2, 2, 2, 2, 2];
const plain = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
const bilingual = (value: unknown): boolean => plain(value)
  && typeof value.en === "string" && value.en.trim().length > 0
  && typeof value.zh === "string" && value.zh.trim().length > 0;
const dense = (value: unknown, size: number, check: (entry: unknown, index: number) => boolean): boolean =>
  Array.isArray(value) && value.length === size && Array.from(value).every(check);

export function isMiniConflictConfigurationValid(quiz: unknown): quiz is MiniConflictQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "mini-conflict" || quiz.slug !== "conflict-boundary-behaviors-test" || quiz.code !== "RISKY_PERSONALITY" || quiz.minimumRatedItems !== 4
    || typeof quiz.version !== "string" || !quiz.version.trim()
    || !bilingual(quiz.title) || !bilingual(quiz.seoTitle) || !bilingual(quiz.description) || !bilingual(quiz.resultHeading)
    || !bilingual(quiz.instructions) || !bilingual(quiz.introduction) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_conflict_boundary_24"
    || quiz.source.formCode !== "conflict_boundary_signals_likert_24"
    || quiz.source.itemBankVersion !== "conflict_boundary_mini_original_0.1.0_fm_en_working_v1"
    || quiz.source.scoringVersion !== "four6_min4_skip_sum_mean4dp_no_ranking_v1"
    || quiz.source.resultContentVersion !== "conflict_boundary_four_full8_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 4, (d, i) => plain(d) && d.id === directions[i] && d.itemCount === 6 && bilingual(d.title))
    && dense(quiz.questions, 24, (q, i) => plain(q) && q.id === `CBS_${String(i + 1).padStart(3, "0")}`
      && q.reverse === false && q.correctOptionId === undefined && bilingual(q.prompt)
      && dense(q.options, 6, (o, j) => plain(o) && o.id === (j === 5 ? "na" : String(j + 1))
        && o.score === (j === 5 ? null : j + 1) && o.directionId === directions[Math.floor(i / 6)] && bilingual(o.label)))
    && dense(quiz.profiles, 4, (p, i) => plain(p) && p.id === profiles[i] && bilingual(p.title)
      && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo)
      && bilingual(p.seo.title) && bilingual(p.seo.description)
      && dense(p.directionIds, 1, id => id === directions[i])
      && dense(p.sections, 8, (s, j) => plain(s) && s.id === profiles[i] + "-" + sections[j]
        && bilingual(s.title) && dense(s.paragraphs, profileParagraphs[j], bilingual)))
    && dense(quiz.guide, 8, (s, i) => plain(s) && s.id === methods[i] && bilingual(s.title) && dense(s.paragraphs, methodParagraphs[i], bilingual))
    && dense(quiz.faq, 8, f => plain(f) && bilingual(f.question) && bilingual(f.answer));
}

export function scoreMiniConflictQuestionnaire(quiz: unknown, answers: unknown): FacetResult {
  if (!isMiniConflictConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(entries).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const facets: Record<string, FacetScore> = Object.fromEntries(directions.map(id => [id, { sum: 0, rated: 0, total: 6, mean: null }]));
  const questions = new Map(quiz.questions.map((q, i) => [q.id, directions[Math.floor(i / 6)]]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(entries)) {
    const direction = questions.get(id), value: unknown = descriptor.value;
    if (!direction || typeof value !== "string" || (value !== "na" && !/^[1-5]$/.test(value))) return { status: "invalid", answered };
    if (value !== "na") { facets[direction].sum += Number(value); facets[direction].rated++; }
    answered++;
  }
  if (answered !== 24) return { status: "incomplete", answered };
  for (const part of Object.values(facets)) if (part.rated >= 4) part.mean = Math.round((part.sum / part.rated + Number.EPSILON) * 10000) / 10000;
  return { status: "complete", answered, facets };
}
