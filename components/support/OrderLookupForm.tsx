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
  const [submittingAction, setSubmittingAction] = useState<LookupAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
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

  async function captureLookupContact({
    trimmedEmail,
    trimmedOrderNo,
    stage,
  }: {
    trimmedEmail: string;
    trimmedOrderNo: string;
    stage: string;
  }) {
    try {
      await captureEmailContact({
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
        marketing_consent: false,
      });
    } catch (cause) {
      captureError(cause, {
        route: "/orders/lookup",
        orderNo: trimmedOrderNo,
        stage,
      });
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
    setLastSubmitAt(now);

    try {
      await captureLookupContact({
        trimmedEmail,
        trimmedOrderNo,
        stage: action === "lookup" ? "capture_email_before_lookup" : "capture_email_before_claim",
      });

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
              }}
              required
            />
          </label>

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
