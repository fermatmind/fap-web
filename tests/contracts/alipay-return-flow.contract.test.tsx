import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderReturnFallbackClient } from "@/components/commerce/OrderReturnFallbackClient";

const hoisted = vi.hoisted(() => ({
  routerReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: hoisted.routerReplace,
  }),
}));

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("alipay return flow contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("renders a dedicated alipay return page that only hands off to the generic fallback client", () => {
    const source = read("app/(localized)/[locale]/pay/return/alipay/page.tsx");

    expect(source).toContain("OrderReturnFallbackClient");
    expect(source).toContain("waitUrl");
    expect(source).toContain("resultUrl");
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
        resultUrl="/en/result/attempt-return-alipay-1?from=payment"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/pay/wait?order_no=ord_return_alipay_1&payment_recovery_token=recovery_return_alipay_1"
      );
    });
  });

  it("falls back to result_url when no wait recovery is available", async () => {
    render(
      <OrderReturnFallbackClient
        locale="zh"
        resultUrl="https://fermatmind.com/zh/result/attempt-return-alipay-2?from=payment"
      />
    );

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/zh/result/attempt-return-alipay-2?from=payment"
      );
    });
  });
});
