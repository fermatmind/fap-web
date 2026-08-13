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

export const BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES = ["O", "C", "E", "A", "N"] as const;

export type Big5ResultPageV2CoreDomainCode = typeof BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES[number];

export type Big5ResultPageV2CoreDomain = {
  code: Big5ResultPageV2CoreDomainCode;
  score: number;
  band: string;
  labelZh: string;
  labelEn: string;
  bandLabelZh: string;
  bandLabelEn: string;
  summaryZh: string;
  summaryEn: string;
};

export type Big5ResultPageV2SemanticDecision =
  | { mode: "full"; payload: Big5ResultPageV2Payload; reasons: [] }
  | { mode: "core_only"; payload: Big5ResultPageV2Payload; coreDomains: Big5ResultPageV2CoreDomain[]; reasons: string[] }
  | { mode: "reject"; payload: null; reasons: string[] };

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

export function hasBig5ResultPageV2Candidate(reportData: ReportResponse | null | undefined): boolean {
  return Boolean(
    reportData
    && typeof reportData === "object"
    && Object.prototype.hasOwnProperty.call(reportData, BIG5_RESULT_PAGE_V2_PAYLOAD_KEY)
  );
}

export function getBig5ResultPageV2SemanticDecision(
  reportData: ReportResponse | null | undefined
): Big5ResultPageV2SemanticDecision {
  if (!hasBig5ResultPageV2Candidate(reportData)) {
    return { mode: "reject", payload: null, reasons: ["v2_payload_missing"] };
  }

  return assessBig5ResultPageV2Payload(reportData?.[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]);
}

export function assessBig5ResultPageV2Payload(value: unknown): Big5ResultPageV2SemanticDecision {
  const payload = parseBig5ResultPageV2Payload(value);
  if (!payload) {
    return { mode: "reject", payload: null, reasons: ["v2_shape_invalid"] };
  }

  const reasons = new Set<string>();
  const projectionDomains = readReliableProjectionDomains(payload, reasons);
  collectSemanticAnomalies(payload, projectionDomains, reasons);

  if (reasons.size === 0) {
    return { mode: "full", payload, reasons: [] };
  }

  const coreDomains = projectionDomains
    ? extractReliableCoreDomains(payload, projectionDomains)
    : null;
  if (coreDomains) {
    return {
      mode: "core_only",
      payload,
      coreDomains,
      reasons: Array.from(reasons).sort(),
    };
  }

  return {
    mode: "reject",
    payload: null,
    reasons: Array.from(reasons).sort(),
  };
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

type ProjectionCoreDomain = {
  code: Big5ResultPageV2CoreDomainCode;
  score: number;
  band: string;
};

const DISPLAY_CONTENT_KEYS = new Set([
  "title",
  "heading",
  "label",
  "profile_label",
  "scenario_label",
  "summary",
  "short_body",
  "body",
  "description",
  "benefit",
  "cost",
  "common_misread",
  "action",
  "repair",
  "boundary",
  "disclaimer",
  "bullets",
  "items",
  "actions",
]);

const PLACEHOLDER_PATTERNS = [
  /pending[_\s-]*asset[_\s-]*resolution/i,
  /this module is not available yet/i,
  /temporarily unavailable/i,
  /此模块暂未启用/u,
  /待补充/u,
  /占位/u,
];

function asSemanticRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeSemanticText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeSemanticToken(value: unknown): string {
  return normalizeSemanticText(value).toLowerCase().replace(/[\s-]+/g, "_");
}

function localizedContentValue(content: Record<string, unknown>, key: string, locale: "zh" | "en"): string {
  return normalizeSemanticText(content[`${key}_${locale}`] ?? content[key]);
}

function displayKeyBase(key: string): string {
  return key.replace(/_(?:zh|en)$/i, "");
}

function collectDisplayStrings(value: unknown, strings: string[], parentKey = ""): void {
  if (typeof value === "string") {
    if (DISPLAY_CONTENT_KEYS.has(displayKeyBase(parentKey))) {
      const normalized = normalizeSemanticText(value);
      if (normalized) {
        strings.push(normalized);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectDisplayStrings(item, strings, parentKey);
    }
    return;
  }

  const record = asSemanticRecord(value);
  if (!record) {
    return;
  }

  for (const [key, child] of Object.entries(record)) {
    collectDisplayStrings(child, strings, key);
  }
}

function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") {
    return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
  }

  if (Array.isArray(value)) {
    return value.some(containsPlaceholder);
  }

  const record = asSemanticRecord(value);
  return record ? Object.values(record).some(containsPlaceholder) : false;
}

function readReliableProjectionDomains(
  payload: Big5ResultPageV2Payload,
  reasons: Set<string>
): Map<Big5ResultPageV2CoreDomainCode, ProjectionCoreDomain> | null {
  const projection = asSemanticRecord(payload.projection_v2);
  const domains = asSemanticRecord(projection?.domains);
  const domainBands = asSemanticRecord(projection?.domain_bands);
  const qualityStatus = normalizeSemanticToken(projection?.quality_status);
  const normStatus = normalizeSemanticToken(projection?.norm_status);
  if (!qualityStatus || ["d", "invalid", "failed", "low_quality", "unreliable"].includes(qualityStatus)) {
    reasons.add(qualityStatus ? "core_quality_unreliable" : "core_quality_status_missing");
    return null;
  }
  if (["missing", "invalid", "failed", "unavailable", "unreliable"].includes(normStatus)) {
    reasons.add("core_norm_unreliable");
    return null;
  }
  if (!domains || !domainBands) {
    reasons.add("core_projection_missing");
    return null;
  }

  const domainKeys = Object.keys(domains).sort();
  const expectedKeys = [...BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES].sort();
  if (domainKeys.length !== expectedKeys.length || domainKeys.some((key, index) => key !== expectedKeys[index])) {
    reasons.add("core_projection_cardinality_invalid");
    return null;
  }

  const result = new Map<Big5ResultPageV2CoreDomainCode, ProjectionCoreDomain>();
  for (const code of BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES) {
    const domain = asSemanticRecord(domains[code]);
    const score = domain?.score;
    const band = normalizeSemanticToken(domain?.band);
    const projectedBand = normalizeSemanticToken(domainBands[code]);
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100 || !band) {
      reasons.add(`core_projection_${code.toLowerCase()}_invalid`);
      return null;
    }
    if (!projectedBand || projectedBand !== band) {
      reasons.add(`core_projection_${code.toLowerCase()}_band_mismatch`);
      return null;
    }
    result.set(code, { code, score, band });
  }

  const routeBandOrdinals: Record<string, number> = {
    very_low: 1,
    low: 2,
    mid_low: 2,
    mid: 3,
    mid_high: 4,
    high: 4,
    very_high: 5,
  };
  const looksLikeRouteBandScores = Array.from(result.values()).every(
    (domain) => Number.isInteger(domain.score)
      && domain.score >= 1
      && domain.score <= 5
      && routeBandOrdinals[domain.band] === domain.score
  );
  if (looksLikeRouteBandScores) {
    reasons.add("core_projection_contains_route_band_scores");
    return null;
  }

  return result;
}

function traitCodeFromContent(content: Record<string, unknown>): Big5ResultPageV2CoreDomainCode | null {
  const trait = asSemanticRecord(content.trait);
  const code = normalizeSemanticText(trait?.code ?? content.trait_code).toUpperCase();
  return BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.includes(code as Big5ResultPageV2CoreDomainCode)
    ? code as Big5ResultPageV2CoreDomainCode
    : null;
}

function traitBandFromContent(content: Record<string, unknown>): string {
  const band = asSemanticRecord(content.band);
  return normalizeSemanticToken(band?.internal_band ?? content.band);
}

function semanticSlotKey(block: Big5ResultPageV2Block, content: Record<string, unknown>): string {
  const traitCode = traitCodeFromContent(content);
  if (traitCode) {
    return `${block.module_key}:${block.block_kind}:trait:${traitCode}`;
  }

  const scenario = normalizeSemanticToken(content.scenario ?? content.scenario_key);
  if (scenario) {
    return `${block.module_key}:${block.block_kind}:scenario:${scenario}`;
  }

  const coupling = normalizeSemanticToken(content.coupling_key);
  if (coupling) {
    return `${block.module_key}:${block.block_kind}:coupling:${coupling}`;
  }

  const slot = normalizeSemanticToken(content.slot_key);
  return slot ? `${block.module_key}:${block.block_kind}:slot:${slot}` : "";
}

function polarityGroup(value: unknown): "high" | "low" | null {
  const token = normalizeSemanticToken(value);
  if (token === "high" || token === "very_high" || token === "mid_high") {
    return "high";
  }
  if (token === "low" || token === "very_low" || token === "mid_low") {
    return "low";
  }
  return null;
}

function collectFacetPolarities(value: unknown, result: Map<string, Set<"high" | "low">>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectFacetPolarities(item, result));
    return;
  }

  const record = asSemanticRecord(value);
  if (!record) {
    return;
  }

  const facetRecord = asSemanticRecord(record.facet);
  const facet = normalizeSemanticText(facetRecord?.code ?? record.facet_code ?? record.facet).toUpperCase();
  const bandRecord = asSemanticRecord(record.band);
  const polarity = polarityGroup(
    record.polarity
    ?? record.bucket
    ?? record.level
    ?? bandRecord?.internal_band
    ?? (typeof record.band === "string" ? record.band : null)
  );
  if (/^[OCEAN][1-6]$/.test(facet) && polarity) {
    const entries = result.get(facet) ?? new Set<"high" | "low">();
    entries.add(polarity);
    result.set(facet, entries);
  }

  Object.values(record).forEach((child) => collectFacetPolarities(child, result));
}

function collectFacetPolaritiesFromReference(reference: string, result: Map<string, Set<"high" | "low">>): void {
  const normalized = reference.toUpperCase().replace(/-/g, "_");
  const match = normalized.match(/(?:^|[.:_])([OCEAN][1-6])(?:[.:_])(?:VERY_)?(HIGH|LOW)(?:[.:_]|$)/);
  if (!match) {
    return;
  }

  const entries = result.get(match[1]) ?? new Set<"high" | "low">();
  entries.add(match[2] === "HIGH" ? "high" : "low");
  result.set(match[1], entries);
}

function collectSemanticAnomalies(
  payload: Big5ResultPageV2Payload,
  projectionDomains: Map<Big5ResultPageV2CoreDomainCode, ProjectionCoreDomain> | null,
  reasons: Set<string>
): void {
  const blockKeys = new Set<string>();
  const semanticSlots = new Set<string>();
  const visibleStringOwners = new Map<string, string>();
  const facetPolarities = new Map<string, Set<"high" | "low">>();

  for (const payloadModule of payload.modules) {
    for (const block of payloadModule.blocks) {
      if (blockKeys.has(block.block_key)) {
        reasons.add("duplicate_block_key");
      }
      blockKeys.add(block.block_key);

      const content = asSemanticRecord(block.content);
      if (!content) {
        reasons.add("empty_block_content");
        continue;
      }

      if (containsPlaceholder(content)) {
        reasons.add("placeholder_content");
      }

      const displayStrings: string[] = [];
      collectDisplayStrings(content, displayStrings);
      if (displayStrings.length === 0) {
        reasons.add(block.block_kind === "method_boundary" ? "empty_method_block" : "empty_block_content");
      }

      for (const displayString of displayStrings) {
        const normalized = displayString.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
        if (normalized.length < 12) {
          continue;
        }
        const owner = visibleStringOwners.get(normalized);
        if (owner && owner !== block.block_key) {
          reasons.add("duplicate_visible_content");
        } else if (!owner) {
          visibleStringOwners.set(normalized, block.block_key);
        }
      }

      const slot = semanticSlotKey(block, content);
      if (slot) {
        if (semanticSlots.has(slot)) {
          reasons.add("duplicate_semantic_slot");
        }
        semanticSlots.add(slot);
      }

      const traitCode = traitCodeFromContent(content);
      const traitBand = traitBandFromContent(content);
      if (traitCode && projectionDomains && traitBand && projectionDomains.get(traitCode)?.band !== traitBand) {
        reasons.add(`trait_${traitCode.toLowerCase()}_band_mismatch`);
      }

      collectFacetPolarities(content, facetPolarities);
      collectFacetPolaritiesFromReference(block.block_key, facetPolarities);
      for (const registryRef of block.registry_refs ?? []) {
        collectFacetPolaritiesFromReference(registryRef, facetPolarities);
      }
    }
  }

  if (payload.modules.some((module) => module.blocks.length === 0)) {
    reasons.add("empty_module");
  }
  if (Array.from(facetPolarities.values()).some((polarities) => polarities.size > 1)) {
    reasons.add("facet_polarity_conflict");
  }
}

function extractReliableCoreDomains(
  payload: Big5ResultPageV2Payload,
  projectionDomains: Map<Big5ResultPageV2CoreDomainCode, ProjectionCoreDomain>
): Big5ResultPageV2CoreDomain[] | null {
  const hero = payload.modules.find((payloadModule) => payloadModule.module_key === "module_01_hero");
  const traitBlocks = (hero?.blocks ?? []).filter((block) => block.block_kind === "trait_bars");
  const codedTraitBlocks = traitBlocks.filter((block) => {
    const content = asSemanticRecord(block.content);
    return content ? traitCodeFromContent(content) !== null : false;
  });
  if (codedTraitBlocks.length !== BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.length) {
    return extractReliableAggregateCoreDomains(traitBlocks, projectionDomains);
  }

  const byCode = new Map<Big5ResultPageV2CoreDomainCode, Big5ResultPageV2CoreDomain>();
  const summaries = new Set<string>();

  for (const block of codedTraitBlocks) {
    const content = asSemanticRecord(block.content);
    if (!content) {
      continue;
    }
    const code = traitCodeFromContent(content);
    const projection = code ? projectionDomains.get(code) : null;
    if (!code || !projection || traitBandFromContent(content) !== projection.band || byCode.has(code)) {
      return null;
    }

    const trait = asSemanticRecord(content.trait);
    const band = asSemanticRecord(content.band);
    const summaryZh = localizedContentValue(content, "summary", "zh")
      || localizedContentValue(content, "short_body", "zh")
      || localizedContentValue(content, "body", "zh");
    const summaryEn = localizedContentValue(content, "summary", "en")
      || localizedContentValue(content, "short_body", "en")
      || localizedContentValue(content, "body", "en");
    if (!summaryZh && !summaryEn) {
      return null;
    }
    for (const summary of [summaryZh, summaryEn].filter(Boolean)) {
      const normalized = summary.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
      if (summaries.has(normalized)) {
        return null;
      }
      summaries.add(normalized);
    }

    byCode.set(code, {
      code,
      score: projection.score,
      band: projection.band,
      labelZh: normalizeSemanticText(trait?.label_zh ?? trait?.public_name_zh),
      labelEn: normalizeSemanticText(trait?.label_en ?? trait?.public_name_en),
      bandLabelZh: normalizeSemanticText(band?.display_band_label_zh ?? band?.display_band_label),
      bandLabelEn: normalizeSemanticText(band?.display_band_label_en),
      summaryZh,
      summaryEn,
    });
  }

  if (byCode.size !== BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.length) {
    return null;
  }

  return BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.map((code) => byCode.get(code) as Big5ResultPageV2CoreDomain);
}

const CORE_DOMAIN_ZH_CODE_BY_LABEL: Record<string, Big5ResultPageV2CoreDomainCode> = {
  开放性: "O",
  尽责性: "C",
  外向性: "E",
  宜人性: "A",
  情绪性: "N",
  神经质: "N",
};

function extractReliableAggregateCoreDomains(
  traitBlocks: Big5ResultPageV2Block[],
  projectionDomains: Map<Big5ResultPageV2CoreDomainCode, ProjectionCoreDomain>
): Big5ResultPageV2CoreDomain[] | null {
  if (traitBlocks.length !== 1) {
    return null;
  }
  const content = asSemanticRecord(traitBlocks[0].content);
  const rows = Array.isArray(content?.table_zh) ? content.table_zh : null;
  if (!rows || rows.length !== BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.length) {
    return null;
  }

  const byCode = new Map<Big5ResultPageV2CoreDomainCode, Big5ResultPageV2CoreDomain>();
  for (const value of rows) {
    const row = asSemanticRecord(value);
    const labelZh = normalizeSemanticText(row?.["维度"]);
    const code = CORE_DOMAIN_ZH_CODE_BY_LABEL[labelZh];
    const scoreValue = row?.["分数"];
    const score = typeof scoreValue === "number" ? scoreValue : Number(normalizeSemanticText(scoreValue));
    const projection = code ? projectionDomains.get(code) : null;
    const summaryZh = normalizeSemanticText(row?.["说明"]);
    if (!code || !projection || !Number.isFinite(score) || score !== projection.score || !summaryZh || byCode.has(code)) {
      return null;
    }
    byCode.set(code, {
      code,
      score,
      band: projection.band,
      labelZh,
      labelEn: "",
      bandLabelZh: normalizeSemanticText(row?.["位置"]),
      bandLabelEn: "",
      summaryZh,
      summaryEn: "",
    });
  }

  return byCode.size === BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.length
    ? BIG5_RESULT_PAGE_V2_CORE_DOMAIN_CODES.map((code) => byCode.get(code) as Big5ResultPageV2CoreDomain)
    : null;
}
