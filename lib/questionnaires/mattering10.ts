import type { Questionnaire, Text } from "./types";

export type Mattering10Questionnaire = Omit<Questionnaire, "kind"> & { kind: "mattering10"; instructions: Text; resultHeading: Text };
export type Mattering10Result = { status: "unavailable" | "invalid"; answered: number } | {
  status: "complete" | "incomplete"; answered: number;
  scales: { id: "GMS" | "AMS"; answered: number; total: number | null; contributions: { id: string; value: number }[] }[];
};
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const bilingual = (v: unknown): v is Text => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const dense = (v: unknown, n: number, check: (v: unknown, i: number) => boolean) => Array.isArray(v) && v.length === n && Array.from(v).every(check);
const sectionIds = ["meaning", "calculation", "example", "together", "action", "limits"];
const sections = (v: unknown, ids: string[]) => dense(v, ids.length, (s, i) => record(s) && s.id === ids[i] && bilingual(s.title) && dense(s.paragraphs, 2, bilingual));
const scaleId = (i: number) => i < 5 ? "GMS" : "AMS";
export function isMattering10ConfigurationValid(q: unknown): q is Mattering10Questionnaire {
  if (!record(q) || q.kind !== "mattering10" || q.slug !== "mattering" || q.code !== "GMS5_AMS5_WORKING_EDITION"
    || !bilingual(q.title) || !bilingual(q.description) || !bilingual(q.seoTitle) || !bilingual(q.introduction) || !bilingual(q.instructions) || !bilingual(q.resultHeading)
    || !record(q.source) || q.source.kind !== "published_gms5_ams5_working_translation" || q.source.formCode !== "gms5_ams5_flett2022_table2"
    || q.source.itemBankVersion !== "gms5_ams5_flett2022_table2_zh_working_v1" || q.source.scoringVersion !== "two_separate_five_1to4_sums_all5_no_reverse_v1"
    || q.source.resultContentVersion !== "gms_ams_two_complete_guides_v1" || q.source.psychometricValidationCompleted !== false
    || typeof q.source.itemBankSha256 !== "string" || !/^[a-f0-9]{64}$/.test(q.source.itemBankSha256)
    || typeof q.source.resultContentSha256 !== "string" || !/^[a-f0-9]{64}$/.test(q.source.resultContentSha256)) return false;
  return dense(q.directions, 2, (d, i) => record(d) && d.id === (i ? "AMS" : "GMS") && d.itemCount === 5 && bilingual(d.title))
    && dense(q.questions, 10, (p, i) => record(p) && p.id === `${scaleId(i).toLowerCase()}-0${i % 5 + 1}` && p.reverse === false && p.correctOptionId === undefined && bilingual(p.prompt)
      && dense(p.options, 4, (o, n) => record(o) && o.id === String(n + 1) && o.score === n + 1 && o.directionId === scaleId(i) && bilingual(o.label)))
    && dense(q.profiles, 2, (p, i) => record(p) && p.id === (i ? "anti-mattering" : "general-mattering") && dense(p.directionIds, 1, id => id === (i ? "AMS" : "GMS"))
      && bilingual(p.title) && bilingual(p.headline) && bilingual(p.summary) && bilingual(p.scoreReading) && record(p.seo) && bilingual(p.seo.title) && bilingual(p.seo.description) && sections(p.sections, sectionIds))
    && sections(q.guide, ["method", "arithmetic", "edition", "privacy"])
    && dense(q.faq, 6, f => record(f) && bilingual(f.question) && bilingual(f.answer))
    && dense(q.references, 3, r => record(r) && bilingual(r.title) && typeof r.url === "string" && /^https:\/\//.test(r.url));
}
/** GMS and AMS keep their own direction and five-item sum. Missing responses are never imputed. */
export function scoreMattering10(q: unknown, answers: unknown): Mattering10Result {
  if (!isMattering10ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).some(k => typeof k !== "string")) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers), ids = new Set(q.questions.map(p => p.id));
  if (Object.entries(entries).some(([id, d]) => !ids.has(id) || !Object.hasOwn(d, "value") || !d.enumerable || typeof d.value !== "string" || !/^[1-4]$/.test(d.value))) return { status: "invalid", answered: 0 };
  const scales = (["GMS", "AMS"] as const).map((id, i) => {
    const contributions = q.questions.slice(i * 5, i * 5 + 5).filter(p => Object.hasOwn(entries, p.id)).map(p => ({ id: p.id, value: Number(entries[p.id].value) }));
    return { id, answered: contributions.length, total: contributions.length === 5 ? contributions.reduce((sum, p) => sum + p.value, 0) : null, contributions };
  });
  const answered = Object.keys(entries).length;
  return { status: answered === 10 ? "complete" : "incomplete", answered, scales };
}
