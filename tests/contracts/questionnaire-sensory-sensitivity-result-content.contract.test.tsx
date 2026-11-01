import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/sensory-sensitivity.json";
import content from "@/lib/questionnaires/result-content/sensory-sensitivity.json";
import { sensorySensitivityResultProfile } from "@/lib/questionnaires/result-content/sensory-sensitivity";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isSens16ConfigurationValid, scoreSens16, type Sens16Questionnaire } from "@/lib/questionnaires/sens16";
import { Sens16Page, Sens16GuidePage } from "@/components/questionnaires/Sens16Page";
import { Sens16FullReading } from "@/components/questionnaires/Sens16Client";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Sens16Questionnaire;
describe("Four bilingual sensory readings separate from the strict original questionnaire",()=>{
  it("preserves every original paragraph and raw scoring configuration",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));for(const p of quiz.profiles){const r=sensorySensitivityResultProfile(p);expect(r.title).toEqual(p.title);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isSens16ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(sensorySensitivityResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("renders all four %s public guides and post-answer full readings",locale=>{
    const entry=renderToStaticMarkup(<Sens16Page quiz={quiz} locale={locale}/>);expect(entry).toContain("data-sens16-client");expect(entry).not.toContain(locale==="zh"?"问卷内容暂不可用":"The questionnaire content is unavailable");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<Sens16GuidePage quiz={quiz} profile={p} locale={locale}/>);expect(root.querySelectorAll('[data-sensory-sensitivity-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-sens16-result]')).toBeNull();
      const reading=document.createElement("div");reading.innerHTML=renderToStaticMarkup(<Sens16FullReading profile={p} locale={locale} readingProfiles={quiz.profiles.map(x=>prepareResultProfile(quiz.slug,x))}/>);expect(reading.querySelectorAll('[data-sensory-sensitivity-result-reading] h4')).toHaveLength(7);
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);expect(reading.querySelector(`#sens16-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(isSens16ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("rejects foreign %s readings without altering the raw fallback or independent sums",locale=>{
    const p=quiz.profiles[0],prepared=prepareResultProfile(quiz.slug,p);
    for(const foreign of [{...prepared,resultReading:{...prepared.resultReading!,quizSlug:"other"}},{...prepared,id:quiz.profiles[1].id}]){const html=renderToStaticMarkup(<Sens16FullReading profile={p} locale={locale} readingProfiles={[foreign]}/>);expect(html).not.toContain("data-sensory-sensitivity-result-reading");expect(html).toContain(p.sections[0].paragraphs[0][locale]);}
    for(const mode of ["0","1","2","3","4","na","mixed","one-unscored"]){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,mode==="mixed"?["1","2","2","2"][i%4]:mode==="one-unscored"?(i===0?"na":"4"):mode]));const score=scoreSens16(quiz,answers);expect(score.status).toBe("complete");if(score.status!=="complete")throw Error("Complete witness required");for(const [i,p] of quiz.profiles.entries()){const x=score.result[p.id as keyof typeof score.result];if(mode==="na"||(mode==="one-unscored"&&i===0)){expect(x.sum).toBeNull();expect(x.mean).toBeNull();}else{expect(x.sum).toBe(mode==="mixed"?7:Number(mode==="one-unscored"?4:mode)*4);expect(x.mean).toBe(mode==="mixed"?1.75:Number(mode==="one-unscored"?4:mode));}}}
  });
});
