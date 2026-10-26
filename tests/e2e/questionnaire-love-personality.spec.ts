import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/love-personality.json","utf8"))as Questionnaire;
const source=JSON.parse(readFileSync("tests/fixtures/questionnaires/love-personality-reference.json","utf8"))as{source_count_vectors:{option_codes:string;counts:number[]}[]};
const ids=quiz.directions.map(d=>d.id);
function witness(profileIndex:number){const expected=quiz.profiles[profileIndex].directionIds.slice().sort().join("|");const row=source.source_count_vectors.find(v=>{const max=Math.max(...v.counts);return ids.filter((_,i)=>v.counts[i]===max).sort().join("|")===expected;});if(!row)throw Error("Missing source witness");return row;}
test.beforeEach(async({page})=>{const cdp=await page.context().newCDPSession(page);await cdp.send("Network.enable");await cdp.send("Network.setBlockedURLs",{urls:["*/api/v0.5/seo/attribution/events*","*/api/track*","*googletagmanager.com/*","*google-analytics.com/*","*hm.baidu.com/*"]});});
async function visibleContext(page:Page){await expect.poll(()=>page.locator("#take-test h2").evaluate(el=>{const bottom=document.querySelector("header")?.getBoundingClientRect().bottom??0,progress=el.previousElementSibling?.tagName==="PROGRESS"?el.previousElementSibling:null,label=progress?.previousElementSibling;return el.getBoundingClientRect().top>=bottom&&(!progress||(progress.getBoundingClientRect().top>=bottom&&!!label&&label.getBoundingClientRect().top>=bottom));})).toBe(true);}
async function start(page:Page,locale:"en"|"zh"){await page.getByRole("button",{name:locale==="zh"?"开始测试":"Start test",exact:true}).click();await visibleContext(page);}
async function finish(page:Page,locale:"en"|"zh",index:number){
 const row=witness(index),profile=quiz.profiles[index];
 for(const[i,q]of quiz.questions.entries()){
  await visibleContext(page);const radio=page.locator(`input[name="${q.id}"][value="${row.option_codes[i]}"]`);
  if(i===0){await radio.focus();await page.keyboard.press("Space");await expect(radio).toBeChecked();}else await radio.check();
  await expect(page.getByRole("region",{name:locale==="zh"?"本次原始选择次数":"Raw choice counts for this attempt",exact:true})).toHaveCount(0);
  await page.getByRole("button",{name:i===23?(locale==="zh"?"查看完整结果":"See full result"):(locale==="zh"?"下一题":"Next"),exact:true}).click();
 }
 await expect(page.getByRole("heading",{level:2,name:profile.title[locale],exact:true})).toBeFocused();await visibleContext(page);
 const counts=page.getByRole("region",{name:locale==="zh"?"本次原始选择次数":"Raw choice counts for this attempt",exact:true});
 for(const[i,d]of quiz.directions.entries())await expect(counts.locator("dl > div").filter({hasText:d.title[locale]}).locator("dd")).toHaveText(`${row.counts[i]} / 12`);
 await expect(page.locator("#take-test h3").filter({hasText:profile.sections[0].title[locale]})).toHaveCount(1);
 for(const section of profile.sections){const node=page.locator(`#report-${section.id}`);await expect(node).toBeAttached();for(const p of section.paragraphs)await expect(node).toContainText(p[locale]);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const allIds=await page.locator("#take-test [id]").evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(allIds).size).toBe(allIds.length);return profile;
}
for(const locale of["en","zh"]as const){const zh=locale==="zh",entry=`/${locale}/tests/explore/love-personality`;
 test(`@release Love interaction ${locale}: hub,keyboard,24sourcechoices,single and pairtie fullreports,publicguide and retake`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/LOVE_PERSONALITY_FC_/.test(r.postData()??""))posts.push(r.url());});
  await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:quiz.title[locale],exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(quiz.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+entry);await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
  await start(page,locale);await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.getByRole("status")).toContainText(zh?"请选择":"Choose an option");const profile=await finish(page,locale,0);
  const next=page.getByRole("heading",{name:zh?"完整结果已呈现，下一步由你选择":"Your full result is ready. Choose what comes next.",exact:true}).locator("..");await expect(next).toContainText(zh?"这项结果不会换算成MBTI类型":"this result is never converted into an MBTI type");
  await page.getByRole("link",{name:zh?"阅读这项结果的公开说明":"Read the public explanation of this result",exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.getByRole("region",{name:zh?"本次原始选择次数":"Raw choice counts for this attempt",exact:true})).toHaveCount(0);for(const s of profile.sections)for(const p of s.paragraphs)await expect(page.locator(`#report-${s.id}`)).toContainText(p[locale]);
  await page.getByRole("link",{name:zh?"免费开始完整测试":"Start the full test for free",exact:true}).click();await start(page,locale);await finish(page,locale,4);await page.getByRole("button",{name:zh?"重新测试":"Retake test",exact:true}).click();await expect(page.getByRole("radio").first()).not.toBeChecked();expect(posts).toEqual([]);expect(new URL(page.url()).search).toBe("");
 });
 test(`@release Love interaction ${locale}: opt-in24h draft,refresh,language,back/edit and clear`,async({page})=>{
  await page.goto(entry);await start(page,locale);await page.getByRole("radio").nth(1).check();await page.getByRole("checkbox").check();await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await page.reload();await page.getByRole("button",{name:zh?"恢复本标签页进度":"Resume this tab's progress",exact:true}).click();await page.getByRole("button",{name:zh?"上一题":"Back",exact:true}).click();await expect(page.getByRole("radio").nth(1)).toBeChecked();await page.getByRole("radio").first().check();
  const other=zh?"en":"zh";await page.goto(`/${other}/tests/explore/love-personality`);await page.getByRole("button",{name:other==="zh"?"恢复本标签页进度":"Resume this tab's progress",exact:true}).click();await page.getByRole("button",{name:other==="zh"?"上一题":"Back",exact:true}).click();await expect(page.getByRole("radio").first()).toBeChecked();await page.getByRole("button",{name:other==="zh"?"退出并清除本次进度":"Exit and clear this attempt",exact:true}).click();expect(await page.evaluate(()=>sessionStorage.getItem("fm_questionnaire_draft:love-personality"))).toBeNull();
 });
 test(`@release Love interaction ${locale}: deniedstorage,tripletie,fourwaytie and private-safe clipboard fallback`,async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return get.call(this,k);};Storage.prototype.setItem=function(k,v){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return set.call(this,k,v);};Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("synthetic clipboard denial");}}});});
  await page.goto(entry);await start(page,locale);await page.getByRole("checkbox").check();await expect(page.getByRole("status")).toContainText(zh?"无法保存":"could not save");await finish(page,locale,10);await page.getByRole("button",{name:zh?"重新测试":"Retake test",exact:true}).click();const profile=await finish(page,locale,14);
  await page.getByRole("button",{name:zh?"复制结果与链接":"Copy result and link",exact:true}).click();const text=await page.getByRole("textbox",{name:zh?"手动复制结果":"Result text for manual copying"}).inputValue();expect(text).toContain(profile.title[locale]);expect(text).not.toMatch(/LOVE_PERSONALITY_FC_|submission|answers|form_code|6\s*\/\s*12|[?&]score/);const url=new URL(text.split("\n").at(-1)!);expect(url.pathname).toBe(`${entry}/results/${profile.id}`);expect(url.search).toBe("");expect(url.hash).toBe("");
 });
}
test("@release Love interaction all32native fullassets,dedicatedSEO,bilingual images and closed source identities",async({page,request})=>{
 for(const locale of["en","zh"]as const){for(const profile of quiz.profiles){const path=`/${locale}/tests/explore/love-personality/results/${profile.id}`;expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+path);await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href",`https://fermatmind.com/zh/tests/explore/love-personality/results/${profile.id}`);for(const section of profile.sections)for(const p of section.paragraphs)await expect(page.locator(`#report-${section.id}`)).toContainText(p[locale]);}
  for(const index of[-1,0,4,14]){const profile=index<0?null:quiz.profiles[index],response=await request.get(`/og/fun/love-personality?locale=${locale}&v=${quiz.version}${profile?"&portrait="+profile.id:""}`);expect(response.status()).toBe(200);expect(response.headers()["content-type"]).toContain("image/png");const bytes=await response.body();expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);}
 }
 for(const path of["/en/tests/explore/love-personality/results/SINGLE_CLEAR_EXPRESSION","/zh/tests/explore/love-personality/results/unknown","/og/fun/love-personality?portrait=SINGLE_CLEAR_EXPRESSION"])expect((await request.get(path)).status()).toBe(404);
});
