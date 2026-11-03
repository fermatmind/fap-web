import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Anger20Page } from "@/components/questionnaires/Anger20Page";
import { anger20LandingFaq, anger20LandingSections } from "@/components/questionnaires/Anger20LandingEditorial";
import type { Anger20Questionnaire } from "@/lib/questionnaires/anger20";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/anger-issues-screener.json", "utf8")) as Anger20Questionnaire;
describe("Anger20 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Anger20Page quiz={quiz} locale={locale} />);
    expect(anger20LandingSections).toHaveLength(8);
    expect(anger20LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...anger20LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...anger20LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.anger20.attribution[locale]);
    expect(root.textContent).toContain(quiz.anger20.editionNotice[locale]);
    expect(root.querySelectorAll(".anger20-public-grid li")).toHaveLength(4);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
