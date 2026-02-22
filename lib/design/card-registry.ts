import type { TestListItem } from "@/lib/content";
import {
  DEFAULT_CARD_SPEC,
  isCardVisualKind,
  normalizeCardDensity,
  normalizeCardTone,
  type AssessmentCardSpec,
} from "@/lib/design/card-spec";

const SCALE_SPEC_REGISTRY: Record<string, Partial<AssessmentCardSpec>> = {
  BIG5_OCEAN: { visual: "bars_ocean", tone: "editorial", density: "regular" },
  CLINICAL_COMBO_68: { visual: "wave_clinical", tone: "clinical", density: "dense" },
  SDS_20: { visual: "wave_clinical", tone: "clinical", density: "compact" },
  MBTI: { visual: "spark_minimal", tone: "editorial", density: "regular" },
};

const SLUG_SPEC_REGISTRY: Record<string, Partial<AssessmentCardSpec>> = {
  "enneagram-test": { visual: "grid_nine", tone: "editorial", density: "dense" },
  "disc-personality-test": { visual: "ring_four", tone: "practical", density: "regular" },
  "love-language-test": { visual: "spark_minimal", tone: "warm", density: "regular" },
  "stress-level-check": { visual: "spark_minimal", tone: "practical", density: "compact" },
};

function sanitizeSeed(seed: unknown, fallback: string): string {
  const value = String(seed ?? "").trim();
  if (!value) return fallback;
  return value.slice(0, 64);
}

export function resolveRegistrySpec(test: Pick<TestListItem, "slug" | "scale_code" | "card_visual" | "card_tone" | "card_density" | "card_seed">): AssessmentCardSpec {
  const scaleSpec = test.scale_code ? SCALE_SPEC_REGISTRY[test.scale_code] : undefined;
  const slugSpec = SLUG_SPEC_REGISTRY[test.slug];

  const merged = {
    ...DEFAULT_CARD_SPEC,
    ...(scaleSpec ?? {}),
    ...(slugSpec ?? {}),
  };

  return {
    visual: isCardVisualKind(test.card_visual) ? test.card_visual : merged.visual,
    tone: test.card_tone ? normalizeCardTone(test.card_tone) : merged.tone,
    density: test.card_density ? normalizeCardDensity(test.card_density) : merged.density,
    seed: sanitizeSeed(test.card_seed, sanitizeSeed(test.slug || test.scale_code || DEFAULT_CARD_SPEC.seed, DEFAULT_CARD_SPEC.seed)),
  };
}
