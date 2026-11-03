import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Synes15Page } from "@/components/questionnaires/Synes15Page";
import { synes15LandingFaq, synes15LandingSections } from "@/components/questionnaires/Synes15LandingEditorial";
import type { Synes15Questionnaire } from "@/lib/questionnaires/synes15";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/synesthesia-test.json", "utf8")) as Synes15Questionnaire;
describe("Synes15 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Synes15Page quiz={quiz} locale={locale} />);
    expect(synes15LandingSections).toHaveLength(8);
    expect(synes15LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...synes15LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...synes15LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.synes15.attribution[locale]);
    expect(root.textContent).toContain(quiz.synes15.editionNotice[locale]);
    expect(root.querySelectorAll(".synes15-public-grid li")).toHaveLength(5);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
