import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import raw from "@/lib/questionnaires/data/bleach.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { BleachExamples } from "@/components/questionnaires/BleachExamples";
import { bleachPresentation, bleachPortraitPath } from "@/lib/questionnaires/bleachPresentation";

const quiz = raw as Questionnaire;
describe("BLEACH source-safe fan reveal", () => {
  it("preserves the accepted question, score, source and complete reading payloads", () => {
    // Accepted source payload, including the approved bilingual Q04/Q12/Q14 clarifications.
    const fields = ["version", "source", "questions", "directions", "profiles", "guide", "faq"] as const;
    const payload = Object.fromEntries(fields.map(field => [field, raw[field]]));
    expect(createHash("sha256").update(JSON.stringify(payload)).digest("hex")).toBe("53e091ca59e217a2a2ff1098c214dc94bc67100980ee98ed997603be46e483eb");
  });
  for (const locale of ["en", "zh"] as const) it(`keeps seven real ties, exact selected reasons and original portraits in ${locale}`, () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "A"]));
    const result = scoreArchetypeQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw new Error("Incomplete witness");
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale} answers={answers} />);
    expect(root.querySelectorAll("[data-bleach-reveal] > ul > li")).toHaveLength(7);
    expect(root.querySelectorAll("[data-bleach-choice-reasons] > li")).toHaveLength(21);
    for (const profile of quiz.profiles) {
      const person = bleachPresentation(profile.id)!;
      expect(root.querySelector("[data-bleach-reveal]")?.textContent).toContain(person.conclusion[locale]);
      const expected = quiz.questions.flatMap(q => q.options.filter(o => o.id === "A" && profile.directionIds.includes(o.directionId))).slice(0, 2);
      for (const option of expected) expect(root.textContent).toContain(option.label[locale]);
      const context = root.querySelector(`[data-archetype-match]`);
      expect(root.querySelector(`[data-bleach-directory-character="${profile.id}"] a`)?.getAttribute("href")).toBe(`/${locale}/tests/explore/bleach/results/${profile.id}`);
      expect(context).not.toBeNull();
      expect(root.querySelector(`img[src="${bleachPortraitPath(profile.id)}"]`)).not.toBeNull();
      expect(readFileSync(`public${bleachPortraitPath(profile.id)}`, "utf8")).not.toMatch(/<script|<image|(?:href|src)=["\']https?:/);
    }
    expect(root.querySelector("[data-bleach-reveal]")!.compareDocumentPosition(root.querySelector("[data-archetype-count]")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(root.querySelector("[data-bleach-sharing]")).not.toBeNull();
    const samples = document.createElement("div"); samples.innerHTML = renderToStaticMarkup(<BleachExamples quiz={quiz} locale={locale} />);
    expect(samples.querySelectorAll("[data-bleach-example]")).toHaveLength(3);
    expect(samples.textContent).toContain(locale === "zh" ? "4、1、3、4、3、3、3" : "4, 1, 3, 4, 3, 3, 3");
  });
});
