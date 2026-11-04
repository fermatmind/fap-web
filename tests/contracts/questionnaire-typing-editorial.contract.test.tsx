import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TypingPage } from "@/components/questionnaires/TypingPage";
import { typingLandingSections, typingLandingFaq } from "@/components/questionnaires/TypingLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/typing-speed.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreTypingRound } from "@/lib/questionnaires/typing";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual timed typing editorial",()=>{
  it("provides a final buffer and minute dial illustration",()=>{
    const html=renderToStaticMarkup(<DiscoveryCardArt slug="typing-speed" category="everyday"/>);
    expect(html).toContain('data-composition="typing-final-buffer:typing-minute-dial:workspace"');
    for(const name of ["typing-final-buffer","typing-minute-dial"])expect(html).toContain(`data-${name}="true"`);
  });
  it("reproduces fresh bilingual worked metrics, omissions and final correction counts",()=>{
    for(const language of ["en","zh"]as const){
      const round={...quiz.typing!.rounds.find(r=>r.language===language)!,passage:"a".repeat(180)};
      const result=scoreTypingRound(round,"a".repeat(171)+"b".repeat(9),60000);
      expect(result).toMatchObject({status:"complete",typedCharacters:180,correctCharacters:171,accuracy:95,cpm:180,correctCpm:171,grossWpm:language==="en"?36:null,correctWpm:language==="en"?34.2:null});
    }
    expect(scoreTypingRound({...quiz.typing!.rounds[0],passage:"red pen"},"redpen",60000)).toMatchObject({status:"complete",correctCharacters:3,incorrectCharacters:3,accuracy:50});
    expect(scoreTypingRound(quiz.typing!.rounds[0],quiz.typing!.rounds[0].passage.slice(0,20),60000)).toMatchObject({status:"complete",typedCharacters:20,accuracy:100});
    expect(scoreTypingRound(quiz.typing!.rounds[0],"",60000)).toMatchObject({status:"complete",accuracy:null});
  });
  it("renders all original and supplementary bilingual copy, fourteen FAQs and resolving references",()=>{
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
    const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
    for(const locale of ["en","zh"]as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<TypingPage quiz={quiz} locale={locale}/>);
      const body=normalize(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="typing-faq"]>div')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="typing-public-guides"]>ul>li')).toHaveLength(2);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for(const section of [...quiz.guide,...typingLandingSections])for(const p of section.paragraphs)expect(body).toContain(normalize(p[locale]));
      for(const faq of [...quiz.faq,...typingLandingFaq]){expect(body).toContain(normalize(faq.question[locale]));expect(body).toContain(normalize(faq.answer[locale]));}
      expect(body).toContain(normalize(quiz.instructions![locale]));
      expect(dom.querySelectorAll(".disc-source-citation").length).toBeGreaterThan(0);
      for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for(const i of [1,2,3,4,5])expect(dom.querySelector(`a[href="#typing-speed-reference-${i}"]`)).not.toBeNull();
      const takeDom=document.createElement("div");takeDom.innerHTML=renderToStaticMarkup(<TypingPage quiz={quiz} locale={locale} take/>);
      expect(dom.querySelector("[data-typing-passage]")).toBeNull();
      expect(takeDom.querySelector("[data-typing-passage]")?.textContent).toBe(quiz.typing!.rounds[0].passage);
      if(locale==="en")expect(body.replaceAll("春天。", "")).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
