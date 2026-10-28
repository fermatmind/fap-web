import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { FacetResult, FacetScore } from "@/lib/questionnaires/scoring";

export type MiniHabitQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-habit"; instructions: Text; resultHeading: Text };

const directions = ["cues-and-urges", "automatic-starts", "displaced-plans", "continuing-after-inconvenience", "everyday-effects"];
const profiles = directions;
const methods = ["source", "scope", "arithmetic", "missing", "boundaries", "privacy"];
const methodParagraphs = [2, 2, 2, 2, 2, 2];
const sections = ["scope", "example", "responses", "contrast", "observation", "limits"];
const profileParagraphs = [2, 2, 2, 2, 2, 2];
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

export function isMiniHabitConfigurationValid(quiz: unknown): quiz is MiniHabitQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "mini-habit" || quiz.slug !== "habit-patterns-test" || quiz.code !== "ADDICTION_TENDENCY" || quiz.minimumRatedItems !== 3
    || typeof quiz.version !== "string" || !quiz.version.trim()
    || !bilingual(quiz.title) || !bilingual(quiz.seoTitle) || !bilingual(quiz.description) || !bilingual(quiz.resultHeading)
    || !bilingual(quiz.instructions) || !bilingual(quiz.introduction) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_habit_patterns_20"
    || quiz.source.formCode !== "habit_tendency_likert_20"
    || quiz.source.itemBankVersion !== "habit_mini_original_0.1.0_fm_en_working_v1"
    || quiz.source.scoringVersion !== "five4_min3_skip_sum_mean4dp_no_ranking_v1"
    || quiz.source.resultContentVersion !== "habit_mini_five_full6_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 5, (d, i) => plain(d) && d.id === directions[i] && d.itemCount === 4 && bilingual(d.title))
    && dense(quiz.questions, 20, (q, i) => plain(q) && q.id === `HABIT_LK_${String(i + 1).padStart(3, "0")}`
      && q.reverse === false && bilingual(q.prompt)
      && dense(q.options, 6, (o, j) => plain(o) && o.id === (j === 5 ? "na" : String(j + 1))
        && o.score === (j === 5 ? null : j + 1) && o.directionId === directions[Math.floor(i / 4)] && bilingual(o.label)))
    && dense(quiz.profiles, 5, (p, i) => plain(p) && p.id === profiles[i] && bilingual(p.title)
      && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo)
      && bilingual(p.seo.title) && bilingual(p.seo.description)
      && dense(p.directionIds, 1, id => id === directions[i])
      && dense(p.sections, 6, (s, j) => plain(s) && s.id === profiles[i] + "-" + sections[j]
        && bilingual(s.title) && dense(s.paragraphs, profileParagraphs[j], bilingual)))
    && dense(quiz.guide, 6, (s, i) => plain(s) && s.id === methods[i] && bilingual(s.title) && dense(s.paragraphs, methodParagraphs[i], bilingual))
    && dense(quiz.faq, 8, f => plain(f) && bilingual(f.question) && bilingual(f.answer));
}

export function scoreMiniHabitQuestionnaire(quiz: unknown, answers: unknown): FacetResult {
  if (!isMiniHabitConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(entries).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const facets: Record<string, FacetScore> = Object.fromEntries(directions.map(id => [id, { sum: 0, rated: 0, total: 4, mean: null }]));
  const questions = new Map(quiz.questions.map((q, i) => [q.id, directions[Math.floor(i / 4)]]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(entries)) {
    const direction = questions.get(id), value: unknown = descriptor.value;
    if (!direction || typeof value !== "string" || (value !== "na" && !/^[1-5]$/.test(value))) return { status: "invalid", answered };
    if (value !== "na") { facets[direction].sum += Number(value); facets[direction].rated++; }
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  for (const part of Object.values(facets)) if (part.rated >= 3) part.mean = Math.round((part.sum / part.rated + Number.EPSILON) * 10000) / 10000;
  return { status: "complete", answered, facets };
}
