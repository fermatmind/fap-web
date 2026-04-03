import { BIG5_FACETS, BIG5_FACET_LABELS, type Big5DomainCode } from "@/lib/big5/taxonomy";

export type Big5FacetGlossaryEntry = {
  facet_code: string;
  label: string;
  domain: Big5DomainCode;
  gloss: string;
  hint: string;
};

const FACET_GLOSSARY_COPY: Record<string, { gloss: string; hint: string }> = {
  O1: {
    gloss: "Tendency to work with imagination, alternatives, and hypothetical scenarios.",
    hint: "Useful for ideation-heavy tasks; anchor with execution checkpoints.",
  },
  O2: {
    gloss: "Sensitivity to aesthetics, design quality, and experiential nuance.",
    hint: "Translate taste judgments into explicit decision criteria.",
  },
  O3: {
    gloss: "Breadth and granularity of emotional experience in interpretation.",
    hint: "Label emotional signals early to avoid delayed processing.",
  },
  O4: {
    gloss: "Preference for novelty, change, and uncertain operating conditions.",
    hint: "Use bounded experiments when entering unfamiliar contexts.",
  },
  O5: {
    gloss: "Orientation toward abstract reasoning and conceptual complexity.",
    hint: "Pair abstraction with concrete deliverables for team alignment.",
  },
  O6: {
    gloss: "Willingness to question conventions and revise default assumptions.",
    hint: "Challenge assumptions, then document replacement rules clearly.",
  },
  C1: {
    gloss: "Confidence in executing tasks and meeting role demands.",
    hint: "Convert confidence into measurable weekly commitments.",
  },
  C2: {
    gloss: "Preference for structure, order, and process clarity.",
    hint: "Keep systems lightweight to avoid over-structuring.",
  },
  C3: {
    gloss: "Commitment to obligations, standards, and accountability.",
    hint: "Define ownership boundaries early in cross-team work.",
  },
  C4: {
    gloss: "Drive for accomplishment, progress velocity, and performance goals.",
    hint: "Balance ambition with recovery windows to sustain quality.",
  },
  C5: {
    gloss: "Capacity to persist through boredom, friction, and delayed reward.",
    hint: "Use pre-commitment and environment design to protect consistency.",
  },
  C6: {
    gloss: "Deliberation level before acting under uncertainty.",
    hint: "Set explicit decision deadlines to prevent analysis drag.",
  },
  E1: {
    gloss: "Warmth and ease in initiating social contact.",
    hint: "Leverage first-contact strength to improve stakeholder onboarding.",
  },
  E2: {
    gloss: "Comfort with group interaction frequency and social density.",
    hint: "Protect solo focus blocks when collaboration load rises.",
  },
  E3: {
    gloss: "Tendency to speak up, influence direction, and take social lead.",
    hint: "Combine assertiveness with explicit listening loops.",
  },
  E4: {
    gloss: "Baseline activity tempo and preference for movement across tasks.",
    hint: "Align workload pacing with energy peaks, not urgency alone.",
  },
  E5: {
    gloss: "Need for stimulation, novelty intensity, and risk engagement.",
    hint: "Channel novelty seeking into bounded project experiments.",
  },
  E6: {
    gloss: "Frequency and visibility of positive affect in social settings.",
    hint: "Use positive affect strategically, not as a substitute for clarity.",
  },
  A1: {
    gloss: "Default trust tendency when evaluating others' intentions.",
    hint: "Pair trust with explicit expectation setting.",
  },
  A2: {
    gloss: "Preference for honesty norms and ethical consistency.",
    hint: "State non-negotiable standards before conflict points emerge.",
  },
  A3: {
    gloss: "Readiness to prioritize others' needs and cooperative support.",
    hint: "Use capacity limits to prevent over-extension.",
  },
  A4: {
    gloss: "Conflict de-escalation tendency and compromise orientation.",
    hint: "Preserve key boundaries while maintaining cooperation.",
  },
  A5: {
    gloss: "Humility level in status expression and self-presentation.",
    hint: "Ensure contributions remain visible despite modest style.",
  },
  A6: {
    gloss: "Sensitivity to others' distress and compassion-driven response.",
    hint: "Ground empathy decisions in role scope and constraints.",
  },
  N1: {
    gloss: "Anxiety sensitivity and anticipatory worry under uncertainty.",
    hint: "Convert worry into explicit risk registers and response plans.",
  },
  N2: {
    gloss: "Irritability and anger reactivity in frustrating conditions.",
    hint: "Use cooldown protocols before high-stakes feedback.",
  },
  N3: {
    gloss: "Low-mood susceptibility during prolonged stress periods.",
    hint: "Track energy trends and trigger support early.",
  },
  N4: {
    gloss: "Self-consciousness intensity in evaluative social contexts.",
    hint: "Pre-rehearse high-visibility moments to reduce friction.",
  },
  N5: {
    gloss: "Impulse regulation under emotional or reward pressure.",
    hint: "Add delay rules before irreversible decisions.",
  },
  N6: {
    gloss: "Perceived coping capacity when stressors accumulate quickly.",
    hint: "Break complex stressors into staged response routines.",
  },
};

export const BIG5_FACET_GLOSSARY: readonly Big5FacetGlossaryEntry[] = BIG5_FACETS.map((facet) => {
  const copy = FACET_GLOSSARY_COPY[facet.facet_code] ?? {
    gloss: "Facet-level signal relevant to practical behavior in context.",
    hint: "Interpret with current context and role demands.",
  };

  return {
    facet_code: facet.facet_code,
    label: BIG5_FACET_LABELS[facet.facet_code]?.en ?? facet.facet_code,
    domain: facet.domain,
    gloss: copy.gloss,
    hint: copy.hint,
  };
});

const FACET_GLOSSARY_MAP: Record<string, Big5FacetGlossaryEntry> = BIG5_FACET_GLOSSARY.reduce(
  (acc, entry) => {
    acc[entry.facet_code] = entry;
    return acc;
  },
  {} as Record<string, Big5FacetGlossaryEntry>
);

export function resolveFacetGlossary(facetCode: string): Big5FacetGlossaryEntry | null {
  const normalized = facetCode.trim().toUpperCase();
  return FACET_GLOSSARY_MAP[normalized] ?? null;
}
