import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/distributed-work-choices.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { recordDistributedWork24 } from "@/lib/questionnaires/distributedWork24";
import { DistributedWorkPage } from "@/components/questionnaires/DistributedWorkPage";
import { distributedLandingSections, distributedLandingFaq } from "@/components/questionnaires/DistributedWorkLandingEditorial";
const quiz = raw as Questionnaire;
describe("Distributed work editorial preserves relative choices and complete bilingual readings", () => {
  it("verifies the 8 selected / 3 other / 1 unscored example against real pairs", () => {
    let count = 0;
    const answers = Object.fromEntries(quiz.questions.map(q => {
      const option = q.options.find(o => o.directionId === "handover");
      if (!option) return [q.id, "skip"];
      count += 1;
      return [q.id, count <= 8 ? option.id : count <= 11 ? q.options.find(o => o.id !== "skip" && o.id !== option.id)!.id : "skip"];
    }));
    const result = recordDistributedWork24(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw Error("Expected complete choices");
    expect(result.distributedWork.find(p => p.id === "handover")).toMatchObject({ selected: 8, otherSelected: 3, unscored: 1, appearances: 12 });
    for (const row of result.distributedWork) expect(row.selected + row.otherSelected + row.unscored).toBe(12);
  });
  for (const locale of ["en", "zh"] as const) it(`renders all ${locale} editorial, source readings and public links without collapsed text`, () => {
    const html = renderToStaticMarkup(<DistributedWorkPage quiz={quiz} locale={locale} />);
    const dom = document.createElement("div"); dom.innerHTML = html;
    const text = dom.textContent ?? "";
    expect(distributedLandingSections).toHaveLength(8);
    expect(distributedLandingFaq).toHaveLength(8);
    for (const s of [...distributedLandingSections, ...quiz.guide]) {
      expect(text).toContain(s.title[locale]);
      for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...distributedLandingFaq]) expect(text).toContain(f.question[locale]);
    for (const p of quiz.profiles) {
      for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[locale]);
      expect(html).toContain(`/${locale}/tests/explore/${quiz.slug}/results/${p.id}`);
    }
    expect(html.match(/data-distributed-full-guide=/g)).toHaveLength(4);
    expect(dom.querySelectorAll("details p,details section,details article")).toHaveLength(0);
    expect(html).toContain('id="distributed-reference-3"');
    expect(catalog.find(q => q.slug === quiz.slug)!.description[locale]).toBe(quiz.description[locale]);
  });
});
