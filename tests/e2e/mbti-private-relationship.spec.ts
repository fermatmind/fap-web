import { expect, test } from "@playwright/test";

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

function createPrivateFixture(inviteId: string) {
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
