import { z } from "zod";

export const enneagramQuestionOptionSchema = z
  .object({
    code: z.string().min(1),
    text: z.string().optional(),
    label: z.string().optional(),
    text_en: z.string().optional(),
    text_zh: z.string().optional(),
    type_code: z.string().optional(),
    score: z.number().optional(),
  })
  .passthrough();

export const enneagramQuestionItemSchema = z
  .object({
    question_id: z.string().min(1),
    text: z.string().nullable().optional(),
    text_en: z.string().optional(),
    text_zh: z.string().optional(),
    order: z.number().optional(),
    scoring_mode: z.string().optional(),
    pair: z.string().optional(),
    round: z.number().optional(),
    round_label: z.string().optional(),
    primary_type: z.string().optional(),
    options: z.array(enneagramQuestionOptionSchema).min(1),
  })
  .passthrough();

export const enneagramQuestionsResponseSchema = z
  .object({
    ok: z.boolean(),
    scale_code: z.string().optional(),
    form_code: z.string().optional(),
    pack_id: z.string().optional(),
    dir_version: z.string().optional(),
    content_package_version: z.string().optional(),
    manifest_hash: z.string().optional(),
    locale: z.string().optional(),
    region: z.string().optional(),
    questions: z.object({
      schema: z.string().optional(),
      items: z.array(enneagramQuestionItemSchema),
    }),
    meta: z
      .object({
        disclaimer_version: z.string().optional(),
        disclaimer_hash: z.string().optional(),
        disclaimer_text: z.string().optional(),
        manifest_hash: z.string().optional(),
        quality_level: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const enneagramStartAttemptResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().min(1),
    form_code: z.string().optional(),
    scale_code: z.string().optional(),
    pack_id: z.string().optional(),
    dir_version: z.string().optional(),
    resume_token: z.string().optional(),
    resume_expires_at: z.string().nullable().optional(),
    question_count: z.number().optional(),
  })
  .passthrough();

export const enneagramSubmitResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().optional(),
    submission_id: z.string().optional(),
    submission_state: z.string().optional(),
    generating: z.boolean().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    idempotent: z.boolean().optional(),
  })
  .passthrough();

const enneagramFormSummarySchema = z
  .object({
    form_code: z.string().min(1),
    label: z.string().min(1),
    short_label: z.string().min(1),
    question_count: z.number(),
    estimated_minutes: z.number().optional(),
    scale_code: z.string().optional(),
  })
  .passthrough();

const enneagramTypeProjectionSchema = z
  .object({
    code: z.string().optional(),
    type_code: z.string().optional(),
    label: z.string().optional(),
    name: z.string().optional(),
    score: z.union([z.number(), z.string()]).nullable().optional(),
    percent: z.union([z.number(), z.string()]).nullable().optional(),
    rank: z.union([z.number(), z.string()]).nullable().optional(),
  })
  .passthrough();

export const enneagramPublicProjectionSchema = z
  .object({
    schema_version: z.string().optional(),
    scale_code: z.string().optional(),
    primary_type: z.union([z.string(), enneagramTypeProjectionSchema]).nullable().optional(),
    type_vector: z.array(enneagramTypeProjectionSchema).optional(),
    ranked_types: z.array(enneagramTypeProjectionSchema).optional(),
    top_types: z.array(enneagramTypeProjectionSchema).optional(),
    summary: z.string().nullable().optional(),
    headline: z.string().nullable().optional(),
    confidence: z.record(z.string(), z.unknown()).nullable().optional(),
    quality: z.record(z.string(), z.unknown()).nullable().optional(),
    sections: z.array(z.record(z.string(), z.unknown())).optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const enneagramAssetBackedModuleContentSchema = z
  .object({
    asset_key: z.string().min(1),
    asset_type: z.string().min(1).optional(),
    category: z.string().min(1),
    module_key: z.string().min(1).optional(),
    body_zh: z.string().min(1).optional(),
    short_body_zh: z.string().optional(),
    cta_zh: z.string().optional(),
    content_maturity: z.string().optional(),
    evidence_level: z.string().optional(),
    version: z.string().optional(),
  })
  .strict();

export const enneagramAssetBackedModuleSchema = z
  .object({
    module_key: z.string().min(1),
    kind: z.literal("asset_backed_card"),
    visibility: z.string().optional(),
    state: z.string().optional(),
    form_variant: z.string().optional(),
    content: enneagramAssetBackedModuleContentSchema,
  })
  .passthrough();

export const enneagramReportResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    attempt_id: z.string().optional(),
    scale_code: z.string().optional(),
    locked: z.boolean().optional(),
    generating: z.boolean().optional(),
    access_level: z.string().optional(),
    variant: z.string().optional(),
    modules_allowed: z.array(z.string()).optional(),
    modules_preview: z.array(z.string()).optional(),
    enneagram_form_v1: enneagramFormSummarySchema.nullable().optional(),
    enneagram_public_projection_v1: enneagramPublicProjectionSchema.nullable().optional(),
    report: z
      .object({
        scale_code: z.string().optional(),
        form_code: z.string().optional(),
        schema_version: z.string().optional(),
        sections: z.array(z.record(z.string(), z.unknown())).optional(),
        scores: z.record(z.string(), z.unknown()).optional(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const enneagramReportAccessResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().min(1),
    access_state: z.string(),
    report_state: z.string(),
    pdf_state: z.string(),
    actions: z.record(z.string(), z.unknown()).nullable().optional(),
    enneagram_form_v1: enneagramFormSummarySchema.nullable().optional(),
  })
  .passthrough();

export const enneagramMeAttemptsResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    scale_code: z.string().nullable().optional(),
    items: z.array(z.record(z.string(), z.unknown())).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();
