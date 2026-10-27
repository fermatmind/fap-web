import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult, FacetScore } from "@/lib/questionnaires/scoring";

const directions = ["warm-response", "clear-boundaries"] as const;
const profiles = ["authoritative", "authoritarian", "permissive", "uninvolved"];
const methods = ["facet-scoring", "facet-reading", "facet-comparison", "source", "privacy"];
const plain = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};
const bilingual = (value: unknown): boolean => plain(value)
  && typeof value.en === "string" && value.en.trim().length > 0
  && typeof value.zh === "string" && value.zh.trim().length > 0;
const dense = (value: unknown, size: number, check: (entry: unknown, index: number) => boolean): boolean =>
  Array.isArray(value) && value.length === size && Array.from(value).every(check);

export function isParentingPracticesConfigurationValid(quiz: unknown): boolean {
  if (!plain(quiz) || quiz.kind !== "parenting-practices" || quiz.slug !== "parenting-style"
    || quiz.code !== "FM_PARENTING_RESPONSES12" || !bilingual(quiz.instructions) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_parenting_responses_not_PAQ_PSDQ"
    || quiz.source.formCode !== "fm_parenting_warmth_boundaries12_v1"
    || quiz.source.itemBankVersion !== "original12_bilingual_v1"
    || quiz.source.scoringVersion !== "two_complete6_frequency_means1dp_no_typology_threshold_v1"
    || quiz.source.resultContentVersion !== "fm_parenting_four_full8_general_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 2, (d, i) => plain(d) && d.id === directions[i] && d.itemCount === 6 && bilingual(d.title))
    && dense(quiz.questions, 12, (q, i) => plain(q) && q.id === `PCARE_${String(i + 1).padStart(2, "0")}`
      && q.reverse === false && bilingual(q.prompt)
      && dense(q.options, 6, (o, j) => plain(o) && o.id === (j === 5 ? "na" : String(j + 1))
        && o.score === (j === 5 ? null : j + 1) && o.directionId === directions[i < 6 ? 0 : 1] && bilingual(o.label)))
    && dense(quiz.profiles, 4, (p, i) => plain(p) && p.id === profiles[i] && bilingual(p.title)
      && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo)
      && bilingual(p.seo.title) && bilingual(p.seo.description)
      && dense(p.directionIds, 2, (id, j) => id === directions[j])
      && dense(p.sections, 8, (s, j) => plain(s) && s.id === `${profiles[i]}-${j + 1}`
        && bilingual(s.title) && dense(s.paragraphs, 1, bilingual)))
    && dense(quiz.guide, 5, (s, i) => plain(s) && s.id === methods[i] && bilingual(s.title) && dense(s.paragraphs, 1, bilingual))
    && dense(quiz.faq, 8, x => plain(x) && bilingual(x.question) && bilingual(x.answer));
}

export function scoreParentingPracticesQuestionnaire(quiz: Questionnaire, answers: unknown): FacetResult {
  if (!isParentingPracticesConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(entries).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const parts: Record<string, FacetScore> = {
    "warm-response": { sum: 0, rated: 0, total: 6, mean: null },
    "clear-boundaries": { sum: 0, rated: 0, total: 6, mean: null },
  };
  const questions = new Map(quiz.questions.map((q, i) => [q.id, directions[i < 6 ? 0 : 1]]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(entries)) {
    const direction = questions.get(id), value: unknown = descriptor.value;
    if (!direction || typeof value !== "string" || (value !== "na" && !/^[1-5]$/.test(value))) return { status: "invalid", answered };
    if (value !== "na") { parts[direction].sum += Number(value); parts[direction].rated++; }
    answered++;
  }
  if (answered !== 12) return { status: "incomplete", answered };
  for (const part of Object.values(parts)) if (part.rated === 6) part.mean = Math.round(part.sum / 6 * 10) / 10;
  return { status: "complete", answered, facets: parts };
}
