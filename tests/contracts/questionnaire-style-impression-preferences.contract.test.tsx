import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { StyleImpressionReport } from "@/components/questionnaires/StyleImpressionReport";
import { StyleImpressionClient } from "@/components/questionnaires/StyleImpressionClient";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/style-impression-preferences.json", "utf8")) as Questionnaire;
const fixture = JSON.parse(readFileSync("tests/fixtures/questionnaires/style-impression-preferences-witnesses.json", "utf8")) as {
  itemBankSHA256: string; witnesses: { leaders: string[]; answers: string[]; counts: Record<string, number> }[]; impossibleHighestSets: string[][];
};
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answersFor = (values: string[]): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));

describe("Original whole-look styling preferences, without face-feature classification", () => {
  it("keeps sixteen original four-way comparisons, eight themes and equal appearance in every position", () => {
    expect(isArchetypeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(16);
    expect(quiz.directions).toHaveLength(8); expect(quiz.profiles).toHaveLength(8);
    expect(quiz.source.itemBankSha256).toBe(digest(quiz.questions)); expect(fixture.itemBankSHA256).toBe(digest(quiz.questions));
    expect(quiz.source.resultContentSha256).toBe(digest(quiz.profiles)); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(8);
      expect([0, 1, 2, 3].map(position => quiz.questions.filter(q => q.options[position].directionId === direction.id).length)).toEqual([2, 2, 2, 2]);
    }
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`SIP_${String(i + 1).padStart(2, "0")}`); expect(q.options.map(o => o.id)).toEqual(["A", "B", "C", "D"]);
      expect(new Set(q.options.map(o => o.directionId)).size).toBe(4); expect(q.options.every(o => o.score === undefined)).toBe(true);
    }
    expect(quiz.instructions?.en).toContain("Other themes are absent from that comparison, not rejected");
    expect(quiz.instructions?.en).toContain("If none is useful, you may leave");
    expect(quiz.faq.map(f => f.answer.en).join(" ")).toContain("does not inspect a face, photo, body, age or gender");
  });

  it("preserves all219 feasible highest sets from independent integer-flow witnesses, without pretending to exhaust4^16 paths", () => {
    expect(fixture.witnesses).toHaveLength(219); expect(new Set(fixture.witnesses.map(x => x.leaders.join("|"))).size).toBe(219);
    const sizes = new Map<number, number>();
    for (const row of fixture.witnesses) {
      const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
      quiz.questions.forEach((q, i) => { const option = q.options.find(o => o.id === row.answers[i]); if (!option) throw new Error("Invalid independent witness"); counts[option.directionId]++; });
      expect(counts).toEqual(row.counts); expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(16);
      const highest = Math.max(...Object.values(counts)), leaders = quiz.directions.filter(d => counts[d.id] === highest).map(d => d.id);
      expect(leaders).toEqual(row.leaders);
      expect(scoreArchetypeQuestionnaire(quiz, answersFor(row.answers))).toEqual({ status: "complete", answered: 16, counts, profileIds: leaders });
      sizes.set(leaders.length, (sizes.get(leaders.length) ?? 0) + 1);
    }
    expect(Object.fromEntries(sizes)).toEqual({ 1: 8, 2: 28, 3: 56, 4: 70, 5: 56, 8: 1 });
    expect(fixture.impossibleHighestSets).toHaveLength(36);
    for (const group of fixture.impossibleHighestSets) {
      expect([6, 7]).toContain(group.length);
      expect(2 * group.length + (8 - group.length)).toBeLessThan(16);
      expect(3 * group.length).toBeGreaterThan(16);
    }
    console.log("219feasible highest sets checked via independent answer witnesses;36six/seven-leader sets impossible by16-choice arithmetic. Not4^16individual answer executions or psychometric validation.");
  });

  it("rejects malformed inputs and an unbalanced bank while leaving partial attempts incomplete", () => {
    const complete = answersFor(fixture.witnesses[0].answers), partial = { ...complete }; delete partial.SIP_16;
    expect(scoreArchetypeQuestionnaire(quiz, partial).status).toBe("incomplete");
    for (const invalid of [null, [], { ...complete, SIP_01: "unknown" }, { ...complete, foreign: "A" }]) expect(scoreArchetypeQuestionnaire(quiz, invalid).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.questions[0].options.pop();
    expect(isArchetypeConfigurationValid(broken)).toBe(false); expect(scoreArchetypeQuestionnaire(broken, complete).status).toBe("unavailable");
    expect(renderToStaticMarkup(<StyleImpressionClient quiz={broken} locale="en" />)).toContain("edition is unavailable");
  });

  it("renders every full highest guide, including all64sections for an eight-way tie, with no percentage or secondary assignment", () => {
    for (const size of [1, 5, 8]) {
      const witness = fixture.witnesses.find(x => x.leaders.length === size)!;
      const result = scoreArchetypeQuestionnaire(quiz, answersFor(witness.answers)); if (result.status !== "complete") throw new Error("Witness rejected");
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<StyleImpressionReport quiz={quiz} result={result} locale={locale} />);
        expect(dom.querySelectorAll("[data-sip-theme]")).toHaveLength(8); expect(dom.querySelectorAll("[data-sip-profile]")).toHaveLength(size);
        expect(dom.querySelectorAll("[data-sip-profile] h4")).toHaveLength(size * 8);
        const allIds = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(allIds).size).toBe(allIds.length);
        for (const direction of quiz.directions) expect(dom.querySelector(`[data-sip-theme="${direction.id}"] [data-sip-count]`)?.textContent).toBe(`${result.counts[direction.id]} / 8`);
        for (const p of quiz.profiles.filter(p => witness.leaders.includes(p.id))) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        if (size === 8) expect(new Set(Object.values(result.counts))).toEqual(new Set([2]));
      }
    }
  });

  it("uses page memory without draft, result sharing or flow hooks, and disables entry/guide analytics", () => {
    const html = renderToStaticMarkup(<StyleImpressionClient quiz={quiz} locale="en" />);
    expect(html).toContain("no quiz-flow statistics are sent"); expect(html).not.toContain('type="checkbox"');
    const source = readFileSync("components/questionnaires/StyleImpressionClient.tsx", "utf8");
    expect(source).not.toMatch(/sessionStorage|localStorage|clipboard|recordEntertainmentActivity|useEntertainmentMetrics/);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("opens all18 bilingual public pages with full bodies, canonical pairs, directory cards and sitemap entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]);
        expect(dom.textContent).toContain(locale === "zh" ? "原创造型偏好 · 完整结果免费" : "Original style reflection · Full results free");
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />); expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const html = renderToStaticMarkup(await guide.default(gp)), meta = await guide.generateMetadata(gp); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(meta.title).toBe(profile.seo?.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-sip-count]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      const walk = (x: unknown): void => { if (!x || typeof x !== "object") return; const o = x as Record<string, unknown>; if ("en" in o && "zh" in o) { expect(String(o.en)).not.toMatch(/\p{Script=Han}/u); expect(String(o.zh)).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(walk); };
      walk(quiz);
      for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(500); expect(p.paletteSwatches).toHaveLength(4); }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
