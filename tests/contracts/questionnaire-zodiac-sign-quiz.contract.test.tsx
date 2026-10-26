import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/zodiac-sign-quiz.json","utf8")) as Questionnaire;
const bytes=readFileSync("tests/fixtures/questionnaires/zodiac-sign-quiz-reference.json");
type Witness={name:string;answers:QuestionnaireAnswers;counts:Record<string,number>;winners:string[]};
const reference=JSON.parse(bytes.toString()) as {directions:Questionnaire["directions"];questions:Questionnaire["questions"];profiles:Questionnaire["profiles"];witnesses:Witness[];seededWitnesses:Witness[]};
const all=(key="A"):QuestionnaireAnswers=>Object.fromEntries(quiz.questions.map(q=>[q.id,key]));

describe("T173 original twelve sign-named story-making choices",()=>{
  it("binds12original ENZHscenes/12FULL7portraits,equal4exposures,visiblepositions and66encounterpairs to frozen source",()=>{
    expect(isArchetypeConfigurationValid(quiz)).toBe(true);expect(quiz.questions).toEqual(reference.questions);expect(quiz.profiles).toEqual(reference.profiles);expect(quiz.directions).toEqual(reference.directions);
    expect(quiz.questions).toHaveLength(12);expect(quiz.profiles).toHaveLength(12);expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    const pairs=new Map<string,number>();
    for(const direction of quiz.directions){expect(direction.comparisons).toBe(4);for(let position=0;position<4;position++)expect(quiz.questions.filter(q=>q.options[position].directionId===direction.id)).toHaveLength(1);}
    for(const q of quiz.questions){expect(q.correctOptionId).toBeUndefined();expect(new Set(q.options.map(o=>o.directionId)).size).toBe(4);for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){const key=[q.options[a].directionId,q.options[b].directionId].sort().join("|");pairs.set(key,(pairs.get(key)??0)+1);}}
    expect(pairs.size).toBe(66);expect([...pairs.values()].filter(v=>v===1)).toHaveLength(60);expect([...pairs.values()].filter(v=>v===2)).toHaveLength(6);
    for(const p of quiz.profiles){expect(p.directionIds).toEqual([p.id]);expect(p.sections).toHaveLength(7);expect(p.sections.flatMap(s=>s.paragraphs).map(p=>p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(330);expect(p.seo!.title.en.length).toBeLessThanOrEqual(60);expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);}
    const check=(value:unknown):void=>{if(!value||typeof value!=="object")return;const v=value as Record<string,unknown>;if("en"in v||"zh"in v){expect(String(v.en).trim()).not.toBe("");expect(v.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u);expect(String(v.zh)).toMatch(/\p{Script=Han}/u);}else Object.values(v).forEach(check);};check(quiz);
    for(const bank of ["what-element-am-i","chinese-zodiac","next-life","past-life","spirit-animal"]){const other=JSON.parse(readFileSync(`lib/questionnaires/data/${bank}.json`,"utf8")) as Questionnaire;const prompts=new Set(other.questions.flatMap(q=>[q.prompt.en,q.prompt.zh]));for(const q of quiz.questions){expect(prompts.has(q.prompt.en)).toBe(false);expect(prompts.has(q.prompt.zh)).toBe(false);}}
    expect(quiz.faq.some(f=>f.question.en.includes("scientifically")&&f.answer.en.startsWith("No."))).toBe(true);
  });
  it("matches12solo/66pairtie/all12tie and512seeded source witnesses without claiming4^12paths or allpossiblehighestsets",()=>{
    expect(reference.witnesses).toHaveLength(79);expect(reference.seededWitnesses).toHaveLength(512);
    for(const witness of [...reference.witnesses,...reference.seededWitnesses]){const actual=scoreArchetypeQuestionnaire(quiz,witness.answers);if(actual.status!=="complete")throw new Error("Source witness rejected");expect(actual.counts).toEqual(witness.counts);expect([...actual.profileIds].sort()).toEqual([...witness.winners].sort());expect(Object.values(actual.counts).reduce((sum,v)=>sum+v,0)).toBe(12);for(const field of ["percentile","matchPercentage","birthYear","element","ability"])expect(actual).not.toHaveProperty(field);}
    for(const key of ["A","B","C","D"]){const actual=scoreArchetypeQuestionnaire(quiz,all(key));if(actual.status!=="complete")throw new Error("Monoposition witness rejected");expect(actual.counts).toEqual(Object.fromEntries(quiz.directions.map(d=>[d.id,1])));expect(new Set(actual.profileIds)).toEqual(new Set(quiz.profiles.map(p=>p.id)));}
    console.info("ZodiacSigns:12solo+66pairtie+all12tie+4positionties+512seeded sourcewitnesses;not4^12paths,allhighestsets or psychometricvalidation.");
  });
  it("keeps ties independent of display order,withholds partials,rejects invalid configuration andexpires opt-in drafts",()=>{
    const partial=all();delete partial.STAR_12;expect(scoreArchetypeQuestionnaire(quiz,partial)).toEqual({status:"incomplete",answered:11});
    for(const invalid of [null,[],new Date(),{UNKNOWN:"A"},{STAR_01:"na"},{STAR_01:1}])expect(scoreArchetypeQuestionnaire(quiz,invalid).status).toBe("invalid");
    const bad=structuredClone(quiz);bad.questions[0].options[0].score=1;expect(scoreArchetypeQuestionnaire(bad,{})).toEqual({status:"unavailable",answered:0});
    const reversed=structuredClone(quiz);reversed.profiles.reverse();const a=scoreArchetypeQuestionnaire(quiz,all()),b=scoreArchetypeQuestionnaire(reversed,all());if(a.status!=="complete"||b.status!=="complete")throw new Error("Tie witness rejected");expect(new Set(a.profileIds)).toEqual(new Set(b.profileIds));
    const draft=JSON.stringify({version:quiz.version,savedAt:100,answers:{STAR_01:"B"}});expect(readQuestionnaireDraft(quiz,draft,200)).toEqual({STAR_01:"B"});expect(readQuestionnaireDraft(quiz,draft,86400100)).toBeNull();
  });
  it("renders all12completehighestportraits/84sections in both languages without private data or a forced winner",()=>{
    const result=scoreArchetypeQuestionnaire(quiz,all());if(result.status!=="complete")throw new Error("Complete tie rejected");
    for(const locale of ["en","zh"] as const){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale}/>);expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(12);expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(12);expect(dom.querySelectorAll("h4")).toHaveLength(84);for(const p of quiz.profiles){expect(dom.textContent).toContain(p.title[locale]);for(const s of p.sections)for(const text of s.paragraphs)expect(dom.textContent).toContain(text[locale]);}const ids=Array.from(dom.querySelectorAll("[id]"),e=>e.id);expect(new Set(ids).size).toBe(ids.length);}
  });
  it("publishes26nativeENZHpublicpages with completeportraits,canonicalpairs,sitemap andfreeentrylinks",async()=>{
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");vi.resetModules();const entry=await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"),guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"),maps=appendFunSitemapEntries([]);
    try{for(const locale of ["en","zh"] as const){const path=`/${locale}/tests/explore/zodiac-sign-quiz`,props={params:Promise.resolve({locale,slug:quiz.slug})},html=renderToStaticMarkup(await entry.default(props)),meta=await entry.generateMetadata(props);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(html).toContain(quiz.instructions![locale]);const entryDOM=document.createElement("div");entryDOM.innerHTML=html;for(const section of quiz.guide.slice(0,3))expect(entryDOM.querySelector("[aria-labelledby=questionnaire-method]")?.textContent).toContain(section.paragraphs[0][locale]);expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${path}"`);
      for(const profile of quiz.profiles){const publicPath=`${path}/results/${profile.id}`,props={params:Promise.resolve({locale,slug:quiz.slug,profile:profile.id})},rendered=renderToStaticMarkup(await guide.default(props)),metadata=await guide.generateMetadata(props),dom=document.createElement("div");dom.innerHTML=rendered;expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);for(const s of profile.sections)for(const text of s.paragraphs)expect(dom.textContent).toContain(text[locale]);expect(dom.querySelector("[data-archetype-count]")).toBeNull();expect(metadata.title).toBe(profile.seo!.title[locale]);expect(metadata.description).toBe(profile.seo!.description[locale]);expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);expect(metadata.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/zodiac-sign-quiz/results/${profile.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/zodiac-sign-quiz/results/${profile.id}`});expect(maps.some(e=>e.loc===`https://fermatmind.com${publicPath}`)).toBe(true);}
    }}finally{vi.unstubAllEnvs();vi.resetModules();}
  });
});
