"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStatus } from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { captureError } from "@/lib/observability/sentry";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type ViewStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";

const POLL_BACKOFF_MS = [2000, 3000, 5000, 8000, 10000];
const POLL_TIMEOUT_MS = 120000;

export default function OrdersClient({ orderNo }: { orderNo: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);

  const [status, setStatus] = useState<ViewStatus>("pending");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(dict.orders.pending);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollTimerRef = useRef<number | null>(null);
  const pollStepRef = useRef(0);
  const pollStartedAtRef = useRef(Date.now());
  const isPollingRef = useRef(true);
  const reportedStatusRef = useRef<ViewStatus | null>(null);
  const didAutoRedirectRef = useRef(false);
  const triggerPollRef = useRef<((options?: { manual?: boolean }) => void) | null>(null);

  useEffect(() => {
    let active = true;

    const timeoutMessage =
      locale === "zh"
        ? "订单确认超时，请刷新或联系客服。"
        : "Payment confirmation timed out. Please refresh or contact support.";
    const requestFailedMessage =
      locale === "zh" ? "订单状态查询失败，请稍后再试。" : "Unable to check order status. Please try again.";

    const clearPollTimer = () => {
      if (!pollTimerRef.current) return;
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    };

    const stopPolling = () => {
      isPollingRef.current = false;
      clearPollTimer();
    };

    const hasTimedOut = () => Date.now() - pollStartedAtRef.current >= POLL_TIMEOUT_MS;

    const scheduleNextPoll = (poll: (options?: { manual?: boolean }) => Promise<void>) => {
      if (!active || !isPollingRef.current) return;
      const delay = POLL_BACKOFF_MS[Math.min(pollStepRef.current, POLL_BACKOFF_MS.length - 1)] ?? 10000;
      pollStepRef.current = Math.min(pollStepRef.current + 1, POLL_BACKOFF_MS.length - 1);
      clearPollTimer();
      pollTimerRef.current = window.setTimeout(() => {
        void poll();
      }, delay);
    };

    const poll = async (options: { manual?: boolean } = {}) => {
      const { manual = false } = options;

      if (!active) return;
      if (manual) {
        setIsRefreshing(true);
        setStatus("pending");
        setMessage(dict.orders.pending);
        clearPollTimer();
        isPollingRef.current = true;
        pollStartedAtRef.current = Date.now();
        pollStepRef.current = 0;
      }

      try {
        const response = await getOrderStatus({ orderNo });
        if (!active) return;

        const nextStatus = (response.status ?? "pending") as ViewStatus;
        setStatus(nextStatus);
        setAttemptId(response.attempt_id ?? null);

        if (nextStatus === "paid") {
          if (reportedStatusRef.current !== "paid") {
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
            reportedStatusRef.current = "paid";
          }

          if (response.attempt_id) {
            setMessage(response.message ?? dict.orders.reportReady);
            stopPolling();
            if (!didAutoRedirectRef.current) {
              didAutoRedirectRef.current = true;
              router.replace(withLocale(`/result/${response.attempt_id}`));
            }
            return;
          }

          setMessage(response.message ?? dict.orders.reportGenerating);
          if (hasTimedOut()) {
            stopPolling();
            setStatus("failed");
            setMessage(timeoutMessage);
            return;
          }

          scheduleNextPoll(poll);
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
          stopPolling();

          if (reportedStatusRef.current !== nextStatus) {
            trackEvent("payment_failed", {
              orderNoMasked: `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`,
              reason: response.message ?? fallbackMessage,
              locale,
            });
            reportedStatusRef.current = nextStatus;
          }
          return;
        }

        setMessage(response.message ?? dict.orders.pending);

        if (hasTimedOut()) {
          stopPolling();
          setStatus("failed");
          setMessage(timeoutMessage);
          return;
        }

        scheduleNextPoll(poll);
      } catch (cause) {
        if (!active) return;
        stopPolling();
        setStatus("failed");
        setMessage(requestFailedMessage);
        captureError(cause, {
          route: "/orders/[orderNo]",
          orderNo,
          stage: "poll_order_status",
        });
      } finally {
        if (active) {
          setIsRefreshing(false);
        }
      }
    };

    triggerPollRef.current = (options = {}) => {
      void poll(options);
    };

    pollStartedAtRef.current = Date.now();
    pollStepRef.current = 0;
    isPollingRef.current = true;
    didAutoRedirectRef.current = false;
    reportedStatusRef.current = null;
    void poll();

    return () => {
      active = false;
      triggerPollRef.current = null;
      clearPollTimer();
    };
  }, [dict, locale, orderNo, router, withLocale]);

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    triggerPollRef.current?.({ manual: true });
  };

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
            <div className="space-y-3">
              <Alert className="border-slate-200 bg-slate-50 text-slate-700">{dict.orders.pending}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                  {isRefreshing ? `${dict.orders.refresh}...` : dict.orders.refresh}
                </Button>
                <Link href={withLocale("/support")}>
                  <Button type="button" variant="secondary">
                    {dict.orders.contactSupport}
                  </Button>
                </Link>
              </div>
            </div>
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
                <>
                  <Alert>{dict.orders.reportGenerating}</Alert>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                      {isRefreshing ? `${dict.orders.refresh}...` : dict.orders.refresh}
                    </Button>
                    <Link href={withLocale("/support")}>
                      <Button type="button" variant="secondary">
                        {dict.orders.contactSupport}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {status === "failed" || status === "canceled" || status === "refunded" ? (
            <div className="space-y-3">
              <Alert>{message}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                  {isRefreshing ? `${dict.orders.refresh}...` : dict.orders.refresh}
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
