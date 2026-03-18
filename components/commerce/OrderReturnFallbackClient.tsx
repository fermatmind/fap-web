"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearPendingOrder, readPendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function OrderReturnFallbackClient({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    const pendingOrder = readPendingOrder();
    if (!pendingOrder?.orderNo) {
      return;
    }

    const waitHref = pendingOrder.waitUrl;
    clearPendingOrder();
    if (waitHref) {
      router.replace(waitHref);
      return;
    }

    const query = new URLSearchParams({ orderNo: pendingOrder.orderNo });
    router.replace(localizedPath(`/orders/lookup?${query.toString()}`, locale));
  }, [locale, router]);

  return null;
}
