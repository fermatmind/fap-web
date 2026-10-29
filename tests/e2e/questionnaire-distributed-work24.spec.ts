import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/distributed-work-choices.json", "utf8")) as Questionnaire;
const label = (locale: string, en: string, zh: string) => locale === "zh" ? zh : en;
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
const draftKey = "fm_questionnaire_draft:distributed-work-choices";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function finish(page: Page, locale: "en" | "zh", allUnscored = false) {
  for (const [i, q] of quiz.questions.entries()) {
    const heading = page.locator("#take-test h2"); await expect(heading).toHaveText(q.prompt[locale]);
    if (i > 0) {
      const box = await heading.boundingBox(), header = await page.locator("header").first().boundingBox();
      expect(box).not.toBeNull(); expect(box!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
    }
    await page.locator(`input[name="${q.id}"][value="${allUnscored || i < 6 ? "skip" : "A"}"]`).check();
    if (i < 23) await expect(page.locator("[data-distributed-work-result]")).toHaveCount(0);
    await page.getByRole("button", { name: label(locale, i === 23 ? "See full result" : "Next", i === 23 ? "查看完整结果" : "下一题"), exact: true }).click();
  }
  await expect(page.locator("[data-distributed-work-part]")).toHaveCount(4);
  await expect(page.locator("[data-distributed-entirely-unscored]")).toHaveCount(allUnscored ? 4 : 0);
  for (const [i, d] of quiz.directions.entries()) {
    await expect(page.locator(`[data-distributed-count="${d.id}-selected"]`)).toHaveText(`${allUnscored ? 0 : 3 + i} / 12`);
    await expect(page.locator(`[data-distributed-count="${d.id}-other"]`)).toHaveText(`${allUnscored ? 0 : 6 - i} / 12`);
    await expect(page.locator(`[data-distributed-count="${d.id}-unscored"]`)).toHaveText(`${allUnscored ? 12 : 3} / 12`);
  }
  for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-distributed-full-guide="${p.id}"]`)).toContainText(t[locale]);
  expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const locale of ["en", "zh"] as const) {
  test(`@release distributed work ${locale}: mobile mixed choices, all unscored, complete guides and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (/DWC_\d|"answers"\s*:|[?&](?:counts|score)=/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("[data-distributed-full-guide]")).toHaveCount(4); await expect(page.locator("[data-distributed-full-guide] h3")).toHaveCount(28);
    await page.getByRole("button", { name: label(locale, "Start test", "开始测试"), exact: true }).click();
    const firstHeading = await page.locator("#take-test h2").boundingBox(), fixedHeader = await page.locator("header").first().boundingBox();
    expect(firstHeading!.y).toBeGreaterThanOrEqual(fixedHeader ? fixedHeader.y + fixedHeader.height : 0);
    await page.getByRole("button", { name: label(locale, "Next", "下一题"), exact: true }).click();
    await expect(page.getByRole("status")).toContainText(label(locale, "Choose an option", "请选择"));
    await finish(page, locale);
    await page.getByRole("button", { name: label(locale, "Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("textbox", { name: label(locale, "Result text for manual copying", "手动复制结果"), exact: true })).toHaveValue(`${quiz.title[locale]}\nhttps://fermatmind.com${path(locale)}`);
    await page.getByRole("button", { name: label(locale, "Retake test", "重新测试"), exact: true }).click();
    await expect(page.locator('input[value="skip"]')).not.toBeChecked(); await finish(page, locale, true);
    await expect(page.locator('#take-test a[href*="mbti"]')).toHaveCount(0); expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });

  test(`@release distributed work ${locale}: explicit tab saving, resume, back edit, expiry and exit clearing`, async ({ page }) => {
    await page.goto(path(locale)); await page.getByRole("button", { name: label(locale, "Start test", "开始测试"), exact: true }).click();
    await page.locator('input[name="DWC_01"][value="A"]').check(); expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
    await page.getByRole("checkbox").check(); await page.getByRole("button", { name: label(locale, "Next", "下一题"), exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: label(locale, "Resume this tab's progress", "恢复本标签页进度"), exact: true }).click();
    await page.getByRole("button", { name: label(locale, "Back", "上一题"), exact: true }).click(); await expect(page.locator('input[value="A"]')).toBeChecked();
    await page.locator('input[value="B"]').check(); await page.getByRole("button", { name: label(locale, "Next", "下一题"), exact: true }).click();
    await page.getByRole("button", { name: label(locale, "Back", "上一题"), exact: true }).click(); await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.getByRole("button", { name: label(locale, "Exit and clear this attempt", "退出并清除本次进度"), exact: true }).click(); expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
    await page.evaluate(({ key, version }) => sessionStorage.setItem(key, JSON.stringify({ version, savedAt: Date.now() - 86400001, answers: { DWC_01: "A" } })), { key: draftKey, version: quiz.version });
    await page.reload(); await expect(page.getByRole("button", { name: label(locale, "Resume this tab's progress", "恢复本标签页进度"), exact: true })).toHaveCount(0);
    await expect(page.locator("[data-distributed-work-result]")).toHaveCount(0); await expect(page.locator("[data-distributed-full-guide]")).toHaveCount(4);
  });
}

test("@release distributed work: all ten public pages, full bodies, locale pairs and private-free OG", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const url = `${path(locale)}${profile ? `/results/${profile.id}` : ""}`; expect((await page.goto(url))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, target] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${path(target)}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator(`[data-distributed-full-guide="${profile.id}"]`)).toContainText(t[locale]);
    await expect(page.locator("[data-distributed-work-result]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`, response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&counts=12")).body()).toEqual(bytes);
  }
  for (const url of [`${path("en")}/results/winner`, `${path("zh")}/results/overall`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=high`]) expect((await request.get(url)).status()).toBe(404);
});
