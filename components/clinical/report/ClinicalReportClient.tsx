"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { CrisisOverlay } from "@/components/clinical/report/CrisisOverlay";
import { ReportSectionRenderer } from "@/components/clinical/report/ReportSectionRenderer";
import { UnlockCTA } from "@/components/commerce/UnlockCTA";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createCheckoutOrOrder,
  type Big5ReportSection,
  type OfferPayload,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
import { fetchClinicalReport } from "@/lib/clinical/api";
import { mapClinicalError } from "@/lib/clinical/errors";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";

const SDS_SECTION_KEYS = [
  "disclaimer_top",
  "crisis_banner",
  "result_summary_free",
  "paid_deep_dive",
] as const;

const CC68_SECTION_KEYS = [
  "disclaimer_top",
  "crisis_banner",
  "quick_overview",
  "symptoms_depression",
  "symptoms_anxiety",
  "symptoms_ocd",
  "stress_resilience",
  "perfectionism_overview",
  "paid_deep_dive",
  "action_plan",
  "resources_footer",
  "scoring_notes",
] as const;

const GENERATING_POLL_INTERVAL_MS = 3000;
const GENERATING_POLL_MAX = 10;
const UNLOCK_POLL_INTERVAL_MS = 3000;
const UNLOCK_POLL_MAX = 10;
const SUBMIT_REPORT_CACHE_PREFIX = "fm_attempt_submit_report_v1_";
const PENDING_UNLOCK_CACHE_PREFIX = "fm_clinical_pending_unlock_v1_";

type ClinicalScaleCode = "SDS_20" | "CLINICAL_COMBO_68";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeSectionKey(section: Big5ReportSection): string {
  return typeof section.key === "string" ? section.key.trim() : "";
}

function normalizeSections(report: ReportResponse | null): Big5ReportSection[] {
  if (!Array.isArray(report?.report?.sections)) return [];
  return report?.report?.sections.filter((item): item is Big5ReportSection => Boolean(item && typeof item === "object"));
}

function normalizeOffers(report: ReportResponse | null): OfferPayload[] {
  if (!report) return [];

  if (Array.isArray(report.offers)) {
    return report.offers.filter((item): item is OfferPayload => Boolean(item && typeof item === "object"));
  }

  if (report.offers && typeof report.offers === "object") {
    return Object.values(report.offers).filter((item): item is OfferPayload => Boolean(item && typeof item === "object"));
  }

  if (report.offer && typeof report.offer === "object") {
    return [report.offer as OfferPayload];
  }

  return [];
}

function resolveClinicalScaleCode(report: ReportResponse | null): ClinicalScaleCode | null {
  const reportScaleCode =
    typeof report?.report?.scale_code === "string"
      ? report.report.scale_code.trim().toUpperCase()
      : "";

  if (reportScaleCode === "SDS_20" || reportScaleCode === "CLINICAL_COMBO_68") {
    return reportScaleCode;
  }

  const metaScaleCode =
    report?.meta && typeof report.meta === "object" && typeof report.meta.scale_code === "string"
      ? report.meta.scale_code.trim().toUpperCase()
      : "";

  if (metaScaleCode === "SDS_20" || metaScaleCode === "CLINICAL_COMBO_68") {
    return metaScaleCode;
  }

  return null;
}

function resolveGenerating(report: ReportResponse | null): boolean {
  if (!report) return false;

  if (report.meta && typeof report.meta === "object" && typeof report.meta.generating === "boolean") {
    return report.meta.generating;
  }

  return Boolean(report.generating);
}

function resolveSnapshotError(report: ReportResponse | null): boolean {
  if (!report) return false;

  if (report.meta && typeof report.meta === "object" && typeof report.meta.snapshot_error === "boolean") {
    return report.meta.snapshot_error;
  }

  return Boolean((report as Record<string, unknown>).snapshot_error);
}

function resolveRetryAfterSeconds(report: ReportResponse | null): number | null {
  if (!report) return null;

  if (
    report.meta
    && typeof report.meta === "object"
    && typeof report.meta.retry_after_seconds === "number"
    && Number.isFinite(report.meta.retry_after_seconds)
  ) {
    return report.meta.retry_after_seconds;
  }

  if (typeof report.retry_after_seconds === "number" && Number.isFinite(report.retry_after_seconds)) {
    return report.retry_after_seconds;
  }

  if (typeof report.retry_after === "number" && Number.isFinite(report.retry_after)) {
    return report.retry_after;
  }

  return null;
}

function readCachedSubmitReport(attemptId: string): ReportResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(`${SUBMIT_REPORT_CACHE_PREFIX}${attemptId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed as ReportResponse;
  } catch {
    return null;
  }
}

function filterSdsSections({
  sections,
  locked,
  crisisAlert,
  locale,
}: {
  sections: Big5ReportSection[];
  locked: boolean;
  crisisAlert: boolean;
  locale: "en" | "zh";
}): Big5ReportSection[] {
  const whitelist = new Set<string>(SDS_SECTION_KEYS);
  let filtered = sections.filter((section) => whitelist.has(normalizeSectionKey(section)));

  if (locked || crisisAlert) {
    filtered = filtered.filter((section) => normalizeSectionKey(section) !== "paid_deep_dive");
  }

  if (crisisAlert && !filtered.some((section) => normalizeSectionKey(section) === "crisis_banner")) {
    const syntheticBanner: Big5ReportSection = {
      key: "crisis_banner",
      title: locale === "zh" ? "危机提示" : "Crisis Alert",
      access_level: "free",
      blocks: [],
    };

    const disclaimerIndex = filtered.findIndex((section) => normalizeSectionKey(section) === "disclaimer_top");
    const insertAt = disclaimerIndex >= 0 ? disclaimerIndex + 1 : 0;
    filtered = [...filtered.slice(0, insertAt), syntheticBanner, ...filtered.slice(insertAt)];
  }

  return filtered;
}

function reorderCrisisSecond(sections: Big5ReportSection[]): Big5ReportSection[] {
  const crisisSection = sections.find((section) => normalizeSectionKey(section) === "crisis_banner");
  if (!crisisSection) return sections;

  const withoutCrisis = sections.filter((section) => section !== crisisSection);
  if (withoutCrisis.length === 0) return [crisisSection];

  const disclaimer = withoutCrisis.find((section) => normalizeSectionKey(section) === "disclaimer_top");
  if (disclaimer) {
    const remaining = withoutCrisis.filter((section) => section !== disclaimer);
    return [disclaimer, crisisSection, ...remaining];
  }

  return [withoutCrisis[0], crisisSection, ...withoutCrisis.slice(1)];
}

function filterCc68Sections({
  sections,
  crisisAlert,
  locale,
}: {
  sections: Big5ReportSection[];
  crisisAlert: boolean;
  locale: "en" | "zh";
}): Big5ReportSection[] {
  const whitelist = new Set<string>(CC68_SECTION_KEYS);
  let filtered = sections.filter((section) => whitelist.has(normalizeSectionKey(section)));

  if (crisisAlert) {
    filtered = filtered.filter((section) => {
      const key = normalizeSectionKey(section);
      return key !== "paid_deep_dive" && key !== "action_plan";
    });

    if (!filtered.some((section) => normalizeSectionKey(section) === "crisis_banner")) {
      filtered = [
        ...filtered,
        {
          key: "crisis_banner",
          title: locale === "zh" ? "危机提示" : "Crisis Alert",
          access_level: "free",
          blocks: [],
        },
      ];
    }

    filtered = reorderCrisisSecond(filtered);
  }

  return filtered;
}

function formatOfferPrice(offer?: OfferPayload): string | undefined {
  if (!offer) return undefined;

  if (typeof offer.formatted_price === "string" && offer.formatted_price.trim().length > 0) {
    return offer.formatted_price;
  }

  const priceCents =
    typeof offer.amount_cents === "number"
      ? offer.amount_cents
      : typeof (offer as Record<string, unknown>).price_cents === "number"
        ? ((offer as Record<string, unknown>).price_cents as number)
        : null;

  if (typeof priceCents === "number" && Number.isFinite(priceCents)) {
    const amount = (priceCents / 100).toFixed(2);
    const currency = typeof offer.currency === "string" ? offer.currency : "";
    return `${amount} ${currency}`.trim();
  }

  return undefined;
}

function resolveCrisisResources(report: ReportResponse | null, sections: Big5ReportSection[]) {
  const crisisSection = sections.find((section) => normalizeSectionKey(section) === "crisis_banner");
  if (crisisSection && Array.isArray(crisisSection.resources)) {
    return crisisSection.resources.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
  }

  const meta = report?.meta;
  if (meta && typeof meta === "object") {
    const metaResourcesNode = (meta as Record<string, unknown>).crisis_resources;
    if (metaResourcesNode && typeof metaResourcesNode === "object") {
      const resources = (metaResourcesNode as Record<string, unknown>).resources;
      if (Array.isArray(resources)) {
        return resources.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
      }
    }
  }

  return [];
}

function resolveCrisisReasons(sections: Big5ReportSection[]): string[] {
  const crisisSection = sections.find((section) => normalizeSectionKey(section) === "crisis_banner");
  if (!crisisSection || !Array.isArray(crisisSection.reasons)) return [];

  return crisisSection.reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export default function ClinicalReportClient({
  attemptId,
  initialReport,
}: {
  attemptId: string;
  initialReport?: ReportResponse | null;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const router = useRouter();
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const isZh = locale === "zh";

  const [reportData, setReportData] = useState<ReportResponse | null>(initialReport ?? null);
  const [loading, setLoading] = useState(!initialReport);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unlockPolling, setUnlockPolling] = useState(false);

  const reportViewSignatureRef = useRef("");
  const previousLockedRef = useRef<boolean | null>(null);

  const pendingUnlockStorageKey = `${PENDING_UNLOCK_CACHE_PREFIX}${attemptId}`;
  const scaleCode = useMemo(() => resolveClinicalScaleCode(reportData), [reportData]);
  const locked = Boolean(reportData?.locked);
  const variant = String(reportData?.variant ?? (locked ? "free" : "full"));
  const qualityLevel = String(reportData?.quality?.level ?? "unrated");
  const crisisAlert = reportData?.quality?.crisis_alert === true;
  const generating = resolveGenerating(reportData);
  const snapshotError = resolveSnapshotError(reportData);
  const retryAfterSeconds = resolveRetryAfterSeconds(reportData);

  const offers = useMemo(() => normalizeOffers(reportData), [reportData]);
  const firstOffer = offers[0];
  const rawSections = useMemo(() => normalizeSections(reportData), [reportData]);

  const sections = useMemo(() => {
    if (!scaleCode) return [];
    if (scaleCode === "SDS_20") {
      return filterSdsSections({
        sections: rawSections,
        locked,
        crisisAlert,
        locale,
      });
    }

    return filterCc68Sections({
      sections: rawSections,
      crisisAlert,
      locale,
    });
  }, [crisisAlert, locale, locked, rawSections, scaleCode]);

  const hasCrisisSection = useMemo(
    () => sections.some((section) => normalizeSectionKey(section) === "crisis_banner"),
    [sections]
  );

  const crisisResources = useMemo(() => resolveCrisisResources(reportData, sections), [reportData, sections]);
  const crisisReasons = useMemo(() => resolveCrisisReasons(sections), [sections]);

  const showPaywall = locked && offers.length > 0 && !crisisAlert;
  const showOffers = offers.length > 0 && !crisisAlert;

  const loadReport = useCallback(
    async ({ refresh = false }: { refresh?: boolean } = {}) => {
      let latest = await fetchClinicalReport({
        attemptId,
        refresh,
      });
      setReportData(latest);

      let polls = 0;
      while (resolveGenerating(latest) && polls < GENERATING_POLL_MAX) {
        polls += 1;
        await sleep(GENERATING_POLL_INTERVAL_MS);
        latest = await fetchClinicalReport({
          attemptId,
          refresh: true,
        });
        setReportData(latest);
      }

      return latest;
    },
    [attemptId]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!initialReport) {
        const cachedReport = readCachedSubmitReport(attemptId);
        if (cachedReport && active) {
          setReportData(cachedReport);
          setLoading(false);
        }
      }

      setError(null);
      try {
        await loadReport();
      } catch (cause) {
        if (!active) return;
        const mapped = mapClinicalError(cause);
        setError(mapped.message);
        captureError(cause, {
          route: "/attempts/[attemptId]/report",
          attemptId,
          stage: "load_report",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [attemptId, initialReport, loadReport]);

  useEffect(() => {
    if (!reportData || !scaleCode) return;

    const payload = {
      scale_code: scaleCode,
      locked,
      variant,
      quality_level: qualityLevel,
      crisis_alert: crisisAlert,
      locale,
    };

    const eventName = showPaywall ? "clinical_paywall_view" : "clinical_report_view";
    const signature = `${eventName}:${scaleCode}:${locked ? "1" : "0"}:${variant}:${qualityLevel}:${crisisAlert ? "1" : "0"}:${locale}`;

    if (reportViewSignatureRef.current === signature) return;

    reportViewSignatureRef.current = signature;
    trackEvent(eventName, payload);
  }, [crisisAlert, locale, locked, qualityLevel, reportData, scaleCode, showPaywall, variant]);

  useEffect(() => {
    if (!reportData || !scaleCode) return;

    const shouldTrackUnlock = previousLockedRef.current === true && locked === false;
    if (shouldTrackUnlock) {
      trackEvent("clinical_unlock_success", {
        scale_code: scaleCode,
        locked,
        variant,
        quality_level: qualityLevel,
        crisis_alert: crisisAlert,
        locale,
      });

      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(pendingUnlockStorageKey);
        } catch {
          // ignore storage failures
        }
      }
    }

    previousLockedRef.current = locked;
  }, [crisisAlert, locale, locked, pendingUnlockStorageKey, qualityLevel, reportData, scaleCode, variant]);

  useEffect(() => {
    if (!reportData || !scaleCode || !locked) return;
    if (typeof window === "undefined") return;

    const pendingOrderNo = window.localStorage.getItem(pendingUnlockStorageKey) ?? "";
    if (!pendingOrderNo) return;

    let active = true;

    const run = async () => {
      setUnlockPolling(true);
      try {
        for (let attempt = 0; attempt < UNLOCK_POLL_MAX; attempt += 1) {
          if (!active) return;

          await sleep(UNLOCK_POLL_INTERVAL_MS);
          const next = await fetchClinicalReport({
            attemptId,
            refresh: true,
          });
          if (!active) return;

          setReportData(next);
          if (next.locked === false) {
            try {
              window.localStorage.removeItem(pendingUnlockStorageKey);
            } catch {
              // ignore storage failures
            }
            break;
          }
        }
      } catch (cause) {
        if (!active) return;
        captureError(cause, {
          route: "/attempts/[attemptId]/report",
          attemptId,
          stage: "unlock_poll",
        });
      } finally {
        if (active) {
          setUnlockPolling(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [attemptId, locked, pendingUnlockStorageKey, reportData, scaleCode]);

  const handlePay = async () => {
    if (!scaleCode || !firstOffer) {
      setPayError(isZh ? "当前无可用购买方案。" : "No purchasable offer is available.");
      return;
    }

    setPayError(null);
    setPaying(true);

    try {
      trackEvent("clinical_checkout_start", {
        scale_code: scaleCode,
        locked,
        variant,
        quality_level: qualityLevel,
        crisis_alert: crisisAlert,
        locale,
      });

      const checkout = await createCheckoutOrOrder({
        attemptId,
        sku: firstOffer.sku,
        orderNo: firstOffer.order_no,
        idempotencyKey: `clinical_checkout_${attemptId}_${firstOffer.sku ?? "default"}`,
      });

      if (typeof window !== "undefined") {
        try {
          const pendingOrderNo =
            (typeof checkout.order_no === "string" && checkout.order_no.length > 0
              ? checkout.order_no
              : firstOffer.order_no) ?? "";
          window.localStorage.setItem(pendingUnlockStorageKey, pendingOrderNo);
        } catch {
          // ignore storage failures
        }
      }

      if (typeof checkout.checkout_url === "string" && checkout.checkout_url.length > 0) {
        window.location.href = checkout.checkout_url;
        return;
      }

      if (typeof checkout.order_no === "string" && checkout.order_no.length > 0) {
        router.push(withLocale(`/orders/${checkout.order_no}`));
        return;
      }

      throw new Error(isZh ? "暂时无法发起支付。" : "Unable to start checkout.");
    } catch (cause) {
      const mapped = mapClinicalError(cause);
      setPayError(mapped.message);
      captureError(cause, {
        route: "/attempts/[attemptId]/report",
        attemptId,
        stage: "start_checkout",
      });
    } finally {
      setPaying(false);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setError(null);

    try {
      await loadReport({ refresh: true });
    } catch (cause) {
      const mapped = mapClinicalError(cause);
      setError(mapped.message);
      captureError(cause, {
        route: "/attempts/[attemptId]/report",
        attemptId,
        stage: "reload_report",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-4">
        <Alert>{isZh ? "报告加载中..." : "Loading report..."}</Alert>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Button type="button" variant="outline" onClick={handleReload}>
          {isZh ? "重试加载" : "Retry"}
        </Button>
      </div>
    );
  }

  if (!reportData) {
    return <Alert>{isZh ? "报告暂不可用。" : "Report is unavailable."}</Alert>;
  }

  if (!scaleCode) {
    return (
      <div className="space-y-3">
        <Alert>
          {isZh
            ? "当前尝试不是临床量表报告。"
            : "This attempt does not belong to a clinical report flow."}
        </Alert>
        <Link href={withLocale(`/result/${attemptId}`)} className="text-sm font-medium text-sky-700 underline">
          {isZh ? "打开结果页" : "Open result page"}
        </Link>
      </div>
    );
  }

  const qualityText = `${isZh ? "质量等级" : "Quality"}: ${qualityLevel}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{scaleCode}</p>
        <p className="m-0 text-sm text-slate-700">
          {isZh ? "访问等级" : "Access"}: {String(reportData.access_level ?? variant)}
        </p>
        <p className="m-0 text-sm text-slate-700">{qualityText}</p>
        {unlockPolling ? (
          <p className="m-0 text-xs text-slate-500">
            {isZh ? "正在确认解锁状态..." : "Verifying unlock state..."}
          </p>
        ) : null}
        {retryAfterSeconds && generating ? (
          <p className="m-0 text-xs text-slate-500">
            {isZh
              ? `${retryAfterSeconds} 秒后自动重试`
              : `Auto retry in ${retryAfterSeconds} seconds`}
          </p>
        ) : null}
      </div>

      {generating ? (
        <div className="space-y-3">
          <Alert>{isZh ? "报告生成中，请稍候..." : "Report is generating. Please wait..."}</Alert>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : null}

      {snapshotError ? (
        <div className="space-y-3">
          <Alert>{isZh ? "报告快照加载失败，请重试。" : "Report snapshot failed. Please retry."}</Alert>
          <Button type="button" variant="outline" onClick={handleReload}>
            {isZh ? "重试加载报告" : "Retry loading report"}
          </Button>
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      {crisisAlert && !hasCrisisSection ? (
        <CrisisOverlay locale={locale} resources={crisisResources} reasons={crisisReasons} />
      ) : null}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {sections.map((section, index) => (
          <ReportSectionRenderer
            key={`${normalizeSectionKey(section) || "section"}-${index}`}
            locale={locale}
            section={section}
            locked={locked}
          />
        ))}
      </div>

      {showOffers ? (
        <div className="grid gap-3 md:grid-cols-2">
          {offers.map((offer, index) => (
            <OfferCard key={`${offer.sku ?? "offer"}-${index}`} offer={offer} />
          ))}
        </div>
      ) : null}

      {showPaywall ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <UnlockCTA
            attemptId={attemptId}
            sku={firstOffer?.sku}
            orderNo={firstOffer?.order_no}
            formattedPrice={formatOfferPrice(firstOffer)}
            amount={
              typeof firstOffer?.amount_cents === "number"
                ? firstOffer.amount_cents / 100
                : typeof (firstOffer as Record<string, unknown> | undefined)?.price_cents === "number"
                  ? ((firstOffer as Record<string, unknown>).price_cents as number) / 100
                  : undefined
            }
            currency={firstOffer?.currency}
            loading={paying}
            error={payError}
            onPay={handlePay}
          />
        </div>
      ) : null}

      {!showPaywall && locked && !crisisAlert ? (
        <Alert>{isZh ? "当前暂无可用购买方案。" : "No purchase offer is currently available."}</Alert>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={handleReload}>
          {isZh ? "刷新报告" : "Refresh report"}
        </Button>
        <Link href={withLocale(`/tests/${scaleCode === "SDS_20" ? "sds-20" : "clinical-combo-68"}`)} className="text-sm font-medium text-slate-600 underline">
          {isZh ? "返回测评详情" : "Back to test details"}
        </Link>
      </div>
    </div>
  );
}
