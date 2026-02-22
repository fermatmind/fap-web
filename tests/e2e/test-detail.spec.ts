import { expect, test } from "@playwright/test";

test("test detail page has code visual hero and CTA", async ({ page }) => {
  await page.goto("/en/tests/big-five-personality-test");

  await expect(page.getByRole("heading", { name: "Big Five Personality Test" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start test" })).toBeVisible();
  await expect(page.locator('[role="img"][aria-label]').first()).toBeVisible();
});
