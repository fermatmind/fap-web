import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";

const AXIS_ORDER = ["EI", "SN", "TF", "JP", "AT"] as const;
const SCENE_ORDER = ["work", "relationships", "growth", "decision", "stress_recovery", "communication"] as const;

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function orderedEntries<T>(input: Record<string, T>, order: readonly string[]) {
  const seen = new Set<string>();
  const prioritized = order
    .map((key) => [key, input[key]] as const)
    .filter((entry): entry is readonly [string, T] => entry[1] !== undefined)
    .map(([key, value]) => {
      seen.add(key);
      return [key, value] as const;
    });

  const remainder = Object.entries(input)
    .filter(([key]) => !seen.has(key))
    .sort(([left], [right]) => left.localeCompare(right));

  return [...prioritized, ...remainder];
}

export function summarizeMbtiVariantKeys(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return Object.entries(personalization?.variantKeys ?? {})
    .map(([sectionKey, value]) => `${sectionKey}:${normalizeText(value)}`)
    .filter(Boolean)
    .join("|");
}

export function summarizeMbtiSceneFingerprint(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return orderedEntries(personalization?.sceneFingerprint ?? {}, SCENE_ORDER)
    .map(([sceneKey, entry]) => `${sceneKey}:${normalizeText(entry.styleKey)}`)
    .filter(Boolean)
    .join("|");
}

export function summarizeMbtiBoundaryFlags(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return orderedEntries(personalization?.boundaryFlags ?? {}, AXIS_ORDER)
    .filter(([, enabled]) => enabled === true)
    .map(([axisCode]) => axisCode)
    .join("|");
}

export function summarizeMbtiAxisBands(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return orderedEntries(personalization?.axisBands ?? {}, AXIS_ORDER)
    .map(([axisCode, band]) => `${axisCode}:${normalizeText(band)}`)
    .filter(Boolean)
    .join("|");
}

export function summarizeMbtiCloseCallAxes(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return (personalization?.closeCallAxes ?? [])
    .map((axis) => `${normalizeText(axis.axis)}:${normalizeText(axis.band)}:${axis.delta}`)
    .filter(Boolean)
    .join("|");
}

export function summarizeMbtiNeighborTypeKeys(
  personalization?: MbtiResultPersonalizationViewModel | null
): string {
  return (personalization?.neighborTypeKeys ?? []).map((key) => normalizeText(key)).filter(Boolean).join("|");
}
