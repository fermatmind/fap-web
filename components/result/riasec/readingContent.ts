import type { Locale } from "@/lib/i18n/locales";

const RIASEC_DEBUG_RENDER_PATTERNS = [
  /\bBUTTON\s+LABEL\b/gi,
  /\bBUT\s+TON\s+LABEL\b/gi,
  /\bscore space\b/gi,
  /\braw score\b/gi,
  /\briasec_60_likert5_activity_sum_space(?:\.v\d+)?\b/gi,
  /\bminimal_answer_completion_only\b/gi,
  /\bcontent_example_not_registry_match(?:_without_reviewed_registry_source)?\b/gi,
  /\bphysical_implementation\b/gi,
  /\btools_and_equipment\b/gi,
  /\bfield_troubleshooting\b/gi,
  /\bprototypes_and_tangible_outputs\b/gi,
  /\bhands_on_systems\b/gi,
  /\banalyze_complex_problems\b/gi,
  /\borganize_evidence_materials\b/gi,
  /\bmodel_systems\b/gi,
  /\btest_hypotheses\b/gi,
  /\bresearch_and_explain\b/gi,
];

const RIASEC_DEEP_CONTENT_LABELS: Record<string, { zh: string; en: string }> = {
  core_reading: { zh: "核心解读", en: "Core reading" },
  core_drive: { zh: "兴趣线索", en: "Interest signal" },
  positive_value: { zh: "可观察价值", en: "What to observe" },
  real_world_cost: { zh: "现实条件", en: "Real-world conditions" },
  common_misread: { zh: "常见误读", en: "Common misreading" },
  primary_activity_chain: { zh: "主要活动线索", en: "Primary activity signal" },
  secondary_support_line: {
    zh: "辅助活动线索",
    en: "Secondary activity signal",
  },
  tertiary_stabilizer: { zh: "补充活动线索", en: "Additional activity signal" },
  ordered_code_handling: { zh: "代码阅读方式", en: "How to read the code" },
  high_score_reading: { zh: "较高分解读", en: "Higher-score reading" },
  medium_score_reading: { zh: "中等分解读", en: "Middle-score reading" },
  low_score_safe_reading: { zh: "较低分解读", en: "Lower-score reading" },
  work_activity_examples: { zh: "可尝试的活动", en: "Activities to try" },
  activities_to_validate: { zh: "可验证的活动", en: "Activities to validate" },
  activity_chain: { zh: "活动线索组合", en: "Activity signal combination" },
  activity_sequence: { zh: "活动顺序", en: "Activity sequence" },
  deep_report_extension: { zh: "深入阅读", en: "Further reading" },
  first_experiment: { zh: "首次尝试", en: "First experiment" },
  free_page_teaser: { zh: "页面摘要", en: "Page summary" },
  likely_tension: { zh: "可能的张力", en: "Possible tension" },
  low_risk_validation: { zh: "低风险验证", en: "Low-risk validation" },
  pair_label: { zh: "兴趣组合", en: "Interest combination" },
  short_label: { zh: "简要标签", en: "Short label" },
  strategy_label: { zh: "阅读主题", en: "Reading theme" },
  when_not_to_overread: { zh: "避免过度解读", en: "When not to overread" },
  when_to_use_140q: {
    zh: "何时考虑 140 题",
    en: "When to consider the 140-item form",
  },
  environment_card: { zh: "环境线索", en: "Environment signals" },
  example_question: { zh: "示例问题", en: "Example question" },
  question: { zh: "探索问题", en: "Exploration question" },
  role_responsibility_card: {
    zh: "角色责任线索",
    en: "Role-responsibility signals",
  },
  selection_basis: { zh: "选择依据", en: "Selection basis" },
  task_activity_card: { zh: "任务活动线索", en: "Task-activity signals" },
  what_user_sees: { zh: "你会看到什么", en: "What you will see" },
  possible_drains: {
    zh: "可能影响体验的条件",
    en: "Conditions that may affect the experience",
  },
  action_advice: { zh: "下一步", en: "Next step" },
  interest_activity_focus: { zh: "活动关注点", en: "Activity focus" },
  context_costs: { zh: "情境成本", en: "Context costs" },
  misread_guardrails: { zh: "阅读边界", en: "Reading guardrails" },
  validation_questions: { zh: "验证问题", en: "Questions to explore" },
  chemistry: { zh: "组合关系", en: "Combination pattern" },
  micro_experiment: { zh: "小实验", en: "Small experiment" },
  result_page_teaser: { zh: "结果提示", en: "Result note" },
  deep_report_extension_hint: { zh: "深入阅读", en: "Further reading" },
  copy: { zh: "阅读提示", en: "Reading note" },
};

export function formatDeepContentKey(key: string, isZh: boolean): string {
  const label = RIASEC_DEEP_CONTENT_LABELS[key];
  return label ? label[isZh ? "zh" : "en"] : "";
}

export function formatRiasecSlotVisibility(
  value: string,
  locale: Locale,
): string {
  if (value === "visible") {
    return locale === "zh" ? "可阅读" : "available";
  }

  if (value === "collapsed") {
    return locale === "zh" ? "摘要" : "summary";
  }

  return locale === "zh" ? "内容" : "content";
}

export function formatRiasecDetailValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = sanitizeRiasecRenderableText(value);
  if (!trimmed || /(?:[a-z]+_){1,}[a-z0-9]+/.test(trimmed)) {
    return "";
  }

  return trimmed;
}

export function sanitizeRiasecRenderableText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  let text = value.trim();
  if (/^(?:visible|collapsed)$/i.test(text)) {
    return "";
  }

  for (const pattern of RIASEC_DEBUG_RENDER_PATTERNS) {
    text = text.replace(pattern, "");
  }

  return text
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s:;|,，、-]+|[\s:;|,，、-]+$/g, "")
    .trim();
}
