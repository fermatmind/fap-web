import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
const model = vi.hoisted(() => ({ fault: "none" as "none" | "throw" | "nonfinite", center: Date.parse("2001-06-15T07:30Z"), calls: [] as { body: string; epoch: number }[] }));
vi.mock("astronomy-engine", async importOriginal => {
  const actual = await importOriginal<typeof import("astronomy-engine")>();
  const bad = new WeakSet<object>();
  return { ...actual,
    GeoVector: (...args: Parameters<typeof actual.GeoVector>) => {
      const [body, date] = args, epoch = actual.MakeTime(date).date.getTime();
      model.calls.push({ body, epoch });
      if (body === actual.Body.Mercury && epoch !== model.center && model.fault === "throw") throw new Error("Synthetic motion-only body failure");
      const value = actual.GeoVector(...args);
      if (body === actual.Body.Mercury && epoch !== model.center && model.fault === "nonfinite") bad.add(value);
      return value;
    },
    Ecliptic: (...args: Parameters<typeof actual.Ecliptic>) => {
      const value = actual.Ecliptic(...args);
      return bad.has(args[0]) ? { ...value, elon: NaN } : value;
    },
  };
});
import { calculateNatalMotion, classifyNatalMotionRates, natalLongitudeRate } from "@/lib/questionnaires/natalChartMotion";
import { calculateNatalChart } from "@/lib/questionnaires/natalChartCalculation";
import { resolveNatalTime } from "@/lib/questionnaires/natalChartTime";
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-motion-reference.json", "utf8")) as {
  fixedUTC: string; fixedFlags: { body: keyof ReturnType<typeof calculateNatalMotion>; retrograde: boolean }[];
  stationRows: { utc: string; classAtAdoptedNumericalTolerance: string }[];
};
const input = { date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true };
afterEach(() => { model.fault = "none"; model.calls = []; });
describe("T199 adopted numerical motion labels, separate from exact astronomical station times", () => {
  it("unwraps fullprecision longitudes before dividing actual elapsed days", () => {
    expect(natalLongitudeRate(359.99, 0.01, 1)).toBeCloseTo(0.02, 9);
    expect(natalLongitudeRate(0.01, 359.99, 1)).toBeCloseTo(-0.02, 9);
    expect(natalLongitudeRate(5, 6, 0.5)).toBe(2);
    for (const x of [-1, 360, NaN, Infinity, "1", null]) expect(natalLongitudeRate(x, 1, 1)).toBeNull();
    for (const x of [0, -1, NaN, Infinity, "1", null]) expect(natalLongitudeRate(1, 2, x)).toBeNull();
  });
  it("uses the inclusive1e-4 numerical band and withholds disagreeing scales", () => {
    for (const x of [0, 1e-4, -1e-4, 1e-4 - 1e-12, -1e-4 + 1e-12]) expect(classifyNatalMotionRates(x, x)).toMatchObject({ status: "computed", motion: "near-stationary" });
    expect(classifyNatalMotionRates(1e-4 + 1e-12, 1e-4 + 1e-12)).toMatchObject({ motion: "direct" });
    expect(classifyNatalMotionRates(-1e-4 - 1e-12, -1e-4 - 1e-12)).toMatchObject({ motion: "retrograde" });
    for (const [a, b] of [[0, 1], [1, -1], [-1, 0], [NaN, 0], [0, Infinity], ["0", 0], [null, 0]]) expect(classifyNatalMotionRates(a, b)).toEqual({ status: "unavailable" });
  });
  it("reuses the existing one fixed10-body flag reference", () => {
    const actual = calculateNatalMotion(Date.parse(reference.fixedUTC)); expect(Object.keys(actual)).toHaveLength(10);
    for (const row of reference.fixedFlags) expect(actual[row.body]).toMatchObject({ status: "computed", motion: row.retrograde ? "retrograde" : "direct" });
  });
  it("checks the supported minute and10-minute sides of one actual Mercury station witness", () => {
    for (const row of reference.stationRows) expect(calculateNatalMotion(Date.parse(row.utc)).mercury).toMatchObject({ status: "computed", motion: row.classAtAdoptedNumericalTolerance });
  });
  it.each(["throw", "nonfinite"] as const)("retains every placement and nine motion labels when only Mercury neighbors %s", fault => {
    model.fault = fault;
    const result = calculateNatalChart(input, Date.parse("2026-10-28T00:00Z"));
    expect(result.status).toBe("complete"); if (result.status !== "complete") throw new Error("Original placements discarded");
    expect(result.chart.placements).toHaveLength(10);
    expect(result.chart.motion.mercury).toEqual({ status: "unavailable" });
    expect(Object.values(result.chart.motion).filter(value => value.status === "computed")).toHaveLength(9);
  });
  it("rejects invalid epochs without model calls and bounds valid internal neighbors to60seconds", () => {
    for (const epoch of [NaN, Infinity, null, "0", 0.5, 8640000000000000]) {
      model.calls = []; const actual = calculateNatalMotion(epoch);
      expect(Object.values(actual)).toHaveLength(10); expect(Object.values(actual).every(value => value.status === "unavailable")).toBe(true); expect(model.calls).toEqual([]);
    }
    for (const epoch of [Date.parse("1899-12-31T00:00Z"), Date.parse("2026-10-28T00:00Z")]) {
      model.calls = []; expect(Object.values(calculateNatalMotion(epoch)).every(value => value.status === "computed")).toBe(true);
      expect(model.calls).toHaveLength(40); expect(model.calls.every(call => [60000, 30000].includes(Math.abs(call.epoch - epoch)))).toBe(true);
    }
  });
  it("keeps original public current/future and local-minimum birth gates", () => {
    const now = Date.parse("2026-10-28T00:00Z"), value = { date: "2026-10-28", time: "00:00", zone: "UTC", knownTime: true };
    expect(resolveNatalTime(value, now).status).toBe("resolved");
    expect(resolveNatalTime({ ...value, time: "00:01" }, now)).toEqual({ status: "invalid", reason: "future" });
    expect(resolveNatalTime({ ...value, date: "1899-12-31" }, now)).toEqual({ status: "invalid", reason: "range" });
  });
});
