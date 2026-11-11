import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/sensory-executive-six-copy.mjs";
import { loadTraditionalSensoryExecutive } from "@/lib/i18n/zh-TW/sensoryExecutiveQuestionnaires";
import { isSynes15ConfigurationValid } from "@/lib/questionnaires/synes15";
import { isImagery12ConfigurationValid } from "@/lib/questionnaires/imagery12";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isSens16ConfigurationValid } from "@/lib/questionnaires/sens16";
import { isDvmsq18ConfigurationValid } from "@/lib/questionnaires/dvmsq18";
import { isSpq92ConfigurationValid } from "@/lib/questionnaires/spq92";

import { isAdexi14ConfigurationValid } from "@/lib/questionnaires/adexi14";

const suites = [
  ["aphantasia-test", isImagery12ConfigurationValid],
  ["synesthesia-test", isSynes15ConfigurationValid],
  ["sensory-processing-test", isSpq92ConfigurationValid],
  ["sensory-sensitivity", isSens16ConfigurationValid],
  ["misophonia-screener", isDvmsq18ConfigurationValid],
  ["executive-function", isAdexi14ConfigurationValid],
] as const;

describe("Taiwan sensory and executive questionnaire source projections", () => {
  it.each(suites)("preserves %s scoring data and full public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const item = (await loadTraditionalSensoryExecutive(slug))!;
    expect(validate(item.takeQuiz)).toBe(true);
    if (["aphantasia-test", "synesthesia-test", "sensory-sensitivity", "misophonia-screener"].includes(slug)) {
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
