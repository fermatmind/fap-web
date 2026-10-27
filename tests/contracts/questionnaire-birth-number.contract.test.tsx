import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BirthNumberClient } from "@/components/questionnaires/BirthNumberClient";
import { BirthNumberGuideBody, BirthNumberReport } from "@/components/questionnaires/BirthNumberReport";
import { BirthNumberGuidePage, BirthNumberPage } from "@/components/questionnaires/BirthNumberPage";
import { BIRTH_NUMBER_METHODS, BIRTH_NUMBER_SYMBOLS, calculateBirthDateNumber, calculateBirthNumber, deviceCalendarDate, isBirthNumberConfigurationValid, joinBirthDateFields, type BirthNumberQuestionnaire, type BirthNumberResult } from "@/lib/questionnaires/birthNumber";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/life-path-number.json", "utf8")) as BirthNumberQuestionnaire;
const fixtureBytes = readFileSync("tests/fixtures/questionnaires/life-path-number-reference.json");
const fixture = JSON.parse(fixtureBytes.toString()) as { publicConfiguration: Omit<BirthNumberQuestionnaire, "source">; sourceContentFreezeSHA256: string };
type Complete = Extract<BirthNumberResult, { status: "complete" }>;
function complete(date: string, method: typeof BIRTH_NUMBER_METHODS[number]): Complete {
  const result = calculateBirthDateNumber(date, method, "2026-10-27");
  if (result.status !== "complete") throw new Error(`Rejected valid witness ${date}`);
  return result;
}
function enter(date: string) {
  const [year, month, day] = date.split("-");
  for (const [id, value] of [["year", year], ["month", month], ["day", day]]) fireEvent.change(document.getElementById(`birth-number-${id}`)!, { target: { value } });
}
function submit() { fireEvent.click(screen.getByRole("button", { name: "Calculate symbolic number" })); }

describe("one birthday calculator, two rules and twelve shared original guides", () => {
  it("binds the frozen bilingual reader projection without inventing questions or psychological axes", () => {
    expect(isBirthNumberConfigurationValid(quiz)).toBe(true);
    const { source, ...publicConfiguration } = quiz;
    expect(publicConfiguration).toEqual(fixture.publicConfiguration);
    expect(source.itemBankSha256).toBe(createHash("sha256").update(fixtureBytes).digest("hex"));
    expect(source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(fixture.sourceContentFreezeSHA256).toBe("eea85a110ac7dd5309099021be8425db1e503a2c78d6f77909181a4bd13b6b6b");
    expect([quiz.questions, quiz.directions]).toEqual([[], []]);
    expect(quiz.profiles.map(profile => profile.symbol)).toEqual(BIRTH_NUMBER_SYMBOLS);
    expect(quiz.profiles.flatMap(profile => profile.sections)).toHaveLength(96);
    for (const profile of quiz.profiles) {
      expect(profile.headline).toEqual(profile.title);
      expect(profile.sections).toHaveLength(8);
      expect(profile.sections.map(section => section.paragraphs.length)).toEqual(Array(8).fill(1));
      expect(profile.seo.title.en.length).toBeLessThanOrEqual(60);
      expect(profile.seo.description.en.length).toBeLessThanOrEqual(160);
    }
    expect(source.psychometricValidationCompleted).toBe(false);
  });

  it("preserves the mathematically different 11/2 and 33/6 results and shows actual reduction steps", () => {
    for (const [date, parts, digits] of [["1980-01-01", 11, 2], ["2009-11-11", 33, 6], ["1990-09-23", 6, 33]] as const) {
      expect(complete(date, "separate-parts").number).toBe(parts);
      expect(complete(date, "all-date-digits").number).toBe(digits);
    }
    const preserved = complete("2009-11-11", "separate-parts");
    expect(preserved.parts.map(part => part.reduction.value)).toEqual([11, 11, 11]);
    expect(preserved.final).toEqual({ initial: 33, steps: [], value: 33 });
    const flat = complete("2009-11-11", "all-date-digits");
    expect(flat.initialDigits).toEqual([2, 0, 0, 9, 1, 1, 1, 1]);
    expect(flat.final).toEqual({ initial: 15, steps: [{ value: 15, digits: [1, 5], sum: 6 }], value: 6 });
    // 44 is not a retained endpoint under either selected rule.
    expect(complete("1999-09-07", "all-date-digits").final).toEqual({ initial: 44, steps: [{ value: 44, digits: [4, 4], sum: 8 }], value: 8 });
  });

  it("has an independently specified Gregorian witness for each of the twelve endpoints", () => {
    const witnesses = [["2000-01-07", 1], ["2008-08-11", 2], ["2000-01-09", 3], ["2000-01-01", 4], ["2000-01-02", 5], ["2000-01-03", 6], ["2000-01-04", 7], ["2000-01-05", 8], ["2000-01-06", 9], ["2000-01-08", 11], ["2000-09-29", 22], ["2009-11-11", 33]] as const;
    expect(witnesses.map(([date]) => complete(date, "separate-parts").number)).toEqual(BIRTH_NUMBER_SYMBOLS);
    for (const [date, expected] of witnesses) {
      const flatDate = expected === 33 ? "1990-09-23" : date;
      expect(complete(flatDate, "all-date-digits").number).toBe(expected);
    }
  });

  it.each(["1900-02-29", "2001-02-29", "2000-04-31", "2000-00-01", "2000-13-01", "2000-01-00", "2000-01-32"])("rejects nonexistent calendar date %s without rollover", date => {
    expect(calculateBirthDateNumber(date, "separate-parts", "2026-10-27")).toEqual({ status: "invalid", reason: "calendar-date" });
  });
  it.each(["2000-1-01", "2000-01-1", " 2000-01-01", "2000-01-01 ", "2000-01-01T00:00:00Z", "２０００-01-01", 20000101, {}, []])("rejects a nonliteral date %j", date => {
    expect(calculateBirthDateNumber(date, "all-date-digits", "2026-10-27")).toEqual({ status: "invalid", reason: "date-format" });
  });
  it("validates today independently, accepts leap day and inclusive boundaries, and rejects future dates", () => {
    for (const date of ["1900-01-01", "2000-02-29", "2026-10-26", "2026-10-27"]) expect(calculateBirthDateNumber(date, "separate-parts", "2026-10-27").status).toBe("complete");
    for (const date of ["2026-10-28", "2099-12-31"]) expect(calculateBirthDateNumber(date, "separate-parts", "2026-10-27")).toEqual({ status: "invalid", reason: "future-date" });
    for (const date of ["1899-12-31", "2100-01-01"]) expect(calculateBirthDateNumber(date, "separate-parts", "2026-10-27")).toEqual({ status: "invalid", reason: "date-range" });
    for (const today of [null, "", "2026-02-29", "invalid", "2100-01-01"]) expect(calculateBirthDateNumber("2000-01-01", "separate-parts", today)).toEqual({ status: "unavailable", reason: "device-date" });
    expect(calculateBirthDateNumber("", "separate-parts", "2026-10-27")).toEqual({ status: "input-needed" });
    expect(calculateBirthNumber("2000-01-01", "guessed")).toEqual({ status: "invalid", reason: "method" });
    expect(deviceCalendarDate(new Date(2026, 9, 27, 23, 59))).toBe("2026-10-27");
    expect(deviceCalendarDate(new Date(NaN))).toBeNull();
    expect(joinBirthDateFields("2000", "1", "9")).toBe("2000-01-09");
    for (const fields of [[2000, "1", "9"], ["2000", " 1", "9"], ["00", "1", "9"], ["2000", "1e0", "9"]]) expect(joinBirthDateFields(...fields as [unknown, unknown, unknown])).toBeNull();
  });

  it("fails closed on sparse or missing configuration before any profile lookup", () => {
    const arrays = [(q: BirthNumberQuestionnaire) => q.birthNumber.methods, (q: BirthNumberQuestionnaire) => q.birthNumber.endpoints, (q: BirthNumberQuestionnaire) => q.profiles, (q: BirthNumberQuestionnaire) => q.guide, (q: BirthNumberQuestionnaire) => q.faq, (q: BirthNumberQuestionnaire) => q.references, (q: BirthNumberQuestionnaire) => q.profiles[0].sections, (q: BirthNumberQuestionnaire) => q.profiles[0].sections[0].paragraphs];
    for (const select of arrays) for (const mode of ["hole", "undefined", "null"]) {
      const bad = structuredClone(quiz), array = select(bad) as unknown[];
      if (mode === "hole") delete array[0]; else array[0] = mode === "null" ? null : undefined;
      expect(isBirthNumberConfigurationValid(bad), `${mode} in ${select}`).toBe(false);
      const html = renderToStaticMarkup(<BirthNumberClient quiz={bad} locale="en" />);
      expect(html).toContain("calculator content is unavailable"); expect(html).not.toContain("<input");
    }
    for (const mutate of [(q: BirthNumberQuestionnaire) => { q.profiles[1].id = q.profiles[0].id; }, (q: BirthNumberQuestionnaire) => { q.profiles[0].symbol = 33; }, (q: BirthNumberQuestionnaire) => { q.references[0].url = "https://example.com"; }, (q: BirthNumberQuestionnaire) => { q.profiles[0].sections[1].id = q.profiles[0].sections[0].id; }]) {
      const bad = structuredClone(quiz); mutate(bad); expect(isBirthNumberConfigurationValid(bad)).toBe(false);
    }
  });

  it("renders all 96 bilingual sections as complete public paragraphs with unique anchors", () => {
    for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberGuideBody profile={profile} locale={locale} headingLevel={2} />);
      expect(dom.querySelectorAll("h2")).toHaveLength(8); expect(dom.querySelectorAll("section > p")).toHaveLength(8);
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(8);
      for (const section of profile.sections) expect(dom.querySelector(`#birth-guide-${section.id}`)?.textContent).toContain(section.paragraphs[0][locale]);
    }
  });
  it("renders both real traces, one shared guide for equal outcomes and two full guides for different outcomes", () => {
    for (const [date, count] of [["2000-01-01", 1], ["2009-11-11", 2]] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberReport quiz={quiz} results={BIRTH_NUMBER_METHODS.map(method => complete(date, method))} locale="en" />);
      expect(dom.querySelectorAll("[data-birth-number-trace]")).toHaveLength(2);
      expect(dom.querySelectorAll("[data-birth-number-guide]")).toHaveLength(count);
      expect(dom.querySelectorAll("[data-birth-number-guide] section > p")).toHaveLength(count * 8);
    }
  });
  it("rejects missing, sparse and duplicate-method results before looking up a guide", () => {
    const result = complete("2000-01-01", "separate-parts");
    for (const results of [[], Array(1), [null], [undefined], [result, result]]) {
      const html = renderToStaticMarkup(<BirthNumberReport quiz={quiz} results={results as Complete[]} locale="en" />);
      expect(html).toContain("calculation is unavailable"); expect(html).not.toContain("data-birth-number-guide");
    }
  });
  it("keeps the public entry and guide independent of DOB input and fake question counts", () => {
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberPage quiz={quiz} locale={locale} />);
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      expect(dom.querySelectorAll("input")).toHaveLength(3);
      expect([...dom.querySelectorAll("input, select")].every(node => !node.hasAttribute("name"))).toBe(true);
      expect(dom.textContent).not.toMatch(/0 questions|0 题|0 min|0 分钟/);
      for (const profile of quiz.profiles) {
        expect(dom.querySelector(`a[href='/${locale}/tests/explore/life-path-number/results/${profile.id}']`)).not.toBeNull();
        const guide = document.createElement("div"); guide.innerHTML = renderToStaticMarkup(<BirthNumberGuidePage quiz={quiz} profile={profile} locale={locale} />);
        expect(guide.querySelectorAll("input")).toHaveLength(0);
        expect(guide.querySelectorAll("[data-birth-number-guide] h2")).toHaveLength(8);
      }
    }
  });
  it("disables date fields and native submission in SSR until client handlers are ready", () => {
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<BirthNumberClient quiz={quiz} locale={locale} />);
      expect(dom.querySelector("fieldset")).toBeDisabled();
      for (const control of dom.querySelectorAll("input,select,button")) expect(control).toBeDisabled();
      expect(dom.querySelector("[role=status]")?.textContent).toBe(locale === "zh" ? "正在准备本页计算器，请稍候。" : "Preparing this calculator. Please wait.");
      expect([...dom.querySelectorAll("input,select")].every(node => !node.hasAttribute("name"))).toBe(true);
    }
    render(<BirthNumberClient quiz={quiz} locale="en" />);
    expect(screen.getByRole("button", { name: "Calculate symbolic number" })).toBeEnabled();
    expect(screen.getByLabelText("Year (four digits)")).toBeEnabled();
  });
  it("clears results on field/rule edits, explicit clearing, page restoration and locale changes", () => {
    const { container, rerender } = render(<BirthNumberClient quiz={quiz} locale="en" />);
    enter("2009-11-11"); submit(); expect(container.querySelector('[data-birth-number-value="separate-parts"]')).toHaveTextContent("33");
    fireEvent.change(document.getElementById("birth-number-day")!, { target: { value: "10" } }); expect(container.querySelector("[data-birth-number-result]")).toBeNull();
    submit(); fireEvent.change(screen.getByLabelText("Calculation rule"), { target: { value: "all-date-digits" } }); expect(container.querySelector("[data-birth-number-result]")).toBeNull();
    submit(); fireEvent.click(screen.getByRole("button", { name: "Clear input and result" })); expect(container.querySelector("[data-birth-number-result]")).toBeNull(); expect(screen.getByLabelText("Year (four digits)")).toHaveValue("");
    enter("2000-01-01"); submit(); act(() => window.dispatchEvent(new Event("pagehide"))); expect(screen.getByLabelText("Year (four digits)")).toHaveValue("");
    enter("2000-01-01"); submit(); rerender(<BirthNumberClient quiz={quiz} locale="zh" />); expect(screen.getByLabelText("年（四位数字）")).toHaveValue(""); expect(container.querySelector("[data-birth-number-result]")).toBeNull();
  });
  it("uses the real device-day limit in the UI and never rolls an invalid date into a result", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 27, 12));
    const { container } = render(<BirthNumberClient quiz={quiz} locale="en" />);
    for (const [date, message] of [["2026-10-28", "cannot be later than today"], ["1900-02-29", "does not exist"], ["2000-04-31", "does not exist"]]) {
      enter(date); submit(); expect(screen.getByRole("status")).toHaveTextContent(message); expect(container.querySelector("[data-birth-number-result]")).toBeNull();
    }
    enter("2026-10-27"); submit(); expect(container.querySelector("[data-birth-number-result]")).not.toBeNull();
  });
  it("copies only the selected public label and method, including clipboard-denial fallback", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied")); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const storage = vi.spyOn(Storage.prototype, "setItem"), fetch = vi.spyOn(globalThis, "fetch");
    render(<BirthNumberClient quiz={quiz} locale="en" />); enter("2009-11-11"); submit();
    fireEvent.click(screen.getByRole("button", { name: "Compare the other rule" }));
    expect(document.querySelectorAll("[data-birth-number-guide]")).toHaveLength(2);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy label and method" })));
    const expected = `${quiz.profiles[11].title.en}\n${quiz.birthNumber.methods[0].label.en}`;
    expect(writeText).toHaveBeenCalledWith(expected); expect(screen.getByLabelText("Text for manual copying")).toHaveValue(expected);
    expect(expected).not.toMatch(/2009|11-11|\+|https?:/); expect(storage).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    expect(location.search + location.hash).toBe("");
  });
  it("ignores an old pending clipboard denial after the user edits and calculates a new result", async () => {
    let reject!: (reason: Error) => void;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise<void>((_, fail) => { reject = fail; }) } });
    render(<BirthNumberClient quiz={quiz} locale="en" />); enter("2009-11-11"); submit();
    fireEvent.click(screen.getByRole("button", { name: "Copy label and method" }));
    enter("2000-01-01"); submit(); await act(async () => reject(new Error("late denial")));
    expect(screen.queryByLabelText("Text for manual copying")).toBeNull(); expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
  it("confirms a successful clipboard copy without introducing date or trace fields", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<BirthNumberClient quiz={quiz} locale="en" />); enter("1980-01-01"); submit();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy label and method" })));
    expect(writeText).toHaveBeenCalledWith(`${quiz.profiles[9].title.en}\n${quiz.birthNumber.methods[0].label.en}`);
    expect(screen.getByRole("status")).toHaveTextContent("Copied the symbolic label and method, without a date or operations.");
    expect(screen.queryByLabelText("Text for manual copying")).toBeNull();
  });
  it("serves all 26 real native callers with full content, public metadata, sitemap and a calculator-specific directory card", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        const meta = await entry.generateMetadata(props);
        expect(dom.querySelectorAll("main")).toHaveLength(1); expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.querySelector("#take-test input")).not.toBeNull();
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(maps.some(item => item.loc === `https://fermatmind.com${path}`)).toBe(true);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
        const card = directory.querySelector(`a[href="${path}"]`)?.closest("article");
        expect(card?.textContent).toContain(locale === "zh" ? "两种日期规则" : "Two date rules");
        expect(card?.textContent).not.toMatch(/0 questions|0 题|0 min|0 分钟/);
        for (const profile of quiz.profiles) {
          const params = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(params)); const metadata = await guide.generateMetadata(params);
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          expect(dom.querySelectorAll("[data-birth-number-guide] section > p")).toHaveLength(8);
          for (const section of profile.sections) expect(dom.textContent).toContain(section.paragraphs[0][locale]);
          expect(metadata.title).toBe(profile.seo.title[locale]); expect(metadata.description).toBe(profile.seo.description[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}/results/${profile.id}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${profile.id}` });
          expect(maps.some(item => item.loc === `https://fermatmind.com${path}/results/${profile.id}`)).toBe(true);
          expect(dom.querySelectorAll("input,textarea,[data-birth-number-trace]")).toHaveLength(0);
        }
      }
      expect(maps.filter(item => item.loc.includes("/life-path-number"))).toHaveLength(26);
      expect(maps.some(item => item.loc.includes("/soul-number"))).toBe(false);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("returns noindex/404 for malformed configurations before guide or OG profile lookup", async () => {
    for (const mutate of [(q: BirthNumberQuestionnaire) => { delete q.profiles[0]; }, (q: BirthNumberQuestionnaire) => { delete q.birthNumber.endpoints[0]; }, (q: BirthNumberQuestionnaire) => { q.profiles[11].sections = []; }]) {
      const bad = structuredClone(quiz); mutate(bad);
      vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => bad }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), og = await import("@/app/og/fun/[slug]/route");
        const params = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, guideParams = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "one" }) };
        expect((await entry.generateMetadata(params)).robots).toEqual({ index: false, follow: false });
        await expect(entry.default(params)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await guide.generateMetadata(guideParams)).robots).toEqual({ index: false, follow: false });
        await expect(guide.default(guideParams)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        expect((await og.GET(new Request("https://fermatmind.com/og/fun/life-path-number?portrait=one"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });
});
