import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/response-color.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { responseColorLandingSummary } from "@/components/questionnaires/ResponseColorLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual color landing editorial", () => {
  it("keeps unique report entry summaries, accurate privacy and evidence language in both locales", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => responseColorLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(15);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(15);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      expect(dom.querySelectorAll(".disc-direction-definitions > p")).toHaveLength(4);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelectorAll(".disc-source-citation").length).toBeGreaterThanOrEqual(4);
      expect(dom.textContent).toContain(locale === "zh" ? "重测开始新的作答" : "Retaking starts a new attempt");
      expect(dom.textContent).toContain(locale === "zh" ? "六组配对" : "six pairs");
      expect(dom.textContent).not.toContain("重新作答不会影响之前的记录");
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
