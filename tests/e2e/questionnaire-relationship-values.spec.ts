import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/relationship-values.json","utf8"))as Questionnaire;
const source=JSON.parse(readFileSync("tests/fixtures/questionnaires/relationship-values-reference.json","utf8"))as{source_count_vectors:{option_codes:string;counts:number[]}[]};
const ids=quiz.directions.map(d=>d.id);
function witness(profileIndex:number){const expected=quiz.profiles[profileIndex].directionIds.slice().sort().join("|");const row=source.source_count_vectors.find(v=>{const max=Math.max(...v.counts);return ids.filter((_,i)=>v.counts[i]===max).sort().join("|")===expected;});if(!row)throw Error("Missing source witness");return row;}
test.beforeEach(async({page})=>{const cdp=await page.context().newCDPSession(page);await cdp.send("Network.enable");await cdp.send("Network.setBlockedURLs",{urls:["*/api/v0.5/seo/attribution/events*","*/api/track*","*googletagmanager.com/*","*google-analytics.com/*","*hm.baidu.com/*"]});});
async function visibleContext(page:Page){await expect.poll(()=>page.locator("#take-test h2").evaluate(el=>{const bottom=document.querySelector("header")?.getBoundingClientRect().bottom??0,progress=el.previousElementSibling?.tagName==="PROGRESS"?el.previousElementSibling:null,label=progress?.previousElementSibling;return el.getBoundingClientRect().top>=bottom&&(!progress||(progress.getBoundingClientRect().top>=bottom&&!!label&&label.getBoundingClientRect().top>=bottom));})).toBe(true);}
async function start(page: Page) {
  await page.locator("#take-test [data-explore-start]").click();
  await expect(page.locator('#take-test')).toHaveAttribute("data-stage", "answer", { timeout: 15000 });
}
async function finish(page:Page,locale:"en"|"zh",index:number){
 const row=witness(index),profile=quiz.profiles[index];
 for(const[i,q]of quiz.questions.entries()){
  await visibleContext(page);const radio=page.locator(`input[name="${q.id}"][value="${row.option_codes[i]==="A"?"o1":"o2"}"]`);
  await expect(page.getByRole("region",{name:locale==="zh"?"本次原始选择次数":"Raw choice counts for this attempt",exact:true})).toHaveCount(0);
  if (i === 0) {
    await radio.focus();
    await page.keyboard.press("Space");
  } else await radio.click();
  await expect(radio).toHaveCount(0);
 }
 await expect(page.getByRole("heading",{level:2,name:profile.title[locale],exact:true})).toBeFocused();
 const counts=page.getByRole("region",{name:locale==="zh"?"本次原始选择次数":"Raw choice counts for this attempt",exact:true});
 await expect(counts.locator("dt")).toHaveText(quiz.directions.map(direction => direction.title[locale]));
 await expect(counts.locator("dd")).toHaveText(row.counts.map(count => `${count} / 12`));
 await expect(page.locator("#take-test h3").filter({hasText:profile.sections[0].title[locale]})).toHaveCount(1);
 const preview = page.locator('#take-test article[data-reading-mode="result"]');
 await expect(preview.locator('section[id^="report-"]')).toHaveCount(profile.sections.length);
 for (const section of profile.sections) {
  const reading = preview.locator(`#report-${section.id}`);
  await expect(reading).toBeAttached();
  for (const paragraph of section.paragraphs) await expect(reading).toContainText(paragraph[locale]);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const allIds=await page.locator("#take-test [id]").evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(allIds).size).toBe(allIds.length);return profile;
}
for(const locale of["en","zh"]as const){const zh=locale==="zh",entry=`/${locale}/tests/explore/relationship-values`;
 test(`@release Relationship values ${locale}: hub,keyboard,24sourcechoices,single and pairtie fullreports,publicguide and retake`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/LOVE_ROLE_FC_|"q(?:[1-9]|1[0-9]|2[0-4])"|answers/.test(r.postData()??""))posts.push(r.url());});
  await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:quiz.title[locale],exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(quiz.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+entry);await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
  await start(page);await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.getByRole("status")).toContainText(zh?"请选择":"Choose an option");const profile=await finish(page,locale,0);
  await expect(page.locator('[data-archetype-core-assessment="EQ_60"] a')).toHaveAttribute("href", `/${locale}/tests/eq-test-emotional-intelligence-assessment`);
  await page.getByRole("link",{name:zh?"阅读这项结果的公开说明":"Read the public explanation of this result",exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.getByRole("region",{name:zh?"本次原始选择次数":"Raw choice counts for this attempt",exact:true})).toHaveCount(0);for(const s of profile.sections)for(const p of s.paragraphs)await expect(page.locator(`#report-${s.id}`)).toContainText(p[locale]);
  await page.getByRole("link",{name:zh?"免费开始完整测试":"Start the full test for free",exact:true}).click();await start(page);await finish(page,locale,4);await page.getByRole("button",{name:zh?"再测一次":"Retake",exact:true}).click();await expect(page.getByRole("radio").first()).not.toBeChecked();expect(posts).toEqual([]);expect(new URL(page.url()).search).toBe("");
 });
 test(`@release Relationship values ${locale}: back/edit stays local and reload clears the standalone session`, async ({ page }) => {
  await page.goto(`${entry}/take`);
  const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
  const second = page.locator(`#take-test input[name="${quiz.questions[1].id}"]`);
  await expect(first.first()).toBeVisible();
  await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
  await first.nth(1).click();
  await expect(second.first()).toBeVisible();
  await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
  await expect(first.nth(1)).toBeChecked();
  await first.first().click();
  await expect(second.first()).toBeVisible();
  await page.reload();
  await expect(first.first()).toBeVisible();
  await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
  const other = zh ? "en" : "zh";
  await page.goto(`/${other}/tests/explore/relationship-values/take`);
  await expect(first.first()).toBeVisible();
  await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:relationship-values"))).toBeNull();
 });
 test(`@release Relationship values ${locale}: deniedstorage,tripletie,fourwaytie and private-safe clipboard fallback`,async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return get.call(this,k);};Storage.prototype.setItem=function(k,v){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return set.call(this,k,v);};Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("synthetic clipboard denial");}}});});
  await page.goto(entry);await start(page);await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);await finish(page,locale,10);await page.getByRole("button",{name:zh?"再测一次":"Retake",exact:true}).click();await finish(page,locale,14);
  await page.getByRole("button",{name:zh?"一键分享给朋友":"Share Result",exact:true}).click();const text=await page.locator("[data-archetype-honor-group] textarea").inputValue();for(const direction of quiz.directions)expect(text).toContain(direction.title[locale]);expect(text).not.toMatch(/LOVE_ROLE_FC_|submission|answers|form_code|6\s*\/\s*12|[?&]score/);const url=new URL(text.split("\n").at(-1)!);expect(url.pathname).toBe(entry);expect(url.search).toBe("");expect(url.hash).toBe("");
 });
}
test("@release Relationship values all32native fullassets,dedicatedSEO,bilingual images and closed source identities",async({page,request})=>{
 for(const locale of["en","zh"]as const){for(const profile of quiz.profiles){const path=`/${locale}/tests/explore/relationship-values/results/${profile.id}`;expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com"+path);await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href",`https://fermatmind.com/zh/tests/explore/relationship-values/results/${profile.id}`);for(const section of profile.sections)for(const p of section.paragraphs)await expect(page.locator(`#report-${section.id}`)).toContainText(p[locale]);}
  for(const index of[-1,0,4,14]){const profile=index<0?null:quiz.profiles[index],response=await request.get(`/og/fun/relationship-values?locale=${locale}&v=${quiz.version}${profile?"&portrait="+profile.id:""}`);expect(response.status()).toBe(200);expect(response.headers()["content-type"]).toContain("image/png");const bytes=await response.body();expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);}
 }
 for(const path of["/en/tests/explore/relationship-values/results/SINGLE_ROMANTIC_EXPRESSION","/zh/tests/explore/relationship-values/results/unknown","/og/fun/relationship-values?portrait=SINGLE_ROMANTIC_EXPRESSION"])expect((await request.get(path)).status()).toBe(404);
});

test("@release Relationship values legacy take URL retains its fragment and discards old drafts", async ({ page }) => {
  await page.addInitScript(() => {
    for (const key of ["fm_fun_draft:relationship-values", "fm_questionnaire_draft:relationship-values"]) {
      sessionStorage.setItem(key, JSON.stringify({ version: "1.0.1", savedAt: Date.now(), answers: { q1: "o2" } }));
    }
  });
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}/tests/play/relationship-values/take#play`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/tests/explore/relationship-values/take#play$`));
    await expect(page.locator("#play")).toHaveCount(1);
    const take = page.locator("#take-test");
    await expect(take).toHaveAttribute("data-stage", "answer");
    await expect(take.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(take.getByRole("checkbox")).toHaveCount(0);
  }
});
