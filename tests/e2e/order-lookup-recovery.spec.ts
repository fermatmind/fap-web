import { expect, test, type Page } from "@playwright/test";

async function mockCommonApis(page: Page) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_order_lookup_recovery_guest_token",
      }),
    });
  });
}

test("order lookup shows the marketing consent consumer", async ({ page }) => {
  await page.goto("/en/orders/lookup");

  await expect(page.getByTestId("order-lookup-marketing-consent-consumer")).toContainText(
    "Receive product and marketing updates"
  );
  await expect(page.getByTestId("order-lookup-marketing-consent")).not.toBeChecked();
});

test("order lookup success routes into the order detail page", async ({ page }) => {
  const orderNo = "ord_lookup_success_001";
  const sequence: string[] = [];
  let captureBody: Record<string, unknown> | null = null;

  await mockCommonApis(page);
  await page.route("**/api/v0.3/email/capture", async (route) => {
    sequence.push("capture");
    captureBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        subscriber_status: "active",
        captured_at: "2026-03-12T09:30:00Z",
        marketing_consent: false,
        transactional_recovery_enabled: true,
      }),
    });
  });
  await page.route("**/api/v0.3/orders/lookup", async (route) => {
    sequence.push("lookup");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
      }),
    });
  });
  await page.route(`**/api/v0.3/orders/${orderNo}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        message: "Confirming your payment...",
      }),
    });
  });

  await page.goto("/en/orders/lookup");
  await page.getByTestId("order-lookup-order-no").fill(orderNo);
  await page.getByTestId("order-lookup-email").fill("buyer@example.com");
  await page.getByTestId("order-lookup-submit").click();

  await expect.poll(() => captureBody).toMatchObject({
    email: "buyer@example.com",
    order_no: orderNo,
    surface: "lookup",
    entrypoint: "order_lookup",
    marketing_consent: false,
  });
  await expect.poll(() => sequence.join(",")).toBe("capture,lookup");
  await expect(page).toHaveURL(`/en/orders/${orderNo}`);
  await expect(page.getByRole("heading", { level: 3, name: `Order status #${orderNo}` })).toBeVisible();
});

test("claim flow shows blind success copy", async ({ page }) => {
  const sequence: string[] = [];
  let captureBody: Record<string, unknown> | null = null;

  await mockCommonApis(page);
  await page.route("**/api/v0.3/email/capture", async (route) => {
    sequence.push("capture");
    captureBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        subscriber_status: "suppressed",
        captured_at: "2026-03-12T10:45:00Z",
        marketing_consent: true,
        transactional_recovery_enabled: false,
      }),
    });
  });
  await page.route("**/api/v0.3/claim/report", async (route) => {
    sequence.push("claim");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "Email mismatch for that order.",
      }),
    });
  });

  await page.goto("/en/orders/lookup");
  await page.getByTestId("order-lookup-order-no").fill("ord_claim_success_001");
  await page.getByTestId("order-lookup-email").fill("buyer@example.com");
  await page.getByTestId("order-lookup-marketing-consent").check();
  await page.getByTestId("order-claim-submit").click();

  await expect.poll(() => captureBody).toMatchObject({
    email: "buyer@example.com",
    order_no: "ord_claim_success_001",
    surface: "lookup",
    entrypoint: "order_lookup",
    marketing_consent: true,
  });
  await expect.poll(() => sequence.join(",")).toBe("capture,claim");
  await expect(page.getByTestId("order-lookup-capture-foundation")).toBeVisible();
  await expect(page.getByTestId("order-lookup-capture-subscriber-status")).toHaveText("Suppressed");
  await expect(page.getByTestId("order-lookup-capture-captured-at")).toHaveAttribute(
    "datetime",
    "2026-03-12T10:45:00Z"
  );
  await expect(page.getByTestId("order-lookup-capture-marketing-consent")).toHaveText("Enabled");
  await expect(page.getByTestId("order-lookup-capture-report-recovery")).toHaveText("Disabled");
  await expect(page.getByTestId("order-lookup-feedback")).toHaveText(
    "We’ve received the request. When the order matches, the report link will be sent to the purchase email."
  );
  await expect(page.getByText("Email mismatch for that order.")).toHaveCount(0);
});

test("order number query prefills the lookup form", async ({ page }) => {
  await page.goto("/en/orders/lookup?orderNo=ord_prefill_001");
  await expect(page.getByTestId("order-lookup-order-no")).toHaveValue("ord_prefill_001");
});

test("mode=claim makes the claim CTA primary and focused", async ({ page }) => {
  await page.goto("/en/orders/lookup?orderNo=ord_claim_mode_001&mode=claim");

  await expect(page.getByTestId("order-claim-submit")).toHaveAttribute("data-priority", "primary");
  await expect(page.getByTestId("order-lookup-submit")).toHaveAttribute("data-priority", "secondary");
  await expect(page.getByTestId("order-claim-submit")).toBeFocused();
});

test("order detail recovery entry routes back to lookup claim mode", async ({ page }) => {
  const orderNo = "ord_claim_back_001";

  await mockCommonApis(page);
  await page.route(`**/api/v0.3/orders/${orderNo}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "paid",
        message: "Your full report is ready.",
        delivery: {
          contact_email_present: false,
          last_delivery_email_sent_at: "2026-03-11T10:30:00Z",
          can_request_claim_email: true,
          can_view_report: true,
          report_url: "/result/attempt-claim-back-001",
          can_download_pdf: false,
          can_resend: true,
        },
      }),
    });
  });

  await page.goto(`/en/orders/${orderNo}`);
  await expect(page.getByTestId("order-delivery-actions")).toBeVisible();
  await page.getByTestId("order-recover-with-email-link").click();

  await expect(page).toHaveURL(`/en/orders/lookup?orderNo=${orderNo}&mode=claim`);
  await expect(page.getByTestId("order-lookup-order-no")).toHaveValue(orderNo);
  await expect(page.getByTestId("order-claim-submit")).toHaveAttribute("data-priority", "primary");
});
