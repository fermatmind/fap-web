import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/decade-aesthetic-test.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
async function finish(page: Page, locale: "en" | "zh", mode: "deco" | "tie") {
  for (const [i, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "deco-1920s") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(6);
  if (mode === "deco") {
    await expect(page.locator('[data-archetype-count="deco-1920s"]')).toContainText("12 / 12");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
  } else {

    for (const direction of quiz.directions) await expect(page.locator(`[data-archetype-count="${direction.id}"]`)).toContainText("3 / 12");
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  const matched = mode === "tie" ? quiz.profiles : quiz.profiles.filter(profile => profile.id === "deco-1920s");
  for (const profile of matched) {
    await expect(page.locator(`[data-archetype-match="${profile.id}"] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/decade-aesthetic-test`;
  test(`@release Decade aesthetic ${locale}: hub, keyboard,18realchoices, complete result and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: /Explore MBTI|了解MBTI/ })).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "deco");
    await expect(page.locator(`[data-archetype-core-assessment="BIG5_OCEAN"] a[href="/${locale}/tests/big-five-personality-test-ocean-model"]`)).toBeVisible();
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Decade aesthetic ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:decade-aesthetic-test"))).toBeNull();
  });
  test(`@release Decade aesthetic ${locale}: denied storage, all six highest ties and public guides and private-safe copy fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("synthetic denial"); };
      Storage.prototype.setItem = () => { throw new Error("synthetic denial"); };
      Storage.prototype.removeItem = () => { throw new Error("synthetic denial"); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("synthetic clipboard denial")) } });
    });
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(entry);
    await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0); await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const copy = page.locator("[data-archetype-honor-group] textarea"); await expect(copy).toBeVisible(); const text = await copy.inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale].split(/[：:]/u)[0]); expect(text).toContain(`https://fermatmind.com${entry}`);
    expect(text).not.toMatch(/DECADE_\d{2}|answers|3 \/ 12|qa|session_id/i); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release Decade aesthetic all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const publicPath = `/${locale}/tests/explore/decade-aesthetic-test/results/${profile.id}`;
    expect((await page.goto(publicPath, { waitUntil: "domcontentloaded" }))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/decade-aesthetic-test#take-test`);
    const image = await request.get(`/og/fun/decade-aesthetic-test?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/decade-aesthetic-test/results/manifestor", "/zh/tests/explore/decade-aesthetic-test/results/DECADE_01", "/en/tests/play/decade-aesthetic-test"]) expect((await request.get(path)).status()).toBe(404);
});
