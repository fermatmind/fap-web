import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { breakupLandingSections, breakupLandingFaq } from "@/components/questionnaires/BreakupLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireBreakupReviewReport } from "@/components/questionnaires/QuestionnaireBreakupReviewReport";
import raw from "@/lib/questionnaires/data/breakup-reflection-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders four equal review notes and a private notebook", () => {
 const html=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="relationships" />);
 for(const m of ["breakup-four-review-notes","breakup-private-notebook"])expect(html).toContain(`data-${m}="true"`);
});
it("reproduces four means and hides only the incomplete group's sum and mean",()=>{
 const v=[[5,2,4,3,5,4],[2,4,1,3,2,5],[4,5,3,2,4,3],[1,3,2,4,1,3]].flat();
 const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,String(v[i])]));
 const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("facets"in r))throw Error("Wrong result");return r;};
 const r=complete(a);expect(Object.values(r.facets).map(x=>x.mean)).toEqual([3.8333,2.8333,3.5,2.3333]);
 const skip=complete({...a,BREAKUP_LK_004:"na"});expect(skip.facets.communication).toEqual({sum:20,rated:5,total:6,mean:null});
 for(const k of ["expectations","boundaries","external-pressure"])expect(skip.facets[k]).toEqual(r.facets[k]);
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<QuestionnaireBreakupReviewReport quiz={quiz} result={skip} locale={locale}/>);expect(d.querySelector('[data-breakup-review-part="communication"] [data-breakup-review-sum]')).toBeNull();expect(d.querySelectorAll('[data-breakup-review-sum]')).toHaveLength(3);}
 const middle=complete(Object.fromEntries(quiz.questions.map(q=>[q.id,"3"])));expect(Object.values(middle.facets).map(x=>x.mean)).toEqual([3,3,3,3]);
});
it("renders sixteen bilingual FAQs, four guide cards and every preserved plus new paragraph",async()=>{
 expect(catalog.find(x=>x.slug===quiz.slug)?.description).toEqual(quiz.description);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));const body=norm(d.textContent??"");expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);expect(d.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...quiz.guide,...breakupLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
 for(const f of [...quiz.faq,...breakupLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
 expect(body).toContain(norm(quiz.instructions![locale]));for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const i of [1,2,3])expect(d.querySelector(`#${quiz.slug}-reference-${i}`)).not.toBeNull();if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
 }
});
