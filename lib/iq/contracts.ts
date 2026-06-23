import { z } from "zod";
import type {
  AttemptReportAccessResponse,
  QuestionsResponse,
  ReportResponse,
  ResultResponse,
  ScaleLookupResponse,
  StartAttemptResponse,
  SubmitResponse,
} from "@/lib/api/v0_3";
import {
  IQ_CANONICAL_SCALE_CODE,
  IQ_DIMENSION_NAME_MAP,
  IQ_LEGACY_SCALE_CODE,
  type IqDimensionCode,
  type IqReportDimensionField,
  type IqScaleCode,
} from "@/lib/iq/constants";

const iqScaleCodeSchema = z.union([z.literal(IQ_CANONICAL_SCALE_CODE), z.literal(IQ_LEGACY_SCALE_CODE), z.string()]);

export const iqSvgPathSchema = z
  .object({
    d: z.string().optional(),
    fill: z.string().optional(),
    stroke: z.string().optional(),
    stroke_width: z.union([z.string(), z.number()]).optional(),
    strokeWidth: z.union([z.string(), z.number()]).optional(),
    fill_rule: z.string().optional(),
    fillRule: z.string().optional(),
    opacity: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export const iqStructuredSvgSchema = z
  .object({
    view_box: z.string().optional(),
    viewBox: z.string().optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    paths: z.array(iqSvgPathSchema).optional(),
  })
  .passthrough();

export const iqImageAssetSchema = z
  .object({
    type: z.string().optional(),
    media_type: z.string().optional(),
    src: z.string().optional(),
    url: z.string().optional(),
    image_url: z.string().optional(),
    public_url: z.string().optional(),
    path: z.string().optional(),
    assets: z
      .object({
        image: z.string().optional(),
        src: z.string().optional(),
        url: z.string().optional(),
        public_url: z.string().optional(),
      })
      .passthrough()
      .optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
    alt: z.string().optional(),
    accessibility_label: z.string().optional(),
    sha256: z.string().optional(),
  })
  .passthrough();

export const iqStemPayloadSchema = z
  .object({
    prompt: z.string().optional(),
    prompt_zh: z.string().optional(),
    prompt_en: z.string().optional(),
    text: z.string().optional(),
    svg: iqStructuredSvgSchema.optional(),
    image: iqImageAssetSchema.optional(),
    assets: z.record(z.string(), z.unknown()).optional(),
    type: z.string().optional(),
    media_type: z.string().optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
    accessibility_label: z.string().optional(),
    alt: z.string().optional(),
  })
  .passthrough();

export const iqQuestionOptionSchema = z
  .object({
    id: z.string().optional(),
    code: z.string().optional(),
    option_code: z.union([z.string(), z.number()]).optional(),
    label: z.string().optional(),
    text: z.string().optional(),
    value: z.union([z.string(), z.number()]).optional(),
    svg: iqStructuredSvgSchema.optional(),
    image: iqImageAssetSchema.optional(),
    assets: z.record(z.string(), z.unknown()).optional(),
    type: z.string().optional(),
    media_type: z.string().optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
    accessibility_label: z.string().optional(),
    alt: z.string().optional(),
  })
  .passthrough();

export const iqQuestionSchema = z
  .object({
    question_id: z.string().optional(),
    item_id: z.string().optional(),
    text: z.string().nullable().optional(),
    prompt: z.string().optional(),
    order: z.number().optional(),
    stem: iqStemPayloadSchema.nullable().optional(),
    options: z.array(iqQuestionOptionSchema).optional(),
    dimension: z.string().optional(),
    item_family: z.string().optional(),
    difficulty_level: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const iqQuestionPayloadSchema = z
  .object({
    ok: z.boolean().optional(),
    scale_code: iqScaleCodeSchema.optional(),
    pack_id: z.string().optional(),
    bank_id: z.string().optional(),
    dir_version: z.string().optional(),
    content_package_version: z.string().optional(),
    scoring_mode: z.string().optional(),
    locale: z.string().optional(),
    region: z.string().optional(),
    questions: z.object({
      schema: z.string().optional(),
      items: z.array(iqQuestionSchema),
    }),
    options: z
      .object({
        format: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const iqScaleLookupSchema = z
  .object({
    ok: z.boolean().optional(),
    slug: z.string().optional(),
    scale_code: iqScaleCodeSchema.optional(),
    pack_id: z.string().nullable().optional(),
    dir_version: z.string().nullable().optional(),
    content_package_version: z.string().nullable().optional(),
    manifest_hash: z.string().nullable().optional(),
    norms_version: z.string().nullable().optional(),
    quality_level: z.string().nullable().optional(),
    capabilities: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .passthrough();

export const iqStartAttemptPayloadSchema = z
  .object({
    scale_code: iqScaleCodeSchema,
    anon_id: z.string().optional(),
    locale: z.string().optional(),
    region: z.string().optional(),
    form_code: z.string().optional(),
    bank_id: z.string().optional(),
    source: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    client_version: z.string().optional(),
  })
  .passthrough();

export const iqStartAttemptResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().min(1),
    scale_code: iqScaleCodeSchema.optional(),
    pack_id: z.string().optional(),
    dir_version: z.string().optional(),
    question_count: z.number().optional(),
    resume_token: z.string().optional(),
    resume_expires_at: z.string().nullable().optional(),
  })
  .passthrough();

export const iqAttemptAnswerSchema = z
  .object({
    question_id: z.string().optional(),
    item_id: z.string().optional(),
    option_code: z.union([z.string(), z.number()]).optional(),
    value: z.union([z.string(), z.number()]).optional(),
    answered_at: z.string().optional(),
    duration_ms: z.number().optional(),
    question_index: z.number().optional(),
  })
  .passthrough();

export const iqSubmitAttemptPayloadSchema = z
  .object({
    attempt_id: z.string().min(1),
    answers: z.array(iqAttemptAnswerSchema),
    duration_ms: z.number(),
    anon_id: z.string().optional(),
  })
  .passthrough();

export const iqSubmitResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().optional(),
    submission_id: z.string().optional(),
    submission_state: z.string().optional(),
    generating: z.boolean().optional(),
    mode: z.string().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    idempotent: z.boolean().optional(),
  })
  .passthrough();

export const iqDimensionSummarySchema = z
  .object({
    dimension: z.string().optional(),
    score: z.union([z.number(), z.string()]).nullable().optional(),
    raw_score: z.union([z.number(), z.string()]).nullable().optional(),
    percentile: z.union([z.number(), z.string()]).nullable().optional(),
    label: z.string().optional(),
  })
  .passthrough();

export const iqReportDimensionsSchema = z
  .object({
    visual_spatial_insight: z.record(z.string(), z.unknown()).optional(),
    visual_spatial_pattern_reasoning: z.record(z.string(), z.unknown()).optional(),
    numerical_pattern_reasoning: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const iqQualitySchema = z
  .object({
    level: z.string().optional(),
    flags: z.array(z.string()).optional(),
  })
  .passthrough();

export const iqStabilitySchema = z
  .object({
    status: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough();

export const iqResultPayloadSchema = z
  .object({
    ok: z.boolean().optional(),
    scale_code: iqScaleCodeSchema.optional(),
    attempt_id: z.string().optional(),
    status: z.string().optional(),
    raw_score: z.union([z.number(), z.string()]).nullable().optional(),
    final_score: z.union([z.number(), z.string()]).nullable().optional(),
    iq_estimate: z.union([z.number(), z.string()]).nullable().optional(),
    percentile: z.union([z.number(), z.string()]).nullable().optional(),
    confidence_interval: z
      .object({
        min: z.union([z.number(), z.string()]).nullable().optional(),
        max: z.union([z.number(), z.string()]).nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    quality: iqQualitySchema.nullable().optional(),
    stability: iqStabilitySchema.nullable().optional(),
    dimensions: z.union([z.array(iqDimensionSummarySchema), iqReportDimensionsSchema]).optional(),
    reason_code: z.string().nullable().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const iqReportAccessPayloadSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().min(1),
    locked: z.boolean().optional(),
    access_state: z.string().optional(),
    report_state: z.string().optional(),
    pdf_state: z.string().optional(),
    unlock_stage: z.union([z.enum(["locked", "unlocked_adaptive", "unlocked_pro"]), z.string()]).nullable().optional(),
    access_level: z.string().nullable().optional(),
    variant: z.string().nullable().optional(),
    available_offers: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
    effective_sku: z.string().nullable().optional(),
    benefit_code: z.string().nullable().optional(),
    actions: z.record(z.string(), z.unknown()).nullable().optional(),
    payload: z.record(z.string(), z.unknown()).nullable().optional(),
    meta: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .passthrough();

export const iqReportPayloadSchema = z
  .object({
    ok: z.boolean().optional(),
    attempt_id: z.string().optional(),
    scale_code: iqScaleCodeSchema.optional(),
    locked: z.boolean().optional(),
    access_level: z.string().optional(),
    variant: z.string().optional(),
    summary: z
      .object({
        raw_score: z.union([z.number(), z.string()]).nullable().optional(),
        iq_estimate: z.union([z.number(), z.string()]).nullable().optional(),
        percentile: z.union([z.number(), z.string()]).nullable().optional(),
        confidence_interval: z
          .object({
            min: z.union([z.number(), z.string()]).nullable().optional(),
            max: z.union([z.number(), z.string()]).nullable().optional(),
          })
          .passthrough()
          .nullable()
          .optional(),
      })
      .passthrough()
      .optional(),
    dimensions: iqReportDimensionsSchema.optional(),
    quality: iqQualitySchema.nullable().optional(),
    stability: iqStabilitySchema.nullable().optional(),
    iq_pro: z
      .object({
        narrative_sections: z.array(z.record(z.string(), z.unknown())).optional(),
        pdf_payload: z.record(z.string(), z.unknown()).nullable().optional(),
        certificate_payload: z.record(z.string(), z.unknown()).nullable().optional(),
      })
      .passthrough()
      .optional(),
    report: z.record(z.string(), z.unknown()).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    offers: z.union([z.array(z.record(z.string(), z.unknown())), z.record(z.string(), z.unknown())]).optional(),
  })
  .passthrough();

export type IqScaleLookupResponse = z.infer<typeof iqScaleLookupSchema> & ScaleLookupResponse;
export type IqQuestionPayload = z.infer<typeof iqQuestionPayloadSchema> & QuestionsResponse;
export type IqQuestion = z.infer<typeof iqQuestionSchema>;
export type IqStemPayload = z.infer<typeof iqStemPayloadSchema>;
export type IqImageAsset = z.infer<typeof iqImageAssetSchema>;
export type IqStructuredSvg = z.infer<typeof iqStructuredSvgSchema>;
export type IqSvgPath = z.infer<typeof iqSvgPathSchema>;
export type IqQuestionOption = z.infer<typeof iqQuestionOptionSchema>;
export type IqStartAttemptPayload = z.infer<typeof iqStartAttemptPayloadSchema>;
export type IqStartAttemptResponse = z.infer<typeof iqStartAttemptResponseSchema> & StartAttemptResponse;
export type IqAttemptAnswer = z.infer<typeof iqAttemptAnswerSchema>;
export type IqSubmitAttemptPayload = z.infer<typeof iqSubmitAttemptPayloadSchema>;
export type IqSubmitResponse = z.infer<typeof iqSubmitResponseSchema> & SubmitResponse;
export type IqResultPayload = z.infer<typeof iqResultPayloadSchema> & ResultResponse;
export type IqReportAccessPayload = z.infer<typeof iqReportAccessPayloadSchema> & AttemptReportAccessResponse;
export type IqReportPayload = z.infer<typeof iqReportPayloadSchema> & ReportResponse;

export const IQ_DIMENSION_CODE_TO_REPORT_FIELD: Record<IqDimensionCode, IqReportDimensionField> = {
  VSPR: "visual_spatial_pattern_reasoning",
  VSI: "visual_spatial_insight",
  NPR: "numerical_pattern_reasoning",
};

export const IQ_DIMENSION_FIELD_TO_NAME: Record<IqReportDimensionField, string> = {
  visual_spatial_pattern_reasoning: IQ_DIMENSION_NAME_MAP.VSPR,
  visual_spatial_insight: IQ_DIMENSION_NAME_MAP.VSI,
  numerical_pattern_reasoning: IQ_DIMENSION_NAME_MAP.NPR,
};

export function assertIqContract<T>(
  schemaName: string,
  validator: { safeParse: (value: unknown) => { success: boolean; data?: unknown } },
  payload: unknown
): T {
  const parsed = validator.safeParse(payload);
  if (!parsed.success || parsed.data === undefined) {
    throw new Error(`Contract validation failed: ${schemaName}`);
  }

  return parsed.data as T;
}

export function normalizeIqScaleCodeForApi(scaleCode?: string | null): IqScaleCode {
  return scaleCode === IQ_LEGACY_SCALE_CODE ? IQ_LEGACY_SCALE_CODE : IQ_CANONICAL_SCALE_CODE;
}
