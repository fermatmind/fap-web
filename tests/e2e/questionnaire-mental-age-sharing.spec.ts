import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { enterMentalAge, finishMentalAge, words } from "./helpers/mental-age";

for (const locale of ["en", "zh"] as const) {
  test(`@release mental-age classic ${locale}: poster failure, private real age, PNG and clipboard fallback`, async ({ page }) => {
    const copy = (en: string, zh: string) => words(locale, en, zh);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => { throw new Error("Synthetic clipboard denial"); } },
      });
    });
    await enterMentalAge(page, locale);
    await page.getByLabel(copy("Actual age (optional)", "实际年龄（选填）"), { exact: true }).fill("35");
    await page.getByRole("button", { name: copy("Begin questions", "开始答题"), exact: true }).click();
    await finishMentalAge(page, locale, 1, false, "choose");

    await expect(page.locator("[data-mental-age-comparison]")).toContainText("35");
    const card = page.locator("[data-archetype-honor-group]");
    const open = card.getByRole("button", { name: copy("Open image to save", "打开图片 / 长按保存"), exact: true });
    if (locale === "en") {
      const encoder = await page.evaluateHandle(() => HTMLCanvasElement.prototype.toBlob);
      try {
        await page.evaluate(() => { HTMLCanvasElement.prototype.toBlob = callback => callback(null); });
        await open.click();
        await expect(card.getByText("The card couldn’t be generated. Please try again.", { exact: true })).toBeVisible();
      } finally {
        await page.evaluate(value => { HTMLCanvasElement.prototype.toBlob = value; }, encoder);
        await encoder.dispose();
      }
    }

    await open.click();
    const preview = card.locator("dialog[open]");
    await expect(preview.getByRole("img")).toHaveAttribute("alt", /40/u);
    await expect(preview.getByRole("img")).not.toHaveAttribute("alt", /35/u);
    const downloaded = page.waitForEvent("download");
    await preview.getByRole("link", { name: copy("Download PNG", "下载图卡"), exact: true }).click();
    const bytes = await readFile((await (await downloaded).path())!);
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1080, 1440]);
    await preview.getByRole("button", { name: copy("Close image preview", "关闭图片预览"), exact: true }).click();

    await card.getByRole("button", { name: copy("Share Result", "一键分享给朋友"), exact: true }).click();
    const text = await card.locator("textarea").inputValue();
    expect(text).toMatch(/40 (?:years|岁)/u);
    expect(text).not.toMatch(/\b35\b|\b5\s*(?:years older|岁)\b|MAC_\d|actualAge|[?&](?:score|answers)/u);
    expect(text.split("\n").at(-1)).toBe(`https://fermatmind.com/${locale}/tests/explore/mental-age`);

    if (locale === "en") {
      await page.evaluate(() => {
        const matchMedia = window.matchMedia.bind(window);
        window.matchMedia = query => query === "(pointer: coarse)"
          ? new Proxy(matchMedia(query), { get: (target, key) => key === "matches" ? true : Reflect.get(target, key, target) })
          : matchMedia(query);
      });
      for (const outcome of ["cancel", "deny", "sent"] as const) {
        await page.evaluate(value => {
          Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
            if (!data.url?.endsWith("/en/tests/explore/mental-age")) throw new Error("Unexpected share URL");
            if (value === "cancel") throw new DOMException("Canceled", "AbortError");
            if (value === "deny") throw new DOMException("Denied", "NotAllowedError");
          } });
        }, outcome);
        await card.getByRole("button", { name: "Share Result", exact: true }).click();
        if (outcome === "deny") await expect(card.locator("textarea")).toHaveValue(text);
        else await expect(card.locator("textarea")).toHaveCount(0);
        if (outcome === "sent") await expect(card.getByText("Opened system sharing.", { exact: true })).toBeVisible();
      }
    }
  });
}
