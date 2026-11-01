import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/distributed-work-choices.json";
import content from "@/lib/questionnaires/result-content/distributed-work-choices.json";
import { distributedWorkResultProfile } from "@/lib/questionnaires/result-content/distributed-work-choices";
import { isDistributedWork24ConfigurationValid, recordDistributedWork24 } from "@/lib/questionnaires/distributedWork24";
import { DistributedWorkPage, DistributedWorkGuidePage } from "@/components/questionnaires/DistributedWorkPage";
import { DistributedWorkReport } from "@/components/questionnaires/DistributedWorkReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
function attempts() {
  return ["A", "B", "skip", "mixed", ...quiz.directions.map(d => d.id)].map(mode => Object.fromEntries(quiz.questions.map((q,i) => [q.id, ["A","B","skip"].includes(mode) ? mode : mode === "mixed" ? ["A","B","skip"][i%3] : q.options.find(o => o.directionId === mode)?.id ?? "skip"])));
}
describe("Four complete bilingual distributed-work readings with relative records kept separate", () => {
  it("preserves strict raw identity, every original paragraph and the seven modules", () => {
    const before=JSON.stringify(quiz); expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const r=distributedWorkResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,2)).toEqual(s.paragraphs);}
    for(const id of ["__proto__","unknown"]){const p={...quiz.profiles[0],id};expect(distributedWorkResultProfile(p)).toBe(p);}
    expect(JSON.stringify(quiz)).toBe(before);expect(isDistributedWork24ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("opens every %s public paragraph and valid anchor without private counts",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<DistributedWorkPage quiz={quiz} locale={locale}/>);
    expect(entry.querySelectorAll("[data-distributed-work-result-reading]")).toHaveLength(4);expect(entry.querySelectorAll("[data-distributed-work-result-reading] h3")).toHaveLength(28);expect(entry.querySelector("[data-distributed-count]")).toBeNull();
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelectorAll("[data-distributed-work-result-reading] h2")).toHaveLength(7);expect(root.querySelector("[data-distributed-count]")).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);expect(entry.querySelector(`#distributed-public-${p.id}-${s.id}`)?.textContent).toContain(t[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }expect(JSON.stringify(quiz)).toBe(before);expect(isDistributedWork24ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("retains selected, other and unscored %s records and the same full guides",locale=>{
    for(const answers of attempts()){const result=recordDistributedWork24(quiz,answers);if(result.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<DistributedWorkReport quiz={quiz} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-distributed-work-part]")).toHaveLength(4);expect(root.querySelectorAll("[data-distributed-count]")).toHaveLength(12);
      for(const d of quiz.directions){const rows=quiz.questions.filter(q=>q.options.slice(0,2).some(o=>o.directionId===d.id));const selected=rows.filter(q=>q.options.find(o=>o.id===answers[q.id])?.directionId===d.id).length;const unscored=rows.filter(q=>answers[q.id]==="skip").length;for(const [key,value] of [["selected",selected],["other",12-selected-unscored],["unscored",unscored]] as const)expect(root.querySelector(`[data-distributed-count="${d.id}-${key}"]`)?.textContent).toBe(`${value} / 12`);}
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<DistributedWorkGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(guide.textContent).toContain(t[locale]);}
      expect(recordDistributedWork24(quiz,answers)).toEqual(result);expect(isDistributedWork24ConfigurationValid(quiz)).toBe(true);
    }
  });
});
