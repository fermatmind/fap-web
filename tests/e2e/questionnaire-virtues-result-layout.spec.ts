import { test, expect } from "@playwright/test";
import source from "../../lib/questionnaires/data/seven-sins-virtues-test.json";

const tuples = [[3,3,3,4], [2,2,3,3], [3,3,4,4], [2,3,3,3], [3,3,3,3], [2,2,3,3], [3,3,3,3]];
for (const locale of ["zh", "en"] as const) for (const width of [390, 1440]) {
  test(`@release readable virtues result ${locale} ${width}: chart, disclosures, public copy and retake`, async ({ page }) => {
    const zh = locale === "zh", errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => {
      localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }));
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as Window & { copied?: string }).copied = text; } } });
    });
    const landing = `/${locale}/tests/explore/${source.slug}`;
    await page.goto(`${landing}/take`);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    for (let i = 0; i < source.questions.length; i++) {
      const question = source.questions[i];
      await expect(page.locator("#take-test h2")).toHaveText(question.prompt[locale]);
      await page.locator(`input[name="${question.id}"][value="${tuples[Math.floor(i / 4)][i % 4]}"]`).check();
    }
    const result = page.locator('[data-result-kind="mini-virtues"]');
    await expect(result).toBeVisible();
    await expect(result.locator(":scope > h2")).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.getByRole("img", { name: /雷达图|response-position radar/ })).toBeVisible();
    await expect(page.locator("[data-mini-virtues-position]")).toHaveText(["56%","38%","63%","44%","50%","38%","50%"]);
    await expect(page.locator("[data-mini-virtues-details][open]")).toHaveCount(0);
    await expect(result.locator("nav")).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath(`result-${locale}-${width}.png`), fullPage: true });
    await page.screenshot({ path: test.info().outputPath(`first-screen-${locale}-${width}.png`) });
    const first = page.locator("[data-mini-virtues-part]").first();
    await expect(first.locator("[data-mini-virtues-score]")).toHaveText(zh ? "原始总分 13 / 20 · 平均 3.25 / 5" : "Sum 13 / 20 · Mean 3.25 / 5");
    const summary = first.locator("summary");
    await summary.focus(); await page.keyboard.press("Enter");
    await expect(first.locator("details")).toHaveAttribute("open", "");
    await expect(first.getByRole("heading", { name: zh ? "这四道陈述观察什么" : "What the four statements cover", exact: true })).toBeVisible();
    await expect(page.locator("[data-mini-virtues-details][open]")).toHaveCount(1);
    await first.screenshot({ path: test.info().outputPath(`expanded-${locale}-${width}.png`) });
    await summary.click();
    await expect(first.locator("details")).not.toHaveAttribute("open");
    const common = page.locator("[data-mini-virtues-common]");
    await common.locator("summary").click();
    await expect(common.locator("[data-mini-virtues-equal]")).toBeVisible();
    await expect(common).not.toContainText(/24小时|24-hour|退出清除/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      await page.setViewportSize({ width: 320, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width, height: 1000 });
    }
    await page.getByRole("button", { name: zh ? "复制公开入口" : "Copy public entry", exact: true }).click();
    expect(await page.evaluate(() => (window as Window & { copied?: string }).copied)).toBe(`${source.title[locale]}\nhttps://fermatmind.com${landing}`);
    expect(new URL(page.url()).search).toBe("");
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("fm_questionnaire_draft:")))).toEqual([]);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("[data-mini-virtues-result]")).toHaveCount(0);
    await expect(page.locator("#take-test h2")).toHaveText(source.questions[0].prompt[locale]);
    await expect(page.locator("#take-test input:checked")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
