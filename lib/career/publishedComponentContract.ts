import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";

export type CareerPublishedScalar = string | boolean | null;
export type CareerPublishedValue =
  | CareerPublishedScalar
  | CareerPublishedValue[]
  | { [key: string]: CareerPublishedValue };

export type CareerPublishedComponents = Record<CareerDisplayComponentId, CareerPublishedValue>;

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
  if (!hasExactKeys(salary, required, ["china_open_note", "edu", "sources_note"])) {
    return false;
  }

  const requiredStrings = ["china_intl", "china_open", "china_ref", "china_salary_note", "us_growth", "us_median"];
  const optionalStrings = ["china_open_note", "edu", "sources_note"];
  return requiredStrings.every((key) => isNonEmptyString(salary[key])) &&
    optionalStrings.every((key) => salary[key] === undefined || typeof salary[key] === "string") &&
    ["china_ai_row", "china_class_row", "china_name_row", "china_soc_row"].every((key) => isStringOrScalarRecord(salary[key])) &&
    isScalarRecordArray(salary.bls_table, [
      ["指标", "数值", "说明"], ["label", "value"], ["label", "value", "数值"], ["label", "value", "数值", "说明"],
    ]) &&
    isScalarRecordArray(salary.china_edu_table, [["学历段", "岗位方向", "说明"], ["label", "value"]]) &&
    isScalarRecordArray(salary.china_industry_table, [["行业", "需求"], ["行业", "需求", "备注"], ["label", "value"]]) &&
    isScalarRecordArray(salary.china_salary_table, [["城市/区间", "月薪参考"], ["label", "value"]]);
}

function validateAiImpact(value: unknown): boolean {
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
      return hasExactKeys(value, ["bls_table", "growth", "median"]) &&
        isNonEmptyString(value.growth) && isNonEmptyString(value.median) &&
        isScalarRecordArray(value.bls_table, [
          ["指标", "数值", "说明"], ["label", "value"], ["label", "value", "数值"], ["label", "value", "数值", "说明"],
        ]);
    case "fit_decision_checklist":
      return hasStringFields(value, ["boundary", "how", "suit"]);
    case "riasec_fit_block":
      return hasStringFields(value, ["fit_interest", "interest", "riasec", "riasec_short"]);
    case "personality_fit_block":
      return hasExactKeys(value, ["callout", "disclaimer", "traits"]) &&
        isNonEmptyString(value.callout) && isNonEmptyString(value.disclaimer) && isStringArray(value.traits);
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
      return hasExactKeys(value, ["callout", "facts", "intro", "signals"]) &&
        isNonEmptyString(value.callout) && isStringArray(value.facts) && isNonEmptyString(value.intro) &&
        Array.isArray(value.signals) && value.signals.length > 0 &&
        (value.signals.every(isNonEmptyString) || value.signals.every((item) => isScalarRecord(item, [["信号", "解读"]])));
    case "adjacent_career_comparison_table":
      return isScalarRecordArray(value, [
        ["职业", "区别", "AI 影响"], ["职业", "区别", "AI影响"], ["occupation", "diff"], ["岗位", "重心", "产出"],
      ]);
    case "ai_impact_table":
      return validateAiImpact(value);
    case "career_risk_cards":
      return hasExactKeys(value, ["badge", "callout", "fact", "risks"]) &&
        isNonEmptyString(value.badge) && isNonEmptyString(value.callout) && isNonEmptyString(value.fact) && isStringArray(value.risks);
    case "career_path_block":
      return isScalarRecordArray(value, [["路径", "说明", "风险"], ["label", "path"], ["可控", "说明", "风险"]]);
    case "next_steps_block":
      return hasExactKeys(value, ["hot_skills", "responsibilities", "skills"]) &&
        isStringArray(value.hot_skills) && isStringArray(value.responsibilities) &&
        Array.isArray(value.skills) && value.skills.length > 0 &&
        (value.skills.every(isNonEmptyString) || value.skills.every((item) => isScalarRecord(item, [["技能", "说明"]])));
    case "faq_block":
      return hasExactKeys(value, ["items"]) && Array.isArray(value.items) && value.items.length > 0 &&
        value.items.every((item) => hasStringFields(item, ["answer", "question"]));
    case "related_next_pages":
      return hasExactKeys(value, ["intro", "links"]) && isNonEmptyString(value.intro) &&
        Array.isArray(value.links) && value.links.length > 0 && value.links.every((item) =>
          hasExactKeys(item, ["nofollow", "slug", "source", "title_en"]) &&
          typeof item.nofollow === "boolean" && isNonEmptyString(item.slug) &&
          (item.source === "lookup" || item.source === "self_pick") && isNonEmptyString(item.title_en)
        );
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
  componentOrder: readonly CareerDisplayComponentId[]
): CareerPublishedComponents | null {
  const components = {} as CareerPublishedComponents;
  for (const id of componentOrder) {
    const value = page[id];
    if (!validateComponent(id, value)) {
      return null;
    }
    components[id] = clonePublishedValue(value);
  }

  return components;
}
