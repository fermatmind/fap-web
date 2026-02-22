import { z } from "zod";

export const clinicalScaleCodeSchema = z.enum(["SDS_20", "CLINICAL_COMBO_68"]);

export const clinicalQuestionOptionSchema = z.object({
  code: z.string().min(1),
  text: z.string().min(1),
  score: z.number().optional(),
});

export const clinicalQuestionItemSchema = z.object({
  question_id: z.string().min(1),
  order: z.number().optional(),
  text: z.string().min(1),
  direction: z.number().optional(),
  module_code: z.string().optional(),
  options_set_code: z.string().optional(),
  is_reverse: z.union([z.boolean(), z.number()]).optional(),
  options: z.array(clinicalQuestionOptionSchema).optional(),
});

export const clinicalQuestionsResponseSchema = z
  .object({
    ok: z.boolean(),
    scale_code: clinicalScaleCodeSchema,
    locale: z.string().optional(),
    region: z.string().optional(),
    pack_id: z.string().optional(),
    dir_version: z.string().optional(),
    content_package_version: z.string().optional(),
    questions: z.object({
      schema: z.string().optional(),
      items: z.array(clinicalQuestionItemSchema),
    }),
    options: z
      .object({
        format: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    meta: z
      .object({
        consent: z
          .object({
            required: z.boolean().optional(),
            version: z.string().optional(),
            text: z.string().optional(),
          })
          .passthrough()
          .optional(),
        disclaimer: z
          .object({
            version: z.string().optional(),
            hash: z.string().optional(),
            text: z.string().optional(),
          })
          .passthrough()
          .optional(),
        source: z
          .object({
            items: z.array(z.unknown()).optional(),
          })
          .passthrough()
          .optional(),
        modules: z.record(z.string(), z.object({ title: z.string().optional(), guidance: z.string().optional() })).optional(),
        privacy_addendum: z.record(z.string(), z.unknown()).optional(),
        crisis_resources: z.record(z.string(), z.unknown()).optional(),
        disclaimer_text: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const clinicalStartAttemptResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().min(1),
    scale_code: z.string().optional(),
    pack_id: z.string().optional(),
    dir_version: z.string().optional(),
    resume_token: z.string().optional(),
    resume_expires_at: z.string().nullable().optional(),
    question_count: z.number().optional(),
  })
  .passthrough();

export const clinicalReportBlockSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    kind: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    body: z.string().optional(),
  })
  .passthrough();

export const clinicalReportSectionSchema = z
  .object({
    key: z.string().optional(),
    title: z.string().optional(),
    access_level: z.string().optional(),
    module_code: z.string().optional(),
    blocks: z.array(clinicalReportBlockSchema).optional(),
    resources: z.array(z.record(z.string(), z.unknown())).optional(),
    reasons: z.array(z.string()).optional(),
  })
  .passthrough();

export const clinicalReportResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    locked: z.boolean().optional(),
    access_level: z.string().optional(),
    variant: z.string().optional(),
    generating: z.boolean().optional(),
    retry_after: z.number().optional(),
    retry_after_seconds: z.number().optional(),
    offers: z.unknown().optional(),
    modules_allowed: z.array(z.string()).optional(),
    modules_offered: z.array(z.string()).optional(),
    modules_preview: z.array(z.string()).optional(),
    norms: z.record(z.string(), z.unknown()).optional(),
    quality: z
      .object({
        level: z.string().optional(),
        crisis_alert: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    meta: z
      .object({
        generating: z.boolean().optional(),
        snapshot_error: z.boolean().optional(),
        retry_after_seconds: z.number().optional(),
        scale_code: z.string().optional(),
      })
      .passthrough()
      .optional(),
    report: z
      .object({
        scale_code: z.string().optional(),
        locale: z.string().optional(),
        sections: z.array(clinicalReportSectionSchema).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const clinicalSubmitResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().optional(),
    idempotent: z.boolean().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    report: clinicalReportResponseSchema.optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type ClinicalQuestionsResponseContract = z.infer<typeof clinicalQuestionsResponseSchema>;
export type ClinicalStartAttemptResponseContract = z.infer<typeof clinicalStartAttemptResponseSchema>;
export type ClinicalSubmitResponseContract = z.infer<typeof clinicalSubmitResponseSchema>;
export type ClinicalReportResponseContract = z.infer<typeof clinicalReportResponseSchema>;
