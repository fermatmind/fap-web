import { z } from "zod";
import type { ReportResponse } from "@/lib/api/v0_3";

export const BIG5_RESULT_PAGE_V2_PAYLOAD_KEY = "big5_result_page_v2" as const;
export const BIG5_RESULT_PAGE_V2_SCHEMA_VERSION = "fap.big5.result_page.v2" as const;

export const BIG5_RESULT_PAGE_V2_MODULE_KEYS = [
  "module_00_trust_bar",
  "module_01_hero",
  "module_02_quick_understanding",
  "module_03_trait_deep_dive",
  "module_04_coupling",
  "module_05_facet_reframe",
  "module_06_application_matrix",
  "module_07_collaboration_manual",
  "module_08_share_save",
  "module_09_feedback_data_flywheel",
  "module_10_method_privacy",
] as const;

export const BIG5_RESULT_PAGE_V2_BLOCK_KINDS = [
  "trust_bar",
  "hero_summary",
  "trait_bars",
  "quick_cards",
  "trait_deep_dive",
  "coupling_cards",
  "facet_reframe",
  "application_matrix",
  "collaboration_manual",
  "share_save",
  "feedback_block",
  "method_boundary",
] as const;

const forbiddenPublicKeys = new Set([
  "editor_note",
  "qa_note",
  "selection_guidance",
  "import_policy",
  "governance_metadata",
  "internal_metadata",
  "internal_notes",
  "private_metadata",
  "review_status",
  "codex_policy",
  "replacement_policy",
  "selection_context",
  "type_code",
  "canonical_type",
  "fixed_type",
  "type_name",
  "user_confirmed_type",
]);

const shareForbiddenScoreKeys = new Set([
  "raw_score",
  "raw_scores",
  "raw_mean",
  "z",
  "t",
  "standardized_scores",
  "score_vector",
  "percentile",
  "percentiles",
  "domains",
  "facets",
  "facet_vector",
  "domain_vector",
]);

const contentValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(contentValueSchema), z.record(z.string(), contentValueSchema)])
);

const big5ResultPageV2ContentSchema = z.record(z.string(), contentValueSchema);

const big5ResultPageV2BlockSchema = z
  .object({
    block_key: z.string().min(1),
    block_kind: z.enum(BIG5_RESULT_PAGE_V2_BLOCK_KINDS),
    module_key: z.enum(BIG5_RESULT_PAGE_V2_MODULE_KEYS),
    content: big5ResultPageV2ContentSchema.optional(),
    projection_refs: z.array(z.string()).optional(),
    registry_refs: z.array(z.string()).optional(),
    safety_level: z.string().optional(),
    evidence_level: z.string().optional(),
    shareable: z.boolean().optional(),
    content_source: z.string().optional(),
    fallback_policy: z.string().optional(),
  })
  .passthrough();

const big5ResultPageV2ModuleSchema = z
  .object({
    module_key: z.enum(BIG5_RESULT_PAGE_V2_MODULE_KEYS),
    blocks: z.array(big5ResultPageV2BlockSchema),
  })
  .passthrough()
  .superRefine((module, ctx) => {
    module.blocks.forEach((block, index) => {
      if (block.module_key !== module.module_key) {
        ctx.addIssue({
          code: "custom",
          path: ["blocks", index, "module_key"],
          message: "block module_key must match parent module_key",
        });
      }
    });
  });

const big5ResultPageV2ProjectionSchema = z
  .object({
    schema_version: z.literal("fap.big5.projection.v2"),
    scale_code: z.literal("BIG5_OCEAN"),
    interpretation_scope: z.string().optional(),
    profile_signature: z
      .object({
        is_fixed_type: z.literal(false).optional(),
        system: z.string().optional(),
        signature_key: z.string().optional(),
        label_key: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const big5ResultPageV2PayloadSchema = z
  .object({
    schema_version: z.literal(BIG5_RESULT_PAGE_V2_SCHEMA_VERSION),
    payload_key: z.literal(BIG5_RESULT_PAGE_V2_PAYLOAD_KEY),
    scale_code: z.literal("BIG5_OCEAN"),
    projection_v2: big5ResultPageV2ProjectionSchema.optional(),
    modules: z.array(big5ResultPageV2ModuleSchema),
  })
  .passthrough()
  .superRefine((payload, ctx) => {
    collectForbiddenPublicKeys(payload, [], ctx);
    payload.modules.forEach((module, moduleIndex) => {
      module.blocks.forEach((block, blockIndex) => {
        if (block.shareable === true) {
          collectShareForbiddenKeys(block.content ?? {}, ["modules", moduleIndex, "blocks", blockIndex, "content"], ctx);
        }
      });
    });
  });

export type Big5ResultPageV2Payload = z.infer<typeof big5ResultPageV2PayloadSchema>;
export type Big5ResultPageV2Module = Big5ResultPageV2Payload["modules"][number];
export type Big5ResultPageV2Block = Big5ResultPageV2Module["blocks"][number];

export type Big5ResultPageV2Gate = {
  isFreeVariant: boolean;
  modulesAllowed: Set<string>;
};

const BIG5_RESULT_PAGE_V2_FREE_MODULES = new Set<string>([
  "module_00_trust_bar",
  "module_01_hero",
  "module_02_quick_understanding",
  "module_08_share_save",
  "module_09_feedback_data_flywheel",
  "module_10_method_privacy",
]);

const BIG5_RESULT_PAGE_V2_MODULE_ENTITLEMENTS: Record<string, readonly string[]> = {
  module_03_trait_deep_dive: ["big5_full", "report.full", "report_full"],
  module_04_coupling: ["big5_full", "report.full", "report_full"],
  module_05_facet_reframe: ["big5_full", "report.full", "report_full"],
  module_06_application_matrix: ["big5_action_plan", "big5_full", "report.full", "report_full"],
  module_07_collaboration_manual: ["big5_action_plan", "big5_full", "report.full", "report_full"],
};

export function parseBig5ResultPageV2Payload(value: unknown): Big5ResultPageV2Payload | null {
  const parsed = big5ResultPageV2PayloadSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function getBig5ResultPageV2Payload(reportData: ReportResponse | null | undefined): Big5ResultPageV2Payload | null {
  if (!reportData || typeof reportData !== "object") {
    return null;
  }

  return parseBig5ResultPageV2Payload(reportData[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]);
}

export function hasBig5ResultPageV2Payload(reportData: ReportResponse | null | undefined): boolean {
  return getBig5ResultPageV2Payload(reportData) !== null;
}

export function filterBig5ResultPageV2PayloadForGate(
  payload: Big5ResultPageV2Payload,
  gate: Big5ResultPageV2Gate
): Big5ResultPageV2Payload {
  if (!gate.isFreeVariant) {
    return payload;
  }

  const modulesAllowed = new Set(Array.from(gate.modulesAllowed).map((item) => item.toLowerCase()));
  return {
    ...payload,
    modules: payload.modules.filter((module) => {
      const moduleKey = module.module_key.toLowerCase();
      if (BIG5_RESULT_PAGE_V2_FREE_MODULES.has(moduleKey)) {
        return true;
      }

      const entitlements = BIG5_RESULT_PAGE_V2_MODULE_ENTITLEMENTS[moduleKey] ?? [];
      return modulesAllowed.has(moduleKey) || entitlements.some((moduleCode) => modulesAllowed.has(moduleCode));
    }),
  };
}

function collectForbiddenPublicKeys(value: unknown, path: Array<string | number>, ctx: z.RefinementCtx): void {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenPublicKeys(item, [...path, index], ctx));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (forbiddenPublicKeys.has(key)) {
      ctx.addIssue({
        code: "custom",
        path: [...path, key],
        message: "forbidden internal or fixed-type field in public Big Five V2 payload",
      });
      continue;
    }

    collectForbiddenPublicKeys(child, [...path, key], ctx);
  }
}

function collectShareForbiddenKeys(value: unknown, path: Array<string | number>, ctx: z.RefinementCtx): void {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectShareForbiddenKeys(item, [...path, index], ctx));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (shareForbiddenScoreKeys.has(key)) {
      ctx.addIssue({
        code: "custom",
        path: [...path, key],
        message: "shareable Big Five V2 block must not expose sensitive raw score fields",
      });
      continue;
    }

    collectShareForbiddenKeys(child, [...path, key], ctx);
  }
}
