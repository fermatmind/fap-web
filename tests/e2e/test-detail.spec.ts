import { expect, test } from "@playwright/test";

test("test detail page has code visual hero and CTA", async ({ page }) => {
  await page.goto("/en/tests/big-five-personality-test-ocean-model");

  await expect(page.getByRole("heading", { name: /Big Five Personality Test.*OCEAN Model/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start test" })).toBeVisible();
  const hero = page.locator("main section").first();
  await expect(
    hero.getByRole("img", { name: "Five rising bars representing OCEAN personality traits." })
  ).toBeVisible();
});
