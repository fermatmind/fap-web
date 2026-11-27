import { isArchivedEntertainmentPath } from "../../lib/seo/discoverabilityExposurePolicy";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/jealousy-scale.json", "utf8")) as Questionnaire;
const maximum = ["5", "5", "5", "5", "5", "5"], minimum = ["1", "1", "1", "1", "1", "1"];
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function expectFocusedQuestion(page: Page) {
  const heading = page.locator("#take-test h2");
  await expect(heading).toBeFocused();
  await expect(page.locator("#take-test progress")).toHaveAttribute("max", "18");
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
}
async function finish(page: Page, locale: "en" | "zh", mode: "maximum" | "minimum" | "one-skip" | "all-skip") {
  for (let i = 0; i < 18; i++) {
    const id = mode === "all-skip" || (mode === "one-skip" && i === 0) ? "na" : mode === "one-skip" ? "3" : mode === "maximum" ? maximum[i % 6] : minimum[i % 6];
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${id}"]`);
    if (i === 1) await expectFocusedQuestion(page);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-jealousy-reflection-result]")).toBeVisible();
  for (let i = 0; i < 3; i++) {
    const insufficient = mode === "all-skip" || (mode === "one-skip" && i === 0);
    await expect(page.locator(`[data-jealousy-reflection-score="${quiz.directions[i].id}"]`)).toContainText(insufficient ? (locale === "zh" ? "资料不足" : "Insufficient information") : mode === "maximum" ? "5.0 / 5" : mode === "minimum" ? "1.0 / 5" : "3.0 / 5");
  }
  for (const profile of quiz.profiles) {
    await expect(page.locator(`[data-jealousy-reflection-result] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:jealousy-scale"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/jealousy-scale`;
  test(`@release Jealousy reflection ${locale}: hub, keyboard, missing answer, exact extremes and all full readings`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /JEAL_[0-9]{2}|answers|facets.*mean/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('[aria-labelledby="questionnaire-method"]').getByRole("heading", { level: 2 })).toBeVisible(); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); await expectFocusedQuestion(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "maximum"); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, "minimum"); expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release Jealousy reflection ${locale}: edit locally, then clear answers when refreshing, changing language or leaving`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });
  test(`@release Jealousy reflection ${locale}: partial and all insufficient parts retain full guides and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); await finish(page, locale, "one-skip"); await expect(page.locator('[data-jealousy-reflection-score="thoughts"]')).toContainText("5/6");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/JEAL_[0-9]{2}|answers|form_code|submission|5\s*\/\s*6|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-skip"); await expect(page.locator("[data-jealousy-reflection-result]")).not.toContainText(" / 5 (");
  });
}
test("@release Jealousy reflection: eight bilingual native pages and images, closed identities and no private image personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/jealousy-scale?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/jealousy-scale/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page.locator("[data-jealousy-reflection-score]")).toHaveCount(0);
      for (const section of profile.sections) { const own = page.locator(`#report-${section.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(section.title[locale]); for (const paragraph of section.paragraphs) await expect(own).toContainText(paragraph[locale]); }
      await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); if (isArchivedEntertainmentPath(path)) {
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/u);
        await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
      } else {
        await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/jealousy-scale/results/${profile.id}`);
      } const image = await request.get(`/og/fun/jealousy-scale?locale=${locale}&portrait=${profile.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      if (profile === quiz.profiles[0]) { const privateQuery = await request.get(`/og/fun/jealousy-scale?locale=${locale}&portrait=${profile.id}&score=5&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body()); }
    }
  }
  expect((await request.get("/en/tests/explore/jealousy-scale/results/master")).status()).toBe(404); expect((await request.get("/og/fun/jealousy-scale?portrait=high")).status()).toBe(404);
});
