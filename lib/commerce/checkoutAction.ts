import type { CheckoutRegion, CheckoutResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

export type CheckoutAction =
  | {
      kind: "redirect";
      url: string;
      orderNo: string | null;
      provider: string | null;
    }
  | {
      kind: "order_wait";
      orderNo: string;
      payType: "qr" | "html" | null;
      payValue: string | null;
      provider: string | null;
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

export function resolveCheckoutAction(checkout: CheckoutResponse, paymentUnavailableMessage: string): CheckoutAction {
  const orderNo = nonEmptyString(checkout.order_no);
  const provider = nonEmptyString(checkout.provider);
  const checkoutUrl = nonEmptyString(checkout.checkout_url);
  const payNode = checkout.pay && typeof checkout.pay === "object" ? checkout.pay : null;
  const payType = normalizePayType(payNode?.type);
  const payValue = nonEmptyString(payNode?.value);
  const payProvider = nonEmptyString(payNode?.provider) ?? provider;

  if (payType === "redirect" && payValue) {
    return {
      kind: "redirect",
      url: payValue,
      orderNo,
      provider: payProvider,
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
    };
  }

  if (checkoutUrl) {
    return {
      kind: "redirect",
      url: checkoutUrl,
      orderNo,
      provider: payProvider,
    };
  }

  if (orderNo) {
    return {
      kind: "order_wait",
      orderNo,
      payType: null,
      payValue: null,
      provider: payProvider,
    };
  }

  return {
    kind: "error",
    message: paymentUnavailableMessage,
  };
}

export function buildOrderWaitPath(action: Extract<CheckoutAction, { kind: "order_wait" }>): string {
  const params = new URLSearchParams();
  if (action.payType) {
    params.set("pay_type", action.payType);
  }
  if (action.payValue) {
    params.set("pay_value", action.payValue);
  }
  if (action.provider) {
    params.set("provider", action.provider);
  }

  const query = params.toString();
  if (!query) {
    return `/orders/${action.orderNo}`;
  }

  return `/orders/${action.orderNo}?${query}`;
}

export function regionFromLocale(locale: Locale): CheckoutRegion {
  return locale === "zh" ? "CN_MAINLAND" : "US";
}

