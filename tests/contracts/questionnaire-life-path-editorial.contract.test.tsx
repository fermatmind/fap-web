import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/life-path-number.json";
import { BirthNumberPage } from "@/components/questionnaires/BirthNumberPage";
import { birthNumberSections, birthNumberFaq } from "@/components/questionnaires/BirthNumberLandingEditorial";
import { calculateBirthNumber, type BirthNumberQuestionnaire } from "@/lib/questionnaires/birthNumber";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("Life Path transparent symbolic calculator editorial", () => {
  it.each(["en", "zh"] as const)("keeps complete source, twelve guides, direct inputs and bilingual explanation: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<BirthNumberPage quiz={data as BirthNumberQuestionnaire} locale={locale} />);
    const text = dom.textContent!;
    for(const s of [...data.guide,...birthNumberSections]) for(const p of s.paragraphs) expect(text).toContain(p[locale]);
    for(const f of [...data.faq,...birthNumberFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll('[aria-labelledby="birth-number-public-guides"] li')).toHaveLength(12);
    expect(dom.querySelectorAll('[aria-labelledby="birth-number-faq"] h3')).toHaveLength(14);
    expect(dom.querySelectorAll('input[type="checkbox"][required],input[type="checkbox"][checked]')).toHaveLength(0);
    expect(dom.querySelectorAll('[data-entertainment-activity-opt-in]')).toHaveLength(1);
    expect(dom.querySelectorAll('#birth-number-year,#birth-number-month,#birth-number-day')).toHaveLength(3);
    for(const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/life-path-number/results/${p.id}"]`)).not.toBeNull();
    const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
  it("reproduces method-specific worked examples without an invented endpoint", () => {
    expect(birthNumberSections).toHaveLength(9);expect(birthNumberFaq).toHaveLength(8);
    for(const [date,a,b] of [["2009-11-11",33,6],["1980-01-01",11,2],["1999-09-07",8,8]] as const){
      expect(calculateBirthNumber(date,"separate-parts")).toMatchObject({status:"complete",number:a});
      expect(calculateBirthNumber(date,"all-date-digits")).toMatchObject({status:"complete",number:b});
    }
  });
});
