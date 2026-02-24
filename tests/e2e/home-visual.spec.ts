import { expect, test } from "@playwright/test";

test("home page renders hero, value props, and highlighted tests", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { name: "Highlighted tests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find your test" })).toBeVisible();
  await expect(page.getByText("Why people trust FermatMind")).toBeVisible();
  await expect(page.getByText("Trust signals")).toBeVisible();

  const highlightedSection = page.locator("section").filter({ hasText: "Highlighted tests" });
  const highlightCards = highlightedSection.locator("article");
  await expect(highlightCards.first()).toBeVisible();
  await expect(highlightCards).toHaveCount(6);
  await expect(highlightedSection.locator('article[data-disabled="1"]')).toHaveCount(2);
  await expect(highlightedSection.locator('a[href*="/take"]')).toHaveCount(4);
  await expect(page.getByText("Clinical Grade")).toHaveCount(2);

  const firstStartButton = page.getByRole("link", { name: "Find your test" });
  const box = await firstStartButton.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.height ?? 0) >= 44).toBeTruthy();
});
