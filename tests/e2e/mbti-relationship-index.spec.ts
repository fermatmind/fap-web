import { expect, test } from "@playwright/test";
import type { MbtiRelationshipIndexResponse, PrivateMbtiRelationshipResponse } from "@/lib/api/v0_3";

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
          participant_role: "invitee",
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

function createPrivateFixture(inviteId: string): PrivateMbtiRelationshipResponse {
  return {
    ok: true,
    invite_id: inviteId,
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
      journey_state: "practice_started",
      progress_state: "warming_up",
      dyadic_action_focus_key: "dyadic_action.name_decision_rule",
      completed_dyadic_action_keys: [],
      recommended_next_dyadic_pulse_keys: ["dyadic_pulse.start_private_practice"],
      revisit_reorder_reason: "activate_first_dyadic_step",
      last_dyadic_pulse_signal: "continue_dyadic_action",
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
      nodes: [],
      edges: [],
    },
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fm_auth_token", "fm_relationship_index_test_123456");
  });
});

test("relationship index page renders buckets and resumes into private detail", async ({ page }) => {
  await page.route("**/api/v0.3/me/relationships/mbti", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createIndexFixture()),
    });
  });

  await page.route("**/api/v0.3/me/relationships/mbti/invite-ready", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createPrivateFixture("invite-ready")),
    });
  });

  await page.goto("/en/relationships/mbti");

  await expect(page.getByTestId("mbti-relationship-index")).toBeVisible();
  await expect(page.getByTestId("mbti-relationship-index-bucket-ready_to_continue")).toContainText("Ready to continue");
  await expect(page.getByTestId("mbti-relationship-index-bucket-needs_consent_refresh")).toContainText("Refresh required");

  await page.getByTestId("mbti-relationship-index-resume").first().click();

  await expect(page).toHaveURL(/\/en\/relationships\/mbti\/invite-ready$/);
  await expect(page.getByTestId("mbti-private-relationship-view")).toBeVisible();
});

test("relationship index page shows the empty revisit state", async ({ page }) => {
  await page.route("**/api/v0.3/me/relationships/mbti", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        relationship_index_v1: {
          relationship_index_version: "relationship.index.v1",
          relationship_index_fingerprint: "relationship-index-empty",
          index_scope: "private_relationship_index",
          items: [],
        },
      }),
    });
  });

  await page.goto("/en/relationships/mbti");

  await expect(page.getByTestId("mbti-relationship-index-empty")).toBeVisible();
});
