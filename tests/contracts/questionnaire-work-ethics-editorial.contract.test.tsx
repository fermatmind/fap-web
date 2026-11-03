import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/work-ethics.json";
import { WorkEthicsPage } from "@/components/questionnaires/WorkEthicsPage";
import { workEthicsSections, workEthicsFaq, workEthicsSummaries } from "@/components/questionnaires/WorkEthicsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("WorkEthics four task-habit groups and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<WorkEthicsPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...workEthicsSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...workEthicsFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="work-ethics-library"] li')).toHaveLength(4);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/work-ethics/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="work-ethics-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#work-ethics-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-work-habits-score]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=work-ethics-reference-] a")).toHaveLength(2);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds four separate habit groups and reproducible arithmetic without a grade", () => {
    expect(workEthicsSections).toHaveLength(9); expect(workEthicsFaq).toHaveLength(8);
    expect(Object.keys(workEthicsSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of workEthicsSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(data.questions).toHaveLength(24);
    const raw = [4,4,2,5,4,4], keyed = raw.map((v,i) => i === 2 || i === 5 ? 6-v : v);
    expect(keyed).toEqual([4,4,4,5,4,2]); expect(keyed.reduce((a,b)=>a+b,0)).toBe(23);
    expect(Math.round(23/6*10)/10).toBe(3.8);
  });
});
