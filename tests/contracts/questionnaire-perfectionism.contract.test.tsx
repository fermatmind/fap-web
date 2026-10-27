import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isSapsConfigurationValid } from "@/lib/questionnaires/saps";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnaireSapsReport, QuestionnaireSapsNextSteps } from "@/components/questionnaires/QuestionnaireSapsReport";
import { QuestionnaireSapsAttribution } from "@/components/questionnaires/QuestionnaireSapsAttribution";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/perfectionism.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/perfectionism-reference.json");
const ref = JSON.parse(bytes.toString("utf8")) as {
  questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"];
  sourceOrderItems: { id: string; dimension: "standards" | "discrepancy"; en: string; zh: string }[];
};
const all = (value = "4"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const expected = (answers: QuestionnaireAnswers) => Object.fromEntries(["standards", "discrepancy"].map(id => {
  const sourceRows = ref.sourceOrderItems.filter(row => row.dimension === id);
  const sum = sourceRows.reduce((n, row) => n + Number(answers[row.id]), 0);
  return [id, { sum, mean: sum / sourceRows.length, rated: 4, total: 4 }];
}));
const complete = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers);
  assert.equal(result.status, "complete");
  if (result.status !== "complete" || !("sapsDomains" in result)) throw new Error("No SAPS source result");
  assert.deepEqual(result.sapsDomains, expected(answers));
  expect(Object.keys(result)).toEqual(["status", "answered", "sapsDomains"]);
  return result;
};

describe("T187 complete source SAPS with independent means and working Chinese", () => {
  it("binds the exact eight English/working Chinese items, seven anchors, source parity and two complete guides", () => {
    expect(isSapsConfigurationValid(quiz)).toBe(true);
    expect(quiz.kind).toBe("saps"); expect(quiz.questions).toEqual(ref.questions); expect(quiz.profiles).toEqual(ref.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["standards", 4], ["discrepancy", 4]]);
    for (const [i, question] of quiz.questions.entries()) {
      expect(question.prompt).toEqual({ en: ref.sourceOrderItems[i].en, zh: ref.sourceOrderItems[i].zh });
      expect(question.reverse).toBe(false); expect(question.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
      expect(question.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(question.options.every(o => o.directionId === (i % 2 ? "discrepancy" : "standards"))).toBe(true);
    }
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(8); for (const section of profile.sections) { expect(section.paragraphs).toHaveLength(2); for (const paragraph of section.paragraphs) { expect(paragraph.en.trim()).not.toBe(""); expect(paragraph.zh).toMatch(/\p{Script=Han}/u); } } }
    expect(quiz.faq[4].answer.en).toContain("FermatMind editors");
    expect(quiz.profiles[1].sections[7].paragraphs[0].en).toContain("dissatisfaction with performance relative to expectations");
  });

  it("compares both source groups and coupled states against a source-row oracle across 7203 checks", () => {
    let compared = 0;
    for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) for (let c = 1; c <= 7; c++) for (let d = 1; d <= 7; d++) {
      const values = [a, b, c, d];
      for (const mode of ["standards", "discrepancy", "coupled"]) {
        const answers = all("1");
        ref.sourceOrderItems.filter(row => row.dimension === (mode === "discrepancy" ? "discrepancy" : "standards")).forEach((row, i) => { answers[row.id] = String(values[i]); });
        if (mode === "coupled") ref.sourceOrderItems.filter(row => row.dimension === "discrepancy").forEach((row, i) => { answers[row.id] = String(8 - values[i]); });
        complete(answers); compared++;
      }
    }
    expect(compared).toBe(7203);
    expect(complete(all("1")).sapsDomains.standards.mean).toBe(1);
    expect(complete(all("7")).sapsDomains.discrepancy.mean).toBe(7);
  });

  it("renders both full source guides and actual means/sums without truncating to a five-point scale", () => {
    for (const locale of ["en", "zh"] as const) for (const value of ["1", "4", "7"]) {
      const result = complete(all(value)), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireSapsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-saps-mean]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(16);
      for (const id of ["standards", "discrepancy"] as const) {
        expect(dom.querySelector(`[data-saps-mean="${id}"]`)?.textContent).toContain(`${Number(value).toFixed(2)}`);
        expect(dom.querySelector(`[data-saps-sum="${id}"]`)?.textContent).toContain(String(4 * Number(value)));
      }
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(dom.textContent).toContain(locale === "en" ? "FermatMind editors" : "费马编辑");
      const ids = [...dom.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("rejects partial, invalid and drifted configurations and keeps draft validation on the same source identity", () => {
    const partial = all(); delete partial[quiz.questions[7].id]; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 7 });
    for (const bad of [null, [], { ...all(), unknown: "4" }, { ...all(), "saps-01": "na" }, { ...all(), "saps-01": 4 }, { ...all(), "saps-01": "8" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const change of [(q: Questionnaire) => { q.questions[0].reverse = true; }, (q: Questionnaire) => { q.questions[0].options.pop(); }, (q: Questionnaire) => { q.questions[0].options[0].score = 7; }, (q: Questionnaire) => { q.questions[0].prompt.en += "changed"; }]) {
      const bad = structuredClone(quiz); change(bad); expect(isSapsConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, all())).toEqual({ status: "unavailable", answered: 0 });
    }
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { "saps-01": "7" } }), 200)).toEqual({ "saps-01": "7" });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: "old", savedAt: 100, answers: { "saps-01": "7" } }), 200)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { "saps-01": "7" } }), 86400100)).toBeNull();
  });

  it("rejects sparse slots throughout the fixed SAPS configuration before scoring", () => {
    const holes = [
      (q: Questionnaire) => { delete q.questions[0]; },
      (q: Questionnaire) => { delete q.directions[0]; },
      (q: Questionnaire) => { delete q.profiles[0]; },
      (q: Questionnaire) => { delete q.questions[0].options[0]; },
      (q: Questionnaire) => { delete q.profiles[0].sections[0]; },
      (q: Questionnaire) => { delete q.profiles[0].sections[0].paragraphs[0]; },
    ];
    for (const makeHole of holes) {
      const bad = structuredClone(quiz); makeHole(bad); expect(isSapsConfigurationValid(bad)).toBe(false);
      expect(() => scoreQuestionnaire(bad, all())).not.toThrow();
      expect(scoreQuestionnaire(bad, all())).toEqual({ status: "unavailable", answered: 0 });
    }
  });

  it("shows proper attribution and useful optional next steps without assigning another personality framework", () => {
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<><QuestionnaireSapsAttribution locale={locale} /><QuestionnaireSapsNextSteps locale={locale} /></>);
      expect(dom.querySelector("[data-saps-attribution]")?.closest("details")).toBeNull();
      expect(dom.textContent).toContain("Rice, K. G."); expect(dom.textContent).toContain("2014"); expect(dom.querySelector('a[href="https://www.kennethwang.com/apsr/scales/SAPS.pdf"]')).not.toBeNull();
      expect(dom.querySelector(`a[href="/${locale}/tests#more-tests"]`)).not.toBeNull(); expect(dom.textContent).not.toContain("MBTI");
    }
  });

  it("binds public entry/guide metadata descriptions, canonical pairs, attribution and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const page = await import("@/components/questionnaires/QuestionnairePage"); const guide = await import("@/components/questionnaires/QuestionnaireGuide");
    const urls = appendFunSitemapEntries([]).map(row => row.loc);
    for (const locale of ["en", "zh"] as const) {
      const params = Promise.resolve({ locale, slug: quiz.slug }), metadata = await page.generateMetadata({ params });
      expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.title).toBe(quiz.seoTitle[locale]);
      const path = `/${locale}/tests/explore/perfectionism`; expect(urls).toContain(`https://fermatmind.com${path}`);
      expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      expect(metadata.alternates?.languages).toMatchObject({ en: "https://fermatmind.com/en/tests/explore/perfectionism", "zh-CN": "https://fermatmind.com/zh/tests/explore/perfectionism" });
      const entry = renderToStaticMarkup(await page.default({ params })); expect(entry).toContain("data-saps-attribution");
      const entryDom = document.createElement("div"); entryDom.innerHTML = entry;
      const method = entryDom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method).not.toBeNull();
      expect(method!.querySelectorAll("p")).toHaveLength(6);
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(method!.textContent).toContain(paragraph[locale]);
      for (const profile of quiz.profiles) {
        const args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, meta = await guide.generateMetadata(args);
        expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}/results/${profile.id}`);
        expect(urls).toContain(`https://fermatmind.com${path}/results/${profile.id}`);
        const markup = renderToStaticMarkup(await guide.default(args)), dom = document.createElement("div"); dom.innerHTML = markup;
        expect(markup).toContain("data-saps-attribution"); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
});
