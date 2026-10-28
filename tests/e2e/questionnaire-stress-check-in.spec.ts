import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/stress-check-in-test.json";
async function finish(page: Page, locale: "en" | "zh", values: number[]) {
  for (const [i,q] of data.questions.entries()) {
    const radio = page.locator(`input[name="${q.id}"][value="${values[i]}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-stress-check-in-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 3 ? "查看本次总分" : "下一题") : (i === 3 ? "See this check-in total" : "Next"), exact: true }).click();
  }
  const sum = values[0]+4-values[1]+values[2]+4-values[3];
  await expect(page.locator("[data-stress-check-in-total]")).toContainText(`${sum} / 16`);
  await expect(page.locator("[data-stress-check-in-contribution]")).toHaveCount(4);
  for (const s of data.profiles[0].sections) {
    const section = page.locator(`#stress-check-in-report-${s.id}`);
    await expect(section.locator("h3")).toHaveText(s.title[locale]);
    for (const p of s.paragraphs) await expect(section.getByText(p[locale],{exact:true})).toBeVisible();
  }
}
for (const locale of ["en","zh"] as const) {
  const zh=locale==="zh",entry=`/${locale}/tests/explore/stress-check-in-test`;
  test(`@release monthly stress ${locale}: four real choices, exact total and all12 paragraphs, editing and empty retake`, async({page})=>{
    await page.setViewportSize({width:390,height:844});
    const leaks:string[]=[];page.on("request",r=>{if(r.method()==="POST"&&/stress-check-in-0[1-4]|contributions|MONTHLY_STRESS/.test(r.postData()??""))leaks.push(r.url());});
    await page.goto(`/${locale}/tests`);await page.locator("#more-tests").getByRole("link",{name:data.title[locale],exact:true}).click();
    await expect(page.getByRole("heading",{level:1})).toHaveText(data.title[locale]);await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    await page.screenshot({path:test.info().outputPath(`monthly-stress-${locale}-entry.png`)});
    const method=page.locator('section[aria-labelledby="questionnaire-method"]');for(const s of data.guide)for(const p of s.paragraphs)await expect(method.getByText(p[locale],{exact:true})).toBeVisible();
    await page.getByRole("button",{name:zh?"开始测试":"Start test",exact:true}).click();
    const header=await page.getByRole("banner").boundingBox(),progress=await page.locator("[data-stress-check-in-progress]").boundingBox();expect(header).not.toBeNull();expect(progress).not.toBeNull();expect(progress!.y).toBeGreaterThanOrEqual(header!.y+header!.height);
    await page.screenshot({path:test.info().outputPath(`monthly-stress-${locale}-question.png`)});
    await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await expect(page.locator("#take-test [role=status]")).toContainText(zh?"请选择":"Choose how often");
    await finish(page,locale,[3,1,2,3]);await page.screenshot({path:test.info().outputPath(`monthly-stress-${locale}-result.png`)});
    await page.getByRole("button",{name:zh?"修改回答（清除当前结果）":"Edit answers and clear this result",exact:true}).click();await expect(page.locator("[data-stress-check-in-result]")).toHaveCount(0);await finish(page,locale,[4,1,2,3]);
    expect(await page.evaluate(()=>sessionStorage.getItem("fm_questionnaire_draft:stress-check-in-test"))).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("button",{name:zh?"重新测试（清除本次回答）":"Retake with empty answers",exact:true}).click();await expect(page.locator("[data-stress-check-in-result]")).toHaveCount(0);await expect(page.getByRole("radio").first()).not.toBeChecked();expect(leaks).toEqual([]);
  });
  test(`@release monthly stress ${locale}: edit, reload, language, actual leave and explicit clear discard answers`,async({page})=>{
    const start=()=>page.getByRole("button",{name:zh?"开始测试":"Start test",exact:true}).click();
    await page.goto(entry);await start();await page.locator('input[value="2"]').check();await page.getByRole("button",{name:zh?"下一题":"Next",exact:true}).click();await page.getByRole("button",{name:zh?"上一题":"Back",exact:true}).click();await expect(page.locator('input[value="2"]')).toBeChecked();
    await page.reload();await start();await expect(page.locator('input[value="2"]')).not.toBeChecked();await page.locator('input[value="4"]').check();
    const other=zh?"en":"zh";await page.goto(`/${other}/tests/explore/stress-check-in-test`);await page.getByRole("button",{name:other==="zh"?"开始测试":"Start test",exact:true}).click();await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.goto(entry);await start();await page.locator('input[value="3"]').check();await page.getByRole("button",{name:zh?"退出并清除本次回答":"Exit and clear these responses",exact:true}).click();await start();await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator('input[value="1"]').check();await page.goto(`/${locale}/tests`);await page.goBack();await start();await expect(page.locator('input[value="1"]')).not.toBeChecked();
  });
  test(`@release monthly stress ${locale}: both extrema, denied storage and public-only clipboard fallback`,async({page})=>{
    await page.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return get.call(this,k);};Storage.prototype.setItem=function(k,v){if(k.startsWith("fm_questionnaire_draft:"))throw Error("synthetic storage denial");return set.call(this,k,v);};Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("synthetic clipboard denial");}}});});
    await page.goto(entry);
    const accept=page.getByRole("button",{name:zh?"接受":"Accept",exact:true});if(await accept.isVisible())await accept.click();
    await expect(page.locator("#fm-google-tag-script, #fm-baidu-tongji-script")).toHaveCount(0);
    await page.getByRole("button",{name:zh?"开始测试":"Start test",exact:true}).click();await finish(page,locale,[0,4,0,4]);await page.getByRole("button",{name:zh?"重新测试（清除本次回答）":"Retake with empty answers",exact:true}).click();await finish(page,locale,[4,0,4,0]);
    await page.getByRole("button",{name:zh?"复制公开解释链接":"Copy public explanation link",exact:true}).click();const copied=await page.getByRole("textbox",{name:zh?"手动复制公开链接":"Public link for manual copying"}).inputValue();expect(copied).toBe(`${data.profiles[0].title[locale]}\nhttps://fermatmind.com${entry}/results/reading-your-check-in`);expect(copied).not.toMatch(/stress-check-in-0[1-4]|16 \/ 16|contributions/);
  });
}
test("@release monthly stress: both complete public guides, four OGs and closed identifiers",async({page,request})=>{
  for(const locale of ["en","zh"]as const){const profile=data.profiles[0],path=`/${locale}/tests/explore/stress-check-in-test/results/${profile.id}`;expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole("heading",{level:1})).toHaveText(profile.title[locale]);await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`);await expect(page.locator("[data-stress-check-in-total]")).toHaveCount(0);for(const s of profile.sections){const section=page.locator(`#report-${s.id}`);await expect(section.locator("h2")).toHaveText(s.title[locale]);for(const p of s.paragraphs)await expect(section.getByText(p[locale],{exact:true})).toBeVisible();}await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`https://fermatmind.com${path}`);for(const p of [null,profile]){const r=await request.get(`/og/fun/stress-check-in-test?locale=${locale}${p?`&portrait=${p.id}`:""}`);expect(r.status()).toBe(200);const b=await r.body();expect(b.readUInt32BE(16)).toBe(1200);expect(b.readUInt32BE(20)).toBe(630);}}
  for(const path of ["/en/tests/explore/stress-check-in-test/results/unknown","/zh/tests/explore/stress-check-in-test/results/stress-check-in-01","/en/tests/play/stress-check-in-test"])expect((await request.get(path)).status()).toBe(404);
});
