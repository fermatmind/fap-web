"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearPendingOrder, readPendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

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

export function OrderReturnFallbackClient({
  locale,
  orderNo,
  paymentRecoveryToken,
}: {
  locale: Locale;
  orderNo?: string | null;
  paymentRecoveryToken?: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const pendingOrder = readPendingOrder();
    const explicitOrderNo = normalizeText(orderNo);
    const explicitPaymentRecoveryToken = normalizeText(paymentRecoveryToken);

    if (pendingOrder) {
      clearPendingOrder();
    }

    if (explicitOrderNo) {
      if (pendingOrder?.orderNo === explicitOrderNo && pendingOrder.waitUrl) {
        router.replace(pendingOrder.waitUrl);
        return;
      }

      router.replace(
        buildWaitHref(
          locale,
          explicitOrderNo,
          explicitPaymentRecoveryToken ?? pendingOrder?.paymentRecoveryToken ?? null
        )
      );
      return;
    }

    if (!pendingOrder?.orderNo) {
      return;
    }

    const waitHref = pendingOrder.waitUrl;
    if (waitHref) {
      router.replace(waitHref);
      return;
    }

    const query = new URLSearchParams({ orderNo: pendingOrder.orderNo });
    router.replace(localizedPath(`/orders/lookup?${query.toString()}`, locale));
  }, [locale, router]);

  return null;
}
