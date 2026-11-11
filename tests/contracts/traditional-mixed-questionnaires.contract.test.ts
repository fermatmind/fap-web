import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/mixed-questionnaires-six-copy.mjs";
import { loadTraditionalMixedQuestionnaire } from "@/lib/i18n/zh-TW/mixedQuestionnaires";
import { isMentalAgeConfigurationValid } from "@/lib/questionnaires/mentalAge";
import { isFds32ConfigurationValid } from "@/lib/questionnaires/fds32";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isBpi21ConfigurationValid } from "@/lib/questionnaires/bpi21";
import { isRice100ConfigurationValid } from "@/lib/questionnaires/ricePurity";
import { isPatronusConfigurationValid } from "@/lib/questionnaires/patronus";

import { isSbti31ConfigurationValid } from "@/lib/questionnaires/sbti31";

const suites = [
  ["food-disgust", isFds32ConfigurationValid],
  ["mental-age", isMentalAgeConfigurationValid],
  ["patronus-quiz", isPatronusConfigurationValid],
  ["prakriti-inventory21", isBpi21ConfigurationValid],
  ["rice-purity-test", isRice100ConfigurationValid],
  ["sbti-test", isSbti31ConfigurationValid],
] as const;

describe("Taiwan mixed questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalMixedQuestionnaire(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    expect(item.quiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    const originalProfiles = source.profiles.map(profile => prepareResultProfile(slug, profile));
    expect(item.quiz.profiles.map(profile => profile.resultReading?.profileId))
      .toEqual(originalProfiles.map(profile => profile.resultReading?.profileId));
    expect(item.quiz.profiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))))
      .toEqual(originalProfiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))));
    if (slug === "sbti-test") expect(item.takeQuiz).toEqual(source);
  });

  it("binds the generated content to the six sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(13);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
