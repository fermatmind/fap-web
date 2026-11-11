import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { traditionalLikertRoute } from "@/lib/i18n/traditionalLikertPaths";
import { sourceHashes } from "@/lib/i18n/zh-TW/relationship-six-copy.mjs";
import { loadTraditionalRelationshipSix } from "@/lib/i18n/zh-TW/relationshipSixQuestionnaires";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";

const scope = [
  ["capacity-to-love-test", 41, 6],
  ["love-languages", 50, 5],
  ["love-type-16", 32, 16],
  ["mote-type", 24, 4],
  ["parenting-style", 12, 4],
  ["relationship-preferences", 24, 6],
] as const;

describe("Taiwan relationship questionnaire source and scoring", () => {
  it.each(scope)("keeps %s on the original scoring and published guide identities", async (slug, questions, guides) => {
    const source = (await loadQuestionnaire(slug))!;
    const { quiz, takeQuiz } = (await loadTraditionalRelationshipSix(slug))!;
    const engine = quiz.kind === "love-type16" || quiz.kind === "parenting-practices" ? takeQuiz : quiz;
    expect(engine.questions).toHaveLength(questions);
    expect(quiz.profiles).toHaveLength(guides);
    expect(quiz.description.zh).not.toBe(source.description.zh);
    for (const index of [0, 1, -1]) {
      const answers = Object.fromEntries(source.questions.map(question => [question.id, question.options.at(index)!.id]));
      const expected = scoreQuestionnaire(source, answers);
      expect(expected.status).toBe("complete");
      expect(scoreQuestionnaire(engine, answers)).toEqual(expected);
    }
    expect(scoreQuestionnaire(engine, {})).toEqual(scoreQuestionnaire(source, {}));
    const entry = `/tests/explore/${slug}`;
    expect(traditionalLikertRoute(`${entry}/take`)).toMatchObject({ slug, take: true });
    for (const [index, profile] of source.profiles.entries()) {
      expect(traditionalLikertRoute(`${entry}/results/${profile.id}`)).toMatchObject({ slug, profile: profile.id });
      const original = prepareResultProfile(slug, profile);
      const translated = quiz.profiles[index];
      expect(translated.resultReading).toEqual(original.resultReading);
      expect(translated.sections.map(section => [section.id, section.paragraphs.map(p => p.en)]))
        .toEqual(original.sections.map(section => [section.id, section.paragraphs.map(p => p.en)]));
    }
    expect(traditionalLikertRoute(`${entry}/results/unknown-guide`)).toBeNull();
  });

  it("binds all eighteen input files to the generated candidate", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(18);
    for (const [path, expected] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    }
  });
});
