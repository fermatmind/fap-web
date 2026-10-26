import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/optimism-pessimism.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "high" | "low" | "middle" | "na") {
  for (const [index, question] of quiz.questions.entries()) {
    const value = mode === "na" ? "na" : mode === "middle" ? "1" : mode === "high" ? (question.reverse ? "1" : "5") : (question.reverse ? "5" : "1");
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    if (index < 9) await expect(page.locator("[data-optimism-score]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 9 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "na") {
    await expect(page.locator("[data-optimism-insufficient]")).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
    await expect(page.locator("[data-optimism-score], [data-optimism-match]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: locale === "zh" ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.", exact: true })).toBeVisible();
  } else {
    await expect(page.locator("[data-optimism-total]")).toHaveText(mode === "high" ? "50" : mode === "low" ? "10" : "34");
    await expect(page.locator("[data-optimism-mean]")).toHaveText(mode === "high" ? "5.0" : mode === "low" ? "1.0" : "3.4");
    await expect(page.locator("[data-optimism-match]")).toHaveCount(mode === "middle" ? 2 : 1);
    await expect(page.locator("#take-test h4")).toHaveCount(mode === "middle" ? 18 : 9);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/optimism-pessimism`;
  test(`@release IPIP Optimism ${locale}: hub, keyboard,10realratings, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /IPIP_OPT_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "high");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-optimism-score]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    await finish(page, locale, "low");
    expect(posts).toEqual([]);
  });
  test(`@release IPIP Optimism ${locale}: opted-in tab draft survives reload, language change, edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="2"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload();
    await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked();
    await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/optimism-pessimism`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:optimism-pessimism"))).toBeNull();
  });
  test(`@release IPIP Optimism ${locale}: denied storage, midpoint shows18sections and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    await finish(page, locale, "na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const missingText = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(missingText).toBe(`${quiz.title[locale]}\n${quiz.title[locale]}\nhttps://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await finish(page, locale, "middle");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles.filter(p => ["middle", "upper-middle"].includes(p.id))) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/IPIP_OPT_[0-9]{2}|answers|form_code|submission|[?&](total|mean)|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release IPIP Optimism all10public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/optimism-pessimism/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-optimism-score]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/optimism-pessimism/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/optimism-pessimism#take-test`);
    const image = await request.get(`/og/fun/optimism-pessimism?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/optimism-pessimism/results/unknown", "/zh/tests/explore/optimism-pessimism/results/IPIP_OPT_01", "/en/tests/play/optimism-pessimism"]) expect((await request.get(path)).status()).toBe(404);
});
