import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/traits-social-six-copy.mjs";
import { loadTraditionalTraitsSocial } from "@/lib/i18n/zh-TW/traitsSocialQuestionnaires";
import { isExtraversionConfigurationValid } from "@/lib/questionnaires/extraversion";
import { isMostLeastConfigurationValid } from "@/lib/questionnaires/mostLeast";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isMattering10ConfigurationValid } from "@/lib/questionnaires/mattering10";
import { isOptimismConfigurationValid } from "@/lib/questionnaires/optimism";
import { isCatQ25ConfigurationValid } from "@/lib/questionnaires/catq25";

import { isTipi10ConfigurationValid } from "@/lib/questionnaires/tipi10";

const suites = [
  ["caliper-style-assessment-test", isMostLeastConfigurationValid],
  ["introvert-extrovert", isExtraversionConfigurationValid],
  ["masking-test", isCatQ25ConfigurationValid],
  ["mattering", isMattering10ConfigurationValid],
  ["optimism-pessimism", isOptimismConfigurationValid],
  ["tipi-10", isTipi10ConfigurationValid],
] as const;

describe("Taiwan traits and social questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalTraitsSocial(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    expect(item.quiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    const originalProfiles = source.profiles.map(profile => prepareResultProfile(slug, profile));
    expect(item.quiz.profiles.map(profile => profile.resultReading?.profileId))
      .toEqual(originalProfiles.map(profile => profile.resultReading?.profileId));
    expect(item.quiz.profiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))))
      .toEqual(originalProfiles.map(profile => profile.sections.flatMap(section => section.paragraphs.map(p => p.en))));
    if (slug === "introvert-extrovert") expect(Object.keys(item.summaries)).toHaveLength(4);
    if (slug === "tipi-10") {
      const section = item.quiz.profiles.find(profile => profile.id === "conscientiousness-reading")
        ?.sections.find(section => section.id === "conscientiousness-4");
      expect(section?.paragraphs.some(paragraph => paragraph.zh.includes("既不同意也不贊同"))).toBe(true);
    }
  });

  it("binds the generated content to the six sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(17);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
