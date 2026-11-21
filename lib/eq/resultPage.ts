import { z } from "zod";
import { eqRedesignPreviewSchema, type EqRedesignCandidate } from "./redesignPreview";

const locales = z.enum(["zh-CN", "en", "zh-TW"]);
const text = z.string().min(1);
const card = z.object({ title: text, body: text });
const common = z.object({
  result_labels: eqRedesignPreviewSchema.shape.result_labels, dimension_bands: eqRedesignPreviewSchema.shape.dimension_bands, sources: eqRedesignPreviewSchema.shape.sources,
  schema: z.literal("eq60.result_page.v1"),
  source_hash: z.string().regex(/^[a-f0-9]{64}$/),
  compiled_hash: z.string().regex(/^[a-f0-9]{64}$/),
  result_id: eqRedesignPreviewSchema.shape.sample.shape.formulation_id,
});
const fullCopy = eqRedesignPreviewSchema.shape.copy;
export const eqQualityCopySchema = fullCopy.valueType.pick({ sections: true, labels: true, science: true });
export const eqQualitySchema = z.object({ summary_title: text, summary: text, reasons_title: text, reasons: z.array(text).length(3), steps: z.array(card).length(3) });
export const eqResultPageSchema = z.union([
  common.extend({ result_id: z.literal("low_confidence_result"), copy: z.record(locales, eqQualityCopySchema), quality: z.record(locales, eqQualitySchema) }),
  common.extend({ copy: fullCopy, quality: z.null() }).refine(value => value.result_id !== "low_confidence_result"),
]);
export type EqResultPage = z.infer<typeof eqResultPageSchema>;
export type EqResultPresentation = Pick<EqRedesignCandidate, "copy" | "result_labels" | "dimension_bands" | "sources"> & { result_id: EqRedesignCandidate["sample"]["formulation_id"] };

const dimension = z.object({ code: z.enum(["SA", "ER", "EM", "RM"]), name: text, score: z.number().min(55).max(145), band_label: text });
export const eqUnlockSchema = z.object({ schema: z.literal("eq60.unlock.v1"), low_confidence: z.boolean(), dimensions: z.record(locales, z.array(dimension)) }).superRefine((value, ctx) => {
  for (const locale of locales.options) {
    const rows = value.dimensions[locale];
    if (value.low_confidence ? rows.length !== 0 : rows.length !== 4 || rows.map(row => row.code).join() !== "SA,ER,EM,RM") {
      ctx.addIssue({ code: "custom", message: "Invalid EQ unlock dimensions", path: ["dimensions", locale] });
    }
  }
});
