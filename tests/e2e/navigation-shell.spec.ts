import { expect, test } from "@playwright/test";

test("site chrome is consistent across help and articles pages", async ({ page }) => {
  await page.goto("/en/help");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();

  await page.goto("/en/articles");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Help", exact: true })).toBeVisible();
});
