import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/mattering.json";
async function finish(page: Page, locale: "en" | "zh", values: number[]) {
  for(const [i,q] of data.questions.entries()){
    const radio=page.locator(`input[name="${q.id}"][value="${values[i]}"]`);
    if(i===0){await radio.focus();await page.keyboard.press("Space");await expect(radio).toBeChecked();}else await radio.check();
    await page.getByRole("button",{name:locale==="zh"?(i===9?"查看两项独立分数":"下一题"):(i===9?"See both separate scores":"Next"),exact:true}).click();
  }
  for(const [i,id]of ["GMS","AMS"].entries()){
    const sum=values.slice(i*5,i*5+5).reduce((a,b)=>a+b,0);
    await expect(page.locator(`[data-mattering10-total="${id}"]`)).toContainText(`${sum} (`);
    for(const s of data.profiles[i].sections){const section=page.locator(`#mattering10-${id}-${s.id}`);await expect(section.locator("h4")).toHaveText(s.title[locale]);for(const p of s.paragraphs)await expect(section.getByText(p[locale],{exact:true})).toBeVisible();}
  }
}
for(const locale of ["en","zh"]as const){
  const zh=locale==="zh",entry=`/${locale}/tests/explore/mattering`;
  test(`@release mattering ${locale}: mobile hub, keyboard, full two-scale results, edit and empty retake`,async({page})=>{
    await page.setViewportSize({width:390,height:844});const leaks:string[]=[];
    page.on("request",r=>{if(r.method()==="POST"&&/gms-0[1-5]|ams-0[1-5]|contributions/.test(r.postData()??""))leaks.push(r.url());});
    await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:data.title[locale],exact:true}).click();await expect(page.getByRole("heading",{level:1})).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    for(const s of data.guide)for(const p of s.paragraphs)await expect(page.locator('#mattering10-method').locator('..').getByText(p[locale],{exact:true})).toBeVisible();
    await page.screenshot({path:test.info().outputPath(`mattering-${locale}-entry.png`)});
    await page.getByRole("button",{name:zh?"开始测试":"Start test",exact:true}).click();await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.locator('#take-test [role=status]')).toContainText(zh?"请选择":"Choose how much");
    await finish(page,locale,[1,2,3,4,2,4,3,2,1,2]);await page.screenshot({path:test.info().outputPath(`mattering-${locale}-result.png`)});
    await page.getByRole("button",{name:zh?"修改回答（清除当前结果）":"Edit answers and clear this result",exact:true}).click();await expect(page.locator('[data-mattering10-result]')).toHaveCount(0);await finish(page,locale,Array(10).fill(3));
    expect(await page.evaluate(()=>sessionStorage.getItem('fm_questionnaire_draft:mattering'))).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("button",{name:zh?"重新测试（清除本次回答）":"Retake with empty answers",exact:true}).click();await expect(page.getByRole("radio").first()).not.toBeChecked();expect(leaks).toEqual([]);
  });
  test(`@release mattering ${locale}: both endpoints, denied persistence, public-only sharing and reload`,async({page})=>{
    await page.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k.startsWith('fm_questionnaire_draft:'))throw Error('synthetic denied');return get.call(this,k);};Storage.prototype.setItem=function(k,v){if(k.startsWith('fm_questionnaire_draft:'))throw Error('synthetic denied');return set.call(this,k,v);};Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('synthetic denied');}}});});
    await page.goto(entry);const start=()=>page.getByRole("button",{name:zh?"开始测试":"Start test",exact:true}).click();await start();await finish(page,locale,[...Array(5).fill(1),...Array(5).fill(4)]);
    await page.getByRole("button",{name:zh?"复制公开解释链接":"Copy public explanation link",exact:true}).click();const copied=await page.getByRole("textbox",{name:zh?"手动复制公开链接":"Public link for manual copying"}).inputValue();expect(copied).toBe(data.profiles.map(p=>`${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`).join('\n\n'));expect(copied).not.toMatch(/gms-0|ams-0|answers|total=/);
    await page.getByRole("button",{name:zh?"重新测试（清除本次回答）":"Retake with empty answers",exact:true}).click();await finish(page,locale,[...Array(5).fill(4),...Array(5).fill(1)]);await page.reload();await start();await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.locator('input[value="3"]').check();await page.getByRole('button',{name:zh?'下一题':'Next',exact:true}).click();await page.getByRole('button',{name:zh?'上一题':'Back',exact:true}).click();await expect(page.locator('input[value="3"]')).toBeChecked();
    const other=zh?'en':'zh';await page.goto(`/${other}/tests/explore/mattering`);await page.getByRole('button',{name:other==='zh'?'开始测试':'Start test',exact:true}).click();await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await expect(page.locator('#fm-google-tag-script,#fm-baidu-tongji-script')).toHaveCount(0);
  });
}
test('@release mattering: six public pages, six OGs and closed identifiers',async({page,request})=>{
  for(const locale of ['en','zh']as const){
    for(const p of data.profiles){const path=`/${locale}/tests/explore/mattering/results/${p.id}`;expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole('heading',{level:1})).toHaveText(p.title[locale]);await expect(page).toHaveTitle(`${p.seo.title[locale]} | FermatMind`);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://fermatmind.com${path}`);await expect(page.locator('[data-mattering10-total]')).toHaveCount(0);for(const s of p.sections)for(const text of s.paragraphs)await expect(page.getByText(text[locale],{exact:true})).toBeVisible();}
    for(const p of [null,...data.profiles]){const r=await request.get(`/og/fun/mattering?locale=${locale}${p?`&portrait=${p.id}`:''}`);expect(r.status()).toBe(200);const b=await r.body();expect(b.readUInt32BE(16)).toBe(1200);expect(b.readUInt32BE(20)).toBe(630);}
  }
  for(const path of ['/en/tests/explore/mattering/results/unknown','/en/tests/play/mattering','/og/fun/mattering?locale=de'])expect((await request.get(path)).status()).toBe(404);
});
