import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/mental-age.json";

for (const locale of ["en", "zh"] as const) for (const width of [390, 1280]) {
  test(`@release mental-age ${locale} ${width}: complete attempt, local PNGs and sharing fallbacks`, async ({ page }) => {
    const zh = locale === "zh", label = (en: string, cn: string) => zh ? cn : en;
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false });
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard denial"); } } });
    });
    const leaked: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /MAGE_\d|playfulAge|"answers"|"points"/.test(request.postData() ?? "")) leaked.push(request.url()); });
    await page.goto(`/${locale}/tests/explore/mental-age`);
    const decline = page.getByRole("button", { name: label("Decline", "拒绝"), exact: true });
    await decline.waitFor({ state: "visible" });
    await decline.click();
    await page.locator("[data-questionnaire-take-entry] button[data-explore-start]").click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/tests/explore/mental-age/take`));
    const next = page.locator("[data-questionnaire-next]");
    await next.click(); await expect(page.getByRole("status")).toContainText(label("Choose an option", "请选择"));
    const point = width === 390 ? 0 : 3;
    for (const [i, question] of quiz.questions.entries()) {
      const option = question.options.find(value => value.score === point)!;
      await page.getByRole("radio", { name: option.label[locale], exact: true }).check();
      if (i < 11) await expect(page.getByRole("radio", { name: quiz.questions[i + 1].options[0].label[locale], exact: true })).toBeVisible();
      if (i === 0) {
        await page.getByRole("button", { name: label("Back", "上一题"), exact: true }).click();
        await expect(page.getByRole("radio", { name: option.label[locale], exact: true })).toBeChecked();
        await next.click();
      }
    }
    const age = point === 0 ? 18 : 90;
    await expect(page.locator("[data-mental-age-value]")).toHaveText(`${age}${zh ? "岁" : " years"}`);
    await expect(page.locator(`[data-mental-age-choice-count="${point}"]`)).toContainText("12 / 12");
    await expect(page.locator("[data-mental-age-choice-count]")).toHaveCount(4);
    const share = page.locator("[data-mental-age-sharing]");
    for (const [format, w, h] of [["landscape", 1200, 630], ["portrait", 1080, 1920]] as const) {
      await share.getByRole("combobox").selectOption(format);
      const pending = page.waitForEvent("download");
      await share.getByRole("button", { name: label("Save age card", "保存年龄分享卡"), exact: true }).click();
      const download = await pending, bytes = await readFile((await download.path())!);
      expect(download.suggestedFilename()).toBe(`fermatmind-mental-age-${locale}-${format}.png`);
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(w); expect(bytes.readUInt32BE(20)).toBe(h);
      await download.saveAs(test.info().outputPath(`${locale}-${format}.png`));
      await expect(share.getByRole("img")).toHaveAttribute("src", /^blob:/);
    }
    await share.getByRole("button", { name: label("Share age image", "分享年龄图片"), exact: true }).click();
    await expect(share.getByRole("status")).toContainText(label("Image sharing is unavailable", "此浏览器无法直接分享图片"));
    if (locale === "en" && width === 390) {
      // Exercise browser failures without sending a file to another application.
      const originalEncoder = await page.evaluateHandle(() => HTMLCanvasElement.prototype.toBlob);
      await page.evaluate(() => { HTMLCanvasElement.prototype.toBlob = callback => callback(null); });
      await share.getByRole("button", { name: "Save age card", exact: true }).click();
      await expect(share.getByRole("status")).toContainText("Could not create the image");
      await page.evaluate(encoder => { HTMLCanvasElement.prototype.toBlob = encoder; }, originalEncoder);
      const retry = page.waitForEvent("download");
      await share.getByRole("button", { name: "Save age card", exact: true }).click(); await retry;
      for (const outcome of ["cancel", "deny", "success"] as const) {
        await page.evaluate(value => {
          Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
          Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
            if (value === "cancel") throw new DOMException("Canceled", "AbortError");
            if (value === "deny") throw new DOMException("Denied", "NotAllowedError");
            if (data.files?.length !== 1 || data.files[0].type !== "image/png" || !data.files[0].size) throw new Error("Missing PNG");
          } });
        }, outcome);
        await share.getByRole("button", { name: "Share age image", exact: true }).click();
        await expect(share.getByRole("status")).toContainText(outcome === "cancel" ? "Sharing canceled" : outcome === "deny" ? "Image sharing is unavailable" : "Shared.");
      }
    }
    await page.getByRole("button", { name: label("Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("textbox")).toHaveValue(`${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/mental-age`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(leaked).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`${locale}-${width}-result.png`), fullPage: true });
    await page.getByRole("button", { name: label("Retake test", "重新测试"), exact: true }).click();
    await expect(page.locator("[data-mental-age-report]")).toHaveCount(0);
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
}
