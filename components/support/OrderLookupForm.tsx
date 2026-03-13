"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  captureEmailContact,
  lookupOrder,
  requestClaimReportEmail,
  type AttributionUtm,
  type EmailCaptureResponse,
} from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";
import type { SiteDictionary } from "@/lib/i18n/types";

const COOLDOWN_MS = 4000;

type LookupAction = "lookup" | "claim";

function buildLandingPath(pathname: string | null, queryString: string): string | undefined {
  if (!pathname) {
    return undefined;
  }

  return queryString ? `${pathname}?${queryString}` : pathname;
}

function readNormalizedUtm(searchParams: URLSearchParams): AttributionUtm | undefined {
  const source = searchParams.get("utm_source")?.trim() || undefined;
  const medium = searchParams.get("utm_medium")?.trim() || undefined;
  const campaign = searchParams.get("utm_campaign")?.trim() || undefined;
  const term = searchParams.get("utm_term")?.trim() || undefined;
  const content = searchParams.get("utm_content")?.trim() || undefined;

  if (!source && !medium && !campaign && !term && !content) {
    return undefined;
  }

  return {
    source: source ?? null,
    medium: medium ?? null,
    campaign: campaign ?? null,
    term: term ?? null,
    content: content ?? null,
  };
}

function formatCapturedAt(locale: Locale, capturedAt: string | null, emptyLabel: string): string {
  if (!capturedAt) {
    return emptyLabel;
  }

  const date = new Date(capturedAt);
  if (Number.isNaN(date.getTime())) {
    return capturedAt;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function OrderLookupForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: SiteDictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const claimButtonRef = useRef<HTMLButtonElement | null>(null);
  const queryString = searchParams.toString();
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const landingPath = useMemo(() => buildLandingPath(pathname, queryString), [pathname, queryString]);
  const utm = useMemo(() => readNormalizedUtm(query), [query]);
  const queryOrderNo = query.get("orderNo")?.trim() || "";
  const defaultAction: LookupAction = query.get("mode")?.trim() === "claim" ? "claim" : "lookup";
  const pageReferrer = typeof document === "undefined" ? undefined : document.referrer || undefined;
  const shareId = query.get("share_id")?.trim() || undefined;
  const compareInviteId = query.get("compare_invite_id")?.trim() || undefined;
  const attemptId = query.get("attempt_id")?.trim() || undefined;
  const [orderNo, setOrderNo] = useState(queryOrderNo);
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<LookupAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [captureState, setCaptureState] = useState<EmailCaptureResponse | null>(null);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);

  useEffect(() => {
    setOrderNo(queryOrderNo);
  }, [queryOrderNo]);

  useEffect(() => {
    if (defaultAction === "claim") {
      claimButtonRef.current?.focus();
    }
  }, [defaultAction]);

  const blindSuccessMessage =
    locale === "zh"
      ? "我们已接受请求。订单与邮箱匹配时，报告链接会发送到你的购买邮箱。"
      : "We’ve received the request. When the order matches, the report link will be sent to the purchase email.";

  const waitMessage = locale === "zh" ? "请稍后再试。" : "Please wait a moment before trying again.";
  const lookupErrorMessage =
    locale === "zh"
      ? "无法完成订单校验，请检查信息或联系客服。"
      : "We could not verify that request. Please check details or contact support.";
  const claimErrorMessage =
    locale === "zh"
      ? "暂时无法处理找回请求，请稍后再试或联系客服。"
      : "We could not process that recovery request. Please try again later or contact support.";
  const marketingConsentLabel =
    locale === "zh" ? "接收产品与营销更新" : "Receive product and marketing updates";
  const marketingConsentHint =
    locale === "zh"
      ? "勾选后可接收产品与营销更新，不影响报告恢复与交付邮件。"
      : "Opt in to product and marketing updates. This does not affect report recovery or delivery emails.";
  const captureFoundationTitle =
    locale === "zh" ? "当前邮件订阅状态" : "Current email subscriber status";
  const captureFoundationDescription =
    locale === "zh"
      ? "仅对当前操作可见，用于说明本次邮箱捕获后的订阅与恢复状态。"
      : "Visible only for this request to explain the subscriber and recovery state returned after capture.";
  const subscriberStatusLabel = locale === "zh" ? "订阅状态" : "Subscriber status";
  const capturedAtLabel = locale === "zh" ? "捕获时间" : "Captured at";
  const marketingConsentStatusLabel = locale === "zh" ? "营销同意" : "Marketing consent";
  const reportRecoveryStatusLabel = locale === "zh" ? "报告恢复邮件" : "Report recovery emails";
  const statusEnabledLabel = locale === "zh" ? "已开启" : "Enabled";
  const statusDisabledLabel = locale === "zh" ? "未开启" : "Disabled";
  const capturedAtFallback = locale === "zh" ? "暂未返回" : "Not returned yet";
  const subscriberStatusLabels: Record<EmailCaptureResponse["subscriber_status"], string> = {
    active: locale === "zh" ? "已订阅" : "Active",
    unsubscribed: locale === "zh" ? "已退订" : "Unsubscribed",
    suppressed: locale === "zh" ? "已暂停" : "Suppressed",
  };
  const formattedCapturedAt = captureState
    ? formatCapturedAt(locale, captureState.captured_at, capturedAtFallback)
    : null;

  async function captureLookupContact({
    trimmedEmail,
    trimmedOrderNo,
    stage,
    marketingConsentValue,
  }: {
    trimmedEmail: string;
    trimmedOrderNo: string;
    stage: string;
    marketingConsentValue: boolean;
  }): Promise<EmailCaptureResponse | null> {
    try {
      return await captureEmailContact({
        email: trimmedEmail,
        locale,
        surface: "lookup",
        order_no: trimmedOrderNo,
        attempt_id: attemptId,
        share_id: shareId,
        compare_invite_id: compareInviteId,
        entrypoint: "order_lookup",
        referrer: pageReferrer,
        landing_path: landingPath,
        utm,
        marketing_consent: marketingConsentValue,
      });
    } catch (cause) {
      captureError(cause, {
        route: "/orders/lookup",
        orderNo: trimmedOrderNo,
        stage,
      });
      return null;
    }
  }

  async function runSubmit(action: LookupAction) {
    const now = Date.now();
    if (now - lastSubmitAt < COOLDOWN_MS) {
      setError(waitMessage);
      setFeedback(null);
      return;
    }

    const trimmedOrderNo = orderNo.trim();
    const trimmedEmail = email.trim();

    setSubmittingAction(action);
    setError(null);
    setFeedback(null);
    setCaptureState(null);
    setLastSubmitAt(now);

    try {
      const captureResponse = await captureLookupContact({
        trimmedEmail,
        trimmedOrderNo,
        stage: action === "lookup" ? "capture_email_before_lookup" : "capture_email_before_claim",
        marketingConsentValue: marketingConsent,
      });
      if (captureResponse) {
        setCaptureState(captureResponse);
      }

      if (action === "lookup") {
        const response = await lookupOrder({ orderNo: trimmedOrderNo, email: trimmedEmail });
        const resolvedOrderNo = response.order_no || trimmedOrderNo;

        if (!resolvedOrderNo) {
          throw new Error(locale === "zh" ? "订单查询失败。" : "Order lookup failed.");
        }

        router.push(localizedPath(`/orders/${resolvedOrderNo}`, locale));
        return;
      }

      await requestClaimReportEmail({
        order_no: trimmedOrderNo,
        email: trimmedEmail,
        locale,
        surface: "lookup",
        entrypoint: "order_lookup",
        referrer: pageReferrer,
        landing_path: landingPath,
        utm,
        share_id: shareId,
        compare_invite_id: compareInviteId,
      });

      setFeedback({
        tone: "success",
        message: blindSuccessMessage,
      });
    } catch (cause) {
      const nextError = action === "lookup" ? lookupErrorMessage : claimErrorMessage;
      setError(nextError);
      captureError(cause, {
        route: "/orders/lookup",
        orderNo: trimmedOrderNo,
        stage: action === "lookup" ? "lookup_order" : "request_claim_report_email",
      });
    } finally {
      setSubmittingAction(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.support.lookup}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void runSubmit(defaultAction);
          }}
        >
          <label className="block space-y-1 text-sm text-slate-700">
            <span>{locale === "zh" ? "订单号" : "Order number"}</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={orderNo}
              data-testid="order-lookup-order-no"
              onChange={(event) => {
                setOrderNo(event.target.value);
                setError(null);
                setFeedback(null);
                setCaptureState(null);
              }}
              required
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-700">
            <span>{locale === "zh" ? "购买邮箱" : "Purchase email"}</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={email}
              type="email"
              data-testid="order-lookup-email"
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
                setFeedback(null);
                setCaptureState(null);
              }}
              required
            />
          </label>

          <label
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
            data-testid="order-lookup-marketing-consent-consumer"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={marketingConsent}
              data-testid="order-lookup-marketing-consent"
              onChange={(event) => {
                setMarketingConsent(event.target.checked);
                setError(null);
                setFeedback(null);
                setCaptureState(null);
              }}
            />
            <span className="space-y-1">
              <span className="block font-medium text-slate-900">{marketingConsentLabel}</span>
              <span className="block text-slate-600">{marketingConsentHint}</span>
            </span>
          </label>

          {captureState ? (
            <div
              className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              data-testid="order-lookup-capture-foundation"
            >
              <div className="space-y-1">
                <p className="m-0 text-sm font-semibold text-slate-900">{captureFoundationTitle}</p>
                <p className="m-0 text-xs text-slate-600">{captureFoundationDescription}</p>
              </div>
              <dl className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <dt>{subscriberStatusLabel}</dt>
                  <dd className="font-medium text-slate-900" data-testid="order-lookup-capture-subscriber-status">
                    {subscriberStatusLabels[captureState.subscriber_status]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{capturedAtLabel}</dt>
                  <dd className="font-medium text-slate-900">
                    <time
                      data-testid="order-lookup-capture-captured-at"
                      dateTime={captureState.captured_at ?? ""}
                    >
                      {formattedCapturedAt}
                    </time>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{marketingConsentStatusLabel}</dt>
                  <dd className="font-medium text-slate-900" data-testid="order-lookup-capture-marketing-consent">
                    {captureState.marketing_consent ? statusEnabledLabel : statusDisabledLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{reportRecoveryStatusLabel}</dt>
                  <dd className="font-medium text-slate-900" data-testid="order-lookup-capture-report-recovery">
                    {captureState.transactional_recovery_enabled ? statusEnabledLabel : statusDisabledLabel}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {feedback ? (
            <Alert
              data-testid="order-lookup-feedback"
              className={feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : undefined}
            >
              {feedback.message}
            </Alert>
          ) : null}
          {error ? <Alert data-testid="order-lookup-error">{error}</Alert> : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type={defaultAction === "lookup" ? "submit" : "button"}
              disabled={submittingAction !== null}
              variant={defaultAction === "lookup" ? "default" : "outline"}
              data-testid="order-lookup-submit"
              data-priority={defaultAction === "lookup" ? "primary" : "secondary"}
              onClick={
                defaultAction === "lookup"
                  ? undefined
                  : () => {
                      void runSubmit("lookup");
                    }
              }
            >
              {submittingAction === "lookup"
                ? locale === "zh"
                  ? "查询中..."
                  : "Checking..."
                : locale === "zh"
                  ? "查询订单"
                  : "Find order"}
            </Button>

            <Button
              ref={claimButtonRef}
              type={defaultAction === "claim" ? "submit" : "button"}
              disabled={submittingAction !== null}
              variant={defaultAction === "claim" ? "default" : "outline"}
              data-testid="order-claim-submit"
              data-priority={defaultAction === "claim" ? "primary" : "secondary"}
              onClick={
                defaultAction === "claim"
                  ? undefined
                  : () => {
                      void runSubmit("claim");
                    }
              }
            >
              {submittingAction === "claim"
                ? locale === "zh"
                  ? "发送中..."
                  : "Sending..."
                : locale === "zh"
                  ? "发送报告找回邮件"
                  : "Email me the report link"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
