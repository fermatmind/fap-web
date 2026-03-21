"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MbtiCompareInviteView from "@/components/compare/mbti/MbtiCompareInviteView";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getMbtiCompareInvite, type MbtiCompareInviteResponse } from "@/lib/api/v0_3";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import { buildCompareInviteViewModel } from "@/lib/mbti/compareInvite";
import { captureError } from "@/lib/observability/sentry";

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

export default function CompareClient({
  locale,
  inviteId,
}: {
  locale: Locale;
  inviteId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MbtiCompareInviteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const impressionTrackedRef = useRef(false);

  const queryString = searchParams.toString();
  const landingPath = useMemo(() => buildLandingPath(pathname, queryString), [pathname, queryString]);
  const pageReferrer = typeof document === "undefined" ? undefined : document.referrer || undefined;
  const viewModel = useMemo(() => buildCompareInviteViewModel(data), [data]);
  const relationshipSync = viewModel.relationshipSync;
  const dyadicGraph = viewModel.dyadicGraph;

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getMbtiCompareInvite({
          inviteId,
          locale,
        });
        if (!active) return;
        setData(response);
      } catch (cause) {
        if (!active) return;
        const message = cause instanceof Error ? cause.message : "Compare invite not available.";
        setError(message);
        captureError(cause, {
          route: "/compare/mbti/[inviteId]",
          inviteId,
          stage: "load_compare_invite",
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
  }, [inviteId, locale]);

  const primaryCtaHref = useMemo(() => {
    if (!viewModel.primaryCtaPath) {
      return undefined;
    }

    return buildAugmentedPath(viewModel.primaryCtaPath, {
      share_id: viewModel.shareId,
      compare_invite_id: viewModel.inviteId || inviteId,
      entrypoint: "compare_invite_page",
      landing_path: landingPath,
      referrer: pageReferrer,
      compare_intent: true,
    });
  }, [inviteId, landingPath, pageReferrer, viewModel.inviteId, viewModel.primaryCtaPath, viewModel.shareId]);

  useEffect(() => {
    if (!relationshipSync || impressionTrackedRef.current) {
      return;
    }

    impressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-compare-page",
      scale_code: "MBTI",
      visual_kind: "dyadic_relationship_sync",
      ctaKey: "relationship_sync_view",
      continueTarget: relationshipSync.actionPrompt?.key || "relationship_sync_review",
      entrySurface: "compare_invite_page",
      relationshipScope: relationshipSync.scope,
      relationshipFingerprint: relationshipSync.fingerprint,
      relationshipContractVersion: relationshipSync.contractVersion,
      subjectJoinMode: relationshipSync.subjectJoinMode,
      graphScope: dyadicGraph?.scope || "",
      graphFingerprint: dyadicGraph?.fingerprint || relationshipSync.fingerprint,
      graphContractVersion: dyadicGraph?.contractVersion || relationshipSync.contractVersion,
      supportingScales: dyadicGraph?.supportingScales.join("|") || "MBTI",
      locale,
    });
  }, [dyadicGraph, locale, relationshipSync]);

  const handleRelationshipSectionClick = (sectionKey: string) => {
    trackEvent("ui_card_interaction", {
      slug: "mbti-compare-page",
      scale_code: "MBTI",
      visual_kind: "dyadic_relationship_section",
      interaction: "click",
      sectionKey,
      ctaKey: sectionKey,
      continueTarget: "relationship_sync_section",
      entrySurface: "compare_invite_page",
      relationshipScope: relationshipSync?.scope || "",
      relationshipFingerprint: relationshipSync?.fingerprint || "",
      relationshipContractVersion: relationshipSync?.contractVersion || "",
      subjectJoinMode: relationshipSync?.subjectJoinMode || "",
      graphScope: dyadicGraph?.scope || "",
      graphFingerprint: dyadicGraph?.fingerprint || relationshipSync?.fingerprint || "",
      graphContractVersion: dyadicGraph?.contractVersion || relationshipSync?.contractVersion || "",
      supportingScales: dyadicGraph?.supportingScales.join("|") || "MBTI",
      locale,
    });
  };

  const handleActionPromptClick = (actionKey: string) => {
    trackEvent("ui_card_interaction", {
      slug: "mbti-compare-page",
      scale_code: "MBTI",
      visual_kind: "dyadic_action_prompt",
      interaction: "click",
      actionKey,
      ctaKey: actionKey,
      continueTarget: actionKey || "relationship_sync_next_step",
      entrySurface: "compare_invite_page",
      relationshipScope: relationshipSync?.scope || "",
      relationshipFingerprint: relationshipSync?.fingerprint || "",
      relationshipContractVersion: relationshipSync?.contractVersion || "",
      subjectJoinMode: relationshipSync?.subjectJoinMode || "",
      graphScope: dyadicGraph?.scope || "",
      graphFingerprint: dyadicGraph?.fingerprint || relationshipSync?.fingerprint || "",
      graphContractVersion: dyadicGraph?.contractVersion || relationshipSync?.contractVersion || "",
      supportingScales: dyadicGraph?.supportingScales.join("|") || "MBTI",
      locale,
    });
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
        <Alert>{error ?? "Compare invite not available."}</Alert>
      </main>
    );
  }

  return (
    <MbtiCompareInviteView
      locale={locale}
      viewModel={viewModel}
      primaryCtaHref={primaryCtaHref}
      onRelationshipSectionClick={handleRelationshipSectionClick}
      onActionPromptClick={handleActionPromptClick}
    />
  );
}
