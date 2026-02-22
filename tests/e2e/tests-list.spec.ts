import { expect, test } from "@playwright/test";

test("tests list uses pure code DataGlyph cards", async ({ page }) => {
  await page.goto("/en/tests");

  await expect(page.getByRole("heading", { name: "Tests" })).toBeVisible();
  const cards = page.locator('[role="img"][aria-label]');
  await expect(cards.first()).toBeVisible();

  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(2);
});
