import { test, expect } from "@playwright/test";
import quiz from "../../lib/entertainment/data/moon-market.json";
const routes = [
 ["q1:1,q2:1","stars"], ["q1:2,q3:1","garden"],
 ["q1:1,q2:2,q4:1","ticket"], ["q1:2,q3:2,q4:1","ticket"],
 ["q1:1,q2:2,q4:2,q5:1","stars"], ["q1:1,q2:2,q4:2,q5:2","garden"], ["q1:1,q2:2,q4:2,q5:3","ticket"],
 ["q1:2,q3:2,q4:2,q5:1","stars"], ["q1:2,q3:2,q4:2,q5:2","garden"], ["q1:2,q3:2,q4:2,q5:3","ticket"],
];
for(const locale of ["en","zh"] as const)test(`@release moon-market ${locale}: ten real branches, complete endings, back-edit pruning and responsive entry`,async({page,request})=>{
 test.setTimeout(120000);const zh=locale==="zh",path=`/${locale}/tests/play/moon-market`;
 await page.addInitScript(()=>localStorage.setItem("fm_consent_v1",JSON.stringify({analytics:"denied",updatedAt:new Date().toISOString()})));
 await page.goto(path);await expect(page.locator('h1')).toHaveText(quiz.title[locale]);await expect(page.locator('.explore-intro-meta')).toContainText(zh?'2–4次选择':'2–4 choices');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await expect(page.locator('[data-explore-start]')).toBeEnabled();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:test.info().outputPath(`moon-${locale}-${width}.png`),fullPage:true});}
 await page.locator('[data-explore-start]').click();await expect(page.locator('#play')).toHaveAttribute('data-stage','answer');
 for(const [encoded,ending] of routes){
  const steps=encoded.split(',').map(s=>s.split(':'));
  for(const [i,[qid,option]] of steps.entries()){
   await expect(page.locator('#play h2')).toHaveText(quiz.questions.find(q=>q.id===qid)!.prompt[locale]);
   await page.locator(`#play input[name="${qid}"][value="o${option}"]`).check();
   await page.getByRole('button',{name:i===steps.length-1?(zh?'查看完整结果':'See full result'):(zh?'下一题':'Next'),exact:true}).click();
  }
  await expect(page.locator('#play')).toHaveAttribute('data-stage','result');await expect(page.locator('#play > article')).toHaveCount(1);
  const result=quiz.results.find(r=>r.id===ending)!;await expect(page.locator('#play h2')).toHaveText(result.title[locale]);for(const field of ['summary','example','strength','tradeoff','experiment'] as const)await expect(page.locator('#play > article')).toContainText(result[field][locale]);
  await page.getByRole('button',{name:zh?'重新测试':'Retake quiz',exact:true}).click();await expect(page.locator('#play input:checked')).toHaveCount(0);await expect(page.locator('#play h2')).toHaveText(quiz.questions[0].prompt[locale]);
 }
 // Visit q4, return to q1, and take the direct station ending. The abandoned q4 answer must disappear.
 for(const [qid,option] of [['q1','o1'],['q2','o2']]){await page.locator(`#play input[name="${qid}"][value="${option}"]`).check();await page.getByRole('button',{name:zh?'下一题':'Next',exact:true}).click();}
 await page.locator('#play input[name="q4"][value="o2"]').check();
 for(let i=0;i<2;i++)await page.getByRole('button',{name:zh?'上一题':'Back',exact:true}).click();
 await page.locator('#play input[name="q1"][value="o2"]').check();await page.getByRole('button',{name:zh?'下一题':'Next',exact:true}).click();
 await expect(page.locator('#play h2')).toHaveText(quiz.questions[2].prompt[locale]);
 await page.locator('#play input[name="q3"][value="o1"]').check();await page.getByRole('button',{name:zh?'查看完整结果':'See full result',exact:true}).click();
 await expect(page.locator('#play h2')).toHaveText(quiz.results[1].title[locale]);
 for(const result of quiz.results){const response=await request.get(`${path}/results/${result.id}`);expect(response.status()).toBe(200);const text=await page.evaluate(s=>new DOMParser().parseFromString(s,'text/html').body.textContent,await response.text());for(const field of ['summary','example','strength','tradeoff','experiment'] as const)expect(text).toContain(result[field][locale]);}
});
