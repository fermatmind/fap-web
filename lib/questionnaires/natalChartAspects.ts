import { NATAL_BODIES, readNatalCoordinate, type NatalBody } from "./natalChartCoordinates";

// FermatMind's disclosed product convention, not a universal astrological standard.
export const NATAL_ASPECT_ORB_DEGREES = 8;
export const NATAL_MAJOR_ASPECTS = [
  { type: "conjunction", targetDegrees: 0 },
  { type: "sextile", targetDegrees: 60 },
  { type: "square", targetDegrees: 90 },
  { type: "trine", targetDegrees: 120 },
  { type: "opposition", targetDegrees: 180 },
] as const;
export type NatalAspectKind = typeof NATAL_MAJOR_ASPECTS[number]["type"];
export type NatalAspect = {
  id: string;
  first: NatalBody;
  second: NatalBody;
  type: NatalAspectKind;
  targetDegrees: number;
  separationDegrees: number;
  orbDegrees: number;
};
export type NatalAspectsResult = { status: "unavailable" }
  | { status: "complete"; maximumOrbDegrees: number; comparisons: number; aspects: NatalAspect[] };

/** Reads all ten canonical bodies, never rounded sign displays or partial inventories. */
export function calculateNatalAspects(input: unknown): NatalAspectsResult {
  try {
    if (!Array.isArray(input) || input.length !== NATAL_BODIES.length) return { status: "unavailable" };
    const placements: { body: NatalBody; longitude: number }[] = [];
    for (const [index, body] of NATAL_BODIES.entries()) {
      const row: unknown = input[index];
      if (!row || typeof row !== "object" || Array.isArray(row)) return { status: "unavailable" };
      const value = row as Record<string, unknown>;
      if (value.body !== body || !value.coordinate || typeof value.coordinate !== "object" || Array.isArray(value.coordinate)) return { status: "unavailable" };
      const coordinate = readNatalCoordinate((value.coordinate as Record<string, unknown>).longitude);
      if (!coordinate) return { status: "unavailable" };
      placements.push({ body, longitude: coordinate.longitude });
    }
    const aspects: NatalAspect[] = [];
    let comparisons = 0;
    for (let first = 0; first < placements.length; first += 1) {
      for (let second = first + 1; second < placements.length; second += 1) {
        comparisons += 1;
        const a = placements[first], b = placements[second];
        const difference = Math.abs(a.longitude - b.longitude);
        const separationDegrees = Math.min(difference, 360 - difference);
        const match = NATAL_MAJOR_ASPECTS.find(aspect => Math.abs(separationDegrees - aspect.targetDegrees) <= NATAL_ASPECT_ORB_DEGREES);
        if (!match) continue;
        aspects.push({ id: `${a.body}:${b.body}`, first: a.body, second: b.body, type: match.type, targetDegrees: match.targetDegrees,
          separationDegrees, orbDegrees: Math.abs(separationDegrees - match.targetDegrees) });
      }
    }
    return { status: "complete", maximumOrbDegrees: NATAL_ASPECT_ORB_DEGREES, comparisons, aspects };
  } catch { return { status: "unavailable" }; }
}
