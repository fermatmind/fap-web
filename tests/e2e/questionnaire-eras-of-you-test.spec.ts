import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/questionnaires/data/eras-of-you-test.json"), "utf8")) as Questionnaire;
const facetItems = [[0, 6, 12, 18], [1, 7, 13, 19], [2, 8, 14, 20], [3, 9, 15, 21], [4, 10, 16, 22], [5, 11, 17, 23]];
const reversed = new Set<number>();
test.beforeEach(async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
async function headingBelowHeader(page: Page) {
  await expect.poll(async () => page.locator("#take-test h2").evaluate(heading =>
    heading.getBoundingClientRect().top >= (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0)
  )).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "mixed" | "na") {
  for (const [index, question] of quiz.questions.entries()) {
    if (index > 0) await headingBelowHeader(page);
    const facet = index % 6, position = facetItems[facet].indexOf(index);
    const na = mode === "na" || (facet === 2 && position >= 3) || (facet === 3 && position < 2);
    const target = [5, 4, 3, 2, 1, 5][facet];
    const value = na ? "na" : String(reversed.has(index) ? 6 - target : target);
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    if (index < 23) await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 23 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await headingBelowHeader(page);
  const expected = mode === "na" ? [null, null, null, null, null, null] : [5, 4, 3, null, 1, 5];
  for (const [index, direction] of quiz.directions.entries()) {
    const cell = page.locator(`[data-facet-score="${direction.id}"]`);
    if (expected[index] === null) await expect(cell).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
    else await expect(cell).toContainText(`${expected[index]!.toFixed(1)} / 5`);
    for (const section of quiz.profiles[index].sections) await expect(page.locator(`#report-${quiz.profiles[index].id}-${section.id}`)).toBeAttached();
  }
  await expect(page.locator("#take-test h4")).toHaveCount(54);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/eras-of-you-test`;
  test(`@release Current chapter ${locale}: complete24responses, independent means, missing facet, full reports and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const answerPosts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /ERA_[0-9]{2}/.test(request.postData() ?? "")) answerPosts.push(request.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("html")).toHaveAttribute("lang", zh ? /zh/ : "en");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "mixed");
    await expect(page.locator('[data-facet-score="keeping-rhythm"]')).toContainText("3/4");
    await expect(page.locator('[data-facet-score="changing-arrangement"]')).toContainText("2/4");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true })).toBeDisabled();
    expect(answerPosts).toEqual([]);
  });

  test(`@release Current chapter ${locale}: opted-in NA draft survives reload, language change, back/edit and clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[value="na"]').check(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="na"]')).toBeChecked();
    await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/eras-of-you-test`);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click();
    await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:eras-of-you-test"))).toBeNull();
  });

  test(`@release Current chapter ${locale}: denied storage, allNA safe result and clipboard fallback expose no answers or means`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("checkbox").check();
    await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save");
    await finish(page, locale, "na");
    await expect(page.getByRole("heading", { name: zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.", exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/ERA_[0-9]{2}|submission|answers|form_code|mean|score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Current chapter public guides, closed identities and bilingual images", async ({ request, page }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/eras-of-you-test/results/${profile.id}`;
    const response = await page.goto(path); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/eras-of-you-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/eras-of-you-test#take-test`);
    const image = await request.get(`/og/fun/eras-of-you-test?locale=${locale}&portrait=${profile.id}&v=1.0.0`);
    expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/eras-of-you-test/results/unknown", "/zh/tests/explore/eras-of-you-test/results/ERA_01", "/en/tests/play/eras-of-you-test"]) expect((await request.get(path)).status()).toBe(404);
});
