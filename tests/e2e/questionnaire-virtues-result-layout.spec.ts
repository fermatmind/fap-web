import { test, expect } from "@playwright/test";
import source from "../../lib/questionnaires/data/seven-sins-virtues-test.json";

const tuples = [[3,3,3,4], [2,2,3,3], [3,3,4,4], [2,3,3,3], [3,3,3,3], [2,2,3,3], [3,3,3,3]];
const means = ["3.25", "2.50", "3.50", "2.75", "3.00", "2.50", "3.00"];
const situations = {
  zh: ["会前准备的资料", "朋友想借相机", "新的合作很吸引你", "同伴得到你也想争取的机会", "做完费力的任务", "计划被打断时", "忙碌一周后"],
  en: ["notes you prepared", "borrow your camera", "A new collaboration", "A peer receives", "After a demanding task", "When someone interrupts", "After a busy week"],
};
for (const locale of ["zh", "en"] as const) for (const width of [390, 1440]) {
  test(`@release virtues completed reading ${locale} ${width}: understandable first screen, seven perspectives and optional evidence`, async ({ page }) => {
    const zh = locale === "zh", errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
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
      await expect(page.locator("[data-mini-virtues-result]")).toHaveCount(0);
      await page.locator(`input[name="${question.id}"][value="${tuples[Math.floor(i / 4)][i % 4]}"]`).check();
    }
    const result = page.locator('[data-result-kind="mini-virtues"]');
    const first = page.locator("[data-mini-virtues-part]").first();
    const chooser = result.getByRole("combobox");
    await expect(result).toBeVisible();
    await expect(result.locator(":scope > h2")).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(first.getByRole("heading", { level: 3 })).toBeInViewport();
    await expect(first.locator("[data-mini-virtues-score] strong")).toHaveText("3.25 / 5");
    await expect(first.locator("[data-mini-virtues-score]")).toBeInViewport({ ratio: 1 });
    await expect(first.getByText(source.profiles[0].summary[locale], { exact: true })).toBeInViewport();
    await expect(result.getByText(zh ? /1—5表示对本组四句话的符合程度/ : /The 1–5 mean describes agreement with four statements/)).toBeInViewport();
    await expect(page.locator("[data-mini-virtues-chart][open]")).toHaveCount(0);
    await expect(page.locator("[data-mini-virtues-details][open]")).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath(`virtues-first-screen-${locale}-${width}.png`) });
    await expect(chooser.locator("option")).toHaveCount(7);
    // Start with another group so every selection exercises a real change, including the first group.
    for (const direction of [...source.directions.slice(1), source.directions[0]]) {
      const index = source.directions.findIndex(candidate => candidate.id === direction.id);
      const part = page.locator(`[data-mini-virtues-part="${direction.id}"]`);
      await chooser.selectOption(direction.id);
      const title = part.getByRole("heading", { level: 3 });
      await expect(title).toBeFocused();
      await expect(title).toBeInViewport({ ratio: 1 });
      expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(60);
      await expect(part.locator("[data-mini-virtues-score] strong")).toHaveText(`${means[index]} / 5`);
      const situation = part.locator("[data-mini-virtues-everyday]");
      const action = part.locator("[data-mini-virtues-action]");
      await expect(situation).toContainText(situations[locale][index]);
      await expect(action.locator("p")).not.toBeEmpty();
      expect(await situation.evaluate(element => element.closest("details") === null)).toBe(true);
      expect(await action.evaluate(element => element.closest("details") === null)).toBe(true);
    }
    const summary = first.locator("[data-mini-virtues-details] > summary");
    await summary.focus(); await page.keyboard.press("Enter");
    await expect(first.locator("details")).toHaveAttribute("open", "");
    await expect(first.getByRole("heading", { name: zh ? "这四道陈述观察什么" : "What the four statements cover", exact: true })).toBeVisible();
    await first.screenshot({ path: test.info().outputPath(`virtues-explanation-${locale}-${width}.png`) });
    await summary.click();
    const chart = page.locator("[data-mini-virtues-chart]");
    await chart.locator(":scope > summary").click();
    await expect(page.getByRole("img", { name: /雷达图|response-position radar/ })).toBeVisible();
    await expect(page.locator("[data-mini-virtues-radar-value]")).toHaveText(["56%","38%","63%","44%","50%","38%","50%"]);
    const common = page.locator("[data-mini-virtues-common]");
    await common.locator(":scope > summary").click();
    await expect(common.locator("[data-mini-virtues-equal]")).toBeVisible();
    await expect(common).not.toContainText(/24小时|24-hour|退出清除/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      await page.setViewportSize({ width: 320, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width, height: 844 });
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
