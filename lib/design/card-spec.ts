export const CARD_VISUAL_KINDS = [
  "bars_ocean",
  "wave_clinical",
  "grid_nine",
  "ring_four",
  "spark_minimal",
] as const;

export type CardVisualKind = (typeof CARD_VISUAL_KINDS)[number];

export type CardTone = "editorial" | "clinical" | "practical" | "warm";
export type CardDensity = "compact" | "regular" | "dense";

export type AssessmentCardSpec = {
  visual: CardVisualKind;
  tone: CardTone;
  density: CardDensity;
  seed: string;
};

export const DEFAULT_CARD_SPEC: AssessmentCardSpec = {
  visual: "spark_minimal",
  tone: "editorial",
  density: "regular",
  seed: "fermatmind",
};

export function isCardVisualKind(value: unknown): value is CardVisualKind {
  return typeof value === "string" && (CARD_VISUAL_KINDS as readonly string[]).includes(value);
}

export function normalizeCardTone(value: unknown): CardTone {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "clinical") return "clinical";
  if (normalized === "practical") return "practical";
  if (normalized === "warm") return "warm";
  return "editorial";
}

export function normalizeCardDensity(value: unknown): CardDensity {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "compact") return "compact";
  if (normalized === "dense") return "dense";
  return "regular";
}
