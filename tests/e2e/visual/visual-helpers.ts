import type { Locator, Page } from "@playwright/test";

export async function prepareVisualPage(page: Page) {
  await page.setViewportSize({ width: 1440, height: 2200 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
      html {
        scroll-behavior: auto !important;
      }
    `,
  });
}

/**
 * CI runners can report 1-2px full-page height drift from fractional layout rounding.
 * Quantize to a fixed step so visual baselines remain stable across environments.
 */
export async function fitPageViewportForScreenshot(
  page: Page,
  options?: { width?: number; quantum?: number }
): Promise<number> {
  const width = options?.width ?? 1440;
  const quantum = options?.quantum ?? 16;
  const rawHeight = await page.evaluate(() =>
    Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    )
  );
  const normalizedHeight = Math.ceil(rawHeight / quantum) * quantum;
  await page.setViewportSize({ width, height: normalizedHeight });
  return normalizedHeight;
}

export function getStableMasks(page: Page): Locator[] {
  return [page.getByText(/©\s+\d{4}\s+FermatMind\./)];
}
