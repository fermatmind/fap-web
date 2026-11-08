import { QuestionnaireTakeSession } from "@/components/questionnaires/QuestionnaireTakeSession";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { ExploreTestEntry } from "@/components/tests/ExploreTestEntry";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { deluluResultSections } from "@/lib/questionnaires/result-content/delulu";
import { bleachCurrentEntryCopy } from "@/components/questionnaires/BleachLandingEditorial";
import { responseColorCurrentEntryCopy } from "@/components/questionnaires/ResponseColorLandingEditorial";
import catalog from "@/lib/questionnaires/catalog.json";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

beforeAll(() => { Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }); });

// UI-only: no stored permission, synthetic answer or automatic submission is introduced.
describe("entertainment preview entry", () => {
  it("invokes the mounted start handler once without selecting any consent input", () => {
    const start = vi.fn();
    render(<><ExploreTestEntry locale="zh" tool={false} /><section id="take-test"><input aria-label="Optional statistics" type="checkbox" /><button data-explore-start onClick={start}>Native start</button></section></>);
    fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
    expect(start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    cleanup();
  });
  it("keeps unavailable engines and disabled parent fieldsets closed", () => {
    const start = vi.fn();
    render(<><ExploreTestEntry locale="en" tool={false} /><section id="take-test"><fieldset disabled><button data-explore-start onClick={start}>Native start</button></fieldset></section></>);
    fireEvent.click(screen.getByRole("button", { name: "Start test" }));
    expect(start).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("not ready");
    cleanup();
  });
  it("links specialized introductions to private take routes and starts the real engine without opting in", async () => {
    const entry = (await import("@/components/questionnaires/QuestionnairePage")).default;
    for (const slug of ["aphantasia-test", "sensory-sensitivity", "sbti-test", "uncertainty-ease-reflection", "emotions-connections-reflection", "caliper-style-assessment-test"]) {
      render(await entry({ params: Promise.resolve({ slug, locale: "en" }) }));
      const hero = document.querySelector<HTMLButtonElement>(".explore-intro-content button[data-explore-start]")!;
      expect(hero, slug).not.toBeNull();
      expect(hero.closest("form")?.getAttribute("action")).toBe(`/en/tests/explore/${slug}/take`);
      expect(document.querySelector('#take-test input[type="radio"]')).toBeNull();
      cleanup();
      const source=await loadQuestionnaire(slug);
      if (!source) throw new Error(`Missing source: ${slug}`);
      const engine=await entry({params:Promise.resolve({slug,locale:"en"}),take:true});
      render(<QuestionnaireTakeSession title={source.title.en} minutes={source.minutes} locale="en" landing={`/en/tests/explore/${slug}`}>{engine}</QuestionnaireTakeSession>);
      await waitFor(() => expect(document.querySelector('#take-test input[type="radio"]'), slug).not.toBeNull());
      expect(document.querySelector('[data-entertainment-activity-opt-in] input:checked'), slug).toBeNull();
      cleanup();
    }
  });
  it("renders both locales of all current native entries with their complete guide paragraphs and current progress copy", async () => {
    const entry = (await import("@/components/questionnaires/QuestionnairePage")).default;
    const omitted: string[] = [];
    for (const item of catalog) {
      const quiz = (await loadQuestionnaire(item.slug))!;
      for (const locale of ["zh", "en"] as const) {
        const dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await entry({ params: Promise.resolve({ slug: item.slug, locale }) }));
        expect(dom.querySelectorAll("h1"), `${item.slug}:${locale}`).toHaveLength(1);
        expect(dom.querySelector("h1")?.textContent, item.slug).toBe(quiz.title[locale]);
        for (const section of item.slug === "delulu-test" ? deluluResultSections(quiz.guide) : quiz.guide) for (const paragraph of section.paragraphs) {
          const normalize = (s: string) => s.replace(/\[[1-3]\]/g, "").replace(/\s+/g, " ").trim();
          const expected = item.slug === "bleach" ? bleachCurrentEntryCopy(paragraph[locale], locale) : item.slug === "response-color" ? responseColorCurrentEntryCopy(paragraph[locale], locale) : paragraph[locale];
          if (!normalize(dom.textContent ?? "").includes(normalize(expected))) omitted.push(`${item.slug}:${locale}:${section.id}`);
        }
        if (item.slug === "bleach") {
          expect(dom.textContent).toContain(locale === "zh" ? "当前答题页不提供进度保存" : "This question page does not save progress");
          expect(dom.textContent).not.toContain(locale === "zh" ? "主动保存后本标签页进度24小时失效" : "opt-in tab progress expires after 24 hours");
        }
      }
    }
    expect(omitted).toEqual([]);
  }, 120000);
});
