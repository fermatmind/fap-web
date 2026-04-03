export const BIG5_V1_MICROCOPY_SECTION_KEYS = [
  "hero_summary",
  "domains_overview",
  "domain_deep_dive",
  "facet_details",
  "core_portrait",
  "norms_comparison",
  "action_plan",
  "methodology_and_access",
] as const;

export type Big5V1MicrocopySectionKey = (typeof BIG5_V1_MICROCOPY_SECTION_KEYS)[number];

type SectionCopy = {
  title: string;
  subtitle: string;
};

export const BIG5_V1_SECTION_MICROCOPY: Record<Big5V1MicrocopySectionKey, SectionCopy> = {
  hero_summary: {
    title: "Profile Summary",
    subtitle: "A compact overview of your Big Five profile and headline signals.",
  },
  domains_overview: {
    title: "Domains Overview",
    subtitle: "Five-domain distribution with percentile-oriented context.",
  },
  domain_deep_dive: {
    title: "Domain Deep Dive",
    subtitle: "Focused read on domain-level strengths and potential trade-offs.",
  },
  facet_details: {
    title: "Facet Details",
    subtitle: "Facet-level signals arranged for quick interpretation and follow-up.",
  },
  core_portrait: {
    title: "Core Portrait",
    subtitle: "Dominant trait structure and calibrated profile framing.",
  },
  norms_comparison: {
    title: "Norms Comparison",
    subtitle: "Norming and comparative context for percentile-based reading.",
  },
  action_plan: {
    title: "Action Plan",
    subtitle: "Near-term actions derived from your current trait profile.",
  },
  methodology_and_access: {
    title: "Methodology and Access",
    subtitle: "Method boundaries, quality notes, and module access state.",
  },
};

export const BIG5_V1_STATE_MICROCOPY = {
  locked_preview: {
    title: "Unlock Full Insight",
    subtitle: "Upgrade to open the full section content and recommendations.",
    cta: "Unlock full report",
  },
  norms: {
    missing: "Percentile views are temporarily unavailable because current norms status is MISSING.",
    calibrated: "Norms are calibrated for percentile interpretation.",
  },
  quality: {
    a: "Quality level A: response quality is stable.",
    b: "Quality level B: interpretation remains usable with moderate caution.",
    c: "Quality level C: interpret with caution due to lower response quality.",
  },
} as const;

export const BIG5_V1_AUX_MICROCOPY = {
  access_label: "Access status",
  compare_label: "Comparison context",
  method_label: "Method boundary",
  method_note: "Use this report as structured decision support, not as an identity verdict.",
} as const;
