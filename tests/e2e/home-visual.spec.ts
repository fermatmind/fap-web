import { expect, test } from "@playwright/test";

test("home page renders hero, value props, and highlighted tests", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { name: "Highlighted tests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find your test" })).toBeVisible();
  await expect(page.getByText("Why people trust FermatMind")).toBeVisible();

  const highlightCards = page.locator("section").filter({ hasText: "Highlighted tests" }).locator("article");
  await expect(highlightCards.first()).toBeVisible();

  const firstStartButton = page.getByRole("link", { name: "Find your test" });
  const box = await firstStartButton.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.height ?? 0) >= 44).toBeTruthy();
});
