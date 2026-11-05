import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`@release Chang’an ${locale} shows one illustrated result and downloads a PNG`, async ({ page }) => {
    const zh = locale === "zh";
    if (zh) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}/tests/play/changan-history-quiz`);
    await page.getByRole("button", { name: zh ? /开始测试/ : /Start quiz/ }).click();
    await page.getByRole("button", { name: zh ? /推开长安城门/ : /Enter Chang’an/ }).click();
    for (let index = 0; index < 6; index += 1) {
      if (index === 4) await page.getByRole("button", { name: zh ? /去西市/ : /Visit the market/ }).click();
      const answerStage = page.locator('[data-stage="answer"]');
      await expect(answerStage).toContainText(zh ? `第 ${index + 1} / 6 题` : `Question ${index + 1} of 6`);
      const options = answerStage.getByRole("button");
      await expect(options).toHaveCount(4);
      await options.first().click();
    }

    // The first option in each scene supports a different figure. All six
    // tie, so the figure supported first is the sole result in either locale.
    const result = page.locator("[data-changan-result]");
    await expect(result).toHaveCount(1);
    await expect(result).toHaveAttribute("data-changan-result", "wu-zetian");
    await expect(result.getByRole("heading", { level: 2 })).toHaveText(zh ? "武则天" : "Wu Zetian");
    await expect.poll(() => result.getByRole("img").evaluate(image => (image as HTMLImageElement).naturalWidth), { timeout: 15000 }).toBe(720);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(zh ? 390 : 1280);

    const downloadLink = result.getByRole("link", { name: zh ? "下载人物卡 PNG" : "Download portrait PNG" });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadLink.click()]);
    expect(download.suggestedFilename()).toBe(`fermatmind-changan-wu-zetian-${locale}.png`);
    const image = await readFile(await download.path());
    expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([image.readUInt32BE(16), image.readUInt32BE(20)]).toEqual([840, 1200]);
    const preview = await page.request.get((await result.getByRole("link", { name: zh ? "打开图片" : "Open image" }).getAttribute("href"))!);
    expect(preview.headers()["content-type"]).toContain("image/png");
    expect(preview.headers()["content-disposition"]).toBeUndefined();
    await result.getByRole("button", { name: zh ? "再玩一次" : "Play again" }).click();
    await expect(page.locator("[data-changan-result]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: zh ? /推开长安城门/ : /Enter Chang’an/ })).toBeVisible();
  });
}
