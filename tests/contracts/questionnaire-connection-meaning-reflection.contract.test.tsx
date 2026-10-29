import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { ConnectionMeaningReport } from "@/components/questionnaires/ConnectionMeaningReport";
import { ConnectionMeaningClient } from "@/components/questionnaires/ConnectionMeaningClient";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/connection-meaning-reflection.json", "utf8")) as Questionnaire;
const order = ["felt-familiarity", "noticing-similarities", "pausing-after-intensity", "checking-understanding", "reflecting-on-meaning"];
const unscored = (): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));
const digest = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");

describe("Original connection-meaning reflection without soul-bond assignment", () => {
  it("keeps fifteen direct frequency prompts, five groups of three, Sometimes=3 and a distinct unscored response", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(15); expect(quiz.minimumRatedItems).toBe(3);
    expect(quiz.directions.map(d => d.id)).toEqual(order); expect(quiz.directions.map(d => d.itemCount)).toEqual([3, 3, 3, 3, 3]);
    expect(quiz.source.itemBankSha256).toBe(digest(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(digest(quiz.profiles));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`CMR_${String(i + 1).padStart(3, "0")}`); expect(q.reverse).toBe(false);
      expect(q.options.every(o => o.directionId === order[Math.floor(i / 3)])).toBe(true);
      expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options[2].label).toEqual({ en: "Sometimes", zh: "有时" });
    }
    expect(quiz.instructions?.en).toContain("one connection with another adult"); expect(quiz.instructions?.en).toContain("past three months");
    expect(quiz.faq.map(f => f.answer.en).join(" ")).toContain("It cannot identify a soul bond");
    expect(quiz.questions.map(q => q.prompt.en).join(" ")).not.toMatch(/birth date|birth time|birthplace|aura|not-self|lunar/i);
    for (const slug of ["connection-ideals", "connection-belonging-check-in", "attachment-styles", "sternberg-love", "relationship-worry-habits"]) expect(quiz.questions).not.toEqual(JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")).questions);
  });

  it("checks all140 independent rated-count/sum states, requiring all three numeric ratings per part", () => {
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
      const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("Complete witness rejected");
      expect(result.facets[direction]).toEqual({ sum, rated, total: 3, mean: rated >= 3 ? Math.round(sum / rated * 10) / 10 : null });
      for (const other of order.filter(id => id !== direction)) expect(result.facets[other]).toEqual({ sum: 0, rated: 0, total: 3, mean: null });
      expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("leaders");
    }
    const partial = unscored(); delete partial.CMR_015; expect(scoreLikertQuestionnaire(quiz, partial).status).toBe("incomplete");
    expect(scoreLikertQuestionnaire(quiz, { ...unscored(), CMR_001: "unknown" }).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.directions[0].itemCount = 99; expect(isLikertConfigurationValid(broken)).toBe(false);
    expect(renderToStaticMarkup(<ConnectionMeaningClient quiz={broken} locale="en" />)).toContain("edition is unavailable");
  });

  it("shows raw-sum/rated-count means, all40full sections and an explicit complete all-unscored result", () => {
    const answers = unscored(); ["1", "2", "4"].forEach((v, i) => { answers[quiz.questions[i].id] = v; });
    quiz.questions.slice(3, 5).forEach(q => { answers[q.id] = "3"; });
    quiz.questions.slice(6, 9).forEach(q => { answers[q.id] = "5"; });
    quiz.questions.slice(9, 12).forEach(q => { answers[q.id] = "3"; });
    quiz.questions.slice(12, 15).forEach(q => { answers[q.id] = "1"; });
    const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("Complete witness rejected");
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<ConnectionMeaningReport quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector('[data-cmr-facet="felt-familiarity"] [data-cmr-mean]')?.textContent).toBe("2.3 / 5");
    expect(dom.querySelector('[data-cmr-facet="felt-familiarity"] [data-cmr-sum]')?.textContent).toContain("7 / 3");
    expect(dom.querySelector('[data-cmr-facet="noticing-similarities"] [data-cmr-mean]')?.textContent).toBe("Insufficient information");
    expect(dom.querySelector('[data-cmr-facet="noticing-similarities"] [data-cmr-sum]')).toBeNull();
    expect(dom.querySelector('[data-cmr-facet="pausing-after-intensity"] [data-cmr-mean]')?.textContent).toBe("5.0 / 5");
    expect(dom.querySelector('[data-cmr-facet="checking-understanding"] [data-cmr-mean]')?.textContent).toBe("3.0 / 5");
    expect(dom.querySelector('[data-cmr-facet="reflecting-on-meaning"] [data-cmr-mean]')?.textContent).toBe("1.0 / 5");
    expect(dom.querySelectorAll("[data-cmr-profile] h4")).toHaveLength(40);
    for (const p of quiz.profiles) for (const s of p.sections) for (const x of s.paragraphs) expect(dom.textContent).toContain(x.en);
    const allNA = scoreLikertQuestionnaire(quiz, unscored()); if (allNA.status !== "complete") throw new Error("AllNA rejected");
    expect(renderToStaticMarkup(<ConnectionMeaningReport quiz={quiz} result={allNA} locale="zh" />)).toContain("没有生成个人均值");
  });

  it("uses a memory-only client and analytics-disabled entry/guide paths without draft or personal-share hooks", () => {
    const html = renderToStaticMarkup(<ConnectionMeaningClient quiz={quiz} locale="en" />);
    expect(html).toContain("no quiz-flow statistics are sent"); expect(html).not.toContain('type="checkbox"');
    const source = readFileSync("components/questionnaires/ConnectionMeaningClient.tsx", "utf8");
    expect(source).not.toMatch(/sessionStorage|localStorage|clipboard|recordEntertainmentActivity|useEntertainmentMetrics/);
    expect(source).toContain("data-cmr-context");
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("opens all12 bilingual public pages, full bodies, canonical pairs and directory/sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(dom.textContent).toContain(locale === "zh" ? "原创连接反思 · 五篇全文免费" : "Original connection reflection · Five full guides free"); expect(html).not.toContain('type="checkbox"');
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />); expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const html = renderToStaticMarkup(await guide.default(gp)), meta = await guide.generateMetadata(gp); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(meta.title).toBe(profile.seo?.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-cmr-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      const walk = (x: unknown): void => { if (!x || typeof x !== "object") return; const o = x as Record<string, unknown>; if ("en" in o && "zh" in o) { expect(String(o.en)).not.toMatch(/\p{Script=Han}/u); expect(String(o.zh)).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(walk); };
      walk(quiz);
      for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThanOrEqual(650); }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
