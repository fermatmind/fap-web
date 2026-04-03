import { BIG5_V1_SECTION_MICROCOPY } from "@/lib/big5/microcopy";

export const BIG5_V1_SECTION_KEYS = [
  "hero_summary",
  "domains_overview",
  "domain_deep_dive",
  "facet_details",
  "core_portrait",
  "norms_comparison",
  "action_plan",
  "methodology_and_access",
] as const;

export type Big5V1SectionKey = (typeof BIG5_V1_SECTION_KEYS)[number];

export const BIG5_V1_SAFE_BLOCK_KINDS = [
  "paragraph",
  "bullets",
  "metric_card",
  "chart",
  "table_row",
  "callout",
] as const;

export type Big5V1SafeBlockKind = (typeof BIG5_V1_SAFE_BLOCK_KINDS)[number];

export const BIG5_V1_EMPTY_STATE_POLICIES = ["show_callout", "show_minimal"] as const;
export type Big5V1EmptyStatePolicy = (typeof BIG5_V1_EMPTY_STATE_POLICIES)[number];

export const BIG5_V1_LOCKED_PREVIEW_POLICIES = ["none", "teaser_card", "mask_and_cta"] as const;
export type Big5V1LockedPreviewPolicy = (typeof BIG5_V1_LOCKED_PREVIEW_POLICIES)[number];

export const BIG5_V1_ACCESS_LEVELS = ["free", "paid"] as const;
export type Big5V1AccessLevel = (typeof BIG5_V1_ACCESS_LEVELS)[number];

export type Big5V1SectionBlueprint = {
  section_key: Big5V1SectionKey;
  title: string;
  subtitle: string;
  page_slot: string;
  source_fields: readonly string[];
  block_kinds_allowed: readonly Big5V1SafeBlockKind[];
  empty_state_policy: Big5V1EmptyStatePolicy;
  locked_preview_policy: Big5V1LockedPreviewPolicy;
  order: number;
  access_level: Big5V1AccessLevel;
};

export const BIG5_V1_SECTION_BLUEPRINTS: readonly Big5V1SectionBlueprint[] = [
  {
    section_key: "hero_summary",
    title: BIG5_V1_SECTION_MICROCOPY.hero_summary.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.hero_summary.subtitle,
    page_slot: "page_1",
    source_fields: ["report.summary", "explainability_summary", "dominant_traits"],
    block_kinds_allowed: ["paragraph", "callout"],
    empty_state_policy: "show_callout",
    locked_preview_policy: "none",
    order: 1,
    access_level: "free",
  },
  {
    section_key: "domains_overview",
    title: BIG5_V1_SECTION_MICROCOPY.domains_overview.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.domains_overview.subtitle,
    page_slot: "page_2",
    source_fields: ["trait_vector", "trait_bands", "report.sections"],
    block_kinds_allowed: ["chart", "metric_card", "paragraph"],
    empty_state_policy: "show_minimal",
    locked_preview_policy: "none",
    order: 2,
    access_level: "free",
  },
  {
    section_key: "domain_deep_dive",
    title: BIG5_V1_SECTION_MICROCOPY.domain_deep_dive.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.domain_deep_dive.subtitle,
    page_slot: "page_3",
    source_fields: ["trait_vector", "trait_bands", "dominant_traits", "ordered_section_keys"],
    block_kinds_allowed: ["metric_card", "paragraph", "bullets"],
    empty_state_policy: "show_callout",
    locked_preview_policy: "teaser_card",
    order: 3,
    access_level: "paid",
  },
  {
    section_key: "facet_details",
    title: BIG5_V1_SECTION_MICROCOPY.facet_details.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.facet_details.subtitle,
    page_slot: "page_4",
    source_fields: ["facet_vector", "top_facets_summary_v1", "report.sections"],
    block_kinds_allowed: ["table_row", "metric_card", "paragraph"],
    empty_state_policy: "show_minimal",
    locked_preview_policy: "teaser_card",
    order: 4,
    access_level: "paid",
  },
  {
    section_key: "core_portrait",
    title: BIG5_V1_SECTION_MICROCOPY.core_portrait.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.core_portrait.subtitle,
    page_slot: "page_5",
    source_fields: ["dominant_traits", "explainability_summary", "controlled_narrative_v1", "cultural_calibration_v1"],
    block_kinds_allowed: ["paragraph", "bullets", "callout"],
    empty_state_policy: "show_callout",
    locked_preview_policy: "mask_and_cta",
    order: 5,
    access_level: "paid",
  },
  {
    section_key: "norms_comparison",
    title: BIG5_V1_SECTION_MICROCOPY.norms_comparison.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.norms_comparison.subtitle,
    page_slot: "page_6",
    source_fields: ["comparative_v1", "norms", "trait_vector"],
    block_kinds_allowed: ["chart", "metric_card", "paragraph", "callout"],
    empty_state_policy: "show_callout",
    locked_preview_policy: "mask_and_cta",
    order: 6,
    access_level: "paid",
  },
  {
    section_key: "action_plan",
    title: BIG5_V1_SECTION_MICROCOPY.action_plan.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.action_plan.subtitle,
    page_slot: "page_7",
    source_fields: ["action_plan_summary", "trait_bands", "dominant_traits"],
    block_kinds_allowed: ["bullets", "paragraph", "callout"],
    empty_state_policy: "show_callout",
    locked_preview_policy: "mask_and_cta",
    order: 7,
    access_level: "paid",
  },
  {
    section_key: "methodology_and_access",
    title: BIG5_V1_SECTION_MICROCOPY.methodology_and_access.title,
    subtitle: BIG5_V1_SECTION_MICROCOPY.methodology_and_access.subtitle,
    page_slot: "page_8",
    source_fields: ["quality", "norms", "modules_allowed", "modules_preview"],
    block_kinds_allowed: ["callout", "paragraph", "bullets"],
    empty_state_policy: "show_minimal",
    locked_preview_policy: "none",
    order: 8,
    access_level: "free",
  },
] as const;

export const BIG5_V1_SECTION_BLUEPRINT_MAP: Record<Big5V1SectionKey, Big5V1SectionBlueprint> =
  BIG5_V1_SECTION_BLUEPRINTS.reduce(
    (acc, blueprint) => {
      acc[blueprint.section_key] = blueprint;
      return acc;
    },
    {} as Record<Big5V1SectionKey, Big5V1SectionBlueprint>
  );
