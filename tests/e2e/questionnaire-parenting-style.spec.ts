import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/parenting-style.json", "utf8")) as Questionnaire;
const worked = [4, 2, 3, 5, 2, 4, 3, 4, 2, 3, 5, 1];
async function finish(page: Page, locale: "en" | "zh", mode: "worked" | "na" | "one-na") {
  for (const [i, question] of quiz.questions.entries()) {
    const value = mode === "na" || (mode === "one-na" && i === 3) ? "na" : String(worked[i]);
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (i < 11) await expect(page.locator("[data-parenting-practices-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 11 ? "查看完整结果" : "下一题") : (i === 11 ? "See full result" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-parenting-practices-part]")).toHaveCount(2);
  for (const direction of quiz.directions) {
    const part = page.locator(`[data-parenting-practices-part="${direction.id}"]`);
    const missing = mode === "na" || (mode === "one-na" && direction.id === "warm-response");
    await expect(part.locator("[data-parenting-practices-mean]")).toContainText(missing
      ? (locale === "zh" ? "资料不足" : "Insufficient information") : direction.id === "warm-response" ? "3.3 / 5" : "3.0 / 5");
  }
  await expect(page.locator("[data-parenting-practices-guide]")).toHaveCount(4);
  for (const profile of quiz.profiles) {
    const guide = page.locator(`[data-parenting-practices-guide="${profile.id}"]`);
    await expect(guide.locator("h3")).toHaveText(profile.title[locale]);
    for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(guide.getByText(paragraph[locale], { exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-facet-score], [data-pps-facet], [data-compassion-overview]")).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/parenting-style`;
  test(`@release parenting ${locale}: real12responses, separate20/18means, allfourfullguides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /PCARE_[0-9]{2}/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    const method = page.locator('section[aria-labelledby="questionnaire-method"]'); await expect(method.locator("p")).toHaveCount(5);
    for (const section of quiz.guide) for (const paragraph of section.paragraphs) await expect(method.getByText(paragraph[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const first = await page.getByRole("heading", { level: 2, name: quiz.questions[0].prompt[locale], exact: true }).boundingBox(); expect(first).not.toBeNull(); expect(first!.y).toBeGreaterThanOrEqual(0); expect(first!.y).toBeLessThan(420);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "worked"); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-parenting-practices-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release parenting ${locale}: opt-in24h tabdraft survives reload and language; edit and explicitclear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/parenting-style`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:parenting-style"))).toBeNull();
  });
  test(`@release parenting ${locale}: denied storage andclipboard; allNA/oneNA complete with generalguides and publiconlycopy`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, "na");
    await expect(page.locator("[data-parenting-practices-next-steps] h2")).toContainText(zh ? "本次作答已结束" : "This attempt is finished");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "one-na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/PCARE_|answers|3\.3|3\.0|form_code|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release parenting all8fullguidesand10images, stableclosedpublicidentities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/parenting-style/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator("[data-parenting-practices-mean]")).toHaveCount(0);
      for (const section of profile.sections) { await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(page.getByText(paragraph[locale], { exact: true })).toBeVisible(); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/parenting-style#take-test`);
    }
    for (const profile of [null, ...quiz.profiles]) { const r = await request.get(`/og/fun/parenting-style?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`); expect(r.status()).toBe(200); const b = await r.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630); }
  }
  for (const path of ["/en/tests/explore/parenting-style/results/unknown", "/zh/tests/explore/parenting-style/results/PCARE_01", "/en/tests/play/parenting-style"]) expect((await request.get(path)).status()).toBe(404);
});
