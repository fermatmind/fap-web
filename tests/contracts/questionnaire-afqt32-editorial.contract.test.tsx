import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Afqt32Page } from "@/components/questionnaires/Afqt32Page";
import { afqt32LandingFaq, afqt32LandingSections } from "@/components/questionnaires/Afqt32LandingEditorial";
import type { Afqt32Questionnaire } from "@/lib/questionnaires/afqt32";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/asvab-practice-test.json", "utf8")) as Afqt32Questionnaire;
describe("Afqt32 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Afqt32Page quiz={quiz} locale={locale} />);
    expect(afqt32LandingSections).toHaveLength(8);
    expect(afqt32LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...afqt32LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...afqt32LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.afqt32.attribution[locale]);
    expect(root.textContent).toContain(quiz.afqt32.editionNotice[locale]);
    expect(root.querySelectorAll(".afqt32-public-grid li")).toHaveLength(4);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
