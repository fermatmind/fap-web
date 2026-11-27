import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { abstractReasoningResultProfile } from "../../lib/questionnaires/result-content/abstract-reasoning";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/abstract-reasoning.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", correct: boolean) {
  for (const [index, question] of quiz.questions.entries()) {
    const id = correct ? question.correctOptionId! : question.options.find(o => o.id !== question.correctOptionId)!.id;
    const radio = page.locator(`input[name="${question.id}"][value="${id}"]`);
    await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); } else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-practice-correct]")).toContainText(correct ? "24 / 24" : "0 / 24");
  await expect(page.locator("[data-practice-question]")).toHaveCount(24); await expect(page.locator("[data-practice-explanation]")).toHaveCount(24); await expect(page.locator("[data-practice-guide]")).toHaveCount(4);
  await page.locator("#practice-answer-review summary").click();
  for (const question of quiz.questions) {
    const explanation = page.locator(`[data-practice-question="${question.id}"] [data-practice-explanation]`);
    await expect(explanation).toBeVisible();
    await expect(explanation).toHaveText(question.explanation![locale]);
  }
  for (const profile of quiz.profiles.map(abstractReasoningResultProfile)) {
    const guide = page.locator(`[data-practice-guide="${profile.id}"]`);
    await guide.locator(":scope > summary").click();
    for (const section of profile.sections) await expect(guide.getByRole("heading", { level: 4, name: section.title[locale], exact: true })).toBeVisible();
    for (const section of profile.sections) for (const text of section.paragraphs) await expect(guide).toContainText(text[locale]);
  }
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id)); expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/abstract-reasoning`;
  test(`@release Abstract finite-rule practice ${locale}: hub,keyboard,24validchoices,all explanations,4fullguides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /"q[0-9]{1,2}"/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0);
    await page.locator("#take-test [data-explore-start]").click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, true);
    await expect(page.locator("#take-test a[href*='mbti']")).toHaveCount(0); await expect(page.locator("#take-test a[href*='holland-career-interest-test-riasec']")).toHaveCount(1);
    expect(new URL(page.url()).search).toBe(""); expect(posts).toEqual([]);
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await expect(page.locator("[data-practice-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
  test(`@release Abstract finite-rule practice ${locale}: local editing, refresh and language change`, async ({ page }) => {
    await page.goto(`${entry}/take`);
    const first = page.locator('input[name="q1"]');
    const second = page.locator('input[name="q2"]').first();
    await first.nth(1).click();
    await expect(second).toBeVisible();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(first.nth(1)).toBeChecked();
    await first.nth(2).click();
    await expect(second).toBeVisible();
    await page.reload();
    await expect(first.first()).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/abstract-reasoning/take`);
    await expect(first.first()).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:abstract-reasoning"))).toBeNull();
  });
  test(`@release Abstract finite-rule practice ${locale}: zero correct retains all answers and guides; opt-in aggregate sharing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => { Object.defineProperty(navigator, "share", { configurable: true, value: undefined }); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(`${entry}/take`);
    await finish(page, locale, false);
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
    const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    expect(text).toContain(quiz.title[locale]);
    expect(text).toMatch(/0\s*\/\s*24/u);
    expect(text).not.toMatch(/q[0-9]{1,2}|answers|form_code|submission|[?&]score/u);
    const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release Abstract finite-rule practice all8native full guides,10bilingual images and closed identifiers", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/abstract-reasoning?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles.map(abstractReasoningResultProfile)) {
      const path = `/${locale}/tests/explore/abstract-reasoning/results/${p.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page.locator("[data-practice-correct]")).toHaveCount(0);
      for (const section of p.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const text of section.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/abstract-reasoning/results/${p.id}`);
      const image = await request.get(`/og/fun/abstract-reasoning?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
    }
  }
  expect((await request.get("/en/tests/explore/abstract-reasoning/results/expert")).status()).toBe(404);
  expect((await request.get("/og/fun/abstract-reasoning?portrait=expert")).status()).toBe(404);
});
