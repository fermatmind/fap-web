import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
const model = vi.hoisted(() => ({ fault: "none" as "none" | "ascendant" | "meridian" | "throw" }));
vi.mock("astronomy-engine", async importOriginal => {
  const actual = await importOriginal<typeof import("astronomy-engine")>();
  return { ...actual,
    Rotation_EQD_HOR: (...args: Parameters<typeof actual.Rotation_EQD_HOR>) => {
      if (model.fault === "ascendant") throw new Error("Synthetic ASC-only failure");
      return actual.Rotation_EQD_HOR(...args);
    },
    SiderealTime: (...args: Parameters<typeof actual.SiderealTime>) => {
      if (model.fault === "throw") throw new Error("Synthetic meridian-only failure");
      return model.fault === "meridian" ? NaN : actual.SiderealTime(...args);
    },
  };
});
import { calculateNatalAdditionalAngles, solveNatalUpperMeridian } from "@/lib/questionnaires/natalChartAngles";
import { calculateNatalAscendant, calculateNatalChart } from "@/lib/questionnaires/natalChartCalculation";
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-angles-reference.json", "utf8")) as { utc: string; latitude: number; longitude: number; swiss: { MC: number; IC: number; DSC: number } };
const epoch = Date.parse(reference.utc), input = { date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true };
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
afterEach(() => { model.fault = "none"; });
describe("T199 three additional angles, independent meridian and ASC-dependent houses", () => {
  it("reuses the one fixed Swiss witness and assigns actual whole-sign9/3/7 rather than role10/4/7", () => {
    const asc = calculateNatalAscendant(epoch, reference.latitude, reference.longitude), angles = calculateNatalAdditionalAngles(epoch, reference.latitude, reference.longitude, asc);
    for (const [id, key, house] of [["mc", "MC", 9], ["ic", "IC", 3], ["descendant", "DSC", 7]] as const) {
      const angle = angles[id]; expect(angle.status).toBe("computed"); if (angle.status !== "computed") throw new Error("Fixed witness unavailable");
      expect(separation(angle.coordinate.longitude, reference.swiss[key]) * 3600).toBeLessThan(1); expect(angle.house).toBe(house);
    }
  });
  it("withholds norm<=1e-10 and upperDot<=1e-12 using dedicated nonphysical synthetic faults", () => {
    expect(solveNatalUpperMeridian({ x: 0, y: 1e-10, z: 0 }, { x: 1, y: 0, z: 0 }, 0)).toMatchObject({ status: "unavailable", reason: "plane" });
    expect(solveNatalUpperMeridian({ x: 0, y: 1e-10 + 1e-16, z: 0 }, { x: 1, y: 0, z: 0 }, 0).status).toBe("computed");
    expect(solveNatalUpperMeridian({ x: 1e-12, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0).status).toBe("unavailable");
    expect(solveNatalUpperMeridian({ x: 1e-12 + 1e-18, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0).status).toBe("computed");
    expect(solveNatalUpperMeridian({ x: 1, y: 0, z: NaN }, { x: 0, y: 1, z: 0 }, 0).status).toBe("unavailable");
  });
  it("selects the upper opposing root and normalizes every longitude before the existing sector display", () => {
    expect(solveNatalUpperMeridian({ x: -1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0)).toMatchObject({ status: "computed", coordinate: { longitude: 180 } });
    for (const theta of [0, 90, 180, 270, 360, -90]) {
      const r = solveNatalUpperMeridian({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, theta);
      expect(r.status).toBe("computed"); if (r.status !== "computed") throw new Error("Synthetic valid basis failed");
      expect(r.coordinate.longitude).toBeGreaterThanOrEqual(0); expect(r.coordinate.longitude).toBeLessThan(360); expect(r.coordinate.displayDegrees).toBeLessThan(30);
    }
  });
  it("keeps MC/IC when only ASC fails, retaining10 bodies/motion and withholding all houses/DSC", () => {
    model.fault = "ascendant"; const r = calculateNatalChart(input, Date.parse("2026-10-28T00:00Z"));
    expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Body chart discarded");
    expect(r.chart.ascendant.status).toBe("unavailable"); expect(r.chart.angles.mc).toMatchObject({ status: "computed", house: null }); expect(r.chart.angles.ic).toMatchObject({ status: "computed", house: null }); expect(r.chart.angles.descendant.status).toBe("unavailable");
    expect(r.chart.placements).toHaveLength(10); expect(r.chart.placements.every(p => p.house === null)).toBe(true); expect(Object.keys(r.chart.motion)).toHaveLength(10);
  });
  it.each(["meridian", "throw"] as const)("keeps DSC/ASC/10bodies when only meridian model %s fails", fault => {
    model.fault = fault; const r = calculateNatalChart(input, Date.parse("2026-10-28T00:00Z"));
    expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Body chart discarded");
    expect(r.chart.ascendant.status).toBe("computed"); expect(r.chart.angles.mc.status).toBe("unavailable"); expect(r.chart.angles.ic.status).toBe("unavailable"); expect(r.chart.angles.descendant).toMatchObject({ status: "computed", house: 7 }); expect(r.chart.placements).toHaveLength(10);
  });
  it("withholds geographic poles/invalid inputs and ignores stale cached ASC sectors", () => {
    const asc = calculateNatalAscendant(epoch, 51.5, -0.1); if (asc.status !== "computed") throw new Error("ASC reference unavailable");
    for (const latitude of [-90, 90, 91, NaN]) expect(Object.values(calculateNatalAdditionalAngles(epoch, latitude, -0.1, asc)).every(a => a.status === "unavailable")).toBe(true);
    expect(Object.values(calculateNatalAdditionalAngles(NaN, 51.5, -0.1, asc)).every(a => a.status === "unavailable")).toBe(true);
    const a = calculateNatalAdditionalAngles(epoch, 51.5, -0.1, { status: "computed", coordinate: { ...asc.coordinate, sign: "aries", signIndex: 0 } });
    expect(a.mc).toMatchObject({ house: 9 }); expect(a.descendant).toMatchObject({ house: 7 });
  });
});
