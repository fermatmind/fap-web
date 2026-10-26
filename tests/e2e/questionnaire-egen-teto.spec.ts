import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/egen-teto.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
async function finish(page: Page, locale: "en" | "zh", mode: "egen" | "teto" | "tie") {
  for (const [i, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === mode)!;
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("#take-test dl")).toHaveCount(0);
    await page.getByRole("button", { name: i === 17 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  const profile = quiz.profiles.find(p => p.id === mode)!;
  await expect(page.getByRole("heading", { level: 2, name: profile.title[locale], exact: true })).toBeFocused();
  await expect(page.locator("#take-test dl dd")).toHaveText(mode === "tie" ? ["9 / 18", "9 / 18"] : mode === "egen" ? ["18 / 18", "0 / 18"] : ["0 / 18", "18 / 18"]);
  await expect(page.locator("#take-test article h3")).toHaveCount(9);
  for (const section of profile.sections) await expect(page.locator(`#take-test #report-${section.id}`)).toContainText(section.paragraphs[0][locale]);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/egen-teto`;
  test(`@release Egen-Teto ${locale}: hub, keyboard,18realchoices, full nine-section result and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: /Explore MBTI|了解MBTI/ })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "egen");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toBeVisible();
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("#take-test dl")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "teto");
  });
  test(`@release Egen-Teto ${locale}: opted-in tab draft survives refresh, language change, back edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="B"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await expect(page.locator('input[name="ET_02"]')).toHaveCount(2);
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/egen-teto`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.locator('input[value="A"]').check(); await page.getByRole("button", { name: other === "zh" ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="A"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:egen-teto"))).toBeNull();
    await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0);
  });
  test(`@release Egen-Teto ${locale}: denied storage, equal9counts,9fulltiesections and private-safe copy fallback`, async ({ page }) => {
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
    expect(text).toContain(quiz.profiles.find(p => p.id === "tie")!.title[locale]); expect(text).toContain(`https://fermatmind.com${entry}/results/tie`);
    expect(text).not.toMatch(/ET_\d{2}|answers|9 \/ 18|qa|session_id/i); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release Egen-Teto all6public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const publicPath = `/${locale}/tests/explore/egen-teto/results/${profile.id}`;
    expect((await page.goto(publicPath, { waitUntil: "domcontentloaded" }))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator('section[aria-label="Raw choice counts for this attempt"], section[aria-label="本次原始选择次数"]')).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/egen-teto/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/egen-teto#take-test`);
    const image = await request.get(`/og/fun/egen-teto?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/egen-teto/results/egen-nyeo", "/zh/tests/explore/egen-teto/results/ET_01", "/en/tests/play/egen-teto"]) expect((await request.get(path)).status()).toBe(404);
});
