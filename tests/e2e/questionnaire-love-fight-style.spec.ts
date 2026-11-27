import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-fight-style.json", "utf8")) as Questionnaire;
const maximum = ["5", "5", "5", "5", "5"], minimum = ["1", "1", "1", "1", "1"];
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function expectQuestionFocus(page: Page) {
  await expect(page.locator("#take-test h2")).toBeFocused();
  const progress = page.locator("#take-test progress");
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toBeInViewport();
}
async function finish(page: Page, locale: "en" | "zh", mode: "maximum" | "minimum" | "one-skip" | "all-skip") {
  for (let i = 0; i < 20; i++) {
    const id = mode === "all-skip" || (mode === "one-skip" && i === 0) ? "na" : mode === "one-skip" ? "3" : mode === "maximum" ? maximum[i % 5] : minimum[i % 5];
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${id}"]`);
    if (i === 1) await expectQuestionFocus(page);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-love-conflict-process-result]")).toBeVisible();
  for (let i = 0; i < 4; i++) {
    const insufficient = mode === "all-skip" || (mode === "one-skip" && i === 0);
    await expect(page.locator(`[data-love-conflict-process-score="${quiz.directions[i].id}"]`)).toContainText(insufficient ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "maximum" ? "5.0 / 5" : mode === "minimum" ? "1.0 / 5" : "3.0 / 5");
  }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-love-conflict-process-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-fight-style"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/love-fight-style`;
  test(`@release Love conflict-process reflection ${locale}: hub, keyboard, missing answer, exact extremes and all full readings`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /LCP_[0-9]{2}|answers|facets.*mean/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('[aria-labelledby="questionnaire-method"] h2')).toBeVisible(); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.locator("[data-explore-start]:visible").first().click(); await expectQuestionFocus(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "maximum"); await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "minimum"); expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release Love conflict-process reflection ${locale}: edit locally, then reset after refresh, language change or exit`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:love-fight-style"))).toBeNull();
  });
  test(`@release Love conflict-process reflection ${locale}: partial and all insufficient parts retain full guides and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click(); await finish(page, locale, "one-skip"); await expect(page.locator('[data-love-conflict-process-score="verbal-escalation"]')).toContainText("4/5");
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click(); const text = await page.locator("[data-archetype-honor-group] textarea").inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/LCP_[0-9]{2}|answers|form_code|submission|4\s*\/\s*5|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await finish(page, locale, "all-skip"); await expect(page.locator("[data-love-conflict-process-result]")).not.toContainText(" / 5 (");
  });
}
test("@release Love conflict-process reflection: ten bilingual native pages and images, closed identities and no private image personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/love-fight-style?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/love-fight-style/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page.locator("[data-love-conflict-process-score]")).toHaveCount(0);
      for (const section of profile.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(own).toContainText(paragraph[locale]); }
      await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/love-fight-style/results/${profile.id}`); const image = await request.get(`/og/fun/love-fight-style?locale=${locale}&portrait=${profile.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      if (profile === quiz.profiles[0]) { const privateQuery = await request.get(`/og/fun/love-fight-style?locale=${locale}&portrait=${profile.id}&score=5&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body()); }
    }
  }
  expect((await request.get("/en/tests/explore/love-fight-style/results/master")).status()).toBe(404); expect((await request.get("/og/fun/love-fight-style?portrait=high")).status()).toBe(404);
});
