import { CognitiveFunctionsVersions } from "@/components/questionnaires/CognitiveFunctionsVersions";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Jung56Client from "@/components/questionnaires/Jung56Client";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import content from "@/lib/questionnaires/jung56Content.json";
import { Jung56GuideContent } from "@/components/questionnaires/Jung56GuideContent";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/tracking/internalTraffic", () => ({ getAnalyticsDeploymentEnvironment: () => "production", shouldAllowFirstPartyAnalyticsRuntime: () => ({ allowed: true }) }));
const originalScrollDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
afterEach(() => { cleanup(); window.localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); if (originalScrollDescriptor) Object.defineProperty(Element.prototype, "scrollIntoView", originalScrollDescriptor); else Reflect.deleteProperty(Element.prototype, "scrollIntoView"); });
import bank from "@/lib/questionnaires/jung56Bank.json";
import original32 from "@/lib/questionnaires/data/cognitive-functions-test.json";
import { JUNG56_DIRECTIONS, isJung56ConfigurationValid, isJung56ContentValid, scoreJung56 } from "@/lib/questionnaires/jung56";
const golden = [{"codes":"ABABABABABABABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","wins":[14,6,6,6,6,6,6,6],"top":[0]},{"codes":"BAAAAAAAAAAAAAABABABABABABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","wins":[6,14,6,6,6,6,6,6],"top":[1]},{"codes":"AABAAAAAAAAAAABAAAAAAAAAAAABABABABABAAAAAAAAAAAAAAAAAAAA","wins":[6,6,14,6,6,6,6,6],"top":[2]},{"codes":"AAAABAAAAAAAAAAABAAAAAAAAABAAAAAAAAAABABABABAAAAAAAAAAAA","wins":[6,6,6,14,6,6,6,6],"top":[3]},{"codes":"AAAAAABAAAAAAAAAAABAAAAAAAAABAAAAAAABAAAAAAAABABABAAAAAA","wins":[6,6,6,6,14,6,6,6],"top":[4]},{"codes":"AAAAAAAABAAAAAAAAAAABAAAAAAAAABAAAAAAABAAAAABAAAAAABABAA","wins":[6,6,6,6,6,14,6,6],"top":[5]},{"codes":"AAAAAAAAAABAAAAAAAAAAABAAAAAAAAABAAAAAAABAAAAABAAABAAAAB","wins":[6,6,6,6,6,6,14,6],"top":[6]},{"codes":"AAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAABAAAAAAABAAAAABAAABABA","wins":[6,6,6,6,6,6,6,14],"top":[7]},{"codes":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","wins":[7,7,7,7,7,7,7,7],"top":[0,1,2,3,4,5,6,7]},{"codes":"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","wins":[7,7,7,7,7,7,7,7],"top":[0,1,2,3,4,5,6,7]},{"codes":"BABBBAAAAABBBABBBBBBBABBABBBAABBAABBBBABBBAAAAAABBBBBAAA","wins":[4,8,7,9,7,6,7,8],"top":[3]},{"codes":"BAABBBBBBAAABBAAABBBBBBBBBAABBABABBBAAABABBBBABBAABABBBA","wins":[6,9,8,8,6,6,5,8],"top":[1]},{"codes":"BBABAAABABAABBBAABABABBAAABBBBABAAABAAABABBAAABABBBABABB","wins":[10,8,9,7,4,1,9,8],"top":[0]},{"codes":"BBABABABABAABBBBBABBABBABAABBBBBBAAABBBBABBABABBAABAAAAB","wins":[11,5,6,6,5,5,10,8],"top":[0]},{"codes":"BAAAAAAABABABBAABABAAABBAAABABBBBAAABABBABBABABBAAABABBA","wins":[4,6,8,6,7,11,6,8],"top":[5]},{"codes":"BABAABBAABBBBAAABABBBABBABAABBBABABABBBBBAABBABABABBABAA","wins":[5,7,5,7,5,10,10,7],"top":[5,6]},{"codes":"ABABBBBBBBABBBBAABBBBABABAABBBBAAAABBBBAAABBABBABBABABBB","wins":[10,3,8,4,7,11,7,6],"top":[5]},{"codes":"ABABABBBAABBBABABABBBBABAABABABAABBBAABABAABAABBBBBBBAAA","wins":[9,5,5,7,8,8,6,8],"top":[0]},{"codes":"ABABAABAAAAABBBBBABBBAABBAABABABAAABBAABBABBABABBBBBAABA","wins":[8,4,10,6,10,5,5,8],"top":[2,4]},{"codes":"AAAAABBAABAAABABABBABABBAABBAAABABBBBAAABBABAAABAAABBBAB","wins":[9,7,8,5,11,7,5,4],"top":[4]},{"codes":"ABABBABABABBBAABBAABABAAABABAAAAAABABABABAABAAAAABABAABA","wins":[5,9,5,6,9,9,6,7],"top":[1,4,5]},{"codes":"BABABABBABAABABAAABBBBBABBABBAABBBBAABBBAAABAABABAAAAAAB","wins":[4,6,9,9,5,5,10,8],"top":[6]},{"codes":"BAAABABAAABBBAABAAABABBBAAAABBABAABBAABABBAAAAABAAABBABB","wins":[3,11,7,7,8,6,5,9],"top":[1]},{"codes":"AABBBAABBAABAABABBBBBAABAAABBBAABBBAAAABAABBBBAABAAABBAB","wins":[7,6,8,8,5,8,6,8],"top":[2,3,5,7]},{"codes":"AAAABAAABABABAAAAAAAABBBBBABAAAAABAAAABAABABABABBABBBAAA","wins":[3,8,9,8,8,6,5,9],"top":[2,7]},{"codes":"AABABBBBAAAAABBAAAAABABBBAAAAAABBABAAABABBBBAABABBAABABB","wins":[7,4,8,6,6,7,9,9],"top":[6,7]},{"codes":"AAAABBAABAABABBABBABABAAAAABAAAABBAAABAAAABABBABAABBAABA","wins":[8,8,9,6,6,7,4,8],"top":[2]},{"codes":"BABAABABBABBAAABBBBBAABBBBBBBABBBBABBAABBBBAAAAABAABABBA","wins":[6,9,7,5,7,9,5,8],"top":[1,5]},{"codes":"BAABABBABBBBAAABBBBAAABAAABABAABBAAAABBAABABBAABBBABBBBA","wins":[7,7,3,9,9,9,5,7],"top":[3,4,5]},{"codes":"AABBBABABABAABAABAAABAABBABBABABBAABABBAABABBABABBABBAAB","wins":[4,5,9,11,4,10,8,5],"top":[3]},{"codes":"AABAABBABABBBABABABBBBBAAAABBAAAABBAAAABABABAAABABBABBAB","wins":[4,4,9,9,11,6,7,6],"top":[4]},{"codes":"BABAAAAABABABABABBABBBBBBBAAABBBBBAABABAAABABBBAAAAAAABB","wins":[2,8,10,4,5,9,9,9],"top":[2]},{"codes":"AAAABBBBBBBAABAAAABAAAAABABBAABBBABBAAABBAABAAABAABAAAAB","wins":[7,5,6,8,9,5,11,5],"top":[6]},{"codes":"ABBBBBAABBBBAABABBAAAAABBAAABBAABAAAAABBBBBBBABBBAAAAAAA","wins":[8,5,7,7,5,8,7,9],"top":[7]},{"codes":"AAABAABABAAAAABBAABBBBABBAABABAAABAABABAAABBBBBABBBABBAA","wins":[6,7,9,4,7,8,7,8],"top":[2]},{"codes":"BAABBBAABABBBBBBABAABBABBABBBBAABABAAAAABBAABABAAABBAABA","wins":[6,9,4,6,5,9,7,10],"top":[7]},{"codes":"BBBAAABBAAABBABBAABBBBABBAABBAAABAABAAABABBAAAABAABBBBBB","wins":[6,7,8,7,9,6,4,9],"top":[4,7]},{"codes":"AABAABAABBBBBAABAABAABBAAABBBAAAAAAABABAABAABBBBBBAAABAA","wins":[6,7,6,5,10,8,7,7],"top":[4]},{"codes":"BBBBBABABBABBAABABBBBABABABBBAABBBBABABAAABBBABAABBAAAAA","wins":[5,6,5,5,9,8,9,9],"top":[4,6,7]},{"codes":"BBAABBBAABABBAABBAABBBAABBAABABABABBAABAABABBAABABBBAABA","wins":[7,8,3,9,9,9,4,7],"top":[3,4,5]},{"codes":"AAABABBBABAAAAAAAAABABBBBABABAABBBBBBAABBABAAAAABABABBAB","wins":[10,8,5,5,7,2,10,9],"top":[0,6]},{"codes":"BABBABBAABBAAABBAAAABAAAABBBAABBAABAABBAABBBAABAABBBBBAA","wins":[6,8,6,7,7,8,8,6],"top":[1,5,6]}];
const answers = (codes: string) => Object.fromEntries(bank.questions.slice(0, codes.length).map((q, i) => [q.id, codes[i]]));
const attempt = (codes: string) => ({ edition: bank.edition, answers: answers(codes) });
const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b, "en")).map(([k, x]) => [k, canonical(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(canonical(v))).digest("hex");
// 42 synthetic sheets scored by the actual Mini scorer, SHA 68300bad078db9def10e57037a7e1ac04a7baff94c7af62695448f75bd7a9f4a. Not a population or exhaustive claim.
describe("Jung56 Mini public-preview working Web edition", () => {
  it("binds56 bilingual choices, source identity and exact28x2/14 exposure topology without changing32", () => {
    expect(isJung56ConfigurationValid(bank)).toBe(true);expect(hash(bank.questions)).toBe(bank.source.itemBankSha256);
    expect(bank.source.psychometricValidationCompleted).toBe(false);expect(bank.source.languageEquivalenceEstablished).toBe(false);
    expect(bank.questions).toHaveLength(56);
    for (const id of JUNG56_DIRECTIONS) {
      const exposure=bank.questions.flatMap(q=>q.options).filter(o=>o.directionId===id);
      expect(exposure).toHaveLength(14);expect(exposure.filter(o=>o.id==='A')).toHaveLength(7);expect(exposure.filter(o=>o.id==='B')).toHaveLength(7);
    }
    expect(createHash('sha256').update(JSON.stringify(original32.questions)).digest('hex')).toBe('7e1297d73ba66b1ebde6551a00ba79eebcffce9537a0caa39d0aa7b14fd9eb50');
    expect(createHash('sha256').update(JSON.stringify(original32.profiles)).digest('hex')).toBe('08e4138e318ae91043e1172a285ae3f2b2648898d5545a7376d5bb04d8e7ead1');
  });
  it("matches42 frozen actual-source sheets, including8 single-top witnesses and an8-way tie", () => {
    for(const [i,sheet] of golden.entries()) {
      const r=scoreJung56(bank,attempt(sheet.codes));expect(r.status).toBe('complete');if(r.status!=='complete')throw Error('complete');
      expect(r.result.rows.map(x=>x.wins)).toEqual(sheet.wins);expect(r.result.topDirectionIds.map(id=>JUNG56_DIRECTIONS.indexOf(id)).sort()).toEqual(sheet.top);
      expect(r.result.rows.reduce((sum,x)=>sum+x.wins,0)).toBe(56);expect(r.result.rows.every(x=>x.wins>=0&&x.wins<=14)).toBe(true);
      if(i<8)expect(r.result.topDirectionIds).toEqual([JUNG56_DIRECTIONS[i]]);
    }
    const r=scoreJung56(bank,attempt('A'.repeat(56)));if(r.status!=='complete')throw Error('complete');expect(r.result.groups).toEqual([{rank:1,wins:7,directionIds:[...JUNG56_DIRECTIONS]}]);
  });
  it("suppresses rankings for every0..55 prefix and explicitly missing responses", () => {
    for(let n=0;n<56;n++)expect(scoreJung56(bank,attempt('A'.repeat(n)))).toEqual({status:'incomplete',answered:n});
    for(const q of bank.questions)expect(scoreJung56(bank,{...attempt('A'.repeat(56)),answers:{...answers('A'.repeat(56)),[q.id]:null}})).toEqual({status:'incomplete',answered:55});
  });
  it("rejects incompatible editions, foreign keys, nonstring values, accessors and inherited inputs", () => {
    for(const bad of [null,undefined,[],new Date(),Object.create(attempt('A'.repeat(56))),{...attempt('A'.repeat(56)),extra:1},{...attempt('A'.repeat(56)),edition:'old32'}, {edition:bank.edition,answers:{unknown:'A'}}, {edition:bank.edition,answers:Object.create({JUNG_FC_001:'A'})}])expect(scoreJung56(bank,bad).status).toBe('invalid');
    for(const bad of [0,true,undefined,'a',' A ','C',{},Object.create(null),[],NaN])expect(scoreJung56(bank,{edition:bank.edition,answers:{...answers('A'.repeat(56)),JUNG_FC_001:bad}}).status).toBe('invalid');
    expect(scoreJung56(bank,{edition:bank.edition,answers:Object.defineProperty({},'JUNG_FC_001',{get:()=>{throw Error('must not run')},enumerable:true})}).status).toBe('invalid');
    expect(scoreJung56(bank,{edition:bank.edition,answers:{[Symbol('foreign')]:'A'}}).status).toBe('invalid');
  });
  it("fails visibly on topology, missing text or method metadata drift", () => {
    const bad=structuredClone(bank);bad.questions[0].options[0].directionId='fi';expect(scoreJung56(bad,attempt('A'.repeat(56)))).toEqual({status:'unavailable'});
    const empty=structuredClone(bank);empty.questions[0].options[0].label.en='';expect(isJung56ConfigurationValid(empty)).toBe(false);
    expect(isJung56ConfigurationValid({...bank,source:{...bank.source,psychometricValidationCompleted:true}})).toBe(false);
  });
});

it("keeps all8 complete bilingual adopted public cards and visible method-specific boundaries", () => {
  expect(isJung56ContentValid(content)).toBe(true);expect(hash({common:content.common,cards:content.cards})).toBe(content.contentSha256);
  if(!isJung56ContentValid(content))throw Error('content');
  for(const locale of ['en','zh'] as const)for(const card of content.cards){
    const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(createElement(Jung56GuideContent,{card,locale}));
    expect(dom.querySelectorAll('h4')).toHaveLength(10);
    for(const key of ['construct_definition','attention_focus','processing_pattern','interpretation_boundary'] as const)expect(dom.textContent).toContain(card[key][locale]);
    for(const key of ['observable_tendencies','possible_contributions','possible_blind_spots','balance_practices','reflection_questions','does_not_mean'] as const)for(const p of card[key])expect(dom.textContent).toContain(p[locale]);
    if(locale==='en')expect(dom.textContent).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);
  }
  const bad=structuredClone(content);bad.cards[0].does_not_mean.pop();expect(isJung56ContentValid(bad)).toBe(false);
});

it("requires56 page opt-in plus global consent, does not backfill, and revokes on pagehide", () => {
  Object.defineProperty(Element.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});
  const fetch=vi.fn().mockResolvedValue({ok:true});vi.stubGlobal('fetch',fetch);window.localStorage.setItem('fm_consent_v1',JSON.stringify({analytics:'granted'}));
  render(createElement(Jung56Client,{locale:'en'}));
  fireEvent.click(screen.getByRole('button',{name:'Start the 56 choices'}));expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox'));expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Exit and clear the 56-choice responses'}));
  fireEvent.click(screen.getByRole('button',{name:'Start the 56 choices'}));expect(fetch).toHaveBeenCalledOnce();
  const payload=JSON.parse(fetch.mock.calls[0][1].body);expect(payload.eventName).toBe('fun_start');expect(payload.payload.form_code).toBe(bank.edition);expect(JSON.stringify(payload)).not.toMatch(/JUNG_FC_|answers|wins|rank|directionId/);
  fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Exit and clear the 56-choice responses'}));fireEvent.click(screen.getByRole('button',{name:'Start the 56 choices'}));expect(fetch).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('checkbox'));window.localStorage.setItem('fm_consent_v1',JSON.stringify({analytics:'denied'}));fireEvent.click(screen.getByRole('button',{name:'Exit and clear the 56-choice responses'}));fireEvent.click(screen.getByRole('button',{name:'Start the 56 choices'}));expect(fetch).toHaveBeenCalledOnce();
  window.localStorage.setItem('fm_consent_v1',JSON.stringify({analytics:'granted'}));fireEvent(window,new Event('pagehide'));expect(screen.getByRole('checkbox')).not.toBeChecked();fireEvent.click(screen.getByRole('button',{name:'Start the 56 choices'}));expect(fetch).toHaveBeenCalledOnce();
});

it("reports a denied32 draft deletion without claiming success or blocking the memory-only56 edition", async () => {
  vi.spyOn(Storage.prototype,'removeItem').mockImplementation(()=>{throw Error('Synthetic storage denial');});
  render(createElement(CognitiveFunctionsVersions,{locale:'en'}));fireEvent.click(screen.getByRole('button',{name:/Choose the 56-choice edition/}));
  expect(screen.getByText(/deletion of that copy could not be confirmed/)).toBeVisible();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Start the 56 choices'})).toBeVisible());
  expect(screen.queryByRole('button',{name:/Resume this tab/})).toBeNull();
});
