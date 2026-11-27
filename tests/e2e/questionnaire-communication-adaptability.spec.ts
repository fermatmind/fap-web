import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { seedAnalyticsConsent } from "./helpers/consent";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

test.beforeEach(async ({ page }) => { await seedAnalyticsConsent(page); });
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/communication-adaptability.json", "utf8")) as Questionnaire;
async function expectQuestionFocus(page: Page) {
  await expect(page.locator("#take-test h2")).toBeFocused();
  const progress = page.locator("#take-test progress");
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toBeInViewport();
}

async function finish(page: Page, locale: "en" | "zh", correct: boolean) {
  for (const [index, question] of quiz.questions.entries()) {
    const id = correct ? question.correctOptionId! : question.options.find(o => o.id !== question.correctOptionId)!.id;
    if (index > 0) await expectQuestionFocus(page);
    const radio = page.locator(`input[name="${question.id}"][value="${id}"]`);
    await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-practice-correct]")).toContainText(correct ? "30 / 30" : "0 / 30");
  await expect(page.locator("[data-practice-question]")).toHaveCount(30); await expect(page.locator("[data-practice-explanation]")).toHaveCount(30); await expect(page.locator("[data-practice-guide]")).toHaveCount(5);
  for (const question of quiz.questions) await expect(page.locator(`[data-practice-question="${question.id}"] [data-practice-explanation]`)).toHaveText(question.explanation![locale]);
  for (const profile of quiz.profiles) {
    const guide = page.locator(`[data-practice-guide="${profile.id}"]`);
    await guide.locator(":scope > summary").click();
    for (const section of profile.sections) for (const text of section.paragraphs) await expect(guide).toContainText(text[locale]);
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id)); expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/communication-adaptability`;
  test(`@release Communication adaptability practice ${locale}: hub,keyboard,30validchoices,all explanations,5fullguides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /COMMA_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
    await page.locator("[data-explore-start]:visible").first().click();
    await expectQuestionFocus(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, true);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0); await expect(page.locator(`[data-b3-next-step="interaction"] a[href="/${locale}/tests/eq-test-emotional-intelligence-assessment"]`)).toBeVisible();
    expect(new URL(page.url()).search).toBe(""); expect(posts).toEqual([]);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await expect(page.locator("[data-practice-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Communication adaptability practice ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator('#take-test input[name="COMMA_01"]').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:communication-adaptability"))).toBeNull();
  });
  test(`@release Communication adaptability practice ${locale}: zero correct retains all answers and guides; opt-in aggregate sharing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click(); await finish(page, locale, false);
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    expect(text).toContain(quiz.title[locale]); expect(text).toMatch(/0\s*\/\s*30/u); expect(text).not.toMatch(/COMMA_[0-9]{2}|answers|form_code|submission|[?&]score/);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Communication adaptability practice all10native full guides,12bilingual images and closed identifiers", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/communication-adaptability?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/communication-adaptability/results/${p.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
      for (const section of p.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const text of section.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/communication-adaptability/results/${p.id}`);
      const image = await request.get(`/og/fun/communication-adaptability?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
    }
  }
  expect((await request.get("/en/tests/explore/communication-adaptability/results/expert")).status()).toBe(404);
  expect((await request.get("/og/fun/communication-adaptability?portrait=expert")).status()).toBe(404);
});
