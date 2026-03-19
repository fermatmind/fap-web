import { buildOrderWaitPath, resolveCheckoutAction } from "@/lib/commerce/checkoutAction";

describe("checkout action contract", () => {
  const paymentUnavailable = "payment unavailable";

  it("resolves pay.redirect to external redirect action", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_redirect_1",
        provider: "lemonsqueezy",
        payment_recovery_token: "recovery_redirect_1",
        wait_url: "/en/pay/wait?order_no=ord_redirect_1&payment_recovery_token=recovery_redirect_1",
        pay: {
          type: "redirect",
          value: "https://checkout.example.com/pay?order_no=ord_redirect_1",
          provider: "lemonsqueezy",
        },
      },
      paymentUnavailable
    );

    expect(action).toEqual({
      kind: "redirect",
      url: "https://checkout.example.com/pay?order_no=ord_redirect_1",
      orderNo: "ord_redirect_1",
      provider: "lemonsqueezy",
      waitUrl: "/pay/wait?order_no=ord_redirect_1&payment_recovery_token=recovery_redirect_1",
      paymentRecoveryToken: "recovery_redirect_1",
      resultUrl: null,
    });
  });

  it("keeps alipay redirect recovery metadata available before leaving the site", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_redirect_alipay_1",
        provider: "alipay",
        payment_recovery_token: "recovery_redirect_alipay_1",
        wait_url: "/en/pay/wait?order_no=ord_redirect_alipay_1&payment_recovery_token=recovery_redirect_alipay_1",
        result_url: "/en/result/attempt-redirect-alipay-1?from=payment",
        pay: {
          type: "redirect",
          value: "https://openapi.alipay.com/gateway.do?trade_no=ord_redirect_alipay_1",
          provider: "alipay",
        },
      },
      paymentUnavailable
    );

    expect(action).toEqual({
      kind: "redirect",
      url: "https://openapi.alipay.com/gateway.do?trade_no=ord_redirect_alipay_1",
      orderNo: "ord_redirect_alipay_1",
      provider: "alipay",
      waitUrl: "/pay/wait?order_no=ord_redirect_alipay_1&payment_recovery_token=recovery_redirect_alipay_1",
      paymentRecoveryToken: "recovery_redirect_alipay_1",
      resultUrl: "/en/result/attempt-redirect-alipay-1?from=payment",
    });
  });

  it("routes pay.qr to /pay/wait with query payload", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_qr_1",
        provider: "wechatpay",
        payment_recovery_token: "recovery_qr_1",
        pay: {
          type: "qr",
          value: "weixin://wxpay/mock_qr",
          provider: "wechatpay",
        },
      },
      paymentUnavailable
    );

    expect(action.kind).toBe("order_wait");
    if (action.kind !== "order_wait") return;

    const path = buildOrderWaitPath(action);
    const url = new URL(path, "https://example.test");
    expect(url.pathname).toBe("/pay/wait");
    expect(url.searchParams.get("order_no")).toBe("ord_qr_1");
    expect(url.searchParams.get("pay_type")).toBe("qr");
    expect(url.searchParams.get("pay_value")).toBe("weixin://wxpay/mock_qr");
    expect(url.searchParams.get("provider")).toBe("wechatpay");
    expect(url.searchParams.get("payment_recovery_token")).toBe("recovery_qr_1");
  });

  it("routes pay.html to /pay/wait with query payload", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_html_1",
        provider: "alipay",
        payment_recovery_token: "recovery_html_1",
        result_url: "/en/result/attempt-html-1?from=payment",
        pay: {
          type: "html",
          value: "/api/v0.3/orders/ord_html_1/pay/alipay?scene=desktop",
          provider: "alipay",
        },
      },
      paymentUnavailable
    );

    expect(action.kind).toBe("order_wait");
    if (action.kind !== "order_wait") return;

    const path = buildOrderWaitPath(action);
    const url = new URL(path, "https://example.test");
    expect(url.pathname).toBe("/pay/wait");
    expect(url.searchParams.get("order_no")).toBe("ord_html_1");
    expect(url.searchParams.get("pay_type")).toBe("html");
    expect(url.searchParams.get("pay_value")).toBe("/api/v0.3/orders/ord_html_1/pay/alipay?scene=desktop");
    expect(url.searchParams.get("provider")).toBe("alipay");
    expect(url.searchParams.get("payment_recovery_token")).toBe("recovery_html_1");
    expect(action.resultUrl).toBe("/en/result/attempt-html-1?from=payment");
  });

  it("merges checkout pay payload into backend wait_url when the backend wait flow is generic", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_merge_wait_1",
        provider: "alipay",
        payment_recovery_token: "recovery_merge_wait_1",
        wait_url: "https://fermatmind.com/en/pay/wait?order_no=ord_merge_wait_1&payment_recovery_token=recovery_merge_wait_1",
        pay: {
          type: "html",
          value: "/api/v0.3/orders/ord_merge_wait_1/pay/alipay?scene=desktop",
          provider: "alipay",
        },
      },
      paymentUnavailable
    );

    expect(action.kind).toBe("order_wait");
    if (action.kind !== "order_wait") return;

    const path = buildOrderWaitPath(action);
    const url = new URL(path, "https://example.test");
    expect(url.pathname).toBe("/pay/wait");
    expect(url.searchParams.get("order_no")).toBe("ord_merge_wait_1");
    expect(url.searchParams.get("pay_type")).toBe("html");
    expect(url.searchParams.get("pay_value")).toBe("/api/v0.3/orders/ord_merge_wait_1/pay/alipay?scene=desktop");
    expect(url.searchParams.get("provider")).toBe("alipay");
    expect(url.searchParams.get("payment_recovery_token")).toBe("recovery_merge_wait_1");
  });

  it("preserves backend wait_url over locally synthesized wait paths when no immediate pay action exists", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_legacy_1",
        payment_recovery_token: "recovery_legacy_1",
        wait_url: "https://fermatmind.com/en/pay/wait?order_no=ord_legacy_1&payment_recovery_token=recovery_legacy_1",
        status: "pending",
      },
      paymentUnavailable
    );

    expect(action.kind).toBe("order_wait");
    if (action.kind !== "order_wait") return;

    expect(action.payType).toBeNull();
    expect(action.payValue).toBeNull();
    expect(buildOrderWaitPath(action)).toBe("/pay/wait?order_no=ord_legacy_1&payment_recovery_token=recovery_legacy_1");
  });

  it("keeps legacy order_no fallback inside /pay/wait rather than /orders/{orderNo}", () => {
    const action = resolveCheckoutAction(
      {
        order_no: "ord_legacy_2",
        status: "pending",
      },
      paymentUnavailable
    );

    expect(action.kind).toBe("order_wait");
    if (action.kind !== "order_wait") return;

    expect(action.payType).toBeNull();
    expect(action.payValue).toBeNull();
    expect(buildOrderWaitPath(action)).toBe("/pay/wait?order_no=ord_legacy_2");
  });
});
