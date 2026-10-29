import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/anger-issues-screener.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function click(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function answerAll(page: Page, l: Locale, value: (i: number) => string) {
  for (const [i, q] of quiz.questions.entries()) {
    await page.locator(`input[name="${q.id}"][value="${value(i)}"]`).check();
    await click(page, l, i === 19 ? "See four readings and full guides" : "Next", i === 19 ? "查看四组读数与完整读法" : "下一题");
  }
}
for (const l of ["en", "zh"] as const) {
  test(`@release Anger20 ${l}: mobile, keyboard/back, four full readings, public sharing and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    else await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Unavailable for test"); } } }));
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (r.method() === "POST" && /ANG_\d\d|"answers"|"sum"|"mean"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await click(page, l, "Start test", "开始测试"); await expect(page.locator("#anger20-question")).toBeFocused();
    await click(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose a number", "请选择一个数字"));
    for (const [i, q] of quiz.questions.entries()) {
      if (i === 5) { await expect(page.locator("[data-anger20-context]")).toContainText(l === "zh" ? "没有生气机会时选不计分" : "No angry occasions means unscored"); await expect(page.locator("[data-anger20-context]")).toBeInViewport(); }
      const input = page.locator(`input[name="${q.id}"][value="${i === 9 ? "1" : "2"}"]`);
      if (!i) { await input.focus(); await input.press("Space"); } else await input.check();
      if (i === 1) {
        await click(page, l, "Back", "上一题"); await expect(page.locator('input[name="ANG_01"][value="2"]')).toBeChecked();
        await page.locator('input[name="ANG_01"][value="3"]').check(); await page.locator('input[name="ANG_01"][value="2"]').check();
        await click(page, l, "Next", "下一题"); await expect(input).toBeChecked();
      }
      await expect(page.locator("[data-anger20-result]")).toHaveCount(0);
      await click(page, l, i === 19 ? "See four readings and full guides" : "Next", i === 19 ? "查看四组读数与完整读法" : "下一题");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
    expect(await page.locator("#take-test h2").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    await expect(page.locator("[data-anger20-part]")).toHaveCount(4);
    for (const [i, p] of quiz.profiles.entries()) {
      const part = page.locator(`[data-anger20-part="${p.id}"]`);
      await expect(part.locator("[data-anger20-sum]")).toContainText(p.id === "outward-expression" ? "9" : "10"); await expect(part.locator("[data-anger20-mean]")).toContainText(p.id === "outward-expression" ? "1.80" : "2.00");
      const review = part.locator("[data-anger20-response-review]"); await review.locator("summary").click();
      await expect(review.locator("li")).toHaveCount(5);
      for (const [j, q] of quiz.questions.filter(q => q.options[0].directionId === p.id).entries()) {
        const item = review.locator("li").nth(j), choice = quiz.questions.indexOf(q) === 9 ? "1" : "2";
        await expect(item).toContainText(q.prompt[l]); await expect(item).toContainText(q.options.find(o => o.id === choice)!.label[l]);
      }
      await part.locator("details:not([data-anger20-response-review]) > summary").click(); await expect(part.locator("h4")).toHaveCount(7);
      for (const s of p.sections) for (const text of s.paragraphs) await expect(part).toContainText(text[l]);
      if (i === 0) { await part.locator("h3").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-anger-reading.png`) }); }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#take-test h2").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-readout.png`) });
    await click(page, l, "Copy public explanation links", "复制公开解释链接");
    await expect(page.getByRole("status")).toHaveText(l === "zh" ? /无法自动复制/ : /Copied public explanation links/);
    const expected = quiz.profiles.map(p => `${p.title[l]}\nhttps://fermatmind.com${path(l)}/results/${p.id}`).join("\n\n");
    if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected); else await expect(page.locator("#take-test textarea")).toHaveValue(expected);
    const next = page.getByRole("link", { name: label(l, "View the EQ60 emotional self-report entry", "查看EQ60情绪自评入口"), exact: true });
    expect(await next.getAttribute("href")).toBe(`/${l}/tests/eq-test-emotional-intelligence-assessment`);
    expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试");
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0); await expect(page.locator("[data-anger20-result]")).toHaveCount(0);
    await click(page, l, "Exit and clear these responses", "退出并清除本次回答"); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
  });
  test(`@release Anger20 ${l}: partial coverage, real zero, all-skip and no invented total`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await answerAll(page, l, i => i === 0 ? "na" : "0");
    await expect(page.locator('[data-anger20-part="anger-occurrence"] [data-anger20-unscored]')).toBeVisible();
    const expression = page.locator('[data-anger20-part="outward-expression"]');
    await expect(expression.locator('[data-anger20-count]')).toContainText("5/5");
    await expect(expression.locator('[data-anger20-sum]')).toContainText(l === "zh" ? "0—20" : "0–20");
    await expect(expression.locator('[data-anger20-mean]')).toContainText("0.00");
    await expect(page.locator('[data-anger20-part="kept-inside"] [data-anger20-sum]')).toContainText(l === "zh" ? "0—20" : "0–20");
    await expect(page.locator('[data-anger20-part="overall"]')).toHaveCount(0);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试");
    await answerAll(page, l, i => i < 5 ? "0" : "na");
    await expect(page.locator('[data-anger20-part="anger-occurrence"] [data-anger20-mean]')).toContainText("0.00");
    await expect(page.locator("[data-anger20-unscored]")).toHaveCount(3);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试"); await answerAll(page, l, () => "na");
    await expect(page.locator("[data-anger20-unscored]")).toHaveCount(4); await expect(page.locator("[data-anger20-sum]")).toHaveCount(0); await expect(page.locator("[data-anger20-mean]")).toHaveCount(0);
    await expect(page.locator("[data-anger20-part] details:not([data-anger20-response-review]) > summary")).toHaveCount(4);
  });
  test(`@release Anger20 ${l}: refresh, language, return and queried public guide never restore private answers`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await page.locator('input[name="ANG_01"][value="4"]').check(); await page.reload();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await click(page, l, "Start test", "开始测试"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await page.locator('input[name="ANG_01"][value="4"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other);
    await expect(page.getByRole("button", { name: label(other, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goBack(); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goto(`${path(l)}/results/perceived-choice?score=12&answers=private`);
    await expect(page.locator("h1")).toHaveText(quiz.profiles[3].title[l]); await expect(page.locator("[data-anger20-result]")).toHaveCount(0);
    await expect(page.locator("[data-public-content-loading]")).toHaveCount(0); const guide = page.getByRole("main"); await expect(guide).toHaveCount(1);
    for (const s of quiz.profiles[3].sections) for (const p of s.paragraphs) await expect(guide).toContainText(p[l]);
    await page.getByRole("link", { name: label(l, "Try the free 20 anger response prompts", "免费尝试20条愤怒反应描述"), exact: true }).click();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible(); expect(new URL(page.url()).search).toBe("");
  });
}
