import { seedAnalyticsConsent } from "./helpers/consent";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/love-personality.json","utf8"))as Questionnaire;
const source=JSON.parse(readFileSync("tests/fixtures/questionnaires/love-personality-reference.json","utf8"))as{source_count_vectors:{option_codes:string;counts:number[]}[]};
const ids=quiz.directions.map(d=>d.id);
function witness(profileIndex:number){const expected=quiz.profiles[profileIndex].directionIds.slice().sort().join("|");const row=source.source_count_vectors.find(v=>{const max=Math.max(...v.counts);return ids.filter((_,i)=>v.counts[i]===max).sort().join("|")===expected;});if(!row)throw Error("Missing source witness");return row;}
test.beforeEach(async({page})=>{const cdp=await page.context().newCDPSession(page);await cdp.send("Network.enable");await cdp.send("Network.setBlockedURLs",{urls:["*/api/v0.5/seo/attribution/events*","*/api/track*","*googletagmanager.com/*","*google-analytics.com/*","*hm.baidu.com/*"]});});
async function expectQuestionFocus(page: Page) {
  await expect(page.locator("#take-test h2")).toBeFocused();
  const progress = page.locator("#take-test progress");
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toBeInViewport();
}
async function start(page: Page) {
  await page.locator("[data-explore-start]:visible").first().click();
  await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
  await expectQuestionFocus(page);
}
async function finish(page:Page,locale:"en"|"zh",index:number){
 const row=witness(index),profile=quiz.profiles[index];
 for(const[i,q]of quiz.questions.entries()){
  if (i > 0) await expectQuestionFocus(page);
  const radio = page.locator(`input[name="${q.id}"][value="${row.option_codes[i]}"]`);
  await expect(page.getByRole("region", { name: locale === "zh" ? "本次原始选择次数" : "Raw choice counts for this attempt", exact: true })).toHaveCount(0);
  if (i === 0) await radio.press("Space");
  else await radio.click();
  await expect(radio).toHaveCount(0);
 }
 await expect(page.getByRole("heading",{level:2,name:profile.title[locale],exact:true})).toBeFocused();
 const counts=page.getByRole("region",{name:locale==="zh"?"本次原始选择次数":"Raw choice counts for this attempt",exact:true});
 await expect(counts.locator("dd")).toHaveText(row.counts.map(count => `${count} / 12`));
 await expect(page.locator(`#take-test a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
 for(const section of profile.sections){const node=page.locator(`#report-${section.id}`);await expect(node).toBeAttached();for(const p of section.paragraphs)await expect(node).toContainText(p[locale]);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const allIds=await page.locator("#take-test [id]").evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(allIds).size).toBe(allIds.length);return profile;
}
for(const locale of["en","zh"]as const){const zh=locale==="zh",entry=`/${locale}/tests/explore/love-personality`;
 test(`@release Love interaction ${locale}: hub,keyboard,24sourcechoices,single and pairtie fullreports,publicguide and retake`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/LOVE_PERSONALITY_FC_/.test(r.postData()??""))posts.push(r.url());});
  await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:quiz.title[locale],exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(quiz.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+entry);await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
  await start(page);await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.getByRole("status")).toContainText(zh?"请选择":"Choose an option");const profile=await finish(page,locale,0);
  await expect(page.locator(`[data-archetype-core-assessment="EQ_60"] a[href="/${locale}/tests/eq-test-emotional-intelligence-assessment"]`)).toBeVisible();
  await page.getByRole("link",{name:zh?"阅读这项结果的公开说明":"Read the public explanation of this result",exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.getByRole("region",{name:zh?"本次原始选择次数":"Raw choice counts for this attempt",exact:true})).toHaveCount(0);for(const s of profile.sections)for(const p of s.paragraphs)await expect(page.locator(`#report-${s.id}`)).toContainText(p[locale]);
  await page.getByRole("link",{name:zh?"免费开始完整测试":"Start the full test for free",exact:true}).click();await start(page);await finish(page,locale,4);await page.getByRole("button",{name:zh?"再测一次":"Retake",exact:true}).click();await expect(page.getByRole("radio").first()).not.toBeChecked();expect(posts).toEqual([]);expect(new URL(page.url()).search).toBe("");
 });
 test(`@release Love interaction ${locale}: edit locally, then reset after refresh, language change or exit`,async({page})=>{
  await expectStandaloneObservationPrivacy(page, entry, quiz);
  const other = zh ? "en" : "zh";
  await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
  await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-personality"))).toBeNull();
 });
 test(`@release Love interaction ${locale}: deniedstorage,tripletie,fourwaytie and private-safe clipboard fallback`,async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return get.call(this,k);};Storage.prototype.setItem=function(k,v){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return set.call(this,k,v);};Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("synthetic clipboard denial");}}});});
  await page.goto(entry);await start(page);await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);await finish(page,locale,10);await page.getByRole("button",{name:zh?"再测一次":"Retake",exact:true}).click();await finish(page,locale,14);
  await page.getByRole("button",{name:zh?"一键分享给朋友":"Share Result",exact:true}).click();const text=await page.locator("[data-archetype-honor-group] textarea").inputValue();for (const direction of quiz.directions) expect(text).toContain(direction.title[locale]);expect(text).not.toMatch(/LOVE_PERSONALITY_FC_|submission|answers|form_code|6\s*\/\s*12|[?&]score/);const url=new URL(text.split("\n").at(-1)!);expect(url.pathname).toBe(entry);expect(url.search).toBe("");expect(url.hash).toBe("");
 });
}
test("@release Love interaction all32native fullassets,dedicatedSEO,bilingual images and closed source identities",async({page,request})=>{
 for(const locale of["en","zh"]as const){for(const profile of quiz.profiles){const path=`/${locale}/tests/explore/love-personality/results/${profile.id}`;expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+path);await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href",`https://fermatmind.com/zh/tests/explore/love-personality/results/${profile.id}`);for(const section of profile.sections)for(const p of section.paragraphs)await expect(page.locator(`#report-${section.id}`)).toContainText(p[locale]);}
  for(const index of[-1,0,4,14]){const profile=index<0?null:quiz.profiles[index],response=await request.get(`/og/fun/love-personality?locale=${locale}&v=${quiz.version}${profile?"&portrait="+profile.id:""}`);expect(response.status()).toBe(200);expect(response.headers()["content-type"]).toContain("image/png");const bytes=await response.body();expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);}
 }
 for(const path of["/en/tests/explore/love-personality/results/SINGLE_CLEAR_EXPRESSION","/zh/tests/explore/love-personality/results/unknown","/og/fun/love-personality?portrait=SINGLE_CLEAR_EXPRESSION"])expect((await request.get(path)).status()).toBe(404);
});
