import { readFile } from "node:fs/promises";
import { expect, type Page } from "@playwright/test";

export async function downloadResultPoster(page: Page, locale: "en" | "zh", slug: string) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-archetype-honor-group]").getByRole("button", {
      name: locale === "zh" ? "保存高清图卡" : "Save PNG Card",
      exact: true,
    }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(`fermatmind-${slug}-${locale}.png`);
  const bytes = await readFile((await download.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1080, 1440]);
  return download;
}

export async function expectResultPosterFailure(page: Page, locale: "en" | "zh") {
  const card = page.locator("[data-archetype-honor-group]");
  const original = await page.evaluateHandle(() => HTMLCanvasElement.prototype.toBlob);
  try {
    await page.evaluate(() => { HTMLCanvasElement.prototype.toBlob = callback => callback(null); });
    await card.getByRole("button", {
      name: locale === "zh" ? "保存高清图卡" : "Save PNG Card",
      exact: true,
    }).click();
    await expect(card.getByText(
      locale === "zh" ? "图卡暂时无法生成，请再试一次。" : "The card couldn’t be generated. Please try again.",
      { exact: true },
    )).toBeVisible();
  } finally {
    await page.evaluate(value => { HTMLCanvasElement.prototype.toBlob = value; }, original);
    await original.dispose();
  }
}
