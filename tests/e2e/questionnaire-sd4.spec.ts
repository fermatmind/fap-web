import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/dark-tetrad-sd4.json", "utf8")) as Questionnaire;
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
    if (/SD4_\d{3}|SD4_28|sd4_28_published|start_test|complete_test|view_result|questionnaire_result_mbti/.test(request.postData() ?? "")) requests.push(request.url());
  });
  return requests;
}
async function finish(page: Page, locale: "en" | "zh", mode: "mixed" | "na") {
  const values = [["2", "1", "1", "1", "1", "1", "1"], ["3", "3", "3", "3", "3", "3", "na"], ["1", "2", "3", "4", "5", "3", "3"], ["5", "5", "5", "5", "5", "5", "5"]];
  for (const [index, question] of quiz.questions.entries()) {
    const value = mode === "na" ? "na" : values[Math.floor(index / 7)][index % 7];
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-sd4-mean]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 27 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-sd4-facet]")).toHaveCount(4); await expect(page.locator("[data-sd4-profile]")).toHaveCount(4);
  await expect(page.locator("#take-test h4")).toHaveCount(32);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  if (mode === "mixed") {
    await expect(page.locator('[data-sd4-facet="machiavellianism"] [data-sd4-mean]')).toHaveText("1.14 / 5");
    await expect(page.locator('[data-sd4-facet="machiavellianism"] [data-sd4-sum]')).toContainText("8 / 7");
    await expect(page.locator('[data-sd4-facet="narcissism"] [data-sd4-mean]')).toHaveText(locale === "zh" ? "资料不足" : "Insufficient information");
    await expect(page.locator('[data-sd4-facet="narcissism"] [data-sd4-sum]')).toHaveCount(0);
    await expect(page.locator('[data-sd4-facet="psychopathy"] [data-sd4-mean]')).toHaveText("3.00 / 5");
    await expect(page.locator('[data-sd4-facet="sadism"] [data-sd4-mean]')).toHaveText("5.00 / 5");
  } else {
    await expect(page.locator("[data-sd4-insufficient]")).toBeVisible(); await expect(page.locator("[data-sd4-sum]")).toHaveCount(0);
    for (const group of quiz.directions) await expect(page.locator(`[data-sd4-facet="${group.id}"] [data-sd4-mean]`)).toHaveText(locale === "zh" ? "资料不足" : "Insufficient information");
  }
  await expect(page.getByRole("button", { name: /Copy result|复制结果/ })).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/dark-tetrad-sd4`;
  test(`@release Published SD4 ${locale}: hub, keyboard, back edit,28 real responses, exact means, all32sections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const requests = observePrivateRequests(page);
    await page.goto(`/${locale}/tests`); await acceptCookies(page, locale);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "SD4发表版28题 · 四项独立均值" : "Published SD4 28 · Four separate means", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解Mini 18题独立版本" : "Read about the separate Mini 18-item version" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked();
    await finish(page, locale, "mixed");
    await expect(page.getByRole("link", { name: zh ? "了解Mini 18题独立版本" : "Read about the separate Mini 18-item version" })).toHaveAttribute("href", `/${locale}/tests/explore/dark-triad`);
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-sd4-mean]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(requests).toEqual([]);
  });

  test(`@release Published SD4 ${locale}: stale drafts are not read and refresh or language navigation loses the in-memory attempt`, async ({ page }) => {
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:dark-tetrad-sd4", touches: string[] = [];
      const originalSet = Storage.prototype.setItem;
      originalSet.call(sessionStorage, key, JSON.stringify({ version: "0.1.0-preview-web.1", savedAt: Date.now(), answers: { SD4_001: "5" } }));
      (window as Window & { darkStorageTouches?: string[] }).darkStorageTouches = touches;
      const get = Storage.prototype.getItem, remove = Storage.prototype.removeItem;
      Storage.prototype.getItem = function(k) { if (k === key) { touches.push("get"); throw new Error("synthetic storage denial"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k === key) { touches.push("set"); throw new Error("synthetic storage denial"); } return originalSet.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (k === key) { touches.push("remove"); throw new Error("synthetic storage denial"); } return remove.call(this, k); };
    });
    await page.goto(entry); await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="5"]')).not.toBeChecked();
    await page.locator('input[value="4"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    expect(await page.evaluate(() => (window as Window & { darkStorageTouches?: string[] }).darkStorageTouches)).toEqual([]);
    await page.reload(); await expect(page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="5"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/dark-tetrad-sd4`);
    await expect(page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="5"]')).not.toBeChecked();
    expect(await page.evaluate(() => (window as Window & { darkStorageTouches?: string[] }).darkStorageTouches)).toEqual([]);
  });

  test(`@release Published SD4 ${locale}: all-skipped is finished without means, with all32sections and no result sharing or flow analytics`, async ({ page }) => {
    const requests = observePrivateRequests(page); await page.goto(entry); await acceptCookies(page, locale);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "na");
    await expect(page.getByRole("heading", { level: 3, name: zh ? "四份说明已完整开放，可以在这里结束" : "All four guides are open. You may finish here.", exact: true })).toBeVisible();
    await page.waitForTimeout(250); expect(requests).toEqual([]);
  });
}

test("@release Published SD4 all8 public full guides, bilingual images and closed identities", async ({ page, request }) => {
  const requests = observePrivateRequests(page);
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/dark-tetrad-sd4/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await acceptCookies(page, locale);
    await expect(page.locator("[data-sd4-mean]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/dark-tetrad-sd4/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/dark-tetrad-sd4#take-test`);
    const image = await request.get(`/og/fun/dark-tetrad-sd4?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/dark-tetrad-sd4/results/dominant-type", "/zh/tests/explore/dark-tetrad-sd4/results/SD4_001", "/en/tests/play/dark-tetrad-sd4"]) expect((await request.get(path)).status()).toBe(404);
  expect(requests).toEqual([]);
});
