import type { Questionnaire, Text } from "./types";

export type StressReflection4Questionnaire = Omit<Questionnaire, "kind"> & { kind: "stress-reflection4"; instructions: Text; resultHeading: Text };
export type StressReflection4Result = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 4; total: number;
  contributions: { id: string; chosen: number; reversed: boolean; value: number }[];
};
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const bilingual = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
const dense = (v: unknown, n: number, check: (x: unknown, i: number) => boolean) => Array.isArray(v) && v.length === n && Array.from(v).every(check);
const sections = (v: unknown, ids: string[]) => dense(v, ids.length, (s, i) => plain(s) && s.id === ids[i] && bilingual(s.title) && dense(s.paragraphs, 2, bilingual));

/** Original monthly reflection, with its own four prompts and reverse keys; no PSS-4 validity or cutoffs. */
export function isStressReflection4ConfigurationValid(input: unknown): input is StressReflection4Questionnaire {
  if (!plain(input) || input.kind !== "stress-reflection4" || input.slug !== "stress-check-in-test" || input.code !== "FM_MONTHLY_STRESS_REFLECTION4"
    || !bilingual(input.title) || !bilingual(input.seoTitle) || !bilingual(input.description) || !bilingual(input.introduction)
    || !bilingual(input.instructions) || !bilingual(input.resultHeading) || !plain(input.source)
    || input.source.kind !== "fermatmind_original_monthly_stress_reflection4" || input.source.formCode !== "fm_original_monthly_stress4_v1"
    || input.source.itemBankVersion !== "fm_original_monthly_stress4_v1" || input.source.scoringVersion !== "four_items_0to4_reverse_2_4_sum_0to16_v1"
    || input.source.resultContentVersion !== "monthly_stress_one_full_guide_v1" || input.source.psychometricValidationCompleted !== false
    || typeof input.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.itemBankSha256)
    || typeof input.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.resultContentSha256)) return false;
  return dense(input.directions, 1, d => plain(d) && d.id === "MONTHLY_STRESS" && d.itemCount === 4 && bilingual(d.title))
    && dense(input.questions, 4, (q, i) => plain(q) && q.id === `stress-check-in-0${i + 1}` && q.reverse === (i === 1 || i === 3) && q.correctOptionId === undefined && bilingual(q.prompt)
      && dense(q.options, 5, (o, n) => plain(o) && o.id === String(n) && o.score === n && o.directionId === "MONTHLY_STRESS" && bilingual(o.label)))
    && dense(input.profiles, 1, p => plain(p) && p.id === "reading-your-check-in" && dense(p.directionIds, 1, id => id === "MONTHLY_STRESS")
      && bilingual(p.title) && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo) && bilingual(p.seo.title) && bilingual(p.seo.description)
      && sections(p.sections, ["meaning", "calculation", "patterns", "context", "reflection", "limits"]))
    && sections(input.guide, ["original", "arithmetic", "reading", "privacy"])
    && dense(input.faq, 6, f => plain(f) && bilingual(f.question) && bilingual(f.answer))
    && dense(input.references, 2, r => plain(r) && bilingual(r.title) && typeof r.url === "string" && /^https:\/\//.test(r.url));
}

export function scoreStressReflection4Questionnaire(input: unknown, answers: unknown): StressReflection4Result {
  if (!isStressReflection4ConfigurationValid(input)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Reflect.ownKeys(answers).some(k => typeof k !== "string")) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const questions = new Map(input.questions.map(q => [q.id, q]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    if (!questions.has(id) || typeof descriptor.value !== "string" || !/^[0-4]$/.test(descriptor.value)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 4) return { status: "incomplete", answered };
  const contributions = input.questions.map(q => {
    const chosen = Number(descriptors[q.id].value), reversed = q.reverse === true;
    return { id: q.id, chosen, reversed, value: reversed ? 4 - chosen : chosen };
  });
  return { status: "complete", answered: 4, total: contributions.reduce((sum, p) => sum + p.value, 0), contributions };
}
