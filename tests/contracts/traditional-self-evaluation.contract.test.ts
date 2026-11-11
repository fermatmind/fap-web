import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/self-evaluation-five-copy.mjs";
import { loadTraditionalSelfEvaluation } from "@/lib/i18n/zh-TW/selfEvaluationQuestionnaires";
import { isFscrs22ConfigurationValid } from "@/lib/questionnaires/fscrs22";
import { isImposter20ConfigurationValid } from "@/lib/questionnaires/imposter20";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isRosenbergConfigurationValid } from "@/lib/questionnaires/rosenberg";
import { isSapsConfigurationValid } from "@/lib/questionnaires/saps";
import { isScs26ConfigurationValid } from "@/lib/questionnaires/scs26";

const suites = [
  ["imposter-syndrome", isImposter20ConfigurationValid],
  ["inner-critic-voice-test", isFscrs22ConfigurationValid],
  ["self-compassion", isScs26ConfigurationValid],
  ["self-esteem", isRosenbergConfigurationValid],
  ["perfectionism", isSapsConfigurationValid],
] as const;

describe("Taiwan self-evaluation questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalSelfEvaluation(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    if (slug === "imposter-syndrome") expect(item.takeQuiz.questions).toEqual(source.questions);
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

  it("binds the generated content to the five sets of native sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(15);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
