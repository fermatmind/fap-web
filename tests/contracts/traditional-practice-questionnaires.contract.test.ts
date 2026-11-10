import { germanLandingReferences } from "@/components/questionnaires/GermanLandingEditorial";
import { spatialReasoningLandingReferences } from "@/components/questionnaires/SpatialReasoningLandingEditorial";
import { numericalReasoningLandingReferences } from "@/components/questionnaires/NumericalReasoningLandingEditorial";
import { abstractReasoningLandingReferences } from "@/components/questionnaires/AbstractReasoningLandingEditorial";
import { describe, expect, it } from "vitest";
import { customerServiceLandingReferences } from "@/components/questionnaires/CustomerServiceLandingEditorial";
import { digitalCitizenshipLandingReferences } from "@/components/questionnaires/DigitalCitizenshipLandingEditorial";
import { situationalJudgementLandingReferences } from "@/components/questionnaires/SituationalJudgementLandingEditorial";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalPractice } from "@/lib/i18n/zh-TW/practiceQuestionnaires";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { scorePracticeQuestionnaire } from "@/lib/questionnaires/practice";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";

const editions = [
  ["attention-to-detail", 24, 4],
  ["cybersecurity-awareness", 20, 5],
  ["workplace-technology", 16, 4],
  ["computer-literacy", 24, 4],
  ["digital-ethics-citizenship", 30, 5],
  ["customer-service-aptitude", 24, 4],
  ["sales-aptitude", 24, 4],
  ["situational-judgement", 25, 5],
  ["aptitude-test", 30, 5],
  ["abstract-reasoning", 24, 4],
  ["logical-reasoning", 24, 4],
  ["mechanical-reasoning", 30, 5],
  ["verbal-reasoning", 24, 4],
  ["numerical-reasoning", 30, 5],
  ["spatial-reasoning", 30, 5],
  ["english-proficiency", 24, 4],
  ["german-proficiency", 28, 4],
  ["grammar-test", 24, 4],
  ["spanish-proficiency", 24, 4],
  ["spelling-test", 24, 4],
  ["java-test", 24, 4],
  ["javascript-test", 24, 4],
  ["python-test", 24, 4],
  ["sql-test", 24, 4],
  ["word-skills", 25, 5],
  ["excel-skills", 24, 4],
  ["financial-accounting", 24, 6],
] as const;

describe("Traditional practice editions", () => {
  it.each([
    ["german-proficiency", germanLandingReferences],
    ["abstract-reasoning", abstractReasoningLandingReferences],
    ["numerical-reasoning", numericalReasoningLandingReferences],
    ["spatial-reasoning", spatialReasoningLandingReferences],
    ["customer-service-aptitude", customerServiceLandingReferences],
    ["digital-ethics-citizenship", digitalCitizenshipLandingReferences],
    ["situational-judgement", situationalJudgementLandingReferences],
  ] as const)("preserves supplementary source destinations for %s", async (slug, editorialReferences) => {
    const original = await loadQuestionnaire(slug);
    const localized = await loadTraditionalPractice(slug);
    expect(localized?.references.map(item => item.url)).toEqual([
      ...(original?.references ?? []).map(item => item.url),
      ...editorialReferences.map(item => item.url),
    ]);
  });

  it.each(["english-proficiency", "german-proficiency", "grammar-test", "spanish-proficiency", "spelling-test"])(
    "keeps the %s answer choices and example words in the language being practiced",
    async slug => {
      const original = await loadQuestionnaire(slug);
      const entry = await loadTraditionalPractice(slug);
      if (!original || !entry) throw new Error(`Missing edition: ${slug}`);
      const words = (text: string) => text.match(/[\p{Script=Latin}]+(?:[’'-][\p{Script=Latin}]+)*/gu);
      for (const [index, source] of original.questions.entries()) {
        const target = entry.quiz.questions[index];
        expect(words(target.prompt.zh)).toEqual(words(source.prompt.zh));
        expect(target.options.map(item => item.label)).toEqual(source.options.map(item => item.label));
        expect(target.correctOptionId).toBe(source.correctOptionId);
      }
    },
  );

  it.each(["java-test", "javascript-test", "python-test", "sql-test"])(
    "preserves executable %s examples byte for byte",
    async slug => {
      const original = await loadQuestionnaire(slug);
      const entry = await loadTraditionalPractice(slug);
      if (!original || !entry) throw new Error(`Missing edition: ${slug}`);
      const code = (text: string) => text.split("\n\n").slice(1).join("\n\n");
      for (const [index, source] of original.questions.entries()) {
        const target = entry.quiz.questions[index];
        expect(code(source.prompt.zh)).not.toBe("");
        expect(code(target.prompt.zh)).toBe(code(source.prompt.zh));
        expect(target.correctOptionId).toBe(source.correctOptionId);
        for (const [optionIndex, option] of source.options.entries()) {
          if (!/\p{Script=Han}/u.test(option.label.zh)) {
            expect(target.options[optionIndex].label.zh).toBe(option.label.zh);
          }
        }
      }
    },
  );

  it("preserves formulas, cell references and the original answer key in Excel practice", async () => {
    const original = await loadQuestionnaire("excel-skills");
    const entry = await loadTraditionalPractice("excel-skills");
    if (!original || !entry) throw new Error("Missing Excel practice");
    const tokens = (text: string) => text.match(/=(?=[A-Z$'0-9])[ -~]+|\$?[A-Z]{1,3}\$?\d+/g);
    for (const [index, source] of original.questions.entries()) {
      const target = entry.quiz.questions[index];
      expect(tokens(target.prompt.zh)).toEqual(tokens(source.prompt.zh));
      expect(target.options.map(item => tokens(item.label.zh))).toEqual(source.options.map(item => tokens(item.label.zh)));
      expect(target.correctOptionId).toBe(source.correctOptionId);
    }
  });

  it("keeps the authoritative Spanish answer and corrects the distractor named in both explanations", async () => {
    const entry = await loadTraditionalPractice("spanish-proficiency");
    const original = await loadQuestionnaire("spanish-proficiency");
    const question = entry?.quiz.questions.find(item => item.id === "SPANISH_08");
    expect(question?.correctOptionId).toBe(original?.questions.find(item => item.id === "SPANISH_08")?.correctOptionId);
    expect(question?.explanation?.zh).toContain("C 項");
    expect(question?.explanation?.en).toContain("Option C");
  });

  it.each(editions)("preserves the published %s bank, answer key and guides", async (slug, count, guideCount) => {
    const original = await loadQuestionnaire(slug);
    const entry = await loadTraditionalPractice(slug);
    expect(original?.kind).toBe("practice");
    if (!original || !entry) throw new Error(`Missing edition: ${slug}`);
    const { quiz, sections, faq } = entry;
    const path = `/tests/explore/${slug}`;
    expect(quiz.questions).toHaveLength(count);
    expect(quiz.profiles).toHaveLength(guideCount);
    expect(quiz.title.zh).not.toBe(original.title.zh);
    expect(sections.length).toBeGreaterThan(0);
    expect(faq.length).toBeGreaterThan(0);
    expect(quiz.references?.map(item => item.url)).toEqual(original.references?.map(item => item.url));
    expect(traditionalPath(`/en${path}`)).toBe(`/zh-TW${path}`);
    expect(traditionalPath(`/zh-TW${path}/take`)).toBe(`/zh-TW${path}/take`);
    expect(traditionalPath(`/zh-TW${path}/results/unknown-id`)).toBeNull();

    const answerSets = [0, 1].map(index => Object.fromEntries(original.questions.map(question => [question.id, question.options[index].id])));
    for (const answers of [{}, ...answerSets]) {
      expect(scorePracticeQuestionnaire(quiz, answers)).toEqual(scorePracticeQuestionnaire(original, answers));
    }
    for (const [index, originalQuestion] of original.questions.entries()) {
      const question = quiz.questions[index];
      expect(question.id).toBe(originalQuestion.id);
      expect(question.prompt.en).toBe(originalQuestion.prompt.en);
      expect(question.options.map(option => option.id)).toEqual(originalQuestion.options.map(option => option.id));
    }
    for (const originalProfile of original.profiles) {
      const originalGuide = prepareResultProfile(slug, originalProfile);
      const localized = quiz.profiles.find(profile => profile.id === originalProfile.id);
      expect(localized?.resultReading).toEqual(originalGuide.resultReading);
      expect(localized?.sections.map(item => item.id)).toEqual(originalGuide.sections.map(item => item.id));
      expect(traditionalPath(`/zh${path}/results/${originalProfile.id}`)).toBe(`/zh-TW${path}/results/${originalProfile.id}`);
    }
  });
});
