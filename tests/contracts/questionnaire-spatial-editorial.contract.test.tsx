import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { spatialReasoningLandingSections, spatialReasoningLandingFaq } from "@/components/questionnaires/SpatialReasoningLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/spatial-reasoning.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("spatial reasoning explanatory editorial", () => {
  it("illustrates fixed-axis turns and fold partners", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="spatial-reasoning" category="everyday" />);
    for (const motif of ["spatial-turn-frame", "spatial-fold-partners"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("independently recomputes the new examples without changing question material", () => {
    const ccw = ([x, y]: number[]) => [-y, x];
    const reflectX = ([x, y]: number[]) => [x, -y];
    expect(ccw([5, 1])).toEqual([-1, 5]);
    expect(5 ** 2 + 1 ** 2).toBe(26);
    expect(ccw([5 - 2, 1 + 1]).map((v, i) => v + [2, -1][i])).toEqual([0, 2]);
    expect([2 * 2 - 6, -3]).toEqual([-2, -3]);
    expect(reflectX(ccw([1, 3]))).toEqual([-3, -1]);
    expect(ccw(reflectX([1, 3]))).toEqual([3, 1]);
    expect([-2, 2].flatMap(x => [-3, 3].map(y => [x, y]))).toHaveLength(4);
    const rows = [[1, 0, 2], [3, 2, 1]];
    expect(rows.flat().reduce((a, b) => a + b, 0)).toBe(9);
    expect(rows.flat().filter(Boolean)).toHaveLength(5);
    expect(rows[0].map((_, x) => Math.max(...rows.map(row => row[x])))).toEqual([3, 2, 2]);
    expect(3 + 2 + 2).toBe(7);
    expect([0 - 3 - 1, -2 - 2]).toEqual([-4, -4]);
    // Track the same labelled normals through distinct rigid rotation matrices.
    const normals: Record<string, number[]> = {T:[0,0,1],B:[0,0,-1],F:[0,-1,0],K:[0,1,0],R:[1,0,0],L:[-1,0,0]};
    const forward = ([x,y,z]:number[]) => [x,-z,y];
    const right = ([x,y,z]:number[]) => [z,y,-x];
    const at = (ops: ((v:number[])=>number[])[], target:number[]) => Object.entries(normals).find(([,v]) => ops.reduce((a,f)=>f(a),v).every((n,i)=>n===target[i]))![0];
    expect([[0,0,1],[0,-1,0],[1,0,0]].map(v=>at([forward,right],v))).toEqual(["L","T","K"]);
    expect([[0,0,1],[0,-1,0],[1,0,0]].map(v=>at([right,forward],v))).toEqual(["K","L","T"]);
    expect([3,1,4,2,5].reduce((a,b)=>a+b,0)).toBe(15);
    for (const locale of ["en", "zh"] as const) {
      const text = spatialReasoningLandingSections.flatMap(s => s.paragraphs.map(p => p[locale])).join(" ");
      for (const example of ["26", locale === "zh" ? "35" : "thirty-five", "217", "15/30"]) expect(text).toContain(example);
    }
  });
  it("renders original and supplemental bilingual content with fourteen FAQs and complete guide access", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(11);
      for (const section of [...quiz.guide, ...spatialReasoningLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...spatialReasoningLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3, 4, 5, 6]) expect(dom.querySelector(`a[href="#spatial-reasoning-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
