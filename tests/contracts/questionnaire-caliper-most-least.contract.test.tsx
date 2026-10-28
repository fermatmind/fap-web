import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isMostLeastConfigurationValid, MOST_LEAST_TOPICS, scoreMostLeast, type MostLeastAnswers } from "@/lib/questionnaires/mostLeast";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/caliper-style-assessment-test.json", "utf8")) as Questionnaire;
const H = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const fixed = (most = "A", least = "B"): MostLeastAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, { most, least }]));
function complete(answers: unknown) { const result = scoreMostLeast(quiz, answers); if (result.status !== "complete") throw Error("Complete witness rejected"); return result; }

describe("original Caliper-style most/least format practice", () => {
  it("binds the original bank, eight own topics and full bilingual explanations", () => {
    expect(isMostLeastConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(H({ directions: quiz.directions, questions: quiz.questions })).toBe(quiz.source.itemBankSha256);
    expect(H(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(16); expect(quiz.questions.flatMap(q => q.options)).toHaveLength(64);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(new Set(quiz.questions.flatMap(q => q.options.map(o => o.label.en))).size).toBe(64);
    expect(new Set(quiz.questions.flatMap(q => q.options.map(o => o.label.zh))).size).toBe(64);
    for (const id of MOST_LEAST_TOPICS) {
      expect(quiz.questions.filter(q => q.options.some(o => o.directionId === id))).toHaveLength(8);
      for (let p = 0; p < 4; p++) expect(quiz.questions.filter(q => q.options[p].directionId === id)).toHaveLength(2);
    }
    function bilingual(v: unknown) {
      if (!v || typeof v !== "object") return;
      if ("en" in v && "zh" in v) { const text = v as { en: string; zh: string }; expect(text.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(text.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(v).forEach(bilingual);
    }
    bilingual(quiz);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(350);
    }
    expect(readFileSync("public/fonts/noto-sans-sc/caliper-style-assessment-test-700.ttf").byteLength).toBeLessThan(300000);
  });

  it("keeps both counts visible even when every difference is zero", () => {
    const result = complete(fixed());
    expect(Object.keys(result.counts)).toEqual(MOST_LEAST_TOPICS);
    for (const count of Object.values(result.counts)) expect(count).toEqual({ most: 2, least: 2, difference: 0 });
    expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("percentile");
  });

  it("reaches both extremes for every topic and conserves sixteen Most and Least selections", () => {
    for (const topic of MOST_LEAST_TOPICS) for (const side of ["most", "least"] as const) {
      const answers = Object.fromEntries(quiz.questions.map(q => {
        const target = q.options.find(o => o.directionId === topic), other = q.options.find(o => o !== target)!;
        return [q.id, target ? (side === "most" ? { most: target.id, least: other.id } : { most: other.id, least: target.id }) : { most: "A", least: "B" }];
      }));
      const result = complete(answers);
      expect(result.counts[topic]).toEqual(side === "most" ? { most: 8, least: 0, difference: 8 } : { most: 0, least: 8, difference: -8 });
      expect(Object.values(result.counts).reduce((s, c) => s + c.most, 0)).toBe(16);
      expect(Object.values(result.counts).reduce((s, c) => s + c.least, 0)).toBe(16);
      expect(Object.values(result.counts).reduce((s, c) => s + c.difference, 0)).toBe(0);
    }
    // Independently recompute every ordered choice pair in every block.
    for (const q of quiz.questions) for (const most of q.options) for (const least of q.options.filter(o => o.id !== most.id)) {
      const answers = { ...fixed(), [q.id]: { most: most.id, least: least.id } }, expected = Object.fromEntries(MOST_LEAST_TOPICS.map(id => [id, { most: 0, least: 0, difference: 0 }]));
      for (const block of quiz.questions) { expected[block.options.find(o => o.id === answers[block.id].most)!.directionId as keyof typeof expected].most++; expected[block.options.find(o => o.id === answers[block.id].least)!.directionId as keyof typeof expected].least++; }
      for (const c of Object.values(expected)) c.difference = c.most - c.least;
      expect(complete(answers).counts).toEqual(expected);
    }
  });

  it("withholds partial records and rejects duplicate sides, foreign keys and malformed values", () => {
    expect(scoreMostLeast(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    const partial = fixed(); delete partial.ML_16; partial.ML_15 = { most: "A" };
    expect(scoreMostLeast(quiz, partial)).toEqual({ status: "incomplete", answered: 14 });
    for (const value of [null, [], "A", { ML_01: Object.create({ most: "E", least: "B" }) }, { extra: {} }, { ML_01: null }, { ML_01: [] }, { ML_01: { most: "A", least: "A" } }, { ML_01: { most: "E" } }, { ML_01: { most: 1 } }, { ML_01: { most: "A", score: 2 } }, { ML_01: { most: undefined } }]) expect(scoreMostLeast(quiz, value).status).toBe("invalid");
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
    // The one-choice dispatcher must not silently interpret two-sided answers.
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 });
  });

  it("fails closed on broken identity, option mapping, sparse blocks or incomplete explanations", () => {
    const mutations: ((q: Questionnaire) => void)[] = [q => { q.source.scoringVersion = "unknown"; }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.questions[0].options[0].directionId = "pause"; }, q => { q.questions[0].options[0].score = 1; }, q => { delete q.questions[0]; }, q => { q.questions[0].options.pop(); }, q => { q.profiles[0].sections[0].paragraphs.pop(); }, q => { q.profiles[0].title.zh = ""; }, q => { q.guide.pop(); }, q => { q.references![0].url = "https://example.com"; }];
    for (const mutate of mutations) { const copy = structuredClone(quiz); mutate(copy); expect(isMostLeastConfigurationValid(copy)).toBe(false); expect(scoreMostLeast(copy, fixed())).toEqual({ status: "unavailable", answered: 0 }); }
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("renders the native bilingual entry and all sixteen public guides with exact metadata and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
        const dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          const html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props);
          dom.innerHTML = html; expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-most-least-topic]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
