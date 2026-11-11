import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/values-orientations-six-copy.mjs";
import { loadTraditionalValuesOrientations } from "@/lib/i18n/zh-TW/valuesOrientationsQuestionnaires";
import { isSecsConfigurationValid } from "@/lib/questionnaires/secs";
import { isEightValuesConfigurationValid } from "@/lib/questionnaires/eightValues";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isFourAxesConfigurationValid } from "@/lib/questionnaires/fourAxes";
import { isAlignmentConfigurationValid } from "@/lib/questionnaires/alignment";
import { isPoliticalCoordinatesConfigurationValid } from "@/lib/questionnaires/politicalCoordinates";

import { isCompassConfigurationValid } from "@/lib/questionnaires/compass";

const suites = [
  ["8-values-political", isEightValuesConfigurationValid],
  ["conservatism", isSecsConfigurationValid],
  ["political-coordinates", isPoliticalCoordinatesConfigurationValid],
  ["four-axes-test", isFourAxesConfigurationValid],
  ["moral-alignment", isAlignmentConfigurationValid],
  ["arabic-personality-compass", isCompassConfigurationValid],
] as const;

describe("Taiwan values and orientations questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalValuesOrientations(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    expect(item.quiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    const originalProfiles = source.profiles.map(profile => prepareResultProfile(slug, profile));
    expect(item.quiz.profiles.map(profile => profile.resultReading?.profileId))
      .toEqual(originalProfiles.map(profile => profile.resultReading?.profileId));
    expect(item.quiz.profiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))))
      .toEqual(originalProfiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))));
    if (slug === "moral-alignment") expect(Object.keys(item.summaries)).toHaveLength(9);
    else expect(item.sections.length).toBeGreaterThan(0);
  });

  it("binds the generated content to the six sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(18);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
