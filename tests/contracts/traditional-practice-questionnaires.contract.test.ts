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
] as const;

describe("Traditional practice editions", () => {
  it.each([
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
