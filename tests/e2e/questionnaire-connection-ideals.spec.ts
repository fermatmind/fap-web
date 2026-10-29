import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/connection-ideals.json", "utf8")) as Questionnaire;
const fixture = JSON.parse(readFileSync("tests/fixtures/questionnaires/connection-ideals-witnesses.json", "utf8")) as { witnesses: { leaders: string[]; answers: string[]; counts: Record<string, number> }[] };
type Witness = typeof fixture.witnesses[number];
const single = fixture.witnesses.find(x => x.leaders.length === 1)!, allTied = fixture.witnesses.find(x => x.leaders.length === 6)!;
test.beforeEach(async ({ page }) => {
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
    if (/CI_\d{2}|FM_CONNECTION_IDEALS12|connection-ideals|fermatmind_connection_ideals12|start_test|complete_test|view_result|questionnaire_result_mbti/.test(request.postData() ?? "")) requests.push(request.url());
  });
  return requests;
}
async function finish(page: Page, locale: "en" | "zh", witness: Witness) {
  for (const [i, question] of quiz.questions.entries()) {
    const radio = page.locator(`input[name="${question.id}"][value="${witness.answers[i]}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-ci-count]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 11 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-ci-theme]")).toHaveCount(6); await expect(page.locator("[data-ci-profile]")).toHaveCount(witness.leaders.length);
  await expect(page.locator("#take-test h4")).toHaveCount(witness.leaders.length * 8);
  for (const direction of quiz.directions) await expect(page.locator(`[data-ci-theme="${direction.id}"] [data-ci-count]`)).toHaveText(`${witness.counts[direction.id]} / 8`);
  for (const leader of witness.leaders) await expect(page.locator(`[data-ci-profile="${leader}"]`)).toBeVisible();
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator("[data-ci-selection-total]")).toContainText("12");
  await expect(page.getByRole("button", { name: /Copy result|复制结果/ })).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/connection-ideals`;
  test(`@release Connection ideals ${locale}: hub, keyboard, back edit,12 choices, exact counts, complete highest guide and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const requests = observePrivateRequests(page);
    await page.goto(`/${locale}/tests`); await acceptCookies(page, locale);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创连接偏好 · 完整结果免费" : "Original connection reflection · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose a description");
    await page.locator('input[value="B"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await finish(page, locale, single);
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-ci-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(requests).toEqual([]);
  });

  test(`@release Connection ideals ${locale}: delayed scripts accept the first start, stale drafts are untouched and navigation clears progress`, async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async route => { await new Promise(resolve => setTimeout(resolve, 250)); await route.continue(); });
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:connection-ideals", touches: string[] = [];
      const originalSet = Storage.prototype.setItem;
      originalSet.call(sessionStorage, key, JSON.stringify({ version: "fm_connection_ideals12_v1", savedAt: Date.now(), answers: { CI_01: "A" } }));
      (window as Window & { connectionStorageTouches?: string[] }).connectionStorageTouches = touches;
      const get = Storage.prototype.getItem, remove = Storage.prototype.removeItem;
      Storage.prototype.getItem = function(k) { if (k === key) { touches.push("get"); throw new Error("synthetic storage denial"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k === key) { touches.push("set"); throw new Error("synthetic storage denial"); } return originalSet.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (k === key) { touches.push("remove"); throw new Error("synthetic storage denial"); } return remove.call(this, k); };
    });
    await page.goto(entry, { waitUntil: "domcontentloaded" }); await acceptCookies(page, locale);
    await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator('input[value="A"]')).toBeVisible(); await expect(page.locator('input[value="A"]')).not.toBeChecked();
    await page.locator('input[value="C"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    expect(await page.evaluate(() => (window as Window & { connectionStorageTouches?: string[] }).connectionStorageTouches)).toEqual([]);
    await page.reload(); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="C"]')).not.toBeChecked();
    await page.locator('input[value="D"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/connection-ideals`); await acceptCookies(page, other);
    await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="D"]')).not.toBeChecked();
    expect(await page.evaluate(() => (window as Window & { connectionStorageTouches?: string[] }).connectionStorageTouches)).toEqual([]);
  });

  test(`@release Connection ideals ${locale}: six-way tie keeps all48full sections without a sole winner or personal sharing`, async ({ page }) => {
    const requests = observePrivateRequests(page); await page.goto(entry); await acceptCookies(page, locale);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, allTied);
    await expect(page.locator("[data-ci-tied]")).toContainText(zh ? "6个主题最高并列" : "6 themes share the highest count");
    await expect(page.getByRole("link", { name: zh ? "比较六篇公开完整指南" : "Compare all six public full guides", exact: true })).toHaveAttribute("href", `${entry}#questionnaire-results`);
    await expect(page.getByRole("heading", { level: 3, name: zh ? "完整指南已开放，可以在这里结束" : "Your complete guides are open. You may finish here.", exact: true })).toBeVisible();
    await page.waitForTimeout(250); expect(requests).toEqual([]);
  });
}

test("@release Connection ideals all12 public guides, bilingual images and closed identities", async ({ page, request }) => {
  test.setTimeout(180000);
  const requests = observePrivateRequests(page);
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/connection-ideals/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await acceptCookies(page, locale); await expect(page.locator("[data-ci-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/connection-ideals/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/connection-ideals#take-test`);
    const image = await request.get(`/og/fun/connection-ideals?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/connection-ideals/results/face-type", "/zh/tests/explore/connection-ideals/results/CI_01", "/en/tests/play/connection-ideals"]) expect((await request.get(path)).status()).toBe(404);
  expect(requests).toEqual([]);
});
