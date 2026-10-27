import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ mode: "normal" as "normal" | "longitude" | "plane" | "east" }));
vi.mock("astronomy-engine", async importOriginal => {
  const actual = await importOriginal<typeof import("astronomy-engine")>();
  return { ...actual,
    Ecliptic: (...args: Parameters<typeof actual.Ecliptic>) => {
      const result = actual.Ecliptic(...args);
      return state.mode === "longitude" ? { ...result, elon: NaN } : result;
    },
    RotateVector: (...args: Parameters<typeof actual.RotateVector>) => {
      const result = actual.RotateVector(...args), v = args[1];
      if (state.mode === "plane") return new actual.Vector(NaN, NaN, NaN, v.t);
      const basis = (v.x === 1 && v.y === 0) || (v.x === 0 && v.y === 1);
      return state.mode === "east" && !basis ? new actual.Vector(result.x, Math.abs(result.y) + 0.001, result.z, v.t) : result;
    },
  };
});
import { calculateNatalChart } from "@/lib/questionnaires/natalChartCalculation";

const input = { date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true };
const now = Date.parse("2026-10-28T00:00Z");
afterEach(() => { state.mode = "normal"; });

describe("T199 actual calculation failure boundaries", () => {
  it("does not return a partial or invented chart when a body longitude is nonfinite", () => {
    state.mode = "longitude";
    expect(calculateNatalChart(input, now)).toEqual({ status: "unavailable", reason: "ephemeris" });
  });
  it.each(["plane", "east"] as const)("retains body positions but visibly withholds failed %s geometry", mode => {
    state.mode = mode;
    const result = calculateNatalChart(input, now);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Body positions were incorrectly discarded");
    expect(result.chart.ascendant).toEqual({ status: "unavailable", reason: "geometry" });
    expect(result.chart.placements).toHaveLength(10);
    expect(result.chart.placements.every(p => p.house === null)).toBe(true);
  });
});
