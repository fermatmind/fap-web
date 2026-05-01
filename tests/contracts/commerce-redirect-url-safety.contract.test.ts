import {
  normalizeCommercePaymentRedirectUrl,
  normalizeCommercePayValue,
  normalizeCommerceReportPath,
  normalizeCommerceWaitPath,
} from "@/lib/commerce/redirectUrls";

describe("commerce redirect URL safety contract", () => {
  it("rejects unsafe schemes for browser payment redirects", () => {
    for (const value of [
      "javascript:alert(1)",
      "data:text/html,blocked",
      "blob:https://fermatmind.com/blocked",
      "file:///tmp/blocked",
    ]) {
      expect(normalizeCommercePaymentRedirectUrl(value, "alipay")).toBeNull();
    }
  });

  it("rejects arbitrary external payment redirect hosts", () => {
    expect(normalizeCommercePaymentRedirectUrl("https://pay.example.invalid/checkout", "alipay")).toBeNull();
    expect(normalizeCommercePaymentRedirectUrl("https://openapi.alipay.com.evil.example/gateway.do", "alipay")).toBeNull();
    expect(normalizeCommercePaymentRedirectUrl("https://checkout.lemonsqueezy.com/session_123", "alipay")).toBeNull();
  });

  it("allows explicit provider checkout hosts and same-origin payment launch paths", () => {
    expect(normalizeCommercePaymentRedirectUrl("https://openapi.alipay.com/gateway.do?trade_no=ord_1", "alipay")).toBe(
      "https://openapi.alipay.com/gateway.do?trade_no=ord_1"
    );
    expect(normalizeCommercePaymentRedirectUrl("https://checkout.lemonsqueezy.com/session_123", "lemonsqueezy")).toBe(
      "https://checkout.lemonsqueezy.com/session_123"
    );
    expect(normalizeCommercePaymentRedirectUrl("/api/v0.3/orders/ord_1/pay/alipay?scene=desktop", "alipay")).toBe(
      "/api/v0.3/orders/ord_1/pay/alipay?scene=desktop"
    );
  });

  it("normalizes wait URLs to the same-origin wait route and strips unsafe pay values", () => {
    expect(
      normalizeCommerceWaitPath(
        "https://fermatmind.com/en/pay/wait?order_no=ord_1&pay_type=html&pay_value=javascript%3Aalert(1)&provider=alipay&payment_recovery_token=recovery_1"
      )
    ).toBe("/pay/wait?order_no=ord_1&provider=alipay&payment_recovery_token=recovery_1");

    expect(
      normalizeCommerceWaitPath(
        "/zh/pay/wait?order_no=ord_2&pay_type=html&pay_value=%2Fapi%2Fv0.3%2Forders%2Ford_2%2Fpay%2Falipay%3Fscene%3Ddesktop&provider=alipay"
      )
    ).toBe(
      "/pay/wait?order_no=ord_2&pay_type=html&pay_value=%2Fapi%2Fv0.3%2Forders%2Ford_2%2Fpay%2Falipay%3Fscene%3Ddesktop&provider=alipay"
    );

    expect(normalizeCommerceWaitPath("https://evil.example/en/pay/wait?order_no=ord_3")).toBeNull();
  });

  it("preserves QR payment payloads only for the supported QR provider", () => {
    expect(
      normalizeCommercePayValue({
        payType: "qr",
        value: "weixin://wxpay/bizpayurl?pr=ord_qr_1",
        provider: "wechatpay",
      })
    ).toBe("weixin://wxpay/bizpayurl?pr=ord_qr_1");

    expect(
      normalizeCommercePayValue({
        payType: "qr",
        value: "javascript:alert(1)",
        provider: "wechatpay",
      })
    ).toBeNull();
  });

  it("keeps report navigation on first-party result/report paths", () => {
    expect(normalizeCommerceReportPath("/en/result/attempt_1?from=payment")).toBe("/en/result/attempt_1?from=payment");
    expect(normalizeCommerceReportPath("/attempts/attempt_2/report")).toBe("/attempts/attempt_2/report");
    expect(normalizeCommerceReportPath("https://evil.example/result/attempt_3")).toBeNull();
    expect(normalizeCommerceReportPath("https://fermatmind.com/support")).toBeNull();
  });
});
