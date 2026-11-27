import { seedAnalyticsConsent } from "./helpers/consent";
import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire, QuestionnaireAnswers } from "../../lib/questionnaires/types";
test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/political-coordinates.json", "utf8")) as Questionnaire;
const original = JSON.parse(readFileSync("tests/fixtures/questionnaires/political-coordinates-reference.json", "utf8")) as { originalItems: { id: string; axis: "economic" | "social" }[] };
const endpoints = { economic: ["left", "right"], social: ["communitarian", "liberal"] };
const vector = (): QuestionnaireAnswers => Object.fromEntries(original.originalItems.map(row => [row.id, endpoints[row.axis][original.originalItems.filter(r => r.axis === row.axis).findIndex(r => r.id === row.id) < 9 ? 0 : 1]]));
test.beforeEach(async ({ page }) => { const cdp = await page.context().newCDPSession(page); await cdp.send("Network.enable"); await cdp.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] }); });
async function begin(page: Page) { await page.locator("[data-explore-start]:visible").first().click(); }
async function full(page: Page, locale: "en" | "zh", answers: QuestionnaireAnswers) {
  const zh = locale === "zh";
  for (const [i, q] of quiz.questions.entries()) {
    await expect(page.locator("#take-test h2")).toHaveText(q.prompt[locale]);
    const option = page.locator(`input[name="${q.id}"][value="${answers[q.id]}"]`);
    await expect(page.locator("[data-political-axis]")).toHaveCount(0);
    if (i === 0) await option.press("Space");
    else await option.click();
    await expect(option).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  let missing = 0;
  for (const axis of ["economic", "social"] as const) {
    const rows = original.originalItems.filter(r => r.axis === axis), negative = rows.filter(r => answers[r.id] === endpoints[axis][0]).length, positive = rows.filter(r => answers[r.id] === endpoints[axis][1]).length, rated = negative + positive, valid = rated === 18, card = page.locator(`[data-political-axis='${axis}']`), unavailable = zh ? "资料不足" : "Insufficient information", difference = positive - negative;
    await expect(card.locator("[data-political-negative]")).toHaveText(valid ? String(negative) : unavailable); await expect(card.locator("[data-political-positive]")).toHaveText(valid ? String(positive) : unavailable); await expect(card.locator("[data-political-difference]")).toHaveText(valid ? (difference > 0 ? `+${difference}` : String(difference)) : unavailable); await expect(card.locator("[data-political-rated]")).toContainText(`${rated} / 18`); if (!valid) missing++;
  }
  await expect(page.locator("[data-political-insufficient]")).toHaveCount(missing); await expect(page.locator("[data-political-point]")).toHaveCount(missing ? 0 : 1); await expect(page.locator("[data-political-guide]")).toHaveCount(4);
  for (const p of quiz.profiles) { const guide = page.locator(`[data-political-guide='${p.id}']`); await expect(guide.locator("h4")).toHaveCount(8); for (const s of p.sections) for (const text of s.paragraphs) await expect(guide.locator(`#political-report-${p.id}-${s.id}`)).toContainText(text[locale]); }
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:political-coordinates"))).toBeNull(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/political-coordinates`;
  test(`@release Political coordinates ${locale}:36balanced/oneNA/allNA,all4FULL8,rawcounts,keyboard,privacyandpublicreturn`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const privatePosts: string[] = [], errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("request", r => { if (r.method() === "POST" && /POL_\d{3}|politicalCoordinates/.test(r.postData() ?? "")) privatePosts.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await begin(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option"); await full(page, locale, vector()); await expect(page.locator("[data-political-axis-tie]")).toHaveCount(2); for (const p of quiz.profiles) await expect(page.locator("[data-political-comparisons]")).toContainText(p.title[locale]);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); const mixed = vector(); mixed.POL_001 = "na"; await full(page, locale, mixed); await expect(page.locator("[data-political-no-point]")).toBeVisible();
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await full(page, locale, Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))); await expect(page.locator("[data-political-no-point]")).toBeVisible();
    await page.locator("[data-political-guide='left-liberal']").getByRole("link").click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles[1].title[locale]); await expect(page.locator("[data-political-point]")).toHaveCount(0); await page.getByRole("link", { name: zh ? "免费开始完整测试" : "Start the full test for free", exact: true }).click(); await expect(page.locator("[data-explore-start]:visible").first()).toBeEnabled(); expect(privatePosts).toEqual([]); expect(errors).toEqual([]);
  });
  test(`@release Political coordinates ${locale}: edit in memory, then clear answers on reload, language change or exit, with safe clipboard fallback`, async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }); });
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
    await page.goto(entry); await begin(page); await full(page, locale, vector()); await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click(); const text = await page.locator("[data-archetype-honor-group] textarea").inputValue(); expect(text).not.toMatch(/POL_\d{3}|answers|politicalCoordinates|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Political coordinates10native fulltexts/ENZHmetadata/4OG andclosedIDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const path = `/${locale}/tests/explore/political-coordinates${p ? "/results/" + p.id : ""}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText((p?.title ?? quiz.title)[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://fermatmind.com" + path); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", (p?.seo?.description ?? quiz.description)[locale]); if (p) for (const s of p.sections) await expect(page.locator(`#report-${s.id}`)).toContainText(s.paragraphs[0][locale]);
  }
  for (const locale of ["en", "zh"]) for (const suffix of ["", "&portrait=left-liberal"]) { const response = await request.get(`/og/fun/political-coordinates?locale=${locale}${suffix}`); expect(response.status()).toBe(200); const pixels = await response.body(); expect(pixels.readUInt32BE(16)).toBe(1200); expect(pixels.readUInt32BE(20)).toBe(630); }
  for (const path of ["/en/tests/explore/political-coordinates/results/centrist", "/og/fun/political-coordinates?portrait=POL_001"]) expect((await request.get(path)).status()).toBe(404);
});
