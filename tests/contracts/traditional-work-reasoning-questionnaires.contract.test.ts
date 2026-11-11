import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceHashes } from "@/lib/i18n/zh-TW/work-reasoning-copy.mjs";
import { traditionalLikertRoute } from "@/lib/i18n/traditionalLikertPaths";
import { loadTraditionalWorkReasoning } from "@/lib/i18n/zh-TW/workReasoningQuestionnaires";
import { isAfqt32ConfigurationValid } from "@/lib/questionnaires/afqt32";
import { isCritical30ConfigurationValid } from "@/lib/questionnaires/critical30";
import { isDistributedWork24ConfigurationValid } from "@/lib/questionnaires/distributedWork24";
import { isPreparationActions20ConfigurationValid } from "@/lib/questionnaires/preparationActions20";
import { isReasoning18ConfigurationValid } from "@/lib/questionnaires/reasoning18";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { isTechnical30ConfigurationValid } from "@/lib/questionnaires/technical30";
import { isWrittenCoordinationConfigurationValid } from "@/lib/questionnaires/writtenCoordination";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";

const scope = [
  ["asvab-practice-test", 32, 4],
  ["asvab-science-mechanical-practice-test", 30, 5],
  ["employer-reasoning-practice-test", 18, 3],
  ["watson-glaser-practice-test", 30, 5],
  ["written-coordination-practice", 30, 6],
  ["distributed-work-choices", 24, 4],
  ["freelance-ready", 20, 5],
  ["remote-work", 20, 5],
] as const;

const validators = {
  "asvab-practice-test": isAfqt32ConfigurationValid,
  "asvab-science-mechanical-practice-test": isTechnical30ConfigurationValid,
  "employer-reasoning-practice-test": isReasoning18ConfigurationValid,
  "watson-glaser-practice-test": isCritical30ConfigurationValid,
  "written-coordination-practice": isWrittenCoordinationConfigurationValid,
  "distributed-work-choices": isDistributedWork24ConfigurationValid,
  "freelance-ready": isPreparationActions20ConfigurationValid,
  "remote-work": isPreparationActions20ConfigurationValid,
};

function withoutChineseCopy<T>(value: T): unknown {
  if (Array.isArray(value)) return value.map(withoutChineseCopy);
  if (value && typeof value === "object") {
    if ("zh" in value && "en" in value && typeof value.zh === "string" && typeof value.en === "string") {
      return { ...value, zh: "" };
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, withoutChineseCopy(child)]));
  }
  return value;
}

describe("Taiwan work and reasoning questionnaire source projection", () => {
  it.each(scope)("keeps %s on the original scoring and public reading structures", async (slug, questions, guides) => {
    const source = (await loadQuestionnaire(slug))!;
    const candidate = (await loadTraditionalWorkReasoning(slug))!;
    expect(validators[slug](candidate.takeQuiz)).toBe(true);
    expect(candidate.takeQuiz.questions).toHaveLength(questions);
    expect(candidate.quiz.profiles).toHaveLength(guides);
    const entry = `/tests/explore/${slug}`;
    expect(traditionalLikertRoute(entry)).toMatchObject({ slug, take: false });
    expect(traditionalLikertRoute(`${entry}/take`)).toMatchObject({ slug, take: true });
    for (const profile of source.profiles) {
      expect(traditionalLikertRoute(`${entry}/results/${profile.id}`)).toMatchObject({ slug, profile: profile.id });
    }
    expect(traditionalLikertRoute(`${entry}/results/not-a-public-guide`)).toBeNull();
    expect(candidate.sections.length).toBeGreaterThan(0);
    expect(candidate.faq.length).toBeGreaterThan(0);
    expect(candidate.takeQuiz.description.zh).not.toBe(source.description.zh);
    expect(withoutChineseCopy(candidate.takeQuiz)).toEqual(withoutChineseCopy(source));
    expect(withoutChineseCopy(candidate.quiz.profiles)).toEqual(withoutChineseCopy(
      source.profiles.map(profile => prepareResultProfile(slug, profile)),
    ));
  });

  it.each(["distributed-work-choices", "freelance-ready", "remote-work"])(
    "keeps complete, skipped and incomplete counts on the original %s scorer",
    async slug => {
      const source = (await loadQuestionnaire(slug))!;
      const { takeQuiz } = (await loadTraditionalWorkReasoning(slug))!;
      for (const position of [0, -1]) {
        const answers = Object.fromEntries(source.questions.map(question => [question.id, question.options!.at(position)!.id]));
        const expected = scoreQuestionnaire(source, answers);
        expect(expected.status).toBe("complete");
        expect(scoreQuestionnaire(takeQuiz, answers)).toEqual(expected);
      }
      expect(scoreQuestionnaire(takeQuiz, {})).toEqual(scoreQuestionnaire(source, {}));
    },
  );

  it("binds the generated copy to the exact sources", () => {
    expect(Object.keys(sourceHashes)).toHaveLength(24);
    for (const [path, digest] of Object.entries(sourceHashes)) {
      expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(digest);
    }
  });

  it("rejects a questionnaire outside this batch", async () => {
    expect(await loadTraditionalWorkReasoning("not-a-work-reasoning-questionnaire")).toBeNull();
  });
});
