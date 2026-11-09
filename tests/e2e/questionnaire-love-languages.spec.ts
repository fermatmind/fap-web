import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { prepareQuestionnaireResultReadings } from "../../lib/questionnaires/result-content/readings";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-languages.json", "utf8")) as Questionnaire;
const readingProfiles = prepareQuestionnaireResultReadings(quiz).profiles;
async function finish(page: Page, locale: "en" | "zh", mode: "high" | "na" | "mixed") {
  for (const [index, question] of quiz.questions.entries()) {
    const value = mode === "na" ? "na" : mode === "high" ? "5" : question.id.startsWith("LL_G_") ? "4" : "2";
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index < 49) await expect(page.locator("[data-affection-facet]")).toHaveCount(0);
    await radio.press("Space");
    const next = quiz.questions[index + 1];
    if (next) await expect(page.locator(`input[name="${next.id}"]`).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-affection-facet]")).toHaveCount(10); await expect(page.locator("[data-affection-profile]")).toHaveCount(5);
  await expect(page.locator("#take-test [data-reading-mode=result] > section h4")).toHaveCount(15);
  await expect(page.locator("#take-test h4")).toHaveCount(readingProfiles.reduce((count, profile) => count + profile.sections.length, 0));
  for (const profile of readingProfiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(page.locator("#take-test")).toContainText(paragraph[locale]);
  for (const direction of quiz.directions) {
    const mean = page.locator(`[data-affection-facet="${direction.id}"] [data-affection-mean]`);
    await expect(mean).toHaveText(mode === "na" ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "high" ? "5.0 / 5" : direction.id.startsWith("giving") ? "4.0 / 5" : "2.0 / 5");
  }
  await expect(page.locator("[data-affection-insufficient]")).toHaveCount(mode === "na" ? 1 : 0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/love-languages`;
  test(`@release Love languages ${locale}: hub, keyboard,50actualratings, ten independent means,readable result previews and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /LL_[GR]_(WORDS|ACTS|GIFTS|TIME|TOUCH)_/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.getByTestId("cookie-banner-decline").click(); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创双向爱语自评 · 完整结果免费" : "Original love-language reflection · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "high");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-affection-facet]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(leaks).toEqual([]);
  });
  test(`@release Love languages ${locale}: refresh and language change start with blank answers`, async ({ page }) => {
    await page.goto(entry);
    await expect(page.getByText(zh ? "这份测试不保存答题进度" : "This quiz does not save your progress", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    const first = await page.locator("legend").first().textContent();
    await page.locator('input[value="2"]').check();
    await expect(page.locator("legend").first()).not.toHaveText(first!);
    await page.reload();
    await expect(page.locator("legend").first()).toHaveText(first!);
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-languages"))).toBeNull();

    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/love-languages`);
    await page.getByRole("button", { name: zh ? "Start test" : "开始测试", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Love languages ${locale}: denied storage/clipboard, unscored and mixed roles retain all full guides with safe share`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByTestId("cookie-banner-decline").click(); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(0); await finish(page, locale, "na");
    await expect(page.getByRole("heading", { level: 3, name: zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "mixed");
    await page.getByRole("button", { name: zh ? "复制公开入口" : "Copy public entry", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]);
    expect(text).not.toMatch(/LL_[GR]_|answers|giving_|receiving_|form_code|4\.0|2\.0|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Love languages all10public full guides, bilingual images and closed identities", async ({ page, request }) => {
  const chineseGuideTitles: Record<string, string> = {
    acts: "行动支持（服务的行动）：给予与接收",
    gifts: "心意礼物（接受礼物）：给予与接收",
    time: "专注陪伴（精心时刻）：给予与接收",
  };
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/love-languages/results/${profile.id}`;
    const guideTitle = (locale === "zh" ? chineseGuideTitles[profile.id] : undefined) ?? profile.title[locale];
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(guideTitle);
    await expect(page.locator("[data-affection-facet]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/love-languages/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/love-languages#take-test`);
    const image = await request.get(`/og/fun/love-languages?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200); const b = await image.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/love-languages/results/unknown", "/zh/tests/explore/love-languages/results/LL_G_WORDS_01", "/en/tests/play/love-languages"]) expect((await request.get(path)).status()).toBe(404);
});
