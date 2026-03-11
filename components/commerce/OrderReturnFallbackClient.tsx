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

    clearPendingOrder();
    router.replace(localizedPath(`/orders/${pendingOrder.orderNo}`, locale));
  }, [locale, router]);

  return null;
}
