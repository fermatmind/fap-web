import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Sens16Page } from "@/components/questionnaires/Sens16Page";
import { sens16LandingFaq, sens16LandingSections } from "@/components/questionnaires/Sens16LandingEditorial";
import type { Sens16Questionnaire } from "@/lib/questionnaires/sens16";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sensory-sensitivity.json", "utf8")) as Sens16Questionnaire;
describe("Sens16 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Sens16Page quiz={quiz} locale={locale} />);
    expect(sens16LandingSections).toHaveLength(8);
    expect(sens16LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...sens16LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...sens16LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.sens16.attribution[locale]);
    expect(root.textContent).toContain(quiz.sens16.editionNotice[locale]);
    expect(root.querySelectorAll(".sens16-public-grid li")).toHaveLength(4);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
