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

test("email unsubscribe without a token shows the explanation state", async ({ page }) => {
  await mockCommonApis(page);

  await page.goto("/en/email/unsubscribe");

  await expect(page.getByRole("heading", { level: 3, name: "Unsubscribe from emails" })).toBeVisible();
  await expect(page.getByText("Open this page from the unsubscribe link inside your email.")).toBeVisible();
  await expect(
    page.getByTestId("email-unsubscribe-missing").getByRole("link", { name: "Manage email preferences" })
  ).toHaveAttribute("href", "/en/email/preferences");
});

test("email unsubscribe with a token stays on the confirm state until clicked", async ({ page }) => {
  await mockCommonApis(page);

  await page.goto("/en/email/unsubscribe?token=unsub_token_123");

  await expect(page.getByRole("heading", { level: 3, name: "Confirm unsubscribe" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm unsubscribe" })).toBeVisible();
});

test("email unsubscribe success state appears after confirmation", async ({ page }) => {
  await mockCommonApis(page);
  await page.route("**/api/v0.3/email/unsubscribe", async (route) => {
    const body = route.request().postDataJSON();
    expect(body).toEqual({
      token: "unsub_token_123",
      reason: "user_request",
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        status: "unsubscribed",
      }),
    });
  });

  await page.goto("/en/email/unsubscribe?token=unsub_token_123");
  await page.getByTestId("email-unsubscribe-confirm-button").click();

  await expect(page.getByTestId("email-unsubscribe-success")).toContainText("You’re unsubscribed");
  await expect(page.getByRole("link", { name: "Back to preferences" })).toHaveAttribute(
    "href",
    "/en/email/preferences?token=unsub_token_123"
  );
  await expect(page.getByRole("link", { name: "Go to order lookup" })).toHaveAttribute("href", "/en/orders/lookup");
});
