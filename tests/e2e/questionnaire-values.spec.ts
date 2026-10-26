import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/values.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "patterns" | "na" | "missing-part") {
  const scores: Record<string, string> = { "self-direction": "5", "stimulation": "4", "hedonism": "3", "achievement": "2", "power": "1", "security": "5", "conformity": "4", "tradition": "3", "benevolence": "2", "universalism": "1" };
  for (const [index, question] of quiz.questions.entries()) {
    const pattern = question.options[0].directionId;
    const selected = mode === "na" || (mode === "missing-part" && pattern === "universalism") ? "na" : mode === "missing-part" ? "4" : scores[pattern];
    const value = selected === "na" ? selected : question.reverse ? String(6 - Number(selected)) : selected;
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (index < 29) await expect(page.locator("[data-values-facet]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 29 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-values-facet]")).toHaveCount(10); await expect(page.locator("[data-values-profile]")).toHaveCount(10);
  await expect(page.locator("#take-test h4")).toHaveCount(90);
  for (const direction of quiz.directions) {
    const mean = page.locator(`[data-values-facet="${direction.id}"] [data-values-mean]`);
    const unscored = mode === "na" || (mode === "missing-part" && direction.id === "universalism");
    await expect(mean).toHaveText(unscored ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "missing-part" ? "4.00 / 5" : `${scores[direction.id]}.00 / 5`);
  }
  await expect(page.locator("[data-values-baseline]")).toHaveText(mode === "patterns" ? "3.00" : (locale === "zh" ? "资料不足" : "Insufficient information"));
  for (const direction of quiz.directions) await expect(page.locator(`[data-values-facet="${direction.id}"] [data-values-relative]`)).toHaveText(mode === "patterns" ? `${Number(scores[direction.id]) > 3 ? "+" : ""}${(Number(scores[direction.id]) - 3).toFixed(2)}` : (locale === "zh" ? "资料不足" : "Insufficient information"));
  await expect(page.locator("[data-values-insufficient]")).toHaveCount(mode === "na" ? 1 : 0);
  await expect(page.locator("[data-facet-score], [data-procrastination-facet], [data-friction-facet], [data-pps-facet], [data-music-facet], [data-humor-facet], [data-communication-facet], [data-attachment-axis]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/values`;
  test(`@release Schwartz original ten value goals ${locale}: hub, keyboard,30actualimportanceratings with0reverse, ten means,90fullsections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /FM_VALUES_/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创价值目标反思 · 完整结果免费" : "Original value reflection · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "patterns");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-values-facet]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release Schwartz original ten value goals ${locale}: opted-in draft survives reload, language, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/values`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:values"))).toBeNull();
  });
  test(`@release Schwartz original ten value goals ${locale}: denied storage/clipboard, unscored and one missing pattern retain all full guides with safe share`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, "na");
    await expect(page.getByRole("heading", { level: 3, name: zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "missing-part");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]);
    expect(text).not.toMatch(/FM_VALUES_|answers|form_code|5\.0|4\.0|3\.0|2\.0|1\.0|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Schwartz original ten value goals all20public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/values/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-values-facet]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/values/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/values#take-test`);
    const image = await request.get(`/og/fun/values?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200); const b = await image.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/values/results/unknown", "/zh/tests/explore/values/results/FM_VALUES_01", "/en/tests/play/values"]) expect((await request.get(path)).status()).toBe(404);
});
