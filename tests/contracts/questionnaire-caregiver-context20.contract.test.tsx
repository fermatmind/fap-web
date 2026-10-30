import { SITE_URL } from "../../lib/site";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/child-focus-activity-observations.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isCaregiverContext20ConfigurationValid, recordCaregiverContext20 } from "../../lib/questionnaires/caregiverContext20";
import { CaregiverContextPage, CaregiverContextGuidePage } from "../../components/questionnaires/CaregiverContextPage";
import { CaregiverContextReport } from "../../components/questionnaires/CaregiverContextReport";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (v: string) => Object.fromEntries(quiz.questions.map(q => [q.id, v]));
describe("Direct caregiver observations remain private categorical records", () => {
  it("binds original bilingual bank and complete public readings", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    expect(isCaregiverContext20ConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [key, value] of [["itemBankSha256", quiz.questions], ["resultContentSha256", quiz.profiles]] as const)
      expect(quiz.source[key]).toBe(createHash("sha256").update(JSON.stringify(value)).digest("hex"));
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(20);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(6);
      expect(p.sections.flatMap(s => s.paragraphs).every(t => t.en.trim() && t.zh.trim())).toBe(true);
    }
  });
  it("retains positive and difficult descriptions without reversal, score or missing-as-zero", () => {
    for (const value of ["0", "1", "2", "3", "4", "na"]) {
      const r = recordCaregiverContext20(quiz, answers(value));
      expect(r.status).toBe("complete"); if (r.status !== "complete") throw Error("Incomplete");
      for (const part of r.records) {
        expect(Object.keys(part).sort()).toEqual(["counts", "id", "observations"]);
        expect(part.counts[value as keyof typeof part.counts]).toBe(5);
        expect(Object.values(part.counts).reduce((a,b) => a+b)).toBe(5);
        expect(part.observations.every(o => o.category === value)).toBe(true);
      }
    }
    const mixed = Object.fromEntries(quiz.questions.map((q,i) => [q.id, ["0","1","2","3","4","na"][i%6]]));
    const r=recordCaregiverContext20(quiz,mixed);
    if(r.status!=="complete") throw Error("Incomplete");
    expect(r.records.map(p=>Object.values(p.counts))).toEqual([[1,1,1,1,1,0],[1,1,1,1,0,1],[1,1,1,0,1,1],[1,1,0,1,1,1]]);
    expect(scoreQuestionnaire(quiz,answers("4"))).toEqual({status:"unavailable",answered:0});
    const missing=answers("0");delete missing.CGO_20;
    expect(recordCaregiverContext20(quiz,missing)).toEqual({status:"incomplete",answered:19});
    for(const bad of [null,[],4,{...answers("0"),CGO_01:0},{...answers("0"),unknown:"0"}]) expect(recordCaregiverContext20(quiz,bad).status).toBe("invalid");
    for(const change of [
      (q:Questionnaire)=>{q.questions[0].reverse=true;},
      (q:Questionnaire)=>{q.questions[0].options[0].score=0;},
      (q:Questionnaire)=>{q.questions[0].options[5].label.en="Does not fit";},
      (q:Questionnaire)=>{q.profiles[0].sections[0].paragraphs[0].zh="";},
      (q:Questionnaire)=>{q.source.scoringVersion="child_adhd_risk";},
    ]) {const bad=structuredClone(quiz);change(bad);expect(recordCaregiverContext20(bad,answers("0"))).toEqual({status:"unavailable",answered:0});}
  });
  it("keeps every guide and support unconditional in EN and ZH",()=>{
    for(const locale of ["en","zh"] as const){
      const html=renderToStaticMarkup(<CaregiverContextPage quiz={quiz} locale={locale}/>);
      expect(html).toContain("data-caregiver-context-support");
      expect((html.match(/data-caregiver-context-full-guide=/g)??[])).toHaveLength(4);
      for(const p of quiz.profiles){
        const guide=renderToStaticMarkup(<CaregiverContextGuidePage quiz={quiz} profile={p} locale={locale}/>);
        expect(guide).toContain("data-caregiver-context-support");
        for(const s of p.sections)for(const t of s.paragraphs){const encoded=renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4);expect(html).toContain(encoded);expect(guide).toContain(encoded);}
      }
      for(const value of ["na","0","4"]){const r=recordCaregiverContext20(quiz,answers(value));if(r.status!=="complete")throw Error("Incomplete");const result=renderToStaticMarkup(<CaregiverContextReport quiz={quiz} records={r.records} locale={locale}/>);expect((result.match(/data-caregiver-context-observation=/g)??[])).toHaveLength(20);expect((result.match(/data-caregiver-context-unscored=/g)??[])).toHaveLength(value==="na"?4:0);}
    }
  });
  it("publishes ten locale-paired public pages and disables their analytics",async()=>{
    const pages=appendFunSitemapEntries([]),entry=await import("../../components/questionnaires/QuestionnairePage"),guide=await import("../../components/questionnaires/QuestionnaireGuide");
    for(const locale of ["en","zh"])for(const p of [null,...quiz.profiles]){
      const path=`/${locale}/tests/explore/${quiz.slug}${p?`/results/${p.id}`:""}`;
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);expect(pages.some(x=>x.loc===`https://fermatmind.com${path}`)).toBe(true);
      const params=Promise.resolve({locale,slug:quiz.slug,profile:p?.id??""});const m=p?await guide.generateMetadata({params}):await entry.generateMetadata({params});
      expect(m.alternates?.canonical).toBe(`${SITE_URL}${path}`);expect(m.alternates?.languages?.["zh-CN"]).toContain("/zh/tests/explore/child-focus-activity-observations");
    }
  });
});
