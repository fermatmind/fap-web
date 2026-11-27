import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/annoying-person-test.json", "utf8")) as Questionnaire;
const reverse = new Set<number>([]);
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function expectFocusedQuestion(page: Page) {
  const heading = page.locator("#take-test h2");
  await expect(heading).toBeFocused();
  await expect(page.locator("#take-test progress")).toBeVisible();
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
}
async function finish(page: Page, locale: "en" | "zh", keyed: number) {
  for (let i = 0; i < quiz.questions.length; i++) {
    const value = String(reverse.has(i + 1) ? 5 + 1 - keyed : keyed), radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    await expect(page.locator("[data-mini-friction-result]")).toHaveCount(0);
    if (i === 1) await expectFocusedQuestion(page);
    await expect(radio).toBeVisible();
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-mini-friction-result]")).toBeVisible(); await expect(page.locator("[data-mini-friction-part]")).toHaveCount(5);
  for (const direction of quiz.directions) await expect(page.locator(`[data-mini-friction-score="${direction.id}"]`)).toContainText(keyed.toFixed(2));
  for (const profile of quiz.profiles) {
    await expect(page.locator(`[data-mini-friction-result] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
  await expect(page.getByRole("link", { name: locale === "zh" ? "回看五份完整指南" : "Reread all five full guides", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/annoying-person-test#questionnaire-results`);
  await expect(page.getByRole("link", { name: locale === "zh" ? "了解MBTI与题本选择" : "Explore MBTI and its versions", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:annoying-person-test"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/annoying-person-test`;
  test(`@release T094 ${locale}: hub, keyboard, missing answer, keyed extremes and all full readings`, async ({ page }) => {
    const posts: string[] = []; page.on("request", r => { if (r.method() === "POST" && /DISLIKED_LK_[0-9]+|answers|miniFriction/.test(r.postData() ?? "")) posts.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    const method = page.locator('[aria-labelledby="questionnaire-method"]');
    await expect(method).toBeVisible();
    await expect(method.getByRole("heading", { level: 2 })).toBeVisible();
    await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); await expectFocusedQuestion(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option"); await expect(page.locator("[data-mini-friction-result]")).toHaveCount(0);
    await finish(page, locale, 5); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, 1); expect(posts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release T094 ${locale}: edit locally, then clear answers when refreshing, changing language or leaving`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });
  test(`@release T094 ${locale}: mobile midpoint, separate full readings and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); await finish(page, locale, 3);
    await page.getByRole("button", { name: zh ? "复制公开入口" : "Copy public entry", exact: true }).click(); const value = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(value.split("\n").slice(0, -1).join("\n")).toBe(quiz.title[locale]); expect(value).not.toMatch(/DISLIKED_LK_[0-9]+|answers|rawSum|form_code|submission|[?&]score/); const url = new URL(value.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release T094: all native bilingual guides, images, canonical pairs, closed identity and no private personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/annoying-person-test?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/annoying-person-test/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-mini-friction-score]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const t of s.paragraphs) await expect(own).toContainText(t[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/annoying-person-test/results/${p.id}`); const image = await request.get(`/og/fun/annoying-person-test?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png"); const withPrivate = await request.get(`/og/fun/annoying-person-test?locale=${locale}&portrait=${p.id}&score=5&answers=SYNTHETIC_PRIVATE_ONLY`); expect(withPrivate.status()).toBe(200); expect(await withPrivate.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/annoying-person-test/results/master")).status()).toBe(404); expect((await request.get("/og/fun/annoying-person-test?portrait=master")).status()).toBe(404);
});
