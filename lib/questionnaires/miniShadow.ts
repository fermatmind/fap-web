import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { FacetResult, FacetScore } from "@/lib/questionnaires/scoring";

export type MiniShadowQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-shadow"; instructions: Text; resultHeading: Text };

const directions = ["WITHDRAWAL_AVOIDANCE", "CONTROL_TIGHTENING", "APPEASEMENT_RESPONSE", "DEFENSIVE_PROTECTION", "EMOTIONAL_SHUTDOWN"];
const profiles = ["stepping-back-and-delaying", "tightening-plans-and-checks", "agreeing-first-and-maintaining-harmony", "explaining-and-protecting-a-position", "speaking-less-and-holding-back"];
const methods = ["source", "scope", "arithmetic", "complete", "separate", "context", "privacy", "reading"];
const methodParagraphs = [2, 2, 2, 2, 2, 2, 2, 2];
const sections = ["scope", "items", "counts", "context", "functions", "differences", "observation", "limits"];
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

export function isMiniShadowConfigurationValid(quiz: unknown): quiz is MiniShadowQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "mini-shadow" || quiz.slug !== "stress-response-patterns-test" || quiz.code !== "PERSONALITY_SHADOW" || quiz.minimumRatedItems !== 4
    || typeof quiz.version !== "string" || !quiz.version.trim()
    || !bilingual(quiz.title) || !bilingual(quiz.seoTitle) || !bilingual(quiz.description) || !bilingual(quiz.resultHeading)
    || !bilingual(quiz.instructions) || !bilingual(quiz.introduction) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_stress_response_20"
    || quiz.source.formCode !== "personality_shadow_likert_20"
    || quiz.source.itemBankVersion !== "shadow_mini_original_0.1.0_fm_en_working_v1"
    || quiz.source.scoringVersion !== "five_complete4_sum_mean4dp_all20_no_ranking_v1"
    || quiz.source.resultContentVersion !== "stress_response_five_full8_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 5, (d, i) => plain(d) && d.id === directions[i] && d.itemCount === 4 && bilingual(d.title))
    && dense(quiz.questions, 20, (q, i) => plain(q) && q.id === `SHADOW_LK_${String(i + 1).padStart(3, "0")}`
      && q.reverse === false && q.correctOptionId === undefined && bilingual(q.prompt)
      && dense(q.options, 5, (o, j) => plain(o) && o.id === String(j + 1)
        && o.score === j + 1 && o.directionId === directions[Math.floor(i / 4)] && bilingual(o.label)))
    && dense(quiz.profiles, 5, (p, i) => plain(p) && p.id === profiles[i] && bilingual(p.title)
      && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo)
      && bilingual(p.seo.title) && bilingual(p.seo.description)
      && dense(p.directionIds, 1, id => id === directions[i])
      && dense(p.sections, 8, (s, j) => plain(s) && s.id === profiles[i] + "-" + sections[j]
        && bilingual(s.title) && dense(s.paragraphs, profileParagraphs[j], bilingual)))
    && dense(quiz.guide, 8, (s, i) => plain(s) && s.id === methods[i] && bilingual(s.title) && dense(s.paragraphs, methodParagraphs[i], bilingual))
    && dense(quiz.faq, 8, f => plain(f) && bilingual(f.question) && bilingual(f.answer));
}

export function scoreMiniShadowQuestionnaire(quiz: unknown, answers: unknown): FacetResult {
  if (!isMiniShadowConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(entries).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const facets: Record<string, FacetScore> = Object.fromEntries(directions.map(id => [id, { sum: 0, rated: 0, total: 4, mean: null }]));
  const questions = new Map(quiz.questions.map((q, i) => [q.id, directions[Math.floor(i / 4)]]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(entries)) {
    const direction = questions.get(id), value: unknown = descriptor.value;
    if (!direction || typeof value !== "string" || !/^[1-5]$/.test(value)) return { status: "invalid", answered };
    facets[direction].sum += Number(value); facets[direction].rated++;
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  for (const part of Object.values(facets)) part.mean = part.sum / 4;
  return { status: "complete", answered, facets };
}
