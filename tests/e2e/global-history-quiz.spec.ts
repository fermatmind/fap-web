import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const locale of ["zh", "en"] as const) {
  test(`@release ${locale} World Edition matches one figure and exports the illustrated card`, async ({ page, browser }) => {
    const zh = locale === "zh";
    if (zh) await page.setViewportSize({ width: 390, height: 844 });
    const root = `/${locale}/tests/play/global-history-quiz`;
    await page.goto(root);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(zh ? "全球卷" : "World Edition");
    await page.getByTestId("cookie-banner-decline").click();
    await page.getByRole("button", { name: zh ? /开始测试/ : /Start quiz/ }).click();
    await page.getByRole("button", { name: zh ? /走进展馆/ : /Enter the museum/ }).click();
    const options = page.locator('[data-stage="answer"]').getByRole("button").filter({ has: page.locator('span[aria-hidden="true"]') });
    await expect(options).toHaveCount(4);
    await options.first().click();
    await page.getByRole("button", { name: zh ? "返回上一题" : "Previous question" }).click();
    for (let step = 1; step <= 12; step++) {
      await expect(page.locator('[data-stage="answer"]')).toContainText(zh ? `第 ${step} / 12 题` : `Question ${step} of 12`);
      await options.first().click();
    }
    const result = page.locator("[data-global-history-result]");
    await expect(result).toHaveCount(1);
    const id = await result.getAttribute("data-global-history-result");
    expect(page.url()).toContain(`${root}/results/${id}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(zh ? 390 : 1280);
    await expect(page.locator("#history-closest")).toBeVisible();
    await expect(page.locator("#history-reflection")).toBeVisible();
    await expect.poll(() => result.getByRole("img").evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(720);
    const downloadLink = result.getByRole("link", { name: zh ? "下载人物卡 PNG" : "Download portrait PNG" });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadLink.click()]);
    expect(download.suggestedFilename()).toBe(`fermatmind-history-${id}-${locale}.png`);
    const bytes = await readFile(await download.path());
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([840, 1200]);
    const open = await page.request.get((await result.getByRole("link", { name: zh ? "打开图片" : "Open image" }).getAttribute("href"))!);
    expect(open.headers()["content-type"]).toContain("image/png");
    expect(open.headers()["content-disposition"]).toBeUndefined();
    await expect(page.locator("#people li")).toHaveCount(24);
    await page.getByRole("link", { name: zh ? "下一页" : "Next page" }).click();
    await expect(page.locator("#people")).toContainText(zh ? "第 2 / 9 页" : "Page 2 of 9");
    await expect(page.locator("[data-global-history-result]")).toHaveAttribute("data-global-history-result", id!);

    const visitor = await browser.newPage();
    try {
      await visitor.goto(page.url().split("?")[0]);
      await expect(visitor.locator("[data-global-history-result]")).toHaveAttribute("data-global-history-result", id!);
      await expect(visitor.locator("#history-closest")).toHaveCount(0);
      await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    } finally {
      await visitor.close();
    }
    expect((await page.request.get(`${root}/results/jorge-luis-borges`)).status()).toBe(404);
    expect((await page.request.get(`/og/fun/global-history-quiz?locale=${locale}&portrait=jorge-luis-borges`)).status()).toBe(404);
  });
}
