import { expect, test } from "@playwright/test";
import { buildOrderWaitPath, resolveCheckoutAction } from "../../lib/commerce/checkoutAction";

test("@release payment wait accepts a generic recovery URL with an immediate payment action", async ({ page }) => {
  const orderNo = "ord_checkout_wait_0001";
  const paymentRecoveryToken = "recovery_checkout_wait_0001";
  const payValue = `/api/v0.3/orders/${orderNo}/pay/alipay?scene=desktop`;
  const action = resolveCheckoutAction({
    ok: true,
    order_no: orderNo,
    provider: "alipay",
    payment_recovery_token: paymentRecoveryToken,
    wait_url: `/pay/wait?order_no=${orderNo}&payment_recovery_token=${paymentRecoveryToken}`,
    pay: { type: "html", value: payValue, provider: "alipay" },
  }, "Payment recovery is unavailable");
  if (action.kind !== "order_wait") throw new Error(`Expected a payment wait action, found ${action.kind}`);

  await page.route(`**/api/v0.3/orders/${orderNo}*`, route => {
    expect(new URL(route.request().url()).searchParams.get("payment_recovery_token")).toBe(paymentRecoveryToken);
    return route.fulfill({ json: { ok: true, order_no: orderNo, status: "pending", provider: "alipay" } });
  });

  await page.goto(`/en${buildOrderWaitPath(action)}`);
  const waitUrl = new URL(page.url());
  expect(waitUrl.pathname).toBe("/en/pay/wait");
  expect(waitUrl.searchParams.get("order_no")).toBe(orderNo);
  expect(waitUrl.searchParams.get("pay_type")).toBe("html");
  expect(waitUrl.searchParams.get("pay_value")).toBe(payValue);
  expect(waitUrl.searchParams.get("provider")).toBe("alipay");
  expect(waitUrl.searchParams.get("payment_recovery_token")).toBe(paymentRecoveryToken);
  await expect(page.getByRole("button", { name: "Open payment page" })).toBeVisible();
});
