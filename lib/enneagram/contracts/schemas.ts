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
