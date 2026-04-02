"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearPendingOrder, readPendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/locales";

function normalizeText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function buildWaitHref(locale: Locale, orderNo: string, paymentRecoveryToken: string | null): string {
  const query = new URLSearchParams({ order_no: orderNo });
  if (paymentRecoveryToken) {
    query.set("payment_recovery_token", paymentRecoveryToken);
  }

  return localizedPath(`/pay/wait?${query.toString()}`, locale);
}

function normalizeInternalHref(locale: Locale, value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(normalized, "https://example.test");
    return localizedPath(`${stripLocalePrefix(parsed.pathname)}${parsed.search}${parsed.hash}`, locale);
  } catch {
    return localizedPath(normalized.startsWith("/") ? normalized : `/${normalized}`, locale);
  }
}

export function OrderReturnFallbackClient({
  locale,
  orderNo,
  outTradeNo,
  paymentRecoveryToken,
  waitUrl,
}: {
  locale: Locale;
  orderNo?: string | null;
  outTradeNo?: string | null;
  paymentRecoveryToken?: string | null;
  waitUrl?: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const pendingOrder = readPendingOrder();
    const explicitOrderNo = normalizeText(orderNo) ?? normalizeText(outTradeNo);
    const explicitPaymentRecoveryToken = normalizeText(paymentRecoveryToken);
    const explicitWaitHref = normalizeInternalHref(locale, waitUrl);
    const pendingPaymentRecoveryToken =
      pendingOrder?.orderNo === explicitOrderNo
        ? normalizeText(pendingOrder.paymentRecoveryToken)
        : null;
    const pendingWaitHref =
      !explicitOrderNo || pendingOrder?.orderNo === explicitOrderNo
        ? normalizeInternalHref(locale, pendingOrder?.waitUrl)
        : null;
    const explicitWaitFromOrderNo = explicitOrderNo
      ? buildWaitHref(locale, explicitOrderNo, explicitPaymentRecoveryToken ?? pendingPaymentRecoveryToken)
      : null;
    const pendingOrderWaitHref = pendingOrder?.orderNo
      ? buildWaitHref(
          locale,
          pendingOrder.orderNo,
          normalizeText(pendingOrder.paymentRecoveryToken)
        )
      : null;

    if (pendingOrder) {
      clearPendingOrder();
    }

    const redirect = () => {
      if (explicitWaitHref) {
        router.replace(explicitWaitHref);
        return;
      }

      if (explicitWaitFromOrderNo) {
        router.replace(explicitWaitFromOrderNo);
        return;
      }

      if (pendingWaitHref) {
        router.replace(pendingWaitHref);
        return;
      }

      if (pendingOrderWaitHref) {
        router.replace(pendingOrderWaitHref);
        return;
      }

      router.replace(localizedPath("/orders/lookup", locale));
    };

    void redirect();
  }, [locale, orderNo, outTradeNo, paymentRecoveryToken, router, waitUrl]);

  return null;
}
