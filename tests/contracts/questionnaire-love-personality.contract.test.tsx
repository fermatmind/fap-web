import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-personality.json", "utf8")) as Questionnaire;
const fixtureBytes = readFileSync("tests/fixtures/questionnaires/love-personality-reference.json");
type OriginalProfile = Record<string, unknown> & { profile_code: string; direction_codes: string[]; display_name: string; balancing_actions: string[] };
type Reference = {
  questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"];
  source_item_bank: { test_id: string; form_code: string; item_bank_version: string; items: { question_id: string; prompt: string; options: { code: string; text: string; direction_code: string }[] }[] };
  source_scoring_spec: { scoring_version: string; status: string; directions: { direction_code: string }[] };
  source_result_content: { profiles: OriginalProfile[] };
  source_count_vectors: { option_codes: string; counts: number[] }[];
  profile_mapping: { profile_code: string; native_id: string; direction_codes: string[] }[];
  source_scorer_sha256: string;
  editorial_adaptations: { profile: string; field: string; before: string; after: string }[];
};
const reference = JSON.parse(fixtureBytes.toString()) as Reference;
type SourceResult = { score_availability: string; directions: Record<string, { wins: number }>; ranking: { top_direction_codes: string[] } };
const sourceModule = createRequire(import.meta.url)("../fixtures/questionnaires/multidirection-scorer.cjs") as { create: (config: object) => { scoreSubmission: (submission: object, bank: object, spec: object) => SourceResult } };
const sourceScorer = sourceModule.create({ testId: "LOVE_PERSONALITY", directionCodes: quiz.directions.map(d => d.id), questionCount: 24, pairOccurrences: 4, scheduledComparisons: 12, status: reference.source_scoring_spec.status });
const humanStrings = (value: unknown): string[] => typeof value === "string" ? (/\p{Script=Han}/u.test(value) ? [value] : []) : Array.isArray(value) ? value.flatMap(humanStrings) : value && typeof value === "object" ? Object.values(value).flatMap(humanStrings) : [];

describe("original mini-program Love Personality complete web edition", () => {
  it("preserves24original Chinese pairs, scoring identities, balanced comparisons and every source result asset", () => {
    expect(quiz.code).toBe("LOVE_PERSONALITY"); expect(quiz.source.formCode).toBe("love_personality_forced_choice_24");
    expect(quiz.title).toEqual({ en: "Love Personality Test", zh: "恋爱人格测试" });
    expect(isDirectionalConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(15);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(fixtureBytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(reference.source_scorer_sha256).toBe(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/multidirection-scorer.cjs")).digest("hex"));
    const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, { total: 0, A: 0, B: 0 }])); const pairs = new Map<string, number>();
    for (const [i,q] of quiz.questions.entries()) {
      const original = reference.source_item_bank.items[i]; expect(q.id).toBe(original.question_id); expect(q.prompt.zh).toBe(original.prompt);
      expect(q.options.map(o => ({ code: o.id, text: o.label.zh, direction_code: o.directionId }))).toEqual(original.options);
      expect(q.correctOptionId).toBeUndefined(); expect(q.options.some(o => o.score !== undefined)).toBe(false);
      for (const o of q.options) { exposure[o.directionId].total++; exposure[o.directionId][o.id as "A" | "B"]++; }
      const key = q.options.map(o=>o.directionId).sort().join("|"); pairs.set(key,(pairs.get(key)??0)+1);
    }
    expect([...pairs.values()]).toEqual(Array(6).fill(4)); for (const counts of Object.values(exposure)) expect(counts).toEqual({ total: 12, A: 6, B: 6 });
    // The original bank uses one common stem; the complete paired response, not that stem alone, identifies an item.
    expect(new Set(quiz.questions.map(q=>q.options.map(o=>o.label.en).join("|"))).size).toBe(24);
    for (const [i,profile] of quiz.profiles.entries()) {
      const original = reference.source_result_content.profiles[i]; expect(profile.directionIds).toEqual(original.direction_codes);
      expect(reference.profile_mapping[i]).toMatchObject({ profile_code: original.profile_code, native_id: profile.id });
      const rendered = JSON.stringify(profile);
      for (const [field,value] of Object.entries(original)) {
        if (["profile_code","direction_codes","display_name"].includes(field)) continue; // Explicit readable title mapping; full original headings and directions remain visible.
        for (const text of humanStrings(value)) {
          const adaptation = reference.editorial_adaptations.find(a=>a.profile===original.profile_code && a.before===text);
          expect(rendered,`${profile.id}:${field}`).toContain(adaptation?.after ?? text);
        }
      }
      expect(profile.sections).toHaveLength(profile.directionIds.length===1?11:10);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
      expect(profile.sections.flatMap(s=>s.paragraphs).map(p=>p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);
    }
    expect(reference.editorial_adaptations).toHaveLength(1); expect(reference.editorial_adaptations[0].field).toBe("balancing_actions[0]");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
  });

  it("matches the unchanged source scorer for all1289reachable count vectors and reaches every15single/tied report", () => {
    const ids=quiz.directions.map(d=>d.id),reached=new Set<string>(),seen=new Set<string>(); expect(reference.source_count_vectors).toHaveLength(1289);
    for (const witness of reference.source_count_vectors) {
      assert.equal(witness.option_codes.length,24); const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,witness.option_codes[i]]));
      const source=sourceScorer.scoreSubmission({submission_id:"synthetic-mini-conformance",test_id:"LOVE_PERSONALITY",item_bank_version:reference.source_item_bank.item_bank_version,scoring_version:reference.source_scoring_spec.scoring_version,answers},reference.source_item_bank,reference.source_scoring_spec);
      assert.equal(source.score_availability,"complete"); assert.deepStrictEqual(ids.map(id=>source.directions[id].wins),witness.counts);
      const sourceLeaders=new Set(source.ranking.top_direction_codes),leaders=ids.filter(id=>sourceLeaders.has(id));
      const original=reference.source_result_content.profiles.find(p=>[...p.direction_codes].sort().join("|")==[...leaders].sort().join("|")); assert.ok(original);
      const mapping=reference.profile_mapping.find(p=>p.profile_code===original.profile_code); assert.ok(mapping);
      assert.deepStrictEqual(scoreDirectionalQuestionnaire(quiz,answers),{status:"complete",answered:24,counts:Object.fromEntries(ids.map((id,i)=>[id,witness.counts[i]])),leaders,profileId:mapping.native_id});
      seen.add(witness.counts.join(","));reached.add(mapping.native_id);
    }
    expect(seen.size).toBe(1289); expect([...reached].sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    console.info("LovePersonality:1289unique count vectors with actual original-source scorer witnesses, all15leading sets; not2^24attempt execution or psychometric validation.");
  });

  it("keeps partial, malformed and unavailable states distinct and preserves opt-in24h versioned drafts", async () => {
    const first=quiz.questions[0],partial={ [first.id]:"A" }; expect(scoreDirectionalQuestionnaire(quiz,partial)).toEqual({status:"incomplete",answered:1});
    for(const invalid of [null,[],new Date(),{unknown:"A"},{[first.id]:"na"},{[first.id]:3},Object.create(partial)]) expect(scoreDirectionalQuestionnaire(quiz,invalid).status).toBe("invalid");
    const bad=structuredClone(quiz);bad.directions[0].comparisons=13;expect(scoreDirectionalQuestionnaire(bad,{})).toEqual({status:"unavailable",answered:0});
    const saved={version:quiz.version,savedAt:100000,answers:partial};expect(readQuestionnaireDraft(quiz,JSON.stringify(saved),100001)).toEqual(partial);
    for(const raw of ["broken JSON",JSON.stringify({...saved,version:"old"}),JSON.stringify({...saved,savedAt:100002}),JSON.stringify({...saved,savedAt:100000-86400000})])expect(readQuestionnaireDraft(quiz,raw,100001)).toBeNull();
    for(const slug of ["__proto__","../love-personality","unknown"])expect(await loadQuestionnaire(slug)).toBeNull();
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    for(const locale of ["en","zh"]as const)for(const id of ["SINGLE_CLEAR_EXPRESSION","unknown","../clear-expression"])expect(isMissingFunRoute(questionnaireGuidePath(locale,quiz.slug,id))).toBe(true);
  });

  it("contains complete bilingual authored units and dedicated SEO rather than copied result templates", () => {
    const walk=(value:unknown):void=>{if(!value||typeof value!=="object")return;const obj=value as Record<string,unknown>;if("en"in obj||"zh"in obj){expect(String(obj.en).trim()).not.toBe("");expect(String(obj.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder|lorem ipsum/u);expect(String(obj.zh)).toMatch(/\p{Script=Han}/u);}else Object.values(obj).forEach(walk);};walk(quiz);
    for(const locale of ["en","zh"]as const){expect(new Set(quiz.profiles.map(p=>p.seo!.title[locale])).size).toBe(15);expect(new Set(quiz.profiles.map(p=>p.seo!.description[locale])).size).toBe(15);expect(new Set(quiz.profiles.map(p=>p.sections.map(s=>s.paragraphs.map(x=>x[locale]).join(" ")).join(" "))).size).toBe(15);}
    const entry=catalog.find(q=>q.slug===quiz.slug)!;expect(entry.resultSlugs).toEqual(quiz.profiles.map(p=>p.id));expect(entry.formCode).toBe(quiz.source.formCode);
    expect(quiz.faq.find(f=>f.question.en.includes("Capacity to Love"))?.answer.en).toContain("No.");
  });

  it("server-renders both entries and all30full public guides with native metadata, safe schemas, links and sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");vi.resetModules();const entry=await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"),guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");const maps=appendFunSitemapEntries([]);
    try{for(const locale of ["en","zh"]as const){
      const native=questionnairePath(locale,quiz.slug),props={params:Promise.resolve({locale,slug:quiz.slug})},html=renderToStaticMarkup(await entry.default(props)),meta=await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.description).toBe(quiz.description[locale]);expect(meta.alternates?.canonical).toBe("https://fermatmind.com"+native);expect(html).toContain(quiz.instructions![locale]);expect(html).toContain("application/ld+json");expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${native}"`);expect(maps.some(v=>v.loc==="https://fermatmind.com"+native)).toBe(true);
      for(const profile of quiz.profiles){const nativeGuide=questionnaireGuidePath(locale,quiz.slug,profile.id),props={params:Promise.resolve({locale,slug:quiz.slug,profile:profile.id})};expect(html).toContain(`href="${nativeGuide}"`);const rendered=renderToStaticMarkup(await guide.default(props)),metadata=await guide.generateMetadata(props),dom=document.createElement("div");dom.innerHTML=rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);for(const section of profile.sections)for(const text of section.paragraphs)expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]);expect(metadata.description).toBe(profile.seo!.description[locale]);expect(metadata.alternates?.canonical).toBe("https://fermatmind.com"+nativeGuide);expect(metadata.alternates?.languages).toMatchObject({en:"https://fermatmind.com"+questionnaireGuidePath("en",quiz.slug,profile.id),"zh-CN":"https://fermatmind.com"+questionnaireGuidePath("zh",quiz.slug,profile.id)});expect(rendered).toContain("application/ld+json");expect(maps.some(v=>v.loc==="https://fermatmind.com"+nativeGuide)).toBe(true);expect(rendered).not.toContain("Raw choice counts for this attempt");if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    }}finally{vi.unstubAllEnvs();vi.resetModules();}
  });
});
