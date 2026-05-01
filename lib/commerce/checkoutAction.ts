import type { CheckoutRegion, CheckoutResponse, OrderLookupResponse, OrderStatusResponse } from "@/lib/api/v0_3";
import {
  normalizeCommercePayValue,
  normalizeCommercePaymentRedirectUrl,
  normalizeCommerceReportPath,
  normalizeCommerceWaitPath,
} from "@/lib/commerce/redirectUrls";
import type { Locale } from "@/lib/i18n/locales";

export type CheckoutAction =
  | {
      kind: "redirect";
      url: string;
      orderNo: string | null;
      provider: string | null;
      waitUrl: string | null;
      paymentRecoveryToken: string | null;
      resultUrl: string | null;
    }
  | {
      kind: "order_wait";
      orderNo: string;
      payType: "qr" | "html" | null;
      payValue: string | null;
      provider: string | null;
      waitUrl: string | null;
      paymentRecoveryToken: string | null;
      resultUrl: string | null;
    }
  | {
      kind: "error";
      message: string;
    };

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizePayType(value: unknown): "qr" | "redirect" | "html" | null {
  const normalized = nonEmptyString(value)?.toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "qr" || normalized === "redirect" || normalized === "html") {
    return normalized;
  }

  return null;
}

export function resolveCheckoutAction(
  checkout: CheckoutResponse | OrderStatusResponse | OrderLookupResponse,
  paymentUnavailableMessage: string
): CheckoutAction {
  const orderNo = nonEmptyString(checkout.order_no);
  const provider = nonEmptyString(checkout.provider);
  const waitUrl = normalizeCommerceWaitPath(checkout.wait_url);
  const paymentRecoveryToken = nonEmptyString(checkout.payment_recovery_token);
  const payNode = checkout.pay && typeof checkout.pay === "object" ? checkout.pay : null;
  const payType = normalizePayType(payNode?.type);
  const payProvider = nonEmptyString(payNode?.provider) ?? provider;
  const payValue = normalizeCommercePayValue({
    payType,
    value: payNode?.value,
    provider: payProvider,
  });
  const resultUrl = normalizeCommerceReportPath(checkout.result_url);
  const checkoutUrl = normalizeCommercePaymentRedirectUrl(checkout.checkout_url, payProvider);

  if (payType === "redirect" && payValue) {
    return {
      kind: "redirect",
      url: payValue,
      orderNo,
      provider: payProvider,
      waitUrl,
      paymentRecoveryToken,
      resultUrl,
    };
  }

  if (payType === "qr" || payType === "html") {
    if (!orderNo || !payValue) {
      return {
        kind: "error",
        message: paymentUnavailableMessage,
      };
    }

    return {
      kind: "order_wait",
      orderNo,
      payType,
      payValue,
      provider: payProvider,
      waitUrl,
      paymentRecoveryToken,
      resultUrl,
    };
  }

  if (checkoutUrl) {
    return {
      kind: "redirect",
      url: checkoutUrl,
      orderNo,
      provider: payProvider,
      waitUrl,
      paymentRecoveryToken,
      resultUrl,
    };
  }

  if (orderNo) {
    return {
      kind: "order_wait",
      orderNo,
      payType: null,
      payValue: null,
      provider: payProvider,
      waitUrl,
      paymentRecoveryToken,
      resultUrl,
    };
  }

  return {
    kind: "error",
    message: paymentUnavailableMessage,
  };
}

export function buildOrderWaitPath(action: Extract<CheckoutAction, { kind: "order_wait" }>): string {
  const parsed = new URL(action.waitUrl ?? "/pay/wait", "https://example.test");
  const params = parsed.searchParams;

  params.set("order_no", action.orderNo);
  if (action.payType === "qr" || action.payType === "html") {
    params.set("pay_type", action.payType);
  }
  if (action.payValue) {
    params.set("pay_value", action.payValue);
  }
  if (action.provider) {
    params.set("provider", action.provider);
  }
  if (action.paymentRecoveryToken) {
    params.set("payment_recovery_token", action.paymentRecoveryToken);
  }

  return `${parsed.pathname}${params.size > 0 ? `?${params.toString()}` : ""}${parsed.hash}`;
}

export function regionFromLocale(locale: Locale): CheckoutRegion {
  return locale === "zh" ? "CN_MAINLAND" : "US";
}
