import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isEightValuesConfigurationValid, scoreEightValuesQuestionnaire, type EightValuesResult } from "@/lib/questionnaires/eightValues";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireEightValuesReport } from "@/components/questionnaires/QuestionnaireEightValuesReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/8-values-political.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/8-values-political-reference.json");
type Complete = Extract<EightValuesResult, { status: "complete" }>;
const reference = JSON.parse(bytes.toString()) as {
  questions: Questionnaire["questions"]; effects: NonNullable<Questionnaire["eightValues"]>["effects"];
  profiles: Questionnaire["profiles"]; license: string;
  sourceWitnesses: { name: string; answers: QuestionnaireAnswers; axes: Complete["eightValuesAxes"] }[];
};
const all = (id = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, id]));

describe("T176 pinned MIT 8values70 adaptation", () => {
  it("binds all70ENZHitems/280effects/8FULL7 guides and fullMITnotice to the reviewed edition", () => {
    expect(isEightValuesConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.eightValues!.effects).toEqual(reference.effects); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.questions).toHaveLength(70); expect(quiz.profiles).toHaveLength(8);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.eightValues!.upstreamCommit).toBe("3971ed8bc0c3dda18f9b001013327f382343b74f");
    expect(quiz.eightValues!.effects.E8_006).toEqual({ econ: 5, dipl: 0, govt: -10, scty: 0 });
    expect(quiz.eightValues!.effects.E8_055.scty).toBe(2);
    expect(quiz.guide.find(s => s.id === "source-license")!.paragraphs[0].en).toBe(reference.license);
    expect(reference.license).toContain("Copyright (c) 2020 8values.");
    expect(reference.license).toContain("The above copyright notice and this permission notice");
    expect(reference.license).toContain("THE SOFTWARE IS PROVIDED");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(330);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
    }
    const check = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      const v = value as Record<string, unknown>;
      if ("en" in v || "zh" in v) {
        expect(String(v.en).trim()).not.toBe(""); expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(v.zh)).toMatch(/\p{Script=Han}/u);
      } else Object.values(v).forEach(check);
    }; check(quiz);
  });
  it("matches875sourcecompletevectors including8axisextremes and350singleitemsettings without5^70 claims", () => {
    expect(reference.sourceWitnesses).toHaveLength(875);
    for (const witness of reference.sourceWitnesses) {
      assert.deepStrictEqual(scoreEightValuesQuestionnaire(quiz, witness.answers), { status: "complete", answered: 70, eightValuesAxes: witness.axes }, witness.name);
    }
    const neutral = scoreEightValuesQuestionnaire(quiz, all());
    if (neutral.status !== "complete") throw new Error("Neutral witness rejected");
    for (const axis of Object.values(neutral.eightValuesAxes)) expect(axis.percentage).toBe(50);
    expect(scoreQuestionnaire(quiz, all())).toEqual(neutral);
    for (const field of ["ideology", "party", "profileId", "profileIds", "percentile", "matchPercentage"]) expect(neutral).not.toHaveProperty(field);
    console.info("875sourcevectors match pinned upstream normalization;not5^70paths/alljointstates,politicalclassification ortranslationvalidation.");
  });
  it("withholds69answers,rejectsinvalidinput/configuration andexpiresopt-indrafts", () => {
    const partial = all(); delete partial.E8_070;
    expect(scoreEightValuesQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 69 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "3" }, { E8_001: "na" }, { E8_001: 3 }, { ...all(), UNKNOWN: "3" }]) expect(scoreEightValuesQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const mutate of [
      (q: Questionnaire) => { q.eightValues!.upstreamCommit = "unknown"; },
      (q: Questionnaire) => { q.eightValues!.effects.E8_055.scty = 10; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions.reverse(); },
      (q: Questionnaire) => { q.profiles.pop(); },
    ]) { const q = structuredClone(quiz); mutate(q); expect(scoreEightValuesQuestionnaire(q, all())).toEqual({ status: "unavailable", answered: 0 }); }
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { E8_001: "2" } });
    expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ E8_001: "2" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("renders4pairedaxesandall8fullguides/56sectionsENZH withnohighesttypeorprivatepubliclink", () => {
    const result = scoreEightValuesQuestionnaire(quiz, all()); if (result.status !== "complete") throw new Error("Neutral witness rejected");
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireEightValuesReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-eight-values-axis]")).toHaveLength(4); expect(dom.querySelectorAll("[data-eight-values-guide]")).toHaveLength(8); expect(dom.querySelectorAll("h4")).toHaveLength(56);
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll("a")) expect(a.getAttribute("href")).not.toMatch(/[?&](answers|scores|e|d|g|s)=/);
    }
  });
  it("publishes18completeENZHnativepages withcanonicalpairs,sourceattribution,sitemapsandfreeentrylinks", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try {
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/8-values-political`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(dom.textContent).toContain(reference.license); expect(dom.textContent).toContain(quiz.instructions![locale]);
        for (const section of quiz.guide.slice(0, 3)) expect(dom.querySelector("[aria-labelledby=questionnaire-method]")?.textContent).toContain(section.paragraphs[0][locale]);
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const s of profile.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("[data-eight-values-axis]")).toBeNull(); expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/8-values-political/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/8-values-political/results/${profile.id}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
