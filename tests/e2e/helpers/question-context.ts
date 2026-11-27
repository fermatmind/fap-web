import { expect, type Page } from "@playwright/test";

export async function expectQuestionContext(page: Page) {
  const heading = page.locator("#take-test h2");
  const progress = page.locator("#take-test progress");

  await expect(heading).toBeFocused();
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
