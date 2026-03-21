import { expect, test } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";

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
    type_code: "LEGACY-TYPE",
    type_name: "Legacy type should be ignored",
    subtitle: "Legacy subtitle should be ignored",
    summary: "Legacy summary should be ignored",
    primary_cta_label: "Take the MBTI test",
    primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
    tags: ["Legacy tag should be ignored", "type:TECHNICAL_ONLY"],
    dimensions: [{ code: "EI", label: "Legacy dimension should be ignored", pct: 61 }],
    profile: {
      type_name: "Legacy profile should be ignored",
      short_summary: "Legacy profile summary should be ignored",
    },
    identity_card: {
      title: "Legacy identity title should be ignored",
      summary: "Legacy identity summary should be ignored",
    },
    result: {
      type_code: "LEGACY-RESULT",
      summary: "Legacy result summary should be ignored",
    },
    mbti_public_summary_v1: {
      title: "Legacy public summary should be ignored",
    },
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
        keywords: ["Warm", "type:TECHNICAL_ONLY"],
      },
      summary_card: {
        title: typeName,
        subtitle,
        summary: `${typeName} public summary`,
        public_tags: ["Warm", "axis:EI"],
      },
      dimensions: [
        { code: "EI", label: "E / I", pct: 61, side_label: "Extraversion", state: "Expressive" },
      ],
    },
    offers: [{ title: "Paid offer should stay hidden" }],
    recommended_reads: [{ title: "Paid read should stay hidden" }],
  };
}

function createCompareFixture(status: "pending" | "ready" | "purchased", inviteId: string) {
  return {
    ok: true,
    invite_id: inviteId,
    share_id: "share-123",
    scale_code: "MBTI",
    locale: "en",
    status,
    inviter: createSummaryFixture({
      shareId: "share-123",
      canonicalTypeCode: "ENFP",
      displayType: "ENFP-T",
      typeName: "Campaigner",
      subtitle: "Warm and imaginative",
    }),
    invitee: status === "pending"
      ? null
      : createSummaryFixture({
          shareId: "share-123",
          canonicalTypeCode: "INFJ",
          displayType: "INFJ-A",
          typeName: "Advocate",
          subtitle: "Quietly focused and structured",
        }),
    compare: status === "pending"
      ? null
      : {
          title: "Shared chemistry and friction points",
          summary: "Both profiles align on idealism, but differ on how quickly they externalize judgment.",
          shared_count: 2,
          diverging_count: 2,
          axes: [
            {
              code: "EI",
              label: "Energy",
              summary: "One leads with outward energy while the other consolidates before responding.",
              state: "Diverging",
              inviter_side: "E",
              invitee_side: "I",
            },
            {
              code: "TF",
              label: "Decision style",
              summary: "Both still care about human impact when making calls.",
              state: "Shared",
              inviter_side: "F",
              invitee_side: "F",
            },
          ],
          paid_sections: [{ title: "Should never render" }],
        },
    relationship_sync_v1: status === "pending"
      ? {
          relationship_contract_version: "relationship.sync.v1",
          relationship_fingerprint_version: "relationship.sync.fp.v1",
          relationship_fingerprint: "relationship-fingerprint-pending",
          dyadic_scope: "public_compare_invite_safe",
          subject_join_mode: "share_compare_invite_pending",
          dyadic_action_prompt_keys: ["dyadic_action.complete_compare_invite"],
          overview: {
            title: "Waiting for the second side",
            summary: "The invite is active. A relationship sync summary appears only after the invitee finishes MBTI.",
          },
          sections: [],
          action_prompt: {
            key: "dyadic_action.complete_compare_invite",
            title: "Complete the compare first",
            summary: "The next meaningful step is for the invitee to finish MBTI so the sync layer can be generated.",
            cta_label: "Continue the compare invite",
            cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
          },
        }
      : {
          relationship_contract_version: "relationship.sync.v1",
          relationship_fingerprint_version: "relationship.sync.fp.v1",
          relationship_fingerprint: `relationship-fingerprint-${status}`,
          dyadic_scope: "public_compare_invite_safe",
          subject_join_mode: "share_compare_invite_joined",
          shared_count: 2,
          diverging_count: 2,
          friction_keys: ["friction.energy_mismatch"],
          complement_keys: ["complement.heart_head_balance"],
          communication_bridge_keys: ["communication_bridge.energy_pacing"],
          decision_tension_keys: ["decision_tension.logic_vs_empathy"],
          stress_interplay_keys: ["stress_interplay.shared_recovery_rhythm"],
          dyadic_action_prompt_keys: ["dyadic_action.name_decision_rule"],
          overview: {
            title: "Relationship sync summary",
            summary: "A backend-owned dyadic summary.",
          },
          sections: [
            {
              key: "communication_bridge",
              title: "Communication bridge",
              summary: "Name the response pace.",
              bullets: ["Say clearly whether you need to think first or speak first."],
            },
            {
              key: "decision_tension",
              title: "Decision tension",
              summary: "Name the decision rule.",
              bullets: ["Before debating conclusions, say what you are optimizing for."],
            },
          ],
          action_prompt: {
            key: "dyadic_action.name_decision_rule",
            title: "Name the decision rule first",
            summary: "Say what each person is optimizing for before debating the answer.",
          },
        },
    dyadic_graph_v1: {
      graph_contract_version: "dyadic.graph.v1",
      graph_scope: "public_compare_invite_safe",
      graph_fingerprint: `dyadic-graph-${status}`,
      root_node: "relationship_sync",
      supporting_scales: ["MBTI"],
      nodes: [
        { id: "relationship_sync", kind: "relationship_sync", title: "Relationship sync summary", summary: "A backend-owned dyadic summary." },
      ],
      edges: [],
    },
    primary_cta_label: "Take the MBTI test",
    primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
  };
}

test("pending compare page renders inviter summary and CTA only", async ({ page }) => {
  const inviteId = "invite-pending-001";

  await page.route(`**/api/v0.3/compare/mbti/${inviteId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCompareFixture("pending", inviteId)),
    });
  });

  await page.goto(`/en/compare/mbti/${inviteId}`, {
    referer: "http://127.0.0.1:3000/en/share/share-123",
  });

  await expect(page.getByTestId("mbti-compare-invite-view")).toBeVisible();
  await expect(page.getByTestId("mbti-compare-status-badge")).toHaveText("Waiting for invitee");
  await expect(page.getByTestId("mbti-compare-inviter-card")).toContainText("Campaigner");
  await expect(page.getByTestId("mbti-compare-inviter-card")).toContainText("ENFP-T");
  await expect(page.getByText("Legacy type should be ignored")).toHaveCount(0);
  await expect(page.getByTestId("mbti-compare-invitee-card")).toHaveCount(0);
  await expect(page.getByTestId("mbti-compare-summary-card")).toHaveCount(0);
  await expect(page.getByTestId("mbti-dyadic-sync-card")).toContainText("Waiting for the second side");
  await expect(page.getByTestId("mbti-dyadic-action-card")).toContainText("Complete the compare first");
  await expect(page.getByRole("link", { name: "Take the MBTI test" })).toHaveAttribute(
    "href",
    `/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=${inviteId}&entrypoint=compare_invite_page&landing_path=%2Fen%2Fcompare%2Fmbti%2F${inviteId}&referrer=http%3A%2F%2F127.0.0.1%3A3000%2Fen%2Fshare%2Fshare-123&compare_intent=true`
  );
});

test("ready and purchased compare pages render public-safe compare data without paid content", async ({ page }) => {
  const readyInviteId = "invite-ready-001";
  const purchasedInviteId = "invite-purchased-001";

  await page.route(`**/api/v0.3/compare/mbti/${readyInviteId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCompareFixture("ready", readyInviteId)),
    });
  });

  await page.goto(`/en/compare/mbti/${readyInviteId}`);

  await expect(page.getByTestId("mbti-compare-status-badge")).toHaveText("Compare ready");
  await expect(page.getByTestId("mbti-compare-inviter-card")).toContainText("Campaigner");
  await expect(page.getByTestId("mbti-compare-inviter-card")).toContainText("ENFP-T");
  await expect(page.getByTestId("mbti-compare-invitee-card")).toContainText("Advocate");
  await expect(page.getByTestId("mbti-compare-invitee-card")).toContainText("INFJ-A");
  await expect(page.getByTestId("mbti-compare-summary-card")).toContainText("Shared chemistry and friction points");
  await expect(page.getByTestId("mbti-dyadic-sync-card")).toContainText("Relationship sync summary");
  await expect(page.getByTestId("mbti-dyadic-action-card")).toContainText("Name the decision rule first");
  await expect(page.getByTestId("mbti-dyadic-section-communication_bridge")).toBeVisible();
  await expect(page.getByText("Energy", { exact: true })).toBeVisible();
  await expect(page.getByText("Decision style", { exact: true })).toBeVisible();
  await expect(page.getByText("Legacy summary should be ignored")).toHaveCount(0);
  await expect(page.getByText("Legacy tag should be ignored")).toHaveCount(0);
  await expect(page.getByText("Paid offer should stay hidden")).toHaveCount(0);
  await expect(page.getByText("Paid read should stay hidden")).toHaveCount(0);
  await expect(page.getByText("Should never render")).toHaveCount(0);

  await page.route(`**/api/v0.3/compare/mbti/${purchasedInviteId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCompareFixture("purchased", purchasedInviteId)),
    });
  });

  await page.goto(`/en/compare/mbti/${purchasedInviteId}`);

  await expect(page.getByTestId("mbti-compare-status-badge")).toHaveText("Purchased");
  await expect(page.getByTestId("mbti-compare-summary-card")).toContainText("Shared chemistry and friction points");
});

test("take flow submit lands on the compare page when compare_invite_id is present", async ({ page }) => {
  const inviteId = "invite-redirect-001";
  const startBodies: Array<Record<string, unknown>> = [];
  const submitBodies: Array<Record<string, unknown>> = [];

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_compare_guest_token_001",
      }),
    });
  });

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "mbti-personality-test-16-personality-types",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: [
            {
              question_id: "q1",
              order: 1,
              text: "Question 1",
              options: [
                { code: "A", text: "Option A" },
                { code: "B", text: "Option B" },
                { code: "C", text: "Option C" },
                { code: "D", text: "Option D" },
              ],
            },
          ],
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    startBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: "attempt-start-compare-001",
        scale_code: "MBTI",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    submitBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: "attempt-result-compare-001",
      }),
    });
  });

  await page.route(`**/api/v0.3/compare/mbti/${inviteId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCompareFixture("ready", inviteId)),
    });
  });

  await page.goto(`/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=${inviteId}&share_click_id=click-123&entrypoint=share_compare_invite&landing_path=%2Fen%2Fshare%2Fshare-123&referrer=https%3A%2F%2Fexample.com%2Fen%2Fshare%2Fshare-123&utm_source=wechat&utm_medium=organic&utm_campaign=pr07b&compare_intent=true`);
  await expect(page.getByRole("heading", { name: "Question 1" })).toBeVisible({ timeout: 15000 });

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").first(),
    targetUrl: new RegExp(`/en/compare/mbti/${inviteId}(\\?.*)?$`),
    timeoutMs: 30000,
  });

  expect(submitResponse.status()).toBe(200);
  await expect(page.getByTestId("mbti-compare-invite-view")).toBeVisible();
  await expect(page.getByTestId("mbti-compare-summary-card")).toContainText("Shared chemistry and friction points");

  expect(startBodies[0]).toMatchObject({
    share_id: "share-123",
    compare_invite_id: inviteId,
    share_click_id: "click-123",
    entrypoint: "share_compare_invite",
    landing_path: "/en/share/share-123",
    referrer: "https://example.com/en/share/share-123",
    utm: {
      source: "wechat",
      medium: "organic",
      campaign: "pr07b",
      term: null,
      content: null,
    },
  });
  expect(submitBodies[0]).toMatchObject({
    share_id: "share-123",
    compare_invite_id: inviteId,
    share_click_id: "click-123",
    entrypoint: "share_compare_invite",
    landing_path: "/en/share/share-123",
    referrer: "https://example.com/en/share/share-123",
    utm: {
      source: "wechat",
      medium: "organic",
      campaign: "pr07b",
      term: null,
      content: null,
    },
  });
});
