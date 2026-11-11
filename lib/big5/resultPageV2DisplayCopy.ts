import type { Big5ResultPageV2Payload } from "./resultPageV2";

type CopyRecord = Record<string, unknown>;
type Translate = (source: string) => string;
const blockCopyKeys = [
  "title", "body", "summary", "short_body", "label_role", "boundary", "disclaimer",
  "benefit", "cost", "common_misread", "action", "scenario_label", "repair",
  "action_label", "label", "form", "question_format", "scoring", "scoring_method",
  "error", "measurement_error", "non_diagnostic", "diagnostic_boundary", "use_boundary",
] as const;

function record(value: unknown): value is CopyRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function copyFields(source: CopyRecord, keys: readonly string[], translate: Translate): CopyRecord {
  const copy = { ...source };
  for (const key of keys) {
    for (const name of [key, `${key}_zh`]) {
      const value = source[name];
      if (typeof value === "string") copy[name] = translate(value);
    }
  }
  return copy;
}

/** The caller supplies the validated payload after applying its existing module gate. */
export function projectBig5V2DisplayCopy(payload: Big5ResultPageV2Payload, translate: Translate): Big5ResultPageV2Payload {
  return {
    ...payload,
    modules: payload.modules.map(module => ({
      ...module,
      blocks: module.blocks.map(block => {
        if (!record(block.content)) return block;
        const content = copyFields(block.content, blockCopyKeys, translate);
        if (record(content.trait)) content.trait = copyFields(content.trait, ["label", "public_name"], translate);
        if (record(content.band)) content.band = copyFields(content.band, ["display_band_label"], translate);
        return { ...block, content };
      }),
    })),
  };
}
