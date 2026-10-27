import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireCommitmentReport } from "@/components/questionnaires/QuestionnaireCommitmentReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreLikertQuestionnaire, type FacetResult } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/relationship-commitment.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/relationship-commitment-reference.json");
const reference = JSON.parse(bytes.toString()) as { original_items: { id: string; prompt: { en: string; zh: string }; reverse: boolean; direction: string }[]; questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; literal_reverse_ids: string[]; worked_examples: { id: string; responses: number[]; reverse_positions: number[]; expected_sum: number; expected_mean_one_decimal: string }[] };
const groups: Record<string, string[]> = {
  "continuing-intention": ["RC_01", "RC_05", "RC_09", "RC_13", "RC_17", "RC_21"],
  "current-satisfaction": ["RC_02", "RC_06", "RC_10", "RC_14", "RC_18", "RC_22"],
  "outside-options": ["RC_03", "RC_07", "RC_11", "RC_15", "RC_19", "RC_23"],
  "relationship-linked-investment": ["RC_04", "RC_08", "RC_12", "RC_16", "RC_20", "RC_24"],
};
const reversals = new Set(["RC_06", "RC_09", "RC_11", "RC_12", "RC_17", "RC_18", "RC_19", "RC_20"]);
const neutral = () => Object.fromEntries(Object.values(groups).flat().map(id => [id, "3"]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreLikertQuestionnaire(quiz, answers);
  if (result.status !== "complete") throw new Error(`Expected complete, got ${result.status}`);
  return result;
}
function oracle(answers: QuestionnaireAnswers) {
  return Object.fromEntries(Object.entries(groups).map(([direction, ids]) => {
    const values = ids.filter(id => answers[id] !== "na").map(id => reversals.has(id) ? 6 - Number(answers[id]) : Number(answers[id]));
    const sum = values.reduce((a, b) => a + b, 0);
    return [direction, { sum, rated: values.length, total: 6, mean: values.length === 6 ? Number((sum / 6).toFixed(1)) : null }];
  }));
}
function domFor(result: Extract<FacetResult, { status: "complete" }>, locale: "en" | "zh") {
  const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCommitmentReport quiz={quiz} result={result} locale={locale}/>); return dom;
}

describe("T086 original four-part relationship reflection", () => {
  it("retains24originalbilingualitems,4distinctparts,8literalreversekeys and4FULL8 without inheriting scale validity", () => {
    expect(quiz.code).toBe("FM_RELATIONSHIP_COMMITMENT_REFLECTION"); expect(quiz.source.formCode).toBe("fm_relationship_commitment_reflection_24_v1");
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.minimumRatedItems).toBe(6); expect(quiz.questions).toHaveLength(24);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual([...reversals]); expect(reference.literal_reverse_ids).toEqual([...reversals]);
    for (const [i, q] of quiz.questions.entries()) {
      const original = reference.original_items[i]; expect(q.id).toBe(original.id); expect(q.prompt).toEqual(original.prompt); expect(q.reverse).toBe(original.reverse);
      expect(q.options.map(o => o.directionId)).toEqual(Array(6).fill(original.direction)); expect(groups[original.direction]).toContain(q.id);
      expect(q.options.map(o => [o.id, o.score])).toEqual([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["na", null]]);
    }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(8); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").match(/\b[\w’'-]+\b/g)!.length).toBeGreaterThanOrEqual(600);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
      expect(p.sections.flatMap(s => s.paragraphs).some(t => /[\u3400-\u9fff]/u.test(t.en))).toBe(false);
    }
  });

  it("checks364reachablepartstates,144single-itemvariants,512seededattempts and all4writtenarithmeticexamples against literal keys", () => {
    let states = 0;
    for (const [direction, ids] of Object.entries(groups)) for (let rated = 0; rated <= 6; rated++) for (let sum = rated; sum <= rated * 5; sum++) {
      const answers = neutral(), values = Array<number>(rated).fill(1); let remaining = sum - rated;
      for (let i = 0; i < rated; i++) { const add = Math.min(4, remaining); values[i] += add; remaining -= add; }
      ids.forEach((id, i) => { answers[id] = i >= rated ? "na" : String(reversals.has(id) ? 6 - values[i] : values[i]); });
      assert.deepStrictEqual(complete(answers).facets, oracle(answers)); assert.equal(complete(answers).facets[direction].rated, rated); states++;
    }
    expect(states).toBe(364);
    for (const id of Object.values(groups).flat()) for (const value of ["1", "2", "3", "4", "5", "na"]) { const answers = neutral(); answers[id] = value; assert.deepStrictEqual(complete(answers).facets, oracle(answers)); }
    let seed = 861927;
    for (let i = 0; i < 512; i++) { const answers = neutral(); for (const id of Object.keys(answers)) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; answers[id] = ["1", "2", "3", "4", "5", "na"][seed % 6]; } assert.deepStrictEqual(complete(answers).facets, oracle(answers)); }
    for (const example of reference.worked_examples) {
      const answers = neutral(); groups[example.id].forEach((id, i) => { answers[id] = String(example.responses[i]); });
      const part = complete(answers).facets[example.id]; expect(part.sum).toBe(example.expected_sum); expect((part.sum / 6).toFixed(1)).toBe(example.expected_mean_one_decimal);
    }
    console.info("T086:364independentpart rated/sum states+144single variants+512seeded attempts;not6^24physicalattempts or psychometric validation.");
  });

  it("keepsinvalid,incomplete,configurationunavailable and per-partNA separate and expires optionaldrafts", () => {
    expect(scoreLikertQuestionnaire(quiz, { RC_01: "1" })).toEqual({ status: "incomplete", answered: 1 });
    for (const value of [null, [], new Date(), { unknown: "1" }, { RC_01: "0" }, { RC_01: 3 }, Object.create({ RC_01: "1" })]) expect(scoreLikertQuestionnaire(quiz, value).status).toBe("invalid");
    expect(scoreLikertQuestionnaire({ ...quiz, minimumRatedItems: 7 }, {}).status).toBe("unavailable");
    const answers = neutral(); answers.RC_01 = "na"; const result = complete(answers);
    expect(result.facets["continuing-intention"]).toEqual({ sum: 15, rated: 5, total: 6, mean: null });
    for (const id of Object.keys(groups).slice(1)) expect(result.facets[id]).toEqual({ sum: 18, rated: 6, total: 6, mean: 3 });
    const allNA = complete(Object.fromEntries(Object.keys(answers).map(id => [id, "na"]))); expect(Object.values(allNA.facets).every(f => f.mean === null && f.rated === 0)).toBe(true);
    const draft = { version: quiz.version, savedAt: 100_000, answers: { RC_01: "4" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 100_001)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), 100_000 + 86400000)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "different" }), 100_001)).toBeNull();
  });

  it("alwaysrendersfourseparateoverviewvalues andall32fullsections,includingallNA,withoutbatterycopy or duplicate IDs", () => {
    const attempts = [neutral(), Object.fromEntries(Object.values(groups).flat().map(id => [id, "na"]))];
    for (const answers of attempts) for (const locale of ["en", "zh"] as const) {
      const result = complete(answers), dom = domFor(result, locale); expect(dom.querySelectorAll("[data-commitment-summary]")).toHaveLength(4); expect(dom.querySelectorAll("[data-commitment-guide]")).toHaveLength(4);
      for (const profile of quiz.profiles) {
        const node = dom.querySelector(`[data-commitment-guide='${profile.id}']`)!; expect(node.querySelector("h3")?.textContent).toBe(profile.title[locale]);
        for (const section of profile.sections) for (const text of section.paragraphs) expect(node.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(text[locale]);
        const mean = result.facets[profile.id].mean, overview = dom.querySelector(`[data-commitment-summary='${profile.id}']`)!;
        expect(overview.querySelector("[data-commitment-mean]")?.textContent).toBe(mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.0 / 5");
      }
      const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.textContent).not.toMatch(/battery remaining|battery remaining percentage|剩余电量|较高的负担与较高的恢复/);
    }
  });

  it("servesrealENZHentryand8fullguides withspecificSEO,visiblemethod,exacthub/sitemapidentities andclosedresultIDs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"); const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    expect((await loadQuestionnaire(quiz.slug))?.code).toBe(quiz.code); const maps = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props)); expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      for (const id of ["facet-scoring", "facet-reading", "facet-comparison"]) expect(dom.querySelector("section[aria-labelledby='questionnaire-method']")?.textContent).toContain(quiz.guide.find(s => s.id === id)!.paragraphs[0][locale]);
      const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe("https://fermatmind.com" + path);
      const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale}/>); expect(directory.querySelectorAll(`a[href='${path}']`)).toHaveLength(1); expect(maps.filter(x => x.loc === "https://fermatmind.com" + path)).toHaveLength(1);
      for (const p of quiz.profiles) {
        const path = `/${locale}/tests/explore/${quiz.slug}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(props)); expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);
        for (const s of p.sections) for (const text of s.paragraphs) expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
        const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo!.title[locale]); expect(meta.description).toBe(p.seo!.description[locale]); expect(meta.alternates?.canonical).toBe("https://fermatmind.com" + path); expect(maps.filter(x => x.loc === "https://fermatmind.com" + path)).toHaveLength(1);
      }
    }
    for (const profile of ["fragile", "all-in", "RC_01", "unknown"]) await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile }) })).rejects.toThrow();
  });
});
