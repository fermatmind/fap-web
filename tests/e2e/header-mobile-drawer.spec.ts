import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";
import { expect, test } from "@playwright/test";

test.describe("mobile header drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps cookie consent in the first viewport and the mobile drawer above it", async ({ page }) => {
    await page.goto("/en");

    const banner = page.locator("[data-cookie-banner]");
    const accept = page.getByTestId("cookie-banner-accept");
    await expect(banner).toHaveCSS("position", "fixed");
    await expect(accept).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.getByRole("button", { name: "Menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeInViewport();
    await drawer.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toHaveCount(0);

    await expect(accept).toBeInViewport({ ratio: 1 });
    await accept.click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("fm_consent_v1") ?? "null"))).toMatchObject({
      analytics: "granted",
    });
    await expect(banner).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

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

  test("supports grouped expansion and closes after direct Blog navigation", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu" }).click();

    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();

    await expect(drawer.getByRole("link", { name: "My Account", exact: true })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Search", exact: true })).toHaveCount(0);
    await expect(drawer.getByRole("link", { name: "Business", exact: true })).toHaveCount(0);
    await expect(drawer.getByRole("link", { name: "简体中文", exact: true })).toBeVisible();

    await drawer.getByRole("button", { name: "Tests menu", exact: true }).click();
    await expect(drawer.getByRole("menuitem", { name: "Tests hub", exact: true })).toBeVisible();

    await expect(drawer.getByRole("button", { name: "Blog menu", exact: true })).toBeVisible();
    const blog = drawer.getByTestId("mobile-primary-nav-link-articles");
    await expect(blog).toHaveAttribute("href", "/en/articles");
    await blog.click();
    await page.waitForURL(url => url.pathname === "/en/articles");
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
  });
});

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });
