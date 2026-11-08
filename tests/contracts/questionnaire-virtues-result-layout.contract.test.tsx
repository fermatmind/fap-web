import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { QuestionnaireMiniVirtuesReport } from "@/components/questionnaires/QuestionnaireMiniVirtuesReport";
import { QuestionnaireSevenSinsOverview } from "@/components/questionnaires/QuestionnaireSevenSinsOverview";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = prepareQuestionnaireResultReadings(source as Questionnaire);
const tuples = [[2, 4, 3, 5], [4, 4, 4, 4], [3, 4, 4, 4], [3, 3, 4, 3], [3, 4, 3, 4], [3, 3, 4, 4], [3, 3, 3, 4]];
const sins = [37.5, 75, 62.5, 62.5, 50, 62.5, 50];
const virtues = [87.5, 75, 75, 50, 75, 62.5, 62.5];
const situations = {
  zh: ["会前准备的资料", "朋友想借相机", "新的合作很吸引你", "同伴得到你也想争取的机会", "做完费力的任务", "计划被打断时", "忙碌一周后"],
  en: ["notes you prepared", "borrow your camera", "A new collaboration", "A peer receives", "After a demanding task", "When someone interrupts", "After a busy week"],
};
const answers = Object.fromEntries(quiz.questions.map((question, i) => [question.id, String(tuples[Math.floor(i / 4)][i % 4])]));

describe("seven sins and virtues dual-track result", () => {
  it("binds the current question and reading bytes and scores all 25 pairs per axis independently", () => {
    const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
    expect(source.source.itemBankSha256).toBe(hash(source.questions));
    expect(source.source.resultContentSha256).toBe(hash(source.profiles));
    const neutral = Object.fromEntries(quiz.questions.map(question => [question.id, "3"]));
    for (let group = 0; group < 7; group++) for (const track of ["sin", "virtue"] as const) {
      const offset = group * 4 + (track === "virtue" ? 1 : 0);
      for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) {
        const result = scoreMiniVirtuesQuestionnaire(quiz, {
          ...neutral, [quiz.questions[offset].id]: String(a), [quiz.questions[offset + 2].id]: String(b),
        });
        if (result.status !== "complete" || result.model !== "dual") throw Error("Dual-track result required");
        const expected = Array.from({ length: 7 }, (_, i) => ({
          sin: i === group && track === "sin" ? ((a + b) / 2 - 1) * 25 : 50,
          virtue: i === group && track === "virtue" ? ((a + b) / 2 - 1) * 25 : 50,
        }));
        expect(result.miniVirtues.map(({ sin, virtue }) => ({ sin, virtue }))).toEqual(expected);
      }
    }
    expect(scoreMiniVirtuesQuestionnaire(quiz, { ...neutral, VIRTUES_LK_001: "3" }).status).toBe("invalid");
  });

  it("binds the three approved Chinese wording corrections without changing the scoring edition", () => {
    expect(source.version).toBe("2.0.1");
    expect(source.source.itemBankVersion).toBe("2.0.1");
    expect(source.source.scoringVersion).toBe("2.0.0");
    expect(source.questions[5].prompt).toEqual({ en: "When I have something spare that another person needs, I offer to share it.", zh: "手头有闲置而别人正好需要的东西时，我会主动提出分享。" });
    expect(source.questions[6].prompt.zh).toBe("分配额外好处时，即使别人也有同等的分配资格，我仍想让自己多拿一些。");
    expect(source.questions[12].prompt.zh).toBe("处境相近的人得到我想要的机会时，我很难不因对方得到它而心生怨意。");
  });

  it.each(["zh", "en"] as const)("reports only numeric %s averages at equal and extreme track scores", locale => {
    for (const [sin, virtue] of [[1, 5], [3, 3], [5, 1]]) {
      const result = scoreMiniVirtuesQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, String(index % 2 ? virtue : sin)])));
      if (result.status !== "complete" || result.model !== "dual") throw Error("Dual-track result required");
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireSevenSinsOverview result={result} locale={locale} headingRef={null} />);
      expect(dom.querySelector("[data-seven-sins-balance]")?.textContent).toBe(locale === "zh"
        ? `美德题组均值 ${(virtue - 1) * 25}七宗罪题组均值 ${(sin - 1) * 25}`
        : `Virtue item average ${(virtue - 1) * 25}Sin item average ${(sin - 1) * 25}`);
      expect(dom.querySelector("[data-seven-sins-balance]")?.textContent).not.toMatch(/占上风|edge|level/);
    }
  });

  it("retains every joint leader when both tracks tie", () => {
    const result = scoreMiniVirtuesQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(question => [question.id, "3"])));
    if (result.status !== "complete" || result.model !== "dual") throw Error("Dual-track result required");
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<QuestionnaireSevenSinsOverview result={result} locale="zh" headingRef={null} />);
    expect(dom.querySelector('[data-seven-sins-leader="sin"]')?.textContent).toContain("并列色欲、嫉妒、暴怒、懒惰、贪婪、暴食、傲慢");
    expect(dom.querySelector('[data-seven-sins-leader="virtue"]')?.textContent).toContain("并列贞洁、节制、慷慨、勤勉、耐心、仁爱、谦卑");
    expect(dom.querySelector("[data-seven-sins-balance]")?.textContent).toBe("美德题组均值 50七宗罪题组均值 50");
  });
  it.each(["zh", "en"] as const)("shows the %s leaders, averages, fourteen real axis values and seven full readings", locale => {
    const result = scoreMiniVirtuesQuestionnaire(quiz, answers);
    if (result.status !== "complete" || result.model !== "dual") throw Error("Valid complete response required");
    expect(result.miniVirtues.map(part => part.sin)).toEqual(sins);
    expect(result.miniVirtues.map(part => part.virtue)).toEqual(virtues);
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<>
      <QuestionnaireSevenSinsOverview result={result} locale={locale} headingRef={null} />
      <QuestionnaireMiniVirtuesReport quiz={quiz} result={result} locale={locale} />
    </>);
    expect([...dom.querySelectorAll("[data-mini-virtues-part]")].map(node => node.getAttribute("data-mini-virtues-part"))).toEqual(quiz.directions.map(direction => direction.id));
    expect([...dom.querySelectorAll("select option")].map(node => (node as HTMLOptionElement).value)).toEqual(quiz.directions.map(direction => direction.id));
    for (const [index, direction] of quiz.directions.entries()) {
      const profile = quiz.profiles[index];
      const part = dom.querySelector(`[data-mini-virtues-part="${direction.id}"]`)!;
      const score = part.querySelector("[data-mini-virtues-score]")!;
      expect([...score.querySelectorAll("strong")].map(node => node.textContent)).toEqual([sins[index], virtues[index]].map(value => String(Math.round(value))));
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
    expect(dom.querySelector('[data-seven-sins-leader="sin"]')?.textContent).toContain(locale === "zh" ? "贪婪" : "Greed");
    expect(dom.querySelector('[data-seven-sins-leader="virtue"]')?.textContent).toContain(locale === "zh" ? "谦卑" : "Humility");
    expect(dom.querySelector("[data-seven-sins-balance]")?.textContent).toContain(locale === "zh" ? "美德题组均值 70七宗罪题组均值 57" : "Virtue item average 70Sin item average 57");
    const chart = dom.querySelector("[data-seven-sins-radar]")!;
    expect(chart.closest("details")).toBeNull();
    expect([...chart.querySelectorAll("[data-seven-sins-axis]")].map(node => node.textContent)).toEqual(["63", "63", "63", "50", "75", "50", "38", "75", "75", "75", "63", "63", "50", "88"]);
    expect(dom.querySelector("[data-mini-virtues-common]")?.hasAttribute("open")).toBe(false);
    const edition = quiz.profiles[0].sections.find(section => section.id === "edition")!;
    for (const paragraph of edition.paragraphs) expect([...dom.querySelectorAll("p")].filter(node => node.textContent === paragraph[locale])).toHaveLength(1);
    const ids = [...dom.querySelectorAll("[id]")].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const anchor of dom.querySelectorAll('a[href^="#"]')) expect(ids).toContain(anchor.getAttribute("href")!.slice(1));
    expect(dom.textContent).not.toMatch(/24小时|24-hour|退出清除|exit clearing/);
  });
});
