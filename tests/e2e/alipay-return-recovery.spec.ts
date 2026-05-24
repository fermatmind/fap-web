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
        fm_token: "fm_alipay_return_guest_token",
      }),
    });
  });
}

test("alipay return page restores the tokenized wait flow from explicit return params", async ({ page }) => {
  const orderNo = "ord_alipay_return_1";
  const paymentRecoveryToken = "recovery_alipay_return_1";

  await mockCommonApis(page);
  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        provider: "alipay",
        payment_recovery_token: paymentRecoveryToken,
        wait_url: `/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`,
        pay: {
          type: "redirect",
          value: `https://openapi.alipay.com/gateway.do?trade_no=${orderNo}`,
          provider: "alipay",
        },
      }),
    });
  });

  await page.goto(
    `/en/pay/return/alipay?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}&wait_url=%2Fpay%2Fwait%3Forder_no%3D${orderNo}%26payment_recovery_token%3D${paymentRecoveryToken}`
  );

  await expect(page).toHaveURL(
    `/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );
  await expect(page.getByText(orderNo)).toBeVisible();
  await expect(page.getByRole("button", { name: "Open payment page" })).toBeVisible();
});

test("alipay return page can reuse pending-order recovery context from session storage", async ({ page }) => {
  const orderNo = "ord_alipay_return_2";
  const paymentRecoveryToken = "recovery_alipay_return_2";

  await mockCommonApis(page);
  await page.addInitScript(({ nextOrderNo, nextToken }) => {
    window.sessionStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: nextOrderNo,
        attemptId: "attempt-alipay-return-2",
        sku: "MBTI_REPORT_FULL_199",
        provider: "alipay",
        waitUrl: `/en/pay/wait?order_no=${nextOrderNo}&payment_recovery_token=${nextToken}`,
        paymentRecoveryToken: nextToken,
        resultUrl: "/en/result/attempt-alipay-return-2?from=payment",
        updatedAt: new Date().toISOString(),
      })
    );
  }, { nextOrderNo: orderNo, nextToken: paymentRecoveryToken });
  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        provider: "alipay",
        payment_recovery_token: paymentRecoveryToken,
        wait_url: `/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`,
        pay: {
          type: "html",
          value: `/api/v0.3/orders/${orderNo}/pay/alipay?scene=desktop`,
          provider: "alipay",
        },
      }),
    });
  });

  await page.goto(`/en/pay/return/alipay?order_no=${orderNo}`);

  await expect(page).toHaveURL(
    `/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );
  await expect(page.getByText(orderNo)).toBeVisible();
  await expect(page.getByRole("button", { name: "Open payment page" })).toBeVisible();
});

test("alipay return page rebuilds wait flow from native out_trade_no without session storage", async ({ page }) => {
  const orderNo = "ord_alipay_return_3";
  const paymentRecoveryToken = "recovery_alipay_return_3";

  await mockCommonApis(page);
  await page.route(`**/api/v0.3/orders/${orderNo}/recover/alipay-return*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        payment_recovery_token: paymentRecoveryToken,
        wait_url: `/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`,
      }),
    });
  });
  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        status: "pending",
        provider: "alipay",
        payment_recovery_token: paymentRecoveryToken,
        pay: {
          type: "html",
          value: `/api/v0.3/orders/${orderNo}/pay/alipay?scene=desktop`,
          provider: "alipay",
        },
      }),
    });
  });

  await page.goto(`/en/pay/return/alipay?out_trade_no=${orderNo}&trade_no=ali_trade_return_3`);

  await expect(page).toHaveURL(
    `/en/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`
  );
  await expect(page.getByText(orderNo)).toBeVisible();
});
