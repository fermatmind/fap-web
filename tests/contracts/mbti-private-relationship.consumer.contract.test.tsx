import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PrivateRelationshipClient from "@/app/(localized)/[locale]/(app)/relationships/mbti/[inviteId]/PrivateRelationshipClient";
import type { MbtiCompareParticipantRaw, PrivateMbtiRelationshipResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  getPrivateMbtiRelationship: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getPrivateMbtiRelationship: hoisted.getPrivateMbtiRelationship,
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
      revocation_state: "not_supported_yet",
      expiry_state: "not_enforced_yet",
      subject_join_mode: "share_compare_invite_purchased",
      accepted_at: "2026-03-21T00:00:00.000Z",
      completed_at: "2026-03-21T00:05:00.000Z",
      purchased_at: "2026-03-21T00:10:00.000Z",
      consent_artifact_version: "dyadic.consent.v1",
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

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          relationshipScope: "private_relationship_protected",
          relationshipFingerprint: "private-relationship-fingerprint",
          relationshipContractVersion: "private.relationship.v1",
          consentScope: "private_relationship_protected",
          consentState: "purchased",
          accessState: "private_access_ready",
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

  it("renders an access-safe error when the user is not a participant", async () => {
    hoisted.getPrivateMbtiRelationship.mockRejectedValue(new Error("This account cannot access that private relationship."));

    render(<PrivateRelationshipClient locale="en" inviteId="invite-private-404" />);

    await screen.findByText("This account cannot access that private relationship.");
    expect(screen.queryByTestId("mbti-private-relationship-view")).not.toBeInTheDocument();
  });
});
