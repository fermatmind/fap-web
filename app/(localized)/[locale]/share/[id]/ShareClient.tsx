"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import {
  createMbtiCompareInvite,
  getShareSummary,
  trackShareClick,
  type AttributionUtm,
  type ShareSummaryResponse,
} from "@/lib/api/v0_3";
import { captureError } from "@/lib/observability/sentry";
import type { Locale } from "@/lib/i18n/locales";
import {
  appendMbtiContinuityQuery,
  buildMbtiContinuityTelemetryFields,
  resolveMbtiCarryoverFocusLabel,
  resolveMbtiCarryoverReasonLabel,
} from "@/lib/mbti/continuity";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";

const SHARE_CLICK_SESSION_PREFIX = "fm_share_click_v1";
const MBTI_TAKE_FALLBACK_PATH = "/tests/mbti-personality-test-16-personality-types/take";

function buildLandingPath(pathname: string | null, queryString: string): string {
  const safePath = pathname || "/";
  return queryString ? `${safePath}?${queryString}` : safePath;
}

function buildAugmentedPath(
  path: string,
  query: Record<string, string | boolean | null | undefined>
): string {
  const url = new URL(path, "https://fap.local");

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, typeof value === "boolean" ? String(value) : value);
  }

  return url.origin === "https://fap.local"
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
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

function buildUtmQuery(utm?: AttributionUtm): Record<string, string> {
  return {
    ...(utm?.source ? { utm_source: utm.source } : {}),
    ...(utm?.medium ? { utm_medium: utm.medium } : {}),
    ...(utm?.campaign ? { utm_campaign: utm.campaign } : {}),
    ...(utm?.term ? { utm_term: utm.term } : {}),
    ...(utm?.content ? { utm_content: utm.content } : {}),
  };
}

function readShareClickDedupKey({ shareId, landingPath }: { shareId: string; landingPath: string }) {
  return `${SHARE_CLICK_SESSION_PREFIX}:${shareId}:${landingPath}`;
}

function readTrackedShareClickId(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(key)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

function markShareClickTracked(key: string, trackedShareClickId: string): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, trackedShareClickId);
  } catch {
    // Ignore storage failures.
  }
}

export default function ShareClient({
  locale,
  shareId,
}: {
  locale: Locale;
  shareId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ShareSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareClickId, setShareClickId] = useState<string | null>(null);
  const [shareClickStatus, setShareClickStatus] = useState<"idle" | "pending" | "ready" | "error">("idle");
  const [compareInvitePending, setCompareInvitePending] = useState(false);
  const [compareInviteError, setCompareInviteError] = useState<string | null>(null);
  const carryoverImpressionTrackedRef = useRef(false);
  const widgetImpressionTrackedRef = useRef(false);

  const queryString = searchParams.toString();
  const landingPath = useMemo(() => buildLandingPath(pathname, queryString), [pathname, queryString]);
  const utm = useMemo(() => readNormalizedUtm(new URLSearchParams(queryString)), [queryString]);
  const utmQuery = useMemo(() => buildUtmQuery(utm), [utm]);
  const pageReferrer = typeof document === "undefined" ? undefined : document.referrer || undefined;
  const viewModel = useMemo(() => buildSharePageViewModel(data), [data]);
  const landingSurface = viewModel.landingSurface;
  const publicSurface = viewModel.publicSurface;
  const insightGraph = viewModel.insightGraph;
  const embedSurface = viewModel.embedSurface;
  const widgetSurface = viewModel.widgetSurface;
  const partnerRead = viewModel.partnerRead;
  const comparative = viewModel.comparative;
  const workingLife = viewModel.workingLife;
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(
    String(viewModel.continuity?.carryoverFocusKey ?? ""),
    locale
  );
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(
    String(viewModel.continuity?.carryoverReason ?? ""),
    locale
  );
  const shareDisplayType = String(viewModel.card?.displayType ?? "").trim();
  const shareScaleCode = viewModel.scaleCode || "MBTI";
  const continuityTelemetry = useMemo(
    () => buildMbtiContinuityTelemetryFields(viewModel.continuity),
    [viewModel.continuity]
  );
  const publicSurfaceImpressionTrackedRef = useRef(false);
  const landingSurfaceImpressionTrackedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getShareSummary({
          shareId,
          locale,
        });
        if (!active) return;
        setData(response);
      } catch (cause) {
        if (!active) return;
        const message = cause instanceof Error ? cause.message : "Share not available.";
        setError(message);
        captureError(cause, {
          route: "/share/[id]",
          shareId,
          stage: "load_share_summary",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [locale, shareId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;
    const dedupKey = readShareClickDedupKey({
      shareId,
      landingPath,
    });
    const existingShareClickId = readTrackedShareClickId(dedupKey);
    if (existingShareClickId) {
      setShareClickId(existingShareClickId);
      setShareClickStatus("ready");
      return;
    }

    const anonId = getOrCreateAnonId().trim();
    setShareClickStatus("pending");

    void trackShareClick({
      shareId,
      anonId,
      locale,
      meta: {
        entrypoint: "share_page",
        landing_path: landingPath,
        referrer: pageReferrer,
        ...(utm ? { utm } : {}),
        compare_intent: false,
      },
    })
      .then((response) => {
        const trackedShareClickId = response.id?.trim();
        if (!trackedShareClickId) {
          throw new Error("Share click id missing from response.");
        }
        if (!active) return;
        setShareClickId(trackedShareClickId);
        setShareClickStatus("ready");
        markShareClickTracked(dedupKey, trackedShareClickId);
      })
      .catch((cause) => {
        if (!active) return;
        setShareClickStatus("error");
        captureError(cause, {
          route: "/share/[id]",
          shareId,
          stage: "track_share_click",
        });
      });

    return () => {
      active = false;
    };
  }, [landingPath, locale, pageReferrer, shareId, utm]);

  const resolvedShareId = viewModel.shareId || shareId;
  const primaryCtaHref = useMemo(() => {
    const basePath = viewModel.primaryCtaPath || `/${locale}${MBTI_TAKE_FALLBACK_PATH}`;
    const attributedPath = buildAugmentedPath(basePath, {
      share_id: resolvedShareId,
      share_click_id: shareClickId ?? undefined,
      entrypoint: "share_page",
      landing_path: landingPath,
      referrer: pageReferrer,
      ...utmQuery,
    });

    return appendMbtiContinuityQuery(attributedPath, viewModel.continuity);
  }, [landingPath, locale, pageReferrer, resolvedShareId, shareClickId, utmQuery, viewModel.continuity, viewModel.primaryCtaPath]);

  const primaryContinueTarget = publicSurface?.continueReadingKeys[0] || "share_take_flow";
  const publicSurfaceTelemetry = {
    entrySurface: publicSurface?.entrySurface || "",
    attributionScope: publicSurface?.attributionScope || "",
    publicSummaryFingerprint: publicSurface?.publicSummaryFingerprint || "",
    discoverabilityKeys: publicSurface?.discoverabilityKeys ?? [],
  };
  const partnerReadTelemetry = {
    readScope: partnerRead?.readScope || "",
    subjectScope: partnerRead?.subjectScope || "",
    attributionScope:
      partnerRead?.attributionScope || publicSurface?.attributionScope || "",
  };
  const widgetTelemetry = {
    widgetScope: widgetSurface?.widgetScope || "",
    widgetContractVersion: widgetSurface?.widgetContractVersion || "",
    hostMode: widgetSurface?.hostMode || "",
    slotKey: widgetSurface?.slotKey || "",
    sizePreset: widgetSurface?.sizePreset || "",
  };

  useEffect(() => {
    if (!viewModel.continuity || !primaryCtaHref || carryoverImpressionTrackedRef.current) {
      return;
    }

    carryoverImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-share-page",
      scale_code: "MBTI",
      visual_kind: "share_carryover_entry",
      continueTarget: "share_take_flow",
      ctaKey: "share_carryover_entry",
      ctaRank: 1,
      attempt_id: viewModel.attemptId || undefined,
      typeCode: shareDisplayType,
      ...continuityTelemetry,
      locale,
    });
  }, [continuityTelemetry, locale, primaryCtaHref, shareDisplayType, viewModel.attemptId, viewModel.continuity]);

  useEffect(() => {
    if (!landingSurface || landingSurfaceImpressionTrackedRef.current) {
      return;
    }

    landingSurfaceImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "share-page",
      scale_code: shareScaleCode,
      visual_kind: "share_landing_surface",
      attempt_id: viewModel.attemptId || undefined,
      ctaKey: "share_landing_surface",
      ctaRank: 1,
      continueTarget: landingSurface.contentContinueTarget || landingSurface.startTestTarget || undefined,
      typeCode: shareDisplayType || undefined,
      landingScope: landingSurface.landingScope,
      attributionScope: landingSurface.attributionScope,
      locale,
    });
  }, [landingSurface, locale, shareDisplayType, shareScaleCode, viewModel.attemptId]);

  useEffect(() => {
    if (!publicSurface || publicSurfaceImpressionTrackedRef.current) {
      return;
    }

    publicSurfaceImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "share-page",
      scale_code: shareScaleCode,
      visual_kind: shareScaleCode === "BIG5_OCEAN" ? "big5_share_public_surface" : "mbti_share_public_surface",
      attempt_id: viewModel.attemptId || undefined,
      ctaKey: "share_public_surface",
      ctaRank: 1,
      continueTarget: primaryContinueTarget,
      typeCode: shareDisplayType || undefined,
      ...publicSurfaceTelemetry,
      locale,
    });
  }, [locale, primaryContinueTarget, publicSurface, publicSurfaceTelemetry, shareDisplayType, shareScaleCode, viewModel.attemptId]);

  useEffect(() => {
    if (!widgetSurface || !insightGraph || widgetImpressionTrackedRef.current) {
      return;
    }

    widgetImpressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "share-page",
      scale_code: shareScaleCode,
      visual_kind: "share_widget_surface",
      attempt_id: viewModel.attemptId || undefined,
      ctaKey: "share_widget_surface",
      ctaRank: 1,
      continueTarget: widgetSurface.continueTarget || primaryContinueTarget,
      typeCode: shareDisplayType || undefined,
      graphScope: insightGraph.graphScope,
      graphFingerprint: insightGraph.graphFingerprint,
      graphContractVersion: insightGraph.graphContractVersion,
      embedSurfaceKey: widgetSurface.surfaceKey || embedSurface?.surfaceKey || "",
      embedFingerprint: widgetSurface.embedFingerprint || embedSurface?.embedFingerprint || "",
      ...widgetTelemetry,
      supportingScales: insightGraph.supportingScales.join("|"),
      ...publicSurfaceTelemetry,
      ...partnerReadTelemetry,
      locale,
    });
  }, [
    insightGraph,
    locale,
    partnerReadTelemetry,
    primaryContinueTarget,
    publicSurfaceTelemetry,
    shareDisplayType,
    shareScaleCode,
    viewModel.attemptId,
    widgetSurface,
    widgetTelemetry,
    embedSurface,
  ]);

  const insightCards = [
    viewModel.controlledNarrative?.narrativeSummary
      ? {
          key: "narrative",
          title: locale === "zh" ? "公开摘要" : "Public summary",
          body: viewModel.controlledNarrative.narrativeSummary,
        }
      : null,
    comparative?.cohortRelativePosition?.summary
      ? {
          key: "comparative",
          title: comparative.cohortRelativePosition.label || (locale === "zh" ? "相对位置" : "Relative position"),
          body: comparative.cohortRelativePosition.summary,
        }
      : null,
    (workingLife?.careerFocusKey || viewModel.culturalCalibration?.workingLifeSummary)
      ? {
          key: "working-life",
          title: locale === "zh" ? "工作生活线索" : "Working-life cue",
          body:
            viewModel.culturalCalibration?.workingLifeSummary
            || (workingLife?.careerFocusKey
              ? `${locale === "zh" ? "当前重点" : "Current focus"}: ${workingLife.careerFocusKey}`
              : ""),
        }
      : null,
  ].filter((item): item is { key: string; title: string; body: string } => Boolean(item && item.body));
  const widgetNodeTitles = insightGraph?.nodes
    .filter((node) => widgetSurface?.allowedNodeIds.includes(node.id))
    .map((node) => node.title)
    .filter(Boolean) ?? [];

  const handleCompareInvite = async () => {
    const anonId = getOrCreateAnonId().trim();
    setCompareInvitePending(true);
    setCompareInviteError(null);

    try {
      const response = await createMbtiCompareInvite({
        shareId: resolvedShareId,
        anonId,
        locale,
        entrypoint: "share_page",
        referrer: pageReferrer,
        landingPath,
        compareIntent: true,
        shareClickId: shareClickId ?? undefined,
        utm,
      });

      const inviteId = response.invite_id?.trim();
      const takePath = response.take_path?.trim();
      if (!inviteId || !takePath) {
        throw new Error("Compare invite path is unavailable.");
      }

      router.push(
        buildAugmentedPath(takePath, {
          share_id: resolvedShareId,
          compare_invite_id: inviteId,
          share_click_id: shareClickId ?? undefined,
          entrypoint: "share_compare_invite",
          landing_path: landingPath,
          referrer: pageReferrer,
          compare_intent: true,
          ...utmQuery,
        })
      );
    } catch (cause) {
      setCompareInviteError(cause instanceof Error ? cause.message : "Unable to create compare invite.");
      captureError(cause, {
        route: "/share/[id]",
        shareId: resolvedShareId,
        stage: "create_compare_invite",
      });
    } finally {
      setCompareInvitePending(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <Skeleton className="h-72 w-full rounded-[32px]" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert>{error ?? "Share not available."}</Alert>
      </main>
    );
  }

  return (
    <>
      <MbtiShareSummaryCard
        locale={locale}
        card={viewModel.card}
        primaryActionHref={primaryCtaHref}
        primaryActionLabel={viewModel.primaryCtaLabel}
        onPrimaryActionClick={() => {
          trackEvent("ui_card_interaction", {
            slug: "share-page",
            scale_code: shareScaleCode,
            visual_kind: shareScaleCode === "BIG5_OCEAN" ? "big5_share_public_surface" : "mbti_share_public_surface",
            interaction: "return_to_test",
            attempt_id: viewModel.attemptId || undefined,
            ctaKey: "share_public_surface",
            ctaRank: 1,
            continueTarget: primaryContinueTarget,
            typeCode: shareDisplayType || undefined,
            ...publicSurfaceTelemetry,
            locale,
          });
        }}
        onLibraryActionClick={() => {
          trackEvent("ui_card_interaction", {
            slug: "share-page",
            scale_code: shareScaleCode,
            visual_kind: "share_browse_tests",
            interaction: "continue_reading",
            attempt_id: viewModel.attemptId || undefined,
            ctaKey: "share_browse_tests",
            ctaRank: 2,
            continueTarget: "tests_library",
            typeCode: shareDisplayType || undefined,
            ...publicSurfaceTelemetry,
            locale,
          });
        }}
      />

      {landingSurface?.ctaBundle.length || landingSurface?.summaryBlocks.length ? (
        <section className="mx-auto -mt-2 w-full max-w-5xl px-4 pb-4 md:px-6" data-testid="share-landing-surface">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key} className="mb-3 last:mb-0">
                {block.title ? (
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{block.title}</p>
                ) : null}
                {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{block.body}</p> : null}
              </div>
            ))}
            {landingSurface.ctaBundle.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {landingSurface.ctaBundle.map((cta, index) => (
                  <Link
                    key={cta.key}
                    href={cta.href}
                    className={buttonVariants({ variant: index === 0 ? "default" : "outline", size: "sm" })}
                    onClick={() => {
                      trackEvent("ui_card_interaction", {
                        slug: "share-page",
                        scale_code: shareScaleCode,
                        visual_kind: "share_landing_surface",
                        interaction: "continue_reading",
                        attempt_id: viewModel.attemptId || undefined,
                        ctaKey: cta.key,
                        ctaRank: index + 1,
                        continueTarget: cta.key,
                        typeCode: shareDisplayType || undefined,
                        landingScope: landingSurface.landingScope,
                        attributionScope: landingSurface.attributionScope,
                        locale,
                      });
                    }}
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {insightCards.length > 0 ? (
        <section className="mx-auto -mt-4 w-full max-w-5xl px-4 pb-6 md:px-6">
          <div
            data-testid="share-public-insight-grid"
            className="grid gap-4 md:grid-cols-3"
          >
            {insightCards.map((item) => (
              <div
                key={item.key}
                className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {item.title}
                </p>
                <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {widgetSurface && insightGraph ? (
        <section className="mx-auto -mt-2 w-full max-w-5xl px-4 pb-6 md:px-6">
          <div
            data-testid="share-widget-surface"
            className="rounded-[28px] border border-sky-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#eff6ff_45%,_#f8fafc_100%)] px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                {locale === "zh" ? "可嵌入洞察组件" : "Embeddable insight widget"}
              </p>
              <h2 className="m-0 text-xl font-semibold text-slate-950">
                {widgetSurface.title || (locale === "zh" ? "结果主链摘要" : "Result-path summary")}
              </h2>
              <p className="m-0 text-sm leading-7 text-slate-600">
                {widgetSurface.summary || (locale === "zh" ? "用同一条后端 authority 主链继续阅读与行动。" : "Continue reading and action from the same backend-owned authority chain.")}
              </p>
            </div>

            <div
              data-testid="share-widget-host-meta"
              className="mt-4 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 text-xs text-slate-600"
            >
              <p className="m-0 font-semibold text-slate-900">
                {locale === "zh" ? "Host-aware widget contract" : "Host-aware widget contract"}
              </p>
              <p className="m-0 mt-1">
                {widgetSurface.hostMode || "card"}
                {" · "}
                {widgetSurface.slotKey || "public_share_primary"}
                {" · "}
                {widgetSurface.sizePreset || "summary_card"}
              </p>
            </div>

            {widgetNodeTitles.length > 0 ? (
              <div
                data-testid="share-widget-node-list"
                className="mt-4 flex flex-wrap gap-2"
              >
                {widgetNodeTitles.map((title) => (
                  <span
                    key={title}
                    className="inline-flex rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {title}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <Link
                href={primaryCtaHref}
                data-testid="share-widget-continue-cta"
                className={buttonVariants({ variant: "outline", className: "inline-flex" })}
                onClick={() => {
                  trackEvent("ui_card_interaction", {
                    slug: "share-page",
                    scale_code: shareScaleCode,
                    visual_kind: "share_widget_surface",
                    interaction: "continue",
                    attempt_id: viewModel.attemptId || undefined,
                    ctaKey: "share_widget_surface",
                    ctaRank: 1,
                    continueTarget: widgetSurface.continueTarget || primaryContinueTarget,
                    typeCode: shareDisplayType || undefined,
                    graphScope: insightGraph.graphScope,
                    graphFingerprint: insightGraph.graphFingerprint,
                    graphContractVersion: insightGraph.graphContractVersion,
                    embedSurfaceKey: widgetSurface.surfaceKey || embedSurface?.surfaceKey || "",
                    embedFingerprint: widgetSurface.embedFingerprint || embedSurface?.embedFingerprint || "",
                    ...widgetTelemetry,
                    supportingScales: insightGraph.supportingScales.join("|"),
                    ...publicSurfaceTelemetry,
                    ...partnerReadTelemetry,
                    locale,
                  });
                }}
              >
                {widgetSurface.primaryCtaLabel || viewModel.primaryCtaLabel || (locale === "zh" ? "继续这里" : "Continue here")}
              </Link>
            </div>

            {partnerRead ? (
              <div
                data-testid="share-partner-read-scope"
                className="mt-4 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 text-xs text-slate-600"
              >
                <p className="m-0 font-semibold text-slate-900">
                  {locale === "zh" ? "Partner-safe read" : "Partner-safe read"}
                </p>
                <p className="m-0 mt-1">
                  {partnerRead.graphScope || insightGraph.graphScope}
                  {" · "}
                  {partnerRead.readScope || (locale === "zh" ? "只读" : "read only")}
                  {" · "}
                  {partnerRead.subjectScope || (locale === "zh" ? "降级摘要" : "downgraded summary")}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {viewModel.continuity ? (
        <section className="mx-auto -mt-4 w-full max-w-5xl px-4 pb-6 md:px-6">
          <div
            data-testid="mbti-share-carryover-entry"
            className="rounded-[28px] border border-emerald-200 bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {locale === "zh" ? "继续你当前最相关的主线" : "Continue your current focus"}
              </p>
              <h2 className="m-0 text-xl font-semibold text-slate-950">
                {locale === "zh"
                  ? `下一步先看 ${continuityFocusLabel || "当前重点"}`
                  : `Start next with ${continuityFocusLabel || "the current focus"}`}
              </h2>
              <p className="m-0 text-sm leading-7 text-slate-600">{continuityReasonLabel}</p>
            </div>
            <div className="mt-4">
              <Link
                href={primaryCtaHref}
                data-testid="mbti-share-carryover-cta"
                className={buttonVariants({ className: "inline-flex" })}
                onClick={() => {
                  trackEvent("ui_card_interaction", {
                    slug: "mbti-share-page",
                    scale_code: "MBTI",
                    visual_kind: "share_carryover_entry",
                    interaction: "click",
                    continueTarget: "share_take_flow",
                    ctaKey: "share_carryover_entry",
                    ctaRank: 1,
                    attempt_id: viewModel.attemptId || undefined,
                    typeCode: shareDisplayType,
                    ...continuityTelemetry,
                    locale,
                  });
                }}
              >
                {locale === "zh" ? "继续这里" : "Continue here"}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {!viewModel.continuity && publicSurface?.continueReadingKeys.length ? (
        <section className="mx-auto -mt-4 w-full max-w-5xl px-4 pb-6 md:px-6">
          <div
            data-testid="share-public-continue-entry"
            className="rounded-[28px] border border-emerald-200 bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {locale === "zh" ? "继续阅读" : "Continue from here"}
              </p>
              <h2 className="m-0 text-xl font-semibold text-slate-950">
                {locale === "zh"
                  ? "继续进入完整结果主链"
                  : "Continue into the full result path"}
              </h2>
              <p className="m-0 text-sm leading-7 text-slate-600">
                {locale === "zh"
                  ? "这张公开卡片只保留安全摘要。继续测试后可以进入完整结果与后续阅读主线。"
                  : "This public card keeps only the safe summary. Continue into the test flow to unlock the full result path and deeper reading."}
              </p>
            </div>
            <div className="mt-4">
              <Link
                href={primaryCtaHref}
                data-testid="share-public-continue-cta"
                className={buttonVariants({ className: "inline-flex" })}
                onClick={() => {
                  trackEvent("ui_card_interaction", {
                    slug: "share-page",
                    scale_code: shareScaleCode,
                    visual_kind: shareScaleCode === "BIG5_OCEAN" ? "big5_share_continue_entry" : "mbti_share_continue_entry",
                    interaction: "continue_reading",
                    attempt_id: viewModel.attemptId || undefined,
                    ctaKey: "share_public_continue",
                    ctaRank: 1,
                    continueTarget: primaryContinueTarget,
                    typeCode: shareDisplayType || undefined,
                    ...publicSurfaceTelemetry,
                    locale,
                  });
                }}
              >
                {locale === "zh" ? "继续这里" : "Continue here"}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {viewModel.compareEnabled ? (
        <section className="mx-auto -mt-4 w-full max-w-5xl px-4 pb-12 md:px-6">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="m-0 text-sm font-semibold text-slate-900">
                  {locale === "zh" ? "邀请朋友来测并对比" : "Invite a friend to take the test and compare"}
                </p>
                <p className="m-0 text-sm text-slate-600">
                  {locale === "zh"
                    ? "流程只会展示公开安全的摘要和 compare 结果，不会泄露任何付费内容。"
                    : "The flow only exposes public-safe summary and compare data, never paid report content."}
                </p>
              </div>

              <Button
                type="button"
                className="min-w-[220px]"
                onClick={() => {
                  void handleCompareInvite();
                }}
                disabled={compareInvitePending || shareClickStatus === "pending"}
              >
                {compareInvitePending
                  ? locale === "zh"
                    ? "正在创建邀请..."
                    : "Creating invite..."
                  : viewModel.compareCtaLabel || (locale === "zh" ? "邀请朋友来测并对比" : "Invite a friend to compare")}
              </Button>
            </div>

            {compareInviteError ? <Alert className="mt-4">{compareInviteError}</Alert> : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
