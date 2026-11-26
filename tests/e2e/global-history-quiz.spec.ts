import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const locale of ["zh", "zh-TW", "en"] as const) {
  test(`@release ${locale} World Edition matches one figure and exports the illustrated card`, async ({ page, browser }) => {
    const zh = locale !== "en";
    if (zh) await page.setViewportSize({ width: 390, height: 844 });
    const root = `/${locale}/tests/explore/global-history-quiz`;
    await page.goto(root);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(zh ? /全球[卷篇]/ : "World Edition");
    if (locale !== "zh-TW") await page.getByTestId("cookie-banner-decline").click();
    await page.locator("#take-test").getByRole("button", { name: zh ? /开始测试|開始測驗|開始測試/ : /Start quiz/ }).click();
    await page.getByRole("button", { name: zh ? /走进展馆|走進展館/ : /Enter the museum/ }).click();
    const options = page.locator('[data-stage="answer"]').getByRole("button").filter({ has: page.locator('span[aria-hidden="true"]') });
    await expect(options).toHaveCount(4);
    await options.first().click();
    await page.getByRole("button", { name: zh ? /返回上一[题題]/ : "Previous question" }).click();
    for (let step = 1; step <= 12; step++) {
      await expect(page.locator('[data-stage="answer"]')).toContainText(zh ? new RegExp(`第 ${step} / 12 [题題]`) : `Question ${step} of 12`);
      await options.first().click();
    }
    const result = page.locator("[data-global-history-result]");
    await expect(result).toHaveCount(1);
    const id = await result.getAttribute("data-global-history-result");
    expect(page.url()).toContain(`${root}/results/${id}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(zh ? 390 : 1280);
    await expect(result.locator('[data-history-state="matched"]')).toBeVisible();
    await expect(page.locator("#history-why")).toBeVisible();
    await expect(result.locator("#behavior-coding [data-history-figure-point]")).toHaveCount(6);
    await expect(result.locator("#behavior-coding [data-history-own-point]")).toHaveCount(6);
    await expect(result.getByRole("link", { name: zh ? /再[测測]一次/ : "Play again" })).toBeVisible();
    for (const slug of ["iq-test-intelligence-quotient-assessment", "mbti-personality-test-16-personality-types", "big-five-personality-test-ocean-model"]) {
      await expect(result.locator(`section#alternative-readings a[href="/${locale}/tests/${slug}"]`)).toBeVisible();
    }
    const portrait = result.locator(`img[src="/images/global-history/${id}.jpg"]`);
    await expect(portrait).toHaveCount(1);
    await expect.poll(() => portrait.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const downloadButton = result.getByRole("button", { name: zh ? /保存高清人物卡|下载人物卡 PNG|儲存高畫質人物卡/ : /Save portrait|Download portrait PNG/ });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe(`fermatmind-history-${id}-${locale}.png`);
    const bytes = await readFile(await download.path());
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([900, 1200]);
    await result.getByRole("button", { name: zh ? /打开图片|開啟圖片/ : /Open image/ }).click();
    const dialog = result.getByRole("dialog");
    const preview = dialog.locator("img");
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await expect.poll(() => preview.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(900);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    const directory = result.locator("details").filter({ hasText: zh ? /浏览全部 488 位历史人物|瀏覽全部 488 位歷史人物/ : /Browse all 488 historical figures/ });
    await directory.locator("summary").click();
    await expect(directory.getByRole("listitem")).toHaveCount(488);
    await expect(result).toHaveAttribute("data-global-history-result", id!);

    const visitor = await browser.newPage();
    try {
      await visitor.goto(page.url().split("?")[0]);
      await expect(visitor.locator("[data-global-history-result]")).toHaveAttribute("data-global-history-result", id!);
      await expect(visitor.locator('[data-history-state="public"]')).toBeVisible();
      await expect(visitor.locator('[data-history-state="matched"]')).toHaveCount(0);
      await expect(visitor.locator("#history-why")).toHaveCount(0);
      await expect(visitor.getByRole("link", { name: zh ? /再[测測]一次/ : "Play again" })).toHaveCount(0);
      await expect(visitor.locator("main #behavior-coding")).toBeVisible();
      await expect(visitor.locator("main #behavior-coding [data-history-own-point]")).toHaveCount(0);
      await expect(visitor.locator("main #core-facts")).toBeVisible();
      await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content", /^index, follow/);
    } finally {
      await visitor.close();
    }
    expect((await page.request.get(`${root}/results/jorge-luis-borges`)).status()).toBe(404);
    expect((await page.request.get(`/og/fun/global-history-quiz?locale=${locale}&portrait=jorge-luis-borges`)).status()).toBe(404);
  });
}

for (const locale of ["zh", "zh-TW", "en"] as const) {
  test(`@release ${locale} public historical profiles identify the person in the first viewport`, async ({ page }) => {
    const root = `/${locale}/tests/explore/global-history-quiz/results`;
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      for (const figure of ["leonardo-da-vinci", "ernest-rutherford", "wu-zetian"]) {
        await page.goto(`${root}/${figure}`);
        const main = page.locator("main");
        await expect(main).toHaveCount(1);
        const heading = main.getByRole("heading", { level: 1 });
        await expect(heading).toBeVisible();
        const h1 = await heading.boundingBox();
        const summary = await heading.locator("..").locator("p").last().boundingBox();
        expect(h1).not.toBeNull();
        expect(summary).not.toBeNull();
        expect(h1!.width).toBeGreaterThan(20);
        expect(h1!.y + h1!.height).toBeLessThan(320);
        expect(summary!.y).toBeLessThan(480);
        await expect(main).not.toContainText(/你和他是同一[型類]|你的隐藏超能力|你的隱藏超能力|Your hidden superpower/);
        if (locale === "zh-TW") {
          await expect(main.locator("#behavior-coding")).toContainText("連結不同領域");
          await expect(main.locator("#behavior-coding")).not.toContainText("連線不同領域");
          if (figure === "ernest-rutherford") {
            await expect(main.locator("#faq")).toContainText("拉塞福");
            await expect(main.locator("#faq")).not.toContainText("盧瑟福");
          }
        }
        if (viewport.width === 1280) {
          const readings = await main.locator("[data-history-alternative] a").evaluateAll(links =>
            links.map(link => link.getAttribute("href")));
          const references = await main.locator("#references ol a").evaluateAll(links =>
            links.map(link => link.getAttribute("href")));
          expect(readings.length).toBeGreaterThan(0);
          expect(new Set(references).size).toBe(references.length);
          for (const reading of readings) expect(references).toContain(reading);

          const portraits = main.locator("#related-figures [data-peer-group] img");
          expect(await portraits.count()).toBeGreaterThan(0);
          for (const portrait of await portraits.all()) {
            await portrait.scrollIntoViewIfNeeded();
            expect(await portrait.evaluate(async img => {
              if (!(img instanceof HTMLImageElement)) throw new Error("Expected a related-figure portrait image");
              await img.decode();
              return img.naturalWidth;
            })).toBeGreaterThan(0);
          }
        }
      }
    }
  });
}
