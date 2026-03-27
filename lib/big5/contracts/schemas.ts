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
  manifest_hash: z.string().optional(),
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
      manifest_hash: z.string().optional(),
      norms_version: z.string().optional(),
      quality_level: z.string().optional(),
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

const big5TraitProjectionSchema = z
  .object({
    key: z.string().optional(),
    label: z.string().optional(),
    mean: z.number().optional(),
    percentile: z.number().optional(),
    band: z.string().optional(),
    band_label: z.string().optional(),
    rank: z.number().optional(),
  })
  .passthrough();

const big5FacetProjectionSchema = z
  .object({
    key: z.string().optional(),
    label: z.string().optional(),
    slug: z.string().optional(),
    domain: z.string().optional(),
    mean: z.number().optional(),
    percentile: z.number().optional(),
    bucket: z.string().optional(),
  })
  .passthrough();

const comparativeReferenceSchema = z
  .object({
    key: z.string().optional(),
    label: z.string().optional(),
    summary: z.string().optional(),
  })
  .passthrough();

const comparativeSchema = z
  .object({
    version: z.string().optional(),
    comparative_contract_version: z.string().optional(),
    enabled: z.boolean().optional(),
    percentile: z
      .object({
        metric_key: z.string().optional(),
        metric_label: z.string().optional(),
        value: z.number().optional(),
      })
      .passthrough()
      .optional(),
    cohort_relative_position: comparativeReferenceSchema.optional(),
    same_type_contrast: comparativeReferenceSchema.optional(),
    norming_version: z.string().optional(),
    norming_scope: z.string().optional(),
    norming_source: z.string().optional(),
    comparative_fingerprint: z.string().optional(),
    truth_guard_fields: z.array(z.string()).optional(),
  })
  .passthrough();

const big5PublicProjectionSchema = z
  .object({
    schema_version: z.string().optional(),
    trait_vector: z.array(big5TraitProjectionSchema).optional(),
    facet_vector: z.array(big5FacetProjectionSchema).optional(),
    trait_bands: z.record(z.string(), z.string()).optional(),
    dominant_traits: z.array(big5TraitProjectionSchema).optional(),
    variant_keys: z.array(z.string()).optional(),
    scene_fingerprint: z.record(z.string(), z.string()).optional(),
    explainability_summary: z
      .object({
        headline: z.string().optional(),
        reasons: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    action_plan_summary: z
      .object({
        headline: z.string().optional(),
        focus_trait: z.string().optional(),
        actions: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    ordered_section_keys: z.array(z.string()).optional(),
    comparative_v1: comparativeSchema.optional(),
    sections: z.array(big5ReportSectionSchema).optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
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
    comparative_v1: comparativeSchema.optional(),
    big5_public_projection_v1: big5PublicProjectionSchema.optional(),
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
            access_summary: z
              .object({
                access_state: z.string().optional(),
                report_state: z.string().optional(),
                pdf_state: z.string().optional(),
                reason_code: z.string().nullable().optional(),
                access_level: z.string().nullable().optional(),
                variant: z.string().nullable().optional(),
                modules_allowed: z.array(z.string()).optional(),
                modules_preview: z.array(z.string()).optional(),
                actions: z
                  .object({
                    page_href: z.string().nullable().optional(),
                    pdf_href: z.string().nullable().optional(),
                  })
                  .passthrough()
                  .optional(),
              })
              .passthrough()
              .optional(),
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
        current_domains_mean: z.record(z.string(), z.number()).optional(),
        previous_domains_mean: z.record(z.string(), z.number()).optional(),
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
