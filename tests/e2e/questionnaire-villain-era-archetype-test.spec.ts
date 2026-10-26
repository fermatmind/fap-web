import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/villain-era-archetype-test.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
async function finish(page: Page, locale: "en" | "zh", mode: "planner" | "tie") {
  for (const [i, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "scene-planner") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 17 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(6);
  if (mode === "planner") {
    await expect(page.locator('[data-archetype-count="scene-planner"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator('[data-archetype-match="scene-planner"] h4')).toHaveCount(9);
  } else {
    await expect(page.locator("[data-archetype-match]")).toHaveCount(6); await expect(page.locator("#take-test h4")).toHaveCount(54);
    for (const direction of quiz.directions) await expect(page.locator(`[data-archetype-count="${direction.id}"]`)).toContainText("3 / 12");
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/villain-era-archetype-test`;
  test(`@release Villain era ${locale}: hub, keyboard,18realchoices, full nine-section result and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: /Explore MBTI|了解MBTI/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "planner");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toBeVisible();
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Villain era ${locale}: opted-in tab draft survives refresh, language change, back edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await expect(page.locator('input[name="VERA_02"]')).toHaveCount(4);
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/villain-era-archetype-test`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.locator('input[value="C"]').check(); await page.getByRole("button", { name: other === "zh" ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="C"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:villain-era-archetype-test"))).toBeNull();
    await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
  });
  test(`@release Villain era ${locale}: denied storage, all six highest ties,54sections and private-safe copy fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("synthetic denial"); };
      Storage.prototype.setItem = () => { throw new Error("synthetic denial"); };
      Storage.prototype.removeItem = () => { throw new Error("synthetic denial"); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("synthetic clipboard denial")) } });
    });
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(entry);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.getByRole("checkbox").check();
    await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const copy = page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }); await expect(copy).toBeVisible(); const text = await copy.inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]); expect(text).toContain(`https://fermatmind.com${entry}`);
    expect(text).not.toMatch(/VERA_\d{2}|answers|3 \/ 12|qa|session_id/i); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release Villain era all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const publicPath = `/${locale}/tests/explore/villain-era-archetype-test/results/${profile.id}`;
    expect((await page.goto(publicPath, { waitUntil: "domcontentloaded" }))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/villain-era-archetype-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/villain-era-archetype-test#take-test`);
    const image = await request.get(`/og/fun/villain-era-archetype-test?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/villain-era-archetype-test/results/mastermind", "/zh/tests/explore/villain-era-archetype-test/results/VERA_01", "/en/tests/play/villain-era-archetype-test"]) expect((await request.get(path)).status()).toBe(404);
});
