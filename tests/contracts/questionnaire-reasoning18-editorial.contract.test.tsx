import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reasoning18Page } from "@/components/questionnaires/Reasoning18Page";
import { reasoning18LandingFaq, reasoning18LandingSections, reasoning18LandingReferences } from "@/components/questionnaires/Reasoning18LandingEditorial";
import type { Reasoning18Questionnaire } from "@/lib/questionnaires/reasoning18";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/employer-reasoning-practice-test.json", "utf8")) as Reasoning18Questionnaire;
describe("Reasoning18 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Reasoning18Page quiz={quiz} locale={locale} />);
    expect(reasoning18LandingSections).toHaveLength(8);
    expect(reasoning18LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...reasoning18LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...reasoning18LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.reasoning18.attribution[locale]);
    expect(root.textContent).toContain(quiz.reasoning18.editionNotice[locale]);
    expect(root.querySelectorAll(".reasoning18-public-grid li")).toHaveLength(3);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of [...(quiz.references ?? []), ...reasoning18LandingReferences]) expect(root.textContent).toContain(r.title[locale]);
  });
});
