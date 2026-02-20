"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UnlockCTA } from "@/components/commerce/UnlockCTA";
import { DimensionBars } from "@/components/result/DimensionBars";
import { ResultSummary } from "@/components/result/ResultSummary";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createCheckoutOrOrder,
  getAttemptReport,
  type OfferPayload,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/observability/sentry";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

function firstOffer(report: ReportResponse): OfferPayload | undefined {
  if (report.offer && typeof report.offer === "object") return report.offer;

  if (Array.isArray(report.offers) && report.offers.length > 0) {
    const candidate = report.offers[0];
    if (candidate && typeof candidate === "object") return candidate;
  }

  if (report.offers && typeof report.offers === "object") {
    const values = Object.values(report.offers);
    const candidate = values[0];
    if (candidate && typeof candidate === "object") {
      return candidate as OfferPayload;
    }
  }

  return undefined;
}

function resolveRetryMs(retryAfterSeconds: number | undefined): number {
  const fallbackMs = 3000;
  const retryAfterValue = typeof retryAfterSeconds === "number" ? retryAfterSeconds : Number.NaN;
  if (!Number.isFinite(retryAfterValue)) return fallbackMs;

  const retryMs = Math.floor(retryAfterValue * 1000);
  if (retryMs <= 0) return fallbackMs;
  return Math.min(10000, Math.max(1000, retryMs));
}

export default function ResultClient({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let retryTimer: number | null = null;

    const run = async (isRetry = false) => {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getAttemptReport({ attemptId });
        if (!active) return;
        setReportData(response);

        if (response.generating) {
          setGenerating(true);
          const retryMs = resolveRetryMs(response.retry_after);
          retryTimer = window.setTimeout(() => {
            void run(true);
          }, retryMs);
          return;
        }

        setGenerating(false);
        const masked = `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`;
        trackEvent("view_result", {
          attemptIdMasked: masked,
          locked: Boolean(response.locked),
          typeCode:
            response.type_code ??
            (response.report &&
            typeof response.report === "object" &&
            "type_code" in response.report
              ? String((response.report as { type_code?: unknown }).type_code ?? "")
              : ""),
        });

        if (response.locked) {
          trackEvent("view_paywall", {
            attemptIdMasked: masked,
            locked: true,
            sku: firstOffer(response)?.sku ?? "",
            priceShown: firstOffer(response)?.formatted_price ?? "",
          });
        }
      } catch (cause) {
        if (!active) return;
        setGenerating(false);
        const message = cause instanceof Error ? cause.message : dict.result.reportUnavailable;
        setError(message);
        captureError(cause, {
          route: "/result/[id]",
          attemptId,
          stage: "load_report",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [attemptId, dict]);

  const offer = useMemo(() => (reportData ? firstOffer(reportData) : undefined), [reportData]);
  const locked = Boolean(reportData?.locked);

  const summary = reportData?.summary ??
    (reportData?.report && typeof reportData.report === "object" && "summary" in reportData.report
      ? String((reportData.report as { summary?: unknown }).summary ?? "")
      : undefined);

  const typeCode = reportData?.type_code ??
    (reportData?.report && typeof reportData.report === "object" && "type_code" in reportData.report
      ? String((reportData.report as { type_code?: unknown }).type_code ?? "")
      : undefined);

  const dimensions = Array.isArray(reportData?.dimensions)
    ? reportData?.dimensions
    : reportData?.report &&
          typeof reportData.report === "object" &&
          Array.isArray((reportData.report as { dimensions?: unknown }).dimensions)
      ? ((reportData.report as { dimensions?: Array<Record<string, unknown>> }).dimensions ?? [])
      : [];

  const price = offer?.amount_cents ?? reportData?.price;
  const currency = offer?.currency ?? reportData?.currency;
  const formattedPrice = offer?.formatted_price;

  useEffect(() => {
    if (!locked || generating) return;

    const timer = window.setTimeout(() => {
      trackEvent("abandoned_paywall", {
        attemptIdMasked: `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`,
        locked: true,
        stayMs: 15000,
      });
    }, 15000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [attemptId, generating, locked]);

  const handlePay = async () => {
    setPaying(true);
    setPayError(null);

    try {
      trackEvent("click_unlock", {
        attemptIdMasked: `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`,
        sku: offer?.sku ?? "",
        priceShown: formattedPrice ?? "",
      });

      const checkout = await createCheckoutOrOrder({
        attemptId,
        sku: offer?.sku,
        orderNo: offer?.order_no,
      });

      if (typeof checkout.checkout_url === "string" && checkout.checkout_url.length > 0) {
        window.location.href = checkout.checkout_url;
        return;
      }

      if (typeof checkout.order_no === "string" && checkout.order_no.length > 0) {
        trackEvent("create_order", {
          attemptIdMasked: `${attemptId.slice(0, 6)}...${attemptId.slice(-4)}`,
          orderNoMasked: `${checkout.order_no.slice(0, 6)}...${checkout.order_no.slice(-4)}`,
          sku: offer?.sku ?? "",
        });
        router.push(withLocale(`/orders/${checkout.order_no}`));
        return;
      }

      throw new Error(dict.result.paymentUnavailable);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : dict.result.paymentUnavailable;
      setPayError(message);
      captureError(cause, {
        route: "/result/[id]",
        attemptId,
        stage: "create_checkout",
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <Alert>
        {error ?? dict.result.reportUnavailable}
      </Alert>
    );
  }

  if (generating) {
    return (
      <div className="space-y-4">
        <Alert>{dict.orders.reportGenerating}</Alert>
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResultSummary typeCode={typeCode} summary={summary} />

      <div className="relative rounded-2xl">
        <div className={locked ? "pointer-events-none select-none opacity-45" : ""}>
          <div className="space-y-4">
            <DimensionBars dimensions={dimensions} />

            <Card>
              <CardHeader>
                <CardTitle>{dict.result.interpretation}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p className="m-0">
                  {summary ?? dict.result.summaryPending}
                </p>
                <Separator />
                <pre className="max-h-80 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  {JSON.stringify(reportData.report ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {locked ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-50/60 p-4 backdrop-blur-md">
            <UnlockCTA
              className="pointer-events-auto"
              attemptId={attemptId}
              sku={offer?.sku}
              orderNo={offer?.order_no}
              amount={price}
              currency={currency}
              formattedPrice={formattedPrice}
              loading={paying}
              error={payError}
              onPay={handlePay}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
