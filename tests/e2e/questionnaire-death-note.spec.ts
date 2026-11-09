import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/death-note.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "light-yagami" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "light-yagami") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index < 23) await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator('input[name="' + next.id + '"]').first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(8);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "light-yagami") {
    await expect(page.locator('[data-archetype-count="light-yagami"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="light-yagami"] h4:visible')).toHaveCount(3);
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] h4:visible`)).toHaveCount(3);
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(8);
    await expect(page.locator("#take-test h4:visible")).toHaveCount(24);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/death-note`;
  test(`@release Death Note fan choices ${locale}: hub, keyboard,24realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /DEATH_NOTE_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.getByTestId("cookie-banner-decline").click(); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "light-yagami");
    const guide = page.locator(`[data-archetype-match="light-yagami"] a[href="${entry}/results/light-yagami"]`);
    await expect(guide).toHaveAttribute("target", "_blank");
    const [tab] = await Promise.all([page.waitForEvent("popup"), guide.click()]);
    await expect(tab).toHaveURL(new RegExp(`${entry}/results/light-yagami$`));
    await tab.close();
    await expect(page.locator('[data-archetype-match="light-yagami"]')).toBeVisible();
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Death Note fan choices ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
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
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:death-note"))).toBeNull();

    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/death-note`);
    await page.getByRole("button", { name: zh ? "Start test" : "开始测试", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Death Note fan choices ${locale}: denied storage, eight-way tie keeps all eight matched previews and private-safe clipboard fallback`, async ({ page }) => {
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
    expect(text).not.toMatch(/DEATH_NOTE_[0-9]{2}|answers|form_code|submission|3\s*\/\s*12|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Death Note fan choices all16public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/death-note/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/death-note/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/death-note#take-test`);
    const image = await request.get(`/og/fun/death-note?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/death-note/results/unknown", "/zh/tests/explore/death-note/results/DEATH_NOTE_01", "/en/tests/play/death-note"]) expect((await request.get(path)).status()).toBe(404);
});
