import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type TextRecord = Record<string, unknown>;
type Translate = (source: string) => string;

const protectedTokens = /https?:\/\/[^\s<>）)]+|`[^`]*`|\{\{[^}]*\}\}|\$?\{[^}]*\}|%\d*\$?[sdif]|\d+(?:[.,:/-]\d+)*/g;
const hasHan = /\p{Script=Han}/u;
let traditionalConverter: Promise<Translate> | undefined;

export function assessmentDisplayLocale(pathname: string): DisplayLocale {
  return pathname.split("/")[1] === "zh-TW" ? "zh-TW" : getLocaleFromPathname(pathname);
}

export function assessmentDisplayPath(path: string, displayLocale: DisplayLocale, sourceLocale: Locale): string {
  return displayLocale === "zh-TW" ? `/zh-TW${path}` : localizedPath(path, sourceLocale);
}

export function assessmentChineseCopy(displayLocale: DisplayLocale, source: string, traditional: string): string {
  return displayLocale === "zh-TW" ? traditional : source;
}

export function loadTraditionalAssessmentText(): Promise<Translate> {
  traditionalConverter ??= import("opencc-js/cn2t").then(({ Converter }) => {
    const convert = Converter({ from: "cn", to: "twp" });
    return (source: string) => {
      if (!hasHan.test(source)) return source;
      const tokens: string[] = [];
      const masked = source.replace(protectedTokens, (value) => {
        tokens.push(value);
        return `\uE000${String.fromCharCode(0xE100 + tokens.length - 1)}\uE001`;
      });
      return convert(masked).replace(/\uE000([\uE100-\uF8FF])\uE001/g, (_, key: string) => tokens[key.charCodeAt(0) - 0xE100]);
    };
  });
  return traditionalConverter;
}

function record(value: unknown): value is TextRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function textFields(value: TextRecord, keys: readonly string[], translate: Translate): TextRecord {
  const translated = { ...value };
  for (const key of keys) {
    if (typeof value[key] === "string") translated[key] = translate(value[key]);
  }
  return translated;
}

function displayMedia(value: unknown, translate: Translate): unknown {
  return record(value) ? textFields(value, ["alt", "alt_zh", "accessibility_label", "accessibility_label_zh"], translate) : value;
}

function displayItem(value: unknown, translate: Translate): unknown {
  if (!record(value)) return value;
  const translated = textFields(value, ["text", "text_zh", "title", "title_zh", "label", "label_zh", "prompt", "prompt_zh", "round_label", "alt", "alt_zh", "accessibility_label", "accessibility_label_zh"], translate);
  if (Object.hasOwn(value, "image")) translated.image = displayMedia(value.image, translate);
  if (record(value.stem)) translated.stem = displayItem(value.stem, translate);
  if (Array.isArray(value.options)) translated.options = value.options.map((option) => displayItem(option, translate));
  return translated;
}

/** Localizes only the question/option presentation. The attempt still uses the original API locale and identity. */
export async function projectTraditionalQuestionDisplay<T>(payload: T, displayLocale: DisplayLocale): Promise<T> {
  if (displayLocale !== "zh-TW" || !record(payload)) return payload;
  const translate = await loadTraditionalAssessmentText();
  const result: TextRecord = { ...payload };
  if (record(payload.questions) && Array.isArray(payload.questions.items)) {
    result.questions = { ...payload.questions, items: payload.questions.items.map((item) => displayItem(item, translate)) };
  }
  if (Array.isArray(payload.questions)) result.questions = payload.questions.map((item) => displayItem(item, translate));
  if (record(payload.options) && Array.isArray(payload.options.format)) {
    result.options = { ...payload.options, format: payload.options.format.map((item) => typeof item === "string" ? translate(item) : item) };
  }
  if (record(payload.meta)) {
    const meta = textFields(payload.meta, ["disclaimer_text"], translate);
    for (const key of ["validity_items", "option_anchors"]) {
      const items = payload.meta[key];
      if (Array.isArray(items)) meta[key] = items.map((item) => displayItem(item, translate));
    }
    result.meta = meta;
  }
  return result as T;
}

const reportTextFields = new Set([
  "title", "title_zh", "subtitle", "heading", "subheading", "headline", "kicker",
  "name", "type_name", "type_description", "label", "label_zh", "description",
  "summary", "overview", "text", "text_zh", "body", "body_md", "body_markdown",
  "intro", "caption", "annotation", "interpretation", "explanation", "suggestion",
  "guidance", "question", "answer", "note", "message", "helper_text", "quote",
  "action", "recommendation", "alt", "accessibility_label",
  "confidence_label", "core_judgment", "evidence_point", "minimal_action", "share_safe_sentence",
  "do_not_overread", "what_to_hold_lightly", "route_headline", "why_this_feels_specific",
  "evidence_snapshot_label", "next_best_action", "save_reason", "why_this_level", "how_to_read",
  "test_definition", "self_report_statement", "non_clinical_statement", "non_hiring_statement",
  "non_ability_statement", "norm_status_statement", "quality_rules_statement", "version_statement",
  "one_liner", "core_claim", "development_lever", "primary_strength", "likely_cost",
  "meaning", "strength", "risk", "practice_focus", "definition", "why_it_matters", "what_it_feels_like",
  "cost", "micro_action", "typical_response", "better_move", "micro_script", "why_this_matters",
  "reflection_prompt", "tiny_experiment", "fit_signal", "strain_signal", "what_to_verify",
  "interview_question", "team_risk", "safe_experiment", "recovery_condition", "do_today",
  "script", "watch_out", "common_failure", "repair_move", "complements", "not_this",
  "what_it_adds", "what_it_is_not",
]);
const reportTextLists = new Set([
  "bullets", "tips", "tags", "report_tags", "steps", "examples", "paragraphs",
  "strengths", "challenges", "opportunities", "warnings", "recommendations",
  "dimension_labels", "evidence_basis", "evidence_signals", "role_observation_checklist",
]);
const reportProtectedBranches = new Set([
  "meta", "_meta", "authority", "authorities", "source", "sources", "provenance",
  "identity", "view_policy", "access", "entitlements", "offer", "offers", "price",
  "scores", "scores_0_100", "scores_pct", "scoresPct", "axis_states",
]);
const mbtiSnapshotTextFields = new Set([
  "nickname", "bandNuance", "fitReason", "expression", "advantage", "whyItMatters",
  "overuseRisk", "realWorldSignal", "upgradeHint",
]);
const mbtiSnapshotTextLists = new Set(["intro", "keywords", "signals", "jobExamples"]);

const coreReportDisplayRoots = [
  "result", "report", "dimensions", "summary", "mbti_public_projection_v1",
  "big5_public_projection_v1", "big5_report_engine_v2",
  "enneagram_public_projection_v1", "enneagram_public_projection_v2", "enneagram_report_v2",
  "riasec_public_projection_v1", "riasec_public_projection_v2",
  "mbti_preview_v1", "mbti_read_contract_v1", "mbti_pdf_content",
  "controlled_narrative_v1", "comparative_v1", "cultural_calibration_v1",
] as const;

const eqTextFields = new Set([
  "short_label", "cta_label", "how_to_use", "claim_boundary", "top_strength", "next_read",
  "what_this_does_not_mean", "user_facing_status_label", "user_meaning", "validation_step",
  "next_validation_step", "what_this_means_for_user", "practice", "observe", "review",
]);
const eqTextMaps = new Set(["band_explanations", "score_notes"]);

function reportDisplayValue(
  value: unknown,
  key: string,
  translate: Translate,
  textContainer = false,
  mbtiSnapshot = false,
  eqDisplay = false,
): unknown {
  if (reportProtectedBranches.has(key)) return value;
  const visibleContainer = textContainer || reportTextLists.has(key) || (mbtiSnapshot && mbtiSnapshotTextLists.has(key));
  if (typeof value === "string") {
    return visibleContainer || reportTextFields.has(key) || (eqDisplay && eqTextFields.has(key)) || (mbtiSnapshot && mbtiSnapshotTextFields.has(key)) ? translate(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => reportDisplayValue(item, key, translate, typeof item === "string" && visibleContainer, mbtiSnapshot, eqDisplay));
  }
  if (!record(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [
    childKey,
    reportDisplayValue(child, childKey, translate, key === "dimension_labels" || (eqDisplay && eqTextMaps.has(key)) || (mbtiSnapshot && key === "actions" && (childKey === "do" || childKey === "avoid")), mbtiSnapshot, eqDisplay),
  ]));
}

const shareDisplayRoots = [
  "title", "subtitle", "type_name", "typeName", "tagline", "summary",
  "primary_cta_label", "compare_cta_label", "rarity_label",
  "public_tags", "publicTags", "tags", "dimensions", "profile", "identity_card", "identityCard",
  "summary_card", "summaryCard", "mbti_public_summary_v1", "mbti_public_projection_v1",
  "big5_public_projection_v1", "enneagram_public_summary_v1", "riasec_public_projection_v1",
  "controlled_narrative_v1", "comparative_v1", "cultural_calibration_v1", "working_life_v1",
  "public_surface_v1", "landing_surface_v1", "answer_surface_v1", "insight_graph_v1",
  "embed_surface_v1", "widget_surface_v1",
] as const;
const shareTextFields = new Set([
  "typeName", "tagline", "primary_cta_label", "compare_cta_label", "rarity_label",
  "side_label", "sideLabel", "band_label", "winnerLabel", "narrative_summary",
  "form_label", "cta_label", "primary_action_label",
]);
const shareTextLists = new Set(["public_tags", "publicTags"]);

/** Translate visible fields in the backend's public share response. */
export async function projectTraditionalShareDisplay<T>(payload: T, displayLocale: DisplayLocale): Promise<T> {
  if (displayLocale !== "zh-TW" || !record(payload)) return payload;
  const translate = await loadTraditionalAssessmentText();
  const project = (value: unknown, key: string): unknown => {
    if (reportProtectedBranches.has(key)) return value;
    if (typeof value === "string") {
      return reportTextFields.has(key) || shareTextFields.has(key) || reportTextLists.has(key) || shareTextLists.has(key)
        ? translate(value) : value;
    }
    if (Array.isArray(value)) return value.map((item) => project(item, key));
    if (!record(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, project(child, childKey)]));
  };
  const result: TextRecord = { ...payload };
  for (const key of shareDisplayRoots) {
    if (Object.hasOwn(payload, key)) result[key] = project(payload[key], key);
  }
  return result as T;
}

/** Localize visible copy on an already-authorized report without altering its authority or commerce metadata. */
export function projectValidatedEqDisplay<T>(payload: T, translate: Translate): T {
  if (!record(payload)) return payload;
  const result: TextRecord = { ...payload };
  for (const key of ["assets", "dimension_summary", "interpretation", "quality", "report_tags"] as const) {
    if (Object.hasOwn(payload, key)) result[key] = reportDisplayValue(payload[key], key, translate, false, false, true);
  }
  return result as T;
}

export async function projectTraditionalResultDisplay<T>(payload: T, displayLocale: DisplayLocale): Promise<T> {
  if (displayLocale !== "zh-TW" || !record(payload)) return payload;
  // EQ validates the canonical report and the source-bound reading copy together.
  // Translate selected display fields only after the pair has been validated.
  if (Object.hasOwn(payload, "eq60_reading_copy_v1")
    || [payload, payload.report].some(candidate => record(candidate)
      && candidate.eq_report_mode === "self_report"
      && candidate.measurement_type === "self_report_trait_mixed_ei")) return payload;
  const translate = await loadTraditionalAssessmentText();
  const result: TextRecord = { ...payload };
  for (const key of coreReportDisplayRoots) {
    if (Object.hasOwn(payload, key)) result[key] = reportDisplayValue(payload[key], key, translate, false, key === "mbti_pdf_content");
  }
  return result as T;
}
