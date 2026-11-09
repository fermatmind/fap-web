import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/travel-personality-test.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "planner" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "planner") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index < 17) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator('input[name="' + next.id + '"]').first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(6);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "planner") {
    await expect(page.locator('[data-archetype-count="planner"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="planner"] h4:visible')).toHaveCount(3);
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4:visible`)).toHaveCount(3);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(6);
    await expect(page.locator("#take-test h4:visible")).toHaveCount(18);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/travel-personality-test`;
  test(`@release Travel preferences ${locale}: hub, keyboard,18realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /TRAVEL_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.getByTestId("cookie-banner-decline").click(); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创旅行偏好自评 · 完整结果免费" : "Original travel reflection · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "planner");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Travel preferences ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
    await page.goto(entry);
    await expect(page.getByText(zh ? "这份测试不保存答题进度" : "This quiz does not save your progress", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const first = await page.locator("legend").first().textContent();
    await page.locator('input[value="B"]').check();
    await expect(page.locator("legend").first()).not.toHaveText(first!);
    await page.reload();
    await expect(page.locator("legend").first()).toHaveText(first!);
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:travel-personality-test"))).toBeNull();

    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/travel-personality-test`);
    await page.getByRole("button", { name: zh ? "Start test" : "开始测试", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Travel preferences ${locale}: denied storage, six-way tie keeps all six previews and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByTestId("cookie-banner-decline").click(); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/TRAVEL_[0-9]{2}|answers|form_code|submission|6\s*\/\s*24|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Travel preferences all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/travel-personality-test/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/travel-personality-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/travel-personality-test#take-test`);
    const image = await request.get(`/og/fun/travel-personality-test?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/travel-personality-test/results/unknown", "/zh/tests/explore/travel-personality-test/results/TRAVEL_01", "/en/tests/play/travel-personality-test"]) expect((await request.get(path)).status()).toBe(404);
});
