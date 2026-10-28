import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
const model = vi.hoisted(() => ({ fault: "none" as "none" | "moon" | "horizon" | "ascendant" }));
vi.mock("astronomy-engine", async importOriginal => {
  const actual = await importOriginal<typeof import("astronomy-engine")>();
  return { ...actual,
    GeoMoonState: (...args: Parameters<typeof actual.GeoMoonState>) => {
      if (model.fault === "moon") throw new Error("Synthetic lunar-state-only failure");
      return actual.GeoMoonState(...args);
    },
    Rotation_EQJ_HOR: (...args: Parameters<typeof actual.Rotation_EQJ_HOR>) => {
      if (model.fault === "horizon") throw new Error("Synthetic Fortune-only horizon failure");
      return actual.Rotation_EQJ_HOR(...args);
    },
    Rotation_EQD_HOR: (...args: Parameters<typeof actual.Rotation_EQD_HOR>) => {
      if (model.fault === "ascendant") throw new Error("Synthetic ASC-only failure");
      return actual.Rotation_EQD_HOR(...args);
    },
  };
});
import { calculateNatalSensitivePoints, solveNatalFortune, solveNatalLunarApogee, solveNatalLunarPoints } from "@/lib/questionnaires/natalChartPoints";
import { calculateNatalAscendant, calculateNatalChart, calculateNatalPlacements } from "@/lib/questionnaires/natalChartCalculation";
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-points-reference.json", "utf8")) as {
  input: { utc: string; latitude: number; longitude: number }; independentRoot: { north: number; south: number; lilith: number; fortune: number };
  swiss: { osculatingNorthNode: number; osculatingLunarApogee: number; fortune: number }; observedDifferencesArcsec: { node: number; apogee: number; fortune: number };
};
const epoch = Date.parse(reference.input.utc), now = Date.parse("2026-10-28T00:00Z"), input = { date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true };
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const identity = (v: { x: number; y: number; z: number }) => v;
afterEach(() => { model.fault = "none"; });
describe("T199 named lunar mathematical points and numerical Fortune horizon convention", () => {
  it("reuses one independent fixed witness and retains the233arcsec apogee model difference", () => {
    const chart = calculateNatalChart(input, now); expect(chart.status).toBe("complete"); if (chart.status !== "complete") throw new Error("Fixed chart unavailable");
    const points = chart.chart.points;
    for (const [id, key, house] of [["north-node", "north", 12], ["south-node", "south", 6], ["lilith", "lilith", 7], ["fortune", "fortune", 10]] as const) {
      const p = points[id]; expect(p.status).toBe("computed"); if (p.status !== "computed") throw new Error("Fixed point unavailable");
      expect(separation(p.coordinate.longitude, reference.independentRoot[key])).toBeLessThan(1e-9); expect(p.house).toBe(house);
      expect(p.coordinate.longitude).toBeGreaterThanOrEqual(0); expect(p.coordinate.longitude).toBeLessThan(360); expect(p.coordinate.displayDegrees).toBeLessThan(30);
    }
    if (points.lilith.status !== "computed") throw new Error("Apogee unavailable");
    expect(separation(points.lilith.coordinate.longitude, reference.swiss.osculatingLunarApogee) * 3600).toBeCloseTo(reference.observedDifferencesArcsec.apogee, 5);
    if (points["north-node"].status !== "computed" || points["south-node"].status !== "computed") throw new Error("Nodes unavailable");
    expect(separation(points["north-node"].coordinate.longitude, points["south-node"].coordinate.longitude)).toBeCloseTo(180, 10);
    expect(points.fortune).toMatchObject({ period: "day" });
    expect(chart.chart.placements).toHaveLength(10); expect(Object.keys(chart.chart.motion)).toHaveLength(10); expect(Object.keys(chart.chart.angles)).toHaveLength(3);
  });
  it("uses unrounded day/night arithmetic and withholds the inclusive horizon band", () => {
    for (const z of [-1e-12, 0, 1e-12]) expect(solveNatalFortune(350, 20, 40, z)).toEqual({ status: "unavailable", reason: "horizon" });
    expect(solveNatalFortune(350, 20, 40, 1e-12 + 1e-18)).toMatchObject({ coordinate: { longitude: 10 }, period: "day" });
    expect(solveNatalFortune(350, 20, 40, -1e-12 - 1e-18)).toMatchObject({ coordinate: { longitude: 330 }, period: "night" });
    for (const z of [NaN, Infinity, 2, "1", null]) expect(solveNatalFortune(350, 20, 40, z).status).toBe("unavailable");
    expect(solveNatalFortune(null, 20, 40, 1)).toMatchObject({ reason: "ascendant" }); expect(solveNatalFortune(10, null, 40, 1)).toMatchObject({ reason: "geometry" });
  });
  it("withholds zero/nonfinite lunar geometry and nonpositive gravitational parameters", () => {
    const r = { x: 1, y: 0, z: 0 }, v = { x: 0, y: 1, z: 0 };
    for (const args of [[{ x: 0, y: 0, z: 0 }, v, 1], [r, r, 1], [r, v, 0], [r, v, -1], [r, v, NaN], [{ ...r, z: Infinity }, v, 1], [r, { ...v, z: NaN }, 1]] as const) {
      expect(Object.values(solveNatalLunarPoints(args[0], args[1], args[2], identity)).every(p => p.status === "unavailable")).toBe(true);
    }
  });
  it("applies the inclusive unit-node projection boundary without dropping apogee", () => {
    const r = { x: 1, y: 0, z: 0 }, v = { x: 0, y: Math.sqrt(1.5), z: 0 };
    for (const [projection, expected] of [[1e-10, "unavailable"], [1e-10 + 1e-16, "computed"]] as const) {
      let calls = 0; const p = solveNatalLunarPoints(r, v, 1, value => ++calls === 1 ? { x: projection, y: 0, z: Math.sqrt(1 - projection * projection) } : value);
      expect(p["north-node"].status).toBe(expected); expect(p["south-node"].status).toBe(expected); expect(p.lilith.status).toBe("computed");
    }
  });
  it("applies both inclusive eccentricity limits and the unit-apogee projection boundary", () => {
    for (const e of [0, 1e-10, 1, 1.1, NaN, Infinity]) expect(solveNatalLunarApogee({ x: e, y: 0, z: 0 }, identity).status).toBe("unavailable");
    for (const e of [1e-10 + 1e-16, 1 - 1e-12]) expect(solveNatalLunarApogee({ x: e, y: 0, z: 0 }, identity).status).toBe("computed");
    for (const [projection, expected] of [[1e-10, "unavailable"], [1e-10 + 1e-16, "computed"]] as const) expect(solveNatalLunarApogee({ x: .5, y: 0, z: 0 }, () => ({ x: projection, y: 0, z: 1 })).status).toBe(expected);
    expect(solveNatalLunarApogee({ x: .5, y: 0, z: 0 }, () => { throw new Error("Synthetic model failure"); }).status).toBe("unavailable");
  });
  it.each(["moon", "horizon"] as const)("preserves independent points and the existing chart when %s fails", fault => {
    model.fault = fault; const r = calculateNatalChart(input, now); expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Existing chart discarded");
    expect(r.chart.placements).toHaveLength(10); expect(r.chart.ascendant.status).toBe("computed"); expect(r.chart.angles.mc.status).toBe("computed");
    for (const id of ["north-node", "south-node", "lilith"] as const) expect(r.chart.points[id].status).toBe(fault === "moon" ? "unavailable" : "computed");
    expect(r.chart.points.fortune.status).toBe(fault === "moon" ? "computed" : "unavailable");
  });
  it("retains lunar coordinates but withholds Fortune and all point houses when ASC fails", () => {
    model.fault = "ascendant"; const r = calculateNatalChart(input, now); expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Chart discarded");
    expect(r.chart.points.fortune).toMatchObject({ reason: "ascendant" }); for (const id of ["north-node", "south-node", "lilith"] as const) expect(r.chart.points[id]).toMatchObject({ status: "computed", house: null });
    expect(r.chart.angles.mc).toMatchObject({ status: "computed", house: null });
  });
  it("rejects a nonfinite transformed normal while preserving independent apogee", () => {
    let calls = 0; const p = solveNatalLunarPoints({ x: 1, y: 0, z: 0 }, { x: 0, y: Math.sqrt(1.5), z: 0 }, 1, value => ++calls === 1 ? { x: 1, y: 0, z: NaN } : value);
    expect(p["north-node"]).toMatchObject({ reason: "geometry" }); expect(p["south-node"]).toMatchObject({ reason: "geometry" }); expect(p.lilith.status).toBe("computed");
  });
  it("keeps invalid epochs unavailable and uses raw ASC rather than cached sectors", () => {
    const asc = calculateNatalAscendant(epoch, reference.input.latitude, reference.input.longitude), placements = calculateNatalPlacements(epoch); if (asc.status !== "computed" || !placements) throw new Error("Fixed inputs unavailable");
    for (const value of [NaN, Infinity, .5, "0", null, 8640000000000001]) expect(Object.values(calculateNatalSensitivePoints(value as number, 51.5, -.1, asc, placements)).every(p => p.status === "unavailable")).toBe(true);
    const p = calculateNatalSensitivePoints(epoch, 51.5, -.1, { status: "computed", coordinate: { ...asc.coordinate, sign: "aries", signIndex: 0 } }, placements); expect(p.fortune).toMatchObject({ house: 10 }); expect(p["north-node"]).toMatchObject({ house: 12 });
  });
});
