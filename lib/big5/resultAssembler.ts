import type { Big5PublicProjection, Big5ReportEngineV2, Big5ReportEngineV2Block, ReportResponse } from "@/lib/api/v0_3";
import { buildBig5FormDisplayLabel, normalizeBig5FormSummary } from "@/lib/big5/formSummary";
import {
  BIG5_NORMS_INTERPRETATION,
  buildBig5NormsStandoutLine,
  resolveDomainInterpretation,
  resolveFacetGlossary,
  selectBig5ActionPlan,
} from "@/lib/big5/interpretation";
import {
  BIG5_V1_SECTION_MICROCOPY,
  BIG5_V1_SHELL_MICROCOPY,
  BIG5_V1_STATE_MICROCOPY,
  getBig5SectionDisplayCopy,
} from "@/lib/big5/microcopy";
import {
  BIG5_V1_SAFE_BLOCK_KINDS,
  BIG5_V1_SECTION_BLUEPRINTS,
  type Big5V1SectionKey,
  type Big5V1LockedPreviewPolicy,
  type Big5V1SafeBlockKind,
  type Big5V1SectionBlueprint,
} from "@/lib/big5/sectionBlueprint";
import { BIG5_DOMAIN_LABELS, BIG5_DOMAIN_ORDER, BIG5_FACET_LABELS, type Big5DomainCode } from "@/lib/big5/taxonomy";
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
  projection: Big5PublicProjection | null;
  formSummaryLabel: string | null;
  normsStatus: string;
  qualityLevel: string;
  dimensions: Array<Record<string, unknown>>;
  plannedSections: Big5AssembledSection[];
  visibleSections: Big5AssembledSection[];
  lockedSections: Big5AssembledSection[];
};

const SAFE_BLOCK_KIND_SET = new Set<string>(BIG5_V1_SAFE_BLOCK_KINDS);

const SECTION_ALIASES: Record<string, readonly string[]> = {
  hero_summary: ["hero_summary", "summary"],
  domains_overview: ["domains_overview"],
  domain_deep_dive: ["domain_deep_dive", "traits.why_this_profile"],
  facet_details: ["facet_details", "facet_table", "top_facets"],
  core_portrait: ["core_portrait", "traits.overview"],
  norms_comparison: ["norms_comparison", "comparative"],
  action_plan: ["action_plan", "growth.next_actions", "action.plan"],
  methodology_and_access: ["methodology_and_access", "methodology", "access"],
};

const V2_SCHEMA_VERSION = "fap.big5.report.v1";

const V2_SECTION_KEY_SET = new Set(BIG5_V1_SECTION_BLUEPRINTS.map((blueprint) => blueprint.section_key));

const V2_REQUIRED_PROVENANCE_FIELDS = [
  "atomic_refs",
  "modifier_refs",
  "synergy_refs",
  "facet_refs",
  "action_refs",
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function joinTextParts(parts: unknown[], separator = " "): string {
  return parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(separator);
}

function getCopyInjections(copy: Record<string, unknown>): Record<string, unknown> {
  return asRecord(copy.injections) ?? {};
}

function getBlockTraitCode(block: Big5ReportEngineV2Block): string {
  const analytics = asRecord(block.analytics);
  const copy = asRecord(block.resolved_copy) ?? {};
  const blockId = normalizeText(block.block_id);
  const fromId = blockId.match(/atomic_([OCEAN])_/i)?.[1] ?? "";
  return normalizeText(analytics?.trait_code, copy.trait_code, fromId).toUpperCase();
}

function getBlockPercentile(block: Big5ReportEngineV2Block): number | null {
  const analytics = asRecord(block.analytics);
  const copy = asRecord(block.resolved_copy) ?? {};
  return normalizeNumber(analytics?.percentile ?? copy.percentile ?? copy.domain_percentile ?? copy.facet_percentile);
}

function getBlockBand(block: Big5ReportEngineV2Block): string {
  const analytics = asRecord(block.analytics);
  const copy = asRecord(block.resolved_copy) ?? {};
  return normalizeText(analytics?.band, copy.band, copy.domain_band, copy.facet_band);
}

function formatPercentileValue(value: number | null, locale: Locale): string {
  if (value === null) {
    return "";
  }

  return locale === "zh" ? `百分位 ${value}` : `Percentile ${value}`;
}

function resolveBig5Projection(reportData: ReportResponse): Big5PublicProjection | null {
  if (reportData.big5_public_projection_v1 && typeof reportData.big5_public_projection_v1 === "object") {
    return reportData.big5_public_projection_v1;
  }

  const reportMeta = asRecord(reportData.report?._meta);
  const projection = asRecord(reportMeta?.big5_public_projection_v1);
  return projection as Big5PublicProjection | null;
}

function getPayloadSections(reportData: ReportResponse, projection: Big5PublicProjection | null): Record<string, Record<string, unknown>> {
  const sectionsByKey: Record<string, Record<string, unknown>> = {};

  const reportSections = asArray<Record<string, unknown>>(reportData.report?.sections);
  for (const section of reportSections) {
    const key = normalizeText(section.key).toLowerCase();
    if (key) {
      sectionsByKey[key] = section;
    }
  }

  if (Object.keys(sectionsByKey).length > 0) {
    return sectionsByKey;
  }

  const projectionSections = asArray<Record<string, unknown>>(projection?.sections);
  for (const section of projectionSections) {
    const key = normalizeText(section.key).toLowerCase();
    if (key) {
      sectionsByKey[key] = section;
    }
  }

  return sectionsByKey;
}

function inferKind(block: Record<string, unknown>, fallbackSectionKey: string): string {
  const explicit = normalizeText(block.kind).toLowerCase();
  if (explicit) {
    return explicit;
  }

  if (fallbackSectionKey === "facet_details") return "table_row";
  if (fallbackSectionKey === "domains_overview") return "chart";
  if (fallbackSectionKey === "action_plan") return "bullets";
  return "paragraph";
}

function normalizeBlockWithAllowlist(
  block: Record<string, unknown>,
  sectionKey: string,
  allowed: readonly Big5V1SafeBlockKind[]
): ReportBlock | null {
  const kind = inferKind(block, sectionKey);
  if (!SAFE_BLOCK_KIND_SET.has(kind) || !allowed.includes(kind as Big5V1SafeBlockKind)) {
    return null;
  }

  return {
    ...block,
    kind,
    title: normalizeText(block.title),
    body: normalizeText(block.body, block.desc, block.text),
    access_level: normalizeText(block.access_level).toLowerCase(),
    module_code: normalizeText(block.module_code).toLowerCase(),
    bullets: normalizeStringArray(block.bullets),
    tips: normalizeStringArray(block.tips),
    tags: normalizeStringArray(block.tags),
  };
}

function hasValidV2Provenance(block: Big5ReportEngineV2Block): boolean {
  const provenance = asRecord(block.provenance);
  if (!provenance) {
    return false;
  }

  return V2_REQUIRED_PROVENANCE_FIELDS.every((field) => Array.isArray(provenance[field]));
}

function resolveBig5ReportEngineV2(reportData: ReportResponse): Big5ReportEngineV2 | null {
  const candidate = asRecord(reportData.big5_report_engine_v2);
  if (!candidate) {
    return null;
  }

  if (normalizeText(candidate.schema_version) !== V2_SCHEMA_VERSION) {
    return null;
  }
  if (normalizeText(candidate.scale_code).toUpperCase() !== "BIG5_OCEAN") {
    return null;
  }

  const sections = asArray<NonNullable<Big5ReportEngineV2["sections"]>[number]>(candidate.sections);
  if (sections.length < BIG5_V1_SECTION_BLUEPRINTS.length) {
    return null;
  }

  const seenSections = new Set<string>();
  for (const section of sections) {
    const sectionKey = normalizeText(section.section_key).toLowerCase();
    if (!V2_SECTION_KEY_SET.has(sectionKey as Big5V1SectionKey)) {
      return null;
    }
    if (seenSections.has(sectionKey)) {
      return null;
    }
    seenSections.add(sectionKey);

    const blocks = asArray<Big5ReportEngineV2Block>(section.blocks);
    if (blocks.length === 0) {
      return null;
    }

    const blocksAreUsable = blocks.every((block) => {
      const copy = asRecord(block.resolved_copy);
      return Boolean(
        normalizeText(block.kind) &&
          normalizeText(block.component) &&
          normalizeText(block.block_id) &&
          normalizeText(block.block_uid) &&
          copy &&
          hasValidV2Provenance(block)
      );
    });
    if (!blocksAreUsable) {
      return null;
    }
  }

  const requiredSectionsPresent = BIG5_V1_SECTION_BLUEPRINTS.every((blueprint) => seenSections.has(blueprint.section_key));
  if (!requiredSectionsPresent) {
    return null;
  }

  if (!Array.isArray(candidate.sections)) {
    return null;
  }

  return candidate as Big5ReportEngineV2;
}

export function hasUsableBig5ReportEngineV2(reportData: ReportResponse): boolean {
  return resolveBig5ReportEngineV2(reportData) !== null;
}

function getV2TraitBlockTitle(block: Big5ReportEngineV2Block, locale: Locale): string {
  const traitCode = getBlockTraitCode(block);
  const domain = BIG5_DOMAIN_ORDER.find((code) => code === traitCode) ?? null;
  if (domain) {
    return getDomainLabel(domain, locale);
  }

  const copy = asRecord(block.resolved_copy) ?? {};
  return normalizeText(copy.title, copy.headline, traitCode);
}

function normalizeV2TraitAtomicBlock(
  block: Big5ReportEngineV2Block,
  sectionKey: Big5V1SectionKey,
  locale: Locale
): ReportBlock | null {
  const copy = asRecord(block.resolved_copy);
  if (!copy) {
    return null;
  }

  const injections = getCopyInjections(copy);
  const title = getV2TraitBlockTitle(block, locale);
  const percentileText = formatPercentileValue(getBlockPercentile(block), locale);
  const band = getBlockBand(block);
  const baseBlock = {
    id: normalizeText(block.block_uid),
    block_uid: normalizeText(block.block_uid),
    block_id: normalizeText(block.block_id),
    component: normalizeText(block.component),
    source_engine: "big5_report_engine_v2",
    provenance: block.provenance,
    analytics: block.analytics,
    metric_code: getBlockTraitCode(block),
    bucket: band,
  };

  if (sectionKey === "domains_overview") {
    return {
      ...baseBlock,
      kind: "chart",
      title,
      body: joinTextParts([percentileText, copy.snapshot_line]),
    };
  }

  if (sectionKey === "domain_deep_dive") {
    return {
      ...baseBlock,
      kind: "metric_card",
      title,
      body: joinTextParts([percentileText, copy.definition, copy.daily_life, injections.intensity_sentence]),
      bullets: [
        ...normalizeStringArray(copy.strengths).map((item) => (locale === "zh" ? `优势：${item}` : `Strength: ${item}`)),
        ...normalizeStringArray(copy.costs).map((item) => (locale === "zh" ? `代价：${item}` : `Trade-off: ${item}`)),
      ],
    };
  }

  if (sectionKey === "norms_comparison") {
    return {
      ...baseBlock,
      kind: "metric_card",
      title,
      body: joinTextParts([percentileText, copy.relative_meaning, injections.compare_sentence]),
    };
  }

  if (sectionKey === "core_portrait") {
    return {
      ...baseBlock,
      kind: "paragraph",
      title,
      body: joinTextParts([copy.identity, copy.default_style, injections.load_sentence]),
    };
  }

  if (sectionKey === "action_plan") {
    return {
      ...baseBlock,
      kind: "paragraph",
      title,
      body: joinTextParts([copy.priority_hint, injections.urgency_sentence]),
    };
  }

  return {
    ...baseBlock,
    kind: "paragraph",
    title: normalizeText(copy.title, copy.headline, title),
    body: joinTextParts([copy.headline, injections.headline_extension, copy.body_core]),
  };
}

function normalizeV2Items(value: unknown): string[] {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return normalizeText(item);
      }
      const record = asRecord(item);
      if (!record) {
        return "";
      }
      const bucket = normalizeText(record.bucket);
      const title = normalizeText(record.title);
      const body = normalizeText(record.body);
      return joinTextParts([
        bucket ? `${bucket}｜` : "",
        title ? `${title}：` : "",
        body,
      ], "");
    })
    .filter(Boolean);
}

function normalizeV2GenericBlock(
  block: Big5ReportEngineV2Block,
  sectionKey: Big5V1SectionKey
): ReportBlock | null {
  const copy = asRecord(block.resolved_copy);
  if (!copy) {
    return null;
  }

  const rawKind = normalizeText(block.kind).toLowerCase();
  const baseBlock = {
    id: normalizeText(block.block_uid),
    block_uid: normalizeText(block.block_uid),
    block_id: normalizeText(block.block_id),
    component: normalizeText(block.component),
    source_engine: "big5_report_engine_v2",
    provenance: block.provenance,
    analytics: block.analytics,
    metric_code: normalizeText(copy.facet_code, copy.domain_code, copy.scenario_key),
    bucket: normalizeText(copy.band, copy.time_horizon, copy.scenario_key),
  };

  if (rawKind === "methodology") {
    return {
      ...baseBlock,
      kind: "callout",
      title: normalizeText(copy.title),
      body: joinTextParts([copy.body, copy.access_note]),
    };
  }

  if (rawKind === "bullets") {
    return {
      ...baseBlock,
      kind: "bullets",
      title: normalizeText(copy.title),
      body: normalizeV2Items(copy.items).join("\n"),
    };
  }

  if (rawKind === "table_row") {
    const percentile = normalizeNumber(copy.percentile);
    return {
      ...baseBlock,
      kind: "table_row",
      title: normalizeText(copy.label_zh, copy.title, copy.facet_code),
      body: joinTextParts([
        formatPercentileValue(percentile, "zh"),
        copy.gloss,
        copy.daily_meaning,
        copy.why_it_matters,
      ]),
      bucket: normalizeText(copy.band, copy.facet_code),
    };
  }

  if (rawKind === "metric_card") {
    const deltaAbs = normalizeNumber(copy.delta_abs);
    return {
      ...baseBlock,
      kind: "metric_card",
      title: normalizeText(copy.title, copy.facet_code, copy.domain_code),
      body: joinTextParts([
        copy.domain_percentile !== undefined ? `领域百分位 ${copy.domain_percentile}` : "",
        copy.facet_percentile !== undefined ? `facet 百分位 ${copy.facet_percentile}` : "",
        deltaAbs !== null ? `偏离 ${deltaAbs}` : "",
        copy.body,
        copy.why_it_matters,
      ]),
    };
  }

  if (rawKind === "callout") {
    return {
      ...baseBlock,
      kind: "callout",
      title: normalizeText(copy.title, copy.headline),
      body: joinTextParts([copy.body, copy.strength_sentence, copy.risk_sentence, copy.action_hook]),
    };
  }

  return {
    ...baseBlock,
    kind: rawKind === "paragraph" ? "paragraph" : "paragraph",
    title: normalizeText(copy.title, copy.headline),
    body: joinTextParts([
      copy.body,
      copy.body_core,
      copy.relative_meaning,
      copy.why_it_matters,
      copy.access_note,
    ]),
  };
}

function normalizeBig5ReportEngineV2Block(
  block: Big5ReportEngineV2Block,
  sectionKey: Big5V1SectionKey,
  locale: Locale,
  allowed: readonly Big5V1SafeBlockKind[]
): ReportBlock | null {
  const normalized = normalizeText(block.kind).toLowerCase() === "trait_atomic"
    ? normalizeV2TraitAtomicBlock(block, sectionKey, locale)
    : normalizeV2GenericBlock(block, sectionKey);
  if (!normalized) {
    return null;
  }

  const kind = normalizeText(normalized.kind).toLowerCase();
  if (!SAFE_BLOCK_KIND_SET.has(kind) || !allowed.includes(kind as Big5V1SafeBlockKind)) {
    return null;
  }

  const body = normalizeText(normalized.body);
  const title = normalizeText(normalized.title);
  if (!body && !title) {
    return null;
  }

  return {
    ...normalized,
    kind,
    title,
    body,
    bullets: normalizeStringArray(normalized.bullets),
    tips: normalizeStringArray(normalized.tips),
    tags: normalizeStringArray(normalized.tags),
  };
}

function assembleBig5SectionsFromReportEngineV2(
  reportData: ReportResponse,
  locale: Locale
): Big5AssembledSection[] | null {
  const payload = resolveBig5ReportEngineV2(reportData);
  if (!payload) {
    return null;
  }

  const payloadSections = payload.sections ?? [];
  const sectionsByKey = new Map<string, NonNullable<Big5ReportEngineV2["sections"]>[number]>();
  for (const section of payloadSections) {
    sectionsByKey.set(normalizeText(section.section_key).toLowerCase(), section);
  }

  const assembled = BIG5_V1_SECTION_BLUEPRINTS
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((blueprint): Big5AssembledSection | null => {
      const rawSection = sectionsByKey.get(blueprint.section_key);
      if (!rawSection) {
        return null;
      }

      const blocks = asArray<Big5ReportEngineV2Block>(rawSection.blocks)
        .map((block) => normalizeBig5ReportEngineV2Block(block, blueprint.section_key, locale, blueprint.block_kinds_allowed))
        .filter((block): block is ReportBlock => block !== null);
      if (blocks.length === 0) {
        return null;
      }
      const displayCopy = getBig5SectionDisplayCopy(blueprint.section_key, locale);

      return {
        key: blueprint.section_key,
        title: displayCopy.title,
        subtitle: displayCopy.subtitle,
        order: blueprint.order,
        page_slot: blueprint.page_slot,
        access_level: blueprint.access_level,
        locked_preview_policy: blueprint.locked_preview_policy,
        locked_preview_description: resolveLockedPreviewDescription(blueprint.locked_preview_policy, locale),
        locked_preview_cta: locale === "zh" ? "解锁完整报告" : BIG5_V1_STATE_MICROCOPY.locked_preview.cta,
        module_code: "big5_report_engine_v2",
        blocks,
      } satisfies Big5AssembledSection;
    })
    .filter((section): section is Big5AssembledSection => section !== null);

  return assembled.length === BIG5_V1_SECTION_BLUEPRINTS.length ? assembled : null;
}

function getFacetLabel(code: string, locale: Locale): string {
  const fallback = BIG5_FACET_LABELS[code];
  if (fallback) {
    return fallback[locale];
  }
  return code;
}

function getDomainLabel(code: Big5DomainCode, locale: Locale): string {
  return BIG5_DOMAIN_LABELS[code][locale];
}

function getFacetPositionLine(percentile: number | null, locale: Locale) {
  const percentileText = formatPercentileValue(percentile, locale);
  if (!percentileText) {
    return locale === "zh" ? "当前位置以现有结果信号为准。" : "Current position is inferred from the available result signal.";
  }

  return locale === "zh"
    ? `你当前大致位于${percentileText.replace("约 ", "")}。`
    : `You currently sit at ${percentileText}.`;
}

function getFacetBehaviorLine(
  percentile: number | null,
  facetGlossary: ReturnType<typeof resolveFacetGlossary>,
  locale: Locale
) {
  if (!facetGlossary) {
    return locale === "zh" ? "这项倾向会在具体场景里决定你更自然的反应方式。" : "This facet shapes the reaction style that feels more natural in real situations.";
  }

  if (percentile !== null && percentile <= 35) {
    return facetGlossary.low_cue;
  }
  if (percentile !== null && percentile >= 65) {
    return facetGlossary.high_cue;
  }

  return locale === "zh"
    ? `这项倾向更可能选择性地出现，而不是在所有场景都很强。${facetGlossary.daily_signal}`
    : `This tendency is more likely to show up selectively than everywhere. ${facetGlossary.daily_signal}`;
}

function buildSyntheticBlocks(
  blueprint: Big5V1SectionBlueprint,
  reportData: ReportResponse,
  projection: Big5PublicProjection | null,
  locale: Locale
): ReportBlock[] {
  const explainability = asRecord(projection?.explainability_summary);
  const actionPlan = asRecord(projection?.action_plan_summary);
  const comparative = asRecord(reportData.comparative_v1 ?? projection?.comparative_v1);
  const traitVector = asArray<Record<string, unknown>>(projection?.trait_vector);
  const facetVector = asArray<Record<string, unknown>>(projection?.facet_vector);
  const dominantTraits = asArray<Record<string, unknown>>(projection?.dominant_traits);
  const traitBands = asRecord(projection?.trait_bands) ?? {};

  if (blueprint.section_key === "hero_summary") {
    const headline = normalizeText(
      reportData.summary,
      reportData.report?.summary,
      explainability?.headline
    );
    if (!headline) {
      return [];
    }
    return [{ kind: "paragraph", title: getBig5SectionDisplayCopy("hero_summary", locale).title, body: headline }];
  }

  if (blueprint.section_key === "domains_overview") {
    const blocks: ReportBlock[] = [];
    for (const code of BIG5_DOMAIN_ORDER) {
      const trait = traitVector.find((item) => normalizeText(item.key).toUpperCase() === code);
      if (!trait) continue;
      const percentile = normalizeNumber(trait.percentile);
      const body = formatPercentileValue(percentile, locale) || normalizeText(trait.band_label, trait.band);
      blocks.push({
        kind: "chart",
        metric_code: code,
        title: getDomainLabel(code, locale),
        body,
      });
    }
    return blocks;
  }

  if (blueprint.section_key === "domain_deep_dive") {
    const blocks: ReportBlock[] = [];
    for (const code of BIG5_DOMAIN_ORDER) {
      const trait = traitVector.find((item) => normalizeText(item.key).toUpperCase() === code);
      const bandRaw = normalizeText(traitBands[code], trait?.band, trait?.band_label, trait?.bucket);
      if (!trait && !bandRaw) {
        continue;
      }
      const interpretation = resolveDomainInterpretation(code, bandRaw);
      const percentile = normalizeNumber(trait?.percentile);
      const percentileText = formatPercentileValue(percentile, locale);
      const positionLine = [
        interpretation.band_copy,
        percentileText
          ? locale === "zh"
            ? `相对位置大致在${percentileText.replace("约 ", "")}。`
            : `Relative position sits at ${percentileText}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
      blocks.push({
        kind: "metric_card",
        metric_code: code,
        title: getDomainLabel(code, locale),
        body: [interpretation.definition, positionLine].filter(Boolean).join(" "),
        bullets: [
          locale === "zh" ? `优势：${interpretation.upside}` : `Upside: ${interpretation.upside}`,
          locale === "zh" ? `代价：${interpretation.tradeoff}` : `Trade-off: ${interpretation.tradeoff}`,
          locale === "zh" ? `现实场景：${interpretation.scene_line}` : `In daily life: ${interpretation.scene_line}`,
        ],
      });
    }
    return blocks;
  }

  if (blueprint.section_key === "facet_details") {
    const sortedFacets = facetVector
      .slice()
      .sort((left, right) => (normalizeNumber(right.percentile) ?? 0) - (normalizeNumber(left.percentile) ?? 0));

    const focusFacetPool = [
      ...sortedFacets.slice(0, 3),
      ...sortedFacets.slice(-2),
    ].filter((item, index, list) => index === list.findIndex((entry) => normalizeText(entry.key) === normalizeText(item.key)));

    const blocks: ReportBlock[] = [];

    if (focusFacetPool.length > 0) {
      blocks.push({
        kind: "paragraph",
        title: locale === "zh" ? "重点维度面" : "Standout facets",
        body:
          locale === "zh"
            ? "先看最突出的 3 个 facets 和最需要留意的 2 个 facets。这里不是在给你贴标签，而是在说明哪些细部倾向更容易在现实中跳出来。"
            : "Start with the three facets that stand out most and the two that deserve extra attention. The goal is not to label you, but to show which narrower tendencies are most likely to show up in real situations.",
      });

      focusFacetPool.forEach((item) => {
        const code = normalizeText(item.key).toUpperCase();
        const facetGlossary = resolveFacetGlossary(code);
        const percentile = normalizeNumber(item.percentile);
        blocks.push({
          kind: "metric_card",
          metric_code: code,
          title: facetGlossary?.label ?? getFacetLabel(code, locale),
          body: [
            getFacetPositionLine(percentile, locale),
            facetGlossary?.gloss,
          ]
            .filter(Boolean)
            .join(" "),
          bullets: [
            facetGlossary?.why_it_matters,
            getFacetBehaviorLine(percentile, facetGlossary, locale),
            facetGlossary?.daily_signal,
          ].filter(Boolean) as string[],
        });
      });
    }

    if (sortedFacets.length > 0) {
      blocks.push({
        kind: "paragraph",
        title: locale === "zh" ? "完整术语表" : "Complete glossary",
        body:
          locale === "zh"
            ? "下面这部分保留全部 facets 的短释义和轻提示，用来帮助你快速定位每个细部倾向。"
            : "The full glossary keeps every available facet in view with a short definition and one light prompt, so you can quickly place each narrower tendency.",
      });

      sortedFacets.forEach((item) => {
        const code = normalizeText(item.key).toUpperCase();
        const facetGlossary = resolveFacetGlossary(code);
        blocks.push({
          kind: "table_row",
          metric_code: code,
          title: facetGlossary?.label ?? getFacetLabel(code, locale),
          body: [
            getFacetPositionLine(normalizeNumber(item.percentile), locale),
            facetGlossary?.gloss,
            facetGlossary?.hint,
          ]
            .filter(Boolean)
            .join(" "),
          bucket: normalizeText(item.bucket),
        } satisfies ReportBlock);
      });
    }

    return blocks;
  }

  if (blueprint.section_key === "core_portrait") {
    const dominant = dominantTraits
      .slice()
      .sort((left, right) => (normalizeNumber(left.rank) ?? 99) - (normalizeNumber(right.rank) ?? 99))
      .slice(0, 2)
      .map((item) => {
        const code = normalizeText(item.key).toUpperCase();
        const domain = BIG5_DOMAIN_ORDER.find((entry) => entry === code) ?? null;
        const label = normalizeText(item.label, domain ? getDomainLabel(domain, locale) : code);
        const percentile = normalizeNumber(item.percentile);
        if (!domain) {
          return {
            domain,
            label,
            insight: "",
            percentileText: formatPercentileValue(percentile, locale),
            upside: "",
            tradeoff: "",
            impression: "",
          };
        }
        const interpretation = resolveDomainInterpretation(
          domain,
          normalizeText(traitBands[domain], item.band, item.band_label, item.bucket)
        );
        return {
          domain,
          label,
          insight: interpretation.band_copy,
          percentileText: formatPercentileValue(percentile, locale),
          upside: interpretation.upside,
          tradeoff: interpretation.tradeoff,
          impression: interpretation.impression,
        };
      });

    const headline = normalizeText(
      explainability?.headline,
      reportData.summary,
      reportData.report?.summary,
      locale === "zh"
        ? "当前画像由若干核心特质共同驱动，请结合场景理解。"
        : "The current profile is shaped by a small set of dominant trait signals."
    );

    const blocks: ReportBlock[] = [
      {
        kind: "paragraph",
        title: getBig5SectionDisplayCopy("core_portrait", locale).title,
        body: [
          headline,
          dominant.length > 0
            ? locale === "zh"
              ? `当前画像主要由${dominant.map((item) => item.label).join("和")}这几个倾向共同拉动。`
              : `The clearest pull in this profile comes from ${dominant.map((item) => item.label).join(" and ")}.`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
    ];

    if (dominant.length > 0) {
      blocks.push({
        kind: "callout",
        title: locale === "zh" ? "默认风格" : "Default style",
        body: dominant
          .map((item) => item.impression)
          .filter(Boolean)
          .join(" "),
      });
      blocks.push({
        kind: "callout",
        title: locale === "zh" ? "这种结构的优势" : "Where this structure helps",
        body: dominant
          .map((item) => item.upside)
          .filter(Boolean)
          .join(" "),
      });
      blocks.push({
        kind: "callout",
        title: locale === "zh" ? "这种结构的代价" : "Where this structure can cost you",
        body: dominant
          .map((item) => item.tradeoff)
          .filter(Boolean)
          .join(" "),
      });
    }

    return blocks;
  }

  if (blueprint.section_key === "norms_comparison") {
    const sortedTraits = traitVector
      .slice()
      .sort((left, right) => (normalizeNumber(right.percentile) ?? 0) - (normalizeNumber(left.percentile) ?? 0));
    const leadTrait = sortedTraits[0];
    const lowTrait = sortedTraits.at(-1);
    const leadPercentile = normalizeNumber(leadTrait?.percentile);
    if (leadPercentile === null) {
      return [];
    }
    return [
      {
        kind: "paragraph",
        title: getBig5SectionDisplayCopy("norms_comparison", locale).title,
        body:
          normalizeText(reportData.norms?.status).toUpperCase() === "CALIBRATED"
            ? BIG5_NORMS_INTERPRETATION.context
            : BIG5_NORMS_INTERPRETATION.context_missing,
      },
      {
        kind: "paragraph",
        title: locale === "zh" ? "百分位怎么读" : "How to read the percentile",
        body: BIG5_NORMS_INTERPRETATION.percentile,
      },
      {
        kind: "metric_card",
        metric_code: normalizeText(leadTrait?.key).toUpperCase(),
        title: locale === "zh" ? "最突出的相对位置" : "What stands out most",
        body: buildBig5NormsStandoutLine({
          leadTrait: normalizeText(leadTrait?.key).toUpperCase(),
          leadPercentile,
          lowTrait: normalizeText(lowTrait?.key).toUpperCase(),
          lowPercentile: normalizeNumber(lowTrait?.percentile),
        }),
      },
      {
        kind: "callout",
        title: locale === "zh" ? "边界提示" : "Boundary note",
        body: BIG5_NORMS_INTERPRETATION.boundary,
      },
    ];
  }

  if (blueprint.section_key === "action_plan") {
    const actionSelection = selectBig5ActionPlan({
      dominantTraits,
      traitBands,
      seedActions: normalizeStringArray(actionPlan?.actions),
    });
    const actions = [...actionSelection.leverage, ...actionSelection.watch_out, ...actionSelection.experiment];
    if (actions.length === 0) {
      return [];
    }
    const headline = normalizeText(actionPlan?.headline);
    const blocks: ReportBlock[] = [];
    if (headline) {
      blocks.push({
        kind: "paragraph",
        title: getBig5SectionDisplayCopy("action_plan", locale).title,
        body: headline,
      });
    }
    if (actionSelection.leverage.length > 0) {
      blocks.push({
        kind: "bullets",
        title: locale === "zh" ? "继续放大的 2 点" : "Keep amplifying",
        body: actionSelection.leverage.join("\n"),
      });
    }
    if (actionSelection.watch_out.length > 0) {
      blocks.push({
        kind: "bullets",
        title: locale === "zh" ? "最值得留意的 2 点" : "Watch closely",
        body: actionSelection.watch_out.join("\n"),
      });
    }
    if (actionSelection.experiment.length > 0) {
      blocks.push({
        kind: "bullets",
        title: locale === "zh" ? "现在就能试的动作" : "Try this next",
        body: actionSelection.experiment.join("\n"),
      });
    }
    return blocks;
  }

  if (blueprint.section_key === "methodology_and_access") {
    const qualityLevel = normalizeText(reportData.quality?.level).toUpperCase();
    const normsStatus = normalizeText(reportData.norms?.status).toUpperCase();
    const isPreview = reportData.locked === true || normalizeText(reportData.variant).toLowerCase() === "free";
    const qualityKey = qualityLevel.toLowerCase() as "a" | "b" | "c";
    const qualityCopy = BIG5_V1_STATE_MICROCOPY.quality[qualityKey] ?? "";
    const normsCopy = normsStatus === "MISSING"
      ? BIG5_V1_STATE_MICROCOPY.norms.missing
      : BIG5_V1_STATE_MICROCOPY.norms.calibrated;
    const scopeCopy = locale === "zh"
      ? isPreview
        ? BIG5_V1_SHELL_MICROCOPY.methodology.preview_scope_zh
        : BIG5_V1_SHELL_MICROCOPY.methodology.full_scope_zh
      : isPreview
        ? BIG5_V1_SHELL_MICROCOPY.methodology.preview_scope_en
        : BIG5_V1_SHELL_MICROCOPY.methodology.full_scope_en;
    const methodologyTitle = locale === "zh"
      ? BIG5_V1_SHELL_MICROCOPY.methodology.title_zh
      : BIG5_V1_SHELL_MICROCOPY.methodology.title_en;
    const methodNote = locale === "zh"
      ? BIG5_V1_SHELL_MICROCOPY.methodology.method_note_zh
      : BIG5_V1_SHELL_MICROCOPY.methodology.method_note_en;
    const bullets = [qualityCopy, normsCopy, methodNote].filter(Boolean);

    if (!scopeCopy && bullets.length === 0) {
      return [];
    }

    const blocks: ReportBlock[] = [
      {
        kind: "callout",
        title: methodologyTitle,
        body: scopeCopy,
      },
    ];

    if (bullets.length > 0) {
      blocks.push({
        kind: "bullets",
        title: getBig5SectionDisplayCopy("methodology_and_access", locale).title,
        body: bullets.join("\n"),
      });
    }

    return blocks;
  }

  const fallbackHeadline = normalizeText(explainability?.headline, actionPlan?.headline);
  if (fallbackHeadline) {
    return [{ kind: "paragraph", body: fallbackHeadline }];
  }

  return [];
}

function resolveLockedPreviewDescription(
  policy: Big5V1LockedPreviewPolicy,
  locale: Locale
): string {
  if (locale === "zh") {
    if (policy === "teaser_card") return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.teaser_description_zh;
    if (policy === "mask_and_cta") return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.mask_description_zh;
    return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.none_description_zh;
  }

  if (policy === "teaser_card") return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.teaser_description_en;
  if (policy === "mask_and_cta") return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.mask_description_en;
  return BIG5_V1_SHELL_MICROCOPY.section_locked_policy.none_description_en;
}

function hasSourceField(
  sourceField: string,
  reportData: ReportResponse,
  projection: Big5PublicProjection | null,
  sectionsByKey: Record<string, Record<string, unknown>>
): boolean {
  switch (sourceField) {
    case "report.summary":
      return Boolean(normalizeText(reportData.summary, reportData.report?.summary));
    case "report.sections":
      return Object.keys(sectionsByKey).length > 0;
    case "trait_vector":
      return asArray(projection?.trait_vector).length > 0;
    case "facet_vector":
      return asArray(projection?.facet_vector).length > 0;
    case "trait_bands":
      return Boolean(asRecord(projection?.trait_bands) && Object.keys(asRecord(projection?.trait_bands) ?? {}).length > 0);
    case "dominant_traits":
      return asArray(projection?.dominant_traits).length > 0;
    case "comparative_v1":
      return Boolean(reportData.comparative_v1 || projection?.comparative_v1);
    case "norms":
      return Boolean(asRecord(reportData.norms));
    case "quality":
      return Boolean(asRecord(reportData.quality));
    case "ordered_section_keys":
      return asArray(projection?.ordered_section_keys).length > 0;
    case "top_facets_summary_v1":
      return asArray((reportData as { top_facets_summary_v1?: { items?: unknown[] } }).top_facets_summary_v1?.items).length > 0
        || asArray(projection?.facet_vector).length > 0;
    case "explainability_summary":
      return Boolean(asRecord(projection?.explainability_summary));
    case "action_plan_summary":
      return Boolean(asRecord(projection?.action_plan_summary));
    case "modules_allowed":
      return asArray(reportData.modules_allowed).length > 0;
    case "modules_preview":
      return asArray(reportData.modules_preview).length > 0;
    case "controlled_narrative_v1":
      return Boolean(asRecord(projection?.controlled_narrative_v1));
    case "cultural_calibration_v1":
      return Boolean(asRecord(projection?.cultural_calibration_v1));
    default:
      return false;
  }
}

function shouldForceSectionLocked(section: Big5AssembledSection, gate: Big5ResultAssemblerGate): boolean {
  if (!gate.isFreeVariant) {
    return false;
  }

  const key = normalizeText(section.key).toLowerCase();
  if (gate.freeSections && key && !gate.freeSections.has(key)) {
    return true;
  }

  const accessLevel = normalizeText(section.access_level).toLowerCase();
  if (accessLevel === "paid") {
    return true;
  }

  const moduleCode = normalizeText(section.module_code).toLowerCase();
  if (!moduleCode || moduleCode === "core_free" || moduleCode === "big5_core") {
    return false;
  }

  if (gate.modulesAllowed.size > 0) {
    return !gate.modulesAllowed.has(moduleCode);
  }

  return !gate.modulesPreview.has(moduleCode);
}

function isBig5CoreModuleCode(moduleCode: string): boolean {
  return !moduleCode || moduleCode === "core_free" || moduleCode === "big5_core";
}

function isBlockVisibleInGate(block: ReportBlock, gate: Big5ResultAssemblerGate): boolean {
  if (!gate.isFreeVariant) {
    return true;
  }

  const accessLevel = normalizeText(block.access_level).toLowerCase();
  if (accessLevel === "paid") {
    return false;
  }

  const moduleCode = normalizeText(block.module_code).toLowerCase();
  if (isBig5CoreModuleCode(moduleCode)) {
    return true;
  }

  if (accessLevel === "preview") {
    return gate.modulesPreview.has(moduleCode);
  }

  if (gate.modulesAllowed.size > 0) {
    return gate.modulesAllowed.has(moduleCode);
  }

  return gate.modulesPreview.has(moduleCode);
}

function filterVisibleSectionBlocks(section: Big5AssembledSection, gate: Big5ResultAssemblerGate): Big5AssembledSection {
  if (!gate.isFreeVariant) {
    return section;
  }

  return {
    ...section,
    blocks: section.blocks.filter((block) => isBlockVisibleInGate(block, gate)),
  };
}

function redactLockedSectionBlocks(section: Big5AssembledSection): Big5AssembledSection {
  return {
    ...section,
    blocks: [],
  };
}

function buildSectionFromBlueprint(
  blueprint: Big5V1SectionBlueprint,
  reportData: ReportResponse,
  projection: Big5PublicProjection | null,
  sectionsByKey: Record<string, Record<string, unknown>>,
  locale: Locale
): Big5AssembledSection | null {
  const hasAnySource = blueprint.source_fields.some((field) => hasSourceField(field, reportData, projection, sectionsByKey));
  if (!hasAnySource) {
    return null;
  }

  const aliases = SECTION_ALIASES[blueprint.section_key] ?? [blueprint.section_key];
  const rawSection = aliases
    .map((alias) => sectionsByKey[alias.toLowerCase()])
    .find((item) => Boolean(item)) ?? null;

  const rawBlocks = asArray<Record<string, unknown>>(rawSection?.blocks);
  const filteredRawBlocks = rawBlocks
    .map((block) => normalizeBlockWithAllowlist(block, blueprint.section_key, blueprint.block_kinds_allowed))
    .filter((block): block is ReportBlock => block !== null);

  const fallbackBlocks = filteredRawBlocks.length > 0
    ? filteredRawBlocks
    : buildSyntheticBlocks(blueprint, reportData, projection, locale)
      .map((block) => normalizeBlockWithAllowlist(block as Record<string, unknown>, blueprint.section_key, blueprint.block_kinds_allowed))
      .filter((block): block is ReportBlock => block !== null);

  let blocks = fallbackBlocks;
  const displayCopy = getBig5SectionDisplayCopy(blueprint.section_key, locale);
  if (blocks.length === 0) {
    if (blueprint.empty_state_policy === "show_callout") {
      blocks = [
        {
          kind: "callout",
          title: displayCopy.title,
          body: locale === "zh" ? "当前数据不足，暂无法展示该模块。" : "This section is temporarily unavailable for the current data.",
        },
      ];
    } else {
      blocks = [
        {
          kind: "paragraph",
          title: displayCopy.title,
          body: displayCopy.subtitle,
        },
      ];
    }
  }

  const title = locale === "zh"
    ? displayCopy.title
    : normalizeText(rawSection?.title, displayCopy.title, blueprint.title);
  const accessLevel = normalizeText(rawSection?.access_level, blueprint.access_level).toLowerCase();
  const lockedPreviewPolicy = blueprint.locked_preview_policy;

  return {
    key: blueprint.section_key,
    title,
    subtitle: locale === "zh"
      ? displayCopy.subtitle
      : normalizeText(rawSection?.subtitle, displayCopy.subtitle, blueprint.subtitle),
    order: blueprint.order,
    page_slot: blueprint.page_slot,
    access_level: accessLevel || blueprint.access_level,
    locked_preview_policy: lockedPreviewPolicy,
    locked_preview_description: resolveLockedPreviewDescription(lockedPreviewPolicy, locale),
    locked_preview_cta: locale === "zh" ? "解锁完整报告" : BIG5_V1_STATE_MICROCOPY.locked_preview.cta,
    module_code: normalizeText(rawSection?.module_code),
    blocks,
  };
}

function buildDimensions(projection: Big5PublicProjection | null, locale: Locale): Array<Record<string, unknown>> {
  const traitVector = asArray<Record<string, unknown>>(projection?.trait_vector);
  const traitByCode = new Map<string, Record<string, unknown>>();
  for (const trait of traitVector) {
    const code = normalizeText(trait.key).toUpperCase();
    if (code) {
      traitByCode.set(code, trait);
    }
  }

  return BIG5_DOMAIN_ORDER.map((code) => {
    const trait = traitByCode.get(code) ?? null;
    return {
      code,
      label: getDomainLabel(code, locale),
      percent: normalizeNumber(trait?.percentile) ?? 0,
      winnerLabel: normalizeText(trait?.band_label, trait?.band),
    };
  });
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
  const projection = resolveBig5Projection(reportData);
  const v2Sections = assembleBig5SectionsFromReportEngineV2(reportData, locale);
  const sectionsByKey = v2Sections ? {} : getPayloadSections(reportData, projection);
  const plannedSections = v2Sections
    ?? BIG5_V1_SECTION_BLUEPRINTS
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((blueprint) => buildSectionFromBlueprint(blueprint, reportData, projection, sectionsByKey, locale))
      .filter((section): section is Big5AssembledSection => section !== null);

  const visibleSections = plannedSections
    .filter((section) => !shouldForceSectionLocked(section, gate))
    .map((section) => filterVisibleSectionBlocks(section, gate))
    .filter((section) => section.blocks.length > 0 || normalizeText(section.access_level).toLowerCase() !== "paid");
  const lockedSections = plannedSections
    .filter((section) => shouldForceSectionLocked(section, gate))
    .map((section) => redactLockedSectionBlocks(section));

  return {
    projection,
    formSummaryLabel: buildBig5FormDisplayLabel(normalizeBig5FormSummary(reportData.big5_form_v1 ?? null), {
      includeScaleCode: true,
      locale,
    }),
    normsStatus: normalizeText(reportData.norms?.status, asRecord(reportData.report?.norms)?.status),
    qualityLevel: normalizeText(reportData.quality?.level, asRecord(reportData.report?.quality)?.level),
    dimensions: buildDimensions(projection, locale),
    plannedSections,
    visibleSections,
    lockedSections,
  };
}
