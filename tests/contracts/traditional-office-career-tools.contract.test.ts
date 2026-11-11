import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/office-career-tools-copy.mjs";
import { loadTraditionalCareerMatch, loadTraditionalOfficeTool } from "@/lib/i18n/zh-TW/officeCareerTools";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { isDataEntryConfigurationValid } from "@/lib/questionnaires/dataEntry";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isSkillsEvidenceConfigurationValid } from "@/lib/questionnaires/skillsEvidence";
import { isTenKeyConfigurationValid } from "@/lib/questionnaires/tenKey";
import { isTypingConfigurationValid } from "@/lib/questionnaires/typing";
import { isWorkRole12ConfigurationValid } from "@/lib/questionnaires/workRole12";

const readers = [
  ["data-entry", isDataEntryConfigurationValid],
  ["ten-key-test", isTenKeyConfigurationValid],
  ["typing-speed", isTypingConfigurationValid],
  ["skills-audit", isSkillsEvidenceConfigurationValid],
  ["work-role-reflection", isWorkRole12ConfigurationValid],
] as const;

describe("Taiwan office and career tool source projections", () => {
  it.each(readers)("keeps the %s native input contract and original public guide identities", async (slug, validate) => {
    const source = (await loadQuestionnaire(slug))!;
    const result = (await loadTraditionalOfficeTool(slug))!;
    expect(validate(result.takeQuiz)).toBe(true);
    expect(result.takeQuiz.questions.map(question => [question.id, question.options.map(option => option.id)]))
      .toEqual(source.questions.map(question => [question.id, question.options.map(option => option.id)]));
    expect(result.quiz.profiles.map(profile => profile.resultReading))
      .toEqual(source.profiles.map(profile => prepareResultProfile(slug, profile).resultReading));
    expect(result.quiz.profiles.map(profile => profile.sections.map(section => section.paragraphs.map(p => p.en))))
      .toEqual(source.profiles.map(profile => prepareResultProfile(slug, profile).sections.map(section => section.paragraphs.map(p => p.en))));
  });

  it("loads the original career comparison without inventing questions or result identities", async () => {
    const candidate = (await loadTraditionalCareerMatch())!;
    expect(isCareerMatchConfigurationValid(candidate.quiz)).toBe(true);
    expect(candidate.quiz.questions).toHaveLength(0);
    expect(candidate.quiz.profiles).toHaveLength(0);
    expect(candidate.readings.sections.length).toBeGreaterThan(0);
    expect(await loadTraditionalOfficeTool("career-match")).toBeNull();
  });

  it("binds the generated fields to all eighteen source files", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(18);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
