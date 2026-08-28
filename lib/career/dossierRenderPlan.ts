import {
  careerContentV3BlockCopy,
  type CareerContentV3,
  type CareerContentV3Block,
  type CareerContentV3Item,
} from "@/lib/career/contentV3";
import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";
import type { CareerPresentationV2 } from "@/lib/career/presentationV2";

const ITEM_COMPONENT_REGISTRY: Readonly<Record<string, CareerDisplayComponentId>> = {
  "career.item.fermat-decision-card": "fermat_decision_card",
  "career.item.fit-decision-checklist": "fit_decision_checklist",
  "career.item.career-snapshot-primary-locale": "career_snapshot_primary_locale",
  "career.item.career-snapshot-secondary-locale": "career_snapshot_secondary_locale",
  "career.item.riasec-fit-block": "riasec_fit_block",
  "career.item.personality-fit-block": "personality_fit_block",
  "career.item.definition-block": "definition_block",
  "career.item.career-ai-description-block": "career_ai_description_block",
  "career.item.responsibilities-block": "responsibilities_block",
  "career.item.work-context-block": "work_context_block",
  "career.item.career-quick-answers-block": "career_quick_answers_block",
  "career.item.onet-structured-fields-block": "onet_structured_fields_block",
  "career.item.market-signal-card": "market_signal_card",
  "career.item.adjacent-career-comparison-table": "adjacent_career_comparison_table",
  "career.item.ai-impact-table": "ai_impact_table",
  "career.item.career-risk-cards": "career_risk_cards",
  "career.item.career-path-block": "career_path_block",
  "career.item.contract-project-risk-block": "contract_project_risk_block",
  "career.item.next-steps-block": "next_steps_block",
  "career.item.faq-block": "faq_block",
  "career.item.related-next-pages": "related_next_pages",
  "career.item.source-card": "source_card",
  "career.item.review-validity-card": "review_validity_card",
  "career.item.boundary-notice": "boundary_notice",
  "career.item.final-cta": "final_cta",
};

export const CAREER_DOSSIER_PRESENTATION_KINDS = [
  "quick-decision",
  "profile",
  "direction-comparison",
  "ai-impact",
  "salary",
  "fit",
  "decision-journey",
  "sources",
  "source-register",
  "generic",
] as const;

export type CareerDossierPresentationKind = (typeof CAREER_DOSSIER_PRESENTATION_KINDS)[number];

const BLOCK_PRESENTATION_REGISTRY: Readonly<Record<string, CareerDossierPresentationKind>> = {
  "career.block.quick-decision": "quick-decision",
  "career.block.profile": "profile",
  "career.block.direction-comparison": "direction-comparison",
  "career.block.ai-impact": "ai-impact",
  "career.block.china-salary": "salary",
  "career.block.us-salary": "salary",
  "career.block.fit": "fit",
  "career.block.risk": "decision-journey",
  "career.block.path": "decision-journey",
  "career.block.market-signals": "decision-journey",
  "career.block.sources": "sources",
  "career.block.source-register": "source-register",
};

const REGISTERED_BLOCK_COPY_KEYS = new Set([
  ...Object.keys(BLOCK_PRESENTATION_REGISTRY),
  ...Object.keys(ITEM_COMPONENT_REGISTRY).map((copyKey) => copyKey.replace("career.item.", "career.block.")),
]);

const INTERNAL_BLOCK_COPY_KEYS = new Set([
  "career.block.boundary-notice",
  "career.block.review-validity-card",
  "career.block.final-cta",
  "career.block.source-register",
]);

export type CareerDossierRenderPlanBlock = {
  instanceKey: string;
  id: string;
  anchorId: string;
  copyKey: string;
  title: string;
  contentState: CareerContentV3Block["contentState"];
  availability: CareerContentV3Block["availability"];
  items: CareerContentV3Item[];
  declaredComponentIds: CareerDisplayComponentId[];
  presentation: CareerDossierPresentationKind;
  mergeIntoPrevious: boolean;
  visibleInToc: boolean;
  renderable: boolean;
};

export type CareerDossierRenderPlan =
  | {
      source: "content_v3";
      content: CareerContentV3;
      blocks: CareerDossierRenderPlanBlock[];
    }
  | {
      source: "presentation_v2";
      presentation: CareerPresentationV2;
    };

export function careerComponentForV3CopyKey(copyKey: string): CareerDisplayComponentId | null {
  return ITEM_COMPONENT_REGISTRY[copyKey] ?? null;
}

export function careerPresentationForV3CopyKey(copyKey: string): CareerDossierPresentationKind {
  return BLOCK_PRESENTATION_REGISTRY[copyKey] ?? "generic";
}

export function isCareerRegisteredV3BlockCopyKey(copyKey: string): boolean {
  return REGISTERED_BLOCK_COPY_KEYS.has(copyKey);
}

export function isCareerInternalV3BlockCopyKey(
  copyKey: string,
  locale?: CareerContentV3["locale"],
): boolean {
  return INTERNAL_BLOCK_COPY_KEYS.has(copyKey) ||
    (locale === "zh" && copyKey === "career.block.navigation");
}

function declaredComponents(items: readonly CareerContentV3Item[]): CareerDisplayComponentId[] {
  const seen = new Set<CareerDisplayComponentId>();
  const result: CareerDisplayComponentId[] = [];
  for (const item of items) {
    const componentId = careerComponentForV3CopyKey(item.copyKey);
    if (componentId && !seen.has(componentId)) {
      seen.add(componentId);
      result.push(componentId);
    }
  }
  return result;
}

export function buildCareerDossierRenderPlan(
  contentV3: CareerContentV3 | null,
  presentationV2: CareerPresentationV2 | null,
): CareerDossierRenderPlan | null {
  if (contentV3) {
    return {
      source: "content_v3",
      content: contentV3,
      blocks: contentV3.blocks.map((block, index) => {
        const title = careerContentV3BlockCopy(block.copyKey, contentV3.locale)?.title ??
          careerContentV3BlockCopy("career.block.additional", contentV3.locale)!.title;
        const availableItems = block.items.filter((item) => item.availability === "available");
        const renderable = block.renderable && block.availability === "available" && availableItems.length > 0;
        const isInternalBlock = isCareerInternalV3BlockCopyKey(block.copyKey, contentV3.locale);
        return {
          instanceKey: `${block.id}:${index}`,
          id: block.id,
          anchorId: `career-content-${block.id}`,
          copyKey: block.copyKey,
          title,
          contentState: block.contentState,
          availability: block.availability,
          items: block.items,
          declaredComponentIds: declaredComponents(block.items),
          presentation: careerPresentationForV3CopyKey(block.copyKey),
          mergeIntoPrevious: false,
          visibleInToc: renderable && !isInternalBlock,
          renderable,
        };
      }),
    };
  }

  return presentationV2 ? { source: "presentation_v2", presentation: presentationV2 } : null;
}
