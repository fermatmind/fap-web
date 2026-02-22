import { z } from "zod";

export const big5QuestionOptionSchema = z.object({
  code: z.string().min(1),
  text: z.string().min(1),
  score: z.number().optional(),
});

export const big5QuestionItemSchema = z.object({
  question_id: z.string().min(1),
  text: z.string().min(1),
  order: z.number().optional(),
  dimension: z.string().optional(),
  facet_code: z.string().optional(),
  options: z.array(big5QuestionOptionSchema).min(1),
});

export const big5QuestionsResponseSchema = z.object({
  ok: z.boolean(),
  scale_code: z.string().optional(),
  pack_id: z.string().optional(),
  dir_version: z.string().optional(),
  content_package_version: z.string().optional(),
  locale: z.string().optional(),
  region: z.string().optional(),
  questions: z.object({
    schema: z.string().optional(),
    items: z.array(big5QuestionItemSchema),
  }),
  meta: z
    .object({
      disclaimer_version: z.string().optional(),
      disclaimer_hash: z.string().optional(),
      disclaimer_text: z.string().optional(),
      validity_items: z
        .array(
          z.object({
            item_id: z.string(),
            text: z.string(),
            required: z.boolean().optional(),
          })
        )
        .optional(),
    })
    .passthrough()
    .optional(),
});

export const big5StartAttemptResponseSchema = z.object({
  ok: z.boolean(),
  attempt_id: z.string().min(1),
  scale_code: z.string().optional(),
  pack_id: z.string().optional(),
  dir_version: z.string().optional(),
  resume_token: z.string().optional(),
  resume_expires_at: z.string().nullable().optional(),
  question_count: z.number().optional(),
});

const big5ReportBlockSchema = z
  .object({
    id: z.string().optional(),
    kind: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    metric_level: z.string().optional(),
    metric_code: z.string().optional(),
    bucket: z.string().optional(),
    access_level: z.string().optional(),
  })
  .passthrough();

const big5ReportSectionSchema = z
  .object({
    key: z.string().optional(),
    title: z.string().optional(),
    access_level: z.string().optional(),
    module_code: z.string().optional(),
    blocks: z.array(big5ReportBlockSchema).optional(),
  })
  .passthrough();

export const big5ReportResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    locked: z.boolean().optional(),
    variant: z.string().optional(),
    generating: z.boolean().optional(),
    retry_after: z.number().optional(),
    offers: z.unknown().optional(),
    modules_allowed: z.array(z.string()).optional(),
    modules_offered: z.array(z.string()).optional(),
    modules_preview: z.array(z.string()).optional(),
    norms: z
      .object({
        status: z.string().optional(),
        group_id: z.string().optional(),
        norms_version: z.string().optional(),
      })
      .passthrough()
      .optional(),
    quality: z
      .object({
        level: z.string().optional(),
        tone: z.string().optional(),
      })
      .passthrough()
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    report: z
      .object({
        sections: z.array(big5ReportSectionSchema).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const big5SubmitResponseSchema = z
  .object({
    ok: z.boolean(),
    attempt_id: z.string().optional(),
    idempotent: z.boolean().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    report: z
      .object({
        locked: z.boolean().optional(),
      })
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const big5MeAttemptsResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    scale_code: z.string().nullable().optional(),
    user_id: z.string().optional(),
    anon_id: z.string().optional(),
    items: z
      .array(
        z
          .object({
            attempt_id: z.string(),
            submitted_at: z.string().nullable().optional(),
            type_code: z.string().optional(),
            result_summary: z
              .object({
                domains_mean: z.record(z.string(), z.number()).optional(),
              })
              .optional(),
          })
          .passthrough()
      )
      .optional(),
    history_compare: z
      .object({
        current_attempt_id: z.string().optional(),
        previous_attempt_id: z.string().optional(),
        domains_delta: z.record(
          z.string(),
          z
            .object({
              delta: z.number().optional(),
              direction: z.string().optional(),
            })
            .passthrough()
        ),
      })
      .passthrough()
      .nullable()
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    links: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type Big5QuestionsResponseContract = z.infer<typeof big5QuestionsResponseSchema>;
export type Big5ReportResponseContract = z.infer<typeof big5ReportResponseSchema>;
export type Big5SubmitResponseContract = z.infer<typeof big5SubmitResponseSchema>;
export type Big5MeAttemptsResponseContract = z.infer<typeof big5MeAttemptsResponseSchema>;
