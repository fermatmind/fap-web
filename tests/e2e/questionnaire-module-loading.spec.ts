import { test, expect } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/cognitive-functions-test.json";

for (const locale of ["en", "zh"] as const) {
  test(`@release cognitive ${locale}: retry interrupted edition and result chunks without losing answers`, async ({ page }) => {
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/explore/cognitive-functions-test`);
    const decline = page.getByRole("button", { name: zh ? "拒绝" : "Decline", exact: true });
    if (await decline.isVisible()) await decline.click();
    const edition = page.locator('[data-cognitive-method="ratings32"]');
    await expect(edition).toBeEnabled();
    let interrupted = 0;
    const chunks = "**/_next/static/chunks/*.js";
    await page.route(chunks, route => { interrupted++; return route.abort("failed"); });
    await edition.click();
    await expect(page.locator("[data-cognitive-versions]").getByRole("alert")).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: zh ? "切换方法并清除回答" : "Switch method and clear responses", exact: true })).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await expect(page.locator('#take-test[data-stage="answer"]')).toBeVisible();
    for (const [i, question] of quiz.questions.entries()) {
      await page.locator(`input[name="${question.id}"][value="4"]`).check();
      if (i === quiz.questions.length - 1) {
        interrupted = 0;
        await page.route(chunks, route => { interrupted++; return route.abort("failed"); });
      }
      await page.getByRole("button", { name: i === quiz.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
    }
    await expect(page.locator('#take-test[data-stage="result"]')).toBeVisible();
    await expect(page.locator("[data-cognitive-versions]").getByRole("alert")).toContainText(zh ? "当前输入仍保留" : "current inputs are retained");
    expect(interrupted).toBeGreaterThan(0);
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    const report = page.locator("[data-cognitive-functions-report]");
    await expect(report.locator("[data-cognitive-full]")).toHaveCount(8);
    for (const direction of quiz.directions) await expect(report.locator(`[data-cognitive-mean="${direction.id}"]`)).toHaveText("3.5 / 5");
    await report.locator(":scope > details > summary").click();
    for (const question of quiz.questions) await expect(report.locator(`[data-cognitive-answer="${question.id}"]`)).toContainText(question.options.find(option => option.id === "4")!.label[locale]);
  });
}
