import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Imposter20Page } from "@/components/questionnaires/Imposter20Page";
import { imposter20LandingFaq, imposter20LandingSections } from "@/components/questionnaires/Imposter20LandingEditorial";
import type { Imposter20Questionnaire } from "@/lib/questionnaires/imposter20";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/imposter-syndrome.json", "utf8")) as Imposter20Questionnaire;
describe("Imposter20 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Imposter20Page quiz={quiz} locale={locale} />);
    expect(imposter20LandingSections).toHaveLength(8);
    expect(imposter20LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...imposter20LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...imposter20LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.imposter20.attribution[locale]);
    expect(root.textContent).toContain(quiz.imposter20.editionNotice[locale]);
    expect(root.querySelectorAll(".imposter20-public-grid li")).toHaveLength(5);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
