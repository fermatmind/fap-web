import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/disney-princess.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "snow-white" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "snow-white") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index < 25) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator('input[name="' + next.id + '"]').first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(13);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "snow-white") {
    await expect(page.locator('[data-archetype-count="snow-white"]')).toContainText("8 / 8");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="snow-white"] h4:visible')).toHaveCount(3);
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("2 / 8");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4:visible`)).toHaveCount(3);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(13);
    await expect(page.locator("#take-test h4:visible")).toHaveCount(39);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/disney-princess`;
  test(`@release Disney Princess fan choices ${locale}: hub, keyboard,26realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /PRINCESS_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.getByTestId("cookie-banner-decline").click(); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "snow-white");
    const guide = page.locator(`[data-archetype-match="snow-white"] a[href="${entry}/results/snow-white"]`);
    await expect(guide).toHaveAttribute("target", "_blank");
    const [tab] = await Promise.all([page.waitForEvent("popup"), guide.click()]);
    await expect(tab).toHaveURL(new RegExp(`${entry}/results/snow-white$`));
    await tab.close();
    await expect(page.locator('[data-archetype-match="snow-white"]')).toBeVisible();
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Disney Princess fan choices ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
    await page.goto(entry);
    await expect(page.getByText(zh ? "这份测试不保存答题进度" : "This quiz does not save your progress", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const first = await page.locator("legend").first().textContent();
    await page.locator('input[value="B"]').check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("legend").first()).not.toHaveText(first!);
    await page.reload();
    await expect(page.locator("legend").first()).toHaveText(first!);
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:disney-princess"))).toBeNull();

    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/disney-princess`);
    await page.getByRole("button", { name: zh ? "Start test" : "开始测试", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Disney Princess fan choices ${locale}: denied storage, thirteen-way tie keeps all 13 matched previews and private-safe clipboard fallback`, async ({ page }) => {
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
    expect(text).not.toMatch(/PRINCESS_[0-9]{2}|answers|form_code|submission|2\s*\/\s*8|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Disney Princess fan choices all26public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/disney-princess/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/disney-princess/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/disney-princess#take-test`);
    const image = await request.get(`/og/fun/disney-princess?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/disney-princess/results/unknown", "/zh/tests/explore/disney-princess/results/PRINCESS_01", "/en/tests/play/disney-princess"]) expect((await request.get(path)).status()).toBe(404);
});
