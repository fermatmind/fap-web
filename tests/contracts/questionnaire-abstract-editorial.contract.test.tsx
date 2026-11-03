import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { abstractReasoningLandingSections, abstractReasoningLandingFaq } from "@/components/questionnaires/AbstractReasoningLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/abstract-reasoning.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("abstract reasoning explanatory editorial", () => {
  it("illustrates a position map and independent counterexample check", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="abstract-reasoning" category="everyday" />);
    for (const motif of ["abstract-position-map", "abstract-counterexample"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("independently checks the new worked examples and operation order", () => {
    const reverse = (s: string) => [...s].reverse().join("");
    const left = (s: string) => s.slice(1) + s[0];
    expect(reverse("GJLM")).toBe("MLJG"); expect(left("GJLM")).toBe("JLMG");
    expect("GJLM"[3] + "GJLM".slice(1, -1) + "GJLM"[0]).toBe("MJLG");
    expect(reverse(left("UVWX"))).toBe("UXWV"); expect(left(reverse("UVWX"))).toBe("WVUX");
    const mapping: Record<string, string> = { P: "Q", Q: "R", R: "P" };
    expect([..."PQQR"].map(s => mapping[s]).join("")).toBe("QRRP");
    expect(reverse("HKKH")).toBe("HKKH"); expect(reverse("HKJH")).not.toBe("HKJH");
    const grid = ["UV", "WX", "YZ"];
    expect([0, 1].flatMap(i => grid.map(row => row[i])).join("")).toBe("UWYVXZ");
    for (const locale of ["en", "zh"] as const) {
      const content = abstractReasoningLandingSections.flatMap(s => s.paragraphs.map(p => p[locale])).join(" ");
      for (const answer of ["MLJG", "JLMG", "MJLG", "UXWV", "WVUX", "QRRP", "UWYVXZ"]) expect(content).toContain(answer);
    }
  });
  it("renders original and supplemental bilingual content with fourteen FAQs and complete guide access", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(11);
      for (const section of [...quiz.guide, ...abstractReasoningLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...abstractReasoningLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3, 4]) expect(dom.querySelector(`a[href="#abstract-reasoning-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
