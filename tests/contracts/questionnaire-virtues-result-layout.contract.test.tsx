import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { QuestionnaireMiniVirtuesReport } from "@/components/questionnaires/QuestionnaireMiniVirtuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = prepareQuestionnaireResultReadings(source as Questionnaire);
// Independent, valid source responses reproduce the screenshot's sums, not its private answers.
const tuples = [[3,3,3,4], [2,2,3,3], [3,3,4,4], [2,3,3,3], [3,3,3,3], [2,2,3,3], [3,3,3,3]];
const answers = Object.fromEntries(quiz.questions.map((question, i) => [question.id, String(tuples[Math.floor(i / 4)][i % 4])]));

describe("mini-program-style virtues result presentation", () => {
  it.each(["zh", "en"] as const)("keeps all seven %s source groups in order with range positions and closed readings", locale => {
    const result = scoreMiniVirtuesQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw Error("Valid complete response required");
    expect(result.miniVirtues.map(part => part.rawSum)).toEqual([13,10,14,11,12,10,12]);
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<QuestionnaireMiniVirtuesReport quiz={quiz} result={result} locale={locale} />);
    expect([...dom.querySelectorAll("[data-mini-virtues-position]")].map(n => n.textContent)).toEqual(["56%","38%","63%","44%","50%","38%","50%"]);
    expect([...dom.querySelectorAll("[data-mini-virtues-part]")].map(n => n.getAttribute("data-mini-virtues-part"))).toEqual(quiz.directions.map(d => d.id));
    expect(dom.querySelectorAll('svg[role="img"]')).toHaveLength(1);
    expect(dom.querySelectorAll("details")).toHaveLength(8);
    expect(dom.querySelectorAll("details[open]")).toHaveLength(0);
    expect(dom.querySelectorAll("nav")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-mini-virtues-common]")).toHaveLength(1);
    const edition = quiz.profiles[0].sections.find(section => section.id === "edition")!;
    for (const paragraph of edition.paragraphs) {
      expect([...dom.querySelectorAll("p")].filter(p => p.textContent === paragraph[locale])).toHaveLength(1);
    }
    expect(dom.textContent).not.toMatch(/24小时|24-hour|退出清除|exit clearing/);
    for (const anchor of dom.querySelectorAll('a[href^="#"]')) expect(dom.querySelector(anchor.getAttribute("href")!)).not.toBeNull();
  });
});
