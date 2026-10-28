import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isNatalChartConfigurationValid, natalPublicLinks, type NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";
import { NATAL_BODIES, NATAL_SIGNS, natalInventory, natalWholeSignHouse, readNatalCoordinate } from "@/lib/questionnaires/natalChartCoordinates";
import { calculateNatalAscendant, calculateNatalChart, calculateNatalPlacements, type NatalChartInput } from "@/lib/questionnaires/natalChartCalculation";
import { readNatalGeography, resolveNatalTime } from "@/lib/questionnaires/natalChartTime";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/natal-chart-source-reference.json");
const source = JSON.parse(sourceBytes.toString());
const numeric = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-numeric-reference.json", "utf8")) as {
  planetPositions: { body: string; utc: string; longitude: number }[];
  ascendants: { utc: string; latitude: number; longitude: number; swissLongitude: number; wholeSignCusps: number[] }[];
  singularities: { utc: string; latitude: number; longitude: number; status: string; analyticLongitude: number; numericalAgreementBoundDegrees: number }[];
};
const now = Date.parse("2026-10-28T00:00:00Z");
const base: NatalChartInput = { date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", coordinatesConfirmed: true, knownTime: true, occurrence: "" };
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("T199 adopted known-time core, separate from the remaining full-comparison fields", () => {
  it("binds all adopted bilingual prose and metadata without inventing questions or psychological axes", () => {
    expect(isNatalChartConfigurationValid(quiz)).toBe(true);
    const { source: provenance, ...projection } = quiz;
    expect(projection).toEqual(source.publicConfiguration);
    expect(provenance.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex"));
    expect(provenance.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify({ profiles: quiz.profiles, natalChart: quiz.natalChart })).digest("hex"));
    expect(source.sourceContentFreezeSHA256).toBe("10c562fa053f5198f47d7031b12f15aaa97bf0eaa281a22d39ddcca1547076e8");
    expect(quiz.questions).toEqual([]); expect(quiz.directions).toEqual([]);
    expect(quiz.profiles.map(p => p.id)).toEqual(NATAL_SIGNS);
    expect(quiz.profiles.flatMap(p => p.sections)).toHaveLength(72);
    for (const p of quiz.profiles) for (const locale of ["en", "zh"] as const) {
      expect(p.seo.title[locale].length).toBeLessThanOrEqual(60);
      expect(p.seo.description[locale].length).toBeLessThanOrEqual(160);
      expect(new Set(p.sections.filter(s => ["sun", "moon", "ascendant"].includes(s.id)).map(s => s.paragraphs[0][locale])).size).toBe(3);
    }
    expect(quiz.natalChart.bodyRoles.map(p => p.id)).toEqual(NATAL_BODIES);
    expect(quiz.natalChart.houseContexts.map(p => p.number)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    expect(quiz.natalChart.referencePoints).toHaveLength(12);
    expect(provenance.psychometricValidationCompleted).toBe(false);
    const scope = quiz.guide.find(s => s.id === "core-scope")!.paragraphs[0].en;
    expect(scope).toContain("MC, IC and DSC are calculated");
    expect(scope).toContain("Sensitive points are not yet calculated");
  });

  it("rejects identity, method, source and sparse-content drift before a renderer lookup", () => {
    const mutations = [
      (q: NatalChartQuestionnaire) => { q.slug = "zodiac-sign"; },
      (q: NatalChartQuestionnaire) => { q.natalChart.display = "rounded" as never; },
      (q: NatalChartQuestionnaire) => { q.natalChart.engine = "astronomy-engine@other" as never; },
      (q: NatalChartQuestionnaire) => { q.natalChart.copy = "personal" as never; },
      (q: NatalChartQuestionnaire) => { q.natalChart.minUTC = "1900-01-01T00:00:00Z" as never; },
      (q: NatalChartQuestionnaire) => { q.source.scoringVersion = "other"; },
      (q: NatalChartQuestionnaire) => { q.natalChart.aspects.maximumOrbDegrees = 5 as never; },
      (q: NatalChartQuestionnaire) => { delete q.natalChart.aspects.readings[0]; },
      (q: NatalChartQuestionnaire) => { q.natalChart.aspects.readings[1].targetDegrees = 90; },
      (q: NatalChartQuestionnaire) => { q.natalChart.aspects.readings[0].paragraphs[1].zh = ""; },
      (q: NatalChartQuestionnaire) => { q.natalChart.motion.stationToleranceDegreesPerDay = 0.001 as never; },
      (q: NatalChartQuestionnaire) => { q.natalChart.motion.method = "other" as never; },
      (q: NatalChartQuestionnaire) => { q.natalChart.motion.paragraphs[1].en = ""; },
      (q: NatalChartQuestionnaire) => { q.natalChart.angles.meridianNormTolerance = 1e-8 as never; },
      (q: NatalChartQuestionnaire) => { delete q.natalChart.angles.roles[0]; },
      (q: NatalChartQuestionnaire) => { q.natalChart.angles.roles[2].paragraphs[0].zh = ""; },
      (q: NatalChartQuestionnaire) => { delete q.profiles[0]; },
      (q: NatalChartQuestionnaire) => { delete q.profiles[0].sections[1]; },
      (q: NatalChartQuestionnaire) => { delete q.natalChart.bodyRoles[0]; },
      (q: NatalChartQuestionnaire) => { delete q.natalChart.referencePoints[0]; },
      (q: NatalChartQuestionnaire) => { q.natalChart.houseContexts[1].number = 1; },
      (q: NatalChartQuestionnaire) => { q.natalChart.referencePoints[0].latitude = Infinity; },
    ];
    for (const mutate of mutations) { const bad = structuredClone(quiz); mutate(bad); expect(isNatalChartConfigurationValid(bad)).toBe(false); }
    for (const bad of [null, undefined, [], {}, "natal-chart"]) expect(isNatalChartConfigurationValid(bad)).toBe(false);
  });

  it("chooses every half-open sign sector before truncating to0.1degree, never displaying30", () => {
    for (let index = 0; index < 12; index += 1) {
      const start = index * 30;
      expect(readNatalCoordinate(start)).toMatchObject({ sign: NATAL_SIGNS[index], signIndex: index, displayDegrees: 0 });
      expect(readNatalCoordinate(start + 29.9999)).toMatchObject({ sign: NATAL_SIGNS[index], displayDegrees: 29.9, nearDisplayBoundary: true });
      expect(readNatalCoordinate(start + 0.09)).toMatchObject({ sign: NATAL_SIGNS[index], displayDegrees: 0, nearDisplayBoundary: true });
      expect(natalWholeSignHouse(start, 120)).toBe((index - 4 + 12) % 12 + 1);
    }
    for (const value of [-1, 360, Infinity, NaN, "30", null, undefined]) expect(readNatalCoordinate(value)).toBeNull();
    expect(readNatalCoordinate(-0)?.longitude).toBe(0);
    expect(natalWholeSignHouse(30, 150)).toBe(9);
    expect(natalWholeSignHouse(30, 179.9)).toBe(9);
    expect(natalWholeSignHouse(30, NaN)).toBeNull();
  });

  it("matches the50 already-recorded JPL longitudes in finite cases, without a global accuracy claim", () => {
    expect(numeric.planetPositions).toHaveLength(50);
    const cache = new Map<string, ReturnType<typeof calculateNatalPlacements>>();
    for (const row of numeric.planetPositions) {
      if (!cache.has(row.utc)) cache.set(row.utc, calculateNatalPlacements(Date.parse(row.utc)));
      const actual = cache.get(row.utc)!.find(p => p.body === row.body)!;
      expect(separation(actual.coordinate.longitude, row.longitude) * 3600, `${row.body} at${row.utc}`).toBeLessThan(60);
    }
    expect(calculateNatalPlacements(NaN)).toBeNull();
  });

  it("reuses45 independent Swiss numeric references without including Swiss code or runtime", () => {
    expect(numeric.ascendants).toHaveLength(45);
    for (const row of numeric.ascendants) {
      const actual = calculateNatalAscendant(Date.parse(row.utc), row.latitude, row.longitude);
      expect(actual.status).toBe("computed");
      if (actual.status !== "computed") throw new Error("Reference angle unavailable");
      expect(separation(actual.coordinate.longitude, row.swissLongitude) * 3600).toBeLessThan(1);
      for (let index = 0; index < 12; index += 1) expect(natalWholeSignHouse(row.wholeSignCusps[index], actual.coordinate.longitude)).toBe(index + 1);
    }
  });

  it("consumes the existing213 singularity cases and withholds nonunique/polar angles", () => {
    expect(numeric.singularities).toHaveLength(213);
    const counts = { computed: 0, pole: 0, plane: 0 };
    for (const row of numeric.singularities) {
      const actual = calculateNatalAscendant(Date.parse(row.utc), row.latitude, row.longitude);
      if (row.status === "computed") {
        expect(actual.status).toBe("computed");
        if (actual.status !== "computed") throw new Error("Finite reference angle unavailable");
        counts.computed += 1;
        expect(separation(actual.coordinate.longitude, row.analyticLongitude)).toBeLessThanOrEqual(row.numericalAgreementBoundDegrees);
      } else { const reason = row.status === "pole" ? "pole" : "plane"; counts[reason] += 1; expect(actual).toEqual({ status: "unavailable", reason }); }
    }
    expect(counts).toEqual({ computed: 177, pole: 18, plane: 18 });
    expect(calculateNatalAscendant(NaN, 0, 0)).toEqual({ status: "unavailable", reason: "geometry" });
    expect(calculateNatalAscendant(now, 91, 0)).toEqual({ status: "unavailable", reason: "geometry" });
  });

  it("resolves a known real minute and an early local1900 date into the adopted UTC enclosure", () => {
    expect(resolveNatalTime(base, now)).toMatchObject({ status: "resolved", utc: "2001-06-15T07:30:00Z", offset: "+01:00", before1970: false });
    expect(resolveNatalTime({ ...base, date: "1900-01-01", time: "00:00", zone: "Asia/Tokyo" }, now)).toMatchObject({ status: "resolved", utc: "1899-12-31T15:00:00Z", before1970: true });
    expect(resolveNatalTime({ ...base, date: "1970-01-01", time: "00:00", zone: "Asia/Tokyo" }, now)).toMatchObject({ status: "resolved", utc: "1969-12-31T15:00:00Z", before1970: true });
    const early = calculateNatalChart({ ...base, date: "1900-01-01", time: "00:00", zone: "Asia/Tokyo" }, now);
    expect(early).toMatchObject({ status: "complete", chart: { utc: "1899-12-31T15:00:00Z", before1970: true } });
    expect(resolveNatalTime({ ...base, date: "1899-12-31" }, now)).toEqual({ status: "invalid", reason: "range" });
  });

  it("requires a fold occurrence even if one is future, then checks the selected instant", () => {
    const input = { ...base, date: "2024-11-03", time: "01:30", zone: "America/New_York" };
    const clock = Date.parse("2024-11-03T06:00:00Z");
    expect(resolveNatalTime(input, clock)).toEqual({ status: "choose-time", choices: [
      { occurrence: "earlier", utc: "2024-11-03T05:30:00Z", offset: "-04:00", future: false },
      { occurrence: "later", utc: "2024-11-03T06:30:00Z", offset: "-05:00", future: true },
    ] });
    expect(resolveNatalTime({ ...input, occurrence: "earlier" }, clock)).toMatchObject({ status: "resolved", utc: "2024-11-03T05:30:00Z" });
    expect(resolveNatalTime({ ...input, occurrence: "later" }, clock)).toEqual({ status: "invalid", reason: "future" });
    expect(resolveNatalTime({ ...input, occurrence: "automatic" }, clock)).toEqual({ status: "invalid", reason: "occurrence" });
    expect(resolveNatalTime({ ...input, date: "2024-03-10", time: "02:30" }, now)).toEqual({ status: "invalid", reason: "gap" });
  });

  it("uses resolved current instants rather than a device-calendar date and never guesses noon", () => {
    const clock = Date.parse("2026-10-26T12:30:00Z");
    expect(resolveNatalTime({ ...base, date: "2026-10-27", time: "01:30", zone: "Pacific/Kiritimati" }, clock)).toMatchObject({ status: "resolved", utc: "2026-10-26T11:30:00Z" });
    expect(resolveNatalTime({ ...base, date: "2026-10-26", time: "23:59", zone: "America/Los_Angeles" }, clock)).toEqual({ status: "invalid", reason: "future" });
    expect(resolveNatalTime({ ...base, date: "2026-10-26", time: "12:30", zone: "UTC" }, clock).status).toBe("resolved");
    expect(calculateNatalChart({ ...base, knownTime: false }, now)).toEqual({ status: "invalid", reason: "known-time" });
    for (const [field, value, reason] of [["date", "1900-02-29", "date"], ["date", "2000-1-01", "date"], ["time", "24:00", "time"], ["time", "12:00:00", "time"], ["zone", "+08:00", "zone"], ["zone", "Mars/Olympus", "zone"]]) expect(resolveNatalTime({ ...base, [field]: value }, now)).toEqual({ status: "invalid", reason });
    expect(resolveNatalTime(base, NaN)).toEqual({ status: "invalid", reason: "clock" });
  });

  it("requires literal bounded coordinates and explicit confirmation without using a device location", () => {
    expect(readNatalGeography("51.5", "-0.1", true)).toEqual({ latitude: 51.5, longitude: -0.1 });
    expect(readNatalGeography("90", "180", true)).toEqual({ latitude: 90, longitude: 180 });
    for (const lat of ["", " ", "NaN", "Infinity", "1e1", "90.1", "-90.1", 0]) expect(readNatalGeography(lat, "0", true)).toBeNull();
    expect(readNatalGeography("0", "180.1", true)).toBeNull();
    expect(readNatalGeography("0", "0", false)).toBeNull();
    expect(calculateNatalChart({ ...base, coordinatesConfirmed: false }, now)).toEqual({ status: "invalid", reason: "geography" });
    for (const bad of [null, undefined, [], {}, "birth", { ...base, latitude: 51.5 }]) expect(calculateNatalChart(bad, now)).toEqual({ status: "invalid", reason: "input" });
  });

  it("computes ten real body positions, actual sign contexts and whole-sign houses", () => {
    const result = calculateNatalChart(base, now);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Known witness unavailable");
    expect(result.chart.placements.map(p => p.body)).toEqual(NATAL_BODIES);
    expect(result.chart.placements.map(p => p.coordinate.sign)).toEqual(["gemini", "aries", "gemini", "taurus", "sagittarius", "gemini", "gemini", "aquarius", "aquarius", "sagittarius"]);
    expect(result.chart.placements.map(p => p.house)).toEqual([11, 9, 11, 10, 5, 11, 11, 7, 7, 5]);
    expect(result.chart.ascendant).toMatchObject({ status: "computed", coordinate: { sign: "leo" } });
    expect(result.chart.inventory).toEqual({ elements: { fire: 3, earth: 1, air: 6, water: 0 }, modalities: { cardinal: 1, fixed: 3, mutable: 6 } });
    const sparse = [...result.chart.placements]; delete sparse[0]; expect(natalInventory(sparse)).toBeNull();
  });

  it("preserves planets and counts when polar geometry withholds every dependent house", () => {
    const result = calculateNatalChart({ ...base, latitude: "90", longitude: "0" }, now);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Planet positions lost at pole");
    expect(result.chart.ascendant).toEqual({ status: "unavailable", reason: "pole" });
    expect(result.chart.placements).toHaveLength(10);
    expect(result.chart.placements.every(p => p.house === null)).toBe(true);
    expect(Object.values(result.chart.inventory.elements).reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("withholds a near-zero eastern tangent while retaining all ten body positions", () => {
    const result = calculateNatalChart({ ...base, date: "2000-01-01", time: "12:00", zone: "UTC", latitude: "78.52878058591777", longitude: "-72.54620582192229" }, now);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Planet positions lost at tangent");
    expect(result.chart.ascendant).toEqual({ status: "unavailable", reason: "geometry" });
    expect(result.chart.placements.map(p => p.body)).toEqual(NATAL_BODIES);
    expect(result.chart.placements.every(p => Number.isFinite(p.coordinate.longitude) && p.house === null)).toBe(true);
    expect(Object.values(result.chart.inventory.elements).reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("copies only fixed public entry/guide URLs without a birth date or result payload", () => {
    for (const locale of ["en", "zh"] as const) {
      const links = natalPublicLinks(quiz, locale).split("\n");
      expect(links).toHaveLength(13); expect(new Set(links).size).toBe(13);
      for (const value of links) {
        const url = new URL(value); expect(url.origin).toBe("https://fermatmind.com"); expect(url.search).toBe(""); expect(url.hash).toBe("");
        expect(url.pathname).toMatch(new RegExp(`^/${locale}/tests/explore/natal-chart(?:/results/[a-z]+)?$`));
      }
      expect(links.join("\n")).not.toMatch(/2001|08:30|51\.5|Europe\/London|24\.0/);
    }
  });
});
