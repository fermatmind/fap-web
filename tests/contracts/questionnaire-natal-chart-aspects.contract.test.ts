import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NATAL_BODIES, readNatalCoordinate } from "@/lib/questionnaires/natalChartCoordinates";
import { calculateNatalAspects, type NatalAspectsResult } from "@/lib/questionnaires/natalChartAspects";

const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-aspects-reference.json", "utf8")) as {
  positions: { body: string; longitude: number }[];
  expectedOwn8DegreePairs: { id: string; type: string; targetDegrees: number; separationDegrees: number; orbDegrees: number }[];
  observedSourcePairs: { id: string; type: string; displayedSeparationWholeDegrees: number; displayedOrbDegrees: number }[];
  ownAdditionalPairsVersusObservedSource: string[];
};
const placements = (first = 12, second = 42) => NATAL_BODIES.map((body, index) => ({ body, coordinate: readNatalCoordinate(index === 0 ? first : index === 1 ? second : index * 31 + 20)! }));
const complete = (input: unknown): Extract<NatalAspectsResult, { status: "complete" }> => {
  const result = calculateNatalAspects(input);
  expect(result.status).toBe("complete");
  if (result.status !== "complete") throw new Error("Valid ten-body inventory lost");
  return result;
};
const sunMoon = (first: number, second: number) => complete(placements(first, second)).aspects.find(item => item.id === "sun:moon");

describe("T199 adopted major aspects from raw ten-body longitudes", () => {
  it("resolves all five geometric targets and uses the shortest angle across zero", () => {
    for (const [target, type] of [[0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"]] as const) {
      expect(sunMoon(0, target)).toMatchObject({ type, targetDegrees: target, separationDegrees: target, orbDegrees: 0 });
    }
    expect(sunMoon(359, 1)).toMatchObject({ type: "conjunction", separationDegrees: 2, orbDegrees: 2 });
    expect(sunMoon(1, 359)).toMatchObject({ type: "conjunction", separationDegrees: 2, orbDegrees: 2 });
    expect(sunMoon(0, 30)).toBeUndefined();
  });

  it("includes an exact8degree orb while excluding a raw value that only displays as8.0", () => {
    for (const longitude of [8, 52, 68, 82, 98, 112, 128, 172, 188, 352]) expect(sunMoon(0, longitude)?.orbDegrees).toBe(8);
    for (const longitude of [8.0000001, 51.9999999, 68.0000001, 81.9999999, 98.0000001, 111.9999999, 128.0000001, 171.9999999, 188.0000001, 351.9999999]) expect(sunMoon(0, longitude)).toBeUndefined();
    expect(sunMoon(0, 7.9999999)?.type).toBe("conjunction");
  });

  it("compares all45 distinct body pairs once, allowing multiple bodies at the same longitude", () => {
    const input = NATAL_BODIES.map(body => Object.freeze({ body, coordinate: Object.freeze({ longitude: 0 }) }));
    Object.freeze(input);
    const result = complete(input);
    expect(result.comparisons).toBe(45); expect(result.maximumOrbDegrees).toBe(8); expect(result.aspects).toHaveLength(45);
    expect(new Set(result.aspects.map(item => item.id)).size).toBe(45);
    expect(result.aspects.every(item => item.first !== item.second && item.type === "conjunction" && item.orbDegrees === 0)).toBe(true);
    expect(input.every(item => item.coordinate.longitude === 0)).toBe(true);
  });

  it("withholds damaged or partial inventories instead of returning a valid empty comparison", () => {
    const good = placements(), sparse = placements(); delete sparse[3];
    const duplicate = placements(); duplicate[3].body = "mercury";
    const swapped = placements(); [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    for (const input of [null, "values", {}, [], good.slice(1), [...good, good[0]], sparse, duplicate, swapped]) expect(calculateNatalAspects(input)).toEqual({ status: "unavailable" });
    for (const bad of [null, "12", NaN, Infinity, -1, 360]) {
      const input = placements() as unknown as { body: string; coordinate: { longitude: unknown } }[];
      input[0].coordinate.longitude = bad;
      expect(calculateNatalAspects(input)).toEqual({ status: "unavailable" });
    }
    const staleSign = placements(); staleSign[0].coordinate.signIndex = 11;
    expect(calculateNatalAspects(staleSign)).toEqual(calculateNatalAspects(good));
  });

  it("matches the independent fixed-input angle reference and honestly distinguishes the chosen orb rule", () => {
    const input = reference.positions.map(row => ({ body: row.body, coordinate: { longitude: row.longitude } }));
    const result = complete(input);
    expect(result.aspects.map(item => item.id)).toEqual(reference.expectedOwn8DegreePairs.map(item => item.id));
    for (const expected of reference.expectedOwn8DegreePairs) {
      const actual = result.aspects.find(item => item.id === expected.id)!;
      expect(actual.type).toBe(expected.type); expect(actual.targetDegrees).toBe(expected.targetDegrees);
      expect(actual.separationDegrees).toBeCloseTo(expected.separationDegrees, 10); expect(actual.orbDegrees).toBeCloseTo(expected.orbDegrees, 10);
    }
    expect(reference.observedSourcePairs).toHaveLength(16);
    for (const observed of reference.observedSourcePairs) {
      const actual = result.aspects.find(item => item.id === observed.id)!;
      expect(actual.type).toBe(observed.type);
      expect(Math.abs(actual.separationDegrees - observed.displayedSeparationWholeDegrees)).toBeLessThanOrEqual(1);
      expect(Math.abs(actual.orbDegrees - observed.displayedOrbDegrees)).toBeLessThan(0.11);
    }
    expect(reference.ownAdditionalPairsVersusObservedSource).toEqual(["neptune:pluto"]);
    expect(result.aspects.find(item => item.id === "moon:pluto")!.orbDegrees).toBeGreaterThan(6);
    expect(result.aspects.find(item => item.id === "saturn:pluto")!.orbDegrees).toBeGreaterThan(6);
  });
});
