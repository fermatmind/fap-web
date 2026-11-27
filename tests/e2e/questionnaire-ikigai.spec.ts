import { isArchivedEntertainmentPath } from "../../lib/seo/discoverabilityExposurePolicy";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/ikigai.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "passion" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "passion") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(4);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "passion") {
    await expect(page.locator('[data-archetype-count="passion"]')).toContainText("16 / 16");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
    await expect(page.locator(`[data-archetype-match="passion"] a[href="/${locale}/tests/explore/${quiz.slug}/results/passion"]`)).toBeVisible();
  } else {
    for (const theme of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("4 / 16");
      await expect(page.locator(`[data-archetype-match="${theme.id}"] a[href="/${locale}/tests/explore/${quiz.slug}/results/${theme.id}"]`)).toBeVisible();
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(4);
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/ikigai`;
  test(`@release Four overlap exploration ${locale}: hub, keyboard,16realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /IKIGAI_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.getByText(zh ? "原创四组交叠探索 · 完整结果免费" : "Original four-overlap exploration · Full results free", { exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "passion");
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveAttribute("href", /target_action=questionnaire_result_mbti/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Four overlap exploration ${locale}: edit locally, then clear answers when refreshing, changing language or leaving`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });
  test(`@release Four overlap exploration ${locale}: denied storage, four-way tie preserves all guide links and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
    expect(text).not.toMatch(/IKIGAI_[0-9]{2}|answers|form_code|submission|\d+\s*\/\s*16|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Four overlap exploration all8public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/ikigai/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    if (isArchivedEntertainmentPath(path)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/u);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    } else {
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/ikigai/results/${profile.id}`);
    }
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/ikigai#take-test`);
    const image = await request.get(`/og/fun/ikigai?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/ikigai/results/unknown", "/zh/tests/explore/ikigai/results/IKIGAI_01", "/en/tests/play/ikigai"]) expect((await request.get(path)).status()).toBe(404);
});
