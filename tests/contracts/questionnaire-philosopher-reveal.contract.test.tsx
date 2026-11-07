import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import raw from "@/lib/questionnaires/data/philosopher-personality-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { philosopherPresentations } from "@/lib/questionnaires/philosopherPresentation";
import { PhilosopherReport } from "@/components/questionnaires/PhilosopherReport";
import { PhilosopherPortrait } from "@/components/questionnaires/PhilosopherPortrait";
import { PhilosopherShareCard } from "@/components/questionnaires/PhilosopherShareCard";
import { philosopherExampleSheets } from "@/components/questionnaires/PhilosopherResultExamples";

const quiz = raw as Questionnaire;
describe("philosopher reveal and original portrait presentation", () => {
  it("binds all nine distinct original illustrations and bilingual reveal fields to current identities", () => {
    expect(Object.keys(philosopherPresentations)).toEqual(quiz.profiles.map(p => p.id));
    const hashes = quiz.profiles.map(p => {
      const bytes = readFileSync(`public/images/quiz-portraits/philosopher-personality-test/${p.id}.svg`);
      expect(bytes.toString()).toContain("original imagined editorial illustration");
      for (const locale of ["en", "zh"] as const) {
        const person = philosopherPresentations[p.id];
        expect(person.name[locale].length).toBeGreaterThan(1); expect(person.conclusion[locale].length).toBeGreaterThan(4); expect(person.reason[locale].length).toBeGreaterThan(20);
        expect(renderToStaticMarkup(<PhilosopherPortrait id={p.id} locale={locale} />)).toContain(`/${p.id}.svg`);
      }
      return createHash("sha256").update(bytes).digest("hex");
    });
    expect(new Set(hashes).size).toBe(9);
    expect(renderToStaticMarkup(<PhilosopherPortrait id="unknown" locale="en" />)).toBe("");
  });
  it("reveals every true highest identity before the raw-count explanation in single, two-way and nine-way cases", () => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (const [index, sheet] of philosopherExampleSheets.entries()) for (const locale of ["en", "zh"] as const) {
      const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, sheet[i]])));
      if (result.status !== "complete") throw new Error("Synthetic sheet rejected");
      const dom = document.createElement("div");dom.innerHTML = renderToStaticMarkup(<PhilosopherReport quiz={prepared} result={result} locale={locale} />);
      const reveals = [...dom.querySelectorAll("[data-philosopher-reveal]")];
      expect(reveals).toHaveLength([1, 2, 9][index]);
      expect(reveals.map(node => node.getAttribute("data-philosopher-reveal"))).toEqual(result.profileIds);
      for (const node of reveals) {
        const id = node.getAttribute("data-philosopher-reveal")!, person = philosopherPresentations[id];
        expect(node.textContent).toContain(person.name[locale]); expect(node.textContent).toContain(person.conclusion[locale]); expect(node.textContent).toContain(person.reason[locale]);
        expect(node.compareDocumentPosition(dom.querySelector("#philosopher-counts")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
      expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(9);
      expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(result.profileIds.length);
      for (const id of result.profileIds) for (const section of quiz.profiles.find(p => p.id === id)!.sections) expect(dom.querySelector(`#report-${id}-${section.id} h4`)?.textContent).toBe(section.title[locale]);
    }
  });
  it("keeps source-bound reports untouched and public guide cards distinct from personal assignments", () => {
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify({ profiles: quiz.profiles, guide: quiz.guide, faq: quiz.faq })).digest("hex"));
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<PhilosopherShareCard ids={["socrates"]} locale={locale} publicGuide />);
      expect(html).toContain(locale === "zh" ? "不表示你已获得这一结果" : "without assigning it to you as a result");
      expect(html).not.toContain("blob:"); expect(html).not.toMatch(/PHIL_[0-9]{2}|answers=|counts=/);
    }
  });
});
