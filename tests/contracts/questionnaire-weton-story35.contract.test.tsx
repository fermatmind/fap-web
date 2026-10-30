import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { calculateWetonCalendar, createWetonStory35OptionOrder, isWetonStory35ConfigurationValid, scoreWetonStory35, wetonWeekdays, wetonPasaran } from "@/lib/questionnaires/wetonStory35";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { WetonStory35Client } from "@/components/questionnaires/WetonStory35Client";
import { WetonStory35Report } from "@/components/questionnaires/WetonStory35Report";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/weton-story-preferences.json", "utf8")) as Questionnaire;
const coverage = JSON.parse(readFileSync("tests/fixtures/questionnaires/weton-story35-tie-witnesses.json", "utf8")) as { banks: { keys: string[]; states: { leaders: string[]; choices: string[] }[]; impossible: string[][] }[] };
const calendar = JSON.parse(readFileSync("tests/fixtures/questionnaires/weton-calendar-reference.json", "utf8")) as { cases: { date: string; weekday: string; pasaran: string }[] };
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answersFor = (values: string[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const values = [...coverage.banks[0].states.find(s => s.leaders.length === 7)!.choices, ...coverage.banks[1].states.find(s => s.leaders.length === 4)!.choices];

describe("Original Weton story preferences and a separately bounded calendar", () => {
  it("binds the complete bilingual35/35edition, equal Fano exposures and distinct pairing scenes", () => {
    expect(isWetonStory35ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(digest(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(digest(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.questions).toHaveLength(35); expect(quiz.profiles).toHaveLength(35);
    const positions = Object.fromEntries(wetonWeekdays.map(k => [k, [0, 0, 0]])), pairs: Record<string, number> = {};
    for (const q of quiz.questions.slice(0, 21)) {
      const offered = q.options.slice(0, 3).map(o => o.id as typeof wetonWeekdays[number]);
      offered.forEach((k, i) => positions[k][i]++);
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const pair = [offered[i], offered[j]].sort().join("|"); pairs[pair] = (pairs[pair] ?? 0) + 1; }
    }
    for (const counts of Object.values(positions)) expect(counts).toEqual([3, 3, 3]); expect(Object.keys(pairs)).toHaveLength(21); expect(new Set(Object.values(pairs))).toEqual(new Set([3]));
    expect(new Set(quiz.profiles.map(p => p.sections[3].paragraphs[0].en)).size).toBe(35);
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(650); }
    for (const slug of ["chinese-zodiac", "moon-phase", "what-element-am-i"]) expect(quiz.questions).not.toEqual(JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")).questions);
  });

  it("checks all3600 feasible highest-set crosses with actual assignments, retaining up to28complete matches", () => {
    expect(coverage.banks.map(b => b.states.length)).toEqual([120, 30]); expect(coverage.banks.map(b => b.impossible.length)).toEqual([7, 1]);
    expect(coverage.banks[0].impossible.every(s => s.length === 6)).toBe(true); expect(coverage.banks[1].impossible[0]).toEqual(wetonPasaran);
    let states = 0, maximum = 0;
    for (const a of coverage.banks[0].states) for (const b of coverage.banks[1].states) {
      const r = scoreWetonStory35(quiz, answersFor([...a.choices, ...b.choices])); expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("Complete state rejected");
      expect(r.weekdayLeaders).toEqual(a.leaders); expect(r.pasaranLeaders).toEqual(b.leaders); expect(r.profileIds).toEqual(a.leaders.flatMap(d => b.leaders.map(p => `${d}-${p}`)));
      expect(wetonWeekdays.reduce((n, k) => n + r.counts![k], 0)).toBe(21); expect(wetonPasaran.reduce((n, k) => n + r.counts![k], 0)).toBe(14);
      expect(new Set(r.profileIds).size).toBe(r.profileIds.length); maximum = Math.max(maximum, r.profileIds.length); states++;
      for (const property of ["total", "percentile", "birthWeton", "energy", "fate"]) expect(r).not.toHaveProperty(property);
    }
    expect([states, maximum]).toEqual([3600, 28]);
    for (let i = 0; i < 35; i++) { const v = [...values]; v[i] = "na"; const r = scoreWetonStory35(quiz, answersFor(v)); expect(r.status).toBe("complete"); if (r.status !== "complete") throw new Error("NA completion rejected"); expect(r.counts).toBeNull(); expect(r.profileIds).toEqual([]); expect(r.weekdayLeaders).toEqual([]); expect(r.pasaranLeaders).toEqual([]); }
    const partial = answersFor(values); delete partial.WETON35_035; expect(scoreWetonStory35(quiz, partial)).toEqual({ status: "incomplete", answered: 34 });
    for (const a of [null, [], { ...answersFor(values), extra: "legi" }, { ...answersFor(values), WETON35_001: "kliwon" }]) expect(scoreWetonStory35(quiz, a).status).toBe("invalid");
    expect(scoreQuestionnaire(quiz, answersFor(values))).toEqual({ status: "unavailable", answered: 0 });
  });

  it("preserves stable option keys, all six and120presentation orders, with NA always last", () => {
    const seen3 = new Set<string>(), seen5 = new Set<string>();
    for (let a = 0; a < 5; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 3; c++) for (let d = 0; d < 2; d++) {
      const sequence = [a / 5, b / 4, c / 3, d / 2]; let at = 0;
      const order = createWetonStory35OptionOrder(quiz, () => { const call = at++; return call < 42 ? 0 : sequence[(call - 42) % 4]; });
      for (const q of quiz.questions) { expect(order[q.id].at(-1)).toBe("na"); expect([...order[q.id]].sort()).toEqual(q.options.map(o => o.id).sort()); }
      seen5.add(order.WETON35_022.join("|"));
    }
    for (const a of [0, 0.4, 0.9]) for (const b of [0, 0.9]) { let at = 0; const order = createWetonStory35OptionOrder(quiz, () => [a, b][at++ % 2]); seen3.add(order.WETON35_001.join("|")); }
    // Four random draws per five-option question; choose the target question's actual draw alignment.
    expect(seen3.size).toBe(6); expect(seen5.size).toBe(120);
  });

  it("matches all31independent BMKG May2026rows, historical anchor, leap dates and explicit sunset alternatives", () => {
    expect(calendar.cases).toHaveLength(31);
    for (const c of calendar.cases) { const r = calculateWetonCalendar(c.date, "before"); expect(r.status).toBe("complete"); if (r.status === "complete") expect(r.references[0]).toMatchObject({ civilDate: c.date, weekday: c.weekday, pasaran: c.pasaran }); }
    const anchor = calculateWetonCalendar("1945-08-17", "before"); if (anchor.status !== "complete") throw new Error("Anchor rejected"); expect(anchor.references).toEqual([{ civilDate: "1945-08-17", weekday: "jumat", pasaran: "legi", weekdayNeptu: 6, pasaranNeptu: 5, neptu: 11 }]);
    for (const date of ["1900-01-01", "2000-02-29", "2026-12-31", "2099-12-31"]) {
      const before = calculateWetonCalendar(date, "before"), after = calculateWetonCalendar(date, "after"), unknown = calculateWetonCalendar(date, "unknown");
      if (before.status !== "complete" || after.status !== "complete" || unknown.status !== "complete") throw new Error("Valid boundary rejected");
      expect(unknown.references).toEqual([...before.references, ...after.references]); expect(after.references[0].civilDate).not.toBe(date);
    }
    for (const date of ["1900-02-29", "2025-02-29", "2026-04-31", "2026-13-01", "1899-12-31", "2100-01-01", "2026-5-01", "", null, {}]) expect(calculateWetonCalendar(date, "before")).toEqual({ status: "invalid" });
    for (const relation of [null, {}, { toString: () => "before" }, "17:00", "UTC"]) expect(calculateWetonCalendar("2026-05-01", relation)).toEqual({ status: "invalid" });
    const earlier = calculateWetonCalendar("1900-01-01", "before"), repeat = calculateWetonCalendar("1900-02-05", "before");
    if (earlier.status === "complete" && repeat.status === "complete") expect([repeat.references[0].weekday, repeat.references[0].pasaran]).toEqual([earlier.references[0].weekday, earlier.references[0].pasaran]);
  });

  it("renders all224matched sections for the largest tie in both languages, without private storage or network paths", () => {
    for (const locale of ["en", "zh"] as const) for (const v of [values, Array(35).fill("na")]) {
      const r = scoreWetonStory35(quiz, answersFor(v)); if (r.status !== "complete") throw new Error("Complete state rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<WetonStory35Report quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-weton-profile] h4")).toHaveLength(r.counts ? 224 : 0); expect(dom.querySelectorAll("[data-weton-count]")).toHaveLength(r.counts ? 12 : 0);
      for (const p of quiz.profiles.filter(p => r.profileIds.includes(p.id))) for (const s of p.sections) for (const x of s.paragraphs) expect(dom.textContent).toContain(x[locale]);
      expect(dom.querySelectorAll("#weton-all-guides + ul a")).toHaveLength(35);
      const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
    const code = readFileSync("components/questionnaires/WetonStory35Client.tsx", "utf8"); expect(code).not.toMatch(/sessionStorage|localStorage|clipboard|fetch\(|recordEntertainmentActivity|useEntertainmentMetrics|URLSearchParams/);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    const broken = structuredClone(quiz); broken.questions[0].options[0].directionId = "legi";
    expect(isWetonStory35ConfigurationValid(broken)).toBe(false); expect(scoreWetonStory35(broken, answersFor(values)).status).toBe("unavailable"); expect(renderToStaticMarkup(<WetonStory35Client quiz={broken} locale="en" />)).toContain("unavailable");
  });

  it("opens all72complete bilingual pages with exact public identity, metadata, directory and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await entry.default(props)); const meta = await entry.generateMetadata(props);
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelectorAll("#take-test")).toHaveLength(1); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(dom.querySelector('form fieldset[disabled]')).not.toBeNull();
        for (const control of dom.querySelectorAll('form input, form select, form button')) expect(control.matches(':disabled')).toBe(true);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />); expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const pp = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); const metadata = await guide.generateMetadata(gp);
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${pp}`); expect(maps.filter(e => e.loc === `https://fermatmind.com${pp}`)).toHaveLength(1);
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-weton-count], input[type=date]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
