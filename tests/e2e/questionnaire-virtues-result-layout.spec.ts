import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import source from "../../lib/questionnaires/data/seven-sins-virtues-test.json";

const tuples = [[2, 4, 3, 5], [4, 4, 4, 4], [3, 4, 4, 4], [3, 3, 4, 3], [3, 4, 3, 4], [3, 3, 4, 4], [3, 3, 3, 4]];
const pairedScores = [["38","88"], ["75","75"], ["63","75"], ["63","50"], ["50","75"], ["63","63"], ["50","63"]];
const situations = {
  zh: ["会前准备的资料", "朋友想借相机", "新的合作很吸引你", "同伴得到你也想争取的机会", "做完费力的任务", "计划被打断时", "忙碌一周后"],
  en: ["notes you prepared", "borrow your camera", "A new collaboration", "A peer receives", "After a demanding task", "When someone interrupts", "After a busy week"],
};
for (const locale of ["zh", "en"] as const) for (const width of [390, 1440]) {
  test(`@release virtues completed reading ${locale} ${width}: dual-track cards and radar before seven full readings`, async ({ page }) => {
    const zh = locale === "zh", desktop = width === 1440, errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.addInitScript(() => {
      localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }));
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("Cancelled", "AbortError"); } });
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
    const readingIndex = result.getByRole("navigation", { name: zh ? "七组解读目录" : "Seven readings index" });
    await expect(result).toBeVisible();
    const board = result.locator("[data-seven-sins-board]");
    await expect(board.getByRole("heading", { level: 2 })).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    const sin = board.locator('[data-seven-sins-leader="sin"]');
    const virtue = board.locator('[data-seven-sins-leader="virtue"]');
    await expect(sin).toBeInViewport();
    await expect(virtue).toBeInViewport();
    await expect(sin).toContainText(zh ? "贪婪" : "Greed");
    await expect(virtue).toContainText(zh ? "谦卑" : "Humility");
    await expect(sin.locator("strong")).toHaveText("75");
    await expect(virtue.locator("strong")).toHaveText("88");
    await expect(board.locator("[data-seven-sins-balance]")).toContainText(zh ? "美德题组均值 70" : "Virtue item average 70");
    await expect(board.locator("[data-seven-sins-balance]")).toContainText(zh ? "七宗罪题组均值 57" : "Sin item average 57");
    const radar = board.getByRole("img", { name: zh ? "十四维人格雷达" : "14-Axis Personality Radar" });
    await expect(radar).toBeVisible();
    await expect(board.locator("[data-seven-sins-axis]")).toHaveText(["63","63","63","50","75","50","38","75","75","75","63","63","50","88"]);
    await expect(page.locator("[data-mini-virtues-details][open]")).toHaveCount(0);
    const report = result.locator("[data-mini-virtues-result]");
    const boardBox = (await board.boundingBox())!;
    const reportBox = (await report.boundingBox())!;
    expect(reportBox.x).toBe(boardBox.x);
    expect(reportBox.width).toBe(boardBox.width);
    expect(reportBox.y).toBeCloseTo(boardBox.y + boardBox.height, 0);
    await expect(result).toHaveCSS("background-color", "rgb(33, 23, 21)");
    await expect(report).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const radarBox = (await radar.boundingBox())!;
    const virtueBox = (await virtue.boundingBox())!;
    if (desktop) {
      expect(boardBox.width).toBeGreaterThan(1000);
      expect(radarBox.x).toBeGreaterThan(virtueBox.x + virtueBox.width);
      await expect(radar).toBeInViewport({ ratio: 1 });
    } else {
      expect(radarBox.y).toBeGreaterThan(virtueBox.y + virtueBox.height);
    }
    await page.screenshot({ path: test.info().outputPath(`virtues-first-screen-${locale}-${width}.png`) });
    await board.screenshot({ path: test.info().outputPath(`seven-sins-board-${locale}-${width}.png`) });
    if (desktop) {
      await expect(chooser).toBeHidden();
      await expect(readingIndex.getByRole("link")).toHaveCount(7);
      await board.getByRole("link", { name: zh ? "查看七组解读" : "Explore the seven readings" }).click();
      await expect(report.getByRole("heading", { level: 2 })).toBeFocused();
      expect((await readingIndex.boundingBox())!.x).toBeLessThan((await first.boundingBox())!.x);
    } else {
      await expect(readingIndex).toBeHidden();
      await expect(chooser).toBeVisible();
      await expect(chooser.locator("option")).toHaveCount(7);
      await report.getByRole("heading", { level: 2 }).scrollIntoViewIfNeeded();
    }
    await page.mouse.move(width - 1, 1);
    await page.screenshot({ path: test.info().outputPath(`seven-sins-readings-${locale}-${width}.png`) });
    // Start with another group so every selection exercises a real change, including the first group.
    for (const direction of [...source.directions.slice(1), source.directions[0]]) {
      const index = source.directions.findIndex(candidate => candidate.id === direction.id);
      const part = page.locator(`[data-mini-virtues-part="${direction.id}"]`);
      if (desktop) await readingIndex.getByRole("link", { name: direction.title[locale], exact: true }).click();
      else await chooser.selectOption(direction.id);
      const title = part.getByRole("heading", { level: 3 });
      await expect(title).toBeFocused();
      await expect(title).toBeInViewport({ ratio: 1 });
      expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(60);
      await expect(part.locator("[data-mini-virtues-score] strong")).toHaveText(pairedScores[index]);
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
    const common = page.locator("[data-mini-virtues-common]");
    await common.locator(":scope > summary").click();
    await expect(common).toContainText(source.guide[0].paragraphs[0][locale]);
    await expect(common).not.toContainText(/24小时|24-hour|退出清除/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (desktop) {
      await page.setViewportSize({ width: 900, height: 768 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width: 899, height: 768 });
      await expect(chooser).toBeVisible();
      await page.setViewportSize({ width, height: 1000 });
    } else {
      await page.setViewportSize({ width: 320, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width, height: 844 });
    }
    const personal = page.getByRole("region", { name: zh ? "个人结果图片" : "Personal result image", exact: true });
    let downloads = 0; page.on("download", () => downloads++);
    const downloadPromise = page.waitForEvent("download");
    await personal.getByRole("button", { name: zh ? "保存结果PNG" : "Save result PNG", exact: true }).click();
    const download = await downloadPromise;
    await download.saveAs(test.info().outputPath(`seven-sins-card-${locale}-${width}.png`));
    const bytes = await readFile((await download.path())!);
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1080, 1440]);
    expect((await personal.getByRole("img").getAttribute("alt"))?.match(/\/100/g)).toHaveLength(14);
    await personal.getByRole("button", { name: zh ? "分享结果图片" : "Share result image", exact: true }).click();
    await expect(personal.getByRole("status")).toContainText(zh ? "已取消分享" : "Sharing cancelled");
    expect(downloads).toBe(1);
    await page.evaluate(() => { HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext; });
    await personal.getByRole("button", { name: zh ? "保存结果PNG" : "Save result PNG", exact: true }).click();
    await expect(personal.getByRole("status")).toContainText(zh ? "图片暂未生成" : "could not be generated");
    expect(downloads).toBe(1);
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

for (const width of [320, 1440]) {
  test(`@release Taiwan virtues ${width}: back and refresh, all ties, public guides and local PNG`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const analytics: string[] = [], errors: string[] = [];
    page.on("request", request => { if (/\/api\/track(?:\?|$)/.test(request.url())) analytics.push(request.url()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied for QA"); } } });
    });
    const entry = "/zh-TW/tests/explore/seven-sins-virtues-test";
    await page.goto(entry);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("七宗罪與七美德測試");
    await page.getByRole("link", { name: "開始免費測試", exact: true }).click();
    await page.getByRole("button", { name: "下一題", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("請選擇一個選項");
    await page.getByRole("radio").nth(2).check();
    await page.getByRole("button", { name: "下一題", exact: true }).click();
    await page.getByRole("button", { name: "上一題", exact: true }).click();
    await expect(page.getByRole("radio").nth(2)).toBeChecked();
    await page.getByRole("button", { name: "下一題", exact: true }).click();
    await page.reload();
    await expect(page.locator("input:checked")).toHaveCount(0);
    for (let index = 0; index < 28; index++) {
      await page.getByRole("radio").nth(2).check();
      await page.getByRole("button", { name: index === 27 ? "查看結果" : "下一題", exact: true }).click();
    }
    await expect(page.locator('[data-stage="result"]')).toBeVisible();
    await expect(page.locator("[data-seven-sins-axis]")).toHaveText(Array(14).fill("50"));
    await expect(page.locator("[data-seven-sins-leader]")).toContainText(["並列", "並列"]);
    await expect(page.locator("#seven-sins-readings article")).toHaveCount(7);
    const guide = page.getByRole("link", { name: "開啟完整公開指南（新分頁）", exact: true }).first();
    const popupPromise = page.waitForEvent("popup"); await guide.click(); const popup = await popupPromise;
    await expect(popup.getByRole("heading", { level: 1 })).toBeVisible(); await popup.close();
    await expect(page.locator('[data-stage="result"]')).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "儲存結果PNG", exact: true }).click();
    const download = await downloadPromise;
    await download.saveAs(test.info().outputPath(`seven-sins-card-zh-TW-${width}.png`));
    const bytes = await readFile((await download.path())!);
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    const preview = page.getByRole("region", { name: "個人結果圖片" }).getByRole("img");
    expect((await preview.getAttribute("alt"))?.match(/★/g)).toHaveLength(14);
    await page.getByRole("button", { name: "複製公開入口", exact: true }).click();
    const manual = page.getByRole("textbox", { name: "手動複製公開入口", exact: true });
    await expect(manual).toHaveValue(`七宗罪與七美德測試\nhttps://fermatmind.com${entry}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "重新測試", exact: true }).click();
    await expect(page.locator("input:checked")).toHaveCount(0);
    expect(errors).toEqual([]); expect(analytics).toEqual([]);
  });
}
