import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { BirthNumberQuestionnaire } from "../../lib/questionnaires/birthNumber";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/life-path-number.json", "utf8")) as BirthNumberQuestionnaire;
type Locale = "en" | "zh";
const entry = (locale: Locale) => `/${locale}/tests/explore/life-path-number`;
const calculateLabel = (locale: Locale) => locale === "zh" ? "计算符号数字" : "Calculate symbolic number";
async function open(page: Page, locale: Locale, hub = false) {
  if (hub) {
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
  } else await page.goto(entry(locale));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
  await expect(page.getByRole("button", { name: calculateLabel(locale), exact: true })).toBeEnabled();
  const decline = page.getByRole("button", { name: locale === "zh" ? "拒绝" : "Decline", exact: true });
  if (await decline.isVisible()) await decline.click();
}
async function fill(page: Page, date: string) {
  const [year, month, day] = date.split("-");
  await page.locator("#birth-number-year").fill(year);
  await page.locator("#birth-number-month").fill(month);
  await page.locator("#birth-number-day").fill(day);
}
async function calculate(page: Page, locale: Locale, date: string) {
  await fill(page, date); await page.getByRole("button", { name: calculateLabel(locale), exact: true }).click();
}
async function completeGuide(page: Page, locale: Locale, profileId: string) {
  const profile = quiz.profiles.find(item => item.id === profileId)!;
  const guide = page.locator(`[data-birth-number-guide="${profileId}"]`);
  await expect(guide.locator("section > p")).toHaveCount(8);
  for (const section of profile.sections) await expect(guide).toContainText(section.paragraphs[0][locale]);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh";
  test(`@release birthday rules ${locale}: directory entry, actual 33/6 traces, full guides and private copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }));
    await open(page, locale, true);
    const inputTops = await page.locator("#birth-number-year, #birth-number-month, #birth-number-day").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
    expect(Math.max(...inputTops) - Math.min(...inputTops)).toBeLessThanOrEqual(1);
    const privateRequests: string[] = [];
    page.on("request", request => { if (/2009-11-11|2009%2D11%2D11/.test(request.url() + (request.postData() ?? ""))) privateRequests.push(request.method()); });
    await calculate(page, locale, "2009-11-11");
    await expect(page.locator('[data-birth-number-value="separate-parts"]')).toHaveText("33");
    await expect(page.locator('[data-birth-number-method="separate-parts"]')).toContainText("11 + 11 + 11 = 33");
    await page.getByRole("button", { name: zh ? "比较另一种规则" : "Compare the other rule", exact: true }).click();
    await expect(page.locator('[data-birth-number-value="all-date-digits"]')).toHaveText("6");
    await expect(page.locator('[data-birth-number-method="all-date-digits"]')).toContainText("2 + 0 + 0 + 9 + 1 + 1 + 1 + 1 = 15");
    await completeGuide(page, locale, "thirty-three"); await completeGuide(page, locale, "six");
    await page.getByRole("button", { name: zh ? "复制标签与方法" : "Copy label and method", exact: true }).click();
    const manual = page.getByRole("textbox", { name: zh ? "手动复制文字" : "Text for manual copying", exact: true });
    await expect(manual).toHaveValue(`${quiz.profiles[11].title[locale]}\n${quiz.birthNumber.methods[0].label[locale]}`);
    expect(await manual.inputValue()).not.toMatch(/2009|11-11|\+|https?:/);
    const state = await page.evaluate(() => ({ local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage), overflow: document.documentElement.scrollWidth > innerWidth }));
    expect(state.local + state.session).not.toContain("2009"); expect(state.overflow).toBe(false); expect(privateRequests).toEqual([]);
    expect(new URL(page.url()).search + new URL(page.url()).hash).toBe("");
    await page.screenshot({ path: test.info().outputPath(`birthday-${locale}-comparison.png`) });
    await page.locator("#birth-number-rule").selectOption("all-date-digits");
    await expect(page.locator("[data-birth-number-result]")).toHaveCount(0); await expect(manual).toHaveCount(0);
    await page.getByRole("button", { name: calculateLabel(locale), exact: true }).click();
    await expect(page.locator('[data-birth-number-value="all-date-digits"]')).toHaveText("6");
    await expect(page.locator('[data-birth-number-value="separate-parts"]')).toHaveCount(0);
  });
  test(`@release birthday rules ${locale}: real UI day boundary, invalid calendar dates and empty input`, async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-27T12:00:00Z")); await open(page, locale);
    await page.getByRole("button", { name: calculateLabel(locale), exact: true }).click();
    await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
    await expect(page.locator("[data-birth-number-client] [role=status]")).toContainText(zh ? "请填写完整" : "complete Gregorian date");
    for (const date of ["1900-02-29", "2000-04-31"]) {
      await calculate(page, locale, date); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
      await expect(page.locator("[data-birth-number-client] [role=status]")).toContainText(zh ? "不存在" : "does not exist");
    }
    await calculate(page, locale, "2026-10-28"); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
    await expect(page.locator("[data-birth-number-client] [role=status]")).toContainText(zh ? "不能晚于" : "cannot be later");
    for (const date of ["1900-01-01", "2000-02-29", "2026-10-26", "2026-10-27"]) {
      await calculate(page, locale, date); await expect(page.locator("[data-birth-number-result]")).toBeVisible();
    }
  });
  test(`@release birthday rules ${locale}: edits, equal outcomes, clear, refresh and restored-page reset`, async ({ page }) => {
    await open(page, locale); await calculate(page, locale, "1980-01-01");
    await expect(page.locator('[data-birth-number-value="separate-parts"]')).toHaveText("11");
    await page.locator("#birth-number-year").fill("2000"); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
    await page.getByRole("button", { name: calculateLabel(locale), exact: true }).click();
    await page.getByRole("button", { name: zh ? "比较另一种规则" : "Compare the other rule", exact: true }).click();
    await expect(page.locator("[data-birth-number-trace]")).toHaveCount(2); await expect(page.locator("[data-birth-number-guide]")).toHaveCount(1);
    await completeGuide(page, locale, "four");
    await page.getByRole("button", { name: zh ? "清除输入与结果" : "Clear input and result", exact: true }).click();
    for (const field of ["year", "month", "day"]) await expect(page.locator(`#birth-number-${field}`)).toHaveValue("");
    await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
    await calculate(page, locale, "2009-11-11"); await page.reload();
    await expect(page.locator("#birth-number-year")).toHaveValue(""); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
    await calculate(page, locale, "2009-11-11");
    await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })); window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })); });
    await expect(page.locator("#birth-number-year")).toHaveValue(""); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
  });
}
test("@release birthday rules: actual mobile language switch resets DOB and trace", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "en"); await calculate(page, "en", "2009-11-11");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("dialog", { name: "Menu", exact: true }).locator(`a[href='${entry("zh")}']`).click();
  await expect(page).toHaveURL(new RegExp(`${entry("zh")}$`));
  await expect(page.locator("#birth-number-year")).toHaveValue(""); await expect(page.locator("[data-birth-number-result]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title.zh);
});
test("@release birthday rules: all 26 native pages, public PNGs, alternates and closed guide IDs", async ({ page, request }) => {
  test.setTimeout(180000);
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const path = `${entry(locale)}${profile ? `/results/${profile.id}` : ""}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile ? profile.title[locale] : quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com${entry("zh")}${profile ? `/results/${profile.id}` : ""}`);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com${entry("en")}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) { await completeGuide(page, locale, profile.id); await expect(page.locator("[data-birth-number-client]")).toHaveCount(0); }
    else for (const section of quiz.guide) await expect(page.locator("#birth-number-method").locator("..").getByText(section.paragraphs[0][locale], { exact: true })).toBeVisible();
    const image = await request.get(`/og/fun/life-path-number?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
    expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
    const png = await image.body(); expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  }
  for (const id of ["10", "2009-11-11", "private-birthday"]) {
    expect((await request.get(`${entry("en")}/results/${id}`)).status()).toBe(404);
    expect((await request.get(`/og/fun/life-path-number?portrait=${id}`)).status()).toBe(404);
  }
  expect((await request.get("/en/tests/explore/soul-number")).status()).toBe(404);
});
