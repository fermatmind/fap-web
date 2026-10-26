import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireGrowthReport } from "@/components/questionnaires/QuestionnaireGrowthReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slug = "growth-mindset-fixed-mindset";
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const bytes = readFileSync(`tests/fixtures/questionnaires/${slug}-reference.json`);
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(source.questions.map(q => [q.id, value === "na" ? value : q.reverse ? String(6 - Number(value)) : value]));

describe("T060 original selected-skill growth and fixed belief reflection", () => {
  it("binds12original agreements, six exact reversals and one full guide for every continuous result", () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.questions).toHaveLength(12); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.minimumRatedItems).toBe(9); expect(quiz.directions).toHaveLength(1); expect(quiz.directions[0].itemCount).toBe(12);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(["GROWTH_02", "GROWTH_04", "GROWTH_06", "GROWTH_08", "GROWTH_10", "GROWTH_12"]);
    expect(quiz.profiles).toHaveLength(1); expect(quiz.profiles[0].directionIds).toEqual(["changeability-belief"]); expect(quiz.profiles[0].sections).toHaveLength(9);
    expect(quiz.profiles[0].sections.map(s => s.id)).toEqual(["reference", "scoring", "higher-reading", "lower-reading", "mixed-missing", "examples", "comparison", "evidence", "reflection-scope"]);
    expect(quiz.profiles[0].sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(750);
    expect(quiz.questions[0].options[2].label.en).toBe("Neither agree nor disagree");
    expect(quiz.title).toEqual({ zh: "成长型与固定型思维测试", en: "Growth Mindset Test" });
    const visit = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) { expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(v.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(v).forEach(visit);
    };
    visit(quiz);
    for (const file of readdirSync("lib/questionnaires/data").filter(f => f !== `${slug}.json`)) {
      const other = JSON.parse(readFileSync(`lib/questionnaires/data/${file}`, "utf8")) as Questionnaire;
      const prompts = new Set(other.questions.flatMap(q => [q.prompt.en, q.prompt.zh]));
      for (const q of quiz.questions) expect(prompts.has(q.prompt.en) || prompts.has(q.prompt.zh)).toBe(false);
    }
  });

  it("matches325source-DP states with six reversed agreements and minimum9of12, without type assignment", () => {
    let states = new Map<string, string[]>([["0,0", []]]);
    for (const question of source.questions) {
      const next = new Map<string, string[]>();
      for (const [key, witness] of states) {
        const [rated, sum] = key.split(",").map(Number);
        for (const option of question.options) {
          const keyed = option.score === null ? null : question.reverse ? 6 - option.score! : option.score!;
          next.set(`${rated + (keyed === null ? 0 : 1)},${sum + (keyed ?? 0)}`, [...witness, option.id]);
        }
      }
      states = next;
    }
    expect(states.size).toBe(325);
    for (const [key, witness] of states) {
      const [rated, sum] = key.split(",").map(Number), answers = Object.fromEntries(source.questions.map((q, i) => [q.id, witness[i]]));
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Complete source witness rejected");
      expect(result.facets["changeability-belief"]).toEqual({ sum, rated, total: 12, mean: rated >= 9 ? Math.round(sum / rated * 10) / 10 : null });
      for (const field of ["profileId", "profileIds", "leaders", "total", "percentile"]) expect(result).not.toHaveProperty(field);
    }
    console.info("325reachable rated/keyed-sum source witnesses with6reversals; not6^12individual executions, norm calibration or psychometric validation.");
  });

  it("separates endpoints, neutral, agreeing with both directions and missing data while validating partial input and drafts", () => {
    for (const value of ["1", "3", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected endpoint");
      expect(result.facets["changeability-belief"].mean).toBe(value === "na" ? null : Number(value));
    }
    for (const rating of ["1", "5"]) {
      const answers = Object.fromEntries(source.questions.map(q => [q.id, rating]));
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected repeated rating");
      expect(result.facets["changeability-belief"].mean).toBe(3);
    }
    for (const rated of [8, 9]) {
      const answers = all("4"); source.questions.slice(rated).forEach(q => { answers[q.id] = "na"; });
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected threshold");
      expect(result.facets["changeability-belief"].mean).toBe(rated === 8 ? null : 4);
    }
    const partial = all(); delete partial.GROWTH_12; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
    for (const invalid of [null, [], new Date(), { ...all(), unknown: "3" }, { ...all(), GROWTH_01: "0" }, { GROWTH_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.minimumRatedItems = 13; }, (q: Questionnaire) => { q.profiles[0].directionIds = ["unknown"]; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const bad = structuredClone(quiz); change(bad); expect(scoreQuestionnaire(bad, all()).status).toBe("unavailable");
    }
    const draft = { version: quiz.version, savedAt: 123456, answers: all() };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123457)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 123456 + 86400000)).toBeNull();
  });

  it("keeps the entire9section continuum for either endpoint and NA, using its own agreement report", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "5", "na"]) {
      const result = scoreQuestionnaire(quiz, all(value)); if (result.status !== "complete" || !("facets" in result)) throw new Error("Rejected report witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireGrowthReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-growth-facet]")).toHaveLength(1); expect(dom.querySelectorAll("[data-growth-profile]")).toHaveLength(1); expect(dom.querySelectorAll("h4")).toHaveLength(9);
      expect(dom.querySelectorAll("[data-growth-insufficient]")).toHaveLength(value === "na" ? 1 : 0);
      expect(dom.querySelector("[data-growth-mean]")?.textContent).toBe(value === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${value}.0 / 5`);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.querySelector("[data-maturity-facet], [data-facet-score], [data-sdt-needs-facet]")).toBeNull();
      for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    }
  });

  it("publishes four native ENZH entry/guide pages with complete bodies, exact metadata and public discovery", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${slug}`, props = { params: Promise.resolve({ locale, slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(html).toContain(locale === "zh" ? "原创学习信念自评" : "Original learning-belief reflection"); expect(html).toContain(locale === "zh" ? "完整连续读法" : "Read the full continuum");
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        const profile = quiz.profiles[0], publicPath = `${path}/results/${profile.id}`, guideProps = { params: Promise.resolve({ locale, slug, profile: profile.id }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(guideProps)); const metadata = await guide.generateMetadata(guideProps);
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
        for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
        expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${slug}/results/${profile.id}` });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-growth-mean]")).toBeNull();
        if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
