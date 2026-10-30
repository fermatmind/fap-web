import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/drinking-experiences-reflection.json", "utf8")) as Questionnaire;
const label = (locale: string, en: string, zh: string) => locale === "zh" ? zh : en;
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, locale: "en" | "zh", allUnscored = false) {
  for (const [i, q] of quiz.questions.entries()) {
    const heading = page.locator("#drinking-experiences-active-question"); await expect(heading).toHaveText(q.prompt[locale]);
    await expect(page.locator("[data-drinking-experiences-question-context]")).toContainText(label(locale, "Past four weeks", "过去四周"));
    if (i > 0) {
      const box = await heading.boundingBox(), header = await page.locator("header").first().boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    }
    await page.locator(`input[name="${q.id}"][value="${allUnscored ? "withheld" : ["not-now", "partly", "fits", "unsure", "na", "withheld"][i % 6]}"]`).check();
    await expect(page.locator("[data-drinking-experiences-result]")).toHaveCount(0);
    await page.getByRole("button", { name: label(locale, i === 19 ? "Organize responses" : "Next", i === 19 ? "整理回答记录" : "下一条"), exact: true }).click();
  }
  await expect(page.locator("[data-drinking-experiences-theme]")).toHaveCount(4);
  await expect(page.locator("[data-drinking-experiences-observation]")).toHaveCount(20);
  await expect(page.locator("[data-drinking-experiences-unscored]")).toHaveCount(allUnscored ? 4 : 0);
  const expected = [[1,1,1,1,1,0],[1,1,1,1,0,1],[1,1,1,0,1,1],[1,1,0,1,1,1]];
  for (const [i, d] of quiz.directions.entries()) for (const [j, c] of ["not-now", "partly", "fits", "unsure", "na", "withheld"].entries()) {
    await expect(page.locator(`[data-drinking-experiences-count="${d.id}-${c}"]`)).toHaveText(`${allUnscored ? (c === "withheld" ? quiz.directions[i].itemCount! : 0) : expected[i][j]} / ${quiz.directions[i].itemCount}`);
  }
  await expect(page.locator("[data-drinking-experiences-result] [data-drinking-experiences-support]")).toHaveCount(1);
  for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-drinking-experiences-full-guide="${p.id}"]`)).toContainText(t[locale]);
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /drinking|DRK_/.test(k)))).toEqual([]);
}
for (const locale of ["en", "zh"] as const) {
  test(`@release original observations ${locale}:20fourweekchoices, allunscored, publicfulltext, supportandcopy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (/DRK_\d|"answers"\s*:|[?&](?:counts|score)=/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("[data-drinking-experiences-full-guide]")).toHaveCount(4); await expect(page.locator("[data-drinking-experiences-full-guide] h3")).toHaveCount(28);
    await expect(page.locator("[data-drinking-experiences-support]")).toHaveCount(1);
    await page.getByRole("button", { name: label(locale, "Begin reflection", "开始自我回顾"), exact: true }).click();
    const box = await page.locator("#drinking-experiences-active-question").boundingBox(), header = await page.locator("header").first().boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    await page.getByRole("button", { name: label(locale, "Next", "下一条"), exact: true }).click();
    await expect(page.getByRole("status")).toContainText(label(locale, "Choose a category", "请选择"));
    await finish(page, locale);
    await page.getByRole("button", { name: label(locale, "Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(`${quiz.title[locale]} — https://fermatmind.com${path(locale)}`);
    await page.getByRole("button", { name: label(locale, "Clear and retake", "清除并重做"), exact: true }).click();
    await expect(page.locator('input[value="not-now"]')).not.toBeChecked(); await finish(page, locale, true);
    expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });
  test(`@release original observations ${locale}:backedit, exit, reloadandpageleaveclearprivateanswers`, async ({ page }) => {
    await page.goto(path(locale)); const start = () => page.getByRole("button", { name: label(locale, "Begin reflection", "开始自我回顾"), exact: true }).click();
    await start(); await page.locator('input[value="fits"]').check();
    await page.getByRole("button", { name: label(locale, "Next", "下一条"), exact: true }).click();
    await page.getByRole("button", { name: label(locale, "Back", "上一条"), exact: true }).click(); await expect(page.locator('input[value="fits"]')).toBeChecked();
    await page.locator('input[value="not-now"]').check(); await page.getByRole("button", { name: label(locale, "Exit and clear", "退出并清除"), exact: true }).click();
    await start(); await expect(page.locator('input[value="not-now"]')).not.toBeChecked(); await expect(page.locator('input[value="fits"]')).not.toBeChecked();
    await page.locator('input[value="unsure"]').check(); await page.reload();
    await expect(page.locator('[data-drinking-experiences-stage="ready"]')).toHaveCount(1); await start(); await expect(page.locator('input[value="unsure"]')).not.toBeChecked();
    await page.locator('input[value="partly"]').check(); await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
    await expect(page.locator('[data-drinking-experiences-stage="ready"]')).toHaveCount(1); await start(); await expect(page.locator('input[value="partly"]')).not.toBeChecked();
    await page.locator('input[value="fits"]').check();
    await page.getByRole("link", { name: label(locale, "All tests and practice", "全部测试与练习"), exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/tests#more-tests$`));
    await page.goBack(); await expect(page.locator('[data-drinking-experiences-stage="ready"]')).toHaveCount(1);
    await start(); await expect(page.locator('input[value="fits"]')).not.toBeChecked();
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /drinking|DRK_/.test(k)))).toEqual([]);
  });
}
test("@release original observations:10publicpages, completebodies, localepairs, privatefreeOGandinvalidroutes", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const url = `${path(locale)}${profile ? `/results/${profile.id}` : ""}`; expect((await page.goto(url))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, target] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${path(target)}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-drinking-experiences-full-guide="${profile.id}"]`)).toContainText(t[locale]);
    await expect(page.locator("[data-drinking-experiences-support]")).toHaveCount(1); await expect(page.locator("[data-drinking-experiences-result]")).toHaveCount(0);
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
  await page.route("**/_next/static/**/*.js", async route => { delayed++; await chunks; await route.continue(); });
  try {
    await page.goto(path("en"), { waitUntil: "commit" });
    const start = page.getByRole("button", { name: "Begin reflection", exact: true });
    await expect(start).toBeVisible(); await expect.poll(() => delayed).toBeGreaterThan(0);
    await expect(start).toBeDisabled();
    release();
    await page.waitForLoadState("load");
    await expect(start).toBeEnabled(); await start.click();
    await expect(page.locator("#drinking-experiences-active-question")).toHaveText(quiz.questions[0].prompt.en);
  } finally { release(); }
});
