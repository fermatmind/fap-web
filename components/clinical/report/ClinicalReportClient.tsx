"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { CrisisOverlay } from "@/components/clinical/report/CrisisOverlay";
import { ReportSectionRenderer } from "@/components/clinical/report/ReportSectionRenderer";
import { SdsFactorPanel } from "@/components/clinical/report/SdsFactorPanel";
import { UnlockCTA } from "@/components/commerce/UnlockCTA";
import { AnimatedCounter } from "@/components/design/AnimatedCounter";
import { AnticipationSkeleton } from "@/components/design/AnticipationSkeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  createCheckoutOrOrder,
  type Big5ReportSection,
  type OfferPayload,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import { fetchClinicalReport } from "@/lib/clinical/api";
import { mapClinicalError } from "@/lib/clinical/errors";
import { buildOrderWaitPath, regionFromLocale, resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import { resolveScaleRollout, type ScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";

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
const DEFAULT_REPORT_404_RETRY_MAX = 5;
const DEFAULT_REPORT_404_RETRY_SCHEDULE_MS = [1000, 2000, 4000, 6000, 8000] as const;
const REPORT_404_RETRY_JITTER_MAX_MS = 300;

type ClinicalScaleCode = "SDS_20" | "CLINICAL_COMBO_68";
type StageDetailedError = {
  stageDetail?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

function parseRetrySchedule(value: string | undefined): number[] {
  const normalized = String(value ?? "").trim();
  if (!normalized) return [...DEFAULT_REPORT_404_RETRY_SCHEDULE_MS];

  const values = normalized
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => Math.floor(item));

  return values.length > 0 ? values : [...DEFAULT_REPORT_404_RETRY_SCHEDULE_MS];
}

function isRetryableNotFoundError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 404) return false;
  const normalizedCode = String(error.errorCode ?? "")
    .trim()
    .toUpperCase();
  return normalizedCode === "RESOURCE_NOT_FOUND" || normalizedCode === "NOT_FOUND" || normalizedCode === "HTTP_404";
}

function attachStageDetail(error: unknown, stageDetail: string): unknown {
  if (error && typeof error === "object") {
    try {
      (error as StageDetailedError).stageDetail = stageDetail;
    } catch {
      // Ignore stage detail assignment failures.
    }
  }
  return error;
}

const REPORT_404_RETRY_ENABLED = parseBooleanEnv(process.env.NEXT_PUBLIC_REPORT_404_RETRY_ENABLED, true);
const REPORT_404_RETRY_MAX = parsePositiveInteger(
  process.env.NEXT_PUBLIC_REPORT_404_RETRY_MAX,
  DEFAULT_REPORT_404_RETRY_MAX
);
const REPORT_404_RETRY_SCHEDULE_MS = parseRetrySchedule(process.env.NEXT_PUBLIC_REPORT_404_RETRY_SCHEDULE_MS);

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
      title: locale === "zh" ? "关怀提示" : "Care Notice",
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
          title: locale === "zh" ? "关怀提示" : "Care Notice",
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

function extractPrimaryNumericScore(report: ReportResponse | null): number | null {
  if (!report || !report.report || typeof report.report !== "object") return null;
  const reportNode = report.report as Record<string, unknown>;
  const scoresNode = reportNode.scores;
  if (!scoresNode || typeof scoresNode !== "object" || Array.isArray(scoresNode)) return null;

  for (const value of Object.values(scoresNode as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.min(100, value));
    }
    if (value && typeof value === "object") {
      const candidateNode = value as Record<string, unknown>;
      const candidate = candidateNode.score ?? candidateNode.value ?? candidateNode.percentile;
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return Math.max(0, Math.min(100, candidate));
      }
    }
  }

  return null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function resolveConsentTrace(report: ReportResponse | null): { version: string; hash: string } {
  if (!report) return { version: "", hash: "" };
  const qualityNode =
    report.quality && typeof report.quality === "object" && !Array.isArray(report.quality)
      ? (report.quality as Record<string, unknown>)
      : {};
  const metaNode =
    report.meta && typeof report.meta === "object" && !Array.isArray(report.meta)
      ? (report.meta as Record<string, unknown>)
      : {};

  return {
    version: pickString(
      qualityNode.consent_version,
      qualityNode.consentVersion,
      metaNode.consent_version,
      metaNode.accepted_version,
      metaNode.disclaimer_version_accepted
    ),
    hash: pickString(
      qualityNode.consent_hash,
      qualityNode.consentHash,
      metaNode.consent_hash,
      metaNode.accepted_hash,
      metaNode.disclaimer_hash
    ),
  };
}

function resolveSdsFactors(report: ReportResponse | null): unknown {
  if (!report || !report.report || typeof report.report !== "object") return null;
  const reportNode = report.report as Record<string, unknown>;
  const scoresNode =
    reportNode.scores && typeof reportNode.scores === "object" && !Array.isArray(reportNode.scores)
      ? (reportNode.scores as Record<string, unknown>)
      : null;
  if (!scoresNode) return null;

  const factors = scoresNode.factors;
  if (factors && typeof factors === "object" && !Array.isArray(factors)) {
    return factors;
  }

  return null;
}

function resolveReportCapabilities(report: ReportResponse | null): Record<string, unknown> | null {
  if (!report || !report.meta || typeof report.meta !== "object" || Array.isArray(report.meta)) {
    return null;
  }
  const metaNode = report.meta as Record<string, unknown>;
  const capabilities = metaNode.capabilities;
  if (capabilities && typeof capabilities === "object" && !Array.isArray(capabilities)) {
    return capabilities as Record<string, unknown>;
  }
  return null;
}

export default function ClinicalReportClient({
  attemptId,
  initialReport,
  rolloutEnv,
}: {
  attemptId: string;
  initialReport?: ReportResponse | null;
  rolloutEnv: ScaleRolloutEnvSnapshot;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const router = useRouter();
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const isZh = locale === "zh";

  const [reportData, setReportData] = useState<ReportResponse | null>(initialReport ?? null);
  const [loading, setLoading] = useState(!initialReport);
  const [error, setError] = useState<string | null>(null);
  const [notFoundRetrying, setNotFoundRetrying] = useState(false);
  const [showNotFoundFallback, setShowNotFoundFallback] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unlockPolling, setUnlockPolling] = useState(false);
  const [pendingOrderNo, setPendingOrderNo] = useState("");

  const reportViewSignatureRef = useRef("");
  const previousLockedRef = useRef<boolean | null>(null);
  const crisisViewSignatureRef = useRef("");
  const loadReportInFlightRef = useRef<Promise<ReportResponse> | null>(null);

  const pendingUnlockStorageKey = `${PENDING_UNLOCK_CACHE_PREFIX}${attemptId}`;
  const scaleCode = useMemo(() => resolveClinicalScaleCode(reportData), [reportData]);
  const locked = Boolean(reportData?.locked);
  const variant = String(reportData?.variant ?? (locked ? "free" : "full"));
  const qualityLevel = String(reportData?.quality?.level ?? "unrated");
  const crisisAlert = reportData?.quality?.crisis_alert === true;
  const primaryNumericScore = useMemo(() => extractPrimaryNumericScore(reportData), [reportData]);
  const generating = resolveGenerating(reportData);
  const snapshotError = resolveSnapshotError(reportData);
  const retryAfterSeconds = resolveRetryAfterSeconds(reportData);
  const consentTrace = useMemo(() => resolveConsentTrace(reportData), [reportData]);
  const sdsFactors = useMemo(() => resolveSdsFactors(reportData), [reportData]);
  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const reportCapabilities = useMemo(() => resolveReportCapabilities(reportData), [reportData]);

  const offers = useMemo(() => normalizeOffers(reportData), [reportData]);
  const firstOffer = offers[0];
  const rawSections = useMemo(() => normalizeSections(reportData), [reportData]);
  const rolloutDecision = useMemo(
    () =>
      resolveScaleRollout({
        scaleCode,
        capabilities: reportCapabilities,
        anonId,
        envSnapshot: rolloutEnv,
      }),
    [anonId, reportCapabilities, rolloutEnv, scaleCode]
  );

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
  const unlockInsightHook = useMemo(() => {
    if (scaleCode === "SDS_20" || scaleCode === "CLINICAL_COMBO_68") {
      return locale === "zh"
        ? "查看造成你近期压力的关键隐性因素与优先行动建议。"
        : "Reveal the hidden drivers behind your current pressure and your top priority actions.";
    }

    return locale === "zh"
      ? "解锁你的核心潜在天赋与行动建议。"
      : "Unlock your core strengths and practical next actions.";
  }, [locale, scaleCode]);

  const showPaywall = locked && offers.length > 0 && !crisisAlert && rolloutDecision.commerceEnabled;
  const showOffers = offers.length > 0 && !crisisAlert && rolloutDecision.commerceEnabled;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setPendingOrderNo(window.localStorage.getItem(pendingUnlockStorageKey) ?? "");
    } catch {
      setPendingOrderNo("");
    }
  }, [pendingUnlockStorageKey, reportData, showNotFoundFallback]);

  const loadReport = useCallback(
    async ({ refresh = false }: { refresh?: boolean } = {}) => {
      if (loadReportInFlightRef.current) {
        return loadReportInFlightRef.current;
      }

      const runner = (async () => {
        setNotFoundRetrying(false);
        let latest: ReportResponse | null = null;
        const maxRetries = REPORT_404_RETRY_ENABLED ? REPORT_404_RETRY_MAX : 0;

        for (let retryAttempt = 0; retryAttempt <= maxRetries; retryAttempt += 1) {
          try {
            latest = await fetchClinicalReport({
              attemptId,
              refresh: retryAttempt > 0 ? true : refresh,
            });
            setReportData(latest);
            break;
          } catch (cause) {
            if (!isRetryableNotFoundError(cause) || retryAttempt >= maxRetries) {
              const stageDetail = isRetryableNotFoundError(cause)
                ? "load_report_not_found_retry_exhausted"
                : undefined;
              throw stageDetail ? attachStageDetail(cause, stageDetail) : cause;
            }

            const classified = classifyApiError(cause);
            trackEvent("report_load_failure", {
              scale_code: scaleCode ?? "UNKNOWN",
              stage: "load_report",
              stage_detail: "load_report_not_found_retrying",
              status_group: classified.statusGroup,
              status_code: classified.statusCode,
              error_code: classified.errorCode,
              route: "/attempts/[attemptId]/report",
              locale,
            });
            setNotFoundRetrying(true);

            const baseDelay =
              REPORT_404_RETRY_SCHEDULE_MS[Math.min(retryAttempt, REPORT_404_RETRY_SCHEDULE_MS.length - 1)] ??
              GENERATING_POLL_INTERVAL_MS;
            const jitter = Math.floor(Math.random() * (REPORT_404_RETRY_JITTER_MAX_MS + 1));
            await sleep(baseDelay + jitter);
          }
        }

        if (!latest) {
          throw attachStageDetail(new Error("Report unavailable."), "load_report_not_found_retry_exhausted");
        }
        setNotFoundRetrying(false);

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
      })().finally(() => {
        loadReportInFlightRef.current = null;
      });

      loadReportInFlightRef.current = runner;
      return runner;
    },
    [attemptId, locale, scaleCode]
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
      setShowNotFoundFallback(false);
      setNotFoundRetrying(false);
      try {
        await loadReport();
      } catch (cause) {
        if (!active) return;
        const stageDetail =
          typeof (cause as StageDetailedError | null | undefined)?.stageDetail === "string"
            ? (cause as StageDetailedError).stageDetail
            : undefined;
        const mapped = mapClinicalError(cause);
        const message =
          stageDetail === "load_report_not_found_retry_exhausted"
            ? dict.result.reportNotFoundFallback
            : mapped.message;
        setError(message);
        setNotFoundRetrying(false);
        setShowNotFoundFallback(stageDetail === "load_report_not_found_retry_exhausted");
        const classified = classifyApiError(cause);
        const payload: Record<string, unknown> = {
          scale_code: scaleCode ?? "UNKNOWN",
          stage: "load_report",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/attempts/[attemptId]/report",
          locale,
        };
        if (stageDetail) {
          payload.stage_detail = stageDetail;
        }
        trackEvent("report_load_failure", {
          ...payload,
        });
        captureError(cause, {
          route: "/attempts/[attemptId]/report",
          attemptId,
          scaleCode: scaleCode ?? "UNKNOWN",
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
  }, [attemptId, dict.result.reportNotFoundFallback, initialReport, loadReport, locale, scaleCode]);

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
    if (!scaleCode || !crisisAlert) return;

    const signature = `crisis:${scaleCode}:${qualityLevel}:${locale}`;
    if (crisisViewSignatureRef.current === signature) return;
    crisisViewSignatureRef.current = signature;

    trackEvent("clinical_crisis_view", {
      scale_code: scaleCode,
      crisis_alert: true,
      quality_level: qualityLevel,
      locale,
    });
  }, [crisisAlert, locale, qualityLevel, scaleCode]);

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
      setPendingOrderNo("");
    }

    previousLockedRef.current = locked;
  }, [crisisAlert, locale, locked, pendingUnlockStorageKey, qualityLevel, reportData, scaleCode, variant]);

  useEffect(() => {
    const resolvedScale = scaleCode ?? "CLINICAL_COMBO_68";
    if (loading) {
      trackEvent("ui_report_loading_phase", {
        scale_code: resolvedScale,
        phase: "initial_loading",
        locked: true,
        variant: "free",
        locale,
      });
      return;
    }

    if (generating) {
      trackEvent("ui_report_loading_phase", {
        scale_code: resolvedScale,
        phase: "generating",
        locked,
        variant,
        locale,
      });
    }
  }, [generating, loading, locale, locked, scaleCode, variant]);

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
            setPendingOrderNo("");
            break;
          }
        }
      } catch (cause) {
        if (!active) return;
        const classified = classifyApiError(cause);
        trackEvent("report_load_failure", {
          scale_code: scaleCode ?? "UNKNOWN",
          stage: "unlock_poll",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          route: "/attempts/[attemptId]/report",
          locale,
        });
        captureError(cause, {
          route: "/attempts/[attemptId]/report",
          attemptId,
          scaleCode: scaleCode ?? "UNKNOWN",
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
  }, [attemptId, locale, locked, pendingUnlockStorageKey, reportData, scaleCode]);

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
        region: regionFromLocale(locale),
      });
      const action = resolveCheckoutAction(checkout, isZh ? "暂时无法发起支付。" : "Unable to start checkout.");

      if (typeof window !== "undefined") {
        try {
          const pendingOrderNo =
            action.kind === "order_wait"
              ? action.orderNo
              : action.kind === "redirect"
                ? (action.orderNo ?? firstOffer.order_no ?? "")
                : (firstOffer.order_no ?? "");
          window.localStorage.setItem(pendingUnlockStorageKey, pendingOrderNo);
          setPendingOrderNo(pendingOrderNo);
        } catch {
          // ignore storage failures
        }
      }

      if (action.kind === "redirect") {
        window.location.href = action.url;
        return;
      }

      if (action.kind === "order_wait") {
        router.push(withLocale(buildOrderWaitPath(action)));
        return;
      }

      throw new Error(action.message);
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
    setNotFoundRetrying(false);
    setShowNotFoundFallback(false);

    try {
      await loadReport({ refresh: true });
    } catch (cause) {
      const stageDetail =
        typeof (cause as StageDetailedError | null | undefined)?.stageDetail === "string"
          ? (cause as StageDetailedError).stageDetail
          : undefined;
      const mapped = mapClinicalError(cause);
      const message =
        stageDetail === "load_report_not_found_retry_exhausted"
          ? dict.result.reportNotFoundFallback
          : mapped.message;
      setError(message);
      setNotFoundRetrying(false);
      setShowNotFoundFallback(stageDetail === "load_report_not_found_retry_exhausted");
      const classified = classifyApiError(cause);
      const payload: Record<string, unknown> = {
        scale_code: scaleCode ?? "UNKNOWN",
        stage: "reload_report",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/attempts/[attemptId]/report",
        locale,
      };
      if (stageDetail) {
        payload.stage_detail = stageDetail;
      }
      trackEvent("report_load_failure", {
        ...payload,
      });
      captureError(cause, {
        route: "/attempts/[attemptId]/report",
        attemptId,
        scaleCode: scaleCode ?? "UNKNOWN",
        stage: "reload_report",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-3">
        {notFoundRetrying ? <Alert>{dict.result.reportNotFoundRetrying}</Alert> : null}
        <AnticipationSkeleton phases={dict.loading.phases} />
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
        {showNotFoundFallback ? (
          <div className="space-y-2">
            <Link href={withLocale(`/result/${attemptId}`)} className="block text-sm font-medium text-sky-700 underline">
              {isZh ? "打开结果页" : "Open result page"}
            </Link>
            <Link
              href={withLocale(pendingOrderNo ? `/orders/${pendingOrderNo}` : "/orders/lookup")}
              className="block text-sm font-medium text-sky-700 underline"
            >
              {pendingOrderNo ? dict.result.viewOrderStatus : dict.result.openOrderLookup}
            </Link>
          </div>
        ) : null}
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
        {primaryNumericScore !== null ? (
          <p className="m-0 text-sm text-slate-700">
            {isZh ? "核心分值" : "Primary score"}:{" "}
            <AnimatedCounter value={primaryNumericScore} className="font-semibold text-[var(--fm-accent)]" />
          </p>
        ) : null}
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
        {consentTrace.version || consentTrace.hash ? (
          <p className="m-0 text-xs text-slate-500">
            {isZh ? "同意书版本" : "Consent"}: {consentTrace.version || "-"} ·
            {isZh ? " 哈希" : " hash"}: {consentTrace.hash || "-"}
          </p>
        ) : null}
      </div>

      {generating ? (
        <div className="space-y-3">
          <Alert>{isZh ? "报告生成中，请稍候..." : "Report is generating. Please wait..."}</Alert>
          <AnticipationSkeleton phases={dict.loading.phases} />
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
        <CrisisOverlay locale={locale} resources={crisisResources} reasons={crisisReasons} scaleCode={scaleCode} />
      ) : null}

      {scaleCode === "SDS_20" && sdsFactors ? (
        <SdsFactorPanel locale={locale} factors={sdsFactors} />
      ) : null}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {sections.map((section, index) => (
          <ReportSectionRenderer
            key={`${normalizeSectionKey(section) || "section"}-${index}`}
            locale={locale}
            section={section}
            locked={locked}
            scaleCode={scaleCode}
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
            insightHook={unlockInsightHook}
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
        <Alert>
          {rolloutDecision.commerceEnabled
            ? (isZh ? "当前暂无可用购买方案。" : "No purchase offer is currently available.")
            : (isZh ? "当前仅开放免费报告，付费入口已关闭。" : "Only free report is available right now. Paid unlock is disabled.")}
        </Alert>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={handleReload}>
          {isZh ? "刷新报告" : "Refresh report"}
        </Button>
        <Link
          href={withLocale(
            `/tests/${scaleCode === "SDS_20"
              ? "depression-screening-test-standard-edition"
              : "clinical-depression-anxiety-assessment-professional-edition"}`
          )}
          className="text-sm font-medium text-slate-600 underline"
        >
          {isZh ? "返回测评详情" : "Back to test details"}
        </Link>
      </div>
    </div>
  );
}
