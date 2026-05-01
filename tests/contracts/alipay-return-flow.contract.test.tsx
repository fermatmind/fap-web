import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderReturnFallbackClient } from "@/components/commerce/OrderReturnFallbackClient";

const hoisted = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  recoverAlipayReturnContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: hoisted.routerReplace,
  }),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    recoverAlipayReturnContext: hoisted.recoverAlipayReturnContext,
  };
});

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("alipay return flow contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    hoisted.recoverAlipayReturnContext.mockResolvedValue({
      ok: true,
      order_no: "ord_return_recovered_default",
      payment_recovery_token: "recovery_return_default",
      wait_url:
        "/en/pay/wait?order_no=ord_return_recovered_default&payment_recovery_token=recovery_return_default",
    });
  });

  it("renders a dedicated alipay return page that only hands off to the generic fallback client", () => {
    const source = read("app/(localized)/[locale]/pay/return/alipay/page.tsx");

    expect(source).toContain("OrderReturnFallbackClient");
    expect(source).toContain("out_trade_no");
    expect(source).toContain("waitUrl");
    expect(source).toContain("returnParams");
    expect(source).not.toContain("resultUrl");
    expect(source).not.toContain("window.location.href");
    expect(source).not.toContain("window.open");
  });

  it("prefers wait_url when the alipay return page has recovery metadata", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_alipay_1"
        paymentRecoveryToken="recovery_return_alipay_1"
        waitUrl="https://fermatmind.com/en/pay/wait?order_no=ord_return_alipay_1&payment_recovery_token=recovery_return_alipay_1"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_1&payment_recovery_token=recovery_return_alipay_1"
      );
    });
  });

  it("ignores non-wait recovery URLs and falls back to the canonical order-bound wait flow", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_alipay_1b"
        paymentRecoveryToken="recovery_return_alipay_1b"
        waitUrl="https://fermatmind.com/en/result/attempt-should-not-open-directly?from=payment"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_1b&payment_recovery_token=recovery_return_alipay_1b"
      );
    });
  });

  it("ignores wait_url values from non-first-party origins", async () => {
    render(
      <OrderReturnFallbackClient
        locale="en"
        orderNo="ord_return_alipay_1c"
        paymentRecoveryToken="recovery_return_alipay_1c"
        waitUrl="https://evil.example/en/pay/wait?order_no=ord_return_alipay_1c&payment_recovery_token=recovery_return_alipay_1c"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_1c&payment_recovery_token=recovery_return_alipay_1c"
      );
    });
  });

  it("builds the canonical wait flow from order_no and payment token when wait_url is absent", async () => {
    render(
      <OrderReturnFallbackClient
        locale="zh"
        orderNo="ord_return_alipay_2"
        paymentRecoveryToken="recovery_return_alipay_2"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/zh/pay/wait?order_no=ord_return_alipay_2&payment_recovery_token=recovery_return_alipay_2"
      );
    });
  });

  it("falls back to out_trade_no when the return page only has native Alipay params", async () => {
    hoisted.recoverAlipayReturnContext.mockResolvedValueOnce({
      ok: true,
      order_no: "ord_return_alipay_3",
      payment_recovery_token: "recovery_return_alipay_3",
      wait_url:
        "/en/pay/wait?order_no=ord_return_alipay_3&payment_recovery_token=recovery_return_alipay_3",
    });

    render(
      <OrderReturnFallbackClient
        locale="en"
        outTradeNo="ord_return_alipay_3"
        returnParams={{
          out_trade_no: "ord_return_alipay_3",
          trade_no: "ali_trade_return_3",
          sign: "signed-payload",
        }}
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_3&payment_recovery_token=recovery_return_alipay_3"
      );
    });
    expect(hoisted.recoverAlipayReturnContext).toHaveBeenCalledWith({
      orderNo: "ord_return_alipay_3",
      query: {
        out_trade_no: "ord_return_alipay_3",
        trade_no: "ali_trade_return_3",
        sign: "signed-payload",
        order_no: "ord_return_alipay_3",
      },
    });
  });

  it("keeps return recovery on the wait flow instead of direct-entering a pending result URL", async () => {
    window.localStorage.setItem(
      "fm_pending_order_v1",
      JSON.stringify({
        orderNo: "ord_return_alipay_4",
        attemptId: "attempt_return_alipay_4",
        resultUrl: "/en/result/attempt_return_alipay_4",
        updatedAt: new Date().toISOString(),
      })
    );

    render(<OrderReturnFallbackClient locale="en" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_4"
      );
    });
  });

  it("degrades to order lookup when no wait recovery metadata is available", async () => {
    render(<OrderReturnFallbackClient locale="zh" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith("/zh/orders/lookup");
    });
  });
});
