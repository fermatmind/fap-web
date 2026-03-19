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
  paymentRecoveryToken,
  waitUrl,
  resultUrl,
}: {
  locale: Locale;
  orderNo?: string | null;
  paymentRecoveryToken?: string | null;
  waitUrl?: string | null;
  resultUrl?: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const pendingOrder = readPendingOrder();
    const explicitOrderNo = normalizeText(orderNo);
    const explicitPaymentRecoveryToken = normalizeText(paymentRecoveryToken);
    const explicitWaitHref = normalizeInternalHref(locale, waitUrl);
    const explicitResultHref = normalizeInternalHref(locale, resultUrl);
    const pendingWaitHref =
      !explicitOrderNo || pendingOrder?.orderNo === explicitOrderNo
        ? normalizeInternalHref(locale, pendingOrder?.waitUrl)
        : null;
    const pendingResultHref = normalizeInternalHref(locale, pendingOrder?.resultUrl);
    const fallbackOrderNo = explicitOrderNo ?? pendingOrder?.orderNo ?? null;
    const fallbackPaymentRecoveryToken =
      explicitPaymentRecoveryToken ?? pendingOrder?.paymentRecoveryToken ?? null;

    if (pendingOrder) {
      clearPendingOrder();
    }

    if (explicitWaitHref) {
      router.replace(explicitWaitHref);
      return;
    }

    if (pendingWaitHref) {
      router.replace(pendingWaitHref);
      return;
    }

    if (fallbackOrderNo) {
      router.replace(buildWaitHref(locale, fallbackOrderNo, fallbackPaymentRecoveryToken));
      return;
    }

    if (explicitResultHref) {
      router.replace(explicitResultHref);
      return;
    }

    if (pendingResultHref) {
      router.replace(pendingResultHref);
      return;
    }

    if (!pendingOrder?.orderNo) {
      return;
    }

    const query = new URLSearchParams({ orderNo: pendingOrder.orderNo });
    router.replace(localizedPath(`/orders/lookup?${query.toString()}`, locale));
  }, [locale, orderNo, paymentRecoveryToken, resultUrl, router, waitUrl]);

  return null;
}
