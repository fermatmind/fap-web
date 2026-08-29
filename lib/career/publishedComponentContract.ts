import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";

export type CareerPublishedScalar = string | boolean | null;
export type CareerPublishedValue =
  | CareerPublishedScalar
  | CareerPublishedValue[]
  | { [key: string]: CareerPublishedValue };

export type CareerPublishedComponents = Partial<Record<CareerDisplayComponentId, CareerPublishedValue>>;

export type CareerPublishedStructuredRow = {
  label: string;
  value: string;
  alternate_value: string | null;
  secondary_value: string | null;
};

export type CareerPublishedUnavailableComponent = {
  availability: "unavailable";
  reason_code: "source_locale_unavailable";
};

export type CareerPublishedQuickAnswersBlock = {
  availability: "published";
  schema_version: "career.quick_answers.v1";
  heading: string;
  items: Array<{
    key: "qa3" | "qa2" | "qa1";
    question: string;
    answer: string;
    table: { rows: CareerPublishedStructuredRow[] };
  }>;
};

export type CareerPublishedOnetStructuredFieldsBlock = {
  availability: "published";
  schema_version: "career.onet_structured_fields.v1";
  heading: string;
  rows: CareerPublishedStructuredRow[];
};

export type CareerPublishedFitDecisionCenter = {
  schema_version: "career.fit_decision_center.v1";
  heading: string;
  direct_answer: string;
  signals: Array<{
    id: "fit" | "caution" | "experiment";
    label: string;
    body: string;
    tone: "positive" | "caution" | "action";
  }>;
  assessments: Array<{
    id: "riasec" | "big-five" | "mbti" | "enneagram" | "iq" | "eq";
    label: string;
    question: string;
    answer: string;
    evidence_level: string;
    signals: string[];
    watchout: string;
    cta_label: string;
    cta_href: string;
  }>;
  directions: Array<{
    direction: string;
    fit_signals: string;
    target?: {
      slug: string;
      title: string;
      href: string;
    };
    watchouts: string;
  }>;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  boundary: string;
  source_links: Array<{
    label: string;
    href: string;
    usage: string;
  }>;
};

export type CareerPublishedSourceLink = {
  id: string;
  label: string;
  href: string;
  scope: string;
};

export type CareerPublishedWorkRisk = {
  schema_version: "career.work_risk.v1";
  heading: string;
  direct_answer: string;
  evidence_scope: string;
  risks: Array<{
    id: string;
    title: string;
    scenario: string;
    affected_roles: string;
    consequence: string;
    mitigation: string;
    evidence_refs: string[];
  }>;
  boundary: string;
  context_links: Array<{ label: string; href: string }>;
  source_links: CareerPublishedSourceLink[];
};

export type CareerPublishedProgression = {
  schema_version: "career.career_progression.v1";
  heading: string;
  direct_answer: string;
  locale_requirements: { jurisdiction: string; summary: string; credential_boundary: string };
  tracks: Array<{
    id: string;
    title: string;
    stages: Array<{
      role: string;
      responsibility: string;
      readiness_evidence: string;
      credentials: string;
      next_moves: string;
    }>;
  }>;
  competence_ladder: Array<{ stage: string; description: string }>;
  boundary: string;
  source_links: CareerPublishedSourceLink[];
};

export type CareerPublishedOutlookTransitions = {
  schema_version: "career.outlook_transitions.v1";
  heading: string;
  direct_answer: string;
  outlook_evidence: Array<{
    source_id?: string;
    fact_ref?: string;
    source_ref?: string;
    geography: string;
    occupation_scope: string;
    horizon: string;
    metric: string;
    value: string;
    interpretation: string;
    limitation: string;
  }>;
  context_links: Array<{ label: string; href: string }>;
  transitions: Array<{
    target_slug: string;
    target_title: string;
    target_href: string;
    shared_capabilities: string;
    capability_gaps: string;
    transition_distance: string;
  }>;
  source_links: CareerPublishedSourceLink[];
};

type PublishedRecord = Record<string, CareerPublishedValue>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasExactKeys(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  if (!isRecord(value) || required.some((key) => !(key in value))) {
    return false;
  }

  const allowed = new Set([...required, ...optional]);
  return Object.keys(value).every((key) => allowed.has(key));
}

function hasStringFields(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, string> {
  return hasExactKeys(value, required, optional) &&
    required.every((key) => isNonEmptyString(value[key])) &&
    optional.every((key) => value[key] === undefined || isNonEmptyString(value[key]));
}

function isStringArray(value: unknown, minimum = 1): value is string[] {
  return Array.isArray(value) && value.length >= minimum && value.every(isNonEmptyString);
}

function isScalarRecord(value: unknown, allowedKeySets: readonly (readonly string[])[]): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value).sort();
  const matches = allowedKeySets.some((allowed) => {
    const sorted = [...allowed].sort();
    return keys.length === sorted.length && keys.every((key, index) => key === sorted[index]);
  });
  return matches && Object.values(value).every((item) => item === null || isNonEmptyString(item));
}

function isScalarRecordArray(value: unknown, allowedKeySets: readonly (readonly string[])[], minimum = 1): boolean {
  return Array.isArray(value) && value.length >= minimum && value.every((item) => isScalarRecord(item, allowedKeySets));
}

function isStringOrScalarRecord(value: unknown): boolean {
  return isNonEmptyString(value) || isScalarRecord(value, [["label", "value"]]);
}

function validateCta(value: unknown, allowPrompt = false): boolean {
  if (!hasStringFields(
    value,
    ["entry_surface", "href", "label", "source_page_type", "subject_key", "subject_kind", "target_action", "test_slug"],
    allowPrompt ? ["prompt"] : []
  )) {
    return false;
  }

  return value.href.split("|").map((href) => href.trim()).filter(Boolean).every((href) =>
    /^\/(?:(?:en|zh)\/)?tests\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(href) && !href.includes("\\")
  );
}

function validatePrimarySnapshot(value: unknown): boolean {
  if (
    !hasExactKeys(value, ["salary"], ["callout", "scene"])
    || (value.callout !== undefined && !isNonEmptyString(value.callout))
    || (value.scene !== undefined && !isNonEmptyString(value.scene))
  ) {
    return false;
  }

  const salary = value.salary;
  const required = [
    "bls_table", "china_ai_row", "china_class_row", "china_edu_table", "china_industry_table", "china_intl",
    "china_name_row", "china_open", "china_ref", "china_salary_note", "china_salary_table", "china_soc_row",
    "us_growth", "us_median",
  ];
  if (!hasExactKeys(salary, required, ["china_open_note", "edu", "sources_note", "fact_refs"])) {
    return false;
  }

  const requiredStrings = ["china_intl", "china_open", "china_ref", "china_salary_note", "us_growth", "us_median"];
  const optionalStrings = ["china_open_note", "edu", "sources_note"];
  return requiredStrings.every((key) => isNonEmptyString(salary[key])) &&
    optionalStrings.every((key) => salary[key] === undefined || typeof salary[key] === "string") &&
    (salary.fact_refs === undefined || isStringArray(salary.fact_refs)) &&
    ["china_ai_row", "china_class_row", "china_name_row", "china_soc_row"].every((key) => isStringOrScalarRecord(salary[key])) &&
    isScalarRecordArray(salary.bls_table, [
      ["指标", "数值", "说明"], ["label", "value"], ["label", "value", "数值"], ["label", "value", "数值", "说明"],
      ["指标", "数值", "说明", "fact_ref"],
    ]) &&
    isScalarRecordArray(salary.china_edu_table, [["学历段", "岗位方向", "说明"], ["label", "value"]]) &&
    isScalarRecordArray(salary.china_industry_table, [["行业", "需求"], ["行业", "需求", "备注"], ["label", "value"]]) &&
    isScalarRecordArray(salary.china_salary_table, [["城市/区间", "月薪参考"], ["label", "value"]]);
}

function validateSecondarySnapshot(value: unknown): boolean {
  const enrichedKeys = [
    "heading", "direct_answer", "wage_heading", "interpretation_heading", "interpretation_rows",
    "industry_heading", "industry_rows", "factors_heading", "factor_rows", "outlook_heading",
    "boundary", "authority_sources",
  ] as const;
  const periodKeys = ["industry_period", "outlook_period"] as const;
  if (!hasExactKeys(value, ["bls_table", "growth", "median"], [...enrichedKeys, ...periodKeys]) ||
    !isNonEmptyString(value.growth) || !isNonEmptyString(value.median) ||
    !isScalarRecordArray(value.bls_table, [
      ["指标", "数值", "说明"], ["label", "value"], ["label", "value", "数值"], ["label", "value", "数值", "说明"],
      ["指标", "数值", "说明", "fact_ref"],
    ])) {
    return false;
  }

  const hasEnrichedContent = enrichedKeys.some((key) => key in value);
  return !hasEnrichedContent || (
    enrichedKeys.every((key) => key in value) &&
    ["heading", "direct_answer", "wage_heading", "interpretation_heading", "industry_heading",
      "factors_heading", "outlook_heading", "boundary", "authority_sources"]
      .every((key) => isNonEmptyString(value[key])) &&
    periodKeys.every((key) => value[key] === undefined || isNonEmptyString(value[key])) &&
    isScalarRecordArray(value.interpretation_rows, [["question", "answer"]], 4) &&
    isScalarRecordArray(value.industry_rows, [["industry", "median", "note"], ["industry", "median", "note", "fact_ref"]], 4) &&
    isScalarRecordArray(value.factor_rows, [["factor", "answer"]], 3)
  );
}

function validateAiImpact(value: unknown): boolean {
  if (hasExactKeys(value, [
    "heading", "answer", "method_cards", "task_rows", "evidence_intro", "evidence_rows",
    "difference_intro", "difference_rows", "responsibility_intro", "responsibility_steps",
    "risk_rows", "action_rows", "questions", "authority_links",
    "transition",
  ])) {
    return [
      "heading", "answer", "evidence_intro", "difference_intro", "responsibility_intro",
      "transition",
    ].every((key) => isNonEmptyString(value[key])) &&
      isScalarRecordArray(value.method_cards, [["概念", "含义"]], 3) &&
      isScalarRecordArray(value.task_rows, [["工作方向", "任务", "当前变化", "人的控制点"]], 4) &&
      isScalarRecordArray(value.evidence_rows, [
        ["来源", "研究对象", "结论", "使用限制", "链接"],
        ["来源", "研究对象", "结论", "使用限制", "链接", "fact_ref"],
        ["来源", "研究对象", "结论", "使用限制", "链接", "source_ref"],
        ["来源", "研究对象", "结论", "使用限制", "链接", "fact_ref", "source_ref"],
      ], 3) &&
      isScalarRecordArray(value.difference_rows, [["方向", "AI主要改变", "仍由人负责"]], 2) &&
      isScalarRecordArray(value.responsibility_steps, [["步骤", "说明"]], 4) &&
      isScalarRecordArray(value.risk_rows, [["风险", "为什么重要", "控制方式"]], 3) &&
      isScalarRecordArray(value.action_rows, [["人群", "应对重点"]], 3) &&
      isScalarRecordArray(value.questions, [
        ["问题", "回答", "来源", "链接"],
        ["问题", "回答", "来源", "链接", "fact_ref"],
        ["问题", "回答", "来源", "链接", "source_ref"],
        ["问题", "回答", "来源", "链接", "fact_ref", "source_ref"],
      ], 3) &&
      isScalarRecordArray(value.authority_links, [["来源", "类型", "适用范围", "链接"]], 3);
  }

  const strings = ["ai_head_sub", "ai_s1_bls", "ai_s1_p", "ai_s4_p", "ai_s4_p2"];
  const arrays = ["ai_s2_accel", "ai_s2_auto", "ai_s3_list", "ai_s7_trends"];
  if (!hasExactKeys(value, [...strings, ...arrays, "ai_s5_persona", "ai_s6_tools"])) {
    return false;
  }

  return strings.every((key) => isNonEmptyString(value[key])) &&
    arrays.every((key) => isStringArray(value[key])) &&
    isScalarRecordArray(value.ai_s5_persona, [["人群", "建议"], ["persona", "advice"]]) &&
    isScalarRecordArray(value.ai_s6_tools, [["工具", "定位", "代表能力"], ["name", "desc"]]);
}

function validateAdjacentCareerComparison(value: unknown): boolean {
  if (isScalarRecordArray(value, [
    ["职业", "区别", "AI 影响"], ["职业", "区别", "AI影响"], ["occupation", "diff"], ["岗位", "重心", "产出"],
  ])) {
    return true;
  }

  return hasExactKeys(value, ["heading", "intro", "rows", "evidence_note", "evidence_links", "conclusion", "transition"]) &&
    isNonEmptyString(value.heading) &&
    isNonEmptyString(value.intro) &&
    isNonEmptyString(value.evidence_note) &&
    isNonEmptyString(value.conclusion) &&
    isNonEmptyString(value.transition) &&
    Array.isArray(value.evidence_links) && value.evidence_links.length > 0 &&
    value.evidence_links.every((link) => hasExactKeys(link, ["label", "href"]) &&
      isNonEmptyString(link.label) && isNonEmptyString(link.href)) &&
    isScalarRecordArray(value.rows, [[
      "职业方向", "核心工作与产出", "与会计师／审计师的关键区别", "更适合什么选择",
    ]], 4);
}

function validateRelatedNextPages(value: unknown): boolean {
  if (!hasExactKeys(value, ["intro", "links"]) || !isNonEmptyString(value.intro) ||
    !Array.isArray(value.links) || value.links.length === 0) {
    return false;
  }

  return value.links.every((item) => {
    if (!isRecord(item)) return false;
    const legacy = hasExactKeys(item, ["nofollow", "slug", "source", "title_en"]);
    const grouped = hasExactKeys(item, [
      "nofollow", "slug", "source", "title_en", "title_zh", "group", "group_label",
    ]);
    return (legacy || grouped) &&
      typeof item.nofollow === "boolean" &&
      isNonEmptyString(item.slug) &&
      (item.source === "lookup" || item.source === "self_pick") &&
      isNonEmptyString(item.title_en) &&
      (!grouped || (
        isNonEmptyString(item.title_zh) &&
        isNonEmptyString(item.group_label) &&
        (item.group === "entry" || item.group === "specialist" || item.group === "management")
      ));
  });
}

function validateUnavailable(value: unknown): boolean {
  return hasExactKeys(value, ["availability", "reason_code"]) &&
    value.availability === "unavailable" && value.reason_code === "source_locale_unavailable";
}

function validateStructuredRows(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((row) =>
    hasExactKeys(row, ["label", "value", "alternate_value", "secondary_value"]) &&
    isNonEmptyString(row.label) && isNonEmptyString(row.value) &&
    (row.alternate_value === null || isNonEmptyString(row.alternate_value)) &&
    (row.secondary_value === null || isNonEmptyString(row.secondary_value))
  );
}

function validateQuickAnswers(value: unknown): boolean {
  if (validateUnavailable(value)) return true;
  if (!hasExactKeys(value, ["availability", "schema_version", "heading", "items"]) ||
    value.availability !== "published" || value.schema_version !== "career.quick_answers.v1" ||
    !isNonEmptyString(value.heading) || !Array.isArray(value.items) || value.items.length !== 3) {
    return false;
  }

  const expectedKeys = ["qa3", "qa2", "qa1"];
  return value.items.every((item, index) =>
    hasExactKeys(item, ["key", "question", "answer", "table"]) &&
    item.key === expectedKeys[index] && isNonEmptyString(item.question) && isNonEmptyString(item.answer) &&
    hasExactKeys(item.table, ["rows"]) && validateStructuredRows(item.table.rows)
  );
}

function validateOnetStructuredFields(value: unknown): boolean {
  if (validateUnavailable(value)) return true;
  return hasExactKeys(value, ["availability", "schema_version", "heading", "rows"]) &&
    value.availability === "published" && value.schema_version === "career.onet_structured_fields.v1" &&
    isNonEmptyString(value.heading) && validateStructuredRows(value.rows);
}

function validateFitDecisionCenter(value: unknown): boolean {
  if (!hasExactKeys(value, [
    "assessments", "boundary", "direct_answer", "directions", "heading", "questions",
    "schema_version", "signals", "source_links",
  ]) || value.schema_version !== "career.fit_decision_center.v1" ||
    !isNonEmptyString(value.heading) || !isNonEmptyString(value.direct_answer) ||
    !isNonEmptyString(value.boundary)) {
    return false;
  }

  const signalIds = ["fit", "caution", "experiment"];
  const assessmentIds = ["riasec", "big-five", "mbti", "enneagram", "iq", "eq"];
  return Array.isArray(value.signals) && value.signals.length === signalIds.length &&
    value.signals.every((item, index) => hasExactKeys(item, ["body", "id", "label", "tone"]) &&
      item.id === signalIds[index] && isNonEmptyString(item.label) && isNonEmptyString(item.body) &&
      ["positive", "caution", "action"].includes(String(item.tone))) &&
    Array.isArray(value.assessments) && value.assessments.length === assessmentIds.length &&
    value.assessments.every((item, index) => hasExactKeys(item, [
      "answer", "cta_href", "cta_label", "evidence_level", "id", "label", "question", "signals", "watchout",
    ]) && item.id === assessmentIds[index] &&
      ["answer", "cta_label", "evidence_level", "label", "question", "watchout"].every((key) => isNonEmptyString(item[key])) &&
      /^\/(?:en|zh)\/tests\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(item.cta_href)) &&
      isStringArray(item.signals)) &&
    Array.isArray(value.directions) && value.directions.length === 6 &&
    value.directions.every((item) => {
      if (!hasExactKeys(item, ["direction", "fit_signals", "watchouts"], ["target"]) ||
        !["direction", "fit_signals", "watchouts"].every((key) => isNonEmptyString(item[key]))) {
        return false;
      }
      if (item.target === undefined) return true;
      return hasExactKeys(item.target, ["href", "slug", "title"]) &&
        isNonEmptyString(item.target.slug) && isNonEmptyString(item.target.title) &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.target.slug) &&
        new RegExp(`^/(?:en|zh)/career/jobs/${item.target.slug}$`).test(String(item.target.href));
    }) &&
    Array.isArray(value.questions) && value.questions.length >= 8 && value.questions.length <= 10 &&
    value.questions.every((item) => hasStringFields(item, ["answer", "question"])) &&
    Array.isArray(value.source_links) && value.source_links.length >= 4 &&
    value.source_links.every((item) => hasStringFields(item, ["href", "label", "usage"]) &&
      /^https:\/\//.test(String(item.href)));
}

function validateSourceLinks(value: unknown, minimum = 3): boolean {
  return Array.isArray(value) && value.length >= minimum && value.every((item) =>
    hasStringFields(item, ["href", "id", "label", "scope"]) && /^https:\/\//.test(String(item.href))
  );
}

function validateContextLinks(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    hasStringFields(item, ["href", "label"]) && /^#career-visual-group-[a-z-]+$/.test(String(item.href))
  );
}

function validateWorkRisk(value: unknown): boolean {
  return hasExactKeys(value, ["boundary", "context_links", "direct_answer", "evidence_scope", "heading", "risks", "schema_version", "source_links"]) &&
    value.schema_version === "career.work_risk.v1" &&
    ["boundary", "direct_answer", "evidence_scope", "heading"].every((key) => isNonEmptyString(value[key])) &&
    Array.isArray(value.risks) && value.risks.length === 6 && value.risks.every((item) =>
      hasExactKeys(item, ["affected_roles", "consequence", "evidence_refs", "id", "mitigation", "scenario", "title"]) &&
      ["affected_roles", "consequence", "id", "mitigation", "scenario", "title"].every((key) => isNonEmptyString(item[key])) &&
      isStringArray(item.evidence_refs)
    ) && validateContextLinks(value.context_links) && validateSourceLinks(value.source_links, 4);
}

function validateProgression(value: unknown): boolean {
  return hasExactKeys(value, ["boundary", "competence_ladder", "direct_answer", "heading", "locale_requirements", "schema_version", "source_links", "tracks"]) &&
    value.schema_version === "career.career_progression.v1" &&
    ["boundary", "direct_answer", "heading"].every((key) => isNonEmptyString(value[key])) &&
    hasStringFields(value.locale_requirements, ["credential_boundary", "jurisdiction", "summary"]) &&
    Array.isArray(value.tracks) && value.tracks.length === 3 && value.tracks.every((track) =>
      hasExactKeys(track, ["id", "stages", "title"]) && isNonEmptyString(track.id) && isNonEmptyString(track.title) &&
      Array.isArray(track.stages) && track.stages.length === 4 && track.stages.every((stage) =>
        hasStringFields(stage, ["credentials", "next_moves", "readiness_evidence", "responsibility", "role"])
      )
    ) &&
    Array.isArray(value.competence_ladder) && value.competence_ladder.length === 4 &&
    value.competence_ladder.every((item) => hasStringFields(item, ["description", "stage"])) &&
    validateSourceLinks(value.source_links, 4);
}

function validateOutlookTransitions(value: unknown): boolean {
  return hasExactKeys(value, ["context_links", "direct_answer", "heading", "outlook_evidence", "schema_version", "source_links", "transitions"]) &&
    value.schema_version === "career.outlook_transitions.v1" &&
    isNonEmptyString(value.heading) && isNonEmptyString(value.direct_answer) &&
    Array.isArray(value.outlook_evidence) && value.outlook_evidence.length === 3 &&
    value.outlook_evidence.every((item) => hasStringFields(
      item,
      ["geography", "horizon", "interpretation", "limitation", "metric", "occupation_scope", "value"],
      ["source_id", "fact_ref", "source_ref"],
    )) &&
    validateContextLinks(value.context_links) &&
    Array.isArray(value.transitions) && value.transitions.length >= 6 && value.transitions.length <= 8 && value.transitions.every((item) =>
      hasStringFields(item, ["capability_gaps", "shared_capabilities", "target_href", "target_slug", "target_title", "transition_distance"]) &&
      new RegExp(`^/(?:en|zh)/career/jobs/${String(item.target_slug)}$`).test(String(item.target_href))
    ) && validateSourceLinks(value.source_links, 4);
}

function validateComponent(id: CareerDisplayComponentId, value: unknown): boolean {
  switch (id) {
    case "breadcrumb":
      return hasStringFields(value, ["label", "slug"]);
    case "hero":
      return hasStringFields(value, ["h1", "quick_answer", "title"]);
    case "fermat_decision_card":
      return hasStringFields(value, ["caveat", "summary", "title"]);
    case "primary_cta":
      return validateCta(value);
    case "final_cta":
      return validateCta(value, true);
    case "career_snapshot_primary_locale":
      return validatePrimarySnapshot(value);
    case "career_snapshot_secondary_locale":
      return validateSecondarySnapshot(value);
    case "fit_decision_checklist":
      return hasStringFields(value, ["boundary", "how", "suit"]);
    case "riasec_fit_block":
      return hasStringFields(value, ["fit_interest", "interest", "riasec", "riasec_short"]);
    case "personality_fit_block":
      return validateFitDecisionCenter(value) || (
        hasExactKeys(value, ["callout", "disclaimer", "traits"]) &&
        isNonEmptyString(value.callout) && isNonEmptyString(value.disclaimer) && isStringArray(value.traits)
      );
    case "definition_block":
    case "work_context_block":
    case "contract_project_risk_block":
      return isNonEmptyString(value);
    case "career_quick_answers_block":
      return validateQuickAnswers(value);
    case "onet_structured_fields_block":
      return validateOnetStructuredFields(value);
    case "career_ai_description_block":
      return hasExactKeys(value, ["body", "heading"]) && isStringArray(value.body) && isNonEmptyString(value.heading);
    case "responsibilities_block":
      return isStringArray(value);
    case "market_signal_card":
      return validateOutlookTransitions(value) || (hasExactKeys(value, ["callout", "facts", "intro", "signals"]) &&
        isNonEmptyString(value.callout) && isStringArray(value.facts) && isNonEmptyString(value.intro) &&
        Array.isArray(value.signals) && value.signals.length > 0 &&
        (value.signals.every(isNonEmptyString) || value.signals.every((item) => isScalarRecord(item, [["信号", "解读"]]))));
    case "adjacent_career_comparison_table":
      return validateAdjacentCareerComparison(value);
    case "ai_impact_table":
      return validateAiImpact(value);
    case "career_risk_cards":
      return validateWorkRisk(value) || (hasExactKeys(value, ["badge", "callout", "fact", "risks"]) &&
        isNonEmptyString(value.badge) && isNonEmptyString(value.callout) && isNonEmptyString(value.fact) && isStringArray(value.risks));
    case "career_path_block":
      return validateProgression(value) || isScalarRecordArray(value, [
        ["路径", "说明", "风险"], ["职业路径", "典型进阶", "能力升级重点"], ["label", "path"], ["可控", "说明", "风险"],
      ]);
    case "next_steps_block":
      return hasExactKeys(value, ["hot_skills", "responsibilities", "skills"]) &&
        isStringArray(value.hot_skills) && isStringArray(value.responsibilities) &&
        Array.isArray(value.skills) && value.skills.length > 0 &&
        (value.skills.every(isNonEmptyString) || value.skills.every((item) => isScalarRecord(item, [["技能", "说明"]])));
    case "faq_block":
      return hasExactKeys(value, ["items"]) && Array.isArray(value.items) && value.items.length > 0 &&
        value.items.every((item) => hasStringFields(item, ["answer", "question"]));
    case "related_next_pages":
      return validateRelatedNextPages(value);
    case "source_card":
      return hasExactKeys(value, ["eeat_signals", "note"]) && isNonEmptyString(value.note) &&
        hasStringFields(value.eeat_signals, ["author", "source", "updated_at"]);
    case "review_validity_card":
      return hasStringFields(value, ["last_reviewed"]);
    case "boundary_notice":
      return isStringArray(value);
  }
}

function clonePublishedValue(value: unknown): CareerPublishedValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(clonePublishedValue);
  }
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, clonePublishedValue(item)])) as PublishedRecord;
}

export function normalizeCareerPublishedComponents(
  page: Record<string, unknown>,
  componentOrder: readonly CareerDisplayComponentId[],
  isolateInvalidComponents = false,
): CareerPublishedComponents | null {
  const components = {} as CareerPublishedComponents;
  for (const id of componentOrder) {
    const value = page[id];
    if (!validateComponent(id, value)) {
      if (isolateInvalidComponents) continue;
      return null;
    }
    components[id] = clonePublishedValue(value);
  }

  return Object.keys(components).length > 0 ? components : null;
}
