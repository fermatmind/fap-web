import type { Locator, Page } from "@playwright/test";

const CONSENT_KEY = "fm_consent_v1";

export async function prepareVisualPage(page: Page) {
  await page.addInitScript(
    ({ consentKey }) => {
      try {
        window.localStorage.setItem(
          consentKey,
          JSON.stringify({
            analytics: "granted",
            updatedAt: "2024-01-01T00:00:00.000Z",
          })
        );
      } catch {
        // Ignore storage write errors.
      }
    },
    { consentKey: CONSENT_KEY }
  );

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

export async function waitForVisualStability(page: Page) {
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  });
  await page.waitForTimeout(50);
}

export function getStableMasks(page: Page): Locator[] {
  return [page.locator('[data-visual-volatile="true"]')];
}
