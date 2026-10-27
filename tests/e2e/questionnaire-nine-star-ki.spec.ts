import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { NineStarYearQuestionnaire } from "../../lib/questionnaires/nineStarYear";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nine-star-ki.json", "utf8")) as NineStarYearQuestionnaire;
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }))); });
async function fill(page: Page, locale: "en" | "zh", year: string, side: "before-boundary" | "after-boundary" | "uncertain") {
  await page.locator("#nine-star-year").fill(year); await page.locator(`input[name="nine-star-boundary-side"][value="${side}"]`).check();
  await page.getByRole("button", { name: locale === "zh" ? "查看节年参考" : "Show year reference", exact: true }).click();
  await expect(page.locator("[data-nine-star-result]")).toBeVisible();
}
async function checkGuides(page: Page, locale: "en" | "zh", stars: number[]) {
  const result = page.locator("[data-nine-star-result]");
  expect(await result.locator("[data-nine-star-value]").evaluateAll(nodes => nodes.map(n => Number(n.getAttribute("data-nine-star-value"))))).toEqual(stars);
  await expect(result.locator("[data-nine-star-guide]")).toHaveCount(stars.length);
  for (const star of stars) {
    const p = quiz.profiles.find(p => p.star === star)!, guide = result.locator(`[data-nine-star-guide="${p.id}"]`);
    for (const s of p.sections) for (const text of s.paragraphs) await expect(guide).toContainText(text[locale]);
    await expect(result.locator(`a[href="/${locale}/tests/explore/nine-star-ki/results/${p.id}"]`)).toHaveCount(1);
  }
  expect(new URL(page.url()).search).toBe(""); expect(new URL(page.url()).hash).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator("#nine-star-result-title")).toBeFocused();
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/nine-star-ki`, submit = zh ? "查看节年参考" : "Show year reference";
  test(`@release nine-star-year ${locale}: real directory, explicit before/after and both uncertain full cultural guides`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /boundarySide|before-boundary|after-boundary|inputYear/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${locale}/tests`); const card = page.locator("#more-tests article").filter({ has: page.getByRole("link", { name: quiz.title[locale], exact: true }) });
    await expect(card).toContainText(zh ? "年份与立春界点 · 九篇完整文化指南" : "Year & Spring boundary · Nine complete cultural guides"); await expect(card).not.toContainText(/0\s*题|0 questions/); await card.getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    await expect(page.locator("#nine-star-public-guides").locator("..").getByRole("link")).toHaveCount(9); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0);
    await expect(page.locator("#nine-star-year")).toHaveValue(""); await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await fill(page, locale, "2025", "before-boundary"); await checkGuides(page, locale, [3]); await expect(page.locator("[data-nine-star-season-year]")).toHaveText("2024");
    await expect(page.locator("[data-nine-star-result-boundary]")).toHaveText("2025-02-03 23:10 JST (UTC+09:00)");
    await page.locator('input[value="after-boundary"]').check(); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0); await page.getByRole("button", { name: submit, exact: true }).click(); await checkGuides(page, locale, [2]);
    await page.locator('input[value="uncertain"]').check(); await page.getByRole("button", { name: submit, exact: true }).click(); await checkGuides(page, locale, [3, 2]);
    await expect(page.locator('[data-nine-star-certainty="two-possibilities"]')).toBeVisible();
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:nine-star-ki"))).toBeNull();
  });
  test(`@release nine-star-year ${locale}: required year and side, unsupported future, keyboard selection, edits and clearing`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(entry);
    await page.getByRole("button", { name: submit, exact: true }).click(); await expect(page.locator("#nine-star-year")).toBeFocused(); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0);
    await page.locator("#nine-star-year").fill("2027"); await page.getByRole("button", { name: submit, exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "其他年份" : "other years");
    await page.locator("#nine-star-year").fill("2021"); await expect(page.locator("[data-nine-star-preview-boundary]")).toHaveText("2021-02-03 23:59 JST (UTC+09:00)");
    await page.getByRole("button", { name: submit, exact: true }).click(); await expect(page.locator('input[value="before-boundary"]')).toBeFocused();
    await page.locator('input[value="before-boundary"]').press("ArrowDown"); await expect(page.locator('input[value="after-boundary"]')).toBeChecked();
    await page.getByRole("button", { name: submit, exact: true }).press("Enter"); await checkGuides(page, locale, [6]);
    await page.locator("#nine-star-year").fill("1927"); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0); await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await page.locator('input[value="after-boundary"]').check(); await page.getByRole("button", { name: submit, exact: true }).click(); await checkGuides(page, locale, [1]);
    await page.getByRole("button", { name: zh ? "清除输入与结果" : "Clear input and result", exact: true }).click(); await expect(page.locator("#nine-star-year")).toHaveValue(""); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0); await expect(page.locator("#nine-star-year")).toBeFocused();
  });
  test(`@release nine-star-year ${locale}: storage and clipboard denial, public-only links, reload/language/history remove private input`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.includes("nine-star-ki")) throw Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.includes("nine-star-ki")) throw Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await fill(page, locale, "2025", "uncertain"); await checkGuides(page, locale, [3, 2]);
    await page.getByRole("button", { name: zh ? "复制公开指南链接" : "Copy public guide links", exact: true }).click();
    const copied = await page.getByRole("textbox", { name: zh ? "手动复制文字" : "Text for manual copying", exact: true }).inputValue();
    expect(copied).toBe([3, 2].map(star => { const p = quiz.profiles.find(p => p.star === star)!; return `${p.title[locale]}\nhttps://fermatmind.com${entry}/results/${p.id}`; }).join("\n\n"));
    expect(copied).not.toMatch(/2025|2024|23:10|before-boundary|after-boundary|[?&](?:year|side|birth|result)=/);
    await page.locator("#nine-star-year").fill("1928"); await expect(page.locator("textarea")).toHaveCount(0); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0);
    await page.reload(); await expect(page.locator("#nine-star-year")).toHaveValue(""); await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await fill(page, locale, "1928", "after-boundary"); await checkGuides(page, locale, [9]);
    await page.goto(`/${zh ? "en" : "zh"}/tests/explore/nine-star-ki`); await expect(page.locator("#nine-star-year")).toHaveValue(""); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0);
    await page.goBack(); await expect(page.locator("#nine-star-year")).toHaveValue(""); await expect(page.locator("[data-nine-star-result]")).toHaveCount(0);
  });
}
test("@release nine-star-year all20 native pages/images, complete culture/source, independent SEO, closed identities and ignored private projections", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/nine-star-ki/results/${p.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo.description[locale]);
      for (const s of p.sections) { const section = page.locator(`#nine-star-public-${p.id}-${s.id}`); await expect(section.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(section).toContainText(text[locale]); }
      await expect(page.locator("input, [data-nine-star-result]")).toHaveCount(0); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/nine-star-ki/results/${p.id}`);
      await expect(page.getByRole("link", { name: locale === "zh" ? "查看节年规则与条件计算" : "See the year rule and conditional calculation", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/nine-star-ki`);
      await expect(page.getByRole("navigation", { name: locale === "zh" ? "其他九星文化指南" : "Other Nine Star cultural guides", exact: true }).getByRole("link")).toHaveCount(8);
    }
    for (const p of [null, ...quiz.profiles]) {
      const path = `/og/fun/nine-star-ki?locale=${locale}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(path);
      expect(r.status()).toBe(200); expect(r.headers()["content-type"]).toContain("image/png"); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      const extra = await request.get(path + "&year=2025&side=uncertain&birth=SYNTHETIC_PRIVATE"); expect(extra.status()).toBe(200); expect(await extra.body()).toEqual(bytes);
    }
  }
  for (const path of ["/en/tests/explore/nine-star-ki/results/lucky", "/zh/tests/explore/nine-star-ki/results/one", "/og/fun/nine-star-ki?portrait=lucky", "/og/fun/nine-star-ki?locale=fr", "/en/tests/play/nine-star-ki"])
    expect((await request.get(path)).status()).toBe(404);
});
