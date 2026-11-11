import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/stress-coping-six-copy.mjs";
import { loadTraditionalStressCoping } from "@/lib/i18n/zh-TW/stressCopingQuestionnaires";
import { isCbiConfigurationValid } from "@/lib/questionnaires/cbi";
import { isAnger20ConfigurationValid } from "@/lib/questionnaires/anger20";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isPss4ConfigurationValid } from "@/lib/questionnaires/pss4";
import { isStressReflection4ConfigurationValid } from "@/lib/questionnaires/stressReflection4";
import { isPtq15ConfigurationValid } from "@/lib/questionnaires/ptq15";

import { isHoldingBack35ConfigurationValid } from "@/lib/questionnaires/holdingBack35";

const suites = [
  ["anger-issues-screener", isAnger20ConfigurationValid],
  ["burnout-risk", isCbiConfigurationValid],
  ["overthinking-screener", isPtq15ConfigurationValid],
  ["perceived-stress-scale-4", isPss4ConfigurationValid],
  ["stress-check-in-test", isStressReflection4ConfigurationValid],
  ["holding-yourself-back", isHoldingBack35ConfigurationValid],
] as const;

describe("Taiwan stress and coping questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalStressCoping(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    if (slug === "anger-issues-screener") {
      expect(item.takeQuiz).toEqual(source);
    }
    expect(item.quiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    const originalProfiles = source.profiles.map(profile => prepareResultProfile(slug, profile));
    expect(item.quiz.profiles.map(profile => profile.resultReading))
      .toEqual(originalProfiles.map(profile => profile.resultReading));
    expect(item.quiz.profiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))))
      .toEqual(originalProfiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))));
    expect(item.sections.length).toBeGreaterThan(0);
    expect(item.faq.length).toBeGreaterThan(0);
  });

  it("binds the generated content to the six sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(18);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
