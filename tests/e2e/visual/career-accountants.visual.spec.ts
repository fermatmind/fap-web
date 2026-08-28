import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-375", width: 375, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
] as const;

for (const locale of ["zh", "en"] as const) {
  for (const viewport of viewports) {
    test(`accountants accepted dossier ${locale} ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/${locale}/career/jobs/accountants-and-auditors`, { waitUntil: "domcontentloaded" });

      const surface = page.getByTestId("career-display-surface");
      await expect(surface).toHaveAttribute("data-career-dossier-plan", "content_v3");
      await expect(page.getByTestId("career-display-hero")).toBeVisible();
      await expect(page.getByTestId("career-dossier-toc").locator("a")).toHaveCount(11);
      await expect(page.locator('[data-career-api-list="market_signal_card.outlook_evidence"] > article')).toHaveCount(3);
      await expect(page.locator('[data-career-api-list="market_signal_card.transitions"] > a')).toHaveCount(8);
      await expect(page.getByTestId("career-dossier-outlook-transitions").locator("footer a")).toHaveCount(4);
      await expect(page.locator("table").first()).toBeVisible();
      await expect(page.locator('[data-content-block-id="source-register"]')).toHaveCount(0);
      await expect(page.getByRole("heading", { name: locale === "zh" ? "使用边界" : "Usage boundaries", exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: locale === "zh" ? "复核有效期" : "Review validity", exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: locale === "zh" ? "下一步行动" : "Next action", exact: true })).toHaveCount(0);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page).toHaveScreenshot(`career-accountants-${locale}-${viewport.name}.png`, { fullPage: true });
    });
  }
}
