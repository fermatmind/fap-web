export const EVIDENCE_PAGE_FAMILIES = [
  "test_detail",
  "topic_detail",
  "article_detail",
  "personality_detail",
  "career_job_detail",
  "career_recommendation_detail",
  "career_guide",
] as const;

export type EvidencePageFamily = (typeof EVIDENCE_PAGE_FAMILIES)[number];

export const EVIDENCE_BLOCK_TYPES = [
  "quick_answer",
  "definition",
  "comparison",
  "faq",
  "caveat",
  "next_step",
  "related_links",
  "evidence_facts",
  "how_to",
] as const;

export type EvidenceBlockType = (typeof EVIDENCE_BLOCK_TYPES)[number];

export const EVIDENCE_READINESS_STATES = ["ready", "partial", "not_ready", "private_noindex", "blocked"] as const;

export type EvidenceReadinessState = (typeof EVIDENCE_READINESS_STATES)[number];

export type EvidenceRuntimeFamilyStatus = {
  pageFamily: EvidencePageFamily;
  readiness: EvidenceReadinessState;
  sourceType: "answer_surface_v1" | "career_backend_bundle" | "visible_page_content" | "private_noindex";
  requiredBlocks: EvidenceBlockType[];
  notes: string;
};

export const EVIDENCE_RUNTIME_BASELINE: readonly EvidenceRuntimeFamilyStatus[] = [
  {
    pageFamily: "test_detail",
    readiness: "partial",
    sourceType: "visible_page_content",
    requiredBlocks: ["quick_answer", "caveat", "next_step", "faq"],
    notes: "Test detail has visible FAQ/caveat/CTA regions; full quick-answer authority still depends on answer_surface_v1 coverage.",
  },
  {
    pageFamily: "topic_detail",
    readiness: "partial",
    sourceType: "answer_surface_v1",
    requiredBlocks: ["quick_answer", "definition", "comparison", "related_links"],
    notes: "Topic detail can mark answer_surface_v1 blocks visibly; topic fallback exposure remains governed separately.",
  },
  {
    pageFamily: "article_detail",
    readiness: "partial",
    sourceType: "answer_surface_v1",
    requiredBlocks: ["quick_answer", "definition", "next_step"],
    notes: "Article detail can mark visible answer_surface_v1 blocks; Article JSON-LD fallback remains compatibility-only.",
  },
  {
    pageFamily: "personality_detail",
    readiness: "partial",
    sourceType: "answer_surface_v1",
    requiredBlocks: ["quick_answer", "definition", "caveat", "next_step"],
    notes: "Personality fallback projection is schema-suppressed; CMS answer/projection coverage determines readiness.",
  },
  {
    pageFamily: "career_job_detail",
    readiness: "partial",
    sourceType: "career_backend_bundle",
    requiredBlocks: ["quick_answer", "evidence_facts", "caveat", "next_step"],
    notes: "Career job evidence drawers and next-step rail are visible runtime blocks but detailed readiness remains gated.",
  },
  {
    pageFamily: "career_recommendation_detail",
    readiness: "partial",
    sourceType: "career_backend_bundle",
    requiredBlocks: ["quick_answer", "evidence_facts", "caveat", "next_step"],
    notes: "Career recommendation is snapshot-based direction support; evidence must not imply live personalized recommender.",
  },
  {
    pageFamily: "career_guide",
    readiness: "partial",
    sourceType: "answer_surface_v1",
    requiredBlocks: ["quick_answer", "how_to", "caveat", "next_step"],
    notes: "Career guide answer surfaces are visible when CMS supplies them; no new guide content is added.",
  },
];

export function getEvidenceRuntimeFamilyStatus(pageFamily: EvidencePageFamily): EvidenceRuntimeFamilyStatus {
  return EVIDENCE_RUNTIME_BASELINE.find((status) => status.pageFamily === pageFamily) ?? {
    pageFamily,
    readiness: "not_ready",
    sourceType: "visible_page_content",
    requiredBlocks: ["quick_answer"],
    notes: "No Evidence Container runtime baseline is registered for this page family.",
  };
}
