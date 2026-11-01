import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/written-coordination-practice.json";
import content from "@/lib/questionnaires/result-content/written-coordination-practice.json";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { WrittenCoordinationPage } from "@/components/questionnaires/WrittenCoordinationPage";
import { isWrittenCoordinationConfigurationValid, type WrittenCoordinationQuiz } from "@/lib/questionnaires/writtenCoordination";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as WrittenCoordinationQuiz;

describe("Six server-rendered bilingual written-coordination readings", () => {
  it("retains the strict source configuration while expanding only rendered profiles", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = prepareResultProfile(quiz.slug, p);
      expect(prepared.sections.slice(0, 7)).toEqual(p.sections);
      expect(prepared.sections).toHaveLength(9);
      expect(prepareResultProfile(quiz.slug, prepared)).toBe(prepared);
    }
    expect(isWrittenCoordinationConfigurationValid(quiz)).toBe(true);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" };
    expect(prepareResultProfile(quiz.slug, unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("opens every public %s guide without personal records", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(dom.querySelector(`[data-written-coordination-result-reading="${p.id}"]`)).not.toBeNull();
      expect(dom.querySelector("[data-written-client], [data-written-counts], [data-written-entry-result]")).toBeNull();
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
  it.each(["zh", "en"] as const)("makes all six full %s readings available with every module unattempted", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<WrittenCoordinationPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("[data-written-unattempted]")).toHaveLength(6);
    expect(dom.querySelectorAll("[data-written-coordination-result-reading]")).toHaveLength(6);
    for (const p of quiz.profiles) {
      const reading = dom.querySelector(`[data-written-full-guide="${p.id}"]`)!;
      expect(reading.querySelectorAll("h3")).toHaveLength(9);
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(reading.textContent).toContain(text[locale]);
    }
    expect(dom.querySelector("[data-written-entry-result], [data-written-counts]")).toBeNull();
    expect(isWrittenCoordinationConfigurationValid(quiz)).toBe(true);
  });
});
