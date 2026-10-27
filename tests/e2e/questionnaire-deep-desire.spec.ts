import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/deep-desire.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "na" | "one-na") {
  for (const [i, question] of quiz.questions.entries()) {
    const value = mode === "na" || (mode === "one-na" && i === 3) ? "na" : String([2, 4, 3, 4][i % 4]);
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (i < 23) await expect(page.locator("[data-deep-desire-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 23 ? "查看完整结果" : "下一题") : (i === 23 ? "See full result" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-deep-desire-part]")).toHaveCount(6);
  for (const direction of quiz.directions) {
    const part = page.locator(`[data-deep-desire-part="${direction.id}"]`), missing = mode === "na" || (mode === "one-na" && direction.id === "autonomy");
    await expect(part.locator("[data-deep-desire-mean]")).toContainText(missing ? (locale === "zh" ? "资料不足" : "Insufficient information") : "3.25 / 5");
    await expect(part.locator("[data-deep-desire-sum]")).toHaveCount(missing ? 0 : 1);
    const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
    for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(part.getByText(paragraph[locale], { exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-facet-score], [data-pps-facet], [data-compassion-overview]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/deep-desire`;
  test(`@release mini DEEP_DESIRE ${locale}: real24questions, exactquartermeans, sixfullguides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /DESIRE_LK_[0-9]{3}/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]'); await expect(method.locator("p")).toHaveCount(3);
    for (const section of quiz.guide.slice(0, 3)) for (const paragraph of section.paragraphs) await expect(method.getByText(paragraph[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const first = await page.getByRole("heading", { level: 2, name: quiz.questions[0].prompt[locale], exact: true }).boundingBox(); expect(first).not.toBeNull(); expect(first!.y).toBeGreaterThanOrEqual(0); expect(first!.y).toBeLessThan(420);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "worked"); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-deep-desire-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release mini DEEP_DESIRE ${locale}: opt-in24h tabdraft survives reload and language; edit and explicitclear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/deep-desire`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:deep-desire"))).toBeNull();
  });
  test(`@release mini DEEP_DESIRE ${locale}: storage andclipboard denied; allNA/oneNA stillcompletewithpubliconlycopy`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, "na");
    await expect(page.locator("[data-deep-desire-next-steps] h2")).toHaveText(zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "one-na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/DESIRE_LK_|answers|3\.25|form_code|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release mini DEEP_DESIRE all12fullguidesand14images, stableclosedpublicidentities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/deep-desire/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator("[data-deep-desire-mean]")).toHaveCount(0);
      for (const section of profile.sections) { await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(page.getByText(paragraph[locale], { exact: true })).toBeVisible(); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/deep-desire#take-test`);
    }
    for (const profile of [null, ...quiz.profiles]) { const r = await request.get(`/og/fun/deep-desire?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`); expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630); }
  }
  for (const path of ["/en/tests/explore/deep-desire/results/unknown", "/zh/tests/explore/deep-desire/results/DESIRE_LK_001", "/en/tests/play/deep-desire"]) expect((await request.get(path)).status()).toBe(404);
});
