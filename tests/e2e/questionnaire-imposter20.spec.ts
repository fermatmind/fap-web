import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/imposter-syndrome.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function click(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function answerAll(page: Page, l: Locale, value: (i: number) => string) {
  for (const [i, q] of quiz.questions.entries()) {
    await page.locator(`input[name="${q.id}"][value="${value(i)}"]`).check();
    await click(page, l, i === 19 ? "See five readings and full guides" : "Next", i === 19 ? "查看五组读数与完整读法" : "下一题");
  }
}
for (const l of ["en", "zh"] as const) {
  test(`@release Imposter20 ${l}: mobile, keyboard/back, five full readings, public sharing and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    else await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Unavailable for test"); } } }));
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (r.method() === "POST" && /IPR_\d\d|"answers"|"sum"|"mean"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await click(page, l, "Start test", "开始测试"); await expect(page.locator("#imposter20-question")).toBeFocused();
    await click(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose a number", "请选择一个数字"));
    for (const [i, q] of quiz.questions.entries()) {
      const input = page.locator(`input[name="${q.id}"][value="2"]`);
      if (!i) { await input.focus(); await input.press("Space"); } else await input.check();
      if (i === 1) {
        await click(page, l, "Back", "上一题"); await expect(page.locator('input[name="IPR_01"][value="2"]')).toBeChecked();
        await page.locator('input[name="IPR_01"][value="3"]').check(); await page.locator('input[name="IPR_01"][value="2"]').check();
        await click(page, l, "Next", "下一题"); await expect(input).toBeChecked();
      }
      await expect(page.locator("[data-imposter20-result]")).toHaveCount(0);
      await click(page, l, i === 19 ? "See five readings and full guides" : "Next", i === 19 ? "查看五组读数与完整读法" : "下一题");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
    expect(await page.locator("#take-test h2").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    await expect(page.locator("[data-imposter20-part]")).toHaveCount(5);
    for (const [i, p] of quiz.profiles.entries()) {
      const part = page.locator(`[data-imposter20-part="${p.id}"]`);
      await expect(part.locator("[data-imposter20-sum]")).toContainText("8"); await expect(part.locator("[data-imposter20-mean]")).toContainText("2.00");
      await part.locator("summary").click(); await expect(part.locator("h4")).toHaveCount(7);
      for (const s of p.sections) for (const text of s.paragraphs) await expect(part).toContainText(text[l]);
      if (i === 0) { await part.locator("h3").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-contribution-reading.png`) }); }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#take-test h2").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-readout.png`) });
    await click(page, l, "Copy public explanation links", "复制公开解释链接");
    await expect(page.getByRole("status")).toHaveText(l === "zh" ? /无法自动复制/ : /Copied public explanation links/);
    const expected = quiz.profiles.map(p => `${p.title[l]}\nhttps://fermatmind.com${path(l)}/results/${p.id}`).join("\n\n");
    if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected); else await expect(page.locator("#take-test textarea")).toHaveValue(expected);
    const next = page.getByRole("link", { name: label(l, "View the Big Five test entry", "查看大五人格测试入口"), exact: true });
    expect(await next.getAttribute("href")).toBe(`/${l}/tests/big-five-personality-test-ocean-model`);
    expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试");
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0); await expect(page.locator("[data-imposter20-result]")).toHaveCount(0);
    await click(page, l, "Exit and clear these responses", "退出并清除本次回答"); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
  });
  test(`@release Imposter20 ${l}: partial coverage, real zero, all-skip and no invented total`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await answerAll(page, l, i => i < 2 ? "na" : i === 4 ? "na" : "0");
    await expect(page.locator('[data-imposter20-part="contribution"] [data-imposter20-unscored]')).toBeVisible();
    const feedback = page.locator('[data-imposter20-part="feedback"]');
    await expect(feedback.locator('[data-imposter20-count]')).toContainText("3/4");
    await expect(feedback.locator('[data-imposter20-sum]')).toContainText(l === "zh" ? "0—12" : "0–12");
    await expect(feedback.locator('[data-imposter20-mean]')).toContainText("0.00");
    await expect(page.locator('[data-imposter20-part="evaluation"] [data-imposter20-sum]')).toContainText(l === "zh" ? "0—16" : "0–16");
    await expect(page.locator('[data-imposter20-part="overall"]')).toHaveCount(0);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试"); await answerAll(page, l, () => "na");
    await expect(page.locator("[data-imposter20-unscored]")).toHaveCount(5); await expect(page.locator("[data-imposter20-sum]")).toHaveCount(0); await expect(page.locator("[data-imposter20-mean]")).toHaveCount(0);
    await expect(page.locator("[data-imposter20-part] summary")).toHaveCount(5);
  });
  test(`@release Imposter20 ${l}: refresh, language, return and queried public guide never restore private answers`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await page.locator('input[name="IPR_01"][value="4"]').check(); await page.reload();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await click(page, l, "Start test", "开始测试"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await page.locator('input[name="IPR_01"][value="4"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other);
    await expect(page.getByRole("button", { name: label(other, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goBack(); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goto(`${path(l)}/results/evaluation?score=16&answers=private`);
    await expect(page.locator("h1")).toHaveText(quiz.profiles[2].title[l]); await expect(page.locator("[data-imposter20-result]")).toHaveCount(0);
    await expect(page.locator("[data-public-content-loading]")).toHaveCount(0); const guide = page.getByRole("main"); await expect(guide).toHaveCount(1);
    for (const s of quiz.profiles[2].sections) for (const p of s.paragraphs) await expect(guide).toContainText(p[l]);
    await page.getByRole("link", { name: label(l, "Start the free 20-item self-reflection", "免费开始20项自我反思"), exact: true }).click();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible(); expect(new URL(page.url()).search).toBe("");
  });
}
