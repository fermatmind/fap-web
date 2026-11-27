import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/color-season.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
async function expectQuestionFocus(page: Page) {
  await expect(page.locator("#take-test h2")).toBeFocused();
  const progress = page.locator("#take-test progress");
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toBeInViewport();
}
async function finish(page: Page, locale: "en" | "zh", mode: "planner" | "tie") {
  for (const [i, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "spring") ?? question.options[0];
    if (i > 0) await expectQuestionFocus(page);
    await expect(page.locator("fieldset [data-palette-colour]")).toHaveCount(12);
    for (const option of question.options) {
      const blocks = page.locator(`label:has(input[value="${option.id}"]) [data-palette-colour]`);
      await expect(blocks).toHaveCount(3);
      const actual = await blocks.evaluateAll(nodes => nodes.map(n => ({ hex: n.getAttribute("data-palette-colour"), background: getComputedStyle(n).backgroundColor, width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })));
      expect(actual.map(c => c.hex)).toEqual(option.paletteSwatches!.map(c => c.hex));
      for (const [j, block] of actual.entries()) {
        const hex = option.paletteSwatches![j].hex;
        expect(block.background).toBe(`rgb(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)})`);
        expect(block.width).toBeGreaterThan(30); expect(block.height).toBe(48);
      }
    }
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(4);
  if (mode === "planner") {
    await expect(page.locator('[data-archetype-count="spring"]')).toContainText("16 / 16");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(1);
  } else {
    await expect(page.locator("[data-archetype-match]")).toHaveCount(4);
    for (const direction of quiz.directions) await expect(page.locator(`[data-archetype-count="${direction.id}"]`)).toContainText("4 / 16");
  }
  const matched = mode === "tie" ? quiz.profiles : quiz.profiles.filter(profile => profile.id === "spring");
  for (const profile of matched) {
    await expect(page.locator(`[data-archetype-match="${profile.id}"] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/color-season`;
  test(`@release Color palette ${locale}: hub, keyboard,16visualchoices, complete result and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.getByRole("link", { name: /Explore MBTI|了解MBTI/ })).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click();
    await expectQuestionFocus(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "planner");
    await expect(page.getByRole("link", { name: zh ? "比较全部四份配色指南" : "Compare all four palette guides" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore MBTI|了解MBTI/ })).toHaveCount(0);
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Color palette ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator('#take-test input[name="CSP_01"]').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:color-season"))).toBeNull();
  });
  test(`@release Color palette ${locale}: denied storage, all four highest ties and private-safe copy fallback`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("synthetic clipboard denial")) } });
    });
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(entry);
    await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0); await finish(page, locale, "tie");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const copy = page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }); await expect(copy).toBeVisible(); const text = await copy.inputValue();
    for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]); expect(text).toContain(`https://fermatmind.com${entry}`);
    expect(text).not.toMatch(/CSP_\d{2}|answers|3 \/ 12|qa|session_id/i); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release Color palette all8public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const publicPath = `/${locale}/tests/explore/color-season/results/${profile.id}`;
    expect((await page.goto(publicPath, { waitUntil: "domcontentloaded" }))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(page.locator("[data-palette-colour]")).toHaveCount(6);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/color-season/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/color-season#take-test`);
    const image = await request.get(`/og/fun/color-season?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/color-season/results/mastermind", "/zh/tests/explore/color-season/results/CSP_01", "/en/tests/play/color-season"]) expect((await request.get(path)).status()).toBe(404);
});
