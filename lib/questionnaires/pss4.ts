import type { Questionnaire, Text } from "./types";

export type Pss4Questionnaire = Omit<Questionnaire, "kind"> & { kind: "pss4"; instructions: Text; resultHeading: Text };
export type Pss4Result = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: 4; total: number;
  contributions: { id: string; chosen: number; reversed: boolean; value: number }[];
};
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const bilingual = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
const dense = (v: unknown, n: number, check: (x: unknown, i: number) => boolean) => Array.isArray(v) && v.length === n && Array.from(v).every(check);
const sections = (v: unknown, ids: string[]) => dense(v, ids.length, (s, i) => plain(s) && s.id === ids[i] && bilingual(s.title) && dense(s.paragraphs, 2, bilingual));

/** Published English PSS-4 arithmetic; independent site Chinese translation, without imported norms or cutoffs. */
export function isPss4ConfigurationValid(input: unknown): input is Pss4Questionnaire {
  if (!plain(input) || input.kind !== "pss4" || input.slug !== "perceived-stress-scale-4" || input.code !== "FM_PSS4_CMU_REFERENCE"
    || !bilingual(input.title) || !bilingual(input.seoTitle) || !bilingual(input.description) || !bilingual(input.introduction)
    || !bilingual(input.instructions) || !bilingual(input.resultHeading) || !plain(input.source)
    || input.source.kind !== "pss4_author_lab_english_reference_fm_zh_translation" || input.source.formCode !== "cmu_pss4_en_fm_zh_translation_v1"
    || input.source.itemBankVersion !== "CMU-public-pss_4_item.doc-SHA256-9f3cc76d;not-a-verified-publisher-release-number" || input.source.scoringVersion !== "pss4_reverse_2_3_sum_0to16_complete4_v1"
    || input.source.resultContentVersion !== "pss4_full_guide_v1" || input.source.psychometricValidationCompleted !== false
    || input.source.officialChineseForChinaTextObtained !== false
    || input.source.chineseTranslation !== "fermatmind_independent_translation_not_official_china"
    || typeof input.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.itemBankSha256)
    || typeof input.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.resultContentSha256)) return false;
  return dense(input.directions, 1, d => plain(d) && d.id === "PERCEIVED_STRESS" && d.itemCount === 4 && bilingual(d.title))
    && dense(input.questions, 4, (q, i) => plain(q) && q.id === `pss4-0${i + 1}` && q.reverse === (i === 1 || i === 2) && q.correctOptionId === undefined && bilingual(q.prompt)
      && dense(q.options, 5, (o, n) => plain(o) && o.id === String(n) && o.score === n && o.directionId === "PERCEIVED_STRESS" && bilingual(o.label)))
    && dense(input.profiles, 1, p => plain(p) && p.id === "reading-pss4-total" && dense(p.directionIds, 1, id => id === "PERCEIVED_STRESS")
      && bilingual(p.title) && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo) && bilingual(p.seo.title) && bilingual(p.seo.description)
      && sections(p.sections, ["meaning", "calculation", "patterns", "context", "reflection", "limits"]))
    && sections(input.guide, ["identity", "arithmetic", "reading", "privacy"])
    && dense(input.faq, 6, f => plain(f) && bilingual(f.question) && bilingual(f.answer))
    && dense(input.references, 2, r => plain(r) && bilingual(r.title) && typeof r.url === "string" && /^https:\/\//.test(r.url));
}

export function scorePss4Questionnaire(input: unknown, answers: unknown): Pss4Result {
  if (!isPss4ConfigurationValid(input)) return { status: "unavailable", answered: 0 };
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
