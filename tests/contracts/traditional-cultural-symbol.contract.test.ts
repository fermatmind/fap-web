import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { traditionalCulturalSymbolRoute } from "@/lib/i18n/traditionalCulturalSymbolPaths";
import { sourceHashes } from "@/lib/i18n/zh-TW/cultural-symbol-five-copy.mjs";
import { loadTraditionalCulturalSymbol } from "@/lib/i18n/zh-TW/culturalSymbolQuestionnaires";
import { isNakshatra27ConfigurationValid } from "@/lib/questionnaires/nakshatra27";
import { isBirthNumberConfigurationValid } from "@/lib/questionnaires/birthNumber";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isNineStarYearConfigurationValid } from "@/lib/questionnaires/nineStarYear";
import { isWetonStory35ConfigurationValid } from "@/lib/questionnaires/wetonStory35";
import { isNatalChartConfigurationValid } from "@/lib/questionnaires/natalChart";

const suites = [
  ["life-path-number", isBirthNumberConfigurationValid],
  ["nakshatra-spica-reference", isNakshatra27ConfigurationValid],
  ["natal-chart", isNatalChartConfigurationValid],
  ["nine-star-ki", isNineStarYearConfigurationValid],
  ["weton-story-preferences", isWetonStory35ConfigurationValid],
] as const;

describe("Taiwan cultural symbol questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalCulturalSymbol(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    expect(item.quiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    const originalProfiles = source.profiles.map(profile => prepareResultProfile(slug, profile));
    expect(item.quiz.profiles.map(profile => profile.resultReading))
      .toEqual(originalProfiles.map(profile => profile.resultReading));
    expect(item.quiz.profiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))))
      .toEqual(originalProfiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))));
    if (slug === "nakshatra-spica-reference") {
      const paired = item.quiz.profiles.find(profile => profile.id === "uttara-bhadrapada");
      expect(paired?.summary.zh).toContain("成對人形");
    }
    expect(item.sections.length).toBeGreaterThan(0);
    expect(item.faq.length).toBeGreaterThan(0);
  });

  it("exposes calculator entries and stable guides, with an independent take route only for Weton", () => {
    for (const [slug] of suites) {
      expect(traditionalCulturalSymbolRoute(`/tests/explore/${slug}`)).toMatchObject({ slug, take: false });
      const take = traditionalCulturalSymbolRoute(`/tests/explore/${slug}/take`);
      expect(Boolean(take)).toBe(slug === "weton-story-preferences");
      expect(traditionalCulturalSymbolRoute(`/tests/explore/${slug}/results/nonexistent`)).toBeNull();
    }
  });

  it("binds the generated content to the five sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(15);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
