import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PrivateRelationshipClient from "@/app/(localized)/[locale]/(app)/relationships/mbti/[inviteId]/PrivateRelationshipClient";
import type { MbtiCompareParticipantRaw, PrivateMbtiRelationshipResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  getPrivateMbtiRelationship: vi.fn(),
  mutatePrivateMbtiRelationshipConsent: vi.fn(),
  mutatePrivateMbtiRelationshipJourney: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getPrivateMbtiRelationship: hoisted.getPrivateMbtiRelationship,
    mutatePrivateMbtiRelationshipConsent: hoisted.mutatePrivateMbtiRelationshipConsent,
    mutatePrivateMbtiRelationshipJourney: hoisted.mutatePrivateMbtiRelationshipJourney,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createSummaryFixture({
  shareId,
  canonicalTypeCode,
  displayType,
  typeName,
  subtitle,
}: {
  shareId: string;
  canonicalTypeCode: string;
  displayType: string;
  typeName: string;
  subtitle: string;
}): MbtiCompareParticipantRaw {
  return {
    share_id: shareId,
    mbti_public_projection_v1: {
      canonical_type_code: canonicalTypeCode,
      display_type: displayType,
      runtime_type_code: displayType,
      variant_code: displayType.split("-")[1] ?? null,
      profile: {
        type_name: typeName,
        rarity: {
          label: "Around 6-8%",
        },
        keywords: ["Warm"],
      },
      summary_card: {
        title: typeName,
        subtitle,
        summary: `${typeName} private summary`,
        public_tags: ["Warm"],
      },
      dimensions: [
        { code: "EI", label: "E / I", pct: 61, side_label: "Extraversion", state: "Expressive" },
      ],
    },
  };
}

function createPrivateRelationshipFixture(): PrivateMbtiRelationshipResponse {
  return {
    ok: true,
    invite_id: "invite-private-123",
    share_id: "share-123",
    scale_code: "MBTI",
    locale: "en",
    status: "purchased",
    private_relationship_v1: {
      relationship_scope: "private_relationship_protected",
      relationship_contract_version: "private.relationship.v1",
      relationship_fingerprint_version: "private.relationship.fp.v1",
      relationship_fingerprint: "private-relationship-fingerprint",
      access_state: "private_access_ready",
      subject_join_mode: "share_compare_invite_purchased",
      participant_role: "inviter",
      inviter_summary: createSummaryFixture({
        shareId: "share-123",
        canonicalTypeCode: "ENFP",
        displayType: "ENFP-T",
        typeName: "Campaigner",
        subtitle: "Warm and imaginative",
      }),
      invitee_summary: createSummaryFixture({
        shareId: "share-123",
        canonicalTypeCode: "INFJ",
        displayType: "INFJ-A",
        typeName: "Advocate",
        subtitle: "Quietly focused and structured",
      }),
      shared_count: 2,
      diverging_count: 2,
      friction_keys: ["friction.energy_mismatch"],
      complement_keys: ["complement.heart_head_balance"],
      communication_bridge_keys: ["communication_bridge.energy_pacing"],
      decision_tension_keys: ["decision_tension.logic_vs_empathy"],
      stress_interplay_keys: ["stress_interplay.shared_recovery_rhythm"],
      overview: {
        title: "Private relationship sync",
        summary: "A protected dyadic summary only visible to participants.",
      },
      private_sync_sections: [
        {
          key: "communication_bridge",
          title: "Communication bridge",
          summary: "Name the response pace.",
          bullets: ["Say clearly whether you need to think first or speak first."],
        },
      ],
      private_action_prompt: {
        key: "dyadic_action.name_decision_rule",
        title: "Name the decision rule first",
        summary: "Say what each person is optimizing for before debating the answer.",
        cta_label: "Open my MBTI reports",
        cta_path: "/en/result/attempt-001",
      },
    },
    dyadic_consent_v1: {
      consent_scope: "private_relationship_protected",
      access_state: "private_access_ready",
      consent_state: "purchased",
      consent_fingerprint: "consent-fingerprint-001",
      consent_refresh_required: false,
      private_relationship_access_version: "private.relationship.access.v1",
      revocation_state: "active",
      expiry_state: "active",
      subject_join_mode: "share_compare_invite_purchased",
      accepted_at: "2026-03-21T00:00:00.000Z",
      completed_at: "2026-03-21T00:05:00.000Z",
      purchased_at: "2026-03-21T00:10:00.000Z",
      consent_artifact_version: "dyadic.consent.v1",
    },
    private_relationship_journey_v1: {
      journey_contract_version: "private_relationship_journey.v1",
      journey_fingerprint_version: "private_relationship_journey.fp.v1",
      journey_fingerprint: "journey-fingerprint-001",
      journey_scope: "private_relationship_revisit",
      journey_state: "ready_for_first_step",
      progress_state: "not_started",
      dyadic_action_focus_key: "dyadic_action.name_decision_rule",
      completed_dyadic_action_keys: [],
      recommended_next_dyadic_pulse_keys: ["dyadic_pulse.start_private_practice"],
      revisit_reorder_reason: "activate_first_dyadic_step",
      last_dyadic_pulse_signal: "ready_for_first_step",
    },
    dyadic_pulse_check_v1: {
      pulse_contract_version: "dyadic_pulse_check.v1",
      pulse_state: "start_shared_practice",
      pulse_prompt_keys: ["dyadic_pulse.start_private_practice"],
      pulse_feedback_mode: "dyadic_event_feedback",
      next_pulse_target: "dyadic_action.name_decision_rule",
    },
    dyadic_graph_v1: {
      graph_contract_version: "dyadic.graph.v1",
      graph_scope: "private_relationship_protected",
      graph_fingerprint: "private-graph-fingerprint",
      root_node: "private_relationship",
      supporting_scales: ["MBTI"],
      nodes: [
        {
          id: "private_relationship",
          kind: "private_relationship",
          title: "Private relationship sync",
          summary: "A protected dyadic summary only visible to participants.",
        },
      ],
      edges: [],
    },
  };
}

describe("MBTI private relationship consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.mutatePrivateMbtiRelationshipConsent.mockResolvedValue(createPrivateRelationshipFixture());
    hoisted.mutatePrivateMbtiRelationshipJourney.mockResolvedValue(createPrivateRelationshipFixture());
  });

  it("renders protected relationship summary and tracks impression and CTA click", async () => {
    hoisted.getPrivateMbtiRelationship.mockResolvedValue(createPrivateRelationshipFixture());

    render(<PrivateRelationshipClient locale="en" inviteId="invite-private-123" />);

    await screen.findByTestId("mbti-private-relationship-view");

    expect(screen.getByTestId("mbti-private-access-badge")).toHaveTextContent("Shared privately");
    expect(screen.getByTestId("mbti-private-consent-badge")).toHaveTextContent("purchased");
    expect(screen.getByTestId("mbti-private-inviter-card")).toHaveTextContent("Campaigner");
    expect(screen.getByTestId("mbti-private-invitee-card")).toHaveTextContent("Advocate");
    expect(screen.getByTestId("mbti-private-relationship-card")).toHaveTextContent("Private relationship sync");
    expect(screen.getByTestId("mbti-private-action-card")).toHaveTextContent("Name the decision rule first");
    expect(screen.getByTestId("mbti-private-consent-card")).toHaveTextContent("Consent version");
    expect(screen.getByTestId("mbti-private-consent-fingerprint")).toHaveTextContent("consent-fingerprint-001");
    expect(screen.getByTestId("mbti-private-journey-card")).toHaveTextContent("Relationship journey");
    expect(screen.getByTestId("mbti-private-journey-state")).toHaveTextContent("Ready for next step");
    expect(screen.getByTestId("mbti-private-pulse-card")).toHaveTextContent("Dyadic pulse check");
    expect(screen.getByTestId("mbti-private-pulse-state")).toHaveTextContent("Start shared practice");

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          relationshipScope: "private_relationship_protected",
          relationshipFingerprint: "private-relationship-fingerprint",
          relationshipContractVersion: "private.relationship.v1",
          consentScope: "private_relationship_protected",
          consentState: "purchased",
          consentFingerprint: "consent-fingerprint-001",
          consentArtifactVersion: "dyadic.consent.v1",
          privateRelationshipAccessVersion: "private.relationship.access.v1",
          revocationState: "active",
          expiryState: "active",
          accessState: "private_access_ready",
          journeyContractVersion: "private_relationship_journey.v1",
          journeyFingerprint: "journey-fingerprint-001",
          journeyScope: "private_relationship_revisit",
          journeyState: "ready_for_first_step",
          progressState: "not_started",
          dyadicActionFocusKey: "dyadic_action.name_decision_rule",
          pulseContractVersion: "dyadic_pulse_check.v1",
          pulseState: "start_shared_practice",
        })
      );
    });

    fireEvent.click(screen.getByTestId("mbti-private-action-link"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "private_relationship_action_prompt",
        actionKey: "dyadic_action.name_decision_rule",
        consentState: "purchased",
        accessState: "private_access_ready",
      })
    );
  });

  it("supports dyadic journey mutation and re-renders pulse-aware progression", async () => {
    const progressedFixture = createPrivateRelationshipFixture();
    progressedFixture.private_relationship_journey_v1 = {
      ...progressedFixture.private_relationship_journey_v1,
      journey_state: "practice_started",
      progress_state: "warming_up",
      completed_dyadic_action_keys: ["dyadic_action.name_decision_rule"],
      recommended_next_dyadic_pulse_keys: ["dyadic_pulse.repeat_shared_action"],
      revisit_reorder_reason: "activate_first_dyadic_step",
      last_dyadic_pulse_signal: "continue_dyadic_action",
    };
    progressedFixture.dyadic_pulse_check_v1 = {
      ...progressedFixture.dyadic_pulse_check_v1,
      pulse_state: "repeat_shared_practice",
      pulse_prompt_keys: ["dyadic_pulse.repeat_shared_action"],
    };

    hoisted.getPrivateMbtiRelationship.mockResolvedValue(createPrivateRelationshipFixture());
    hoisted.mutatePrivateMbtiRelationshipJourney.mockResolvedValue(progressedFixture);

    render(<PrivateRelationshipClient locale="en" inviteId="invite-private-123" />);

    await screen.findByTestId("mbti-private-journey-continue");
    fireEvent.click(screen.getByTestId("mbti-private-journey-continue"));

    await waitFor(() => {
      expect(hoisted.mutatePrivateMbtiRelationshipJourney).toHaveBeenCalledWith({
        inviteId: "invite-private-123",
        action: "continue_dyadic_action",
        locale: "en",
      });
    });

    expect(screen.getByTestId("mbti-private-journey-state")).toHaveTextContent("Practice started");
    expect(screen.getByTestId("mbti-private-progress-state")).toHaveTextContent("Warming up");
    expect(screen.getByTestId("mbti-private-completed-action-dyadic_action.name_decision_rule")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-private-pulse-state")).toHaveTextContent("Repeat shared practice");
  });

  it("supports revoke mutation and re-renders a restricted lifecycle state", async () => {
    const revokedFixture = createPrivateRelationshipFixture();
    revokedFixture.private_relationship_v1 = {
      ...revokedFixture.private_relationship_v1,
      access_state: "private_access_revoked",
      overview: {
        title: "Private relationship access has tightened",
        summary: "One participant revoked private relationship access.",
      },
      private_sync_sections: [],
      private_action_prompt: null,
    };
    revokedFixture.dyadic_consent_v1 = {
      ...revokedFixture.dyadic_consent_v1,
      access_state: "private_access_revoked",
      revocation_state: "revoked_by_subject",
    };
    revokedFixture.private_relationship_journey_v1 = {
      ...revokedFixture.private_relationship_journey_v1,
      journey_state: "access_revoked",
      progress_state: "restricted",
      completed_dyadic_action_keys: [],
      recommended_next_dyadic_pulse_keys: [],
      last_dyadic_pulse_signal: "private_access_revoked",
    };
    revokedFixture.dyadic_pulse_check_v1 = null;
    hoisted.getPrivateMbtiRelationship.mockResolvedValue(createPrivateRelationshipFixture());
    hoisted.mutatePrivateMbtiRelationshipConsent.mockResolvedValue(revokedFixture);

    render(<PrivateRelationshipClient locale="en" inviteId="invite-private-123" />);

    await screen.findByTestId("mbti-private-consent-revoke");
    fireEvent.click(screen.getByTestId("mbti-private-consent-revoke"));

    await waitFor(() => {
      expect(hoisted.mutatePrivateMbtiRelationshipConsent).toHaveBeenCalledWith({
        inviteId: "invite-private-123",
        action: "revoke_access",
        locale: "en",
      });
    });

    await screen.findByTestId("mbti-private-revocation-badge");
    expect(screen.getByTestId("mbti-private-access-badge")).toHaveTextContent("Private access revoked");
    expect(screen.getByTestId("mbti-private-revocation-badge")).toHaveTextContent("revoked_by_subject");
    expect(screen.queryByTestId("mbti-private-action-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-private-journey-state")).toHaveTextContent("Private access revoked");
    expect(screen.queryByTestId("mbti-private-pulse-card")).not.toBeInTheDocument();
  });

  it("renders an access-safe error when the user is not a participant", async () => {
    hoisted.getPrivateMbtiRelationship.mockRejectedValue(new Error("This account cannot access that private relationship."));

    render(<PrivateRelationshipClient locale="en" inviteId="invite-private-404" />);

    await screen.findByText("This account cannot access that private relationship.");
    expect(screen.queryByTestId("mbti-private-relationship-view")).not.toBeInTheDocument();
  });
});
