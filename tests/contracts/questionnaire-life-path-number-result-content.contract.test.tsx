import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BirthNumberClient } from "@/components/questionnaires/BirthNumberClient";
import { BirthNumberGuideBody, BirthNumberReport } from "@/components/questionnaires/BirthNumberReport";
import { BirthNumberGuidePage, BirthNumberPage } from "@/components/questionnaires/BirthNumberPage";
import { calculateBirthNumber, isBirthNumberConfigurationValid, type BirthNumberProfile, type BirthNumberQuestionnaire } from "@/lib/questionnaires/birthNumber";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/life-path-number.json", "utf8")) as BirthNumberQuestionnaire;
const readings = quiz.profiles.map(p => ({ ...p, ...prepareResultProfile(quiz.slug, p) }));
const dates = ["2000-01-07", "2008-08-11", "2000-01-09", "2000-01-01", "2000-01-02", "2000-01-03", "2000-01-04", "2000-01-05", "2000-01-06", "2000-01-08", "2000-09-29", "2009-11-11"];
function complete(date: string, method: "separate-parts" | "all-date-digits") {
  const result = calculateBirthNumber(date, method);
  if (result.status !== "complete") throw new Error(date);
  return result;
}
function enter(date: string) {
  date.split("-").forEach((value, i) => fireEvent.change(document.getElementById(`birth-number-${["year", "month", "day"][i]}`)!, { target: { value } }));
  fireEvent.click(screen.getByRole("button", { name: "Calculate symbolic number" }));
}

describe("twelve original birthday stories beside unchanged arithmetic", () => {
  it("preserves raw configuration, identity, source paragraphs and idempotent projection", () => {
    const before = JSON.stringify(quiz);
    expect(isBirthNumberConfigurationValid(quiz)).toBe(true);
    expect(isBirthNumberConfigurationValid({ ...quiz, profiles: readings })).toBe(false);
    for (const [i, p] of readings.entries()) {
      expect(prepareResultProfile(quiz.slug, p)).toBe(p);
      expect([p.id, p.symbol, p.title, p.seo]).toEqual([quiz.profiles[i].id, quiz.profiles[i].symbol, quiz.profiles[i].title, quiz.profiles[i].seo]);
      expect(p.sections.flatMap(s => s.paragraphs)).toHaveLength(11);
      for (const [j, s] of p.sections.entries()) expect(s.paragraphs[0]).toEqual(quiz.profiles[i].sections[j].paragraphs[0]);
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberGuideBody profile={p} locale={locale} headingLevel={2} />);
        expect(dom.querySelectorAll("h2")).toHaveLength(8);
        expect(dom.querySelectorAll("section > p")).toHaveLength(11);
        expect(dom.querySelectorAll("details:not([open]) nav a")).toHaveLength(8);
        for (const a of dom.querySelectorAll("nav a")) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
        for (const s of p.sections) for (const para of s.paragraphs) expect(dom.textContent).toContain(para[locale]);
      }
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "unknown-symbol" };
    expect(prepareResultProfile(quiz.slug, unknown)).toBe(unknown);
  });
  it("renders all twelve calculated labels under both rules, sharing equal outcomes", () => {
    for (const [i, date] of dates.entries()) for (const method of ["separate-parts", "all-date-digits"] as const) {
      const witness = i === 11 && method === "all-date-digits" ? "1990-09-23" : date;
      const result = complete(witness, method);
      expect(result.number).toBe(quiz.profiles[i].symbol);
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberReport quiz={quiz} readingProfiles={readings} results={[result]} locale={locale} />);
        expect(dom.querySelector("[data-birth-symbol-result-reading]")?.getAttribute("data-birth-symbol-result-reading")).toBe(quiz.profiles[i].id);
        expect(dom.querySelectorAll("section > article section > p")).toHaveLength(11);
      }
    }
    for (const [date, guideCount] of [["2000-01-01", 1], ["2009-11-11", 2], ["1980-01-01", 2], ["1990-09-23", 2]] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberReport quiz={quiz} readingProfiles={readings} results={[complete(date, "separate-parts"), complete(date, "all-date-digits")]} locale="en" />);
      expect(dom.querySelectorAll("[data-birth-number-trace]")).toHaveLength(2);
      expect(dom.querySelectorAll("[data-birth-symbol-result-reading]")).toHaveLength(guideCount);
      const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("rejects another profile, symbol or quiz projection and retains the eight-paragraph source fallback", () => {
    for (const bad of [undefined, [readings[1]], [{ ...readings[0], symbol: 2 }], [{ ...readings[0], resultReading: { ...readings[0].resultReading!, quizSlug: "other" } }], [{ ...readings[0], resultReading: { ...readings[0].resultReading!, profileId: "two" } }]] as (readonly BirthNumberProfile[] | undefined)[]) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberReport quiz={quiz} readingProfiles={bad} results={[complete(dates[0], "separate-parts")]} locale="en" />);
      expect(dom.querySelector("[data-birth-symbol-result-reading]")).toBeNull();
      expect(dom.querySelectorAll("[data-birth-number-guide] section > p")).toHaveLength(8);
    }
  });
  it("publishes all bilingual guides without a DOB, trace or private calculated value", () => {
    for (const locale of ["en", "zh"] as const) {
      const entry = renderToStaticMarkup(<BirthNumberPage quiz={quiz} locale={locale} />);
      expect(entry).toContain("birth-number-year");
      for (const profile of readings) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberGuidePage quiz={quiz} profile={profile} locale={locale} />);
        expect(dom.querySelectorAll("[data-birth-symbol-result-reading]")).toHaveLength(1);
        expect(dom.querySelectorAll("input,textarea,[data-birth-number-result],[data-birth-number-trace],[data-birth-number-value]")).toHaveLength(0);
        for (const section of profile.sections) for (const para of section.paragraphs) expect(dom.textContent).toContain(para[locale]);
      }
    }
  });
  it("keeps client arithmetic in raw memory while rendering additions, copying only label and method", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied")); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const storage = vi.spyOn(Storage.prototype, "setItem"), network = vi.spyOn(globalThis, "fetch");
    const { container, rerender } = render(<BirthNumberClient quiz={quiz} readingProfiles={readings} locale="en" />);
    enter("2009-11-11"); fireEvent.click(screen.getByRole("button", { name: "Compare the other rule" }));
    expect(container.querySelectorAll("[data-birth-symbol-result-reading]")).toHaveLength(2);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy label and method" })));
    const payload = `${quiz.profiles[11].title.en}\n${quiz.birthNumber.methods[0].label.en}`;
    expect(writeText).toHaveBeenCalledWith(payload); expect(screen.getByLabelText("Text for manual copying")).toHaveValue(payload);
    fireEvent.change(screen.getByLabelText("Calculation rule"), { target: { value: "all-date-digits" } });
    expect(container.querySelector("[data-birth-number-result]")).toBeNull();
    enter("2000-02-30"); expect(container.querySelector("[data-birth-number-result]")).toBeNull();
    enter("2000-01-01"); expect(container.querySelectorAll("[data-birth-symbol-result-reading]")).toHaveLength(1);
    rerender(<BirthNumberClient quiz={quiz} readingProfiles={readings} locale="zh" />);
    expect(container.querySelector("[data-birth-number-result]")).toBeNull(); expect(screen.getByLabelText("年（四位数字）")).toHaveValue("");
    expect(storage).not.toHaveBeenCalled(); expect(network).not.toHaveBeenCalled();
  });
});
