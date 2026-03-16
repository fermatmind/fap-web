"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrCreateAnonId } from "@/lib/anon";
import {
  createMbtiCompareInvite,
  getShareSummary,
  trackShareClick,
  type AttributionUtm,
  type ShareSummaryResponse,
} from "@/lib/api/v0_3";
import { captureError } from "@/lib/observability/sentry";
import type { Locale } from "@/lib/i18n/locales";
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

  const queryString = searchParams.toString();
  const landingPath = useMemo(() => buildLandingPath(pathname, queryString), [pathname, queryString]);
  const utm = useMemo(() => readNormalizedUtm(new URLSearchParams(queryString)), [queryString]);
  const utmQuery = useMemo(() => buildUtmQuery(utm), [utm]);
  const pageReferrer = typeof document === "undefined" ? undefined : document.referrer || undefined;
  const viewModel = useMemo(() => buildSharePageViewModel(data), [data]);

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

    return buildAugmentedPath(basePath, {
      share_id: resolvedShareId,
      share_click_id: shareClickId ?? undefined,
      entrypoint: "share_page",
      landing_path: landingPath,
      referrer: pageReferrer,
      ...utmQuery,
    });
  }, [landingPath, locale, pageReferrer, resolvedShareId, shareClickId, utmQuery, viewModel.primaryCtaPath]);

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
      />

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
