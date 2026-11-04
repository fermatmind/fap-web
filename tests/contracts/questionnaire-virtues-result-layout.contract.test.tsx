import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { QuestionnaireMiniVirtuesReport } from "@/components/questionnaires/QuestionnaireMiniVirtuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = prepareQuestionnaireResultReadings(source as Questionnaire);
// Independent source responses produce these seven sums, without defining a moral ranking.
const tuples = [[3,3,3,4], [2,2,3,3], [3,3,4,4], [2,3,3,3], [3,3,3,3], [2,2,3,3], [3,3,3,3]];
const sums = [13, 10, 14, 11, 12, 10, 12];
const means = ["3.25", "2.50", "3.50", "2.75", "3.00", "2.50", "3.00"];
const situations = {
  zh: ["会前准备的资料", "朋友想借相机", "新的合作很吸引你", "同伴得到你也想争取的机会", "做完费力的任务", "计划被打断时", "忙碌一周后"],
  en: ["notes you prepared", "borrow your camera", "A new collaboration", "A peer receives", "After a demanding task", "When someone interrupts", "After a busy week"],
};
const answers = Object.fromEntries(quiz.questions.map((question, i) => [question.id, String(tuples[Math.floor(i / 4)][i % 4])]));

describe("virtues completed result: explanation before optional evidence", () => {
  it.each(["zh", "en"] as const)("keeps actual %s sums and means beside readable source situations and actions", locale => {
    const result = scoreMiniVirtuesQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw Error("Valid complete response required");
    expect(result.miniVirtues.map(part => part.rawSum)).toEqual(sums);
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<QuestionnaireMiniVirtuesReport quiz={quiz} result={result} locale={locale} />);
    expect([...dom.querySelectorAll("[data-mini-virtues-part]")].map(node => node.getAttribute("data-mini-virtues-part"))).toEqual(quiz.directions.map(direction => direction.id));
    expect([...dom.querySelectorAll("select option")].map(node => (node as HTMLOptionElement).value)).toEqual(quiz.directions.map(direction => direction.id));
    for (const [index, direction] of quiz.directions.entries()) {
      const profile = quiz.profiles[index];
      const part = dom.querySelector(`[data-mini-virtues-part="${direction.id}"]`)!;
      const score = part.querySelector("[data-mini-virtues-score]")!;
      expect(score.querySelector("strong")?.textContent).toBe(`${means[index]} / 5`);
      expect(score.textContent).toContain(`${sums[index]} / 20`);
      const situation = part.querySelector("[data-mini-virtues-everyday]")!;
      const action = part.querySelector("[data-mini-virtues-action]")!;
      expect(situation.textContent).toContain(situations[locale][index]);
      expect(action.querySelector("p")?.textContent?.trim()).toBeTruthy();
      for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(situation.closest("details")).toBeNull();
      expect(action.closest("details")).toBeNull();
      expect(part.querySelector("[data-mini-virtues-details]")?.hasAttribute("open")).toBe(false);
      for (const paragraph of profile.sections.find(section => section.id === "limits")!.paragraphs) {
        const original = [...part.querySelectorAll("p")].find(node => node.textContent === paragraph[locale]);
        expect(original).toBeDefined();
        expect(original!.closest("details")).not.toBeNull();
      }
    }
    const chart = dom.querySelector("[data-mini-virtues-chart]")!;
    expect(chart.tagName).toBe("DETAILS");
    expect(chart.hasAttribute("open")).toBe(false);
    expect([...chart.querySelectorAll("[data-mini-virtues-radar-value]")].map(node => node.textContent)).toEqual(["56%", "38%", "63%", "44%", "50%", "38%", "50%"]);
    expect(dom.querySelector("[data-mini-virtues-common]")?.hasAttribute("open")).toBe(false);
    const edition = quiz.profiles[0].sections.find(section => section.id === "edition")!;
    for (const paragraph of edition.paragraphs) expect([...dom.querySelectorAll("p")].filter(node => node.textContent === paragraph[locale])).toHaveLength(1);
    const ids = [...dom.querySelectorAll("[id]")].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const anchor of dom.querySelectorAll('a[href^="#"]')) expect(ids).toContain(anchor.getAttribute("href")!.slice(1));
    expect(dom.textContent).not.toMatch(/24小时|24-hour|退出清除|exit clearing/);
  });
});
