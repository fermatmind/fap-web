import type { Big5DomainCode } from "@/lib/big5/taxonomy";

export const BIG5_INTERPRETATION_BANDS = ["high", "mid", "low"] as const;
export type Big5InterpretationBand = (typeof BIG5_INTERPRETATION_BANDS)[number];

export type Big5DomainInterpretationEntry = {
  domain_id: Big5DomainCode;
  definition: string;
  bands: Record<Big5InterpretationBand, string>;
  tradeoff: string;
};

export const BIG5_DOMAIN_INTERPRETATION: Record<Big5DomainCode, Big5DomainInterpretationEntry> = {
  O: {
    domain_id: "O",
    definition: "Openness reflects preference for novelty, abstraction, and conceptual exploration.",
    bands: {
      high: "Higher Openness usually supports idea discovery and strategic reframing in ambiguous contexts.",
      mid: "Mid Openness often balances exploration with practical constraints during decision making.",
      low: "Lower Openness often favors proven methods, standardization, and predictable execution.",
    },
    tradeoff: "Higher Openness widens option search but can slow convergence; lower Openness speeds execution but can narrow exploration.",
  },
  C: {
    domain_id: "C",
    definition: "Conscientiousness reflects planning discipline, follow-through, and execution reliability.",
    bands: {
      high: "Higher Conscientiousness usually strengthens planning quality, pacing, and delivery consistency.",
      mid: "Mid Conscientiousness can flex between structured plans and adaptive iteration when context shifts.",
      low: "Lower Conscientiousness may prioritize flexibility and speed over strict structure or routine control.",
    },
    tradeoff: "Higher Conscientiousness increases reliability but may reduce spontaneity; lower Conscientiousness boosts flexibility but can create execution drift.",
  },
  E: {
    domain_id: "E",
    definition: "Extraversion reflects social energy, outward engagement, and activity tempo in group settings.",
    bands: {
      high: "Higher Extraversion typically supports proactive communication, visibility, and momentum in collaborative work.",
      mid: "Mid Extraversion often shifts effectively between independent focus and social coordination.",
      low: "Lower Extraversion usually supports deep-focus output and lower-stimulation work rhythms.",
    },
    tradeoff: "Higher Extraversion increases outward momentum but can dilute deep-focus windows; lower Extraversion protects focus but can reduce visibility.",
  },
  A: {
    domain_id: "A",
    definition: "Agreeableness reflects cooperative orientation, trust tendency, and conflict handling style.",
    bands: {
      high: "Higher Agreeableness often supports trust building, mediation, and stable cross-functional collaboration.",
      mid: "Mid Agreeableness can maintain cooperation while preserving room for selective challenge.",
      low: "Lower Agreeableness may improve direct challenge and boundary defense in high-friction decisions.",
    },
    tradeoff: "Higher Agreeableness improves social cohesion but may reduce confrontation speed; lower Agreeableness sharpens challenge but can increase relational friction.",
  },
  N: {
    domain_id: "N",
    definition: "Neuroticism reflects emotional reactivity, stress sensitivity, and volatility under uncertainty.",
    bands: {
      high: "Higher Neuroticism often amplifies risk scanning and emotional load during pressure cycles.",
      mid: "Mid Neuroticism may maintain useful sensitivity to risk without sustained emotional overload.",
      low: "Lower Neuroticism usually supports emotional steadiness and recovery under operational stress.",
    },
    tradeoff: "Higher Neuroticism can improve early threat detection but raises cognitive noise; lower Neuroticism supports stability but can underweight weak risk signals.",
  },
};

export function normalizeInterpretationBand(value: string): Big5InterpretationBand {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "mid" || normalized === "middle" || normalized === "balanced" || normalized === "moderate") return "mid";
  return "low";
}

export function resolveDomainInterpretation(
  domainId: Big5DomainCode,
  bandRaw: string
): Big5DomainInterpretationEntry & { band: Big5InterpretationBand; band_copy: string } {
  const entry = BIG5_DOMAIN_INTERPRETATION[domainId];
  const band = normalizeInterpretationBand(bandRaw);

  return {
    ...entry,
    band,
    band_copy: entry.bands[band],
  };
}
