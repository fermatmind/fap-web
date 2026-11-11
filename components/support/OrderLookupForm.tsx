"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canDownloadReportPdf,
  canEnterReportPage,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";
import {
  normalizeInviteUnlockSummary,
  resolveInviteUnlockSummaryBadge,
  resolveInviteUnlockSummaryLabel,
  type InviteUnlockSummaryView,
} from "@/lib/access/inviteUnlockSummary";
import {
  captureEmailContact,
  fetchAttemptReportAccess,
  lookupOrder,
  requestClaimReportEmail,
  type AttributionUtm,
  type EmailCaptureResponse,
  type OrderLookupResponse,
  type PublicFormSummaryV1Raw,
} from "@/lib/api/v0_3";
import { buildOrderWaitPath, resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import {
  normalizeCommercePayValue,
  normalizeCommercePaymentRedirectUrl,
  normalizeCommerceReportPath,
} from "@/lib/commerce/redirectUrls";
import { writePendingOrder } from "@/lib/commerce/pendingOrder";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { extractMbtiAccessHubAttemptId, normalizeMbtiAccessHub } from "@/lib/mbti/accessHub";
import { buildPublicFormDisplayLabel, normalizePublicFormSummary } from "@/lib/mbti/formSummary";
import { captureError } from "@/lib/observability/sentry";
import type { SiteDictionary } from "@/lib/i18n/types";
import { trackEvent } from "@/lib/analytics";

const COOLDOWN_MS = 4000;

type LookupAction = "lookup" | "claim";
type LookupViewStatus = "pending" | "paid" | "failed" | "canceled" | "refunded" | null;
type LookupPayType = "qr" | "html" | "redirect" | null;

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

function formatCapturedAt(locale: DisplayLocale, capturedAt: string | null, emptyLabel: string): string {
  if (!capturedAt) {
    return emptyLabel;
  }

  const date = new Date(capturedAt);
  if (Number.isNaN(date.getTime())) {
    return capturedAt;
  }

  return new Intl.DateTimeFormat(locale === "zh-TW" ? locale : locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeLookupStatus(value: string | null | undefined): LookupViewStatus {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "pending" || normalized === "paid" || normalized === "failed" || normalized === "canceled" || normalized === "refunded") {
    return normalized;
  }
  return null;
}

function normalizePayType(value: string | null | undefined): LookupPayType {
  if (value === "qr" || value === "html" || value === "redirect") {
    return value;
  }
  return null;
}

function normalizeQueryValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveLookupWaitFlowHref(response: OrderLookupResponse, locale: Locale): string | null {
  const action = resolveCheckoutAction(response, "payment unavailable");
  if (action.kind === "error") {
    return null;
  }

  if (action.kind === "order_wait") {
    return localizedPath(buildOrderWaitPath(action), locale);
  }

  if (action.orderNo) {
    const params = new URLSearchParams({ order_no: action.orderNo });
    params.set("pay_type", "redirect");
    params.set("pay_value", action.url);
    if (action.provider) {
      params.set("provider", action.provider);
    }
    if (action.paymentRecoveryToken) {
      params.set("payment_recovery_token", action.paymentRecoveryToken);
    }

    return localizedPath(`/pay/wait?${params.toString()}`, locale);
  }

  if (action.waitUrl) {
    return localizedPath(action.waitUrl, locale);
  }

  return null;
}

export function OrderLookupForm({
  locale,
  dict,
  displayLocale = locale,
}: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  dict: SiteDictionary;
}) {
  const taiwan = displayLocale === "zh-TW";
  const copy = (zh: string, en: string, tw: string) => taiwan ? tw : locale === "zh" ? zh : en;
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
  const [lookupHit, setLookupHit] = useState<OrderLookupResponse | null>(null);
  const [lookupAccessView, setLookupAccessView] = useState<AttemptReportAccessView | null>(null);
  const [lookupAccessFormSummaryRaw, setLookupAccessFormSummaryRaw] = useState<PublicFormSummaryV1Raw | null>(null);
  const [lookupQrCodeDataUrl, setLookupQrCodeDataUrl] = useState<string | null>(null);
  const [lookupQrCodeError, setLookupQrCodeError] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const inviteSummaryTrackedRef = useRef(false);

  useEffect(() => {
    setOrderNo(queryOrderNo);
  }, [queryOrderNo]);

  useEffect(() => {
    if (defaultAction === "claim") {
      claimButtonRef.current?.focus();
    }
  }, [defaultAction]);

  const blindSuccessMessage =
    copy("我们已接受请求。订单与邮箱匹配时，报告链接会发送到你的购买邮箱。", "We’ve received the request. When the order and email match, the report link will be sent to your purchase email.", "我們已收到請求。如果訂單與電子郵件地址相符，報告連結會寄到你購買時使用的信箱。");

  const waitMessage = copy("请稍后再试。", "Please wait a moment before trying again.", "請稍後再試。");
  const lookupErrorMessage =
    copy("无法完成订单校验，请检查信息或联系客服。", "We could not verify that request. Please check details or contact support.", "無法完成訂單驗證，請檢查資訊或聯絡客服。");
  const claimErrorMessage =
    copy("暂时无法处理找回请求，请稍后再试或联系客服。", "We could not process that recovery request. Please try again later or contact support.", "暫時無法處理找回請求，請稍後再試或聯絡客服。");
  const marketingConsentLabel =
    copy("接收产品与营销更新", "Receive product and marketing updates", "接收產品與行銷更新");
  const marketingConsentHint =
    copy("勾选后可接收产品与营销更新，不影响报告恢复与交付邮件。", "Opt in to product and marketing updates. This does not affect report recovery or delivery emails.", "勾選後可接收產品與行銷更新，不影響報告找回與交付郵件。");
  const captureFoundationTitle =
    copy("当前邮件订阅状态", "Current email subscriber status", "目前的電子郵件訂閱狀態");
  const captureFoundationDescription =
    copy("仅对当前操作可见，用于说明本次邮箱捕获后的订阅与恢复状态。", "Visible only for this request to explain the subscriber and recovery state returned after capture.", "僅在本次操作中顯示，說明這個電子郵件地址的訂閱與報告找回設定。");
  const subscriberStatusLabel = copy("订阅状态", "Subscriber status", "訂閱狀態");
  const capturedAtLabel = copy("捕获时间", "Captured at", "登錄時間");
  const marketingConsentStatusLabel = copy("营销同意", "Marketing consent", "行銷同意");
  const reportRecoveryStatusLabel = copy("报告恢复邮件", "Report recovery emails", "報告找回郵件");
  const statusEnabledLabel = copy("已开启", "Enabled", "已開啟");
  const statusDisabledLabel = copy("未开启", "Disabled", "未開啟");
  const capturedAtFallback = copy("暂未返回", "Not returned yet", "尚未提供");
  const subscriberStatusLabels: Record<EmailCaptureResponse["subscriber_status"], string> = {
    active: copy("已订阅", "Active", "已訂閱"),
    unsubscribed: copy("已退订", "Unsubscribed", "已取消訂閱"),
    suppressed: copy("已暂停", "Suppressed", "已暫停"),
  };
  const formattedCapturedAt = captureState
    ? formatCapturedAt(displayLocale, captureState.captured_at, capturedAtFallback)
    : null;
  const lookupAccessHub = useMemo(
    () => normalizeMbtiAccessHub(lookupHit?.mbti_access_hub_v1 ?? null, locale),
    [lookupHit?.mbti_access_hub_v1, locale]
  );
  const lookupInviteSummary = useMemo<InviteUnlockSummaryView | null>(() => {
    if (lookupAccessHub?.inviteUnlock) {
      return lookupAccessHub.inviteUnlock;
    }

    return normalizeInviteUnlockSummary(null, {
      unlockStage: lookupAccessView?.unlockStage ?? null,
      unlockSource: lookupAccessView?.unlockSource ?? null,
    });
  }, [lookupAccessHub?.inviteUnlock, lookupAccessView?.unlockSource, lookupAccessView?.unlockStage]);
  const lookupInviteBadge = useMemo(
    () => resolveInviteUnlockSummaryBadge(lookupInviteSummary, locale),
    [lookupInviteSummary, locale]
  );
  const lookupInviteLabel = useMemo(
    () => resolveInviteUnlockSummaryLabel(lookupInviteSummary, locale),
    [lookupInviteSummary, locale]
  );
  const lookupAttemptId = useMemo(
    () =>
      extractMbtiAccessHubAttemptId(lookupHit?.mbti_access_hub_v1 ?? null)
      ?? normalizeQueryValue(typeof lookupHit?.attempt_id === "string" ? lookupHit.attempt_id : null),
    [lookupHit?.attempt_id, lookupHit?.mbti_access_hub_v1]
  );
  const lookupStatus = useMemo(
    () => normalizeLookupStatus(typeof lookupHit?.status === "string" ? lookupHit.status : null),
    [lookupHit?.status]
  );
  const lookupPayType = useMemo(
    () => normalizePayType(typeof lookupHit?.pay?.type === "string" ? lookupHit.pay.type : null),
    [lookupHit?.pay?.type]
  );
  const lookupPayProvider =
    normalizeQueryValue(typeof lookupHit?.provider === "string" ? lookupHit.provider : null)
    ?? normalizeQueryValue(typeof lookupHit?.pay?.provider === "string" ? lookupHit.pay?.provider : null);
  const lookupPayValue = useMemo(
    () =>
      normalizeCommercePayValue({
        payType: lookupPayType,
        value: typeof lookupHit?.pay?.value === "string" ? lookupHit.pay.value : null,
        provider: lookupPayProvider,
      }),
    [lookupHit?.pay?.value, lookupPayProvider, lookupPayType]
  );
  const lookupEffectivePayType = lookupPayValue ? lookupPayType : null;
  const lookupPaymentRecoveryToken = useMemo(
    () => normalizeQueryValue(typeof lookupHit?.payment_recovery_token === "string" ? lookupHit.payment_recovery_token : null),
    [lookupHit?.payment_recovery_token]
  );
  const lookupWaitFlowHref = useMemo(
    () => {
      const href = lookupHit ? resolveLookupWaitFlowHref(lookupHit, locale) : null;
      return taiwan && href ? href.replace(/^\/(?:zh|en)\/pay\/wait(?=\?|$)/u, "/zh-TW/pay/wait") : href;
    },
    [locale, lookupHit, taiwan]
  );
  const lookupOrderHref = useMemo(() => {
    const resolvedOrderNo = normalizeQueryValue(typeof lookupHit?.order_no === "string" ? lookupHit.order_no : null);
    if (!resolvedOrderNo) return null;
    if (taiwan && /^[A-Za-z0-9_-]{1,128}$/u.test(resolvedOrderNo)) return `/zh-TW/orders/${resolvedOrderNo}`;
    return localizedPath(`/orders/${resolvedOrderNo}`, locale);
  }, [locale, lookupHit?.order_no, taiwan]);
  const lookupDelivery = lookupHit?.delivery ?? null;
  const lookupFormSummary = useMemo(
    () =>
      normalizePublicFormSummary(lookupHit?.big5_form_v1 ?? lookupHit?.mbti_form_v1 ?? lookupAccessFormSummaryRaw ?? null),
    [lookupAccessFormSummaryRaw, lookupHit?.big5_form_v1, lookupHit?.mbti_form_v1]
  );
  const lookupFormLabel = useMemo(
    () => buildPublicFormDisplayLabel(lookupFormSummary, { includeScaleCode: true, locale }),
    [lookupFormSummary, locale]
  );
  const lookupReportHref = normalizeCommerceReportPath(lookupAccessView?.actions.pageHref ?? null);
  const lookupHistoryHref = lookupAccessView?.actions.historyHref ?? null;
  const lookupPdfHref = lookupAccessView?.actions.pdfHref ?? null;
  const lookupPdfAttemptId = lookupAccessView?.attemptId ?? lookupAttemptId;
  const lookupCanViewReport = canEnterReportPage(lookupAccessView);
  const lookupCanDownloadPdf = canDownloadReportPdf(lookupAccessView);
  const lookupCanRequestClaimEmail =
    lookupAccessHub?.recovery.canRequestClaimEmail
    ?? (lookupDelivery?.can_request_claim_email === true);
  const showLookupHitActions = Boolean(lookupHit);

  useEffect(() => {
    if (!showLookupHitActions) {
      inviteSummaryTrackedRef.current = false;
      return;
    }

    if (!lookupInviteSummary || inviteSummaryTrackedRef.current) {
      return;
    }

    inviteSummaryTrackedRef.current = true;
    trackEvent("invite_staged_summary_viewed", {
      scale_code: "MBTI",
      unlock_stage: lookupInviteSummary.unlockStage,
      unlock_source: lookupInviteSummary.unlockSource,
      completed_invitees: lookupInviteSummary.completedInvitees,
      required_invitees: lookupInviteSummary.requiredInvitees,
      form_code: lookupFormSummary?.formCode ?? undefined,
      entry_surface: "order_lookup",
      locale,
    });
  }, [locale, lookupFormSummary?.formCode, lookupInviteSummary, showLookupHitActions]);

  useEffect(() => {
    let active = true;

    if (!lookupAttemptId) {
      setLookupAccessView(null);
      setLookupAccessFormSummaryRaw(null);
      return () => {
        active = false;
      };
    }

    void fetchAttemptReportAccess({ attemptId: lookupAttemptId, locale })
      .then((response) => {
        if (!active) return;
        setLookupAccessView(normalizeAttemptReportAccess(response, locale));
        setLookupAccessFormSummaryRaw(response.big5_form_v1 ?? response.mbti_form_v1 ?? null);
      })
      .catch((cause) => {
        if (!active) return;
        setLookupAccessView(null);
        setLookupAccessFormSummaryRaw(null);
        captureError(cause, {
          route: "/orders/lookup",
          attemptId: lookupAttemptId,
          stage: "load_report_access",
        });
      });

    return () => {
      active = false;
    };
  }, [locale, lookupAttemptId]);

  useEffect(() => {
    let active = true;

    if (lookupEffectivePayType !== "qr" || !lookupPayValue) {
      setLookupQrCodeDataUrl(null);
      setLookupQrCodeError(false);
      return () => {
        active = false;
      };
    }

    setLookupQrCodeDataUrl(null);
    setLookupQrCodeError(false);
    void QRCode.toDataURL(lookupPayValue, {
      width: 280,
      margin: 2,
    })
      .then((dataUrl: string) => {
        if (!active) return;
        setLookupQrCodeDataUrl(dataUrl);
      })
      .catch(() => {
        if (!active) return;
        setLookupQrCodeError(true);
      });

    return () => {
      active = false;
    };
  }, [lookupEffectivePayType, lookupPayValue]);

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
    if (action === "lookup") {
      setLookupHit(null);
      setLookupAccessView(null);
      setLookupAccessFormSummaryRaw(null);
    }
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
        const response = await lookupOrder({ orderNo: trimmedOrderNo, email: trimmedEmail, locale });
        const resolvedOrderNo = response.order_no || trimmedOrderNo;

        if (!resolvedOrderNo) {
          throw new Error(copy("订单查询失败。", "Order lookup failed.", "訂單查詢失敗。"));
        }

        setLookupHit(response);
        return;
      }

      await requestClaimReportEmail({
        order_no: trimmedOrderNo,
        email: trimmedEmail,
        locale,
        ...(taiwan ? { recovery_mail_locale: "zh-TW" } as const : {}),
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

  const handleOpenLookupPaymentPage = () => {
    if ((lookupEffectivePayType !== "html" && lookupEffectivePayType !== "redirect") || !lookupPayValue) return;
    const lookupOrderNo = normalizeQueryValue(typeof lookupHit?.order_no === "string" ? lookupHit.order_no : null);

    if (lookupWaitFlowHref && lookupOrderNo) {
      writePendingOrder({
        orderNo: lookupOrderNo,
        provider: lookupPayProvider,
        waitUrl: lookupWaitFlowHref,
        paymentRecoveryToken: lookupPaymentRecoveryToken,
        resultUrl: normalizeCommerceReportPath(lookupAccessView?.actions.pageHref ?? null),
      });
      router.push(lookupWaitFlowHref);
      return;
    }

    const safePayUrl = normalizeCommercePaymentRedirectUrl(lookupPayValue, lookupPayProvider);
    if (!safePayUrl) return;
    window.open(safePayUrl, "_blank", "noopener,noreferrer");
  };

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
            <span>{copy("订单号", "Order number", "訂單編號")}</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={orderNo}
              data-testid="order-lookup-order-no"
              onChange={(event) => {
                setOrderNo(event.target.value);
                setError(null);
                setFeedback(null);
                setCaptureState(null);
                setLookupHit(null);
              }}
              required
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-700">
            <span>{copy("购买邮箱", "Purchase email", "購買時的電子郵件地址")}</span>
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
                setLookupHit(null);
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
                setLookupHit(null);
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
          {showLookupHitActions ? (
            <div
              className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-4"
              data-testid="order-lookup-hit-actions"
            >
              <div className="space-y-1">
                <p className="m-0 text-sm font-semibold text-slate-900">
                  {lookupStatus === "pending"
                    ? copy("已匹配到订单，可继续完成支付", "Order matched. Continue the payment here.", "已找到相符的訂單，可繼續付款")
                    : copy("已匹配到订单，可直接继续", "Order matched. Continue from here.", "已找到相符的訂單，可繼續操作")}
                </p>
                {lookupFormLabel ? (
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" data-testid="order-lookup-form-summary">
                    {lookupFormLabel}{taiwan ? "（原語）" : ""}
                  </p>
                ) : null}
                {lookupInviteSummary && lookupInviteBadge && lookupInviteLabel ? (
                  <div
                    className="rounded-lg border border-violet-200 bg-violet-50/70 px-3 py-2 text-sm text-violet-900"
                    data-testid="order-lookup-invite-unlock-summary"
                  >
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">{lookupInviteBadge}{taiwan ? "（原語）" : ""}</p>
                    <p className="m-0 mt-1">{lookupInviteLabel}</p>
                  </div>
                ) : null}
                <p className="m-0 text-xs leading-6 text-slate-600">
                  {lookupStatus === "pending"
                    ? copy("订单号与购买邮箱已匹配。你可以在这里继续支付，无需再次跳回受保护的订单页。", "The order number and purchase email matched. Continue the payment here without going back to the protected order page.", "訂單編號與購買時的電子郵件地址相符。你可以在這裡繼續付款，無須返回受保護的訂單頁。")
                    : copy("订单号与购买邮箱已匹配。你可以在这里继续恢复报告相关动作。", "The order number and purchase email matched. Continue the recovery actions here.", "訂單編號與購買時的電子郵件地址相符。你可以繼續找回報告。")}
                </p>
              </div>
              {lookupStatus === "pending" && (lookupEffectivePayType === "qr" || lookupEffectivePayType === "html" || lookupEffectivePayType === "redirect") ? (
                <div
                  className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
                  data-testid="order-lookup-hit-payment-action"
                >
                  <p className="m-0 text-sm font-semibold text-slate-900">{dict.orders.paymentActionTitle}</p>
                  {lookupPayProvider ? (
                    <p className="m-0 text-xs text-slate-600">
                      {dict.orders.paymentProviderLabel}: {lookupPayProvider}
                    </p>
                  ) : null}

                  {lookupEffectivePayType === "qr" ? (
                    <div className="space-y-3">
                      <p className="m-0 text-sm text-slate-600">{dict.orders.qrCodeHint}</p>
                      {lookupQrCodeDataUrl ? (
                        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-3">
                          <Image
                            src={lookupQrCodeDataUrl}
                            alt={dict.orders.qrCodeHint}
                            className="h-64 w-64"
                            width={256}
                            height={256}
                            unoptimized
                            data-testid="order-lookup-hit-qr"
                          />
                        </div>
                      ) : null}
                      {!lookupQrCodeDataUrl && !lookupQrCodeError ? (
                        <Alert className="border-slate-200 bg-white text-slate-700">
                          {dict.orders.qrCodeGenerating}
                        </Alert>
                      ) : null}
                      {lookupQrCodeError ? <Alert>{dict.orders.qrCodeUnavailable}</Alert> : null}
                    </div>
                  ) : null}

                  {lookupEffectivePayType === "html" || lookupEffectivePayType === "redirect" ? (
                    <div className="space-y-3">
                      <p className="m-0 text-sm text-slate-600">{dict.orders.openPaymentHint}</p>
                      <Button
                        type="button"
                        onClick={handleOpenLookupPaymentPage}
                        data-testid="order-lookup-hit-open-payment"
                      >
                        {taiwan && lookupWaitFlowHref ? "前往付款確認" : dict.orders.openPaymentPage}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                {lookupOrderHref ? (
                  <Link href={lookupOrderHref} className="inline-flex w-full" data-testid="order-lookup-hit-order">
                    <Button className="w-full" type="button">
                      {copy("查看订单", "View order", "查看訂單（簡體中文）")}
                    </Button>
                  </Link>
                ) : null}
                {lookupCanViewReport && lookupReportHref ? (
                  <a href={lookupReportHref} className="inline-flex w-full" data-testid="order-lookup-hit-report">
                    <Button className="w-full" type="button" variant="outline">
                      {copy("查看报告", "View report", "查看報告（原語）")}
                    </Button>
                  </a>
                ) : null}
                {lookupCanDownloadPdf ? (
                  <AttemptPdfDownloadButton
                    attemptId={lookupPdfAttemptId}
                    locale={locale}
                    label={copy("下载 PDF", "Download PDF", "下載 PDF（原語）")}
                    loadingLabel={copy("正在下载 PDF...", "Downloading PDF...", "正在下載 PDF…")}
                    errorMessage={copy("PDF 下载失败，请稍后重试。", "Failed to download the PDF. Please try again.", "PDF 下載失敗，請稍後重試。")}
                    filenamePrefix="mbti-report"
                    pdfVariant="order_lookup_recovery"
                    accessProjection={lookupAccessView}
                    pdfUrl={lookupPdfHref}
                    fallbackUrl={lookupPdfHref}
                    className="w-full"
                    buttonClassName="w-full"
                    testId="order-lookup-hit-pdf"
                  />
                ) : null}
                {lookupCanRequestClaimEmail ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    data-testid="order-lookup-hit-claim"
                    onClick={() => {
                      void runSubmit("claim");
                    }}
                    disabled={submittingAction !== null}
                  >
                    {submittingAction === "claim"
                      ? copy("发送中...", "Sending...", "正在寄送…")
                      : copy("发送找回邮件", "Email me the report link", "寄送找回郵件")}
                  </Button>
                ) : null}
                {lookupHistoryHref ? (
                  <Link href={lookupHistoryHref} className="inline-flex w-full" data-testid="order-lookup-hit-history">
                    <Button className="w-full" type="button" variant="outline">
                      {copy("我的 MBTI 报告", "My MBTI reports", "我的 MBTI 報告（原語）")}
                    </Button>
                  </Link>
                ) : null}
                <Link href={taiwan ? "/zh-TW/support" : localizedPath("/support", locale)} className="inline-flex w-full" data-testid="order-lookup-hit-support">
                  <Button className="w-full" type="button" variant="secondary">
                    {dict.orders.contactSupport}
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}

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
                ? copy("查询中...", "Checking...", "正在查詢…")
                : copy("查询订单", "Find order", "查詢訂單")}
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
                ? copy("发送中...", "Sending...", "正在寄送…")
                : copy("发送报告找回邮件", "Email me the report link", "寄送報告找回郵件")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
