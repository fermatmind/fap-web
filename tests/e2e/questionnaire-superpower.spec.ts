import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/superpower-test.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "telepathy" | "tie") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "telepathy") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(5);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  if (mode === "telepathy") {
    await expect(page.locator('[data-archetype-count="telepathy"]')).toContainText("16 / 16");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
  } else {
    for (const power of quiz.directions) {
      await expect(page.locator(`[data-archetype-count="${power.id}"]`)).toContainText("4 / 16");
    }
    await expect(page.locator("[data-archetype-match]")).toHaveCount(5);
  }
  const matched = mode === "tie" ? quiz.profiles : quiz.profiles.filter(profile => profile.id === "telepathy");
  for (const profile of matched) {
    await expect(page.locator(`[data-archetype-match="${profile.id}"] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/superpower-test`;
  test(`@release Superpower ${locale}: hub, keyboard,20realchoices, full unique match and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /POWER_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions" })).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "telepathy");
    await expect(page.locator(`[data-archetype-core-assessment="RIASEC"] a[href="/${locale}/tests/holland-career-interest-test-riasec"]`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
    expect(posts).toEqual([]);
  });
  test(`@release Superpower ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:superpower-test"))).toBeNull();
  });
  test(`@release Superpower ${locale}: denied storage, five-way tie retains every public guide and private-safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
    await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale].split(/[：:]/u)[0]);
    expect(text).not.toMatch(/POWER_[0-9]{2}|answers|form_code|submission|4\s*\/\s*16|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}

test("@release Superpower all10public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/superpower-test/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/superpower-test/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/superpower-test#take-test`);
    const image = await request.get(`/og/fun/superpower-test?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/superpower-test/results/unknown", "/zh/tests/explore/superpower-test/results/POWER_01", "/en/tests/play/superpower-test"]) expect((await request.get(path)).status()).toBe(404);
});
