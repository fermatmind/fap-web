import { z } from "zod";

const objectRecordArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.preprocess(
    (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : value,
    z.array(itemSchema)
  );

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
  form_code: z.string().optional(),
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
    blocks: objectRecordArray(big5ReportBlockSchema).optional(),
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
    sections: objectRecordArray(big5ReportSectionSchema).optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const big5ReportEngineV2ProvenanceSchema = z
  .object({
    atomic_refs: z.array(z.string()).optional(),
    modifier_refs: z.array(z.string()).optional(),
    synergy_refs: z.array(z.string()).optional(),
    facet_refs: z.array(z.string()).optional(),
    action_refs: z.array(z.string()).optional(),
  })
  .passthrough();

const big5ReportEngineV2BlockSchema = z
  .object({
    block_uid: z.string().min(1),
    kind: z.string().min(1),
    component: z.string().min(1),
    block_id: z.string().min(1),
    resolved_copy: z.record(z.string(), z.unknown()),
    provenance: big5ReportEngineV2ProvenanceSchema,
    analytics: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const big5ReportEngineV2SectionSchema = z
  .object({
    section_key: z.string().min(1),
    status: z.string().optional(),
    blocks: objectRecordArray(big5ReportEngineV2BlockSchema),
  })
  .passthrough();

export const big5ReportEngineV2Schema = z
  .object({
    schema_version: z.literal("fap.big5.report.v1"),
    report_id: z.string().optional(),
    locale: z.string().optional(),
    scale_code: z.literal("BIG5_OCEAN"),
    form_code: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    score_vector: z
      .object({
        domains: z.record(z.string(), z.unknown()).optional(),
        facets: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough(),
    engine_decisions: z.record(z.string(), z.unknown()),
    sections: objectRecordArray(big5ReportEngineV2SectionSchema),
    action_matrix: z.record(z.string(), z.unknown()),
    render_hints: z.record(z.string(), z.unknown()),
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
    // Keep the additive bridge non-fatal for legacy report reads. The
    // dedicated schema above is used by the consumer to decide whether v2 is
    // usable; malformed v2 must fall back to the legacy path instead of
    // failing the whole report contract.
    big5_report_engine_v2: z.unknown().optional(),
    // Keep additive Result Page V2 non-fatal for report reads. The dedicated
    // type guard decides whether the V2 consumer path is safe to render.
    big5_result_page_v2: z.unknown().optional(),
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
            top_facets_summary_v1: z
              .object({
                items: z
                  .array(
                    z
                      .object({
                        key: z.string().optional(),
                        label: z.string().optional(),
                        domain: z.string().optional(),
                        percentile: z.number().nullable().optional(),
                        bucket: z.string().nullable().optional(),
                        kind: z.string().nullable().optional(),
                      })
                      .passthrough()
                  )
                  .optional(),
              })
              .passthrough()
              .optional(),
            quality_summary: z
              .object({
                level: z.string().optional(),
                grade: z.string().nullable().optional(),
              })
              .passthrough()
              .optional(),
            norms_summary: z
              .object({
                status: z.string().optional(),
                norms_version: z.string().nullable().optional(),
              })
              .passthrough()
              .optional(),
            offer_summary: z
              .object({
                primary_offer: z
                  .object({
                    sku: z.string().nullable().optional(),
                    label: z.string().nullable().optional(),
                    title: z.string().nullable().optional(),
                    formatted_price: z.string().nullable().optional(),
                    price_cents: z.number().nullable().optional(),
                    currency: z.string().nullable().optional(),
                    benefit_code: z.string().nullable().optional(),
                    modules_included: z.array(z.string()).optional(),
                  })
                  .passthrough()
                  .nullable()
                  .optional(),
              })
              .passthrough()
              .optional(),
            share_summary: z
              .object({
                enabled: z.boolean().optional(),
                share_kind: z.string().optional(),
              })
              .passthrough()
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
