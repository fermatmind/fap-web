import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/prakriti-inventory21.json", "utf8")) as Questionnaire;
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
    if (/BPI21_\d{3}|BPI21_NOMINAL_WORKING_ZH|prakriti-inventory21|bpi21_en_working_zh_na_v1|start_test|complete_test|view_result|questionnaire_result_mbti/.test(request.postData() ?? "")) requests.push(request.url());
  });
  return requests;
}
async function finish(page: Page, locale: "en" | "zh", mode: "mixed" | "na" | "one-na") {
  for (const [index, question] of quiz.questions.entries()) {
    const value = mode === "na" || (mode === "one-na" && index === 20) ? "na" : ["vata", "pitta", "kapha"][Math.floor(index / 7)];
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-bpi21-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 20 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-bpi21-record]")).toHaveCount(3); await expect(page.locator("[data-bpi21-profile]")).toHaveCount(3);
  await expect(page.locator("#take-test h4")).toHaveCount(24);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  if (mode === "mixed") {
    for (const key of ["vata", "pitta", "kapha"]) {
      await expect(page.locator(`[data-bpi21-record="${key}"] [data-bpi21-count]`)).toHaveText("7 / 21");
      await expect(page.locator(`[data-bpi21-record="${key}"] [data-bpi21-percentage]`)).toHaveText("33.3%");
    }
  } else {
    await expect(page.locator("[data-bpi21-insufficient]")).toBeVisible(); await expect(page.locator("[data-bpi21-count], [data-bpi21-percentage]")).toHaveCount(0);
    for (const group of quiz.directions) await expect(page.locator(`[data-bpi21-record="${group.id}"]`)).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
  }
  await expect(page.getByRole("button", { name: /Copy result|复制结果/ })).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/prakriti-inventory21`;
  test(`@release Published BPI-21 ${locale}: hub, keyboard, back edit,21 real responses, exact count shares, all24sections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const requests = observePrivateRequests(page);
    await page.goto(`/${locale}/tests`); await acceptCookies(page, locale);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "发表BPI-21 · 工作中译 · 三篇全文免费" : "Published BPI-21 · Working translation · Three full guides free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const firstOrder = await page.getByRole("radio").evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).value));
    await page.locator('input[value="pitta"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="pitta"]')).toBeChecked();
    expect(await page.getByRole("radio").evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).value))).toEqual(firstOrder); expect(firstOrder.at(-1)).toBe("na");
    await finish(page, locale, "mixed");
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-bpi21-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(requests).toEqual([]);
  });

  test(`@release Published BPI-21 ${locale}: delayed scripts accept the first start, stale drafts are not read and refresh or language navigation loses the in-memory attempt`, async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async route => { await new Promise(resolve => setTimeout(resolve, 250)); await route.continue(); });
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:prakriti-inventory21", touches: string[] = [];
      const originalSet = Storage.prototype.setItem;
      originalSet.call(sessionStorage, key, JSON.stringify({ version: "bpi21_en_working_zh_na_v1", savedAt: Date.now(), answers: { BPI21_001: "kapha" } }));
      (window as Window & { bpi21StorageTouches?: string[] }).bpi21StorageTouches = touches;
      const get = Storage.prototype.getItem, remove = Storage.prototype.removeItem;
      Storage.prototype.getItem = function(k) { if (k === key) { touches.push("get"); throw new Error("synthetic storage denial"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k === key) { touches.push("set"); throw new Error("synthetic storage denial"); } return originalSet.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (k === key) { touches.push("remove"); throw new Error("synthetic storage denial"); } return remove.call(this, k); };
    });
    await page.goto(entry); await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="kapha"]')).not.toBeChecked();
    await page.locator('input[value="pitta"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    expect(await page.evaluate(() => (window as Window & { bpi21StorageTouches?: string[] }).bpi21StorageTouches)).toEqual([]);
    await page.reload(); await expect(page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="pitta"]')).not.toBeChecked();
    await page.locator('input[value="kapha"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/prakriti-inventory21`);
    await expect(page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true })).toBeVisible();
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="kapha"]')).not.toBeChecked();
    expect(await page.evaluate(() => (window as Window & { bpi21StorageTouches?: string[] }).bpi21StorageTouches)).toEqual([]);
  });

  test(`@release Published BPI-21 ${locale}: all-skipped is finished without means, with all24sections and no result sharing or flow analytics`, async ({ page }) => {
    const requests = observePrivateRequests(page); await page.goto(entry); await acceptCookies(page, locale);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "na");
    await expect(page.getByRole("heading", { level: 3, name: zh ? "三份说明已完整开放，可以在这里结束" : "All three guides are open. You may finish here.", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "one-na");
    await page.waitForTimeout(250); expect(requests).toEqual([]);
  });
}

test("@release Published BPI-21 all6 public full guides, bilingual images and closed identities", async ({ page, request }) => {
  const requests = observePrivateRequests(page);
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/prakriti-inventory21/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await acceptCookies(page, locale);
    await expect(page.locator("[data-bpi21-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/prakriti-inventory21/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/prakriti-inventory21#take-test`);
    const image = await request.get(`/og/fun/prakriti-inventory21?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/prakriti-inventory21/results/dominant-type", "/zh/tests/explore/prakriti-inventory21/results/BPI21_001", "/en/tests/play/prakriti-inventory21"]) expect((await request.get(path)).status()).toBe(404);
  expect(requests).toEqual([]);
});
