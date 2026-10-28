import type { Questionnaire, Text } from "./types";
import { questionnaireGuidePath } from "./paths";
import type { Locale } from "@/lib/i18n/locales";
import {
  PREPARATION_ACTION_FORMS,
  isPreparationActionForm,
  preparationActionItemIds,
  scorePreparationActions20,
  type PreparationActionAnswer,
  type PreparationActionReport,
} from "./preparationActions20Method";

export type PreparationActions20Questionnaire = Omit<Questionnaire, "kind"> & { kind: "preparation-actions20" };
export type PreparationActions20Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number }
  | { status: "complete"; answered: 20; preparationActions20: PreparationActionReport };

const sources = {
  "freelance-ready": {
    code: "FM_FREELANCE_PREPARATION_ACTIONS20",
    form: "fm_freelance_ready20_preparation_v1",
    content: "fm_freelance_preparation_five_full_readings_v1",
    items: "5559a1561c9734bbfe8633e93cdbee00683fbece6ef992224e778509853bc61c",
    results: "6107089880978236585a1b090dee5a4bea69e70b5988a57cf7223c290c68fa0b",
  },
  "remote-work": {
    code: "FM_REMOTE_PREPARATION_ACTIONS20",
    form: "fm_remote_work20_preparation_v1",
    content: "fm_remote_preparation_five_full_readings_v1",
    items: "8e4c4bafbe9278fcb7c6a13b581cbcf86b9df8fc5443bde5bad21e64225c7c15",
    results: "048fde519b92afdbdb6f4dc3697bbc139e30c196664011553c6d8d888f7f81bd",
  },
} as const;
export const PREPARATION_ACTION_LABELS = [
  "Not started for this arrangement",
  "Drafted a plan, not yet tried it",
  "Tried it in a real or simulated task",
  "Reviewed the trial and adjusted the plan",
  "Not applicable / cannot assess / prefer not to answer",
] as const;
const sections = ["meaning", "distinctions", "scenario", "try", "conditions", "reading"] as const;
const object = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v)));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** Only these two original twenty-action forms; no normalization into another scale or score. */
export function isPreparationActions20ConfigurationValid(value: unknown): value is PreparationActions20Questionnaire {
  if (!object(value) || value.kind !== "preparation-actions20" || !isPreparationActionForm(value.slug)) return false;
  const quiz = value as PreparationActions20Questionnaire;
  const slug = value.slug;
  const source = sources[slug];
  if (quiz.code !== source.code || quiz.version !== source.form || !object(quiz.source)
    || quiz.source.kind !== "fermatmind_original_preparation_action_self_report"
    || quiz.source.formCode !== source.form || quiz.source.itemBankVersion !== source.form
    || quiz.source.scoringVersion !== "fm_preparation20_five_strict4_stage_means_1dp_v1"
    || quiz.source.resultContentVersion !== source.content || quiz.source.itemBankSha256 !== source.items
    || quiz.source.resultContentSha256 !== source.results || quiz.source.psychometricValidationCompleted !== false
    || quiz.minimumRatedItems !== undefined || !text(quiz.instructions) || !text(quiz.title)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 20
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 5
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 5) return false;
  const domains = PREPARATION_ACTION_FORMS[slug].domains;
  const ids = preparationActionItemIds(slug);
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === domains[i]
    && d.itemCount === 4 && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => object(q) && q.id === ids[i] && text(q.prompt)
    && q.reverse === false && q.correctOptionId === undefined && q.explanation === undefined
    && Array.isArray(q.options) && q.options.length === 5
    && Array.from(q.options).every((o, j) => object(o) && o.id === (j === 4 ? "na" : String(j))
      && o.directionId === domains[Math.floor(i / 4)] && o.score === (j === 4 ? null : j)
      && text(o.label) && o.label.en === PREPARATION_ACTION_LABELS[j]))) return false;
  return Array.from(quiz.profiles).every((p, i) => object(p) && p.id === `${domains[i]}-reading`
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === domains[i]
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && object(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 6
    && Array.from(p.sections).every((s, j) => object(s) && s.id === sections[j] && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text)));
}

export function scorePreparationActions20Questionnaire(quiz: unknown, input: unknown): PreparationActions20Result {
  if (!isPreparationActions20ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(input)) return { status: "invalid", answered: 0 };
  const ids = new Set(quiz.questions.map(q => q.id));
  const numeric: Record<string, PreparationActionAnswer> = Object.create(null);
  let answered = 0;
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string" || !ids.has(key)) return { status: "invalid", answered };
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) return { status: "invalid", answered };
    const option: unknown = descriptor.value;
    if (option === "na") numeric[key] = "na";
    else if (option === "0") numeric[key] = 0;
    else if (option === "1") numeric[key] = 1;
    else if (option === "2") numeric[key] = 2;
    else if (option === "3") numeric[key] = 3;
    else return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 20) return { status: "incomplete", answered };
  const report = scorePreparationActions20(quiz.slug, numeric);
  return report ? { status: "complete", answered: 20, preparationActions20: report }
    : { status: "unavailable", answered };
}

/** Public links only: never serialize a stage, mean, count or private answer into copied text. */
export function preparationActions20GuideLinks(quiz: unknown, locale: Locale): string | null {
  if (!isPreparationActions20ConfigurationValid(quiz)) return null;
  return quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n");
}
