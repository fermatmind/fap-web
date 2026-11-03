import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MostLeastPage } from "@/components/questionnaires/MostLeastPage";
import { mostLeastLandingSections, mostLeastLandingFaq, mostLeastLandingReferences } from "@/components/questionnaires/MostLeastLandingEditorial";
import type { Questionnaire } from "@/lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/caliper-style-assessment-test.json", "utf8")) as Questionnaire;
it.each(["en", "zh"] as const)("%s renders all original material and bespoke interpretation, with direct practice entry", locale => {
 const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<MostLeastPage quiz={quiz} locale={locale} />);
 expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelectorAll("main")).toHaveLength(1);
 expect(d.querySelector('.explore-intro [data-explore-start]')?.textContent).toBe(locale==="en"?"Start practice":"开始练习");
 expect(d.querySelector('#take-test input[required]')).toBeNull();
 expect(d.querySelector('[data-entertainment-activity-opt-in]')?.textContent).toContain(locale==="en"?"Optional":"可选");
 for(const s of [...quiz.guide,...mostLeastLandingSections]){expect(d.textContent).toContain(s.title[locale]);for(const p of s.paragraphs)expect(d.textContent).toContain(p[locale]);}
 for(const f of [...quiz.faq,...mostLeastLandingFaq]){expect(d.textContent).toContain(f.question[locale]);expect(d.textContent).toContain(f.answer[locale]);}
 for(const p of quiz.profiles)expect(d.querySelector(`a[href="/${locale}/tests/explore/${quiz.slug}/results/${p.id}"]`)).not.toBeNull();
 expect(d.querySelectorAll('.most-least-public-grid > li')).toHaveLength(8);
 for(const r of [...(quiz.references??[]),...mostLeastLandingReferences])expect(d.querySelector(`a[href="${r.url}"]`)?.textContent).toBe(r.title[locale]);
 expect(mostLeastLandingSections).toHaveLength(8);expect(mostLeastLandingFaq).toHaveLength(8);
});
