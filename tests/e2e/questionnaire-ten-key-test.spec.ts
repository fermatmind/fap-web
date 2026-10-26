import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/ten-key-test.json", "utf8")) as Questionnaire;
const path = (locale: string) => `/${locale}/tests/explore/ten-key-test`;
async function controlledClock(page: Page) {
  await expect(page.locator('input[name="ten-key-mode"][value="whole"]')).toBeEnabled();
  await page.clock.install({ time: new Date("2026-10-27T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-27T00:00:01Z"));
}
async function start(page: Page, locale: "en" | "zh", mode = "whole") {
  await page.locator(`input[name="ten-key-mode"][value="${mode}"]`).check();
  await page.getByRole("button", { name: locale === "zh" ? "开始60秒练习" : "Start 60-second practice", exact: true }).click();
  await expect(page.locator("#ten-key-entry")).toBeFocused();
}

for (const locale of ["en", "zh"] as const) {
  test(`@release 10-Key ${locale}: real input, editing, exact deadline, all full guides, safe navigation and retake (controlled clock)`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const privateWrites: string[] = [];
    page.on("request", request => { const body = request.postData(); if (request.method() !== "GET" && body && /"(?:entries|answers|confirmedKph|entryAccuracy|atMs)"\s*:/.test(body)) privateWrites.push(body); });
    await page.goto(`/${locale}/tests`);
    await page.locator(`a[href="${path(locale)}"]`).first().click();
    await expect(page.locator("h1")).toHaveText(quiz.title[locale]);
    await controlledClock(page); await start(page, locale);
    const first = quiz.tenKey!.rounds[0].values[0];
    await page.locator("#ten-key-entry").pressSequentially(first + "9");
    await page.locator("#ten-key-entry").press("Backspace");
    await page.locator("#ten-key-entry").press("Enter");
    await expect(page.locator("[data-ten-key-source]")).toHaveText(quiz.tenKey!.rounds[0].values[1]);
    await page.locator("#ten-key-entry").pressSequentially("0"); await page.locator("#ten-key-entry").press("Enter");
    await page.locator("#ten-key-entry").pressSequentially("12");
    await page.clock.fastForward(59_999); await expect(page.locator("[data-ten-key-result]")).toHaveCount(0);
    await page.clock.fastForward(1);
    await expect(page.locator("#ten-key-heading")).toBeFocused();
    await expect(page.locator("[data-ten-key-result]")).toHaveCount(1);
    await expect(page.locator("[data-ten-key-review-row]")).toHaveCount(2);
    await expect(page.locator("[data-ten-key-result]")).toContainText("50.0%");
    await expect(page.locator("[data-ten-key-formula]")).toContainText(String(first.length + 1));
    await expect(page.locator("[data-ten-key-result]")).toContainText(locale === "zh" ? "截止时未确认尾串（排除计分）：12" : "Unconfirmed text at the deadline (excluded): 12");
    for (const profile of quiz.profiles) {
      const guide = page.locator(`[data-ten-key-full-guide="${profile.id}"]`);
      await expect(guide.locator("h4")).toHaveCount(7);
      for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(guide).toContainText(paragraph[locale]);
    }
    expect(await page.locator("[id]").evaluateAll(nodes => new Set(nodes.map(node => node.id)).size === nodes.length)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(new URL(page.url()).search).toBe(""); expect(privateWrites).toEqual([]);
    await expect(page.locator(`#take-test a[href="/${locale}/tests/holland-career-interest-test-riasec"]`)).toHaveCount(1);
    await expect(page.locator("#take-test")).not.toContainText("MBTI");
    await page.getByRole("button", { name: locale === "zh" ? "清空并重新练习" : "Clear and practise again", exact: true }).click();
    await expect(page.locator("[data-ten-key-result]")).toHaveCount(0);
    await start(page, locale, "references"); await expect(page.locator("#ten-key-entry")).toHaveValue("");
    await expect(page.locator("[data-ten-key-source]")).toHaveText("000482");
  });
}

test("@release 10-Key: leading zeros, IME confirmation, blocked paste, visibility cancellation and reload (controlled clock/visibility)", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, "sessionStorage", { get() { throw Error("Synthetic denied storage"); } }); });
  await page.goto(path("en")); await controlledClock(page); await start(page, "en", "references");
  const input = page.locator("#ten-key-entry");
  await input.dispatchEvent("paste");
  await expect(input).toHaveValue(""); await expect(page.getByRole("status")).toContainText("Pasting is blocked");
  await input.pressSequentially("000482"); await expect(input).toHaveValue("000482");
  await input.dispatchEvent("compositionstart"); await input.press("Enter");
  await expect(page.locator("[data-ten-key-source]")).toHaveText("000482");
  await input.dispatchEvent("compositionend"); await input.press("Enter");
  await expect(page.locator("[data-ten-key-source]")).not.toHaveText("000482");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("status")).toContainText("cancelled and cleared"); await expect(page.locator("#ten-key-entry")).toHaveCount(0);
  await page.clock.resume();
  await page.reload(); await expect(page.getByRole("button", { name: "Start 60-second practice", exact: true })).toBeVisible();
  await expect(page.locator("[data-ten-key-result]")).toHaveCount(0);
  const wall = await page.evaluate(() => Date.now());
  await start(page, "en"); await page.clock.setSystemTime(new Date(wall + 10_000));
  await expect(page.getByRole("status")).toContainText("clocks diverged");
  await expect(page.locator("#ten-key-entry")).toHaveCount(0);
});

test("@release 10-Key: no-entry denominators and blank Enter stay distinct (controlled clock)", async ({ page }) => {
  await page.goto(path("en")); await controlledClock(page); await start(page, "en", "decimals");
  await page.clock.fastForward(60_000); await expect(page.locator("[data-ten-key-result]")).toContainText("No entries were confirmed");
  await expect(page.locator("[data-ten-key-result]")).toContainText("Unavailable");
  await page.getByRole("button", { name: "Clear and practise again", exact: true }).click();
  await start(page, "en", "decimals"); await page.locator("#ten-key-entry").press("Enter");
  await page.clock.fastForward(60_000); await expect(page.locator("[data-ten-key-review-row]")).toHaveCount(1);
  await expect(page.locator("[data-ten-key-review-row]")).toContainText("Blank");
  await expect(page.locator("[data-ten-key-result]")).toContainText("100.0%");
});

test("@release 10-Key all eight public pages, native guide images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of [null, ...quiz.profiles]) {
      const url = path(locale) + (profile ? `/results/${profile.id}` : "");
      await page.goto(url); await expect(page.locator("h1")).toHaveText((profile?.title ?? quiz.title)[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
      if (profile) for (const section of profile.sections) for (const paragraph of section.paragraphs) await expect(page.locator(`#report-${section.id}`)).toContainText(paragraph[locale]);
      const og = await request.get(`/og/fun/ten-key-test?locale=${locale}&v=1.0.0${profile ? `&portrait=${profile.id}` : ""}`);
      expect(og.status()).toBe(200); const bytes = await og.body(); expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    }
    expect((await request.get(`${path(locale)}/results/unknown`)).status()).toBe(404);
    expect((await request.get(`/${locale}/tests/play/ten-key-test`)).status()).toBe(404);
  }
  expect((await request.get("/og/fun/ten-key-test?locale=zh&portrait=unknown")).status()).toBe(404);
  expect((await request.get("/og/fun/ten-key-test?locale=xx")).status()).toBe(404);
});
