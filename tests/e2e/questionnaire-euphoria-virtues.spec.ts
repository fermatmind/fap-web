import { test, expect, type Page } from "@playwright/test";
import virtues from "../../lib/questionnaires/data/seven-sins-virtues-test.json";
import euphoria from "../../lib/questionnaires/data/euphoria-character-quiz.json";
import outcomes from "../fixtures/questionnaires/euphoria-outcomes-reference.json";
type Quiz=typeof virtues|typeof euphoria;type Locale="en"|"zh";
test.beforeEach(async({page})=>{await page.setViewportSize({width:390,height:844});});
const entry=(q:Quiz,l:Locale)=>`/${l}/tests/explore/${q.slug}`;
async function dismissConsent(page:Page,l:Locale){const decline=page.getByRole("button",{name:l==="zh"?"拒绝":"Decline",exact:true});if(await decline.isVisible())await decline.click();}
async function start(page:Page,l:Locale){await page.getByRole("button",{name:l==="zh"?"开始测试":"Start test",exact:true}).click();await dismissConsent(page,l);}
async function answer(page:Page,q:Quiz,l:Locale,answers:Record<string,string>){
 for(let i=0;i<q.questions.length;i++){
  const question=q.questions[i],option=question.options.find(o=>o.id===answers[question.id])!;
  const radio=page.getByRole("radio",{name:option.label[l],exact:true});
  if(i===0){await radio.focus();await page.keyboard.press("Space");await expect(radio).toBeChecked();}else await radio.check();
  if(i===1){await page.getByRole("button",{name:l==="zh"?"上一题":"Back",exact:true}).click();await expect(page.getByRole("radio",{name:q.questions[0].options.find(o=>o.id===answers[q.questions[0].id])!.label[l],exact:true})).toBeChecked();await page.getByRole("button",{name:l==="zh"?"下一题":"Next",exact:true}).click();}
  await expect(page.locator("[data-mini-virtues-score],[data-archetype-count]")).toHaveCount(0);
  await page.getByRole("button",{name:i===q.questions.length-1?(l==="zh"?"查看完整结果":"See full result"):(l==="zh"?"下一题":"Next"),exact:true}).click();
 }
 await expect(page.locator("#take-test h2")).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const ids=await page.locator("#take-test [id]").evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(ids).size).toBe(ids.length);
 await dismissConsent(page,l);
 await page.screenshot({path:test.info().outputPath("result-mobile.png"),fullPage:false});
}
async function copyPublicOnly(page:Page,q:Quiz,l:Locale){
 await page.evaluate(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async(text:string)=>{(window as unknown as {copied:string}).copied=text;}}}));
 await page.getByRole("button",{name:l==="zh"?"复制公开入口":"Copy public entry",exact:true}).click();
 await expect(page.getByRole("status")).toContainText(l==="zh"?"不含个人答案或次数":"without personal answers or counts");
 expect(await page.evaluate(()=>(window as unknown as {copied:string}).copied)).toBe(`${q.title[l]}\nhttps://fermatmind.com${entry(q,l)}`);
}
function watchPrivatePosts(page:Page){const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/VIRTUES_LK_|EUPHORIA_ORIGINAL_|rawSum|equalFactorGroups|winnerIds/.test(r.postData()??""))posts.push(r.url());});return posts;}
for(const locale of ["en","zh"] as const){
 const zh=locale==="zh";
 test(`@release virtues ${locale}: mobile hub, keyboard,28midpoints,7complete guides and retake`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const posts=watchPrivatePosts(page);
  await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:virtues.title[locale],exact:true}).click();
  await expect(page.locator("h1")).toHaveText(virtues.title[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`https://fermatmind.com${entry(virtues,locale)}`);
  await start(page,locale);await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.getByRole("status")).toContainText(zh?"请选择":"Choose an option");
  await answer(page,virtues,locale,Object.fromEntries(virtues.questions.map(q=>[q.id,"3"])));
  await expect(page.locator("[data-mini-virtues-part]")).toHaveCount(7);await expect(page.locator("#take-test h4")).toHaveCount(56);await expect(page.locator("[data-mini-virtues-equal]")).toHaveCount(1);
  for(const part of virtues.directions)await expect(page.locator(`[data-mini-virtues-score="${part.id}"]`)).toContainText("3.00");
  await expect(page.locator('#take-test a[href*="mbti-personality"]')).toHaveCount(0);await copyPublicOnly(page,virtues,locale);
  await page.getByRole("button",{name:zh?"重新测试":"Retake test",exact:true}).click();await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);await expect(page.locator("[data-mini-virtues-result]")).toHaveCount(0);expect(posts).toEqual([]);
 });
 test(`@release virtues ${locale}: explicit draft, published locale alternate, refresh, expiry and version rejection`,async({page})=>{
  const key=`fm_questionnaire_draft:${virtues.slug}`;await page.goto(entry(virtues,locale));await start(page,locale);await page.getByRole("radio",{name:virtues.questions[0].options[3].label[locale],exact:true}).check();
  expect(await page.evaluate(k=>sessionStorage.getItem(k),key)).toBeNull();await page.getByRole("checkbox").check();await page.reload();
  await page.getByRole("button",{name:zh?"恢复本标签页进度":"Resume this tab's progress",exact:true}).click();await expect(page.getByText(zh?"第2题，共28题":"Question 2 of 28",{exact:true})).toBeVisible();
  const other:Locale=zh?"en":"zh";
  const alternate=await page.locator(`link[rel="alternate"][hreflang="${other==="zh"?"zh-CN":"en"}"]`).getAttribute("href");
  expect(alternate).toBe(`https://fermatmind.com${entry(virtues,other)}`);
  await page.goto(new URL(alternate!).pathname);
  await page.getByRole("button",{name:other==="zh"?"恢复本标签页进度":"Resume this tab's progress",exact:true}).click();
  await page.getByRole("button",{name:other==="zh"?"上一题":"Back",exact:true}).click();await expect(page.getByRole("radio",{name:virtues.questions[0].options[3].label[other],exact:true})).toBeChecked();
  await page.evaluate(k=>{const d=JSON.parse(sessionStorage.getItem(k)!);d.savedAt=Date.now()-86400001;sessionStorage.setItem(k,JSON.stringify(d));},key);await page.reload();await expect(page.getByRole("button",{name:other==="zh"?"恢复本标签页进度":"Resume this tab's progress",exact:true})).toHaveCount(0);
  await page.evaluate(({key,version})=>sessionStorage.setItem(key,JSON.stringify({version:`${version}-old`,savedAt:Date.now(),answers:{VIRTUES_LK_001:"3"}})),{key,version:virtues.version});await page.reload();await expect(page.getByRole("button",{name:other==="zh"?"恢复本标签页进度":"Resume this tab's progress",exact:true})).toHaveCount(0);
 });
 test(`@release virtues ${locale}: unequal valid groups, public-only manual fallback and explicit clearing`,async({page})=>{
  const posts=watchPrivatePosts(page);await page.goto(entry(virtues,locale));await start(page,locale);await page.getByRole("radio",{name:virtues.questions[0].options[0].label[locale],exact:true}).check();await page.getByRole("checkbox").check();await page.getByRole("button",{name:zh?"退出并清除本次进度":"Exit and clear this attempt",exact:true}).click();
  expect(await page.evaluate(k=>sessionStorage.getItem(k),`fm_questionnaire_draft:${virtues.slug}`)).toBeNull();await start(page,locale);
  const answers=Object.fromEntries(virtues.questions.map((q,i)=>[q.id,String(Math.floor(i/4)%5+1)]));await answer(page,virtues,locale,answers);
  await expect(page.locator("[data-mini-virtues-part]")).toHaveCount(7);await expect(page.locator('[data-mini-virtues-score="RECOGNITION_SELF_VIEW"]')).toContainText("1.00");
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
 test(`@release Euphoria ${locale}: optional saved draft, clear and no premature counts`,async({page})=>{
  const key=`fm_questionnaire_draft:${euphoria.slug}`;await page.goto(entry(euphoria,locale));await start(page,locale);await page.getByRole("radio",{name:euphoria.questions[0].options[0].label[locale],exact:true}).check();expect(await page.evaluate(k=>sessionStorage.getItem(k),key)).toBeNull();
  await page.getByRole("checkbox").check();await page.reload();await page.getByRole("button",{name:zh?"恢复本标签页进度":"Resume this tab's progress",exact:true}).click();await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
  await page.getByRole("button",{name:zh?"上一题":"Back",exact:true}).click();await expect(page.getByRole("radio",{name:euphoria.questions[0].options[0].label[locale],exact:true})).toBeChecked();await page.getByRole("button",{name:zh?"退出并清除本次进度":"Exit and clear this attempt",exact:true}).click();expect(await page.evaluate(k=>sessionStorage.getItem(k),key)).toBeNull();
 });
}
