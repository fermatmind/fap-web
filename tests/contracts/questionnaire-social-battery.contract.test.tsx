import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireFacetReport } from "@/components/questionnaires/QuestionnaireFacetReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/social-battery-test.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/social-battery-reference.json");
const source = JSON.parse(sourceBytes.toString());
const facetIndices = {
  "interaction-load": [0, 4, 8, 12, 16],
  "coordination-load": [1, 5, 9, 13, 17],
  "quiet-recovery": [2, 6, 10, 14, 18],
  "easy-company": [3, 7, 11, 15, 19],
};
const reverseIndices = new Set([8, 9, 10, 11, 16, 17, 18, 19]);
const answersWith = (value: string): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));

describe("T003 original social battery contextual reflection", () => {
  it("preserves its original20items, frequency anchors, independent4parts and explicit non-experienced option", () => {
    expect(quiz.kind).toBe("likert"); expect(isLikertConfigurationValid(quiz)).toBe(true);
    expect(quiz.title).toEqual({ en: "Social Battery Test", zh: "社交电量测试" });
    expect(quiz.minimumRatedItems).toBe(3); expect(quiz.questions).toEqual(source.questions);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex"));
    expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.directions.map(d => d.id)).toEqual(Object.keys(facetIndices));
    expect(quiz.questions.flatMap((q, i) => q.reverse ? [i] : [])).toEqual([...reverseIndices]);
    for (const [id, indices] of Object.entries(facetIndices)) for (const index of indices) {
      const q = quiz.questions[index];
      expect(q.id).toBe(`SB_${String(index + 1).padStart(2, "0")}`);
      expect(q.options.map(o => o.directionId)).toEqual(Array(6).fill(id));
      expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
      expect(q.options.at(-1)?.score).toBeNull();
    }
    const walk = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const row = value as Record<string, unknown>;
      if ("zh" in row || "en" in row) {
        expect(String(row.zh)).toMatch(/\p{Script=Han}/u);
        expect(String(row.en).trim().length).toBeGreaterThan(0);
        expect(String(row.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder|lorem ipsum/u);
      } else Object.values(row).forEach(walk);
    };
    walk(quiz);
    for (const profile of quiz.profiles) expect(profile.sections).toHaveLength(9);
  });

  it("checks every6^5response pattern separately for each independent facet, including all missing and reverse-scored states", () => {
    const choices = ["1", "2", "3", "4", "5", "na"], all = answersWith("3");
    let witnesses = 0;
    for (const [id, indices] of Object.entries(facetIndices)) {
      const reachable = new Set<string>();
      for (let n = 0; n < 6 ** 5; n++) {
        const answers = { ...all }; let remainder = n, sum = 0, rated = 0;
        for (const index of indices) {
          const choice = choices[remainder % 6]; remainder = Math.floor(remainder / 6);
          answers[`SB_${String(index + 1).padStart(2, "0")}`] = choice;
          if (choice !== "na") { sum += reverseIndices.has(index) ? 6 - Number(choice) : Number(choice); rated++; }
        }
        const result = scoreLikertQuestionnaire(quiz, answers);
        if (result.status !== "complete") throw new Error("Complete original response rejected");
        expect(result.facets[id]).toEqual({ sum, rated, total: 5, mean: rated >= 3 ? Number((sum / rated).toFixed(1)) : null });
        for (const other of Object.keys(facetIndices).filter(v => v !== id)) expect(result.facets[other]).toEqual({ sum: 15, rated: 5, total: 5, mean: 3 });
        reachable.add(`${rated}:${sum}`); witnesses++;
      }
      expect(reachable.size).toBe(66);
    }
    expect(witnesses).toBe(31104);
    console.info("Social battery: 31,104 independent-facet response witnesses (4 × 6^5), covering all66rated-count/sum states per facet. This is not an enumeration of6^20whole questionnaires or psychometric validation.");
  }, 30000);

  it("keeps missing, partial, extreme, tied and invalid responses distinct without invented total/type/percentage", () => {
    const incomplete = answersWith("3"); delete incomplete.SB_20;
    expect(scoreLikertQuestionnaire(quiz, incomplete)).toEqual({ status: "incomplete", answered: 19 });
    for (const raw of [null, [], new Date(), { unknown: "1" }, { SB_01: "0" }, { SB_01: 1 }]) expect(scoreLikertQuestionnaire(quiz, raw).status).toBe("invalid");
    for (const mode of ["low", "high"] as const) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(mode === "high" ? (reverseIndices.has(i) ? 1 : 5) : (reverseIndices.has(i) ? 5 : 1))]));
      const result = scoreLikertQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Extreme witness rejected");
      expect(Object.values(result.facets).map(v => v.mean)).toEqual(Array(4).fill(mode === "high" ? 5 : 1));
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("percentile");
    }
    const missing = scoreLikertQuestionnaire(quiz, answersWith("na"));
    if (missing.status !== "complete") throw new Error("Explicit complete NA attempt rejected");
    for (const facet of Object.values(missing.facets)) expect(facet).toEqual({ sum: 0, rated: 0, total: 5, mean: null });
    const mixed = answersWith("3"); Object.assign(mixed, { SB_01: "2", SB_05: "4", SB_09: "1", SB_13: "na", SB_17: "na" });
    const result = scoreLikertQuestionnaire(quiz, mixed);
    if (result.status !== "complete") throw new Error("Mixed witness rejected");
    expect(result.facets["interaction-load"]).toEqual({ sum: 11, rated: 3, total: 5, mean: 3.7 });
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 9;
    expect(scoreLikertQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 100000000, answers: { SB_01: "na", SB_02: "5" } };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), draft.savedAt + 1)).toEqual(draft.answers);
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "old" }), draft.savedAt + 1)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), draft.savedAt + 86400000)).toBeNull();
  });

  it("server-renders both entries and all8complete public facet guides with actual SEO and no personal means", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    try {
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        const path = `/${locale}/tests/explore/${quiz.slug}`;
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]);
        expect(html).not.toContain("data-facet-score"); expect(html).toContain(quiz.instructions![locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const guidePath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          expect(html).toContain(`href="${guidePath}"`); expect(isMissingFunRoute(guidePath)).toBe(false);
          expect(maps.some(e => e.loc === `https://fermatmind.com${guidePath}`)).toBe(true);
          const rendered = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props);
          const dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${guidePath}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${profile.id}` });
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
          expect(rendered).not.toContain("data-facet-score");
        }
        const raw = scoreLikertQuestionnaire(quiz, answersWith("na"));
        if (raw.status !== "complete") throw new Error("NA witness rejected");
        const resultHtml = renderToStaticMarkup(<QuestionnaireFacetReport quiz={quiz} result={raw} locale={locale} />);
        const dom = document.createElement("div"); dom.innerHTML = resultHtml;
        expect(dom.querySelectorAll("[data-facet-score]")).toHaveLength(4);
        expect(dom.textContent).toContain(locale === "zh" ? "资料不足" : "Insufficient information");
        expect(dom.querySelectorAll("h4")).toHaveLength(36);
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
