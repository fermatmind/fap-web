import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/number-context-reflection.json", "utf8")) as Questionnaire;
const label = (locale: string, en: string, zh: string) => locale === "zh" ? zh : en;
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, locale: "en" | "zh", allUnscored = false) {
  for (const [i, q] of quiz.questions.entries()) {
    const heading = page.locator("#number-context-active-question"); await expect(heading).toHaveText(q.prompt[locale]);
    if (i > 0) {
      const box = await heading.boundingBox(), header = await page.locator("header").first().boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    }
    const option = page.locator(`input[name="${q.id}"][value="${allUnscored ? "na" : ["0", "1", "2", "3", "4", "na"][i % 6]}"]`);
    await expect(page.locator("[data-number-context-result]")).toHaveCount(0);
    await option.click();
    await expect(option).toHaveCount(0);
  }
  await expect(page.locator("[data-number-context-theme]")).toHaveCount(4);
  await expect(page.locator("[data-number-context-observation]")).toHaveCount(20);
  await expect(page.locator("[data-number-context-unscored]")).toHaveCount(allUnscored ? 4 : 0);
  const expected = [[1,1,1,1,1,0],[1,1,1,1,0,1],[1,1,1,0,1,1],[1,1,0,1,1,1]];
  for (const [i, d] of quiz.directions.entries()) for (const [j, c] of ["0", "1", "2", "3", "4", "na"].entries()) {
    await expect(page.locator(`[data-number-context-count="${d.id}-${c}"]`)).toHaveText(`${allUnscored ? (c === "na" ? 5 : 0) : expected[i][j]} / 5`);
  }
  const result = page.locator("[data-number-context-result]");
  await expect(result.locator(":scope > [data-number-context-support]")).toBeVisible();
  await expect(result.locator("details [data-number-context-support]")).toHaveCount(1);
  await expect(result.locator("[data-number-context-full-reading]")).toHaveCount(4);
  for (const profile of quiz.profiles) {
    await expect(result.locator(`a[href="${path(locale)}/results/${profile.id}"]`).first()).toBeVisible();
  }
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /number|NCT_/.test(k)))).toEqual([]);
}
for (const locale of ["en", "zh"] as const) {
  test(`@release original observations ${locale}:20mobilechoices, allunscored, publicfulltext, supportandcopy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (/NCT_\d|"answers"\s*:|[?&](?:counts|score)=/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("[data-number-context-full-guide]")).toHaveCount(4); await expect(page.locator("[data-number-context-full-guide] h3")).toHaveCount(28);
    await expect(page.locator("[data-number-context-support]")).toHaveCount(1);
    await page.locator("[data-explore-start]").click();
    await page.waitForURL(url => url.pathname === `${path(locale)}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    const box = await page.locator("#number-context-active-question").boundingBox(), header = await page.locator("header").first().boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    await page.getByRole("button", { name: label(locale, "Next", "下一条"), exact: true }).click();
    await expect(page.getByRole("status")).toContainText(label(locale, "Choose a category", "请选择"));
    await finish(page, locale);
    await page.getByRole("button", { name: label(locale, "Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(`${quiz.title[locale]} — https://fermatmind.com${path(locale)}`);
    await page.getByRole("button", { name: label(locale, "Clear and retake", "清除并重做"), exact: true }).click();
    await expect(page.locator('input[value="0"]')).not.toBeChecked(); await finish(page, locale, true);
    expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });
  test(`@release original observations ${locale}: edit, reload and leave without retaining answers`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, path(locale), quiz);
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /number|NCT_/.test(k)))).toEqual([]);
  });
}
test("@release original observations:10publicpages, completebodies, noindex, privatefreeOGandinvalidroutes", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const url = `${path(locale)}${profile ? `/results/${profile.id}` : ""}`;
    const pageResponse = await page.goto(url);
    expect(pageResponse?.status()).toBe(200);
    expect(pageResponse?.headers()["x-robots-tag"]).toContain("noindex, follow");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /\bnoindex, follow\b/);
    if (profile) for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-number-context-full-guide="${profile.id}"]`)).toContainText(t[locale]);
    await expect(page.locator("[data-number-context-support]")).toHaveCount(1); await expect(page.locator("[data-number-context-result]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`, response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&counts=5")).body()).toEqual(bytes);
  }
  for (const url of [`${path("en")}/results/high-risk`, `${path("zh")}/results/overall`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=diagnosis`]) expect((await request.get(url)).status()).toBe(404);
});

test("@release original observations: hydration gates the start button until delayed JavaScript is ready", async ({ page }) => {
  let release!: () => void;
  const chunks = new Promise<void>(resolve => { release = resolve; });
  let delayed = 0;
  await page.route("**/_next/static/**/*.css", async route => {
    await new Promise(resolve => setTimeout(resolve, 6000));
    await route.continue();
  });
  await page.route("**/_next/static/**/*.js", async route => { delayed++; await chunks; await route.continue(); });
  try {
    await page.goto(`${path("en")}/take`, { waitUntil: "commit" });
    const start = page.locator("[data-explore-start]");
    await expect(start).toBeVisible(); await expect.poll(() => delayed).toBeGreaterThan(0);
    await expect(start).toBeDisabled();
    release();
    await page.waitForLoadState("load");
    await expect(page.locator("#number-context-active-question")).toHaveText(quiz.questions[0].prompt.en);
  } finally { release(); }
});
