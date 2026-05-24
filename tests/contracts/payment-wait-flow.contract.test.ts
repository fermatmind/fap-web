import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readPendingOrder, writePendingOrder, clearPendingOrder } from "@/lib/commerce/pendingOrder";

describe("payment wait flow contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearPendingOrder();
  });

  it("persists wait flow recovery metadata in session storage for pending orders", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-24T10:00:00.000Z"));

    writePendingOrder({
      orderNo: "ord_payment_wait_1",
      attemptId: "attempt-payment-wait-1",
      sku: "MBTI_REPORT_FULL_199",
      provider: "wechatpay",
      waitUrl: "/zh/pay/wait?order_no=ord_payment_wait_1&payment_recovery_token=recovery_payment_wait_1",
      paymentRecoveryToken: "recovery_payment_wait_1",
      resultUrl: "/zh/result/attempt-payment-wait-1?from=payment",
    });

    expect(window.localStorage.getItem("fm_pending_order_v1")).toBeNull();
    expect(window.sessionStorage.getItem("fm_pending_order_v1")).toContain("recovery_payment_wait_1");
    expect(readPendingOrder()).toEqual(
      expect.objectContaining({
        orderNo: "ord_payment_wait_1",
        attemptId: "attempt-payment-wait-1",
        sku: "MBTI_REPORT_FULL_199",
        provider: "wechatpay",
        waitUrl: "/zh/pay/wait?order_no=ord_payment_wait_1&payment_recovery_token=recovery_payment_wait_1",
        paymentRecoveryToken: "recovery_payment_wait_1",
        resultUrl: "/zh/result/attempt-payment-wait-1?from=payment",
        expiresAt: "2026-05-24T10:30:00.000Z",
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

  it("does not read expired recovery tokens and cleans storage", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-24T11:00:00.000Z"));
    window.sessionStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: "ord_payment_wait_expired_1",
        attemptId: "attempt-payment-wait-expired-1",
        sku: "MBTI_REPORT_FULL_199",
        provider: "stripe",
        waitUrl: "/en/pay/wait?order_no=ord_payment_wait_expired_1&payment_recovery_token=expired_token_1",
        paymentRecoveryToken: "expired_token_1",
        resultUrl: "/en/result/attempt-payment-wait-expired-1?from=payment",
        updatedAt: "2026-05-24T10:00:00.000Z",
        expiresAt: "2026-05-24T10:30:00.000Z",
      })
    );

    expect(readPendingOrder()).toBeNull();
    expect(window.sessionStorage.getItem("fm_pending_order_v1")).toBeNull();
    expect(window.localStorage.getItem("fm_pending_order_v1")).toBeNull();
  });

  it("migrates valid legacy localStorage context into sessionStorage and clears localStorage", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-24T10:10:00.000Z"));
    window.localStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: "ord_payment_wait_legacy_1",
        attemptId: "attempt-payment-wait-legacy-1",
        sku: "MBTI_REPORT_FULL_199",
        provider: "alipay",
        waitUrl: "/en/pay/wait?order_no=ord_payment_wait_legacy_1&payment_recovery_token=legacy_token_1",
        paymentRecoveryToken: "legacy_token_1",
        resultUrl: "/en/result/attempt-payment-wait-legacy-1?from=payment",
        updatedAt: "2026-05-24T10:00:00.000Z",
      })
    );

    expect(readPendingOrder()).toEqual(
      expect.objectContaining({
        orderNo: "ord_payment_wait_legacy_1",
        paymentRecoveryToken: "legacy_token_1",
        expiresAt: "2026-05-24T10:30:00.000Z",
      })
    );
    expect(window.localStorage.getItem("fm_pending_order_v1")).toBeNull();
    expect(window.sessionStorage.getItem("fm_pending_order_v1")).toContain("legacy_token_1");
  });

  it("does not crash when browser storage is unavailable", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(() => {
      writePendingOrder({
        orderNo: "ord_payment_wait_storage_unavailable_1",
        paymentRecoveryToken: "storage_unavailable_token",
      });
    }).not.toThrow();
    expect(readPendingOrder()).toBeNull();
    expect(() => clearPendingOrder()).not.toThrow();

    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });
});
