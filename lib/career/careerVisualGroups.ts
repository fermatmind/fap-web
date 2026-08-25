import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";

export const CAREER_VISUAL_GROUP_IDS = [
  "hero",
  "snapshot",
  "quick-decision",
  "profile",
  "ai-impact",
  "china-reference",
  "bls-reference",
  "fit-map",
  "risk-change",
  "adjacent-comparison",
  "market-signals",
  "faq-sources-boundaries",
] as const;

export type CareerVisualGroupId = (typeof CAREER_VISUAL_GROUP_IDS)[number];

export type CareerVisualGroupDefinition = {
  id: CareerVisualGroupId;
  label: string;
  componentIds: readonly CareerDisplayComponentId[];
};

export const CAREER_VISUAL_GROUPS: readonly CareerVisualGroupDefinition[] = [
  { id: "hero", label: "职业概览", componentIds: ["breadcrumb", "hero", "primary_cta"] },
  { id: "snapshot", label: "职业快照", componentIds: ["career_snapshot_primary_locale"] },
  { id: "quick-decision", label: "费马快速判断", componentIds: ["fermat_decision_card", "fit_decision_checklist"] },
  { id: "profile", label: "职业画像", componentIds: ["definition_block", "career_ai_description_block", "responsibilities_block", "work_context_block", "career_quick_answers_block", "onet_structured_fields_block"] },
  { id: "ai-impact", label: "AI 影响与应对", componentIds: ["ai_impact_table"] },
  { id: "china-reference", label: "中国大陆薪资参考", componentIds: [] },
  { id: "bls-reference", label: "海外薪资参考：美国 BLS 数据", componentIds: ["career_snapshot_secondary_locale"] },
  { id: "fit-map", label: "适配地图", componentIds: ["riasec_fit_block", "personality_fit_block"] },
  { id: "risk-change", label: "风险与变化", componentIds: ["career_risk_cards", "career_path_block", "contract_project_risk_block", "next_steps_block"] },
  { id: "adjacent-comparison", label: "相邻职业比较", componentIds: ["adjacent_career_comparison_table"] },
  { id: "market-signals", label: "市场信号", componentIds: ["market_signal_card"] },
  { id: "faq-sources-boundaries", label: "常见问题、相关职业与资料来源", componentIds: ["faq_block", "related_next_pages", "source_card", "review_validity_card", "boundary_notice", "final_cta"] },
] as const;

export type CareerFieldConsumption = {
  componentId: CareerDisplayComponentId | "presentation_v1";
  fieldPattern: string;
  visualGroupId: CareerVisualGroupId;
  duplicate?: "v1.2-explicit-repeat";
};

export const CAREER_FIELD_CONSUMPTION_LEDGER: readonly CareerFieldConsumption[] = [
  { componentId: "breadcrumb", fieldPattern: "breadcrumb.*", visualGroupId: "hero" },
  { componentId: "hero", fieldPattern: "hero.*", visualGroupId: "hero" },
  { componentId: "primary_cta", fieldPattern: "primary_cta.*", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.contract_version", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.design_authority.*", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.title_*", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.{soc_code,onet_code,lead,cta}", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.badges[*]", visualGroupId: "hero", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.badges[*]", visualGroupId: "snapshot", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.stats[*]", visualGroupId: "hero" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.ai_exposure.*", visualGroupId: "hero", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.ai_exposure.note", visualGroupId: "ai-impact", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.snapshot_callout", visualGroupId: "snapshot" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.salary_boundary", visualGroupId: "china-reference" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.usage_boundary[*]", visualGroupId: "faq-sources-boundaries" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.callout", visualGroupId: "snapshot" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.scene", visualGroupId: "snapshot" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.salary.*", visualGroupId: "china-reference" },
  { componentId: "fermat_decision_card", fieldPattern: "fermat_decision_card.*", visualGroupId: "quick-decision" },
  { componentId: "fit_decision_checklist", fieldPattern: "fit_decision_checklist.*", visualGroupId: "quick-decision" },
  { componentId: "definition_block", fieldPattern: "definition_block*", visualGroupId: "profile" },
  { componentId: "career_ai_description_block", fieldPattern: "career_ai_description_block.*", visualGroupId: "profile" },
  { componentId: "responsibilities_block", fieldPattern: "responsibilities_block*", visualGroupId: "profile" },
  { componentId: "work_context_block", fieldPattern: "work_context_block*", visualGroupId: "profile" },
  { componentId: "career_quick_answers_block", fieldPattern: "career_quick_answers_block.*", visualGroupId: "profile" },
  { componentId: "onet_structured_fields_block", fieldPattern: "onet_structured_fields_block.*", visualGroupId: "profile" },
  { componentId: "ai_impact_table", fieldPattern: "ai_impact_table.*", visualGroupId: "ai-impact" },
  { componentId: "career_snapshot_secondary_locale", fieldPattern: "career_snapshot_secondary_locale.*", visualGroupId: "bls-reference" },
  { componentId: "riasec_fit_block", fieldPattern: "riasec_fit_block.*", visualGroupId: "fit-map" },
  { componentId: "personality_fit_block", fieldPattern: "personality_fit_block.*", visualGroupId: "fit-map" },
  { componentId: "career_risk_cards", fieldPattern: "career_risk_cards.*", visualGroupId: "risk-change" },
  { componentId: "career_path_block", fieldPattern: "career_path_block*", visualGroupId: "risk-change" },
  { componentId: "contract_project_risk_block", fieldPattern: "contract_project_risk_block*", visualGroupId: "risk-change" },
  { componentId: "next_steps_block", fieldPattern: "next_steps_block.*", visualGroupId: "risk-change" },
  { componentId: "adjacent_career_comparison_table", fieldPattern: "adjacent_career_comparison_table*", visualGroupId: "adjacent-comparison" },
  { componentId: "market_signal_card", fieldPattern: "market_signal_card.*", visualGroupId: "market-signals" },
  { componentId: "faq_block", fieldPattern: "faq_block.*", visualGroupId: "faq-sources-boundaries" },
  { componentId: "related_next_pages", fieldPattern: "related_next_pages.*", visualGroupId: "faq-sources-boundaries" },
  { componentId: "source_card", fieldPattern: "source_card.*", visualGroupId: "faq-sources-boundaries" },
  { componentId: "review_validity_card", fieldPattern: "review_validity_card.*", visualGroupId: "faq-sources-boundaries" },
  { componentId: "boundary_notice", fieldPattern: "boundary_notice*", visualGroupId: "faq-sources-boundaries" },
  { componentId: "final_cta", fieldPattern: "final_cta.*", visualGroupId: "faq-sources-boundaries" },
] as const;

export function visualGroupForComponent(componentId: CareerDisplayComponentId): CareerVisualGroupId | null {
  if (componentId === "career_snapshot_primary_locale") return "snapshot";
  return CAREER_VISUAL_GROUPS.find((group) => group.componentIds.includes(componentId))?.id ?? null;
}
