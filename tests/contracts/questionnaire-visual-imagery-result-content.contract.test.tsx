import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/aphantasia-test.json";
import content from "@/lib/questionnaires/result-content/aphantasia-test.json";
import { visualImageryResultProfile } from "@/lib/questionnaires/result-content/aphantasia-test";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isImagery12ConfigurationValid, scoreImagery12, type Imagery12Questionnaire } from "@/lib/questionnaires/imagery12";
import { Imagery12Page, Imagery12GuidePage } from "@/components/questionnaires/Imagery12Page";
import { Imagery12FullReading } from "@/components/questionnaires/Imagery12Client";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Imagery12Questionnaire;
describe("Four bilingual visual-imagery readings separate from the strict original questionnaire",()=>{
  it("preserves every original paragraph and raw scoring configuration",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));for(const p of quiz.profiles){const r=visualImageryResultProfile(p);expect(r.title).toEqual(p.title);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isImagery12ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(visualImageryResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("renders all four %s public guides and post-answer full readings",locale=>{
    const entry=renderToStaticMarkup(<Imagery12Page quiz={quiz} locale={locale}/>);expect(entry).toContain("data-imagery12-client");expect(entry).not.toContain(locale==="zh"?"问卷内容暂不可用":"The questionnaire content is unavailable");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<Imagery12GuidePage quiz={quiz} profile={p} locale={locale}/>);expect(root.querySelectorAll('[data-visual-imagery-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-imagery12-result]')).toBeNull();
      const reading=document.createElement("div");reading.innerHTML=renderToStaticMarkup(<Imagery12FullReading profile={p} locale={locale} readingProfiles={quiz.profiles.map(x=>prepareResultProfile(quiz.slug,x))}/>);expect(reading.querySelectorAll('[data-visual-imagery-result-reading] h4')).toHaveLength(7);
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);expect(reading.querySelector(`#imagery12-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(isImagery12ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("rejects foreign %s readings without altering the raw fallback or independent sums",locale=>{
    const p=quiz.profiles[0],prepared=prepareResultProfile(quiz.slug,p);
    for(const foreign of [{...prepared,resultReading:{...prepared.resultReading!,quizSlug:"other"}},{...prepared,id:quiz.profiles[1].id}]){const html=renderToStaticMarkup(<Imagery12FullReading profile={p} locale={locale} readingProfiles={[foreign]}/>);expect(html).not.toContain("data-visual-imagery-result-reading");expect(html).toContain(p.sections[0].paragraphs[0][locale]);}
    for(const mode of ["0","1","2","3","4","na","mixed","one-unscored"]){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,mode==="mixed"?["1","2","2"][i%3]:mode==="one-unscored"?(i===0?"na":"4"):mode]));const score=scoreImagery12(quiz,answers);expect(score.status).toBe("complete");if(score.status!=="complete")throw Error("Complete witness required");for(const [i,p] of quiz.profiles.entries()){const x=score.result[p.id as keyof typeof score.result];if(mode==="na"||(mode==="one-unscored"&&i===0)){expect(x.sum).toBeNull();expect(x.mean).toBeNull();}else{expect(x.sum).toBe(mode==="mixed"?5:Number(mode==="one-unscored"?4:mode)*3);expect(x.mean).toBe(mode==="mixed"?5/3:Number(mode==="one-unscored"?4:mode));}}}
  });
});
