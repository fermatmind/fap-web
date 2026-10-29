import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/mattering.json";
import source from "@/tests/fixtures/questionnaires/mattering-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/mattering-profiles-reference.json";
import { isMattering10ConfigurationValid, scoreMattering10 } from "@/lib/questionnaires/mattering10";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
const answers = (values = Array(10).fill(2)) => Object.fromEntries(data.questions.map((q, i) => [q.id, String(values[i])]));
describe("GMS5 + AMS5: source-bound independent sums", () => {
  it("retains every published item and four anchors, with working translation and explicit method identity", async () => {
    expect(isMattering10ConfigurationValid(data)).toBe(true); expect(data.questions).toEqual(source.questions); expect(data.profiles).toEqual(profiles);
    for (const [name, hash] of [["mattering-source-reference", data.source.itemBankSha256], ["mattering-profiles-reference", data.source.resultContentSha256]]) expect(createHash("sha256").update(readFileSync(`tests/fixtures/questionnaires/${name}.json`)).digest("hex")).toBe(hash);
    const loaded = await loadQuestionnaire(data.slug); expect(loaded).toEqual(data); expect(isQuestionnaireConfigurationValid(loaded!)).toBe(true);
    // The dedicated client owns this method; a generic form must fail closed.
    expect(scoreQuestionnaire(loaded!, answers()).status).toBe("unavailable");
    expect(data.questions.every(q => !q.reverse)).toBe(true);
    for (const locale of ["en", "zh"] as const) for (const suffix of ["", "/results/general-mattering", "/results/anti-mattering"]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/mattering${suffix}`)).toBe(true);
  });
  it("checks all1024 response vectors for each scale independently, including equal totals and both endpoints", () => {
    const reached = new Set<number>();
    for (let n = 0; n < 1024; n++) {
      const v = Array.from({ length: 5 }, (_, i) => ((n >> (i * 2)) & 3) + 1), sum = v.reduce((a, b) => a + b, 0);
      for (let side = 0; side < 2; side++) {
        const r = scoreMattering10(data, answers(side ? [...Array(5).fill(3), ...v] : [...v, ...Array(5).fill(3)]));
        expect(r.status).toBe("complete"); if (!('scales' in r)) throw Error(r.status);
        expect(r.scales[side].total).toBe(sum); expect(r.scales[1-side].total).toBe(15); expect(Object.keys(r)).toEqual(["status", "answered", "scales"]);
        reached.add(sum);
      }
    }
    expect([...reached].sort((a,b)=>a-b)).toEqual(Array.from({ length: 16 }, (_,i)=>i+5));
  });
  it("checks every missing-answer mask without imputation or spillover", () => {
    for (let mask = 0; mask < 1024; mask++) {
      const a = Object.fromEntries(data.questions.flatMap((q, i) => mask & (1 << i) ? [[q.id, "2"]] : []));
      const r = scoreMattering10(data, a); if (!('scales' in r)) throw Error(r.status);
      for (let side = 0; side < 2; side++) {
        const count = data.questions.slice(side*5,side*5+5).filter(q=>Object.hasOwn(a,q.id)).length;
        expect(r.scales[side].answered).toBe(count); expect(r.scales[side].total).toBe(count===5?10:null);
      }
    }
  });
  it("rejects unknown keys, malformed values, accessors and symbols without invoking user code", () => {
    let called = false; const getter = Object.defineProperty({},"gms-01",{enumerable:true,get(){called=true;return "2";}});
    for (const value of [null, [], new Date(), 2, { ...answers(), unknown: "2" }, { ...answers(), "gms-01": 2 }, { ...answers(), "ams-05":"0" }, { ...answers(), "ams-05":"5" }, {...answers(),"gms-01":"2.0"},getter,{...answers(),[Symbol()]:"2"}]) expect(scoreMattering10(data,value).status).toBe("invalid");
    expect(called).toBe(false);
  });
  it("fails closed for sparse and damaged method, question, option and report configurations", () => {
    const cases: unknown[] = [null, {}];
    for (const change of [(q: typeof data)=>{delete q.questions[3];},(q: typeof data)=>{delete q.questions[0].options[0];},(q: typeof data)=>{q.questions[5].reverse=true;},(q: typeof data)=>{q.questions[0].options[0].score=0;},(q: typeof data)=>{q.profiles[0].sections[0].paragraphs[0].en="";},(q: typeof data)=>{q.questions[6].id=q.questions[5].id;},(q: typeof data)=>{q.directions[0].itemCount=4;}]) { const q=structuredClone(data);change(q);cases.push(q); }
    for(const q of cases){expect(isMattering10ConfigurationValid(q)).toBe(false);expect(scoreMattering10(q,answers()).status).toBe("unavailable");}
  });
});
