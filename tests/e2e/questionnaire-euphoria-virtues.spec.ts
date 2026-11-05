import { test, expect, type Page } from "@playwright/test";
import virtues from "../../lib/questionnaires/data/seven-sins-virtues-test.json";
import euphoria from "../../lib/questionnaires/data/euphoria-character-quiz.json";
import outcomes from "../fixtures/questionnaires/euphoria-outcomes-reference.json";
type Quiz=typeof virtues|typeof euphoria;type Locale="en"|"zh";
test.beforeEach(async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await page.addInitScript(() => {
  localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }));
 });
});
const entry=(q:Quiz,l:Locale)=>`/${l}/tests/explore/${q.slug}`;
async function start(page: Page, locale: Locale) {
 await page.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test", exact: true }).click();
 await expect(page.locator('#take-test[data-stage="answer"]')).toBeVisible();
}
async function answer(page: Page, quiz: Quiz, locale: Locale, answers: Record<string, string>) {
 for (const [i, question] of quiz.questions.entries()) {
  await expect(page.locator("#take-test h2")).toHaveText(question.prompt[locale]);
  if (i === 1) {
   await page.getByRole("button", { name: locale === "zh" ? "上一题" : "Back", exact: true }).click();
   await expect(page.locator(`input[name="${quiz.questions[0].id}"][value="${answers[quiz.questions[0].id]}"]`)).toBeChecked();
   await page.getByRole("button", { name: locale === "zh" ? "下一题" : "Next", exact: true }).click();
  }
  await expect(page.locator("[data-mini-virtues-score],[data-archetype-count]")).toHaveCount(0);
  const radio = page.locator(`input[name="${question.id}"][value="${answers[question.id]}"]`);
  if (i === 0) {
   await radio.focus();
   await page.keyboard.press("Space");
  } else await radio.click();
 }
 const title = quiz === virtues
   ? page.locator("[data-seven-sins-board] h2")
   : page.locator("#take-test h2");
 await expect(title).toBeFocused();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
 expect(new Set(ids).size).toBe(ids.length);
 await page.screenshot({ path: test.info().outputPath("result-mobile.png") });
}
async function copyPublicOnly(page:Page,q:Quiz,l:Locale){
 await page.evaluate(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async(text:string)=>{(window as unknown as {copied:string}).copied=text;}}}));
 await page.getByRole("button",{name:l==="zh"?"复制公开入口":"Copy public entry",exact:true}).click();
 await expect(page.getByRole("status")).toContainText(l==="zh"?"不含个人答案或次数":"without personal answers or counts");
 expect(await page.evaluate(()=>(window as unknown as {copied:string}).copied)).toBe(`${q.title[l]}\nhttps://fermatmind.com${entry(q,l)}`);
}
function watchPrivatePosts(page:Page){const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/VIRTUES_(?:LK|DUAL)_|EUPHORIA_ORIGINAL_|rawSum|equalFactorGroups|winnerIds/.test(r.postData()??""))posts.push(r.url());});return posts;}
for(const locale of ["en","zh"] as const){
 const zh=locale==="zh";
 test(`@release virtues ${locale}: mobile hub, keyboard,28midpoints,7complete guides and retake`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const posts=watchPrivatePosts(page);
  await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:virtues.title[locale],exact:true}).click();
  await expect(page.locator("h1")).toHaveText(virtues.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`https://fermatmind.com${entry(virtues,locale)}`);
  await start(page,locale);
  await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();
  await expect(page.getByRole("status")).toContainText(zh?"请选择":"Choose an option");
  await answer(page,virtues,locale,Object.fromEntries(virtues.questions.map(q=>[q.id,"3"])));
  await expect(page.locator("[data-mini-virtues-part]")).toHaveCount(7);
  for (const profile of virtues.profiles) {
   const reading = page.locator(`[data-virtues-result-reading="${profile.id}"]`);
   await reading.locator("details > summary").click();
   await expect(reading.locator(`a[href="${entry(virtues, locale)}/results/${profile.id}"]`)).toBeVisible();
  }
  await expect(page.locator("[data-seven-sins-axis]")).toHaveText(Array(14).fill("50"));
  for(const part of virtues.directions)await expect(page.locator(`[data-mini-virtues-score="${part.id}"]`).locator("strong")).toHaveText(["50","50"]);
  await expect(page.locator('#take-test a[href*="mbti-personality"]')).toHaveCount(0);await copyPublicOnly(page,virtues,locale);
  await page.getByRole("button",{name:zh?"重新测试":"Retake test",exact:true}).click();await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);await expect(page.locator("[data-mini-virtues-result]")).toHaveCount(0);expect(posts).toEqual([]);
 });
 test(`@release virtues ${locale}: published alternate and stale draft isolation`, async ({ page }) => {
  const key = `fm_questionnaire_draft:${virtues.slug}`;
  await page.goto(entry(virtues, locale));
  const other: Locale = zh ? "en" : "zh";
  const alternate = await page.locator(`link[rel="alternate"][hreflang="${other === "zh" ? "zh-CN" : "en"}"]`).getAttribute("href");
  expect(alternate).toBe(`https://fermatmind.com${entry(virtues, other)}`);
  await page.evaluate(key => sessionStorage.setItem(key, JSON.stringify({ version: "1.0.0", savedAt: Date.now(), answers: { VIRTUES_LK_001: "4" } })), key);
  await page.goto(new URL(alternate!).pathname);
  await start(page, other);
  await expect(page.locator("#take-test h2")).toHaveText(virtues.questions[0].prompt[other]);
  await expect(page.locator("#take-test input:checked")).toHaveCount(0);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
 });
 test(`@release virtues ${locale}: unequal valid groups and public-only manual fallback`, async ({ page }) => {
  const posts = watchPrivatePosts(page);
  await page.goto(entry(virtues, locale));
  await start(page, locale);
  const answers=Object.fromEntries(virtues.questions.map((q,i)=>[q.id,String(Math.floor(i/4)%5+1)]));await answer(page,virtues,locale,answers);
  await expect(page.locator("[data-mini-virtues-part]")).toHaveCount(7);await expect(page.locator('[data-mini-virtues-score="RECOGNITION_SELF_VIEW"]').locator("strong")).toHaveText(["0","0"]);
  await page.evaluate(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("synthetic clipboard denial");}}}));
  await page.getByRole("button",{name:zh?"复制公开入口":"Copy public entry",exact:true}).click();await expect(page.getByRole("textbox",{name:zh?"手动复制结果":"Result text for manual copying",exact:true})).toHaveValue(`${virtues.title[locale]}\nhttps://fermatmind.com${entry(virtues,locale)}`);expect(posts).toEqual([]);
 });
 for(const role of ["RUE","NATE"]){
  test(`@release Euphoria ${locale}: ${role} unique full6, honest counts and optional separate MBTI`,async({page})=>{
   await page.setViewportSize({width:390,height:844});const posts=watchPrivatePosts(page);await page.goto(entry(euphoria,locale));await expect(page.locator("h1")).toHaveText(euphoria.title[locale]);await start(page,locale);
   const witness=outcomes.witnesses.find(w=>w.winnerIds.length===1&&w.winnerIds[0]===role)!;await answer(page,euphoria,locale,witness.answers);
   await expect(page.locator("[data-archetype-count]")).toHaveCount(8);await expect(page.locator("[data-archetype-match]")).toHaveCount(1);await expect(page.locator("#take-test h4")).toHaveCount(6);
   const p=euphoria.profiles.find(p=>p.directionIds[0]===role)!;await expect(page.locator(`[data-archetype-match="${p.id}"]`)).toBeVisible();
   for(const d of euphoria.directions)await expect(page.locator(`[data-archetype-count="${d.id}"]`)).toContainText(`${witness.counts[d.id as keyof typeof witness.counts]} / 10`);
   await expect(page.getByRole("link",{name:zh?"可选：另做MBTI偏好探索":"Optional: explore MBTI preferences separately",exact:true})).toHaveAttribute("href",/target_action=questionnaire_result_mbti/);await copyPublicOnly(page,euphoria,locale);expect(posts).toEqual([]);
  });
 }
 test(`@release Euphoria ${locale}: all6highest ties retain36full sections and retake clears`,async({page})=>{
  await page.goto(entry(euphoria,locale));await start(page,locale);const witness=outcomes.witnesses.find(w=>w.winnerIds.length===6)!;await answer(page,euphoria,locale,witness.answers);
  await expect(page.locator("[data-archetype-match]")).toHaveCount(6);await expect(page.locator("#take-test h4")).toHaveCount(36);await copyPublicOnly(page,euphoria,locale);
  await page.getByRole("button",{name:zh?"重新测试":"Retake test",exact:true}).click();await expect(page.locator("[data-archetype-match]")).toHaveCount(0);await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
 });
 test(`@release Euphoria ${locale}: standalone clears any saved draft and shows no premature counts`, async ({ page }) => {
  const key = `fm_questionnaire_draft:${euphoria.slug}`;
  await page.goto(entry(euphoria, locale));
  const draft = { version: euphoria.version, savedAt: Date.now(), answers: { [euphoria.questions[0].id]: euphoria.questions[0].options[0].id } };
  await page.evaluate(({ key, draft }) => sessionStorage.setItem(key, JSON.stringify(draft)), { key, draft });
  await start(page, locale);
  await expect(page.locator("#take-test h2")).toHaveText(euphoria.questions[0].prompt[locale]);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.locator("#take-test input:checked,[data-archetype-count]")).toHaveCount(0);
  expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
 });
}
