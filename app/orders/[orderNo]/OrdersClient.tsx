"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStatus } from "@/lib/api/v0_3";
import { getAnonymousId, trackEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { captureError } from "@/lib/observability/sentry";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type ViewStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";

const POLL_MS = 2000;
const TIMEOUT_MS = 45000;

export default function OrdersClient({ orderNo }: { orderNo: string }) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);

  const [status, setStatus] = useState<ViewStatus>("pending");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(dict.orders.pending);
  const isPolling = useRef(true);
  const reportedStatus = useRef<ViewStatus | null>(null);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const anonId = getAnonymousId();
        const response = await getOrderStatus({ orderNo, anonId });
        if (!active) return;

        const nextStatus = (response.status ?? "pending") as ViewStatus;
        setStatus(nextStatus);
        setAttemptId(response.attempt_id ?? null);

        if (nextStatus === "paid") {
          setMessage(response.message ?? dict.orders.paid);
          isPolling.current = false;

          if (reportedStatus.current !== "paid") {
            const maskedOrder = `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`;
            const maskedAttempt = response.attempt_id
              ? `${response.attempt_id.slice(0, 6)}...${response.attempt_id.slice(-4)}`
              : "";
            const amountRaw = (response as { amount?: unknown; amount_cents?: unknown }).amount
              ?? (response as { amount?: unknown; amount_cents?: unknown }).amount_cents;
            const amount = typeof amountRaw === "number" ? amountRaw : Number.parseFloat(String(amountRaw ?? ""));
            const currency = String((response as { currency?: unknown }).currency ?? "");
            trackEvent("payment_confirmed", {
              orderNoMasked: maskedOrder,
              attemptIdMasked: maskedAttempt,
              locale,
            });
            trackEvent("purchase_success", {
              orderNoMasked: maskedOrder,
              attemptIdMasked: maskedAttempt,
              ...(Number.isFinite(amount) ? { amount } : {}),
              ...(currency ? { currency } : {}),
              locale,
            });
            reportedStatus.current = "paid";
          }
          return;
        }

        if (nextStatus === "failed" || nextStatus === "canceled" || nextStatus === "refunded") {
          const fallbackMessage =
            nextStatus === "failed"
              ? dict.orders.failed
              : nextStatus === "canceled"
                ? dict.orders.canceled
                : dict.orders.refunded;
          setMessage(response.message ?? fallbackMessage);
          isPolling.current = false;

          if (reportedStatus.current !== nextStatus) {
            trackEvent("payment_failed", {
              orderNoMasked: `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`,
              reason: response.message ?? fallbackMessage,
              locale,
            });
            reportedStatus.current = nextStatus;
          }
          return;
        }

        setMessage(response.message ?? dict.orders.pending);
      } catch (cause) {
        if (!active) return;
        setStatus("failed");
        setMessage(locale === "zh" ? "订单状态查询失败，请稍后再试。" : "Unable to check order status. Please try again.");
        isPolling.current = false;
        captureError(cause, {
          route: "/orders/[orderNo]",
          orderNo,
          stage: "poll_order_status",
        });
      }
    };

    void poll();

    const timeoutTimer = window.setTimeout(() => {
      if (!active || !isPolling.current) return;
      setStatus("failed");
      setMessage(locale === "zh" ? "订单确认超时，请刷新或联系客服。" : "Payment confirmation timed out. Please refresh or contact support.");
      isPolling.current = false;
    }, TIMEOUT_MS);

    const timer = window.setInterval(() => {
      if (!active || !isPolling.current) return;

      void poll();
    }, POLL_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutTimer);
      window.clearInterval(timer);
    };
  }, [dict, locale, orderNo]);

  const icon = useMemo(() => {
    if (status === "paid") return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
    if (status === "pending") return <Loader2 className="h-6 w-6 animate-spin text-slate-600" />;
    return <XCircle className="h-6 w-6 text-rose-600" />;
  }, [status]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{dict.orders.title} #{orderNo}</CardTitle>
          </div>
          <p className="m-0 text-sm text-slate-600">{message}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {status === "pending" ? (
            <Alert className="border-slate-200 bg-slate-50 text-slate-700">{dict.orders.pending}</Alert>
          ) : null}

          {status === "paid" ? (
            <div className="space-y-3">
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">{dict.orders.reportReady}</Alert>
              {attemptId ? (
                <Link href={withLocale(`/result/${attemptId}`)} className="inline-flex w-full">
                  <Button className="w-full" type="button">
                    {dict.orders.viewReport}
                  </Button>
                </Link>
              ) : (
                <Alert>{dict.orders.reportGenerating}</Alert>
              )}
            </div>
          ) : null}

          {status === "failed" || status === "canceled" || status === "refunded" ? (
            <div className="space-y-3">
              <Alert>{message}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => window.location.reload()} variant="outline">
                  {dict.orders.refresh}
                </Button>
                {attemptId ? (
                  <Link href={withLocale(`/result/${attemptId}`)}>
                    <Button type="button">{dict.orders.retryPayment}</Button>
                  </Link>
                ) : null}
                <Link href={withLocale("/support")}>
                  <Button type="button" variant="secondary">
                    {dict.orders.contactSupport}
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
