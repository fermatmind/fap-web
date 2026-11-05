import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/sbti-test.json";
import reference from "../fixtures/questionnaires/sbti31-original-reference.json";
async function expectHeadingBelowHeader(page: Page, selector: string) {
  await expect.poll(() => page.locator(selector).evaluate(el => el.getBoundingClientRect().top - (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0))).toBeGreaterThanOrEqual(0);
}
async function finish(page: Page, locale: "en" | "zh", row: typeof reference.cases[number]) {
  for (const [i, q] of data.questions.entries()) {
    const code = (row.answers as Record<string, string>)[q.id], radio = page.locator(`input[name="${q.id}"][value="${code}"]`);
    await expect(page.locator("#sbti31-question")).toHaveText(q.prompt[locale]);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); } else await radio.click();
  }
}
async function startFromEntry(page: Page, zh: boolean) {
  await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
  await expect(page.locator('#take-test[data-stage="answer"]')).toBeVisible({ timeout: 20000 });
  await expect(page).toHaveURL(/\/sbti-test\/take$/);
}
const platformCopy = /小程序|\bmini[- ](?:program|edition|original|source|SBTI|game|adaptation)\b/i;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/sbti-test`;
  test(`@release sbti31 ${locale}: original31 answers, exact source result and15scores, full report, back/retake/clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /"answers"|profileCode|resultScores|presetRarity|"q01"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page.locator("main")).not.toContainText(platformCopy);
    await expect(page.getByRole("button", { name: /Start 50|开始50/ })).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath(`sbti31-${locale}-entry.png`) });
    await startFromEntry(page, zh);
    await expectHeadingBelowHeader(page, "#sbti31-question");
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator('#take-test [role="status"]')).toContainText(zh ? "请先选择" : "Choose one");
    const row = reference.cases[zh ? 1 : 0]; await finish(page, locale, row);
    await expect(page.locator('[data-sbti31-result]')).toHaveAttribute("data-sbti31-result", row.expected.profileCode);
    await expectHeadingBelowHeader(page, "[data-sbti31-result]");
    await expect(page.locator('[data-sbti31-match]')).toHaveText(`${row.expected.matchPercent}%`);
    expect(await page.locator('[data-sbti31-score]').allTextContents()).toEqual(row.expected.dimensionCards.map(d => String(d.score)));
    const profile = data.profiles.find(p => p.id === reference.profiles.find(p => p.code === row.expected.profileCode)!.id)!;
    const body = await page.locator("#take-test").textContent();
    expect(body).not.toMatch(platformCopy);
    for (const s of profile.sections) for (const p of s.paragraphs) expect(body?.includes(p[locale])).toBe(true);
    const hero = page.locator("[data-sbti31-hero]");
    const reading = page.locator("#sbti31-readings");
    const portrait = hero.locator("[data-sbti31-portrait]");
    const title = hero.locator("[data-sbti31-result]");
    await expect(title).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: width === 1440 ? 950 : 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const heroBox = (await hero.boundingBox())!;
      const readingBox = (await reading.boundingBox())!;
      expect(readingBox.width).toBe(heroBox.width);
      expect(readingBox.y).toBeCloseTo(heroBox.y + heroBox.height, 0);
      if (width === 1440) expect((await portrait.boundingBox())!.x).toBeGreaterThan((await title.boundingBox())!.x + (await title.boundingBox())!.width);
      if (width !== 320) await page.screenshot({ path: test.info().outputPath(`sbti31-${locale}-result-${width}.png`) });
    }
    await hero.getByRole("link", { name: zh ? "解读这幅画像" : "Read your portrait" }).click();
    await expect(reading).toBeFocused();
    await reading.getByText(zh ? "查看15项模型读数与匹配说明" : "View all 15 model readouts and match details", { exact: true }).click();
    await expect(reading.locator("[data-sbti31-dimension]").last()).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: zh ? "清除并重测31题" : "Clear and retake 31 questions", exact: true }).click();
    await page.getByRole("button", { name: zh ? "开始31题" : "Start 31 questions", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked(); await page.getByRole("radio").first().click();
    await expect(page.locator("#sbti31-question")).toHaveText(data.questions[1].prompt[locale]);
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.getByRole("radio").first()).toBeChecked();
    await page.reload();
    await expect(page.locator('#take-test[data-stage="answer"] input:checked')).toHaveCount(0);
    expect(leaks).toEqual([]);
  });
  test(`@release sbti31 ${locale}: second source witness, public-only copy/denial, reload and locale clearing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as Window & { sbtiCopied?: string }).sbtiCopied = value; } } });
      const get = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { if (key.includes("questionnaire_draft")) throw Error("Synthetic draft denial"); return get.call(this, key); };
    });
    await page.goto(entry); await startFromEntry(page, zh);
    const row = reference.cases[zh ? 3 : 2]; await finish(page, locale, row);
    await expect(page.locator('[data-sbti31-result]')).toHaveAttribute("data-sbti31-result", row.expected.profileCode);
    await page.getByRole("button", { name: zh ? "复制公开画像说明链接" : "Copy public portrait guide link", exact: true }).click();
    const profile = reference.profiles.find(p => p.code === row.expected.profileCode)!;
    expect(await page.evaluate(() => (window as Window & { sbtiCopied?: string }).sbtiCopied)).toBe(`${new URL(page.url()).origin}${entry}/results/${profile.id}`);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Synthetic clipboard denial"); } } }));
    await page.getByRole("button", { name: zh ? "复制公开画像说明链接" : "Copy public portrait guide link", exact: true }).click();
    await expect(page.locator('#take-test [role="status"]')).toContainText(zh ? "未能复制" : "Copy did not succeed");
    await page.reload(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await page.getByRole("radio").first().click();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/sbti-test`); await startFromEntry(page, !zh); await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
}
test("@release sbti31: all52 complete original public pages, canonical pairs, local-font images and closed identifiers", async ({ page, request }) => {
  test.setTimeout(240000); await page.goto("/en/tests/explore/sbti-test");
  for (const locale of ["en", "zh"] as const) {
    for (const profile of [null, ...data.profiles]) {
      const path = `/${locale}/tests/explore/sbti-test${profile ? `/results/${profile.id}` : ""}`, response = await request.get(path); expect(response.status()).toBe(200);
      const parsed = await page.evaluate(html => { const doc = new DOMParser().parseFromString(html, "text/html"); return { h1: doc.querySelector("h1")?.textContent, body: doc.querySelector("h1")?.closest("main")?.textContent, canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"), alternates: [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map(e => [e.getAttribute("hreflang"), e.getAttribute("href")]) }; }, await response.text());
      expect(parsed.h1).toBe(profile ? profile.title[locale] : data.title[locale]); expect(parsed.canonical).toBe(`https://fermatmind.com${path}`);
      expect(parsed.body).not.toMatch(platformCopy);
      expect(parsed.alternates).toContainEqual(["en", `https://fermatmind.com/en${path.slice(3)}`]); expect(parsed.alternates).toContainEqual(["zh-CN", `https://fermatmind.com/zh${path.slice(3)}`]);
      for (const s of profile ? profile.sections : data.guide) for (const p of s.paragraphs) expect(parsed.body?.includes(p[locale])).toBe(true);
    }
    for (const profile of [null, data.profiles[0], data.profiles[24]]) { const response = await request.get(`/og/fun/sbti-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`); expect(response.status()).toBe(200); const b = await response.body(); expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630); }
  }
  for (const path of ["/en/tests/explore/sbti-test/results/unknown", "/en/tests/play/sbti-test", "/og/fun/sbti-test?locale=de", "/og/fun/sbti-test?locale=en&portrait=unknown"]) expect((await request.get(path)).status()).toBe(404);
});
