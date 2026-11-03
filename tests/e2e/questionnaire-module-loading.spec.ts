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

for (const locale of ["en", "zh"] as const) {
  test(`@release cognitive ${locale}: retry interrupted 56-choice edition and return to method selection`, async ({ page }) => {
    const zh = locale === "zh";
    await page.goto(`/${locale}/tests/explore/cognitive-functions-test`);
    const edition = page.locator('[data-cognitive-method="paired56"]');
    await expect(edition).toBeEnabled();
    const chunks = "**/_next/static/chunks/*.js";
    let interrupted = 0;
    await page.route(chunks, route => { interrupted++; return route.abort("failed"); });
    await edition.click();
    await expect(page.locator("[data-cognitive-versions]").getByRole("alert")).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: zh ? "切换方法并清除回答" : "Switch method and clear responses", exact: true })).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await page.getByRole("radio").first().check();
    await expect(page.getByRole("radio").first()).toBeChecked();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("[data-jung56-progress]")).toContainText("2 / 56");
    await page.getByRole("button", { name: zh ? "切换方法并清除回答" : "Switch method and clear responses", exact: true }).click();
    await expect(page.locator('[data-cognitive-method="paired56"]')).toBeVisible();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release DISC ${locale}: retry interrupted engine, retain a saved attempt and return safely`, async ({ page }) => {
    const zh = locale === "zh", chunks = "**/_next/static/chunks/*.js";
    const failure = page.locator("[data-disc-prepare-return]").locator("..").getByRole("alert");
    await page.goto(`/${locale}/tests/explore/disc`);
    await expect(page.locator("[data-explore-start]")).toBeEnabled();
    let interrupted = 0;
    await page.route(chunks, route => { interrupted++; return route.abort("failed"); });
    await page.locator("[data-explore-start]").click();
    await expect(failure).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.locator("[data-disc-prepare-return]")).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await page.getByRole("radio").first().check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    const saved = await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"));
    expect(saved).not.toBeNull();
    await page.reload();
    const resume = page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true });
    await expect(resume).toBeVisible();
    await page.route(chunks, route => route.abort("failed"));
    await resume.click(); await expect(failure).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBe(saved);
    await page.locator("[data-disc-prepare-return]").click();
    await page.unroute(chunks); await resume.click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.getByRole("radio").first()).toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBeNull();
  });
}
