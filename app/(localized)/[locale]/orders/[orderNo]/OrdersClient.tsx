"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStatus, resendOrderDelivery, type OrderStatusResponse } from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { captureError } from "@/lib/observability/sentry";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { normalizeMbtiAccessHub } from "@/lib/mbti/accessHub";

type ViewStatus = "initializing" | "pending" | "paid" | "failed" | "canceled" | "refunded";
type PayType = "qr" | "html" | "redirect" | null;
type DeliveryPayload = NonNullable<OrderStatusResponse["delivery"]>;
type RecoveryMode = "not_found" | "identity_mismatch" | null;

const POLL_BACKOFF_MS = [2000, 3000, 5000, 8000, 10000];
const POLL_TIMEOUT_MS = 120000;

function normalizePayType(value: string | null): PayType {
  if (value === "qr" || value === "html" || value === "redirect") {
    return value;
  }
  return null;
}

function normalizeQueryValue(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeActionHref(
  value: string | null | undefined,
  withLocale: (path: string) => string
): string | null {
  const normalized = normalizeQueryValue(value ?? null);
  if (!normalized) return null;
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const candidate = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const firstSegment = candidate.split("/").filter(Boolean)[0];
  if (firstSegment === "en" || firstSegment === "zh") {
    return candidate;
  }

  return withLocale(candidate);
}

function resolveDeliveryReportHref({
  delivery,
  attemptId,
  withLocale,
}: {
  delivery: DeliveryPayload | null;
  attemptId: string | null;
  withLocale: (path: string) => string;
}): string | null {
  const fromContract = normalizeActionHref(delivery?.report_url ?? null, withLocale);
  if (fromContract) {
    return fromContract;
  }

  if (!delivery && attemptId) {
    return withLocale(`/result/${attemptId}`);
  }

  if (delivery?.can_view_report === true && attemptId) {
    return withLocale(`/result/${attemptId}`);
  }

  return null;
}

function formatDeliveryEmailTimestamp(value: string | null | undefined, locale: "en" | "zh"): string | null {
  const normalized = normalizeQueryValue(value ?? null);
  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parsed);
}

export default function OrdersClient({
  orderNo,
  paymentRecoveryToken,
}: {
  orderNo: string;
  paymentRecoveryToken?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const initializingMessage = locale === "zh" ? "正在加载订单状态..." : "Loading order status...";
  const identityMismatchTitle =
    locale === "zh" ? "当前登录身份与订单所有者不匹配。" : "This order belongs to a different signed-in identity.";
  const identityMismatchHint =
    locale === "zh"
      ? "请使用原购买账号登录，或在匿名购买场景下通过订单查询恢复支付流程。"
      : "Sign in with the account used for purchase, or use order lookup if you checked out as a guest.";
  const queryPayType = useMemo(() => normalizePayType(searchParams.get("pay_type")), [searchParams]);
  const queryPayValue = useMemo(() => normalizeQueryValue(searchParams.get("pay_value")), [searchParams]);
  const queryPayProvider = useMemo(() => normalizeQueryValue(searchParams.get("provider")), [searchParams]);
  const queryPaymentRecoveryToken = useMemo(
    () => normalizeQueryValue(searchParams.get("payment_recovery_token") ?? searchParams.get("paymentRecoveryToken")),
    [searchParams]
  );
  const effectivePaymentRecoveryToken = useMemo(
    () => normalizeQueryValue(paymentRecoveryToken ?? queryPaymentRecoveryToken),
    [paymentRecoveryToken, queryPaymentRecoveryToken]
  );

  const [status, setStatus] = useState<ViewStatus>("initializing");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPayload | null>(null);
  const [accessHubRaw, setAccessHubRaw] = useState<OrderStatusResponse["mbti_access_hub_v1"] | null>(null);
  const [payType, setPayType] = useState<PayType>(queryPayType);
  const [payValue, setPayValue] = useState<string | null>(queryPayValue);
  const [payProvider, setPayProvider] = useState<string | null>(queryPayProvider);
  const [message, setMessage] = useState<string>(initializingMessage);
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResendingDelivery, setIsResendingDelivery] = useState(false);
  const [deliveryFeedback, setDeliveryFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState(false);

  const pollTimerRef = useRef<number | null>(null);
  const pollStepRef = useRef(0);
  const pollStartedAtRef = useRef(Date.now());
  const isPollingRef = useRef(true);
  const payProviderRef = useRef<string | null>(payProvider);
  const payTypeRef = useRef<PayType>(queryPayType);
  const payValueRef = useRef<string | null>(queryPayValue);
  const reportedStatusRef = useRef<ViewStatus | null>(null);
  const didAutoRedirectRef = useRef(false);
  const triggerPollRef = useRef<((options?: { manual?: boolean }) => void) | null>(null);
  const orderLookupHref = useMemo(() => {
    const query = new URLSearchParams({ orderNo });
    return withLocale(`/orders/lookup?${query.toString()}`);
  }, [orderNo, withLocale]);

  useEffect(() => {
    if (queryPayType) {
      setPayType(queryPayType);
    }
    if (queryPayValue) {
      setPayValue(queryPayValue);
    }
    if (queryPayProvider) {
      setPayProvider(queryPayProvider);
    }
  }, [queryPayProvider, queryPayType, queryPayValue]);

  useEffect(() => {
    payProviderRef.current = payProvider;
  }, [payProvider]);

  useEffect(() => {
    payTypeRef.current = payType;
  }, [payType]);

  useEffect(() => {
    payValueRef.current = payValue;
  }, [payValue]);

  useEffect(() => {
    let active = true;

    if (payType !== "qr" || !payValue) {
      setQrCodeDataUrl(null);
      setQrCodeError(false);
      return () => {
        active = false;
      };
    }

    setQrCodeDataUrl(null);
    setQrCodeError(false);
    void QRCode.toDataURL(payValue, {
      width: 280,
      margin: 2,
    })
      .then((dataUrl: string) => {
        if (!active) return;
        setQrCodeDataUrl(dataUrl);
      })
      .catch(() => {
        if (!active) return;
        setQrCodeError(true);
      });

    return () => {
      active = false;
    };
  }, [payType, payValue]);

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
        setStatus("initializing");
        setMessage(initializingMessage);
        setRecoveryMode(null);
        setTimedOut(false);
        clearPollTimer();
        isPollingRef.current = true;
        pollStartedAtRef.current = Date.now();
        pollStepRef.current = 0;
      }

      const includePaymentAction = !queryPayType && (!payTypeRef.current || !payValueRef.current);

      try {
        const response = await getOrderStatus({
          orderNo,
          includePaymentAction,
          paymentRecoveryToken: effectivePaymentRecoveryToken ?? undefined,
        });
        if (!active) return;

        setRecoveryMode(null);
        setTimedOut(false);
        const nextStatus = (response.status ?? "pending") as ViewStatus;
        const responsePayNode = response.pay && typeof response.pay === "object" ? response.pay : null;
        const responsePayType = normalizePayType(
          typeof responsePayNode?.type === "string" ? responsePayNode.type : null
        );
        const responsePayValue = normalizeQueryValue(
          typeof responsePayNode?.value === "string" ? responsePayNode.value : null
        );
        const responsePayProvider =
          normalizeQueryValue(typeof response.provider === "string" ? response.provider : null)
          ?? normalizeQueryValue(typeof responsePayNode?.provider === "string" ? responsePayNode.provider : null);
        const responseResultUrl = normalizeActionHref(
          typeof response.result_url === "string" ? response.result_url : null,
          withLocale
        );

        setStatus(nextStatus);
        setAttemptId(response.attempt_id ?? null);
        setDelivery((response.delivery ?? null) as DeliveryPayload | null);
        setAccessHubRaw(response.mbti_access_hub_v1 ?? null);
        if (!queryPayType && responsePayType && responsePayValue) {
          setPayType(responsePayType);
          setPayValue(responsePayValue);
        }
        if (!queryPayProvider && responsePayProvider) {
          setPayProvider(responsePayProvider);
        }

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
              ...(payProviderRef.current ? { provider: payProviderRef.current } : {}),
            });
            trackEvent("purchase_success", {
              orderNoMasked: maskedOrder,
              attemptIdMasked: maskedAttempt,
              ...(Number.isFinite(amount) ? { amount } : {}),
              ...(currency ? { currency } : {}),
              locale,
              ...(payProviderRef.current ? { provider: payProviderRef.current } : {}),
            });
            reportedStatusRef.current = "paid";
          }

          if (responseResultUrl) {
            setMessage(response.message ?? dict.orders.reportReady);
            stopPolling();
            if (!didAutoRedirectRef.current) {
              didAutoRedirectRef.current = true;
              if (/^https?:\/\//i.test(responseResultUrl)) {
                window.location.assign(responseResultUrl);
              } else {
                router.replace(responseResultUrl);
              }
            }
            return;
          }

          setMessage(response.message ?? dict.orders.reportGenerating);
          if (hasTimedOut()) {
            stopPolling();
            setTimedOut(true);
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
          setTimedOut(false);
          stopPolling();

          if (reportedStatusRef.current !== nextStatus) {
            trackEvent("payment_failed", {
              orderNoMasked: `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`,
              reason: response.message ?? fallbackMessage,
              locale,
              ...(payProviderRef.current ? { provider: payProviderRef.current } : {}),
            });
            reportedStatusRef.current = nextStatus;
          }
          return;
        }

        setMessage(response.message ?? dict.orders.pending);

        if (hasTimedOut()) {
          stopPolling();
          setTimedOut(true);
          setStatus("failed");
          setMessage(timeoutMessage);
          return;
        }

        scheduleNextPoll(poll);
      } catch (cause) {
        if (!active) return;
        stopPolling();

        if (cause instanceof ApiError && cause.status === 404 && cause.errorCode === "NOT_FOUND") {
          setRecoveryMode("not_found");
          setTimedOut(false);
          setStatus("failed");
          setMessage(dict.orders.recoveryRequired);
          setIsRefreshing(false);
          return;
        }

        if (cause instanceof ApiError && cause.status === 403 && cause.errorCode === "IDENTITY_MISMATCH") {
          setRecoveryMode("identity_mismatch");
          setTimedOut(false);
          setStatus("failed");
          setMessage(identityMismatchTitle);
          setIsRefreshing(false);
          return;
        }

        setStatus("failed");
        setTimedOut(false);
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
  }, [
    dict,
    effectivePaymentRecoveryToken,
    identityMismatchTitle,
    initializingMessage,
    locale,
    orderNo,
    queryPayProvider,
    queryPayType,
    router,
    withLocale,
  ]);

  const handleManualRefresh = useCallback(() => {
    if (isRefreshing) return;
    setDeliveryFeedback(null);
    triggerPollRef.current?.({ manual: true });
  }, [isRefreshing]);

  const handleOpenPaymentPage = useCallback(() => {
    if ((payType !== "html" && payType !== "redirect") || !payValue) return;
    window.open(payValue, "_blank", "noopener,noreferrer");
  }, [payType, payValue]);

  const handleRetryPayment = useCallback(() => {
    if ((payType === "html" || payType === "redirect") && payValue) {
      handleOpenPaymentPage();
      return;
    }

    handleManualRefresh();
  }, [handleManualRefresh, handleOpenPaymentPage, payType, payValue]);

  const handleResendDelivery = useCallback(async () => {
    if (isResendingDelivery) return;

    setIsResendingDelivery(true);
    setDeliveryFeedback(null);

    trackEvent("ui_card_interaction", {
      slug: "orders-client",
      visual_kind: "order_resend_delivery",
      interaction: "click",
      locale,
    });

    try {
      const response = await resendOrderDelivery({ orderNo });
      setDeliveryFeedback({
        tone: "success",
        message: response.message ?? (locale === "zh" ? "交付邮件已重新发送。" : "Delivery email sent again."),
      });
    } catch (cause) {
      setDeliveryFeedback({
        tone: "error",
        message:
          cause instanceof Error && cause.message
            ? cause.message
            : locale === "zh"
              ? "重发交付邮件失败，请稍后再试。"
              : "Failed to resend the delivery email. Please try again.",
      });
      captureError(cause, {
        route: "/orders/[orderNo]",
        orderNo,
        stage: "resend_delivery",
      });
    } finally {
      setIsResendingDelivery(false);
    }
  }, [isResendingDelivery, locale, orderNo]);

  const icon = useMemo(() => {
    if (status === "paid") return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
    if (status === "pending" || status === "initializing") return <Loader2 className="h-6 w-6 animate-spin text-slate-600" />;
    return <XCircle className="h-6 w-6 text-rose-600" />;
  }, [status]);

  const deliveryReportHref = useMemo(
    () =>
      resolveDeliveryReportHref({
        delivery,
        attemptId,
        withLocale,
      }),
    [attemptId, delivery, withLocale]
  );
  const deliveryPdfHref = useMemo(
    () => normalizeActionHref(delivery?.report_pdf_url ?? null, withLocale),
    [delivery?.report_pdf_url, withLocale]
  );
  const accessHub = useMemo(
    () => normalizeMbtiAccessHub(accessHubRaw ?? null, locale),
    [accessHubRaw, locale]
  );
  const hubReportHref = accessHub?.reportAccess.href ?? null;
  const hubPdfHref = accessHub?.pdfAccess.href ?? null;
  const hubAttemptId =
    accessHub?.reportAccess.attemptId
    ?? accessHub?.recovery.attemptId
    ?? accessHub?.workspaceLite.attemptId
    ?? attemptId;
  const deliveryLastSentAt = useMemo(
    () => formatDeliveryEmailTimestamp(delivery?.last_delivery_email_sent_at ?? null, locale),
    [delivery?.last_delivery_email_sent_at, locale]
  );
  const claimRecoveryHref = useMemo(() => {
    if (accessHub?.recovery.claimHref) {
      return accessHub.recovery.claimHref;
    }

    if (delivery?.can_request_claim_email !== true) {
      return null;
    }

    const query = new URLSearchParams({
      orderNo,
      mode: "claim",
    });
    return withLocale(`/orders/lookup?${query.toString()}`);
  }, [accessHub?.recovery.claimHref, delivery?.can_request_claim_email, orderNo, withLocale]);
  const workspaceLiteHref = accessHub?.workspaceLite.href ?? null;
  const canViewReport = accessHub
    ? accessHub.reportAccess.canViewReport && Boolean(hubReportHref)
    : delivery ? delivery.can_view_report === true && Boolean(deliveryReportHref) : Boolean(deliveryReportHref);
  const resolvedReportHref = hubReportHref ?? deliveryReportHref;
  const canDownloadPdf = accessHub
    ? accessHub.pdfAccess.canDownloadPdf && Boolean(hubPdfHref || hubAttemptId)
    : delivery?.can_download_pdf === true && Boolean(attemptId || deliveryPdfHref);
  const resolvedPdfHref = hubPdfHref ?? deliveryPdfHref;
  const canResendDelivery = accessHub?.recovery.canResend ?? (delivery?.can_resend === true);
  const canRequestClaimEmail = accessHub
    ? accessHub.recovery.canRequestClaimEmail && Boolean(claimRecoveryHref)
    : delivery?.can_request_claim_email === true && Boolean(claimRecoveryHref);
  const hasDeliveryInfo =
    typeof delivery?.contact_email_present === "boolean" || Boolean(deliveryLastSentAt);
  const hasDeliveryActions = canViewReport || canDownloadPdf || canResendDelivery || canRequestClaimEmail || Boolean(workspaceLiteHref);

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
          {status === "initializing" ? (
            <div className="space-y-3">
              <Alert className="border-slate-200 bg-slate-50 text-slate-700">{initializingMessage}</Alert>
            </div>
          ) : null}

          {status === "pending" ? (
            <div className="space-y-3">
              <Alert className="border-slate-200 bg-slate-50 text-slate-700">{dict.orders.pending}</Alert>

              {payType === "qr" || payType === "html" || payType === "redirect" ? (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="m-0 text-sm font-semibold text-slate-900">{dict.orders.paymentActionTitle}</p>
                  {payProvider ? (
                    <p className="m-0 text-xs text-slate-600">
                      {dict.orders.paymentProviderLabel}: {payProvider}
                    </p>
                  ) : null}

                  {payType === "qr" ? (
                    <div className="space-y-3">
                      <p className="m-0 text-sm text-slate-600">{dict.orders.qrCodeHint}</p>
                      {qrCodeDataUrl ? (
                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-3">
                          <Image
                            src={qrCodeDataUrl}
                            alt={dict.orders.qrCodeHint}
                            className="h-64 w-64"
                            width={256}
                            height={256}
                            unoptimized
                          />
                        </div>
                      ) : null}
                      {!qrCodeDataUrl && !qrCodeError ? (
                        <Alert className="border-slate-200 bg-white text-slate-700">{dict.orders.qrCodeGenerating}</Alert>
                      ) : null}
                      {qrCodeError ? (
                        <Alert>{dict.orders.qrCodeUnavailable}</Alert>
                      ) : null}
                    </div>
                  ) : null}

                  {payType === "html" || payType === "redirect" ? (
                    <div className="space-y-3">
                      <p className="m-0 text-sm text-slate-600">{dict.orders.openPaymentHint}</p>
                      <Button type="button" onClick={handleOpenPaymentPage}>
                        {dict.orders.openPaymentPage}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

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

          {recoveryMode ? (
            <div className="space-y-3">
              <Alert data-testid="order-recovery-required">
                {recoveryMode === "identity_mismatch" ? identityMismatchTitle : dict.orders.recoveryRequired}
              </Alert>
              <p className="m-0 text-sm text-slate-600">
                {recoveryMode === "identity_mismatch" ? identityMismatchHint : dict.orders.recoveryHint}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={orderLookupHref} data-testid="order-recovery-lookup-link">
                  <Button type="button">{dict.orders.openOrderLookup}</Button>
                </Link>
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
              {hasDeliveryInfo ? (
                <div
                  data-testid="order-delivery-meta"
                  className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                >
                  {typeof delivery?.contact_email_present === "boolean" ? (
                    <p className="m-0" data-testid="order-delivery-contact-email">
                      {delivery.contact_email_present
                        ? locale === "zh"
                          ? "已记录购买邮箱"
                          : "Purchase email on file"
                        : locale === "zh"
                          ? "尚未记录购买邮箱"
                          : "No purchase email on file"}
                    </p>
                  ) : null}
                  {deliveryLastSentAt ? (
                    <p className="m-0" data-testid="order-delivery-last-email-sent">
                      {locale === "zh" ? "最近发送时间" : "Last delivery email"}: {deliveryLastSentAt}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {hasDeliveryActions ? (
                <>
                  <div data-testid="order-delivery-actions" className="grid gap-2 sm:grid-cols-2">
                    {canViewReport && resolvedReportHref ? (
                      <a href={resolvedReportHref} className="inline-flex w-full">
                        <Button className="w-full" type="button" data-testid="order-view-report">
                          {dict.orders.viewReport}
                        </Button>
                      </a>
                    ) : null}
                    {canDownloadPdf ? (
                      <AttemptPdfDownloadButton
                        attemptId={hubAttemptId}
                        locale={locale}
                        label={locale === "zh" ? "下载 PDF" : "Download PDF"}
                        loadingLabel={locale === "zh" ? "正在下载 PDF..." : "Downloading PDF..."}
                        errorMessage={locale === "zh" ? "PDF 下载失败，请稍后重试。" : "Failed to download the PDF. Please try again."}
                        filenamePrefix="report"
                        pdfVariant="order_delivery_hub"
                        pdfUrl={resolvedPdfHref}
                        fallbackUrl={resolvedPdfHref}
                        className="w-full"
                        buttonClassName="w-full"
                        testId="order-download-pdf"
                      />
                    ) : null}
                    {canResendDelivery ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => void handleResendDelivery()}
                        disabled={isResendingDelivery}
                        data-testid="order-resend-delivery"
                      >
                        {isResendingDelivery
                          ? locale === "zh"
                            ? "正在重发..."
                            : "Resending..."
                          : locale === "zh"
                            ? "重发交付邮件"
                            : "Resend delivery email"}
                      </Button>
                    ) : null}
                    {canRequestClaimEmail && claimRecoveryHref ? (
                      <Link href={claimRecoveryHref} className="inline-flex w-full" data-testid="order-recover-with-email-link">
                        <Button className="w-full" type="button" variant="outline">
                          {locale === "zh" ? "用购买邮箱恢复报告" : "Recover with purchase email"}
                        </Button>
                      </Link>
                    ) : null}
                    {workspaceLiteHref ? (
                      <Link href={workspaceLiteHref} className="inline-flex w-full" data-testid="order-workspace-lite-entry">
                        <Button className="w-full" type="button" variant="outline">
                          {locale === "zh" ? "我的 MBTI 报告" : "My MBTI reports"}
                        </Button>
                      </Link>
                    ) : null}
                    <Link href={withLocale("/support")} className="inline-flex w-full">
                      <Button className="w-full" type="button" variant="secondary">
                        {dict.orders.contactSupport}
                      </Button>
                    </Link>
                  </div>
                  {deliveryFeedback ? (
                    <Alert
                      className={
                        deliveryFeedback.tone === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : undefined
                      }
                    >
                      {deliveryFeedback.message}
                    </Alert>
                  ) : null}
                </>
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

          {!recoveryMode && timedOut ? (
            <div className="space-y-3" data-testid="order-timeout-state">
              <Alert>{message}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                  {isRefreshing ? `${dict.orders.refresh}...` : dict.orders.refresh}
                </Button>
                {payType || attemptId ? (
                  <Button type="button" onClick={handleRetryPayment}>
                    {dict.orders.retryPayment}
                  </Button>
                ) : null}
                <Link href={withLocale("/support")}>
                  <Button type="button" variant="secondary">
                    {dict.orders.contactSupport}
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}

          {!recoveryMode && !timedOut && (status === "failed" || status === "canceled" || status === "refunded") ? (
            <div className="space-y-3">
              <Alert>{message}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                  {isRefreshing ? `${dict.orders.refresh}...` : dict.orders.refresh}
                </Button>
                {payType || attemptId ? (
                  <Button type="button" onClick={handleRetryPayment}>
                    {dict.orders.retryPayment}
                  </Button>
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
