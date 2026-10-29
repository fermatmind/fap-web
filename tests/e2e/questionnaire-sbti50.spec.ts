import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/sbti-test.json";
import reference from "../fixtures/questionnaires/sbti50-count-reference.json";

async function finish(page: Page, locale: "en" | "zh", codes: string) {
  for (const [index, question] of data.questions.entries()) {
    const radio = page.locator(`input[name="${question.id}"][value="${codes[index]}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await page.getByRole("button", { name: locale === "zh" ? (index === 49 ? "查看本次次数" : "下一组") : (index === 49 ? "See these counts" : "Next"), exact: true }).click();
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/sbti-test`;
  test(`@release sbti50 ${locale}: mobile hub, keyboard,25-way tie, all25 complete readings and clear`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /SBTI50_\d|highestCount|leadingThemes|"answers"/.test(request.postData() ?? "")) leaks.push(request.url()); });
    await page.goto(`/${locale}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    await page.screenshot({ path: test.info().outputPath(`sbti50-${locale}-entry.png`) });
    await page.getByRole("button", { name: zh ? "开始50组选择" : "Start 50 choices", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一组" : "Next", exact: true }).click();
    await expect(page.locator('#take-test [role="status"]')).toContainText(zh ? "请先选择" : "Choose one");
    await finish(page, locale, (zh ? "B" : "A").repeat(50));
    await expect(page.locator("[data-sbti50-leading]")).toContainText(zh ? "25 个主题" : "25 themes");
    await expect(page.locator("[data-sbti50-count]")).toHaveCount(25);
    expect(await page.locator("[data-sbti50-count]").allTextContents()).toEqual(Array(25).fill("2 / 4"));
    await expect(page.locator("[data-sbti50-reading]")).toHaveCount(0);
    for (const profile of data.profiles) {
      await page.getByRole("button", { name: zh ? `阅读${profile.headline.zh}` : `Read ${profile.headline.en}`, exact: true }).click();
      const reading = page.locator(`[data-sbti50-reading="${profile.id}"]`);
      const content = await reading.textContent();
      for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(content?.includes(paragraph[locale])).toBe(true);
    }
    await page.screenshot({ path: test.info().outputPath(`sbti50-${locale}-result.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.includes("sbti")))).toEqual([]);
    await expect(page.locator("#fm-google-tag-script,#fm-baidu-tongji-script")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "清除并重新作答" : "Clear and retake", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.locator('input[value="B"]').check();
    await page.getByRole("button", { name: zh ? "下一组" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一组" : "Back", exact: true }).click();
    await expect(page.locator('input[value="B"]')).toBeChecked();
    await page.getByRole("button", { name: zh ? "退出并清除本次回答" : "Exit and clear these choices", exact: true }).click();
    await expect(page.locator("[data-sbti50-counts]")).toHaveCount(0);
    expect(leaks).toEqual([]);
  });
  test(`@release sbti50 ${locale}: unique-leading witness, denied storage, public-only copy, reload and locale clear`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw Error("synthetic storage denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw Error("synthetic storage denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as Window & { sbtiCopied?: string }).sbtiCopied = value; } } });
    });
    await page.goto(entry);
    await page.getByRole("button", { name: zh ? "开始50组选择" : "Start 50 choices", exact: true }).click();
    const witness = reference.witnesses[zh ? 24 : 6], profile = data.profiles.find(p => p.id === witness.themeId)!;
    await finish(page, locale, witness.codes);
    await expect(page.locator("[data-sbti50-leading]")).toContainText(zh ? "1 个主题" : "1 theme");
    await expect(page.locator(`[data-sbti50-count="${profile.id}"]`)).toHaveText("4 / 4");
    await page.getByRole("button", { name: zh ? `阅读${profile.headline.zh}` : `Read ${profile.headline.en}`, exact: true }).click();
    await page.getByRole("button", { name: zh ? "复制此公开指南链接" : "Copy this public guide link", exact: true }).click();
    const copied = await page.evaluate(() => (window as Window & { sbtiCopied?: string }).sbtiCopied);
    expect(copied).toBe(`${new URL(page.url()).origin}${entry}/results/${profile.id}`);
    expect(copied).not.toMatch(/SBTI50_|answers|count=|result=/);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.getByRole("button", { name: zh ? "复制此公开指南链接" : "Copy this public guide link", exact: true }).click();
    await expect(page.locator('#take-test [role="status"]')).toContainText(zh ? "未能复制" : "Copy did not succeed");
    await expect(page.getByRole("link", { name: zh ? "打开此公开指南" : "Open this public guide", exact: true })).toHaveAttribute("href", `${entry}/results/${profile.id}`);
    await page.reload();
    await page.getByRole("button", { name: zh ? "开始50组选择" : "Start 50 choices", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("radio").first().check();
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/sbti-test`);
    await page.getByRole("button", { name: other === "zh" ? "开始50组选择" : "Start 50 choices", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
  });
}
test("@release sbti50: all52 SSR pages, selected bilingual OGs and closed identifiers", async ({ page, request }) => {
  test.setTimeout(240000);
  await page.goto("/en/tests/explore/sbti-test");
  for (const locale of ["en", "zh"] as const) {
    for (const profile of [null, ...data.profiles]) {
      const path = `/${locale}/tests/explore/sbti-test${profile ? `/results/${profile.id}` : ""}`;
      const response = await request.get(path); expect(response.status()).toBe(200);
      const html = await response.text();
      const parsed = await page.evaluate(source => {
        const doc = new DOMParser().parseFromString(source, "text/html");
        return { body: doc.querySelector("h1")?.closest("main")?.textContent, title: doc.querySelector("h1")?.textContent,
          canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
          languages: [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map(e => [e.getAttribute("hreflang"), e.getAttribute("href")]),
          schemas: doc.querySelectorAll('script[type="application/ld+json"]').length };
      }, html);
      expect(parsed.title).toBe(profile ? profile.title[locale] : data.title[locale]);
      expect(parsed.canonical).toBe(`https://fermatmind.com${path}`);
      expect(parsed.schemas).toBe(2);
      expect(parsed.languages).toContainEqual(["en", `https://fermatmind.com/en${path.slice(3)}`]);
      expect(parsed.languages).toContainEqual(["zh-CN", `https://fermatmind.com/zh${path.slice(3)}`]);
      for (const section of profile ? profile.sections : data.guide) for (const p of section.paragraphs) expect(parsed.body?.includes(p[locale])).toBe(true);
    }
    for (const profile of [null, data.profiles[0], data.profiles[24]]) {
      const response = await request.get(`/og/fun/sbti-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(response.status()).toBe(200); const bytes = await response.body();
      expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/sbti-test/results/unknown", "/en/tests/play/sbti-test", "/og/fun/sbti-test?locale=de", "/og/fun/sbti-test?locale=en&portrait=unknown"]) expect((await request.get(path)).status()).toBe(404);
});
