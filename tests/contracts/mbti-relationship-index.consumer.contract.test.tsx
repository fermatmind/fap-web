import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelationshipIndexClient from "@/app/(localized)/[locale]/(app)/relationships/mbti/RelationshipIndexClient";
import type { MbtiRelationshipIndexResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  getPrivateMbtiRelationshipIndex: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getPrivateMbtiRelationshipIndex: hoisted.getPrivateMbtiRelationshipIndex,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function clickWithoutNavigation(element: HTMLElement) {
  element.addEventListener("click", (event) => event.preventDefault(), { once: true });
  fireEvent.click(element);
}

function createIndexFixture(): MbtiRelationshipIndexResponse {
  return {
    ok: true,
    scale_code: "MBTI",
    relationship_index_v1: {
      relationship_index_version: "relationship.index.v1",
      relationship_index_fingerprint: "relationship-index-fingerprint-001",
      index_scope: "private_relationship_index",
      items: [
        {
          invite_id: "invite-ready",
          relationship_scope: "private_relationship_protected",
          access_state: "private_access_ready",
          consent_state: "purchased",
          journey_state: "practice_started",
          progress_state: "warming_up",
          participant_role: "inviter",
          entry_summary: {
            title: "Ready relationship",
            summary: "Continue the next shared step.",
            badge_label: "Ready to continue",
            badge_key: "ready_to_continue",
          },
          resume_target: "/en/relationships/mbti/invite-ready",
          revisit_priority_keys: ["ready_to_continue", "practice_started"],
          last_dyadic_pulse_signal: "continue_dyadic_action",
          updated_at: "2026-03-21T09:00:00.000Z",
          relationship_resume_v1: {
            resume_version: "relationship.resume.v1",
            resume_target: "/en/relationships/mbti/invite-ready",
            continue_label: "Continue relationship",
            resume_reason: "activate_first_dyadic_step",
            revisit_reorder_reason: "activate_first_dyadic_step",
            relationship_entry_keys: ["ready_to_continue"],
          },
        },
        {
          invite_id: "invite-refresh",
          relationship_scope: "private_relationship_protected",
          access_state: "private_access_expired",
          consent_state: "purchased",
          journey_state: "revisit_after_consent_refresh",
          progress_state: "restricted",
          participant_role: "inviter",
          entry_summary: {
            title: "Refresh relationship",
            summary: "Refresh private access before continuing.",
            badge_label: "Refresh required",
            badge_key: "needs_consent_refresh",
          },
          resume_target: "/en/relationships/mbti/invite-refresh",
          revisit_priority_keys: ["needs_consent_refresh", "revisit_after_consent_refresh"],
          last_dyadic_pulse_signal: "refresh_private_access",
          updated_at: "2026-03-21T08:00:00.000Z",
          relationship_resume_v1: {
            resume_version: "relationship.resume.v1",
            resume_target: "/en/relationships/mbti/invite-refresh",
            continue_label: "Refresh and continue",
            resume_reason: "refresh_private_access",
            revisit_reorder_reason: "refresh_private_access",
            relationship_entry_keys: ["needs_consent_refresh"],
          },
        },
      ],
    },
  };
}

describe("MBTI relationship index consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders backend-owned relationship index buckets and tracks exposure and resume click", async () => {
    hoisted.getPrivateMbtiRelationshipIndex.mockResolvedValue(createIndexFixture());

    render(<RelationshipIndexClient locale="en" />);

    await screen.findByTestId("mbti-relationship-index");

    expect(screen.getByTestId("mbti-relationship-index-bucket-ready_to_continue")).toHaveTextContent("Ready to continue");
    expect(screen.getByTestId("mbti-relationship-index-bucket-needs_consent_refresh")).toHaveTextContent("Refresh required");
    expect(screen.getAllByTestId("mbti-relationship-index-card")).toHaveLength(2);
    expect(screen.getAllByTestId("mbti-relationship-index-resume")[0]).toHaveAttribute("href", "/en/relationships/mbti/invite-ready");

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          relationshipIndexVersion: "relationship.index.v1",
          relationshipIndexFingerprint: "relationship-index-fingerprint-001",
          indexScope: "private_relationship_index",
          relationshipScope: "private_relationship_protected",
          accessState: "private_access_ready",
          consentState: "purchased",
          journeyState: "practice_started",
          progressState: "warming_up",
          participantRole: "inviter",
        })
      );
    });

    clickWithoutNavigation(screen.getAllByTestId("mbti-relationship-index-resume")[0]);

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "relationship_index_resume",
        relationshipIndexVersion: "relationship.index.v1",
        relationshipIndexFingerprint: "relationship-index-fingerprint-001",
        indexScope: "private_relationship_index",
        continueTarget: "/en/relationships/mbti/invite-ready",
        accessState: "private_access_ready",
        consentState: "purchased",
        journeyState: "practice_started",
      })
    );
  });

  it("renders the empty relationship hub state", async () => {
    hoisted.getPrivateMbtiRelationshipIndex.mockResolvedValue({
      ok: true,
      scale_code: "MBTI",
      relationship_index_v1: {
        relationship_index_version: "relationship.index.v1",
        relationship_index_fingerprint: "relationship-index-empty",
        index_scope: "private_relationship_index",
        items: [],
      },
    });

    render(<RelationshipIndexClient locale="en" />);

    await screen.findByTestId("mbti-relationship-index-empty");

    expect(screen.getByTestId("mbti-relationship-index-empty")).toHaveTextContent("There are no private relationship insights to revisit yet.");
  });
});
