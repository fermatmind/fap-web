import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Ecliptic, GeoMoon, MakeTime, Vector } from "astronomy-engine";
import { classifyNakshatraLongitude, NAKSHATRA_IDS, NAKSHATRA_SECTOR_DEGREES as width, NAKSHATRA_COMPARISON_WINDOW_DEGREES as window } from "@/lib/questionnaires/nakshatra27";
import { calculateNakshatra, spicaReferenceLongitude } from "@/lib/questionnaires/nakshatra27Calculation";
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/nakshatra-horizons-reference.json", "utf8")) as { fixtures: { utc: string; moonICRFHorizonsAU: [number, number, number] }[]; fullMonthlyComparisonSamples: number; params: Record<string, string> };
const now = Date.parse("2026-10-30T00:00:00Z");
const input = { date: "2000-01-01", time: "12:00", zone: "UTC", knownTime: true, placeConfirmed: true };
const angleDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
describe("Explicit geometric fixed-Spica27 calculation, no psychological scoring", () => {
  it("compares14independent geometric geocentric Moon fixtures, without claiming frame or symbolic validation", () => {
    expect(reference.fullMonthlyComparisonSamples).toBe(1522); expect(reference.fixtures).toHaveLength(14);
    expect(reference.params).toMatchObject({ COMMAND: "301", CENTER: "500@399", VEC_CORR: "NONE", REF_SYSTEM: "ICRF", REF_PLANE: "FRAME", TIME_TYPE: "UT", OUT_UNITS: "AU-D" });
    for (const f of reference.fixtures) {
      const time = MakeTime(new Date(f.utc)), a = GeoMoon(time), b = new Vector(...f.moonICRFHorizonsAU, time);
      const cross = [a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x];
      const arcminutes = Math.atan2(Math.hypot(...cross), a.x * b.x + a.y * b.y + a.z * b.z) * 180 / Math.PI * 60;
      expect(arcminutes).toBeLessThan(0.1);
      expect(angleDistance(Ecliptic(a).elon, Ecliptic(b).elon) * 60).toBeLessThan(0.1);
    }
  });
  it("covers all27centres, all108padas, every exact edge, both sides and the0degree wrap", () => {
    for (let i = 0; i < 27; i++) {
      const centre = classifyNakshatraLongitude(i * width + width / 2)!;
      expect(centre).toMatchObject({ index: i, id: NAKSHATRA_IDS[i], comparison: false, profileIds: [NAKSHATRA_IDS[i]] });
      const edge = classifyNakshatraLongitude(i * width)!; expect(edge.index).toBe(i); expect(edge.pada).toBe(1); expect(edge.comparison).toBe(true);
      expect(edge.profileIds).toEqual([NAKSHATRA_IDS[i], NAKSHATRA_IDS[(i + 26) % 27]]);
      expect(classifyNakshatraLongitude(i * width + 1e-8)!.index).toBe(i);
      expect(classifyNakshatraLongitude((i * width + 360 - 1e-8) % 360)!.index).toBe((i + 26) % 27);
      for (let q = 0; q < 4; q++) {
        expect(classifyNakshatraLongitude(i * width + (q + 0.5) * width / 4)!.pada).toBe(q + 1);
        expect(classifyNakshatraLongitude(i * width + q * (width / 4))!.pada).toBe(q + 1);
      }
      expect(classifyNakshatraLongitude(i * width + window)!.comparison).toBe(true);
      expect(classifyNakshatraLongitude(i * width + window + 1e-7)!.comparison).toBe(false);
      expect(classifyNakshatraLongitude((i + 1) * width - window - 1e-7)!.comparison).toBe(false);
    }
    for (const x of [null, undefined, "0", [], NaN, Infinity, -1e-8, 360, 720]) expect(classifyNakshatraLongitude(x)).toBeNull();
  });
  it("makes birthplace-zone conversion reproducible at one instant, with no location-dependent invented axes", () => {
    const a = calculateNakshatra(input, now), b = calculateNakshatra({ ...input, time: "17:30", zone: "Asia/Kolkata" }, now);
    expect(a.status).toBe("complete"); expect(b.status).toBe("complete"); if (a.status !== "complete" || b.status !== "complete") throw new Error("Valid instant rejected");
    expect(a.reading.utc).toBe(b.reading.utc); expect(a.reading.referenceLongitude).toBe(b.reading.referenceLongitude);
    expect(a.reading.referenceLongitude).toBeCloseTo(((a.reading.moonLongitude - a.reading.spicaLongitude + 540) % 360), 10);
    expect(a.reading.ayanamsa).toBeCloseTo(a.reading.spicaLongitude - 180, 10);
    for (const key of ["personality", "score", "percentile", "compatibility", "forecast", "ascendant", "latitude", "longitude"]) expect(a.reading).not.toHaveProperty(key);
    expect(spicaReferenceLongitude(new Date("1900-01-01T00:00Z")) - 180).toBeCloseTo(22.45006622923171, 9);
    expect(spicaReferenceLongitude(new Date("2026-10-01T00:00Z")) - 180).toBeCloseTo(24.2171992971613, 9);
  });
  it("rejects unknown time, invalid dates/zones, no place confirmation, future instants and DSTgaps; preserves both fold choices", () => {
    expect(calculateNakshatra({ ...input, knownTime: false }, now)).toEqual({ status: "invalid", reason: "known-time" });
    expect(calculateNakshatra({ ...input, placeConfirmed: false }, now)).toEqual({ status: "invalid", reason: "place" });
    for (const values of [null, [], new Date(), "2000-01-01"]) expect(calculateNakshatra(values, now)).toEqual({ status: "invalid", reason: "input" });
    for (const values of [{ date: "1900-02-29" }, { date: "1899-12-31" }, { date: "2030-01-01" }, { time: "24:00" }, { zone: "+05:30" }, { zone: "Missing/Place" }]) expect(calculateNakshatra({ ...input, ...values }, now).status).toBe("invalid");
    expect(calculateNakshatra({ ...input, date: "2024-03-10", time: "02:30", zone: "America/New_York" }, now)).toEqual({ status: "invalid", reason: "gap" });
    const fold = { ...input, date: "2024-11-03", time: "01:30", zone: "America/New_York" };
    const choice = calculateNakshatra(fold, now); expect(choice.status).toBe("choose-time");
    if (choice.status !== "choose-time") throw new Error("Fold not retained");
    expect(choice.choices.map(c => c.utc)).toEqual(["2024-11-03T05:30:00Z", "2024-11-03T06:30:00Z"]);
    for (const [i, occurrence] of ["earlier", "later"].entries()) { const r = calculateNakshatra({ ...fold, occurrence }, now); expect(r.status).toBe("complete"); if (r.status === "complete") expect(r.reading.utc).toBe(choice.choices[i].utc); }
  });
});
