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

export function getStableMasks(page: Page): Locator[] {
  return [page.getByText(/©\s+\d{4}\s+FermatMind\./)];
}
