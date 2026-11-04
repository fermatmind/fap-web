import {test,expect} from '@playwright/test';
import chakra from '../../lib/questionnaires/data/chakra.json';
import project from '../../lib/questionnaires/data/project-management.json';
const deny = {analytics:'denied',updatedAt:new Date().toISOString()};
for(const locale of ['en','zh'] as const){
 const zh=locale==='zh';
 test(`@release closeout chakra ${locale}: direct start, reverse keys, complete seven guides and unscored retake`,async({page})=>{
  await page.addInitScript(v=>localStorage.setItem('fm_consent_v1',JSON.stringify(v)),deny);
  await page.setViewportSize({width:390,height:844});await page.goto(`/${locale}/tests/explore/chakra`);
  await page.getByRole('button',{name:zh?'开始测试':'Start test',exact:true}).click();
  for(const mode of ['max','na']){
   for(const [i,q] of chakra.questions.entries()){
    await page.locator(`input[name="${q.id}"][value="${mode==='na'?'na':q.reverse?'1':'5'}"]`).check();
    await page.getByRole('button',{name:i===27?(zh?'查看完整结果':'See full result'):(zh?'下一题':'Next'),exact:true}).click();
   }
   await expect(page.locator('[data-chakra-group]')).toHaveCount(7);await expect(page.locator('[data-chakra-guide]')).toHaveCount(7);
   for(const node of await page.locator('[data-chakra-mean]').all())await expect(node).toHaveText(mode==='max'?'5.0 / 5':zh?'资料不足':'Insufficient information');
   for(const p of chakra.profiles)for(const s of p.sections)for(const t of s.paragraphs)await expect(page.locator('#take-test')).toContainText(t[locale]);
   if(mode==='max')await page.getByRole('button',{name:zh?'重新测试':'Retake test',exact:true}).click();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
 test(`@release closeout friendship ${locale}: real isolated backend create, invitation, guesses, full result and owner control`,async({browser,baseURL})=>{
  test.skip(!process.env.FRIENDSHIP_LOCAL_API,'Requires real isolated local backend; never substitutes response fixtures');
  test.setTimeout(180000);
  const local=new URL(process.env.FRIENDSHIP_LOCAL_API!);expect(['127.0.0.1','localhost']).toContain(local.hostname);
  const c=await browser.newContext(),f=await browser.newContext();
  for(const context of [c,f]){
   await context.addInitScript(v=>localStorage.setItem('fm_consent_v1',JSON.stringify(v)),deny);
   // Transport only: execute the unmodified local Laravel API and forward its real response; no response fixture or invented score.
   await context.route('**/api/v0.3/friendship/**',async route=>{const u=new URL(route.request().url());const response=await route.fetch({url:local.origin+u.pathname+u.search});await route.fulfill({response});});
  }
  const owner=await c.newPage(),friend=await f.newPage();let id:string|undefined;let ownerKey:string|undefined;
  try{
   await owner.goto(`${baseURL}/${locale}/tests/play/friendship-quiz`);
   await owner.locator("[data-explore-start]").click();
   await owner.locator('#fq-name').fill('Local creator');await owner.locator('input[name="length"][value="30"]').check();
   await owner.getByRole('button',{name:zh?'开始出题 →':'Start my quiz →',exact:true}).click();
   for(let i=0;i<30;i++){await owner.locator('.fq-options input').first().check();await owner.getByRole('button',{name:i===29?(zh?'检查答案':'Review answers'):(zh?'下一题':'Next'),exact:true}).click();}
   const created=owner.waitForResponse(r=>/\/friendship\/challenges$/.test(r.url())&&r.request().method()==='POST');
   await owner.getByRole('button',{name:zh?'生成好友邀请':'Make my invite',exact:true}).click();
   let response=await created;
   if(response.status()===429){
    // Some API error normalizers omit Retry-After; respect the declared one-minute route window instead.
    const header=Number(response.headers()['retry-after']);const seconds=Number.isFinite(header)&&header>0?header:61;expect(seconds).toBeLessThanOrEqual(65);
    await expect(owner.locator('.fq-warning[role="alert"]')).toBeVisible();
    await new Promise(resolve=>setTimeout(resolve,(seconds+1)*1000));
    const retry=owner.waitForResponse(r=>/\/friendship\/challenges$/.test(r.url())&&r.request().method()==='POST');
    await owner.getByRole('button',{name:zh?'生成好友邀请':'Make my invite',exact:true}).click();response=await retry;
   }
   expect(response.status()).toBe(200);const challenge=await response.json();id=challenge.id;
   expect(challenge.questions).toHaveLength(30);expect(challenge.answers).toEqual(Array(30).fill(0));
   const saved=await owner.evaluate(()=>JSON.parse(localStorage.getItem('fm:friendship:owners:v1')||'[]'));ownerKey=saved.find((v:{id:string})=>v.id===id).key;
   const invite=await friend.request.get(local.origin+`/api/v0.3/friendship/challenges/${id}`);expect(invite.status()).toBe(200);expect(await invite.json()).not.toHaveProperty('answers');
   await friend.goto(`${baseURL}/${locale}/share/friendship/${id}`);await friend.locator('#fq-friend-name').fill('Local guesser');
   await friend.getByRole('button',{name:zh?'开始猜':'Start guessing',exact:true}).click();
   for(let i=0;i<30;i++){
    await friend.locator('.fq-options input').first().check();await expect(friend.locator('.fq-feedback')).toBeVisible();await expect(friend.locator('.fq-options input').first()).toBeDisabled();
    await friend.getByRole('button',{name:i===29?(zh?'查看结果':'See my result'):(zh?'下一题':'Next'),exact:true}).click();
   }
   await expect(friend.locator('.fq-ring')).toHaveAttribute('aria-label','30/30, 100%');await expect(friend.locator('.fq-category-bars > div')).toHaveCount(6);
   await expect(friend.locator('.fq-ranking')).toContainText('Local guesser');await expect(friend.locator('.fq-answer-list').last().locator('li')).toHaveCount(30);
   await friend.reload();await expect(friend.locator('.fq-ring')).toHaveAttribute('aria-label','30/30, 100%');
   await owner.goto(`${baseURL}/${locale}/share/friendship/${id}/manage`);await expect(owner.locator('.fq-ranking')).toContainText('Local guesser');
   await owner.getByRole('button',{name:zh?'关闭邀请':'Close quiz',exact:true}).click();
   const closed=await friend.request.get(local.origin+`/api/v0.3/friendship/challenges/${id}`);expect(closed.status()).toBe(410);
   await owner.getByRole('button',{name:zh?'重新开放':'Reopen quiz',exact:true}).click();
   expect((await friend.request.get(local.origin+`/api/v0.3/friendship/challenges/${id}`)).status()).toBe(200);
  }finally{
   if(id&&ownerKey){const deleted=await owner.request.delete(local.origin+`/api/v0.3/friendship/challenges/${id}/manage`,{headers:{Authorization:`Bearer ${ownerKey}`,Accept:"application/json"}});expect.soft(deleted.status()).toBe(200);}
   await c.close();await f.close();
  }
 });
}

for(const locale of ['en','zh'] as const)test(`@release closeout project explanations ${locale}: real thirty-choice report keeps corrected key labels`,async({page})=>{
 const quiz=project;
 await page.addInitScript(v=>localStorage.setItem('fm_consent_v1',JSON.stringify(v)),deny);
 await page.goto(`/${locale}/tests/explore/project-management`);await page.getByRole('button',{name:locale==='zh'?'开始测试':'Start test',exact:true}).click();
 for(const [i,q] of quiz.questions.entries()){
  await page.locator(`input[name="${q.id}"][value="${q.correctOptionId}"]`).check();
  await page.getByRole('button',{name:i===29?(locale==='zh'?'查看完整结果':'See full result'):(locale==='zh'?'下一题':'Next'),exact:true}).click();
 }
 await expect(page.locator('[data-practice-question]')).toHaveCount(30);await expect(page.locator('[data-practice-guide]')).toHaveCount(5);
 for(const id of ['PROJECT_01','PROJECT_08','PROJECT_09','PROJECT_14','PROJECT_24','PROJECT_26','PROJECT_29']){
  const q=quiz.questions.find(v=>v.id===id)!;await expect(page.locator(`[data-practice-question="${id}"]`)).toContainText(q.explanation[locale]);
 }
});
for(const locale of ['en','zh'] as const)test(`@release closeout editorial layouts ${locale}: four exact products at phone and desktop widths`,async({page})=>{
 await page.addInitScript(v=>localStorage.setItem('fm_consent_v1',JSON.stringify(v)),deny);
 for(const slug of ['flower','chakra','multiple-intelligences','empathy'])for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(`/${locale}/tests/explore/${slug}`);
  await expect(page.locator('.explore-reading-library')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('[data-explore-start]')).toHaveCount(1);await expect(page.locator('[data-explore-start]')).toHaveAccessibleName(locale==='zh'?'开始测试':'Start test');
  await page.screenshot({path:test.info().outputPath(`${slug}-${locale}-${width}.png`),fullPage:true});
 }
});
