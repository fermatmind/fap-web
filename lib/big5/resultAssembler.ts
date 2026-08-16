import type {
  Big5PublicProjection,
  Big5ReportEngineV2,
  Big5ReportEngineV2Block,
  ReportResponse,
} from "@/lib/api/v0_3";
import { buildBig5FormDisplayLabel, normalizeBig5FormSummary } from "@/lib/big5/formSummary";
import { getBig5SectionDisplayCopy } from "@/lib/big5/microcopy";
import { resolveBig5PrivateResultAuthority } from "@/lib/big5/privateResultAuthority";
import type { Big5PrivateResultAuthority } from "@/lib/big5/privateResultAuthority";
import {
  BIG5_V1_SAFE_BLOCK_KINDS,
  BIG5_V1_SECTION_BLUEPRINT_MAP,
  BIG5_V1_SECTION_KEYS,
  type Big5V1LockedPreviewPolicy,
  type Big5V1SafeBlockKind,
  type Big5V1SectionKey,
} from "@/lib/big5/sectionBlueprint";
import { BIG5_DOMAIN_LABELS, BIG5_DOMAIN_ORDER, type Big5DomainCode } from "@/lib/big5/taxonomy";
import type { Locale } from "@/lib/i18n/locales";

type ReportBlock = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
  access_level?: string;
  module_code?: string;
  [key: string]: unknown;
};

export type Big5AssembledSection = {
  key: string;
  title: string;
  subtitle?: string;
  order: number;
  page_slot: string;
  access_level: string;
  locked_preview_policy: Big5V1LockedPreviewPolicy;
  locked_preview_description?: string;
  locked_preview_cta?: string;
  module_code?: string;
  blocks: ReportBlock[];
};

export type Big5ResultAssemblerGate = {
  isFreeVariant: boolean;
  modulesAllowed: Set<string>;
  modulesPreview: Set<string>;
  freeSections: Set<string> | null;
};

export type Big5ResultViewModel = {
  authority: Big5PrivateResultAuthority | null;
  projection: Big5PublicProjection | null;
  formSummaryLabel: string | null;
  normsStatus: string;
  qualityLevel: string;
  quality: Record<string, unknown> | null;
  normEvidence: Record<string, unknown> | null;
  dimensions: Array<Record<string, unknown>>;
  plannedSections: Big5AssembledSection[];
  visibleSections: Big5AssembledSection[];
  lockedSections: Big5AssembledSection[];
};

const ENGINE_SCHEMA = "fap.big5.report.v1";
const SOURCE_BLOCK_KIND_SET = new Set([
  "trait_atomic",
  "paragraph",
  "bullets",
  "metric_card",
  "table_row",
  "callout",
  "methodology",
]);
const SAFE_RENDER_KIND_SET = new Set<string>(BIG5_V1_SAFE_BLOCK_KINDS);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function resolveProjection(reportData: ReportResponse): Big5PublicProjection | null {
  if (asRecord(reportData.big5_public_projection_v1)) {
    return reportData.big5_public_projection_v1 ?? null;
  }
  return asRecord(asRecord(reportData.report?._meta)?.big5_public_projection_v1) as Big5PublicProjection | null;
}

function resolveEnginePayload(reportData: ReportResponse): Big5ReportEngineV2 | null {
  const direct = asRecord(reportData.big5_report_engine_v2);
  const nested = asRecord(asRecord(reportData.report?._meta)?.big5_report_engine_v2);
  return (direct ?? nested) as Big5ReportEngineV2 | null;
}

function hasAssetIdentity(block: Big5ReportEngineV2Block): boolean {
  return Boolean(text(block.block_uid) && text(block.block_id));
}

function isUsableCanonicalEngine(payload: Big5ReportEngineV2 | null): payload is Big5ReportEngineV2 {
  if (!payload || payload.schema_version !== ENGINE_SCHEMA || payload.scale_code !== "BIG5_OCEAN") {
    return false;
  }
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  if (sections.length !== BIG5_V1_SECTION_KEYS.length) {
    return false;
  }

  return sections.every((section, index) => {
    const sectionKey = text(section.section_key);
    if (sectionKey !== BIG5_V1_SECTION_KEYS[index]) {
      return false;
    }
    const status = text(section.status);
    const blocks = Array.isArray(section.blocks) ? section.blocks : [];
    if (status === "locked") {
      return blocks.length === 0;
    }
    return status === "populated"
      && blocks.length > 0
      && blocks.every((block) => {
        const sourceKind = text(block.kind).toLowerCase();
        return SOURCE_BLOCK_KIND_SET.has(sourceKind)
          && hasAssetIdentity(block)
          && asRecord(block.resolved_copy) !== null;
      });
  });
}

export function hasUsableBig5ReportEngineV2(reportData: ReportResponse): boolean {
  const authority = resolveBig5PrivateResultAuthority(reportData);
  return authority?.mode === "canonical" && isUsableCanonicalEngine(resolveEnginePayload(reportData));
}

function directItemText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const item = asRecord(value);
  return text(item?.body) || text(item?.title) || text(item?.label);
}

function normalizeTraitBlock(
  block: Big5ReportEngineV2Block,
  sectionKey: Big5V1SectionKey,
  locale: Locale
): ReportBlock | null {
  const copy = asRecord(block.resolved_copy);
  const analytics = asRecord(block.analytics);
  if (!copy || !analytics) return null;
  const code = text(analytics.trait_code).toUpperCase() as Big5DomainCode;
  const domainLabel = BIG5_DOMAIN_ORDER.includes(code) ? BIG5_DOMAIN_LABELS[code][locale] : code;
  const base = {
    id: text(block.block_uid),
    block_uid: text(block.block_uid),
    block_id: text(block.block_id),
    source_engine: "canonical_private_result",
    source_kind: "trait_atomic",
    provenance: block.provenance,
    analytics: block.analytics,
    metric_code: code,
    bucket: text(analytics.band),
    percentile: number(analytics.percentile),
  };

  const output: ReportBlock = sectionKey === "hero_summary"
    ? { ...base, kind: "paragraph", title: text(copy.headline), body: text(copy.body_core) }
    : sectionKey === "domains_overview"
      ? { ...base, kind: "chart", title: domainLabel, body: text(copy.snapshot_line) }
      : sectionKey === "domain_deep_dive"
        ? {
            ...base,
            kind: "metric_card",
            title: domainLabel,
            body: text(copy.definition),
            bullets: [...strings(copy.strengths), ...strings(copy.costs), text(copy.daily_life)].filter(Boolean),
          }
        : sectionKey === "core_portrait"
          ? { ...base, kind: "paragraph", title: text(copy.identity), body: text(copy.default_style) }
          : sectionKey === "norms_comparison"
            ? { ...base, kind: "paragraph", title: domainLabel, body: text(copy.relative_meaning) }
            : sectionKey === "action_plan"
              ? { ...base, kind: "paragraph", title: domainLabel, body: text(copy.priority_hint) }
              : { ...base, kind: "paragraph", title: text(copy.title), body: text(copy.body) };

  return text(output.title) || text(output.body) || strings(output.bullets).length > 0 ? output : null;
}

function normalizeCanonicalBlock(block: Big5ReportEngineV2Block, sectionKey: Big5V1SectionKey, locale: Locale): ReportBlock | null {
  if (text(block.kind).toLowerCase() === "trait_atomic") {
    return normalizeTraitBlock(block, sectionKey, locale);
  }
  const copy = asRecord(block.resolved_copy);
  if (!copy) return null;
  const sourceKind = text(block.kind).toLowerCase();
  const renderKind: Big5V1SafeBlockKind = sourceKind === "methodology"
    ? "callout"
    : SAFE_RENDER_KIND_SET.has(sourceKind)
      ? sourceKind as Big5V1SafeBlockKind
      : "paragraph";
  const items = Array.isArray(copy.items) ? copy.items.map(directItemText).filter(Boolean) : [];
  const body = text(copy.body)
    || text(copy.body_core)
    || text(copy.gloss)
    || text(copy.relative_meaning)
    || text(copy.headline);
  const bullets = [
    ...items,
    text(copy.why_it_matters),
    text(copy.daily_meaning),
    text(copy.access_note),
    text(copy.strength_sentence),
    text(copy.risk_sentence),
    text(copy.action_hook),
  ].filter(Boolean);
  const title = text(copy.title) || text(copy.label_zh) || text(copy.headline) || text(copy.facet_code);
  if (!text(block.component) && !title && !body && bullets.length === 0) return null;

  return {
    id: text(block.block_uid),
    block_uid: text(block.block_uid),
    block_id: text(block.block_id),
    component: text(block.component),
    kind: renderKind,
    title,
    body,
    bullets,
    source_engine: "canonical_private_result",
    source_kind: sourceKind,
    resolved_copy: copy,
    provenance: block.provenance,
    analytics: block.analytics,
    metric_code: text(copy.facet_code) || text(copy.domain_code) || text(copy.scenario_key),
    bucket: text(copy.band) || text(copy.time_horizon) || text(copy.scenario_key),
    percentile: number(copy.percentile) ?? number(copy.facet_percentile) ?? number(copy.domain_percentile),
  };
}

function canonicalSections(reportData: ReportResponse, locale: Locale): Big5AssembledSection[] {
  const payload = resolveEnginePayload(reportData);
  if (!isUsableCanonicalEngine(payload)) return [];
  return payload.sections!.map((section): Big5AssembledSection => {
    const key = section.section_key as Big5V1SectionKey;
    const blueprint = BIG5_V1_SECTION_BLUEPRINT_MAP[key];
    const display = getBig5SectionDisplayCopy(key, locale);
    const locked = section.status === "locked";
    return {
      key,
      title: display.title,
      subtitle: "",
      order: blueprint.order,
      page_slot: blueprint.page_slot,
      access_level: blueprint.access_level,
      locked_preview_policy: "none",
      locked_preview_description: "",
      locked_preview_cta: locale === "zh" ? "解锁报告" : "Unlock report",
      module_code: "canonical_private_result",
      blocks: locked
        ? []
        : (section.blocks ?? [])
          .map((block) => normalizeCanonicalBlock(block, key, locale))
          .filter((block): block is ReportBlock => block !== null),
    };
  });
}

function legacySections(reportData: ReportResponse, locale: Locale): Big5AssembledSection[] {
  const rawSections = Array.isArray(reportData.report?.sections) ? reportData.report.sections : [];
  return rawSections.map((raw, index): Big5AssembledSection => {
    const section = asRecord(raw) ?? {};
    const keyValue = text(section.key) || text(section.section_key);
    const knownKey = BIG5_V1_SECTION_KEYS.includes(keyValue as Big5V1SectionKey)
      ? keyValue as Big5V1SectionKey
      : null;
    const display = knownKey ? getBig5SectionDisplayCopy(knownKey, locale) : null;
    const rawBlocks = Array.isArray(section.blocks) ? section.blocks : [];
    return {
      key: keyValue || `legacy_section_${index + 1}`,
      title: text(section.title) || display?.title || keyValue,
      subtitle: text(section.subtitle),
      order: number(section.order) ?? index + 1,
      page_slot: text(section.page_slot),
      access_level: text(section.access_level) || "free",
      locked_preview_policy: "none",
      locked_preview_description: "",
      locked_preview_cta: locale === "zh" ? "解锁报告" : "Unlock report",
      module_code: text(section.module_code) || "immutable_legacy_snapshot",
      blocks: rawBlocks.map((block) => asRecord(block)).filter((block): block is Record<string, unknown> => block !== null),
    };
  }).filter((section) => section.title && section.blocks.length > 0);
}

function dimensions(projection: Big5PublicProjection | null, locale: Locale): Array<Record<string, unknown>> {
  const traits = Array.isArray(projection?.trait_vector) ? projection.trait_vector : [];
  return BIG5_DOMAIN_ORDER.map((code) => {
    const trait = traits.find((item) => text(item?.key).toUpperCase() === code);
    return {
      code,
      label: BIG5_DOMAIN_LABELS[code][locale],
      percent: number(trait?.percentile) ?? 0,
      winnerLabel: text(trait?.band_label) || text(trait?.band),
    };
  });
}

function shouldLock(section: Big5AssembledSection, gate: Big5ResultAssemblerGate): boolean {
  if (!gate.isFreeVariant) return false;
  if (gate.freeSections) return !gate.freeSections.has(section.key);
  return section.access_level === "paid";
}

export function assembleBig5ResultViewModel({
  locale,
  reportData,
  gate,
}: {
  locale: Locale;
  reportData: ReportResponse;
  gate: Big5ResultAssemblerGate;
}): Big5ResultViewModel {
  const authority = resolveBig5PrivateResultAuthority(reportData);
  const projection = resolveProjection(reportData);
  const engine = resolveEnginePayload(reportData);
  const quality = asRecord(engine?.quality) ?? asRecord(reportData.quality) ?? asRecord(reportData.report?.quality);
  const normEvidence = asRecord(engine?.norm_evidence) ?? asRecord(reportData.norms) ?? asRecord(reportData.report?.norms);
  const plannedSections = authority?.mode === "canonical"
    ? canonicalSections(reportData, locale)
    : authority?.mode === "immutable_legacy_snapshot"
      ? legacySections(reportData, locale)
      : [];
  const visibleSections = plannedSections.filter((section) => !shouldLock(section, gate));
  const lockedSections = plannedSections
    .filter((section) => shouldLock(section, gate))
    .map((section) => ({ ...section, blocks: [] }));

  return {
    authority,
    projection,
    formSummaryLabel: buildBig5FormDisplayLabel(normalizeBig5FormSummary(reportData.big5_form_v1 ?? null), {
      includeScaleCode: true,
      locale,
    }),
    normsStatus: text(normEvidence?.status_label) || text(normEvidence?.status),
    qualityLevel: text(quality?.grade) || text(quality?.level),
    quality,
    normEvidence,
    dimensions: dimensions(projection, locale),
    plannedSections,
    visibleSections,
    lockedSections,
  };
}
