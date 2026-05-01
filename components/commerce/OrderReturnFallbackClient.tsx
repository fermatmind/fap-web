"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalizeCommerceWaitPath } from "@/lib/commerce/redirectUrls";
import { clearPendingOrder, readPendingOrder } from "@/lib/commerce/pendingOrder";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/locales";
import { recoverAlipayReturnContext } from "@/lib/api/v0_3";

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

function normalizeWaitHref(locale: Locale, value: string | null | undefined): string | null {
  const normalized = normalizeCommerceWaitPath(value);
  if (!normalized) {
    return null;
  }

  const parsed = new URL(normalized, "https://example.test");
  const normalizedPath = stripLocalePrefix(parsed.pathname);
  return localizedPath(`${normalizedPath}${parsed.search}`, locale);
}

export function OrderReturnFallbackClient({
  locale,
  orderNo,
  outTradeNo,
  paymentRecoveryToken,
  waitUrl,
  returnParams,
}: {
  locale: Locale;
  orderNo?: string | null;
  outTradeNo?: string | null;
  paymentRecoveryToken?: string | null;
  waitUrl?: string | null;
  returnParams?: Record<string, string | null | undefined>;
}) {
  const router = useRouter();

  useEffect(() => {
    const pendingOrder = readPendingOrder();
    const explicitOrderNo = normalizeText(orderNo) ?? normalizeText(outTradeNo);
    const explicitPaymentRecoveryToken = normalizeText(paymentRecoveryToken);
    const explicitWaitHref = normalizeWaitHref(locale, waitUrl);
    const pendingPaymentRecoveryToken =
      pendingOrder?.orderNo === explicitOrderNo
        ? normalizeText(pendingOrder.paymentRecoveryToken)
        : null;
    const pendingWaitHref =
      !explicitOrderNo || pendingOrder?.orderNo === explicitOrderNo
        ? normalizeWaitHref(locale, pendingOrder?.waitUrl)
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

    const redirect = async () => {
      if (explicitWaitHref) {
        router.replace(explicitWaitHref);
        return;
      }

      if (explicitOrderNo && explicitPaymentRecoveryToken && explicitWaitFromOrderNo) {
        router.replace(explicitWaitFromOrderNo);
        return;
      }

      if (explicitOrderNo && !explicitPaymentRecoveryToken) {
        try {
          const recovered = await recoverAlipayReturnContext({
            orderNo: explicitOrderNo,
            query: {
              ...(returnParams ?? {}),
              order_no: explicitOrderNo,
              out_trade_no: normalizeText(outTradeNo),
            },
          });
          const recoveredWaitHref = normalizeWaitHref(locale, recovered.wait_url ?? null);
          const recoveredToken = normalizeText(recovered.payment_recovery_token ?? null);
          if (recoveredWaitHref) {
            router.replace(recoveredWaitHref);
            return;
          }
          if (recoveredToken) {
            router.replace(buildWaitHref(locale, explicitOrderNo, recoveredToken));
            return;
          }
        } catch {
          // Fall through to the remaining recovery heuristics.
        }

        if (explicitWaitFromOrderNo) {
          router.replace(explicitWaitFromOrderNo);
          return;
        }
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
  }, [locale, orderNo, outTradeNo, paymentRecoveryToken, returnParams, router, waitUrl]);

  return null;
}
