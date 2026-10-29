import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/after-bereavement-reflection.json", "utf8")) as Questionnaire;
const label = (locale: string, en: string, zh: string) => locale === "zh" ? zh : en;
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, locale: "en" | "zh", allUnscored = false) {
  for (const [i, q] of quiz.questions.entries()) {
    const heading = page.locator("#bereavement-active-question"); await expect(heading).toHaveText(q.prompt[locale]);
    if (i > 0) {
      const box = await heading.boundingBox(), header = await page.locator("header").first().boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    }
    await page.locator(`input[name="${q.id}"][value="${allUnscored ? "na" : ["0", "1", "2", "3", "4", "na"][i % 6]}"]`).check();
    await expect(page.locator("[data-bereavement-result]")).toHaveCount(0);
    await page.getByRole("button", { name: label(locale, i === 15 ? "Organize observations" : "Next", i === 15 ? "整理观察记录" : "下一条"), exact: true }).click();
  }
  await expect(page.locator("[data-bereavement-theme]")).toHaveCount(5);
  await expect(page.locator("[data-bereavement-observation]")).toHaveCount(16);
  await expect(page.locator("[data-bereavement-unscored]")).toHaveCount(allUnscored ? 5 : 0);
  const expected = [[1,1,1,1,0,0],[1,0,0,0,1,1],[0,1,1,1,0,0],[1,0,0,0,1,1],[0,1,1,1,0,0]];
  for (const [i, d] of quiz.directions.entries()) for (const [j, c] of ["0", "1", "2", "3", "4", "na"].entries()) {
    await expect(page.locator(`[data-bereavement-count="${d.id}-${c}"]`)).toHaveText(`${allUnscored ? (c === "na" ? (i === 0 ? 4 : 3) : 0) : expected[i][j]} / ${i === 0 ? 4 : 3}`);
  }
  await expect(page.locator("[data-bereavement-result] [data-bereavement-support]")).toHaveCount(1);
  for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-bereavement-full-guide="${p.id}"]`)).toContainText(t[locale]);
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /bereavement|BRV_/.test(k)))).toEqual([]);
}
for (const locale of ["en", "zh"] as const) {
  test(`@release original observations ${locale}:16mobilechoices, allunscored, publicfulltext, supportandcopy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (/BRV_\d|"answers"\s*:|[?&](?:counts|score)=/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("[data-bereavement-full-guide]")).toHaveCount(5); await expect(page.locator("[data-bereavement-full-guide] h3")).toHaveCount(35);
    await expect(page.locator("[data-bereavement-support]")).toHaveCount(1);
    await page.locator("[data-bereavement-time-select]").selectOption("under-three-months");
    await page.getByRole("button", { name: label(locale, "Begin original observations", "开始原创观察"), exact: true }).click();
    const box = await page.locator("#bereavement-active-question").boundingBox(), header = await page.locator("header").first().boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    await page.getByRole("button", { name: label(locale, "Next", "下一条"), exact: true }).click();
    await expect(page.getByRole("status")).toContainText(label(locale, "Choose a category", "请选择"));
    await finish(page, locale);
    await expect(page.locator("[data-bereavement-time-context]")).toHaveAttribute("data-bereavement-time-context", "under-three-months");
    await page.getByRole("button", { name: label(locale, "Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(`${quiz.title[locale]} — https://fermatmind.com${path(locale)}`);
    await page.getByRole("button", { name: label(locale, "Clear and retake", "清除并重做"), exact: true }).click();
    await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("withheld");
    await expect(page.locator('input[value="0"]')).not.toBeChecked(); await finish(page, locale, true);
    await expect(page.locator("[data-bereavement-time-context]")).toHaveAttribute("data-bereavement-time-context", "withheld");
    expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });
  test(`@release original observations ${locale}:backedit, exit, reloadandpageleaveclearprivateanswers`, async ({ page }) => {
    await page.goto(path(locale)); const start = () => page.getByRole("button", { name: label(locale, "Begin original observations", "开始原创观察"), exact: true }).click();
    await page.locator("[data-bereavement-time-select]").selectOption("over-twenty-four-months");
    await start(); await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("over-twenty-four-months"); await page.locator('input[value="4"]').check();
    await page.getByRole("button", { name: label(locale, "Next", "下一条"), exact: true }).click();
    await page.getByRole("button", { name: label(locale, "Back", "上一条"), exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.locator('input[value="0"]').check(); await page.getByRole("button", { name: label(locale, "Exit and clear", "退出并清除"), exact: true }).click();
    await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("withheld");
    await start(); await expect(page.locator('input[value="0"]')).not.toBeChecked(); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator("[data-bereavement-time-select]").selectOption("uncertain"); await page.locator('input[value="3"]').check(); await page.reload();
    await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("withheld");
    await expect(page.locator('[data-bereavement-stage="ready"]')).toHaveCount(1); await start(); await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator("[data-bereavement-time-select]").selectOption("three-to-twenty-four-months"); await page.locator('input[value="2"]').check(); await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
    await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("withheld");
    await expect(page.locator('[data-bereavement-stage="ready"]')).toHaveCount(1); await start(); await expect(page.locator('input[value="2"]')).not.toBeChecked();
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => /bereavement|BRV_/.test(k)))).toEqual([]);
  });
}
test("@release original observations:12publicpages, completebodies, localepairs, privatefreeOGandinvalidroutes", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const url = `${path(locale)}${profile ? `/results/${profile.id}` : ""}`; expect((await page.goto(url))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, target] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${path(target)}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-bereavement-full-guide="${profile.id}"]`)).toContainText(t[locale]);
    await expect(page.locator("[data-bereavement-support]")).toHaveCount(1); await expect(page.locator("[data-bereavement-result]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`, response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&counts=5&timeContext=under-three-months")).body()).toEqual(bytes);
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
    const start = page.getByRole("button", { name: "Begin original observations", exact: true });
    await expect(start).toBeVisible(); await expect.poll(() => delayed).toBeGreaterThan(0);
    await expect(start).toBeDisabled(); await expect(page.locator("[data-bereavement-time-select]")).toBeDisabled();
    release();
    await page.waitForLoadState("load");
    await expect(start).toBeEnabled(); await expect(page.locator("[data-bereavement-time-select]")).toBeEnabled();
    await page.locator("[data-bereavement-time-select]").selectOption("uncertain"); await start.click();
    await expect(page.locator("[data-bereavement-time-select]")).toHaveValue("uncertain");
    await expect(page.locator("#bereavement-active-question")).toHaveText(quiz.questions[0].prompt.en);
  } finally { release(); }
});
