import reviewedTaiwanCopy from "./reportDisplayCopy.zh-TW.json";

type CopyRecord = Record<string, unknown>;
type Translate = (source: string) => string;

const reviewedTaiwanText = new Map(Object.entries(reviewedTaiwanCopy));

const sectionFields = ["title", "subtitle", "locked_preview_cta", "locked_preview_description"] as const;
const blockFields = ["title", "body", "bullets", "tips", "tags"] as const;
const resolvedFields = [
  "title", "headline", "body", "why", "retest_label", "interpretation_qualifier",
  "mechanism", "strengths", "tradeoffs", "context_boundary", "action_bridge",
  "status_label", "sample_label", "match_label", "percentile_explanation", "unavailable_explanation",
  "why_it_matters", "daily_meaning", "evidence", "why_priority",
] as const;
const actionFields = [
  "title", "label", "body", "time_horizon_label", "difficulty_label", "why_recommended", "completion_signal",
] as const;

function record(value: unknown): value is CopyRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function translateBig5Text(source: string, translate: Translate): string {
  const converted = reviewedTaiwanText.get(source) ?? translate(source);
  if (/https?:\/\/|`|\{\{/u.test(source)) return converted;
  return converted
    .replaceAll(/不是隻(?=追求|靠|追蹤)/gu, "不是只")
    .replaceAll(/還是隻(?=作為|維持)/gu, "還是只")
    .replaceAll("低置信結果", "解讀信心較低的結果")
    .replaceAll("置信度", "解讀信心")
    .replaceAll("複測", "重新測驗");
}

function displayFields<T extends CopyRecord>(source: T, fields: readonly string[], translate: Translate): T {
  const output: CopyRecord = { ...source };
  for (const field of fields) {
    const value = source[field];
    if (typeof value === "string") output[field] = translateBig5Text(value, translate);
    if (Array.isArray(value)) output[field] = value.map(item => typeof item === "string" ? translateBig5Text(item, translate) : item);
  }
  return output as T;
}

/** Consumes only sections already filtered by the existing report access gate. */
export function projectBig5ReportSection<T extends CopyRecord & { blocks?: CopyRecord[] }>(
  section: T,
  translate: Translate,
): T {
  const projected = displayFields(section, sectionFields, translate);
  if (!section.blocks) return projected;
  return {
    ...projected,
    blocks: section.blocks.map(block => {
      const display = displayFields(block, blockFields, translate);
      if (!record(block.resolved_copy)) return display;
      const resolved = displayFields(block.resolved_copy, resolvedFields, translate);
      if (Array.isArray(resolved.items)) {
        resolved.items = resolved.items.map(item => record(item) ? displayFields(item, actionFields, translate) : item);
      }
      return { ...display, resolved_copy: resolved };
    }),
  };
}
