import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { OutfitLinePreferencesReport } from "@/components/questionnaires/OutfitLinePreferencesReport";
import { OutfitLinePreferencesClient } from "@/components/questionnaires/OutfitLinePreferencesClient";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/outfit-line-preferences.json", "utf8")) as Questionnaire;
const order = ["long-line", "ease-and-room", "even-balance", "compact-contrast", "soft-drape"];
const unscored = (): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");

describe("Original whole-outfit line preferences, distinct from graphic Aesthetic moods", () => {
  it("keeps fifteen direct original prompts, five groups of three, a numeric neutral and a separate unscored response", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(15);
    expect(quiz.minimumRatedItems).toBe(3); expect(quiz.directions.map(d => d.id)).toEqual(order);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([3, 3, 3, 3, 3]);
    expect(quiz.source.itemBankSha256).toBe(digest(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(digest(quiz.profiles));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`OLP_${String(i + 1).padStart(3, "0")}`); expect(q.reverse).toBe(false);
      expect(q.options.every(o => o.directionId === order[Math.floor(i / 3)])).toBe(true);
      expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options[2].label).toEqual({ en: "Neutral", zh: "中立" });
    }
    expect(quiz.instructions?.en).toContain("garment lines you would currently choose"); expect(quiz.instructions?.en).toContain("Rate preference rather than body shape");
    expect(quiz.faq.map(f => f.answer.en).join(" ")).toContain("without a total, winner, body-type label or yin-yang placement");
    const aesthetic = JSON.parse(readFileSync("lib/questionnaires/data/aesthetic-core-test.json", "utf8"));
    expect(aesthetic.questions).toHaveLength(18); expect(aesthetic.kind).toBe("archetype"); expect(quiz.questions).not.toEqual(aesthetic.questions);
    expect(quiz.questions.map(q => q.prompt.en).join(" ")).not.toMatch(/\b(?:height|weight|age|gender|face)\b/i);
  });

  it("checks all140 independent count/sum witnesses and withholds any part with fewer than three numeric ratings", () => {
    let states = new Map<string, string[]>([["0|0", []]]);
    for (let i = 0; i < 3; i++) {
      const next = new Map<string, string[]>();
      for (const values of states.values()) for (const value of ["na", "1", "2", "3", "4", "5"]) {
        const v = [...values, value], rated = v.filter(x => x !== "na").length, sum = v.reduce((n, x) => n + (x === "na" ? 0 : Number(x)), 0);
        next.set(`${rated}|${sum}`, v);
      }
      states = next;
    }
    expect(states.size).toBe(28);
    for (const direction of order) for (const [key, values] of states) {
      const answers = unscored(), [rated, sum] = key.split("|").map(Number);
      quiz.questions.filter(q => q.options[0].directionId === direction).forEach((q, i) => { answers[q.id] = values[i]; });
      const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("complete witness rejected");
      expect(result.facets[direction]).toEqual({ sum, rated, total: 3, mean: rated === 3 ? Math.round(sum / 3 * 10) / 10 : null });
      for (const other of order.filter(id => id !== direction)) expect(result.facets[other]).toEqual({ sum: 0, rated: 0, total: 3, mean: null });
      expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("leaders");
    }
    const partial = unscored(); delete partial.OLP_015; expect(scoreLikertQuestionnaire(quiz, partial).status).toBe("incomplete");
    expect(scoreLikertQuestionnaire(quiz, { ...unscored(), OLP_001: "unknown" }).status).toBe("invalid");
  });

  it("shows agreement means and all40 full sections without imputing a missing preference", () => {
    const answers = unscored(); ["1", "2", "4"].forEach((v, i) => { answers[quiz.questions[i].id] = v; });
    quiz.questions.slice(3, 5).forEach(q => { answers[q.id] = "3"; });
    const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("complete witness rejected");
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<OutfitLinePreferencesReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector('[data-olp-facet="long-line"] [data-olp-mean]')?.textContent).toBe("2.3 / 5");
    expect(dom.querySelector('[data-olp-facet="long-line"] [data-olp-sum]')?.textContent).toContain("7 / 3");
    expect(dom.querySelector('[data-olp-facet="ease-and-room"] [data-olp-mean]')?.textContent).toBe("Insufficient information");
    expect(dom.querySelectorAll("[data-olp-profile] h4")).toHaveLength(40);
    for (const p of quiz.profiles) for (const s of p.sections) for (const x of s.paragraphs) expect(dom.textContent).toContain(x.en);
    const allNA = scoreLikertQuestionnaire(quiz, unscored()); if (allNA.status !== "complete") throw new Error("allNA rejected");
    expect(renderToStaticMarkup(<OutfitLinePreferencesReport quiz={quiz} result={allNA} locale="zh" />)).toContain("没有生成个人均值");
  });

  it("has a memory-only client, no personal share or flow hooks, and analytics-disabled entry/guide paths", () => {
    const html = renderToStaticMarkup(<OutfitLinePreferencesClient quiz={quiz} locale="en" />);
    expect(html).toContain("no quiz-flow statistics are sent"); expect(html).not.toContain('type="checkbox"');
    const source = readFileSync("components/questionnaires/OutfitLinePreferencesClient.tsx", "utf8");
    expect(source).not.toMatch(/sessionStorage|localStorage|clipboard|recordEntertainmentActivity|useEntertainmentMetrics/);
    expect(source).toContain("data-olp-context");
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("renders all12 public bilingual pages, full bodies, canonical pairs and directory/sitemap visibility", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(html).not.toContain('type="checkbox"');
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />); expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const html = renderToStaticMarkup(await guide.default(gp)), meta = await guide.generateMetadata(gp); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(meta.title).toBe(profile.seo?.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-olp-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      const walk = (x: unknown): void => { if (!x || typeof x !== "object") return; const o = x as Record<string, unknown>; if ("en" in o && "zh" in o) { expect(String(o.en)).not.toMatch(/\p{Script=Han}/u); expect(String(o.zh)).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(walk); };
      walk(quiz);
      for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(500); }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
