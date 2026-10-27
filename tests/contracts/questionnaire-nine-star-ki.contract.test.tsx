import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { calculateNineStarYearReference, nineStarForSeasonYear } from "@/lib/questionnaires/nineStarYearMethod";
import { calculateNineStarYearFromInput, isNineStarReferenceValid, isNineStarYearConfigurationValid, NINE_STAR_PROFILE_IDS, type NineStarYearQuestionnaire, type NineStarReference } from "@/lib/questionnaires/nineStarYear";
import { NineStarYearReport } from "@/components/questionnaires/NineStarYearReport";
import { NineStarYearClient } from "@/components/questionnaires/NineStarYearClient";
import { NineStarYearGuidePage, NineStarYearPage } from "@/components/questionnaires/NineStarYearPage";
import reference from "../fixtures/questionnaires/nine-star-year-reference.json";
import profileReference from "../fixtures/questionnaires/nine-star-profiles-reference.json";
import sourceReference from "../fixtures/questionnaires/nine-star-source-reference.json";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nine-star-ki.json", "utf8")) as NineStarYearQuestionnaire;
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const dom = (html: string) => { const node = document.createElement("div"); node.innerHTML = html; return node; };

describe("Nine Star annual cultural reference: frozen sources and conditional method", () => {
  it("binds all nine full guides,127 source rows, exact source identity and the unchanged adopted pure module", () => {
    expect(isNineStarYearConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual([]); expect(quiz.directions).toEqual([]);
    expect(quiz.source).toEqual(sourceReference.source); expect(quiz.nineStarYear).toEqual(sourceReference.nineStarYear);
    expect(quiz.guide).toEqual(sourceReference.guide); expect(quiz.instructions).toEqual(sourceReference.instructions); expect(quiz.references).toEqual(sourceReference.references);
    expect(quiz.profiles).toEqual(profileReference); expect(quiz.profiles.map(p => p.id)).toEqual([...NINE_STAR_PROFILE_IDS]);
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.nineStarYear)); expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles));
    expect(createHash("sha256").update(readFileSync("lib/questionnaires/nineStarYearMethod.ts")).digest("hex")).toBe(reference.pureMethodModuleSha256);
    expect(reference.rows).toHaveLength(127); expect(quiz.profiles.flatMap(p => p.sections)).toHaveLength(54);
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(quiz.profiles.map(p => p.headline[locale])).size).toBe(9);
      expect(new Set(quiz.profiles.map(p => p.seo.title[locale])).size).toBe(9); expect(new Set(quiz.profiles.map(p => p.seo.description[locale])).size).toBe(9);
    }
    for (const p of quiz.profiles) {
      const source = p.sections[5].paragraphs[0];
      if (p.star !== 5) { expect(source.en).toContain("printed page 19, supplies the Later Heaven diagram pairing"); expect(source.zh).toContain("印刷页19提供后天图的配属"); }
      expect(source.en).not.toContain("printed pages 16 and 19");
    }
  });
  it("executes all381 year/side cases against the fixed primary-boundary and independent-reference table", () => {
    let count = 0;
    for (const row of reference.rows) for (const side of ["before-boundary", "after-boundary", "uncertain"] as const) {
      const result = calculateNineStarYearReference(row.year, side);
      expect(result).toEqual({ status: "reference", inputYear: row.year, boundaryJst: row.boundary, precision: "minute", certainty: side === "uncertain" ? "two-possibilities" : "conditional-single", candidates: side === "uncertain"
        ? [{ seasonYear: row.year - 1, star: row.before, side: "before-boundary" }, { seasonYear: row.year, star: row.after, side: "after-boundary" }]
        : [{ seasonYear: side === "before-boundary" ? row.year - 1 : row.year, star: side === "before-boundary" ? row.before : row.after, side }] });
      expect(isNineStarReferenceValid(result)).toBe(true); count++;
    }
    expect(count).toBe(381); expect(nineStarForSeasonYear(1927)).toBe(1); expect(nineStarForSeasonYear(1928)).toBe(9);
    expect(calculateNineStarYearReference(2021, "after-boundary")).toMatchObject({ boundaryJst: "2021-02-03T23:59" });
    expect(calculateNineStarYearReference(2025, "before-boundary")).toMatchObject({ boundaryJst: "2025-02-03T23:10", candidates: [{ seasonYear: 2024, star: 3 }] });
    for (let year = 1899; year <= 2017; year++) expect(nineStarForSeasonYear(year + 9)).toBe(nineStarForSeasonYear(year));
  });
  it("keeps missing, invalid, unsupported and uncertain inputs distinct without coercion or a guessed side", () => {
    expect(calculateNineStarYearReference(undefined, "uncertain")).toEqual({ status: "incomplete", field: "year" });
    expect(calculateNineStarYearReference(2026, "")).toEqual({ status: "incomplete", field: "boundarySide" });
    for (const year of [null, true, false, "2026", [], {}, NaN, Infinity, 1899, 2027, 2055, 2025.5]) expect(calculateNineStarYearReference(year, "uncertain")).toEqual({ status: "invalid" });
    for (const side of [null, true, false, 0, 1, [], {}, "before", "after", "na", "Uncertain"]) expect(calculateNineStarYearReference(2026, side)).toEqual({ status: "invalid" });
    for (const year of [1898, 2027, NaN, 1927.5]) expect(() => nineStarForSeasonYear(year)).toThrow(RangeError);
    expect(calculateNineStarYearReference(1900, "before-boundary")).toMatchObject({ candidates: [{ seasonYear: 1899, star: 2 }] });
  });
  it("parses only explicit four-digit Gregorian UI strings and preserves a required boundary-side choice", () => {
    for (const value of ["2025 ", " 2025", "+2025", "2e03", "2025.0", "２０２５", "02025", 2025, true, null, [], {}]) expect(calculateNineStarYearFromInput(value, "uncertain")).toEqual({ status: "invalid" });
    expect(calculateNineStarYearFromInput("", "uncertain")).toEqual({ status: "incomplete", field: "year" });
    expect(calculateNineStarYearFromInput("2025", "")).toEqual({ status: "incomplete", field: "boundarySide" });
    expect(calculateNineStarYearFromInput("2025", "uncertain")).toEqual(calculateNineStarYearReference(2025, "uncertain"));
  });
  it("fails closed for changed identity, scope, calibration, calendar range, missing guides or malformed source", () => {
    const faults: ((q: NineStarYearQuestionnaire) => void)[] = [
      q => { q.code = "other"; }, q => { q.source.psychometricValidationCompleted = true as never; },
      q => { q.nineStarYear.maxYear = 2099 as never; }, q => { q.nineStarYear.boundaryTimeZone = "local" as never; },
      q => { q.nineStarYear.boundarySides = ["after-boundary", "before-boundary", "uncertain"] as never; }, q => { q.profiles[0].star = 9; },
      q => { q.profiles[0].id = "alias"; }, q => { q.profiles.pop(); }, q => { q.profiles[0].sections[0].paragraphs[0].en = ""; },
      q => { q.questions.push({ id: "not-a-questionnaire", prompt: { en: "invented", zh: "虚构" }, options: [] }); },
      q => { q.references[0].url = "https://example.invalid"; }, q => { q.source.itemBankVersion = "unbound"; },
    ];
    for (const fault of faults) { const q = structuredClone(quiz); fault(q); expect(isNineStarYearConfigurationValid(q)).toBe(false); }
    expect(isNineStarYearConfigurationValid(null)).toBe(false); expect(isNineStarYearConfigurationValid({})).toBe(false);
  });
  it("renders all nine bilingual full bodies and both uncertain guides, withholding a corrupted calculation", () => {
    for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
      const row = reference.rows.find(row => row.after === profile.star)!;
      const result = calculateNineStarYearReference(row.year, "after-boundary") as NineStarReference;
      const view = dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} result={result} locale={locale} />));
      expect(view.querySelectorAll("[data-nine-star-guide]")).toHaveLength(1);
      for (const s of profile.sections) for (const p of s.paragraphs) expect(view.textContent).toContain(p[locale]);
    }
    const result = calculateNineStarYearReference(2025, "uncertain") as NineStarReference;
    const view = dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} result={result} locale="en" />));
    expect(view.querySelectorAll("[data-nine-star-candidate]")).toHaveLength(2); expect(view.querySelectorAll("[data-nine-star-guide]")).toHaveLength(2);
    expect([...view.querySelectorAll("[data-nine-star-value]")].map(n => n.getAttribute("data-nine-star-value"))).toEqual(["3", "2"]);
    const bad = structuredClone(result); bad.candidates[0].star = 9;
    expect(isNineStarReferenceValid(bad)).toBe(false); expect(isNineStarReferenceValid({ ...result, candidates: [] })).toBe(false);
    expect(dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} result={bad} locale="en" />)).querySelector("[data-nine-star-result]")).toBeNull();
  });
  it("exposes all guides without personal input, with only year and side controls in the dedicated client", () => {
    for (const locale of ["en", "zh"] as const) {
      const entry = dom(renderToStaticMarkup(<NineStarYearPage quiz={quiz} locale={locale} />));
      expect(entry.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      for (const s of quiz.guide) for (const p of s.paragraphs) expect(entry.textContent).toContain(p[locale]);
      expect(entry.querySelector("#nine-star-public-guides")?.parentElement?.querySelectorAll("a")).toHaveLength(9);
      const client = dom(renderToStaticMarkup(<NineStarYearClient quiz={quiz} locale={locale} />));
      expect(client.querySelectorAll("input[type=text]")).toHaveLength(1); expect(client.querySelectorAll("input[type=radio]")).toHaveLength(3);
      expect(client.querySelector("input[checked]")).toBeNull(); expect(client.querySelector("[data-nine-star-result]")).toBeNull();
      for (const profile of quiz.profiles) {
        const guide = dom(renderToStaticMarkup(<NineStarYearGuidePage quiz={quiz} profile={profile} locale={locale} />));
        expect(guide.querySelectorAll("[data-nine-star-guide] section")).toHaveLength(6);
        expect(guide.querySelectorAll("input")).toHaveLength(0); expect(guide.querySelector("[data-nine-star-result]")).toBeNull();
        for (const s of profile.sections) for (const p of s.paragraphs) expect(guide.textContent).toContain(p[locale]);
        if (locale === "en") expect(guide.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    }
  });
});
