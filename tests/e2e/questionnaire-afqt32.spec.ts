import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/asvab-practice-test.json";
type Locale = "en" | "zh";
const path=(l:Locale)=>`/${l}/tests/explore/${quiz.slug}`;
const label=(l:Locale,en:string,zh:string)=>l==="zh"?zh:en;
async function click(page:Page,l:Locale,en:string,zh:string){await page.getByRole("button",{name:label(l,en,zh),exact:true}).click();}
async function consent(page:Page,l:Locale){const b=page.getByRole("button",{name:label(l,"Decline","拒绝"),exact:true});if(await b.isVisible())await b.click();}
async function prepare(page:Page,l:Locale,study=false){if(study)await page.locator('input[name="afqt32-mode"][value="study"]').check();await click(page,l,"Prepare the first part","准备第一部分");await click(page,l,"Start this part","开始本部分");}
for(const l of ["en","zh"] as const){
  test(`@release Afqt32 ${l}: all English tasks, study/back/keyboard, every solution and guide, sharing and retake`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    if(l==="en")await page.context().grantPermissions(["clipboard-read","clipboard-write"]);else await page.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("Test clipboard unavailable");}}}));
    const leaks:string[]=[],errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("request",r=>{if(r.method()==="POST"&&/AFQ_(AR|WK|PC|MK)\d\d|"answers"|"elapsedMs"|"unanswered"/.test(r.postData()??""))leaks.push(r.url());});
    await page.goto(`/${l}/tests`);await consent(page,l);await page.locator("#more-tests").getByRole("link",{name:quiz.title[l],exact:true}).click();await expect(page.locator("h1")).toHaveText(quiz.title[l]);await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await prepare(page,l,true);await expect(page.locator("#afqt32-question")).toBeFocused();await expect(page.locator("[data-afqt32-clock]")).toHaveText(label(l,"Untimed study","不计时学习"));
    await click(page,l,"Next","下一题");await expect(page.getByRole("status")).toContainText(label(l,"Choose A–D","请选择A—D"));
    for(const [i,q] of quiz.questions.entries()){
      if(i>0&&i%8===0){await expect(page.getByRole("button",{name:label(l,"Start this part","开始本部分"),exact:true})).toBeVisible();await click(page,l,"Start this part","开始本部分");}
      await expect(page.locator("[data-afqt32-stem]")).toHaveText(q.prompt.en);await expect(page.locator("[data-afqt32-stem]")).toHaveAttribute("lang","en");
      const choice=i===0?q.options.find(o=>o.id!==q.correctOptionId)!.id:i===1?"skip":q.correctOptionId;
      const input=page.locator(`input[name="${q.id}"][value="${choice}"]`);
      if(!i){await input.focus();await input.press("Space");}else await input.check();
      if(i===1){await click(page,l,"Back","上一题");await expect(page.locator(`input[name="${quiz.questions[0].id}"][value="${quiz.questions[0].options.find(o=>o.id!==quiz.questions[0].correctOptionId)!.id}"]`)).toBeChecked();await page.locator(`input[name="${quiz.questions[0].id}"][value="${quiz.questions[0].correctOptionId}"]`).check();await page.locator(`input[name="${quiz.questions[0].id}"][value="${quiz.questions[0].options.find(o=>o.id!==quiz.questions[0].correctOptionId)!.id}"]`).check();await click(page,l,"Next","下一题");await expect(input).toBeChecked();}
      await click(page,l,i%8===7?"Finish this part":"Next",i%8===7?"结束本部分":"下一题");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]);await expect(page.locator("#take-test h2")).toBeFocused();await expect(page.locator("[data-afqt32-overall]")).toHaveText(label(l,"Correct 30; wrong 1; unanswered 1; total 32.","正确 30；错误 1；未答 1；共 32 题。"));
    expect(await page.locator("#take-test h2").evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    for(const [i,p] of quiz.profiles.entries()){
      const part=page.locator(`[data-afqt32-part="${p.id}"]`);await expect(part.locator("[data-afqt32-count]")).toContainText(l==="zh"?`正确 ${i?8:6}`:`Correct ${i?8:6}`);
      await part.locator("[data-afqt32-review] > summary").click();await expect(part.locator("[data-afqt32-review-item]")).toHaveCount(8);
      for(const q of quiz.questions.slice(i*8,i*8+8)){const item=part.locator(`[data-afqt32-review-item="${q.id}"]`);await expect(item).toContainText(q.prompt.en);await expect(item).toContainText(q.options.find(o=>o.id===q.correctOptionId)!.label.en);await expect(item).toContainText(q.explanation[l]);}
      await part.locator("[data-afqt32-full] > summary").click();await expect(part.locator("h4")).toHaveCount(7);for(const s of p.sections)for(const t of s.paragraphs)await expect(part).toContainText(t[l]);
      if(!i){await part.locator("h3").evaluate(el=>el.scrollIntoView({block:"start"}));await page.screenshot({path:test.info().outputPath(`${l}-solutions.png`)});}
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator("#take-test h2").evaluate(el=>el.scrollIntoView({block:"start"}));await page.screenshot({path:test.info().outputPath(`${l}-practice-record.png`)});
    await click(page,l,"Copy public guide links","复制公开指南链接");await expect(page.getByRole("status")).toContainText(label(l,"Copied four public guides","无法自动复制"));
    const expected=quiz.profiles.map(p=>`${p.title[l]}\nhttps://fermatmind.com${path(l)}/results/${p.id}`).join("\n\n");if(l==="en")expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(expected);else await expect(page.locator("#take-test textarea")).toHaveValue(expected);
    expect(new URL(page.url()).search).toBe("");expect(leaks).toEqual([]);expect(errors).toEqual([]);
    await click(page,l,"Clear and practise again","清空并重新练习");await prepare(page,l,true);await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0);await expect(page.locator("[data-afqt32-result]")).toHaveCount(0);await click(page,l,"Exit and clear these responses","退出并清除本次回答");
  });
  test(`@release Afqt32 ${l}: emulated deadlines keep blanks, lock parts and wait between sections`,async({page})=>{
    await page.goto(path(l));await consent(page,l);await page.clock.install();await prepare(page,l);
    await page.locator(`input[name="${quiz.questions[0].id}"][value="${quiz.questions[0].correctOptionId}"]`).check();await click(page,l,"Next","下一题");
    await page.clock.fastForward(240001);await expect(page.getByRole("button",{name:label(l,"Start this part","开始本部分"),exact:true})).toBeVisible();await expect(page.locator("#take-test h2")).toContainText(l==="zh"?"第 2 / 4 部分":"Part 2 of 4");await expect(page.locator("#afqt32-question")).toHaveCount(0);await expect(page.getByRole("status")).toContainText(label(l,"Time expired","时间已到"));
    await page.clock.fastForward(300000);await expect(page.locator("#take-test h2")).toContainText(l==="zh"?"第 2 / 4 部分":"Part 2 of 4");await click(page,l,"Start this part","开始本部分");await expect(page.locator("[data-afqt32-clock]")).toContainText("2:40");
    await page.clock.fastForward(160001);await expect(page.locator("#take-test h2")).toContainText(l==="zh"?"第 3 / 4 部分":"Part 3 of 4");
    for(let i=0;i<2;i++){await click(page,l,"Start this part","开始本部分");await click(page,l,"Finish part early; keep blanks unanswered","提前结束本部分，保留未答");}
    await expect(page.locator("[data-afqt32-overall]")).toHaveText(label(l,"Correct 1; wrong 0; unanswered 31; total 32.","正确 1；错误 0；未答 31；共 32 题。"));await expect(page.locator("[data-afqt32-closure]").filter({hasText:label(l,"Closed at the deadline","到时结束")})).toHaveCount(2);await expect(page.locator("[data-afqt32-result-mode]")).toContainText(label(l,"Timed section practice","分段计时练习"));
    await page.locator("[data-afqt32-review] > summary").first().click();await expect(page.locator('[data-afqt32-review-item="AFQ_AR02"]')).toContainText(label(l,"Unanswered","未答"));
  });
  test(`@release Afqt32 ${l}: clock discontinuity clears instead of admitting an answer and study can recover`,async({page})=>{
    await page.goto(path(l));await consent(page,l);await page.clock.install();await prepare(page,l);
    await page.evaluate(()=>{const old=Date.now;Date.now=()=>old()+60000;try{document.querySelector<HTMLInputElement>('input[name="AFQ_AR01"][value="B"]')!.click();}finally{Date.now=old;}});
    await expect(page.getByRole("button",{name:label(l,"Prepare the first part","准备第一部分"),exact:true})).toBeVisible();await expect(page.getByRole("status")).toContainText(label(l,"clocks became inconsistent","设备计时发生不一致"));await expect(page.locator("[data-afqt32-result]")).toHaveCount(0);
    await prepare(page,l,true);await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0);await expect(page.locator("[data-afqt32-clock]")).toHaveText(label(l,"Untimed study","不计时学习"));
  });
  test(`@release Afqt32 ${l}: refresh/language/return clear and public guides never expose attempts`,async({page})=>{
    await page.goto(path(l));await consent(page,l);await prepare(page,l,true);await page.locator('input[name="AFQ_AR01"][value="B"]').check();await page.reload();await expect(page.getByRole("button",{name:label(l,"Prepare the first part","准备第一部分"),exact:true})).toBeVisible();expect(await page.evaluate(slug=>sessionStorage.getItem(`fm_questionnaire_draft:${slug}`),quiz.slug)).toBeNull();
    await prepare(page,l,true);await expect(page.locator('#take-test input[type="radio"]:checked')).toHaveCount(0);await page.locator('input[name="AFQ_AR01"][value="B"]').check();const other=l==="en"?"zh":"en";await page.goto(path(other));await consent(page,other);await expect(page.getByRole("button",{name:label(other,"Prepare the first part","准备第一部分"),exact:true})).toBeVisible();await page.goBack();await expect(page.getByRole("button",{name:label(l,"Prepare the first part","准备第一部分"),exact:true})).toBeVisible();
    await page.goto(`${path(l)}/results/word-knowledge?score=32&answers=private`);await expect(page.locator("h1")).toHaveText(quiz.profiles[1].title[l]);await expect(page.locator("[data-afqt32-result]")).toHaveCount(0);const main=page.getByRole("main");for(const s of quiz.profiles[1].sections)for(const p of s.paragraphs)await expect(main).toContainText(p[l]);
    await page.getByRole("link",{name:label(l,"Try the free 32 English questions","免费尝试32道英文题"),exact:true}).click();await expect(page).toHaveURL(u=>u.pathname===path(l)&&u.search==="");await expect(page.getByRole("button",{name:label(l,"Prepare the first part","准备第一部分"),exact:true})).toBeVisible();
    await page.getByRole("link",{name:label(l,"View the RIASEC occupational-interest entry","查看RIASEC职业兴趣入口"),exact:true}).click();await expect(page).toHaveURL(u=>u.pathname===`/${l}/tests/holland-career-interest-test-riasec`);await expect(page.locator("h1")).toBeVisible();
  });
}
