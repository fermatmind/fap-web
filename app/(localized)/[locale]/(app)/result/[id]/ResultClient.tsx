"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import ClinicalReportClient from "@/components/clinical/report/ClinicalReportClient";
import { UnlockCTA } from "@/components/commerce/UnlockCTA";
import { AnimatedCounter } from "@/components/design/AnimatedCounter";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCheckoutOrOrder,
  getScaleLookup,
  getAttemptReport,
  resendOrderDelivery,
  type OfferPayload,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { buildBig5TrackingContext, trackBig5Event } from "@/lib/big5/analytics";
import { clearBig5ClientCaches, computeManifestHash } from "@/lib/big5/manifest";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";
import { trackEvent } from "@/lib/analytics";

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

function normalizeOffers(report: ReportResponse): OfferPayload[] {
  if (Array.isArray(report.offers)) {
    return report.offers.filter((item): item is OfferPayload => Boolean(item && typeof item === "object"));
  }

  if (report.offer && typeof report.offer === "object") {
    return [report.offer as OfferPayload];
  }

  return [];
}

function resolveRetryMs(retryAfterSeconds: number | undefined): number {
  const fallbackMs = 3000;
  const retryAfterValue = typeof retryAfterSeconds === "number" ? retryAfterSeconds : Number.NaN;
  if (!Number.isFinite(retryAfterValue)) return fallbackMs;

  const retryMs = Math.floor(retryAfterValue * 1000);
  if (retryMs <= 0) return fallbackMs;
  return Math.min(10000, Math.max(1000, retryMs));
}

function normalizeNormsStatus(status: unknown): "CALIBRATED" | "PROVISIONAL" | "MISSING" {
  const normalized = String(status ?? "").trim().toUpperCase();
  if (normalized === "CALIBRATED" || normalized === "PROVISIONAL" || normalized === "MISSING") {
    return normalized;
  }
  return "MISSING";
}

function normsLabel(locale: "en" | "zh", status: "CALIBRATED" | "PROVISIONAL" | "MISSING") {
  if (status === "CALIBRATED") {
    return locale === "zh" ? "基于当前人群常模" : "Calibrated to current population norms";
  }
  if (status === "PROVISIONAL") {
    return locale === "zh" ? "使用基准/临时常模" : "Using baseline/provisional norms";
  }
  return locale === "zh" ? "无法计算百分位（常模缺失）" : "Percentile unavailable (norms missing)";
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function extractPrimaryNumericScore(report: ReportResponse | null): number | null {
  if (!report || !report.report || typeof report.report !== "object") return null;
  const scores = (report.report as { scores?: unknown }).scores;
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) return null;

  for (const value of Object.values(scores as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.min(100, value));
    }
    if (value && typeof value === "object") {
      const inner = value as Record<string, unknown>;
      const candidate = inner.score ?? inner.value ?? inner.percentile;
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return Math.max(0, Math.min(100, candidate));
      }
    }
  }
  return null;
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
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [freeOnlyMode, setFreeOnlyMode] = useState(false);

  const lastLockedRef = useRef<boolean | null>(null);
  const unlockTrackedRef = useRef(false);
  const pendingUnlockStorageKey = `fm_big5_pending_unlock_v1_${attemptId}`;
  const manifestFingerprint = useBig5AttemptStore((store) => store.manifestFingerprint);
  const setManifestFingerprint = useBig5AttemptStore((store) => store.setManifestFingerprint);
  const acceptedDisclaimerVersion = useBig5AttemptStore((store) => store.disclaimerVersion);
  const acceptedDisclaimerHash = useBig5AttemptStore((store) => store.disclaimerHash);

  const offer = useMemo(() => (reportData ? firstOffer(reportData) : undefined), [reportData]);
  const offers = useMemo(() => (reportData ? normalizeOffers(reportData) : []), [reportData]);
  const reportScaleCode = String(
    reportData?.report?.scale_code ??
      ((reportData?.meta as { scale_code?: unknown } | undefined)?.scale_code ?? "")
  )
    .trim()
    .toUpperCase();
  const isClinicalScale = reportScaleCode === "SDS_20" || reportScaleCode === "CLINICAL_COMBO_68";
  const locked = Boolean(reportData?.locked);
  const variant = (reportData?.variant as string | undefined) ?? (locked ? "free" : "full");
  const sections = Array.isArray(reportData?.report?.sections) ? reportData?.report?.sections : [];
  const normsStatus = normalizeNormsStatus(reportData?.norms?.status);
  const qualityLevel = String(reportData?.quality?.level ?? "unrated");
  const ctaLabel = locale === "zh" ? "解锁完整报告" : "Unlock full report";
  const reportMeta = (reportData?.meta ?? {}) as Record<string, unknown>;
  const reportDisclaimerVersion = pickString(
    reportMeta.disclaimer_version,
    reportMeta.accepted_version,
    reportMeta.disclaimer_version_accepted,
    acceptedDisclaimerVersion
  );
  const reportDisclaimerHash = pickString(
    reportMeta.disclaimer_hash,
    reportMeta.accepted_hash,
    acceptedDisclaimerHash
  );
  const variantNormalized = String(variant).trim().toLowerCase();
  const isFreeVariant = variantNormalized === "free";

  const summary =
    reportData?.summary ??
    (reportData?.report && typeof reportData.report === "object" && "summary" in reportData.report
      ? String((reportData.report as { summary?: unknown }).summary ?? "")
      : "");
  const primaryNumericScore = useMemo(() => extractPrimaryNumericScore(reportData), [reportData]);

  const paywallDisabled = locked && (offers.length === 0 || freeOnlyMode);

  useEffect(() => {
    if (loading) {
      trackEvent("ui_report_loading_phase", {
        scale_code: "BIG5_OCEAN",
        phase: "initial_loading",
        locked: true,
        variant: "free",
        locale,
      });
      return;
    }

    if (generating) {
      trackEvent("ui_report_loading_phase", {
        scale_code: "BIG5_OCEAN",
        phase: "generating",
        locked,
        variant,
        locale,
      });
    }
  }, [generating, loading, locale, locked, variant]);

  const trackWithContext = useCallback(
    async (
      eventName:
        | "report_view_free"
        | "paywall_view"
        | "checkout_start"
        | "unlock_success"
        | "pay_success"
        | "pdf_download",
      payload: Record<string, unknown> = {}
    ) => {
      const context = await buildBig5TrackingContext({
        scaleCode: "BIG5_OCEAN",
        packVersion:
          String((reportData?.meta as { content_package_version?: unknown } | undefined)?.content_package_version ?? "") ||
          String((reportData?.meta as { dir_version?: unknown } | undefined)?.dir_version ?? "") ||
          String((reportData?.meta as { pack_id?: unknown } | undefined)?.pack_id ?? "") ||
          "BIG5_OCEAN",
        manifestHash: pickString((reportData?.meta as { manifest_hash?: unknown } | undefined)?.manifest_hash) || null,
        normsVersion:
          pickString(reportData?.norms?.norms_version) ||
          pickString((reportData?.meta as { scoring_spec_version?: unknown } | undefined)?.scoring_spec_version) ||
          "unavailable",
        qualityLevel,
        locked,
        variant,
        skuId: offer?.sku ?? null,
        packId: String((reportData?.meta as { pack_id?: unknown } | undefined)?.pack_id ?? "") || null,
        dirVersion: String((reportData?.meta as { dir_version?: unknown } | undefined)?.dir_version ?? "") || null,
        contentPackageVersion:
          String((reportData?.meta as { content_package_version?: unknown } | undefined)?.content_package_version ?? "") ||
          null,
        locale,
      });

      trackBig5Event(eventName, {
        attempt_id: attemptId,
        ...context,
        ...payload,
      });
    },
    [attemptId, locale, locked, offer?.sku, qualityLevel, reportData, variant]
  );

  useEffect(() => {
    if (isClinicalScale) return;
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
  }, [attemptId, dict.result.reportUnavailable, isClinicalScale]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const lookup = await getScaleLookup({
          slug: "big-five-personality-test",
          locale,
        });
        if (!active) return;

        const capabilities =
          lookup.capabilities && typeof lookup.capabilities === "object"
            ? lookup.capabilities
            : {};
        const rollout =
          capabilities && typeof capabilities === "object" && "rollout" in capabilities
            ? ((capabilities as { rollout?: unknown }).rollout as Record<string, unknown> | undefined)
            : undefined;
        const paywallMode = String(
          (capabilities as { paywall_mode?: unknown }).paywall_mode ??
            (rollout as { paywall_mode?: unknown } | undefined)?.paywall_mode ??
            "full"
        )
          .trim()
          .toLowerCase();
        setFreeOnlyMode(paywallMode === "free_only");
      } catch {
        // ignore lookup failure
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [isClinicalScale, locale]);

  useEffect(() => {
    if (isClinicalScale) return;
    if (!reportData) return;

    let active = true;
    const meta = (reportData.meta ?? {}) as Record<string, unknown>;

    void computeManifestHash({
      manifestHash: typeof meta.manifest_hash === "string" ? meta.manifest_hash : null,
      packId: typeof meta.pack_id === "string" ? meta.pack_id : null,
      dirVersion: typeof meta.dir_version === "string" ? meta.dir_version : null,
      contentPackageVersion:
        typeof meta.content_package_version === "string" ? meta.content_package_version : null,
    }).then((nextFingerprint) => {
      if (!active) return;
      if (manifestFingerprint && manifestFingerprint !== nextFingerprint) {
        clearBig5ClientCaches();
      }
      setManifestFingerprint(nextFingerprint);
    });

    return () => {
      active = false;
    };
  }, [isClinicalScale, manifestFingerprint, reportData, setManifestFingerprint]);

  useEffect(() => {
    if (isClinicalScale) return;
    if (!reportData || reportData.generating) return;

    let pendingUnlockOrderNo = "";
    if (typeof window !== "undefined") {
      try {
        pendingUnlockOrderNo = window.localStorage.getItem(pendingUnlockStorageKey) ?? "";
      } catch {
        pendingUnlockOrderNo = "";
      }
    }

    if (locked) {
      void trackWithContext("paywall_view", {
        offers_count: offers.length,
      });
    } else if (isFreeVariant) {
      void trackWithContext("report_view_free", {});
    }

    const shouldTrackUnlock =
      locked === false &&
      !unlockTrackedRef.current &&
      (lastLockedRef.current === true || pendingUnlockOrderNo.length > 0);

    if (shouldTrackUnlock) {
      const resolvedOrderNo = offer?.order_no ?? pendingUnlockOrderNo;
      void trackWithContext("unlock_success", {
        order_no: resolvedOrderNo,
      });
      void trackWithContext("pay_success", {
        order_no: resolvedOrderNo,
      });
      unlockTrackedRef.current = true;

      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(pendingUnlockStorageKey);
        } catch {
          // ignore storage cleanup failures
        }
      }
    }

    lastLockedRef.current = locked;
  }, [isClinicalScale, isFreeVariant, locked, offer?.order_no, offers.length, pendingUnlockStorageKey, reportData, trackWithContext]);

  const handlePay = async () => {
    if (paywallDisabled) {
      setPayError(locale === "zh" ? "当前仅开放免费报告。" : "Only free report is currently available.");
      return;
    }

    setPaying(true);
    setPayError(null);

    try {
      const idempotencyKey = `big5_checkout_${attemptId}_${offer?.sku ?? "default"}`;
      await trackWithContext("checkout_start", {
        sku_id: offer?.sku ?? "",
        price: offer?.formatted_price ?? "",
        currency: offer?.currency ?? "",
      });

      const checkout = await createCheckoutOrOrder({
        attemptId,
        sku: offer?.sku,
        orderNo: offer?.order_no,
        idempotencyKey,
      });

      if (typeof window !== "undefined") {
        try {
          const pendingOrderNo =
            (typeof checkout.order_no === "string" && checkout.order_no.length > 0 ? checkout.order_no : null) ??
            offer?.order_no ??
            "";
          window.localStorage.setItem(pendingUnlockStorageKey, pendingOrderNo);
        } catch {
          // Ignore local cache write errors.
        }
      }

      if (typeof checkout.checkout_url === "string" && checkout.checkout_url.length > 0) {
        window.location.href = checkout.checkout_url;
        return;
      }

      if (typeof checkout.order_no === "string" && checkout.order_no.length > 0) {
        try {
          window.localStorage.setItem("fm_big5_last_order_v1", checkout.order_no);
        } catch {
          // Ignore local cache write errors.
        }
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

  const handleResendEmail = async () => {
    const orderNo =
      offer?.order_no ??
      (typeof window !== "undefined" ? window.localStorage.getItem("fm_big5_last_order_v1") ?? "" : "");

    if (!orderNo) {
      setEmailNotice(locale === "zh" ? "暂无可用订单号。" : "No order number available for resend.");
      return;
    }

    try {
      const response = await resendOrderDelivery({ orderNo });
      setEmailNotice(response.message ?? (locale === "zh" ? "已发送邮件通知。" : "Delivery email has been queued."));
    } catch {
      setEmailNotice(locale === "zh" ? "发送失败，请稍后重试。" : "Failed to send email notification. Please retry.");
    }
  };

  if (loading) {
    return (
      <AnticipationSkeleton phases={dict.loading.phases} />
    );
  }

  if (error || !reportData) {
    return <Alert>{error ?? dict.result.reportUnavailable}</Alert>;
  }

  if (isClinicalScale) {
    return <ClinicalReportClient attemptId={attemptId} initialReport={reportData} />;
  }

  if (generating) {
    return (
      <div className="space-y-4">
        <Alert>{dict.orders.reportGenerating}</Alert>
        <AnticipationSkeleton phases={dict.loading.phases} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dict.result.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          {summary ? <p className="m-0">{summary}</p> : null}
          <p className="m-0 text-xs text-slate-600">{normsLabel(locale, normsStatus)}</p>
          <p className="m-0 text-xs text-slate-600">Quality: {qualityLevel}</p>
          {primaryNumericScore !== null ? (
            <p className="m-0 text-xs text-slate-600">
              {locale === "zh" ? "核心分值" : "Primary score"}:{" "}
              <AnimatedCounter value={primaryNumericScore} className="font-semibold text-[var(--fm-accent)]" />
            </p>
          ) : null}
          <p className="m-0 text-xs text-slate-500">
            {locale === "zh"
              ? "本报告仅用于自我认知，不构成医疗或心理诊断。"
              : "This report is for self-discovery and not a medical or psychological diagnosis."}
          </p>
          {reportDisclaimerVersion || reportDisclaimerHash ? (
            <p className="m-0 text-xs text-slate-500">
              {locale === "zh" ? "免责声明版本" : "Disclaimer version"}: {reportDisclaimerVersion || "-"} ·
              {locale === "zh" ? " 哈希" : " hash"}: {reportDisclaimerHash || "-"}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {offers.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {offers.map((item, idx) => (
            <OfferCard key={`${item.sku ?? "offer"}-${idx}`} offer={item} />
          ))}
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {sections.map((section, idx) => (
          <SectionRenderer key={`${section.key ?? "section"}-${idx}`} section={section} locked={locked} normsStatus={normsStatus} ctaLabel={ctaLabel} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PdfDownloadButton
          attemptId={attemptId}
          locked={locked}
          onDownloaded={() => {
            void trackWithContext("pdf_download", {
              pdf_variant: variant,
            });
          }}
        />
        <Button type="button" variant="outline" onClick={handleResendEmail}>
          {locale === "zh" ? "邮件发送报告" : "Send report email"}
        </Button>
      </div>

      {emailNotice ? <Alert>{emailNotice}</Alert> : null}

      {locked ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {!paywallDisabled ? (
            <UnlockCTA
              attemptId={attemptId}
              sku={offer?.sku}
              orderNo={offer?.order_no}
              amount={offer?.amount_cents ?? reportData?.price}
              currency={offer?.currency ?? reportData?.currency}
              formattedPrice={offer?.formatted_price}
              loading={paying}
              error={payError}
              onPay={handlePay}
            />
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              {locale === "zh"
                ? "当前仅开放免费报告，暂不支持付费解锁。"
                : "Only free report is available right now."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
