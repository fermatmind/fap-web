import type { Questionnaire, Text } from "./types";
import type { FacetResult, FacetScore } from "./scoring";

const parts = [
  ["MEAT", "animal-flesh", 4], ["HYG", "poor-hygiene", 5],
  ["HUCON", "human-contamination", 4], ["MOLD", "mold", 4],
  ["FRUIT", "decaying-fruit", 4], ["FISH", "fish", 4],
  ["VEGI", "decaying-vegetables", 4], ["LCON", "living-contaminants", 3],
] as const;
const items = parts.flatMap(([code, id, count]) => Array.from({ length: count }, (_, i) => ({ id: `FDS_${code}${i + 1}`, part: id })));
const plain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const dense = (v: unknown, n: number, test: (value: unknown, i: number) => boolean) => Array.isArray(v) && v.length === n && Array.from(v).every(test);

/** Published 32-item bank; six-point ratings and eight separate complete-part means. */
export function isFds32ConfigurationValid(q: unknown): q is Questionnaire {
  if (!plain(q) || q.kind !== "fds32" || q.slug !== "food-disgust" || q.code !== "FDS32_CC_EN_WORKING_ZH"
    || q.version !== "fds32_table2_en_working_zh_v1" || q.minimumRatedItems !== undefined
    || !text(q.instructions) || !text(q.title) || !text(q.description) || !text(q.introduction) || !plain(q.source)
    || q.source.kind !== "fds32_published_ccby_table2_en_working_zh" || q.source.formCode !== q.version
    || q.source.itemBankVersion !== q.version || q.source.scoringVersion !== "fds32_eight_completepart_mean1to6_round1_v1"
    || q.source.resultContentVersion !== "fds32_eight_full8_v1" || q.source.psychometricValidationCompleted !== false) return false;
  return dense(q.directions, 8, (d, i) => plain(d) && d.id === parts[i][1] && d.itemCount === parts[i][2] && text(d.title))
    && dense(q.questions, 32, (item, i) => plain(item) && item.id === items[i].id && text(item.prompt)
      && item.reverse === false && item.correctOptionId === undefined && item.explanation === undefined
      && dense(item.options, 7, (o, j) => plain(o) && o.id === (j === 6 ? "na" : String(j + 1))
        && o.directionId === items[i].part && o.score === (j === 6 ? null : j + 1) && text(o.label)))
    && dense(q.profiles, 8, (p, i) => plain(p) && p.id === parts[i][1] && dense(p.directionIds, 1, d => d === parts[i][1])
      && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && plain(p.seo) && text(p.seo.title) && text(p.seo.description)
      && dense(p.sections, 8, s => plain(s) && text(s.title) && dense(s.paragraphs, 2, text)))
    && dense(q.guide, 8, s => plain(s) && text(s.title) && dense(s.paragraphs, 1, text))
    && dense(q.faq, 8, f => plain(f) && text(f.question) && text(f.answer));
}

export function scoreFds32Questionnaire(quiz: unknown, answers: unknown): FacetResult {
  if (!isFds32ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const facets: Record<string, FacetScore> = Object.fromEntries(parts.map(([, id, total]) => [id, { sum: 0, rated: 0, total, mean: null }]));
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const value: unknown = descriptor.value;
    const option = typeof value === "string" ? questions.get(id)?.options.find(o => o.id === value) : undefined;
    if (!option) return { status: "invalid", answered };
    if (typeof option.score === "number") { facets[option.directionId].sum += option.score; facets[option.directionId].rated++; }
    answered++;
  }
  if (answered !== 32) return { status: "incomplete", answered };
  for (const part of Object.values(facets)) if (part.rated === part.total) part.mean = Math.round(part.sum / part.total * 10) / 10;
  return { status: "complete", answered, facets };
}
