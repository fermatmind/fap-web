import { expect, test } from "@playwright/test";

test("home page renders code-driven cards without hero image dependency", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { name: "Featured Tests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start free test" })).toBeVisible();

  const glyphs = page.locator('[role="img"][aria-label]');
  await expect(glyphs.first()).toBeVisible();

  const firstStartButton = page.locator('a:has-text("Start")').first();
  const box = await firstStartButton.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.height ?? 0) >= 40).toBeTruthy();
});
