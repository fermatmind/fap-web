import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync(path.join(process.cwd(), "lib/questionnaires/data/social-battery-test.json"), "utf8")) as Questionnaire;
const facetItems = [[0, 4, 8, 12, 16], [1, 5, 9, 13, 17], [2, 6, 10, 14, 18], [3, 7, 11, 15, 19]];
const reversed = new Set([8, 9, 10, 11, 16, 17, 18, 19]);
async function finish(page: Page, locale: "en" | "zh", mode: "mixed" | "na") {
  for (const [index, question] of quiz.questions.entries()) {
    const facet = index % 4, position = facetItems[facet].indexOf(index);
    const na = mode === "na" || (facet === 2 && position >= 3) || (facet === 3 && position < 3);
    const target = [5, 4, 3, 2][facet];
    const value = na ? "na" : String(reversed.has(index) ? 6 - target : target);
    const radio = page.locator(`input[name="${question.id}"][value="${value}"]`);
    await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: locale === "zh" ? `${quiz.title.zh}：完整结果` : `${quiz.title.en}: your complete result`, exact: true })).toBeFocused();
  const expected = mode === "na" ? [null, null, null, null] : [5, 4, 3, null];
  for (const [index, direction] of quiz.directions.entries()) {
    const cell = page.locator(`[data-facet-score="${direction.id}"]`);
    if (expected[index] === null) await expect(cell).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
    else await expect(cell).toContainText(`${expected[index]!.toFixed(1)} / 5`);
    for (const section of quiz.profiles[index].sections) await expect(page.locator(`#report-${quiz.profiles[index].id}-${section.id}`)).toBeAttached();
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/social-battery-test`;
  test(`@release Social battery ${locale}: complete20responses, independent means, missing facet, full reports and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const answerPosts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /SB_[0-9]{2}/.test(request.postData() ?? "")) answerPosts.push(request.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("html")).toHaveAttribute("lang", zh ? /zh/ : "en");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    const cookieBanner = page.locator("[data-cookie-banner]");
    await expect(cookieBanner).toHaveCSS("position", "fixed");
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await expect(cookieBanner).toBeVisible();
    await finish(page, locale, "mixed");
    await expect(page.locator('[data-facet-score="quiet-recovery"]')).toContainText("3/5");
    await expect(page.locator('[data-facet-score="easy-company"]')).toContainText("2/5");
    await expect(page.locator("[data-archetype-honor-card]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await expect(page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true })).toBeDisabled();
    expect(answerPosts).toEqual([]);
  });

  test(`@release Social battery ${locale}: back and edit, reload, language change and exit clear private answers`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = locale === "en" ? "zh" : "en";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    const first = page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
    await expect(first.first()).toBeVisible({ timeout: 30000 });
    await expect(first.and(page.getByRole("radio", { checked: true }))).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });

  test(`@release Social battery ${locale}: denied storage, allNA safe result and clipboard fallback expose no answers or means`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "share", { configurable: true, value: undefined }); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "na");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/SB_[0-9]{2}|submission|answers|form_code|mean|score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Social battery public guides, closed identities and bilingual images", async ({ request, page }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/social-battery-test/results/${profile.id}`;
    const response = await page.goto(path); expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-facet-score]")).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/social-battery-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/social-battery-test#take-test`);
    const image = await request.get(`/og/fun/social-battery-test?locale=${locale}&portrait=${profile.id}&v=1.0.0`);
    expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/social-battery-test/results/unknown", "/zh/tests/explore/social-battery-test/results/SB_01", "/en/tests/play/social-battery-test"]) expect((await request.get(path)).status()).toBe(404);
});
