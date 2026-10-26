import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/egogram.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "patterns" | "na" | "missing-part") {
  const values: Record<string, string> = { "critical-parent": "2", "nurturing-parent": "1", adult: "3", "free-child": "4", "adapted-child": "5" };
  for (const [index, question] of quiz.questions.entries()) {
    const direction = question.options[0].directionId;
    const value = mode === "na" || (mode === "missing-part" && question.id === "EGO_CP_04") ? "na" : mode === "missing-part" ? "4" : question.id === "EGO_CP_01" ? "3" : values[direction];
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (index < 19) await expect(page.locator("[data-ego-facet]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 19 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-ego-legend]")).toBeVisible(); for (const option of quiz.questions[0].options.slice(0, 5)) await expect(page.locator("[data-ego-legend]")).toContainText(`${option.id}${locale === "zh" ? "" : " "}${option.label[locale]}`);
  await expect(page.locator("[data-ego-facet]")).toHaveCount(5); await expect(page.locator("[data-ego-profile]")).toHaveCount(5); await expect(page.locator("#take-test h4")).toHaveCount(45);
  for (const direction of quiz.directions) {
    const section = page.locator(`[data-ego-facet="${direction.id}"]`), unscored = mode === "na" || (mode === "missing-part" && direction.id === "critical-parent");
    const mean = mode === "missing-part" ? 4 : direction.id === "critical-parent" ? 2.25 : Number(values[direction.id]);
    await expect(section.locator("[data-ego-mean]")).toHaveText(unscored ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`);
    await expect(section.locator("[data-ego-total]")).toHaveText(unscored ? (locale === "zh" ? "资料不足" : "Insufficient information") : String(mean * 4));
  }
  if (mode === "missing-part") await expect(page.locator('[data-ego-facet="critical-parent"]')).toContainText(locale === "zh" ? "3 / 4条有效" : "3 / 4 rated frequency items");
  await expect(page.locator("[data-ego-insufficient]")).toHaveCount(mode === "na" ? 5 : mode === "missing-part" ? 1 : 0); await expect(page.locator("[data-ego-bar]")).toHaveCount(mode === "na" ? 0 : mode === "missing-part" ? 4 : 5);
  await expect(page.locator("[data-facet-score], [data-social-facet]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/egogram`;
  test(`@release Five Egogram frequency reflections ${locale}: hub, keyboard,20actualfrequencyitems with0reversals, rawtotalandmean,9fullsections and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /EGO_[A-Z]{1,2}_[0-9]{2}/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创五组互动观察 · 完整结果免费" : "Original reflection on five interaction stances · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "patterns");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-ego-facet]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release Five Egogram frequency reflections ${locale}: opted-in draft survives reload, language, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/egogram`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:egogram"))).toBeNull();
  });
  test(`@release Five Egogram frequency reflections ${locale}: denied storage/clipboard, unscored and onegroupthreeof4rated retain the full continuum with safe share`, async ({ page }) => {
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
    expect(text).not.toMatch(/EGO_|answers|form_code|\d+\.\d+\s*\/\s*5|\d+\s*\/\s*4|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Five Egogram frequency reflections all10public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/egogram/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-ego-facet]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/egogram/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/egogram#take-test`);
    const image = await request.get(`/og/fun/egogram?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200); const b = await image.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/egogram/results/unknown", "/zh/tests/explore/egogram/results/EGO_CP_01", "/en/tests/play/egogram"]) expect((await request.get(path)).status()).toBe(404);
});
