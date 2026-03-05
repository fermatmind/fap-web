import { expect, test } from "@playwright/test";

test.describe("mobile header drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens as a narrow right drawer and supports close interactions", async ({ page }) => {
    await page.goto("/en");

    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();

    const drawerBox = await drawer.boundingBox();
    expect(drawerBox).not.toBeNull();
    const width = drawerBox?.width ?? 0;
    expect(width).toBeGreaterThanOrEqual(280);
    expect(width).toBeLessThanOrEqual(360);
    expect(Math.abs(width - 390 * 0.82)).toBeLessThan(8);

    await expect.poll(async () => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => document.body.style.overflow)).toBe("");

    await menuButton.click();
    await expect(drawer).toBeVisible();

    await page.getByRole("button", { name: "Close menu" }).first().click({ position: { x: 8, y: 8 } });
    await expect(drawer).toHaveCount(0);

    await menuButton.click();
    await expect(drawer).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).last().click();
    await expect(drawer).toHaveCount(0);
  });

  test("supports grouped expansion and closes after submenu navigation", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu" }).click();

    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();

    await expect(drawer.getByRole("link", { name: "Start", exact: true })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Profile", exact: true })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Search", exact: true })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "中文", exact: true })).toBeVisible();

    await drawer.getByRole("button", { name: "Tests", exact: true }).click();
    await expect(drawer.getByRole("link", { name: "All tests", exact: true })).toBeVisible();

    await drawer.getByRole("button", { name: "Articles", exact: true }).click();
    await expect(drawer.getByRole("link", { name: "All tests", exact: true })).toHaveCount(0);
    await expect(drawer.getByRole("link", { name: "MBTI basics", exact: true })).toBeVisible();

    await drawer.getByRole("link", { name: "MBTI basics", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/articles\/mbti-basics/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
  });
});
