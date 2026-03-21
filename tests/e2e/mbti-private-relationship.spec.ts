import { expect, test } from "@playwright/test";
import type { PrivateMbtiRelationshipResponse } from "@/lib/api/v0_3";

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
}) {
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

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fm_auth_token", "fm_private_relationship_test_123456");
  });
});

test("private relationship page renders protected dyadic surface", async ({ page }) => {
  const inviteId = "invite-private-001";

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createPrivateFixture(inviteId)),
    });
  });

  await page.goto(`/en/relationships/mbti/${inviteId}`);

  await expect(page.getByTestId("mbti-private-relationship-view")).toBeVisible();
  await expect(page.getByTestId("mbti-private-access-badge")).toHaveText("Shared privately");
  await expect(page.getByTestId("mbti-private-consent-badge")).toHaveText("purchased");
  await expect(page.getByTestId("mbti-private-inviter-card")).toContainText("Campaigner");
  await expect(page.getByTestId("mbti-private-invitee-card")).toContainText("Advocate");
  await expect(page.getByTestId("mbti-private-relationship-card")).toContainText("Private relationship sync");
  await expect(page.getByTestId("mbti-private-action-card")).toContainText("Name the decision rule first");
  await expect(page.getByTestId("mbti-private-consent-card")).toContainText("Consent version");
  await expect(page.getByTestId("mbti-private-consent-fingerprint")).toContainText("consent-fingerprint-001");
  await expect(page.getByTestId("mbti-private-journey-card")).toContainText("Relationship journey");
  await expect(page.getByTestId("mbti-private-pulse-card")).toContainText("Dyadic pulse check");
  await expect(page.getByTestId("mbti-private-journey-state")).toHaveText("Ready for next step");
  await expect(page.getByTestId("mbti-private-pulse-state")).toHaveText("Start shared practice");
});

test("private relationship page hides content from unauthorized users", async ({ page }) => {
  const inviteId = "invite-private-404";

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}`, async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error_code: "PRIVATE_RELATIONSHIP_NOT_FOUND",
        message: "private relationship not found.",
      }),
    });
  });

  await page.goto(`/en/relationships/mbti/${inviteId}`);

  await expect(page.getByText("This account cannot access that private relationship.")).toBeVisible();
  await expect(page.getByTestId("mbti-private-relationship-view")).toHaveCount(0);
});

test("private relationship page reflects revoke mutation and restricted access", async ({ page }) => {
  const inviteId = "invite-private-revoke";
  let revoked = false;

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}`, async (route) => {
    const payload = createPrivateFixture(inviteId);
    if (revoked) {
      payload.private_relationship_v1 = {
        ...payload.private_relationship_v1,
        access_state: "private_access_revoked",
        overview: {
          title: "Private relationship access has tightened",
          summary: "One participant revoked private relationship access.",
        },
        private_sync_sections: [],
        private_action_prompt: null,
      };
      payload.dyadic_consent_v1 = {
        ...payload.dyadic_consent_v1,
        access_state: "private_access_revoked",
        revocation_state: "revoked_by_subject",
      };
      payload.private_relationship_journey_v1 = {
        ...payload.private_relationship_journey_v1,
        journey_state: "access_revoked",
        progress_state: "restricted",
        completed_dyadic_action_keys: [],
        recommended_next_dyadic_pulse_keys: [],
        last_dyadic_pulse_signal: "private_access_revoked",
      };
      payload.dyadic_pulse_check_v1 = null;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}/consent`, async (route) => {
    revoked = true;
    const payload = createPrivateFixture(inviteId);
    payload.private_relationship_v1 = {
      ...payload.private_relationship_v1,
      access_state: "private_access_revoked",
      overview: {
        title: "Private relationship access has tightened",
        summary: "One participant revoked private relationship access.",
      },
      private_sync_sections: [],
      private_action_prompt: null,
    };
    payload.dyadic_consent_v1 = {
      ...payload.dyadic_consent_v1,
      access_state: "private_access_revoked",
      revocation_state: "revoked_by_subject",
    };
    payload.private_relationship_journey_v1 = {
      ...payload.private_relationship_journey_v1,
      journey_state: "access_revoked",
      progress_state: "restricted",
      completed_dyadic_action_keys: [],
      recommended_next_dyadic_pulse_keys: [],
      last_dyadic_pulse_signal: "private_access_revoked",
    };
    payload.dyadic_pulse_check_v1 = null;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.goto(`/en/relationships/mbti/${inviteId}`);
  await page.getByTestId("mbti-private-consent-revoke").click();

  await expect(page.getByTestId("mbti-private-access-badge")).toHaveText("Private access revoked");
  await expect(page.getByTestId("mbti-private-revocation-badge")).toHaveText("revoked_by_subject");
  await expect(page.getByTestId("mbti-private-action-card")).toHaveCount(0);
  await expect(page.getByTestId("mbti-private-journey-state")).toHaveText("Private access revoked");
  await expect(page.getByTestId("mbti-private-pulse-card")).toHaveCount(0);
});

test("private relationship page can continue the dyadic journey", async ({ page }) => {
  const inviteId = "invite-private-journey";
  let progressed = false;

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}`, async (route) => {
    const payload = createPrivateFixture(inviteId);
    if (progressed) {
      payload.private_relationship_journey_v1 = {
        ...payload.private_relationship_journey_v1,
        journey_state: "practice_started",
        progress_state: "warming_up",
        completed_dyadic_action_keys: ["dyadic_action.name_decision_rule"],
        recommended_next_dyadic_pulse_keys: ["dyadic_pulse.repeat_shared_action"],
        last_dyadic_pulse_signal: "continue_dyadic_action",
      };
      payload.dyadic_pulse_check_v1 = {
        ...payload.dyadic_pulse_check_v1,
        pulse_state: "repeat_shared_practice",
        pulse_prompt_keys: ["dyadic_pulse.repeat_shared_action"],
      };
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.route(`**/api/v0.3/me/relationships/mbti/${inviteId}/journey`, async (route) => {
    progressed = true;
    const payload = createPrivateFixture(inviteId);
    payload.private_relationship_journey_v1 = {
      ...payload.private_relationship_journey_v1,
      journey_state: "practice_started",
      progress_state: "warming_up",
      completed_dyadic_action_keys: ["dyadic_action.name_decision_rule"],
      recommended_next_dyadic_pulse_keys: ["dyadic_pulse.repeat_shared_action"],
      last_dyadic_pulse_signal: "continue_dyadic_action",
    };
    payload.dyadic_pulse_check_v1 = {
      ...payload.dyadic_pulse_check_v1,
      pulse_state: "repeat_shared_practice",
      pulse_prompt_keys: ["dyadic_pulse.repeat_shared_action"],
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.goto(`/en/relationships/mbti/${inviteId}`);
  await page.getByTestId("mbti-private-journey-continue").click();

  await expect(page.getByTestId("mbti-private-journey-state")).toHaveText("Practice started");
  await expect(page.getByTestId("mbti-private-progress-state")).toHaveText("Warming up");
  await expect(page.getByTestId("mbti-private-pulse-state")).toHaveText("Repeat shared practice");
});
