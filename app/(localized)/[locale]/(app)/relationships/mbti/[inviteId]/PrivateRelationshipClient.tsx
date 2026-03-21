"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import MbtiPrivateRelationshipView from "@/components/compare/mbti/MbtiPrivateRelationshipView";
import { trackEvent } from "@/lib/analytics";
import { ApiError } from "@/lib/api-client";
import {
  getPrivateMbtiRelationship,
  type PrivateMbtiRelationshipResponse,
} from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { buildPrivateMbtiRelationshipViewModel } from "@/lib/mbti/privateRelationship";
import { captureError } from "@/lib/observability/sentry";

export default function PrivateRelationshipClient({
  locale,
  inviteId,
}: {
  locale: Locale;
  inviteId: string;
}) {
  const [data, setData] = useState<PrivateMbtiRelationshipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const impressionTrackedRef = useRef(false);
  const viewModel = useMemo(() => buildPrivateMbtiRelationshipViewModel(data), [data]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPrivateMbtiRelationship({
          inviteId,
          locale,
        });
        if (!active) {
          return;
        }
        setData(response);
      } catch (cause) {
        if (!active) {
          return;
        }

        const resolvedError = cause instanceof ApiError ? cause : null;
        setError(
          resolvedError?.status === 404
            ? locale === "zh"
              ? "当前账号无法访问这段私密关系洞察。"
              : "This account cannot access that private relationship."
            : cause instanceof Error
              ? cause.message
              : locale === "zh"
                ? "私密关系洞察暂时不可用。"
                : "Private relationship is not available."
        );
        captureError(cause, {
          route: "/(app)/relationships/mbti/[inviteId]",
          inviteId,
          stage: "load_private_relationship",
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

  useEffect(() => {
    if (!viewModel.relationship || !viewModel.consent || impressionTrackedRef.current) {
      return;
    }

    impressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-private-relationship-page",
      scale_code: "MBTI",
      visual_kind: "private_relationship_surface",
      continueTarget: viewModel.relationship.actionPrompt?.key || "private_relationship_review",
      entrySurface: "private_relationship_page",
      relationshipScope: viewModel.relationship.scope,
      relationshipFingerprint: viewModel.relationship.fingerprint,
      relationshipContractVersion: viewModel.relationship.contractVersion,
      subjectJoinMode: viewModel.relationship.subjectJoinMode,
      participantRole: viewModel.relationship.participantRole,
      graphScope: viewModel.dyadicGraph?.scope || "",
      graphFingerprint: viewModel.dyadicGraph?.fingerprint || "",
      graphContractVersion: viewModel.dyadicGraph?.contractVersion || "",
      supportingScales: viewModel.dyadicGraph?.supportingScales.join("|") || "MBTI",
      consentScope: viewModel.consent.scope,
      consentState: viewModel.consent.consentState,
      accessState: viewModel.relationship.accessState || viewModel.consent.accessState,
      locale,
    });
  }, [locale, viewModel.consent, viewModel.dyadicGraph, viewModel.relationship]);

  const handleSectionClick = (sectionKey: string) => {
    trackEvent("ui_card_interaction", {
      slug: "mbti-private-relationship-page",
      scale_code: "MBTI",
      visual_kind: "private_relationship_section",
      interaction: "click",
      sectionKey,
      ctaKey: sectionKey,
      continueTarget: "private_relationship_section",
      entrySurface: "private_relationship_page",
      relationshipScope: viewModel.relationship?.scope || "",
      relationshipFingerprint: viewModel.relationship?.fingerprint || "",
      relationshipContractVersion: viewModel.relationship?.contractVersion || "",
      subjectJoinMode: viewModel.relationship?.subjectJoinMode || "",
      participantRole: viewModel.relationship?.participantRole || "",
      consentScope: viewModel.consent?.scope || "",
      consentState: viewModel.consent?.consentState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
      locale,
    });
  };

  const handleActionPromptClick = (actionKey: string) => {
    trackEvent("ui_card_interaction", {
      slug: "mbti-private-relationship-page",
      scale_code: "MBTI",
      visual_kind: "private_relationship_action_prompt",
      interaction: "click",
      actionKey,
      ctaKey: actionKey,
      continueTarget: actionKey || "private_relationship_next_step",
      entrySurface: "private_relationship_page",
      relationshipScope: viewModel.relationship?.scope || "",
      relationshipFingerprint: viewModel.relationship?.fingerprint || "",
      relationshipContractVersion: viewModel.relationship?.contractVersion || "",
      subjectJoinMode: viewModel.relationship?.subjectJoinMode || "",
      participantRole: viewModel.relationship?.participantRole || "",
      consentScope: viewModel.consent?.scope || "",
      consentState: viewModel.consent?.consentState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
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

  if (error || !data || !viewModel.relationship) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert>{error ?? (locale === "zh" ? "私密关系洞察暂时不可用。" : "Private relationship is not available.")}</Alert>
      </main>
    );
  }

  return (
    <MbtiPrivateRelationshipView
      locale={locale}
      viewModel={viewModel}
      onSectionClick={handleSectionClick}
      onActionPromptClick={handleActionPromptClick}
    />
  );
}
