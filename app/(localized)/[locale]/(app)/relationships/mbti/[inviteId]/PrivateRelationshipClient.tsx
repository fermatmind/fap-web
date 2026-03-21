"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import MbtiPrivateRelationshipView from "@/components/compare/mbti/MbtiPrivateRelationshipView";
import { trackEvent } from "@/lib/analytics";
import { ApiError } from "@/lib/api-client";
import {
  getPrivateMbtiRelationship,
  mutatePrivateMbtiRelationshipConsent,
  mutatePrivateMbtiRelationshipJourney,
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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "revoke_access" | "acknowledge_refresh" | "continue_dyadic_action" | "acknowledge_dyadic_pulse" | null
  >(null);
  const impressionTrackedRef = useRef(false);
  const viewModel = useMemo(() => buildPrivateMbtiRelationshipViewModel(data), [data]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      setMutationError(null);

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
      consentFingerprint: viewModel.consent.consentFingerprint,
      consentArtifactVersion: viewModel.consent.contractVersion,
      consentRefreshRequired: viewModel.consent.consentRefreshRequired,
      privateRelationshipAccessVersion: viewModel.consent.privateRelationshipAccessVersion,
      revocationState: viewModel.consent.revocationState,
      expiryState: viewModel.consent.expiryState,
      accessState: viewModel.relationship.accessState || viewModel.consent.accessState,
      journeyContractVersion: viewModel.journey?.contractVersion || "",
      journeyFingerprint: viewModel.journey?.fingerprint || "",
      journeyScope: viewModel.journey?.scope || "",
      journeyState: viewModel.journey?.journeyState || "",
      progressState: viewModel.journey?.progressState || "",
      dyadicActionFocusKey: viewModel.journey?.dyadicActionFocusKey || "",
      completedDyadicActionKeys: viewModel.journey?.completedDyadicActionKeys.join("|") || "",
      recommendedNextDyadicPulseKeys: viewModel.journey?.recommendedNextDyadicPulseKeys.join("|") || "",
      revisitReorderReason: viewModel.journey?.revisitReorderReason || "",
      pulseContractVersion: viewModel.pulseCheck?.contractVersion || "",
      pulseState: viewModel.pulseCheck?.pulseState || "",
      pulsePromptKeys: viewModel.pulseCheck?.pulsePromptKeys.join("|") || "",
      locale,
    });
  }, [locale, viewModel.consent, viewModel.dyadicGraph, viewModel.journey, viewModel.pulseCheck, viewModel.relationship]);

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
      consentFingerprint: viewModel.consent?.consentFingerprint || "",
      consentArtifactVersion: viewModel.consent?.contractVersion || "",
      consentRefreshRequired: viewModel.consent?.consentRefreshRequired || false,
      privateRelationshipAccessVersion: viewModel.consent?.privateRelationshipAccessVersion || "",
      revocationState: viewModel.consent?.revocationState || "",
      expiryState: viewModel.consent?.expiryState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
      journeyContractVersion: viewModel.journey?.contractVersion || "",
      journeyFingerprint: viewModel.journey?.fingerprint || "",
      journeyScope: viewModel.journey?.scope || "",
      journeyState: viewModel.journey?.journeyState || "",
      progressState: viewModel.journey?.progressState || "",
      dyadicActionFocusKey: viewModel.journey?.dyadicActionFocusKey || "",
      completedDyadicActionKeys: viewModel.journey?.completedDyadicActionKeys.join("|") || "",
      recommendedNextDyadicPulseKeys: viewModel.journey?.recommendedNextDyadicPulseKeys.join("|") || "",
      revisitReorderReason: viewModel.journey?.revisitReorderReason || "",
      pulseContractVersion: viewModel.pulseCheck?.contractVersion || "",
      pulseState: viewModel.pulseCheck?.pulseState || "",
      pulsePromptKeys: viewModel.pulseCheck?.pulsePromptKeys.join("|") || "",
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
      consentFingerprint: viewModel.consent?.consentFingerprint || "",
      consentArtifactVersion: viewModel.consent?.contractVersion || "",
      consentRefreshRequired: viewModel.consent?.consentRefreshRequired || false,
      privateRelationshipAccessVersion: viewModel.consent?.privateRelationshipAccessVersion || "",
      revocationState: viewModel.consent?.revocationState || "",
      expiryState: viewModel.consent?.expiryState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
      journeyContractVersion: viewModel.journey?.contractVersion || "",
      journeyFingerprint: viewModel.journey?.fingerprint || "",
      journeyScope: viewModel.journey?.scope || "",
      journeyState: viewModel.journey?.journeyState || "",
      progressState: viewModel.journey?.progressState || "",
      dyadicActionFocusKey: viewModel.journey?.dyadicActionFocusKey || "",
      completedDyadicActionKeys: viewModel.journey?.completedDyadicActionKeys.join("|") || "",
      recommendedNextDyadicPulseKeys: viewModel.journey?.recommendedNextDyadicPulseKeys.join("|") || "",
      revisitReorderReason: viewModel.journey?.revisitReorderReason || "",
      pulseContractVersion: viewModel.pulseCheck?.contractVersion || "",
      pulseState: viewModel.pulseCheck?.pulseState || "",
      pulsePromptKeys: viewModel.pulseCheck?.pulsePromptKeys.join("|") || "",
      locale,
    });
  };

  const handleConsentAction = async (action: "revoke_access" | "acknowledge_refresh") => {
    setPendingAction(action);
    setMutationError(null);

    trackEvent("ui_card_interaction", {
      slug: "mbti-private-relationship-page",
      scale_code: "MBTI",
      visual_kind: "private_relationship_consent_action",
      interaction: "click",
      actionKey: action,
      ctaKey: action,
      continueTarget: action,
      entrySurface: "private_relationship_page",
      relationshipScope: viewModel.relationship?.scope || "",
      relationshipFingerprint: viewModel.relationship?.fingerprint || "",
      relationshipContractVersion: viewModel.relationship?.contractVersion || "",
      subjectJoinMode: viewModel.relationship?.subjectJoinMode || "",
      participantRole: viewModel.relationship?.participantRole || "",
      consentScope: viewModel.consent?.scope || "",
      consentState: viewModel.consent?.consentState || "",
      consentFingerprint: viewModel.consent?.consentFingerprint || "",
      consentArtifactVersion: viewModel.consent?.contractVersion || "",
      consentRefreshRequired: viewModel.consent?.consentRefreshRequired || false,
      privateRelationshipAccessVersion: viewModel.consent?.privateRelationshipAccessVersion || "",
      revocationState: viewModel.consent?.revocationState || "",
      expiryState: viewModel.consent?.expiryState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
      journeyContractVersion: viewModel.journey?.contractVersion || "",
      journeyFingerprint: viewModel.journey?.fingerprint || "",
      journeyScope: viewModel.journey?.scope || "",
      journeyState: viewModel.journey?.journeyState || "",
      progressState: viewModel.journey?.progressState || "",
      dyadicActionFocusKey: viewModel.journey?.dyadicActionFocusKey || "",
      completedDyadicActionKeys: viewModel.journey?.completedDyadicActionKeys.join("|") || "",
      recommendedNextDyadicPulseKeys: viewModel.journey?.recommendedNextDyadicPulseKeys.join("|") || "",
      revisitReorderReason: viewModel.journey?.revisitReorderReason || "",
      pulseContractVersion: viewModel.pulseCheck?.contractVersion || "",
      pulseState: viewModel.pulseCheck?.pulseState || "",
      pulsePromptKeys: viewModel.pulseCheck?.pulsePromptKeys.join("|") || "",
      locale,
    });

    try {
      const response = await mutatePrivateMbtiRelationshipConsent({
        inviteId,
        action,
        locale,
      });
      setData(response);
    } catch (cause) {
      setMutationError(
        cause instanceof Error
          ? cause.message
          : locale === "zh"
            ? "私密关系授权暂时无法更新。"
            : "Unable to update private relationship consent."
      );
      captureError(cause, {
        route: "/(app)/relationships/mbti/[inviteId]",
        inviteId,
        stage: "mutate_private_relationship_consent",
        action,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleJourneyAction = async (action: "continue_dyadic_action" | "acknowledge_dyadic_pulse") => {
    setPendingAction(action);
    setMutationError(null);

    trackEvent("ui_card_interaction", {
      slug: "mbti-private-relationship-page",
      scale_code: "MBTI",
      visual_kind: "private_relationship_journey_action",
      interaction: "click",
      actionKey: action,
      ctaKey: action,
      continueTarget: viewModel.pulseCheck?.nextPulseTarget || viewModel.journey?.dyadicActionFocusKey || action,
      entrySurface: "private_relationship_page",
      relationshipScope: viewModel.relationship?.scope || "",
      relationshipFingerprint: viewModel.relationship?.fingerprint || "",
      relationshipContractVersion: viewModel.relationship?.contractVersion || "",
      subjectJoinMode: viewModel.relationship?.subjectJoinMode || "",
      participantRole: viewModel.relationship?.participantRole || "",
      consentScope: viewModel.consent?.scope || "",
      consentState: viewModel.consent?.consentState || "",
      consentFingerprint: viewModel.consent?.consentFingerprint || "",
      consentArtifactVersion: viewModel.consent?.contractVersion || "",
      consentRefreshRequired: viewModel.consent?.consentRefreshRequired || false,
      privateRelationshipAccessVersion: viewModel.consent?.privateRelationshipAccessVersion || "",
      revocationState: viewModel.consent?.revocationState || "",
      expiryState: viewModel.consent?.expiryState || "",
      accessState: viewModel.relationship?.accessState || viewModel.consent?.accessState || "",
      journeyContractVersion: viewModel.journey?.contractVersion || "",
      journeyFingerprint: viewModel.journey?.fingerprint || "",
      journeyScope: viewModel.journey?.scope || "",
      journeyState: viewModel.journey?.journeyState || "",
      progressState: viewModel.journey?.progressState || "",
      dyadicActionFocusKey: viewModel.journey?.dyadicActionFocusKey || "",
      completedDyadicActionKeys: viewModel.journey?.completedDyadicActionKeys.join("|") || "",
      recommendedNextDyadicPulseKeys: viewModel.journey?.recommendedNextDyadicPulseKeys.join("|") || "",
      revisitReorderReason: viewModel.journey?.revisitReorderReason || "",
      pulseContractVersion: viewModel.pulseCheck?.contractVersion || "",
      pulseState: viewModel.pulseCheck?.pulseState || "",
      pulsePromptKeys: viewModel.pulseCheck?.pulsePromptKeys.join("|") || "",
      locale,
    });

    try {
      const response = await mutatePrivateMbtiRelationshipJourney({
        inviteId,
        action,
        locale,
      });
      setData(response);
    } catch (cause) {
      setMutationError(
        cause instanceof Error
          ? cause.message
          : locale === "zh"
            ? "私密关系行动状态暂时无法更新。"
            : "Unable to update private relationship journey."
      );
      captureError(cause, {
        route: "/(app)/relationships/mbti/[inviteId]",
        inviteId,
        stage: "mutate_private_relationship_journey",
        action,
      });
    } finally {
      setPendingAction(null);
    }
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
      mutationError={mutationError}
      pendingAction={pendingAction}
      onRevokeConsent={() => void handleConsentAction("revoke_access")}
      onAcknowledgeRefresh={() => void handleConsentAction("acknowledge_refresh")}
      onSectionClick={handleSectionClick}
      onActionPromptClick={handleActionPromptClick}
      onContinueJourney={() => void handleJourneyAction("continue_dyadic_action")}
      onAcknowledgePulse={() => void handleJourneyAction("acknowledge_dyadic_pulse")}
    />
  );
}
