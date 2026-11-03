import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { Nakshatra27Page } from "@/components/questionnaires/Nakshatra27Page";
import { nakshatraSections, nakshatraFaq } from "@/components/questionnaires/NakshatraLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/nakshatra-spica-reference.json","utf8")) as Questionnaire;
describe("Spica-reference birth-star editorial and public library",()=>{
  it.each(["en","zh"] as const)("keeps methods,27 guide links and direct calculator inputs in %s",locale=>{
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<Nakshatra27Page quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll(".explore-intro-entry")).toHaveLength(1);
    expect(dom.querySelectorAll("#take-test")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(dom.querySelector('#nakshatra-confirm')?.parentElement?.textContent).toContain(locale==='en'?'this zone applies':'该时区适用');
    expect(dom.querySelectorAll('details,input[name*="consent"],input[name*="agreement"]')).toHaveLength(0);
    expect(dom.querySelectorAll("#nakshatra-all-guides + p + ul a")).toHaveLength(27);
    expect(dom.querySelectorAll('[aria-labelledby="nakshatra-faq"] h3')).toHaveLength(16);
    expect(dom.querySelectorAll('[id^="nakshatra-reference-"]')).toHaveLength(7);
    expect(dom.querySelectorAll('[data-nakshatra-sector-wheel]')).toHaveLength(1);
    expect(nakshatraSections).toHaveLength(8);expect(nakshatraFaq).toHaveLength(8);
    for(const s of [...nakshatraSections,...quiz.guide])for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);
    for(const a of dom.querySelectorAll('sup a'))expect(dom.querySelector(a.getAttribute('href')!)).not.toBeNull();
    const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
    expect(dom.querySelector('.explore-intro-meta')?.textContent).not.toContain(quiz.instructions![locale]);
  });
});
