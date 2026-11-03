import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/ten-key-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreTenKeyRound } from "@/lib/questionnaires/tenKey";
import { TenKeyPage } from "@/components/questionnaires/TenKeyPage";
import { tenKeyLandingSections, tenKeyLandingFaq } from "@/components/questionnaires/TenKeyLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual ten-key editorial", () => {
  it("reproduces a different-length-row example without treating row accuracy as a KPH multiplier", () => {
    const round = { ...quiz.tenKey!.rounds[0], values: ["246", "5710", "803", ...quiz.tenKey!.rounds[0].values.slice(3)] };
    const result = scoreTenKeyRound(round, ["246", "5790", "803"].map((text, index) => ({ text, atMs: 1000 * (index + 1) })), 60000);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Example rejected");
    expect(result.confirmedKph).toBe(780); expect(result.exactEntryKph).toBe(480);
    expect(result.entryErrorRate).toBeCloseTo(100 / 3); expect(result.characterAccuracy).toBe(90);
    expect(result.exactEntryKph).not.toBeCloseTo(result.confirmedKph * result.entryAccuracy! / 100);
  });
  it("renders every original and new bilingual paragraph and fourteen FAQs with resolving citations", () => {
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<TenKeyPage quiz={quiz} locale={locale} />);
      const normalize = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of [...quiz.guide, ...tenKeyLandingSections]) for (const p of section.paragraphs) expect(body).toContain(normalize(p[locale]));
      for (const faq of [...quiz.faq, ...tenKeyLandingFaq]) expect(body).toContain(normalize(faq.answer[locale]));
      expect(dom.querySelectorAll('[aria-labelledby="ten-key-faq"] > section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="ten-key-public-guides"] li')).toHaveLength(3);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelectorAll("h1")).toHaveLength(1);
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
