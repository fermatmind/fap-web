import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nakshatra-spica-reference.json", "utf8")) as Questionnaire;
const fixtures = JSON.parse(readFileSync("tests/fixtures/questionnaires/nakshatra-ui-reference.json", "utf8")) as { single: { date: string; time: string; zone: string; profileIds: string[] }; boundary: { date: string; time: string; zone: string; profileIds: string[] } };
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
const label = (locale: string) => locale === "zh" ? "计算Spica参考出生宿" : "Calculate Spica-reference birth star";
async function cookies(page: Page, locale: string) { const b = page.getByRole("button", { name: locale === "zh" ? "接受" : "Accept", exact: true }); if (await b.count()) await b.click(); }
async function fill(page: Page, value = fixtures.single) {
  await expect(page.locator("#nakshatra-date")).toBeEnabled();
  await page.locator("#nakshatra-date").fill(value.date); await page.locator("#nakshatra-time").fill(value.time); await page.locator("#nakshatra-zone").fill(value.zone); await page.locator("#nakshatra-confirm").check();
}
async function complete(page: Page, locale: "en" | "zh", expected: string[]) {
  await page.getByRole("button", { name: label(locale), exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(page.locator("[data-nakshatra-profile]")).toHaveCount(expected.length);
  await expect(page.locator("[data-nakshatra-profile] h4")).toHaveCount(expected.length * 8);
  const text = await page.locator("[data-nakshatra-report]").textContent();
  for (const p of quiz.profiles.filter(p => expected.includes(p.id))) for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[locale]);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
function privatePosts(page: Page) { const seen: string[] = []; page.on("request", r => { if (r.method() === "POST" && /nakshatra-spica-reference|FM_NAKSHATRA_SPICA27|fm_nakshatra|2000-01-01|2024-11-03|placeConfirmed/.test(r.postData() ?? "")) seen.push(r.url()); }); return seen; }
test.beforeEach(async ({ page }) => { await page.route(/\/api\/(?:v0\.5\/seo\/attribution\/events|track)(?:\?|$)|https:\/\/(?:www\.googletagmanager\.com|(?:www\.)?google-analytics\.com|hm\.baidu\.com)\//, route => route.fulfill({ status: 204 })); });
for (const locale of ["en", "zh"] as const) {
  test(`@release Nakshatra ${locale}: real hub inputs,one full reading,boundary two full readings,edit,unknown and clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const seen = privatePosts(page);
    await page.goto(`/${locale}/tests`); await cookies(page, locale); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path(locale)}`);
    await page.getByRole("button", { name: label(locale), exact: true }).click(); await expect(page.getByRole("status")).toContainText(locale === "zh" ? "公历日期" : "Gregorian date");
    await fill(page); await complete(page, locale, fixtures.single.profileIds);
    await page.locator("#nakshatra-time").fill(fixtures.boundary.time); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0); await complete(page, locale, fixtures.boundary.profileIds);
    await expect(page.locator("[data-nakshatra-boundary]")).toContainText(locale === "zh" ? "相邻两篇" : "Both adjacent");
    await page.locator("#nakshatra-unknown").check(); await expect(page.locator("#nakshatra-time")).toHaveValue(""); await expect(page.locator("#nakshatra-time")).toBeDisabled(); await expect(page.getByRole("button", { name: label(locale), exact: true })).toBeDisabled(); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0);
    await expect(page.locator("#nakshatra-all-guides + p + ul a")).toHaveCount(27);
    await page.getByRole("button", { name: locale === "zh" ? "清除输入与结果" : "Clear input and result", exact: true }).click();
    for (const id of ["date", "time", "zone"]) await expect(page.locator(`#nakshatra-${id}`)).toHaveValue(""); await expect(page.locator("#nakshatra-confirm")).not.toBeChecked();
    expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(seen).toEqual([]);
  });
  test(`@release Nakshatra ${locale}: DSTgap rejects,fold requires occurrence,zone confirmation and input edits invalidate`, async ({ page }) => {
    await page.goto(path(locale)); await cookies(page, locale); await fill(page, { ...fixtures.single, date: "2024-03-10", time: "02:30", zone: "America/New_York" });
    await page.getByRole("button", { name: label(locale), exact: true }).click(); await expect(page.getByRole("status")).toContainText(locale === "zh" ? "不存在" : "does not exist"); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0);
    await page.locator("#nakshatra-date").fill("2024-11-03"); await page.locator("#nakshatra-time").fill("01:30"); await page.getByRole("button", { name: label(locale), exact: true }).click();
    await expect(page.locator('input[name="nakshatra-occurrence"]')).toHaveCount(2); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0);
    await page.locator('input[name="nakshatra-occurrence"][value="later"]').check(); await page.getByRole("button", { name: label(locale), exact: true }).click(); await expect(page.locator("[data-nakshatra-report]")).toContainText("2024-11-03T06:30:00Z");
    await page.locator("#nakshatra-zone").fill("UTC"); await expect(page.locator("#nakshatra-confirm")).not.toBeChecked(); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0); await page.getByRole("button", { name: label(locale), exact: true }).click(); await expect(page.getByRole("status")).toContainText(locale === "zh" ? "请确认所填时区适用于出生地与该日期" : "Confirm");
    await page.locator("#nakshatra-confirm").check(); await page.getByRole("button", { name: label(locale), exact: true }).click(); await expect(page.locator("[data-nakshatra-report]")).toContainText("2024-11-03T01:30:00Z");
  });
  test(`@release Nakshatra ${locale}: denied stale storage,ignored queries,public-only copy and actual NextLink leave-return clear`, async ({ page }) => {
    const seen = privatePosts(page);
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:nakshatra-spica-reference", get = Storage.prototype.getItem, set = Storage.prototype.setItem, remove = Storage.prototype.removeItem;
      set.call(sessionStorage, key, JSON.stringify({ date: "2000-01-01", time: "12:00", zone: "UTC" }));
      const touches: string[] = []; Object.assign(window, { __nakStorage: touches, __nakCopied: "" });
      Storage.prototype.getItem = function(k) { if (/nakshatra|birth/i.test(k)) { touches.push(`get:${k}`); throw new Error("Denied private storage"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (/nakshatra|birth/i.test(k)) { touches.push(`set:${k}`); throw new Error("Denied private storage"); } return set.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (/nakshatra|birth/i.test(k)) { touches.push(`remove:${k}`); throw new Error("Denied private storage"); } return remove.call(this, k); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { Object.assign(window, { __nakCopied: value }); } } });
    });
    await page.goto(`${path(locale)}?date=2000-01-01&time=12:00&zone=UTC&portrait=swati`); await cookies(page, locale);
    for (const id of ["date", "time", "zone"]) await expect(page.locator(`#nakshatra-${id}`)).toHaveValue(""); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0);
    await fill(page); await complete(page, locale, fixtures.single.profileIds);
    await page.getByRole("button", { name: locale === "zh" ? "复制公开入口和全部指南网址" : "Copy public calculator and all guide URLs", exact: true }).click();
    const copied = await page.evaluate(() => (window as unknown as { __nakCopied: string }).__nakCopied); expect(copied.split("\n")).toHaveLength(28); expect(copied).not.toMatch(/2000-01-01|12:00|zone=|\?/);
    await page.getByRole("link", { name: locale === "zh" ? "全部测试与工具" : "All tests and tools", exact: true }).click(); await expect(page).toHaveURL(new RegExp(`/${locale}/tests#more-tests$`)); await page.goBack();
    for (const id of ["date", "time", "zone"]) await expect(page.locator(`#nakshatra-${id}`)).toHaveValue(""); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0);
    await fill(page); await page.reload(); await expect(page.locator("#nakshatra-date")).toHaveValue("");
    await fill(page); const other = locale === "en" ? "zh" : "en"; await page.goto(path(other)); await expect(page.locator("#nakshatra-date")).toHaveValue(""); await expect(page.locator("#nakshatra-zone")).toHaveValue("");
    expect(await page.evaluate(() => (window as unknown as { __nakStorage: string[] }).__nakStorage)).toEqual([]); expect(seen).toEqual([]);
  });
}
test("@release Nakshatra held hydration locks all controls and preserves the first ready input", async ({ page }) => {
  let release!: () => void; const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async route => { await pending; await route.continue(); });
  try {
    await page.goto(path("en"), { waitUntil: "domcontentloaded" });
    for (const control of await page.locator("[data-nakshatra-client] input,[data-nakshatra-client] select,[data-nakshatra-client] button").all()) await expect(control).toBeDisabled();
    release(); await page.waitForLoadState("load"); await expect(page.locator("#nakshatra-date")).toBeEnabled(); await page.locator("#nakshatra-date").fill("2000-01-01"); await expect(page.locator("#nakshatra-date")).toHaveValue("2000-01-01");
  } finally { release(); }
});
test("@release Nakshatra calculation-module failure stays unavailable without guessing a birth star", async ({ page }) => {
  await page.goto(path("en")); await cookies(page, "en"); await fill(page); await page.waitForLoadState("load");
  let blocked = 0;
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, route => { blocked++; return route.abort(); });
  await page.getByRole("button", { name: label("en"), exact: true }).click();
  await expect(page.getByRole("status")).toContainText("unavailable"); await expect(page.locator("[data-nakshatra-report]")).toHaveCount(0); await expect(page.locator("#nakshatra-all-guides + p + ul a")).toHaveCount(27); expect(blocked).toBeGreaterThan(0);
});
