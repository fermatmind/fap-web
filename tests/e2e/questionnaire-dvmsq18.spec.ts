import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/misophonia-screener.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function click(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function choose(page: Page, id: string, value: string) { await page.locator(`input[name="${id}"][value="${value}"]`).check(); }
async function finish(page: Page, l: Locale, value: (n: number) => string) {
  await choose(page, "DV_S1", "yes"); await click(page, l, "Next", "下一题");
  for (let n = 1; n <= 18; n++) {
    await choose(page, `DV_${String(n).padStart(2, "0")}`, value(n));
    await click(page, l, n === 18 ? "See record and full guides" : "Next", n === 18 ? "查看记录与完整读法" : "下一题");
  }
}
async function retake(page: Page, l: Locale) { await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试"); }
for (const l of ["en", "zh"] as const) {
  test(`@release Dvmsq18 ${l}: mobile, source contexts, keyboard/back, raw sums, full guides, public sharing and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    else await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Unavailable for test"); } } }));
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (r.method() === "POST" && /DV_\d\d|DV_S1|"answers"|"total"|"responses"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await click(page, l, "Start test", "开始测试"); await expect(page.locator("#dvmsq18-question")).toBeFocused();
    await click(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an available response", "请选择一种可用回答"));
    await expect(page.locator("#take-test")).toContainText(quiz.dvmsq18.gateClarification[l]);
    await choose(page, "DV_S1", "yes"); await click(page, l, "Next", "下一题");
    for (let n = 1; n <= 18; n++) {
      const id = `DV_${String(n).padStart(2, "0")}`, input = page.locator(`input[name="${id}"][value="${n === 3 ? "4" : "2"}"]`);
      if (n === 1) { await input.focus(); await input.press("Space"); } else await input.check();
      if (n <= 10) await expect(page.locator("#take-test")).toContainText(quiz.dvmsq18.frequencyContext[l]);
      if (n >= 12 && n <= 15) await expect(page.locator("#take-test")).toContainText(quiz.dvmsq18.interferenceContext[l]);
      if (n >= 16) await expect(page.locator("#take-test")).toContainText(quiz.dvmsq18.globalContext[l]);
      if (n === 2) {
        await click(page, l, "Back", "上一题"); await expect(page.locator('input[name="DV_01"][value="2"]')).toBeChecked();
        await choose(page, "DV_01", "3"); await choose(page, "DV_01", "2"); await click(page, l, "Next", "下一题"); await expect(input).toBeChecked();
      }
      await expect(page.locator("[data-dvmsq18-result]")).toHaveCount(0);
      await click(page, l, n === 18 ? "See record and full guides" : "Next", n === 18 ? "查看记录与完整读法" : "下一题");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
    expect(await page.locator("#take-test h2").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    await expect(page.locator("[data-dvmsq18-total]")).toContainText("34");
    await expect(page.locator('[data-dvmsq18-part="symptom"] [data-dvmsq18-sum]')).toContainText("20"); await expect(page.locator('[data-dvmsq18-part="impairment"] [data-dvmsq18-sum]')).toContainText("14");
    await expect(page.locator("[data-dvmsq18-fear]")).toContainText(quiz.questions[3].options[4].label[l]);
    await page.locator("[data-dvmsq18-response-record] summary").click(); await expect(page.locator("[data-dvmsq18-response-record] li")).toHaveCount(19);
    for (const [i, p] of quiz.profiles.entries()) {
      const guide = page.locator(`[data-dvmsq18-guide="${p.id}"]`); await guide.locator("summary").click(); await expect(guide.locator("h4")).toHaveCount(7);
      for (const s of p.sections) for (const text of s.paragraphs) await expect(guide).toContainText(text[l]);
      if (i === 0) { await guide.locator("h3").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-overall-reading.png`) }); }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#take-test h2").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-readout.png`) });
    await click(page, l, "Copy public explanation links", "复制公开解释链接"); await expect(page.getByRole("status")).toHaveText(l === "zh" ? /无法自动复制/ : /Copied public explanation links/);
    const expected = quiz.profiles.map(p => `${p.title[l]}\nhttps://fermatmind.com${path(l)}/results/${p.id}`).join("\n\n");
    if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected); else await expect(page.locator("#take-test textarea")).toHaveValue(expected);
    expect(await page.getByRole("link", { name: label(l, "View the 92-item SPQ entry", "查看92项SPQ入口"), exact: true }).getAttribute("href")).toBe(`/${l}/tests/explore/sensory-processing-test`);
    expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    await retake(page, l); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await click(page, l, "Exit and clear these responses", "退出并清除本次回答"); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
  });
  test(`@release Dvmsq18 ${l}: early gate branches, changed gate clears answers, all-skip and excluded fear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await choose(page, "DV_S1", "yes"); await click(page, l, "Next", "下一题"); await choose(page, "DV_01", "4"); await click(page, l, "Back", "上一题");
    await choose(page, "DV_S1", "no"); await click(page, l, "See record and full guides", "查看记录与完整读法");
    await expect(page.locator("[data-dvmsq18-total]")).toContainText("0"); await expect(page.locator("[data-dvmsq18-part]")).toHaveCount(0); await expect(page.locator("[data-dvmsq18-response-record] li")).toHaveCount(1);
    for (const gate of ["unsure", "na"]) { await retake(page, l); await choose(page, "DV_S1", gate); await click(page, l, "See record and full guides", "查看记录与完整读法"); await expect(page.locator("[data-dvmsq18-total]")).toHaveCount(0); await expect(page.locator("[data-dvmsq18-unscored]")).toHaveCount(1); }
    await retake(page, l); await finish(page, l, () => "na"); await expect(page.locator("[data-dvmsq18-total-withheld]")).toBeVisible(); await expect(page.locator("[data-dvmsq18-part] [data-dvmsq18-unscored]")).toHaveCount(2);
    await retake(page, l); await finish(page, l, n => n === 3 ? "na" : "4"); await expect(page.locator("[data-dvmsq18-total]")).toContainText("68"); await expect(page.locator("[data-dvmsq18-fear]")).toContainText(quiz.questions[3].options[5].label[l]);
    await retake(page, l); await finish(page, l, n => n === 1 ? "na" : "2"); await expect(page.locator("[data-dvmsq18-total-withheld]")).toBeVisible(); await expect(page.locator('[data-dvmsq18-part="symptom"] [data-dvmsq18-unscored]')).toBeVisible(); await expect(page.locator('[data-dvmsq18-part="impairment"] [data-dvmsq18-sum]')).toContainText("14");
  });
  test(`@release Dvmsq18 ${l}: refresh, language, return and queried public guide never restore private answers`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试"); await choose(page, "DV_S1", "yes"); await click(page, l, "Next", "下一题"); await choose(page, "DV_01", "4"); await page.reload();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible(); expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await click(page, l, "Start test", "开始测试"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0); await choose(page, "DV_S1", "yes");
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await expect(page.getByRole("button", { name: label(other, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goBack(); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goto(`${path(l)}/results/overall?score=68&answers=private`); await expect(page.locator("h1")).toHaveText(quiz.profiles[0].title[l]); await expect(page.locator("[data-dvmsq18-result]")).toHaveCount(0);
    await expect(page.locator("[data-public-content-loading]")).toHaveCount(0); const guide = page.getByRole("main"); await expect(guide).toHaveCount(1);
    for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) await expect(guide).toContainText(p[l]);
    await expect(guide).toContainText(quiz.dvmsq18.attribution[l]); await expect(guide.locator('a[href="https://creativecommons.org/licenses/by-sa/4.0/"]')).toBeVisible();
    await page.getByRole("link", { name: label(l, "Start the free DVMSQ source-form check-in", "免费开始DVMSQ源表自评"), exact: true }).click();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible(); expect(new URL(page.url()).search).toBe("");
  });
}
