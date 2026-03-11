"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrCreateAnonId } from "@/lib/anon";
import {
  getShareSummary,
  trackShareClick,
  type ShareSummaryResponse,
} from "@/lib/api/v0_3";
import { captureError } from "@/lib/observability/sentry";
import type { Locale } from "@/lib/i18n/locales";

const SHARE_CLICK_SESSION_PREFIX = "fm_share_click_v1";

function buildLandingPath(pathname: string | null, queryString: string): string {
  const safePath = pathname || "/";
  return queryString ? `${safePath}?${queryString}` : safePath;
}

function readUtmParams(searchParams: URLSearchParams): Record<string, string> | undefined {
  const utmEntries = Array.from(searchParams.entries()).filter(([key, value]) => key.startsWith("utm_") && value.trim());
  if (utmEntries.length === 0) {
    return undefined;
  }

  return utmEntries.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value.trim();
    return acc;
  }, {});
}

function readShareClickDedupKey({ shareId, landingPath }: { shareId: string; landingPath: string }) {
  return `${SHARE_CLICK_SESSION_PREFIX}:${shareId}:${landingPath}`;
}

function hasTrackedShareClick(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markShareClickTracked(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, "1");
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ShareSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const queryString = searchParams.toString();
    const landingPath = buildLandingPath(pathname, queryString);
    const dedupKey = readShareClickDedupKey({
      shareId,
      landingPath,
    });
    if (hasTrackedShareClick(dedupKey)) {
      return;
    }

    const anonId = getOrCreateAnonId().trim();
    const utm = readUtmParams(new URLSearchParams(queryString));

    markShareClickTracked(dedupKey);

    void trackShareClick({
      shareId,
      anonId,
      locale,
      meta: {
        entrypoint: "share_page",
        landing_path: landingPath,
        referrer: document.referrer || undefined,
        ...(utm ? { utm } : {}),
        compare_intent: false,
      },
    }).catch((cause) => {
      captureError(cause, {
        route: "/share/[id]",
        shareId,
        stage: "track_share_click",
      });
    });
  }, [locale, pathname, searchParams, shareId]);

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

  return <MbtiShareSummaryCard locale={locale} data={data} />;
}
