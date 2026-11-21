import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderReturnFallbackClient } from "@/components/commerce/OrderReturnFallbackClient";
import { readPendingOrder, writePendingOrder } from "@/lib/commerce/pendingOrder";
const hoisted = vi.hoisted(() => ({ routerReplace: vi.fn(), recoverAlipayReturnContext: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: hoisted.routerReplace }) }));
vi.mock("@/lib/api/v0_3", async () => ({ ...await vi.importActual("@/lib/api/v0_3"), recoverAlipayReturnContext: hoisted.recoverAlipayReturnContext }));
describe("Existing order returns after MBTI unlock retirement", () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear(); window.sessionStorage.clear(); });
  it("reuses pending order context on provider return pages when order_no is absent", async () => {
    writePendingOrder({
      orderNo: "ord_return_1",
      attemptId: "attempt-123",
      sku: "MBTI_REPORT_FULL_199",
      provider: "lemonsqueezy",
      waitUrl: "/zh/pay/wait?order_no=ord_return_1&payment_recovery_token=recovery_return_1",
      paymentRecoveryToken: "recovery_return_1",
      resultUrl: "/zh/result/attempt-123?from=payment",
    });

    render(<OrderReturnFallbackClient locale="zh" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/zh/pay/wait?order_no=ord_return_1&payment_recovery_token=recovery_return_1"
      );
    });
    expect(readPendingOrder()).toBeNull();
  });

  it("routes provider return pages with order_no and payment token back into wait flow", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_query_1"
        paymentRecoveryToken="recovery_return_query_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_query_1&payment_recovery_token=recovery_return_query_1"
      );
    });
  });

  it("prefers explicit wait_url on provider return pages before falling back to lookup", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_wait_url_1"
        paymentRecoveryToken="recovery_return_wait_url_1"
        waitUrl="https://fermatmind.com/en/pay/wait?order_no=ord_return_wait_url_1&payment_recovery_token=recovery_return_wait_url_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_wait_url_1&payment_recovery_token=recovery_return_wait_url_1"
      );
    });
  });

  it("keeps Taiwan provider returns in the Taiwan wait flow", async () => {
    render(
      <OrderReturnFallbackClient
        locale="zh-TW"
        waitUrl="/zh/pay/wait?order_no=ord_return_tw&payment_recovery_token=recovery_return_tw"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/zh-TW/pay/wait?order_no=ord_return_tw&payment_recovery_token=recovery_return_tw"
      );
    });
  });

  it("routes native Alipay out_trade_no returns back into wait flow", async () => {
    hoisted.recoverAlipayReturnContext.mockRejectedValueOnce(new Error("Recovery lookup unavailable"));

    render(
      <OrderReturnFallbackClient
        locale="en"
        outTradeNo="ord_return_native_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_native_1"
      );
    });
  });
});
