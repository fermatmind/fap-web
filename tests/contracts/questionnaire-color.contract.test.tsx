import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import catalog from "@/lib/questionnaires/catalog.json";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isMissingFunRoute } from "@/lib/entertainment/routing";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/response-color.json", "utf8")) as Questionnaire;
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/color-reference.json", "utf8"));
type ReferenceScorer = { scoreSubmission: (submission: object, bank: object, spec: object) => { score_availability: string; directions: Record<string, { wins: number }>; ranking: { top_direction_codes: string[] } } };
const sourceModule = createRequire(import.meta.url)("../fixtures/questionnaires/multidirection-scorer.cjs") as { create: (configuration: object) => ReferenceScorer };
const sourceScorer = sourceModule.create({ testId: "PERSONALITY_COLOR", directionCodes: reference.scoringSpec.directions.map((d: { direction_code: string }) => d.direction_code), questionCount: 24, pairOccurrences: 4, scheduledComparisons: 12, status: reference.scoringSpec.status });
const sourceSubmission = (answers: QuestionnaireAnswers) => ({ submission_id: "synthetic-source-witness", test_id: "PERSONALITY_COLOR", form_code: quiz.source.formCode, item_bank_version: quiz.source.itemBankVersion, scoring_version: quiz.source.scoringVersion, answers });

describe("T002 Color complete source questionnaire", () => {
  it("preserves the original24questions, actual scoring identities and every complete source report", () => {
    expect(quiz.title).toEqual({ zh: "色彩性格测试", en: "Color Personality Test" });
    expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(15);
    expect(isDirectionalConfigurationValid(quiz)).toBe(true);
    for (const [index, q] of quiz.questions.entries()) {
      const original = reference.itemBank.items[index];
      expect(q.id).toBe(original.question_id); expect(q.prompt.zh).toBe(original.prompt);
      expect(q.options.map(o => ({ code: o.id, text: o.label.zh, direction_code: o.directionId }))).toEqual(original.options);
    }
    const humanStrings = (value: unknown): string[] => typeof value === "string" ? (/\p{Script=Han}/u.test(value) ? [value] : []) : Array.isArray(value) ? value.flatMap(humanStrings) : value && typeof value === "object" ? Object.values(value).flatMap(humanStrings) : [];
    for (const [index, profile] of quiz.profiles.entries()) {
      const original = reference.content.profiles[index];
      expect(profile.directionIds).toEqual(original.direction_codes);
      const rendered = JSON.stringify(profile);
      for (const text of humanStrings(original)) {
        const expected = text;
        expect(rendered, profile.id).toContain(expected);
      }
      expect(profile.sections.length).toBeGreaterThanOrEqual(10);
    }
    const walk = (value: unknown): void => {
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if ("en" in record || "zh" in record) {
          expect(String(record.en).trim().length).toBeGreaterThan(0);
          expect(String(record.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder|lorem ipsum/u);
          expect(String(record.zh)).toMatch(/\p{Script=Han}/u);
        } else Object.values(record).forEach(walk);
      }
    };
    walk(quiz);
    expect(catalog.find(card => card.slug === quiz.slug)!.resultSlugs).toEqual(quiz.profiles.map(p => p.id));
    expect(catalog.find(card => card.slug === quiz.slug)!.formCode).toBe(quiz.source.formCode);
  });

  it("matches the unchanged mini-program scorer for every reachable complete score vector and all15reports", () => {
    const ids = quiz.directions.map(d => d.id);
    let layer = new Map<string, { counts: number[]; answers: QuestionnaireAnswers }>([["0,0,0,0", { counts: [0, 0, 0, 0], answers: {} }]]);
    for (const question of quiz.questions) {
      const next = new Map<string, { counts: number[]; answers: QuestionnaireAnswers }>();
      for (const state of layer.values()) for (const option of question.options) {
        const counts = [...state.counts]; counts[ids.indexOf(option.directionId)]++;
        next.set(counts.join(","), { counts, answers: { ...state.answers, [question.id]: option.id } });
      }
      layer = next;
    }
    const reached = new Set<string>();
    for (const state of layer.values()) {
      const expected = sourceScorer.scoreSubmission(sourceSubmission(state.answers), reference.itemBank, reference.scoringSpec);
      expect(expected.score_availability).toBe("complete");
      const actual = scoreDirectionalQuestionnaire(quiz, state.answers);
      expect(actual.status).toBe("complete");
      if (actual.status !== "complete") throw new Error("Complete source witness rejected");
      expect(actual.counts).toEqual(Object.fromEntries(ids.map(id => [id, expected.directions[id].wins])));
      expect([...actual.leaders].sort()).toEqual([...expected.ranking.top_direction_codes].sort());
      const profile = quiz.profiles.find(p => p.id === actual.profileId)!;
      expect([...profile.directionIds].sort()).toEqual([...actual.leaders].sort());
      expect(Object.values(actual.counts).reduce((a, b) => a + b, 0)).toBe(24);
      reached.add(profile.id);
    }
    expect([...reached].sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    console.info(`Color: ${2 ** 24} answer combinations represented by ${layer.size} reachable score vectors; ${layer.size} independent source-scorer witnesses cover all15complete reports.`);
  });

  it("suppresses incomplete/invalid results and rejects stale, corrupt or future tab drafts", async () => {
    const first = quiz.questions[0], partial = { [first.id]: first.options[0].id };
    expect(scoreDirectionalQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 1 });
    for (const answers of [null, [], new Date(), { unknown: "A" }, { [first.id]: "invalid" }]) expect(scoreDirectionalQuestionnaire(quiz, answers).status).toBe("invalid");
    const broken = structuredClone(quiz); broken.directions[0].comparisons = 13;
    expect(scoreDirectionalQuestionnaire(broken, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = { version: quiz.version, savedAt: 100000000, answers: partial };
    expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), draft.savedAt + 1)).toEqual(partial);
    for (const delta of [-1, 86400000, 86400001]) expect(readQuestionnaireDraft(quiz, JSON.stringify(draft), draft.savedAt + delta)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ ...draft, version: "old" }), draft.savedAt + 1)).toBeNull();
    expect(readQuestionnaireDraft(quiz, "not JSON")).toBeNull();
    for (const slug of ["__proto__", "../disc", "unknown"]) expect(await loadQuestionnaire(slug)).toBeNull();
    for (const locale of ["en", "zh"] as const) {
      expect(questionnairePath(locale, "response-color")).toBe(`/${locale}/tests/play/response-color`);
      expect(isMissingFunRoute(`/${locale}/tests/explore/response-color`)).toBe(true);
      expect(quiz.profiles.slice(0, 4).map(p => p.id)).toEqual(["red", "yellow", "blue", "green"]);
      expect(isMissingFunRoute(questionnairePath(locale, "response-color"))).toBe(false);
      for (const profile of quiz.profiles) expect(isMissingFunRoute(questionnaireGuidePath(locale, "response-color", profile.id))).toBe(false);
      for (const path of [`/${locale}/tests/explore`, `/${locale}/tests/play/response-color/results/SINGLE_RED`, `/${locale}/tests/play/response-color/results/unknown`, `/${locale}/tests/explore/unknown`]) expect(isMissingFunRoute(path)).toBe(true);
    }
  });

  it("renders both actual test entries and all30complete public reports with aligned metadata and stable links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
    const guide = await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page");
    try {
      for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ locale, slug: "response-color" }) };
        const html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
        expect(html).toContain(quiz.title[locale]); expect(String(meta.alternates?.canonical)).toBe(`https://fermatmind.com${questionnairePath(locale, "response-color")}`);
        expect(meta.description).toBe(quiz.description[locale]);
        const initial = document.createElement("div"); initial.innerHTML = html;
        expect(initial.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
        expect(initial.querySelector("#take-test [role=status]")?.textContent).toContain(locale === "zh" ? "正在准备测试" : "Preparing the test");
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${questionnairePath(locale, "response-color")}"`);
        for (const profile of quiz.profiles) {
          const path = questionnaireGuidePath(locale, "response-color", profile.id);
          expect(html).toContain(`href="${path}"`);
          const props = { params: Promise.resolve({ locale, slug: "response-color", portrait: profile.id }) };
          const rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props);
          const root = document.createElement("div"); root.innerHTML = rendered;
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(root.textContent).toContain(paragraph[locale]);
          if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
          expect(String(metadata.alternates?.canonical)).toBe(`https://fermatmind.com${path}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com${questionnaireGuidePath("en", "response-color", profile.id)}`, "zh-CN": `https://fermatmind.com${questionnaireGuidePath("zh", "response-color", profile.id)}` });
          expect(rendered).toContain("application/ld+json");
          expect(rendered).toContain(`href="${questionnairePath(locale, "response-color")}#take-test"`);
        }
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
