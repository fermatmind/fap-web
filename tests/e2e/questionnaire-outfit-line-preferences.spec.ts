import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/outfit-line-preferences.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  // Observe attempted requests as usual, but never write synthetic traffic to aggregate sinks.
  await page.route(/\/api\/(?:v0\.5\/seo\/attribution\/events|track)(?:\?|$)|https:\/\/(?:www\.googletagmanager\.com|(?:www\.)?google-analytics\.com|hm\.baidu\.com)\//, route => route.fulfill({ status: 204 }));
});
async function acceptCookies(page: Page, locale: "en" | "zh") {
  const consent = page.getByRole("button", { name: locale === "zh" ? "接受" : "Accept", exact: true });
  if (await consent.count()) await consent.click();
}
function observePrivateRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", request => {
    if (request.method() !== "POST") return;
    if (/OLP_\d{3}|FM_OUTFIT_LINES15|outfit-line-preferences|fermatmind_outfit_lines15|start_test|complete_test|view_result|questionnaire_result_mbti/.test(request.postData() ?? "")) requests.push(request.url());
  });
  return requests;
}
async function finish(page: Page, locale: "en" | "zh", mode: "mixed" | "na") {
  const values = [["1", "2", "4"], ["3", "3", "na"], ["5", "5", "5"], ["1", "1", "1"], ["2", "3", "4"]];
  for (const [index, question] of quiz.questions.entries()) {
    const value = mode === "na" ? "na" : values[Math.floor(index / 3)][index % 3];
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-olp-mean]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 14 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-olp-facet]")).toHaveCount(5); await expect(page.locator("[data-olp-profile]")).toHaveCount(5);
  await expect(page.locator("#take-test h4")).toHaveCount(40);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  if (mode === "mixed") {
    await expect(page.locator('[data-olp-facet="long-line"] [data-olp-mean]')).toHaveText("2.3 / 5");
    await expect(page.locator('[data-olp-facet="long-line"] [data-olp-sum]')).toContainText("7 / 3");
    await expect(page.locator('[data-olp-facet="ease-and-room"] [data-olp-mean]')).toHaveText(locale === "zh" ? "资料不足" : "Insufficient information");
    await expect(page.locator('[data-olp-facet="ease-and-room"] [data-olp-sum]')).toHaveCount(0);
    await expect(page.locator('[data-olp-facet="even-balance"] [data-olp-mean]')).toHaveText("5.0 / 5");
    await expect(page.locator('[data-olp-facet="compact-contrast"] [data-olp-mean]')).toHaveText("1.0 / 5");
    await expect(page.locator('[data-olp-facet="soft-drape"] [data-olp-mean]')).toHaveText("3.0 / 5");
  } else {
    await expect(page.locator("[data-olp-insufficient]")).toBeVisible(); await expect(page.locator("[data-olp-sum]")).toHaveCount(0);
    for (const group of quiz.directions) await expect(page.locator(`[data-olp-facet="${group.id}"] [data-olp-mean]`)).toHaveText(locale === "zh" ? "资料不足" : "Insufficient information");
  }
  await expect(page.getByRole("button", { name: /Copy result|复制结果/ })).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/outfit-line-preferences`;
  test(`@release Outfit-line preferences ${locale}: hub, keyboard, back edit,15 real responses, exact means, all40sections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const requests = observePrivateRequests(page);
    await page.goto(`/${locale}/tests`); await acceptCookies(page, locale);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创自我观察问卷 · 完整结果免费" : "Original self-reflection questionnaire · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解独立图形审美观察" : "Read about the separate graphic Aesthetic reflection" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked();
    await finish(page, locale, "mixed");
    await expect(page.getByRole("link", { name: zh ? "了解独立图形审美观察" : "Read about the separate graphic Aesthetic reflection" })).toHaveAttribute("href", `/${locale}/tests/explore/aesthetic-core-test`);
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-olp-mean]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(requests).toEqual([]);
  });

  test(`@release Outfit-line preferences ${locale}: stale drafts are not read and refresh or language navigation loses the in-memory attempt`, async ({ page }) => {
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:outfit-line-preferences", touches: string[] = [];
      const originalSet = Storage.prototype.setItem;
      originalSet.call(sessionStorage, key, JSON.stringify({ version: "fm_outfit_lines15_v1", savedAt: Date.now(), answers: { OLP_001: "5" } }));
      (window as Window & { outfitStorageTouches?: string[] }).outfitStorageTouches = touches;
      const get = Storage.prototype.getItem, remove = Storage.prototype.removeItem;
      Storage.prototype.getItem = function(k) { if (k === key) { touches.push("get"); throw new Error("synthetic storage denial"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k === key) { touches.push("set"); throw new Error("synthetic storage denial"); } return originalSet.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (k === key) { touches.push("remove"); throw new Error("synthetic storage denial"); } return remove.call(this, k); };
    });
    await page.goto(entry); await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="5"]')).not.toBeChecked();
    await page.locator('input[value="4"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    expect(await page.evaluate(() => (window as Window & { outfitStorageTouches?: string[] }).outfitStorageTouches)).toEqual([]);
    await page.reload(); await expect(page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="5"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/outfit-line-preferences`);
    await expect(page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="5"]')).not.toBeChecked();
    expect(await page.evaluate(() => (window as Window & { outfitStorageTouches?: string[] }).outfitStorageTouches)).toEqual([]);
  });

  test(`@release Outfit-line preferences ${locale}: all-skipped is finished without means, with all40sections and no result sharing or flow analytics`, async ({ page }) => {
    const requests = observePrivateRequests(page); await page.goto(entry); await acceptCookies(page, locale);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "na");
    await expect(page.getByRole("heading", { level: 3, name: zh ? "五份说明已完整开放，可以在这里结束" : "All five guides are open. You may finish here.", exact: true })).toBeVisible();
    await page.waitForTimeout(250); expect(requests).toEqual([]);
  });
}

test("@release Outfit-line preferences all10 public full guides, bilingual images and closed identities", async ({ page, request }) => {
  const requests = observePrivateRequests(page);
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/outfit-line-preferences/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await acceptCookies(page, locale);
    await expect(page.locator("[data-olp-mean]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/outfit-line-preferences/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/outfit-line-preferences#take-test`);
    const image = await request.get(`/og/fun/outfit-line-preferences?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/outfit-line-preferences/results/dominant-type", "/zh/tests/explore/outfit-line-preferences/results/OLP_001", "/en/tests/play/outfit-line-preferences"]) expect((await request.get(path)).status()).toBe(404);
  expect(requests).toEqual([]);
});
