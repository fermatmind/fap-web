import { test, expect } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/cognitive-functions-test.json";
import disc from "../../lib/questionnaires/data/disc.json";
import jung from "../../lib/questionnaires/jung56Bank.json";

const selectedChunks = { ratings32: new Set<string>(), paired56: new Set<string>(), disc: new Set<string>() };
function englishProbe(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  if (typeof object.en === "string") {
    const match = object.en.match(/[A-Za-z][A-Za-z ,]{25,}/);
    if (match) return match[0];
  }
  for (const child of Object.values(object)) { const found = englishProbe(child); if (found) return found; }
  return null;
}

// Find the current build's real edition assets; never abort the new document's bootstrap.
test.beforeAll(async ({ browser, baseURL }) => {
  for (const method of ["ratings32", "paired56", "disc"] as const) {
    const probe = englishProbe(method === "disc" ? disc.questions[0] : method === "ratings32" ? quiz.questions[0] : jung.questions[0]);
    expect(probe).not.toBeNull();
    const context = await browser.newContext({ baseURL });
    try {
      const page = await context.newPage(), reads: Promise<void>[] = [];
      await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
      page.on("response", response => {
        if (response.request().resourceType() !== "script") return;
        reads.push(response.text().then(body => { if (body.includes(probe!)) selectedChunks[method].add(new URL(response.url()).pathname); }).catch(() => {}));
      });
      await page.goto(method === "disc" ? "/en/tests/explore/disc/take?start=1" : `/en/tests/explore/cognitive-functions-test/take?edition=${method}&start=1`);
      await expect(page.getByRole("radio").first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      await Promise.all(reads);
      expect(selectedChunks[method].size).toBeGreaterThan(0);
    } finally { await context.close(); }
  }
});

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
    await page.route(chunks, route => { if (selectedChunks["ratings32"].has(new URL(route.request().url()).pathname)) { interrupted++; return route.abort("failed"); } return route.continue(); });
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
    await page.route(chunks, route => { if (selectedChunks.paired56.has(new URL(route.request().url()).pathname)) { interrupted++; return route.abort("failed"); } return route.continue(); });
    await edition.click();
    await expect(page.locator("[data-cognitive-versions]").getByRole("alert")).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: zh ? "切换方法并清除回答" : "Switch method and clear responses", exact: true })).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await page.getByRole("radio").first().check();
    await expect(page.locator("[data-jung56-progress]")).toContainText("2 / 56");
    await page.getByRole("button", { name: zh ? "切换方法并清除回答" : "Switch method and clear responses", exact: true }).click();
    await expect(page.locator('[data-cognitive-method="paired56"]')).toBeVisible();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release DISC ${locale}: retry interrupted engine, discard old drafts and reload safely`, async ({ page }) => {
    const zh = locale === "zh", chunks = "**/_next/static/chunks/*.js";
    const failure = page.locator("[data-disc-prepare-return]").locator("..").getByRole("alert");
    await page.goto(`/${locale}/tests/explore/disc`);
    await expect(page.locator("[data-explore-start]")).toBeEnabled();
    let interrupted = 0;
    await page.route(chunks, route => { if (selectedChunks.disc.has(new URL(route.request().url()).pathname)) { interrupted++; return route.abort("failed"); } return route.continue(); });
    await page.locator("[data-explore-start]").click();
    await expect(failure).toContainText(zh ? "加载失败" : "could not load");
    expect(interrupted).toBeGreaterThan(0);
    await expect(page.locator("[data-disc-prepare-return]")).toBeVisible();
    await page.unroute(chunks);
    await page.getByRole("button", { name: zh ? "重试加载" : "Retry loading", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("radio").first().check();
    await expect(page.locator("#take-test h2")).toHaveText(disc.questions[1].prompt[locale]);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disc"))).toBeNull();
    await page.reload();
    await expect(page.locator("#take-test h2")).toHaveText(disc.questions[0].prompt[locale]);
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(page.locator("[data-questionnaire-resume]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Exit and clear|退出并清除/ })).toHaveCount(0);
  });
}
