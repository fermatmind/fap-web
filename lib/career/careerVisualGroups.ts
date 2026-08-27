import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";

export const CAREER_VISUAL_GROUP_IDS = [
  "overview",
  "quick-decision",
  "profile",
  "direction-comparison",
  "ai-impact",
  "china-salary",
  "us-salary",
  "fit",
  "risk",
  "path",
  "market-signals",
  "sources",
] as const;

export type CareerVisualGroupId = (typeof CAREER_VISUAL_GROUP_IDS)[number];

export type CareerVisualGroupDefinition = {
  id: CareerVisualGroupId;
  label: string;
  componentIds: readonly CareerDisplayComponentId[];
  contentState?: "enhanced" | "legacy";
  pendingEnrichment?: "display_placeholder" | null;
};

export const CAREER_VISUAL_GROUPS: readonly CareerVisualGroupDefinition[] = [
  { id: "overview", label: "职业概览", componentIds: ["breadcrumb", "hero", "primary_cta"] },
  { id: "quick-decision", label: "快速判断", componentIds: ["fermat_decision_card", "fit_decision_checklist"] },
  { id: "profile", label: "职业画像", componentIds: ["definition_block", "career_ai_description_block", "responsibilities_block", "work_context_block", "career_quick_answers_block", "onet_structured_fields_block"] },
  { id: "direction-comparison", label: "职业方向比较", componentIds: ["adjacent_career_comparison_table"] },
  { id: "ai-impact", label: "AI 影响", componentIds: ["ai_impact_table"] },
  { id: "china-salary", label: "中国大陆薪资参考", componentIds: ["career_snapshot_primary_locale"] },
  { id: "us-salary", label: "美国薪资参考", componentIds: ["career_snapshot_secondary_locale"] },
  { id: "fit", label: "适配地图", componentIds: ["riasec_fit_block", "personality_fit_block"] },
  { id: "risk", label: "风险与变化", componentIds: ["career_risk_cards"] },
  { id: "path", label: "发展路径", componentIds: ["career_path_block", "contract_project_risk_block", "next_steps_block"] },
  { id: "market-signals", label: "市场信号", componentIds: ["market_signal_card"] },
  { id: "sources", label: "常见问题与资料来源", componentIds: ["faq_block", "related_next_pages", "source_card", "review_validity_card", "boundary_notice", "final_cta"] },
] as const;

export type CareerFieldConsumption = {
  componentId: CareerDisplayComponentId | "presentation_v1";
  fieldPattern: string;
  visualGroupId: CareerVisualGroupId;
  duplicate?: "v1.2-explicit-repeat";
};

export const CAREER_FIELD_CONSUMPTION_LEDGER: readonly CareerFieldConsumption[] = [
  { componentId: "breadcrumb", fieldPattern: "breadcrumb.*", visualGroupId: "overview" },
  { componentId: "hero", fieldPattern: "hero.*", visualGroupId: "overview" },
  { componentId: "primary_cta", fieldPattern: "primary_cta.*", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.contract_version", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.design_authority.*", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.title_*", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.{soc_code,onet_code,lead,cta}", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.badges[*]", visualGroupId: "overview", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.badges[*]", visualGroupId: "china-salary", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.stats[*]", visualGroupId: "overview" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.ai_exposure.*", visualGroupId: "overview", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.hero.ai_exposure.note", visualGroupId: "ai-impact", duplicate: "v1.2-explicit-repeat" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.snapshot_callout", visualGroupId: "china-salary" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.salary_boundary", visualGroupId: "china-salary" },
  { componentId: "presentation_v1", fieldPattern: "presentation_v1.notices.usage_boundary[*]", visualGroupId: "sources" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.callout", visualGroupId: "china-salary" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.scene", visualGroupId: "china-salary" },
  { componentId: "career_snapshot_primary_locale", fieldPattern: "career_snapshot_primary_locale.salary.*", visualGroupId: "china-salary" },
  { componentId: "fermat_decision_card", fieldPattern: "fermat_decision_card.*", visualGroupId: "quick-decision" },
  { componentId: "fit_decision_checklist", fieldPattern: "fit_decision_checklist.*", visualGroupId: "quick-decision" },
  { componentId: "definition_block", fieldPattern: "definition_block*", visualGroupId: "profile" },
  { componentId: "career_ai_description_block", fieldPattern: "career_ai_description_block.*", visualGroupId: "profile" },
  { componentId: "responsibilities_block", fieldPattern: "responsibilities_block*", visualGroupId: "profile" },
  { componentId: "work_context_block", fieldPattern: "work_context_block*", visualGroupId: "profile" },
  { componentId: "career_quick_answers_block", fieldPattern: "career_quick_answers_block.*", visualGroupId: "profile" },
  { componentId: "onet_structured_fields_block", fieldPattern: "onet_structured_fields_block.*", visualGroupId: "profile" },
  { componentId: "ai_impact_table", fieldPattern: "ai_impact_table.*", visualGroupId: "ai-impact" },
  { componentId: "career_snapshot_secondary_locale", fieldPattern: "career_snapshot_secondary_locale.*", visualGroupId: "us-salary" },
  { componentId: "riasec_fit_block", fieldPattern: "riasec_fit_block.*", visualGroupId: "fit" },
  { componentId: "personality_fit_block", fieldPattern: "personality_fit_block.*", visualGroupId: "fit" },
  { componentId: "career_risk_cards", fieldPattern: "career_risk_cards.*", visualGroupId: "risk" },
  { componentId: "career_path_block", fieldPattern: "career_path_block*", visualGroupId: "path" },
  { componentId: "contract_project_risk_block", fieldPattern: "contract_project_risk_block*", visualGroupId: "path" },
  { componentId: "next_steps_block", fieldPattern: "next_steps_block.*", visualGroupId: "path" },
  { componentId: "adjacent_career_comparison_table", fieldPattern: "adjacent_career_comparison_table*", visualGroupId: "direction-comparison" },
  { componentId: "market_signal_card", fieldPattern: "market_signal_card.*", visualGroupId: "market-signals" },
  { componentId: "faq_block", fieldPattern: "faq_block.*", visualGroupId: "sources" },
  { componentId: "related_next_pages", fieldPattern: "related_next_pages.*", visualGroupId: "sources" },
  { componentId: "source_card", fieldPattern: "source_card.*", visualGroupId: "sources" },
  { componentId: "review_validity_card", fieldPattern: "review_validity_card.*", visualGroupId: "sources" },
  { componentId: "boundary_notice", fieldPattern: "boundary_notice*", visualGroupId: "sources" },
  { componentId: "final_cta", fieldPattern: "final_cta.*", visualGroupId: "sources" },
] as const;

export function visualGroupForComponent(componentId: CareerDisplayComponentId): CareerVisualGroupId | null {
  return CAREER_VISUAL_GROUPS.find((group) => group.componentIds.includes(componentId))?.id ?? null;
}
