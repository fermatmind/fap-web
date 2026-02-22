import { expect, test } from "@playwright/test";

test("site chrome is consistent across support and blog pages", async ({ page }) => {
  await page.goto("/en/support");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();

  await page.goto("/en/blog");
  await expect(page.getByRole("link", { name: "FermatMind", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Support", exact: true })).toBeVisible();
});
