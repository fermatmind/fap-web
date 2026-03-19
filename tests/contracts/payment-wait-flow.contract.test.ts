import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readPendingOrder, writePendingOrder, clearPendingOrder } from "@/lib/commerce/pendingOrder";

describe("payment wait flow contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    clearPendingOrder();
  });

  it("persists wait flow recovery metadata for pending orders", () => {
    writePendingOrder({
      orderNo: "ord_payment_wait_1",
      attemptId: "attempt-payment-wait-1",
      sku: "MBTI_REPORT_FULL_199",
      provider: "wechatpay",
      waitUrl: "/zh/pay/wait?order_no=ord_payment_wait_1&payment_recovery_token=recovery_payment_wait_1",
      paymentRecoveryToken: "recovery_payment_wait_1",
      resultUrl: "/zh/result/attempt-payment-wait-1?from=payment",
    });

    expect(readPendingOrder()).toEqual(
      expect.objectContaining({
        orderNo: "ord_payment_wait_1",
        attemptId: "attempt-payment-wait-1",
        sku: "MBTI_REPORT_FULL_199",
        provider: "wechatpay",
        waitUrl: "/zh/pay/wait?order_no=ord_payment_wait_1&payment_recovery_token=recovery_payment_wait_1",
        paymentRecoveryToken: "recovery_payment_wait_1",
        resultUrl: "/zh/result/attempt-payment-wait-1?from=payment",
      })
    );
  });

  it("allows recovery-only pending order context without attempt metadata", () => {
    writePendingOrder({
      orderNo: "ord_payment_wait_lookup_1",
      provider: "alipay",
      waitUrl: "/en/pay/wait?order_no=ord_payment_wait_lookup_1&payment_recovery_token=recovery_payment_wait_lookup_1",
      paymentRecoveryToken: "recovery_payment_wait_lookup_1",
      resultUrl: "/en/result/attempt-payment-wait-lookup-1?from=payment",
    });

    expect(readPendingOrder()).toEqual(
      expect.objectContaining({
        orderNo: "ord_payment_wait_lookup_1",
        attemptId: null,
        sku: null,
        provider: "alipay",
        waitUrl: "/en/pay/wait?order_no=ord_payment_wait_lookup_1&payment_recovery_token=recovery_payment_wait_lookup_1",
        paymentRecoveryToken: "recovery_payment_wait_lookup_1",
        resultUrl: "/en/result/attempt-payment-wait-lookup-1?from=payment",
      })
    );
  });
});
