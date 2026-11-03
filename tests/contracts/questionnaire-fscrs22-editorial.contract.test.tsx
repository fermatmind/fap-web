import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { fscrsLandingSections, fscrsLandingFaq } from "@/components/questionnaires/FscrsLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreFscrs22Questionnaire, FSCRS22_PART_KEYS, type Fscrs22Questionnaire } from "@/lib/questionnaires/fscrs22";
import raw from "@/lib/questionnaires/data/inner-critic-voice-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Fscrs22Questionnaire;
it("renders separate keyed notebooks and a support message without a fake risk scale", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="framework" />);
  for(const motif of ["fscrs-three-response-notes","fscrs-support-message"])expect(html).toContain(`data-${motif}="true"`);
});
it("calculates the fresh 31/9, 12/5 and 26/8 example and withholds only the skipped part", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  const values={inadequate:[5,1,4,2,5,3,4,2,5],hated:[2,4,1,3,2],reassured:[4,2,5,1,4,3,5,2]};
  for(const id of ["inadequate","hated","reassured"] as const)FSCRS22_PART_KEYS[id].forEach((n,i)=>answers[`fscrs-${String(n).padStart(2,"0")}`]=String(values[id][i]));
  const complete=(a:Record<string,string>)=>{const r=scoreFscrs22Questionnaire(quiz,a);if(r.status!=="complete")throw Error("Wrong result");return r;};
  const result=complete(answers);expect(result.fscrs22.parts.inadequate).toEqual({numericCount:9,skippedCount:0,requiredCount:9,sum:31,mean:31/9});
  expect(result.fscrs22.parts.hated.mean).toBe(2.4);expect(result.fscrs22.parts.reassured.mean).toBe(3.25);
  const skip=complete({...answers,"fscrs-09":"na"});expect(skip.fscrs22.parts.hated).toEqual({numericCount:4,skippedCount:1,requiredCount:5,sum:null,mean:null});
  expect(skip.fscrs22.parts.inadequate).toEqual(result.fscrs22.parts.inadequate);expect(skip.fscrs22.parts.reassured).toEqual(result.fscrs22.parts.reassured);
  expect(Object.keys(result)).toEqual(["status","answered","fscrs22"]);
});
it("renders fourteen bilingual FAQs, all original methods, complete attribution and valid citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(3);
    for(const s of [...quiz.guide,...fscrsLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...fscrsLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    for(const key of ["privacy","attribution","sensitiveNotice"] as const)expect(body).toContain(norm(quiz.fscrs22[key][locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5])expect(dom.querySelector(`#${quiz.slug}-reference-${i}`)).not.toBeNull();
    const client=dom.querySelector("[data-fscrs22-client]")!;
    expect(client.querySelector("fieldset button")?.hasAttribute("data-explore-start")).toBe(true);
    expect(client.querySelectorAll("[data-fscrs22-support]")).toHaveLength(1);
  }
});
