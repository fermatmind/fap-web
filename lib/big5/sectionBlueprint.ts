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
export const BIG5_V1_EMPTY_STATE_POLICIES = ["omit"] as const;
export type Big5V1EmptyStatePolicy = (typeof BIG5_V1_EMPTY_STATE_POLICIES)[number];
export const BIG5_V1_LOCKED_PREVIEW_POLICIES = ["none"] as const;
export type Big5V1LockedPreviewPolicy = (typeof BIG5_V1_LOCKED_PREVIEW_POLICIES)[number];
export const BIG5_V1_ACCESS_LEVELS = ["free", "paid"] as const;
export type Big5V1AccessLevel = (typeof BIG5_V1_ACCESS_LEVELS)[number];

export type Big5V1SectionBlueprint = {
  section_key: Big5V1SectionKey;
  page_slot: string;
  order: number;
  access_level: Big5V1AccessLevel;
  title: string;
  subtitle: string;
  source_fields: readonly string[];
  block_kinds_allowed: readonly Big5V1SafeBlockKind[];
  empty_state_policy: Big5V1EmptyStatePolicy;
  locked_preview_policy: Big5V1LockedPreviewPolicy;
};

const FREE_SECTION_KEYS = new Set<Big5V1SectionKey>([
  "hero_summary",
  "domains_overview",
  "methodology_and_access",
]);

export const BIG5_V1_SECTION_BLUEPRINTS: readonly Big5V1SectionBlueprint[] = BIG5_V1_SECTION_KEYS.map(
  (sectionKey, index) => ({
    section_key: sectionKey,
    page_slot: `page_${index + 1}`,
    order: index + 1,
    access_level: FREE_SECTION_KEYS.has(sectionKey) ? "free" : "paid",
    title: sectionKey,
    subtitle: "",
    source_fields: [],
    block_kinds_allowed: BIG5_V1_SAFE_BLOCK_KINDS,
    empty_state_policy: "omit",
    locked_preview_policy: "none",
  })
);

export const BIG5_V1_SECTION_BLUEPRINT_MAP: Record<Big5V1SectionKey, Big5V1SectionBlueprint> =
  BIG5_V1_SECTION_BLUEPRINTS.reduce((result, section) => {
    result[section.section_key] = section;
    return result;
  }, {} as Record<Big5V1SectionKey, Big5V1SectionBlueprint>);
