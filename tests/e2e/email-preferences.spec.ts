import { expect, test, type Page } from "@playwright/test";

async function mockCommonApis(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

test("email preferences without a token shows the explanation state", async ({ page }) => {
  await mockCommonApis(page);

  await page.goto("/en/email/preferences");

  await expect(page.getByRole("heading", { level: 3, name: "Manage email preferences" })).toBeVisible();
  await expect(page.getByText("Open this page from the link inside your email")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to order lookup" })).toHaveAttribute("href", "/en/orders/lookup");
});

test("email preferences with a token loads the saved preferences", async ({ page }) => {
  await mockCommonApis(page);
  await page.route("**/api/v0.3/email/preferences?token=pref_token_123", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        email_masked: "b***@example.com",
        preferences: {
          marketing_updates: true,
          report_recovery: true,
          product_updates: false,
        },
      }),
    });
  });

  await page.goto("/en/email/preferences?token=pref_token_123");

  await expect(page.getByTestId("email-preferences-email")).toHaveText("b***@example.com");
  await expect(page.getByLabel("Marketing updates")).toBeChecked();
  await expect(page.getByLabel("Report recovery")).toBeChecked();
  await expect(page.getByLabel("Product updates")).not.toBeChecked();
  await expect(page.getByTestId("email-preferences-status-marketing-updates")).toHaveText("Enabled");
  await expect(page.getByTestId("email-preferences-status-report-recovery")).toHaveText("Enabled");
  await expect(page.getByTestId("email-preferences-status-product-updates")).toHaveText("Disabled");
  await expect(page.getByText(/Product and marketing updates about FermatMind offers/i)).toBeVisible();
  await expect(page.getByText(/restore access to your report and order emails/i)).toBeVisible();
  await expect(page.getByText(/not the same as marketing campaigns/i)).toBeVisible();
});

test("email preferences save succeeds without leaving the page", async ({ page }) => {
  await mockCommonApis(page);
  await page.route("**/api/v0.3/email/preferences?token=pref_token_123", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        email_masked: "b***@example.com",
        preferences: {
          marketing_updates: true,
          report_recovery: true,
          product_updates: false,
        },
      }),
    });
  });
  await page.route("**/api/v0.3/email/preferences", async (route) => {
    const body = route.request().postDataJSON();
    expect(body).toEqual({
      token: "pref_token_123",
      marketing_updates: false,
      report_recovery: true,
      product_updates: false,
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        preferences: {
          marketing_updates: false,
          report_recovery: true,
          product_updates: false,
        },
      }),
    });
  });

  await page.goto("/en/email/preferences?token=pref_token_123");
  await page.getByLabel("Marketing updates").click();
  await page.getByTestId("email-preferences-save").click();

  await expect(page.getByTestId("email-preferences-feedback")).toHaveText(
    "Your subscriber preferences are saved. Marketing updates, report recovery emails, and product updates now use the states shown below."
  );
  await expect(page).toHaveURL("/en/email/preferences?token=pref_token_123");
  await expect(page.getByTestId("email-preferences-status-marketing-updates")).toHaveText("Disabled");
});

test("help and footer discoverability both reach the email preferences surfaces", async ({ page }) => {
  await mockCommonApis(page);

  await page.goto("/en/help");
  await expect(page.getByRole("button", { name: "Manage email preferences" })).toBeVisible();
  await page.getByRole("button", { name: "Manage email preferences" }).click();
  await expect(page).toHaveURL("/en/email/preferences");
  await expect(page.getByRole("heading", { level: 3, name: "Manage email preferences" })).toBeVisible();

  await page.goto("/en");
  const footer = page.locator("footer").first();
  await footer.scrollIntoViewIfNeeded();
  await footer.getByRole("link", { name: "Unsubscribe from emails" }).click();
  await expect(page).toHaveURL("/en/email/unsubscribe");
  await expect(page.getByRole("heading", { level: 3, name: "Unsubscribe from emails" })).toBeVisible();
});
