import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const locale of ["zh", "en"] as const) {
  test(`@release ${locale} World Edition matches one figure and exports the illustrated card`, async ({ page, browser }) => {
    const zh = locale === "zh";
    if (zh) await page.setViewportSize({ width: 390, height: 844 });
    const root = `/${locale}/tests/explore/global-history-quiz`;
    await page.goto(root);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(zh ? "全球卷" : "World Edition");
    await page.getByTestId("cookie-banner-decline").click();
    await page.locator("#take-test").getByRole("button", { name: zh ? /开始测试/ : /Start quiz/ }).click();
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
    await expect(result.locator('[data-history-state="matched"]')).toBeVisible();
    await expect(page.locator("#history-why")).toBeVisible();
    await expect.poll(() => result.locator('img[src*="/og/fun/global-history-quiz"]').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const downloadButton = result.getByRole("button", { name: zh ? /保存高清人物卡|下载人物卡 PNG/ : /Save portrait|Download portrait PNG/ });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe(`fermatmind-history-${id}-${locale}.png`);
    const bytes = await readFile(await download.path());
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([900, 1200]);
    await result.getByRole("button", { name: zh ? /打开图片/ : /Open image/ }).click();
    const preview = result.locator("[data-history-poster-preview] img");
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await expect.poll(() => preview.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(900);
    const directory = result.locator("details").filter({ hasText: zh ? /浏览全部 488 位历史人物/ : /Browse all 488 historical figures/ });
    await directory.locator("summary").click();
    await expect(directory.getByRole("listitem")).toHaveCount(488);
    await expect(result).toHaveAttribute("data-global-history-result", id!);

    const visitor = await browser.newPage();
    try {
      await visitor.goto(page.url().split("?")[0]);
      await expect(visitor.locator("[data-global-history-result]")).toHaveAttribute("data-global-history-result", id!);
      await expect(visitor.locator('[data-history-state="public"]')).toBeVisible();
      await expect(visitor.locator('[data-history-state="matched"]')).toHaveCount(0);
      await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content", /^index, follow/);
    } finally {
      await visitor.close();
    }
    expect((await page.request.get(`${root}/results/jorge-luis-borges`)).status()).toBe(404);
    expect((await page.request.get(`/og/fun/global-history-quiz?locale=${locale}&portrait=jorge-luis-borges`)).status()).toBe(404);
  });
}
