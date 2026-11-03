import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/moral-alignment.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { moralAlignmentLandingSummary } from "@/components/questionnaires/MoralAlignmentLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual moral alignment landing editorial", () => {
  it("renders both axes, worked boundary examples, source attribution and distinct bilingual entry summaries", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => moralAlignmentLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(9);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(9);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      const normalize = (text: string) => text.replace(/\[\d\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelectorAll(".disc-source-citation").length).toBeGreaterThanOrEqual(7);
      expect(dom.querySelector('[aria-labelledby="questionnaire-method"]')?.textContent).toContain(quiz.guide.find(section => section.id === "worked-examples")!.title[locale]);
      expect(body).toContain("This work includes material from the System Reference Document 5.2.1");
      const guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const report = document.createElement("div");
      report.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ slug: quiz.slug, locale, profile: "true-neutral" }) }));
      const reportCitations = report.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");
      expect(reportCitations.length).toBeGreaterThan(0);
      for (const citation of reportCitations) expect(citation.getAttribute("href")).toMatch(new RegExp(`^/${locale}/tests/explore/moral-alignment#moral-alignment-reference-[1-3]$`));
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
