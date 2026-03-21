import { expect, test } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createMbtiReportFixture() {
  return structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
}

test("MBTI result share flow uses /share/{id} and compare CTA routes into take flow with attribution query", async ({ page }) => {
  const attemptId = "mbti-share-attempt-001";
  const shareId = "share-mbti-001";
  const shareClickId = "share-click-001";
  const compareInviteId = "invite-mbti-001";
  const takePath = "/en/tests/mbti-personality-test-16-personality-types/take";
  const shareUrl = `http://127.0.0.1:3000/en/share/${shareId}`;
  const shareSummary = {
    ok: true,
    share_id: shareId,
    share_url: shareUrl,
    id: shareId,
    scale_code: "MBTI",
    locale: "en",
    type_code: "LEGACY-TYPE",
    type_name: "Legacy name should be ignored",
    subtitle: "Legacy subtitle should be ignored",
    summary: "Legacy summary should be ignored",
    rarity: {
      label: "Legacy rarity should be ignored",
    },
    primary_cta_label: "Start MBTI test",
    primary_cta_path: takePath,
    compare_enabled: true,
    compare_cta_label: "Invite a friend to compare",
    public_tags: ["Legacy tag should be ignored"],
    tags: ["type:ENFP-T", "Legacy tag should be ignored"],
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
      canonical_type_code: "ENFP",
      display_type: "ENFP-T",
      runtime_type_code: "ENFP-T",
      variant_code: "T",
      profile: {
        type_name: "Campaigner",
        rarity: {
          label: "Around 6-8%",
        },
        keywords: ["Warm", "Idealistic", "type:TECHNICAL_ONLY"],
      },
      summary_card: {
        title: "Campaigner",
        subtitle: "Warm, imaginative, and emotionally alert",
        summary: "This public MBTI share page keeps only the lightweight result summary and the top-level dimension balance.",
        public_tags: ["Warm", "Idealistic", "Sensitive", "axis:EI"],
      },
      dimensions: [
        { code: "EI", label: "E / I", pct: 61, side_label: "Extraversion", state: "Expressive" },
        { code: "SN", label: "S / N", score_pct: 74, side_label: "Intuition", state: "Pattern-led" },
      ],
      _meta: {
        personalization: {
          user_state: {
            feedback_sentiment: "negative",
            feedback_coverage: "explainability_only",
            action_completion_tendency: "warming_up",
            last_deep_read_section: "traits.close_call_axes",
            current_intent_cluster: "clarify_type",
          },
          read_contract_v1: {
            version: "mbti.read_contract.v1",
            canonical_read_model: {
              personalization_fields: ["schema_version", "type_code", "identity"],
              surface_fields: ["report.summary", "mbti_public_projection_v1.summary_card"],
              sources: ["report_snapshot", "report_projection"],
            },
            overlay_patch: {
              personalization_fields: ["user_state", "continuity"],
              surface_fields: [
                "report._meta.personalization.user_state",
                "mbti_public_projection_v1._meta.personalization.user_state",
              ],
              sources: ["attempt_access", "attempt_events", "share_rows"],
            },
            cacheable_fields: ["report", "mbti_public_projection_v1", "mbti_public_summary_v1", "mbti_read_contract_v1"],
            non_cacheable_fields: [
              "report._meta.personalization.user_state",
              "mbti_public_projection_v1._meta.personalization.user_state",
            ],
            telemetry_parity_fields: ["user_state", "continuity.carryover_focus_key"],
          },
        },
      },
    },
    mbti_continuity_v1: {
      carryover_focus_key: "career.next_step",
      carryover_reason: "continue_career_bridge",
      recommended_resume_keys: ["career.next_step", "career.work_experiments"],
      carryover_scene_keys: ["work", "growth"],
      carryover_action_keys: ["career_next_step.theme.clarify_decision_criteria"],
      feedback_sentiment: "negative",
      feedback_coverage: "explainability_only",
      action_completion_tendency: "warming_up",
      last_deep_read_section: "traits.close_call_axes",
      current_intent_cluster: "clarify_type",
    },
    mbti_read_contract_v1: {
      version: "mbti.read_contract.v1",
      canonical_read_model: {
        personalization_fields: ["schema_version", "type_code", "identity"],
        surface_fields: ["report.summary", "mbti_public_projection_v1.summary_card"],
        sources: ["report_snapshot", "report_projection"],
      },
      overlay_patch: {
        personalization_fields: ["user_state", "continuity"],
        surface_fields: [
          "report._meta.personalization.user_state",
          "mbti_public_projection_v1._meta.personalization.user_state",
        ],
        sources: ["attempt_access", "attempt_events", "share_rows"],
      },
      cacheable_fields: ["report", "mbti_public_projection_v1", "mbti_public_summary_v1", "mbti_read_contract_v1"],
      non_cacheable_fields: [
        "report._meta.personalization.user_state",
        "mbti_public_projection_v1._meta.personalization.user_state",
      ],
      telemetry_parity_fields: ["user_state", "continuity.carryover_focus_key"],
    },
    public_surface_v1: {
      version: "public.surface.v1",
      entry_surface: "mbti_share_landing",
      public_summary_fingerprint: "share-fingerprint-123",
      discoverability_keys: ["public_safe_summary", "share_landing", "continue_here", "compare_invite"],
      continue_reading_keys: ["career.next_step", "career.work_experiments"],
      canonical_url: shareUrl,
      robots_policy: "noindex,follow",
      attribution_scope: "share_public_surface",
    },
    insight_graph_v1: {
      version: "insight.graph.v1",
      graph_contract_version: "insight.graph.v1",
      root_node: "result_summary",
      graph_fingerprint: "graph-fingerprint-123",
      graph_scope: "public_share_safe",
      supporting_scales: ["MBTI", "BIG5_OCEAN"],
      nodes: [
        { id: "result_summary", kind: "result_summary", title: "Campaigner", summary: "This public MBTI share page keeps only the lightweight result summary and the top-level dimension balance." },
        { id: "narrative", kind: "narrative", title: "Public summary", summary: "This public MBTI share page keeps only the lightweight result summary and the top-level dimension balance." },
        { id: "comparative", kind: "comparative", title: "Relative position", summary: "Above roughly 62% of the anonymized cohort." },
        { id: "working_life", kind: "working_life", title: "Working-life cue", summary: "Current focus: career.next_step" },
        { id: "continue_reading", kind: "continue_reading", title: "Continue path", summary: "career.next_step -> career.work_experiments" },
      ],
      edges: [{ from: "narrative", to: "result_summary", relation: "enriches" }],
    },
    embed_surface_v1: {
      version: "embed.surface.v1",
      surface_key: "mbti_share_embed_card",
      graph_scope: "public_share_safe",
      entry_surface: "mbti_share_landing",
      title: "Campaigner",
      summary: "This public MBTI share page keeps only the lightweight result summary and the top-level dimension balance.",
      primary_cta_label: "Start MBTI test",
      primary_cta_path: takePath,
      continue_target: "career.next_step",
      allowed_node_ids: ["result_summary", "narrative", "comparative", "working_life", "continue_reading"],
      embed_fingerprint: "embed-fingerprint-123",
      render_mode: "card",
    },
    offers: [
      {
        title: "Unlock full report",
      },
    ],
    recommended_reads: [
      {
        title: "Paid-only reading",
      },
    ],
  };
  const shareClickBodies: Array<Record<string, unknown>> = [];
  const compareInviteBodies: Array<Record<string, unknown>> = [];

  await page.addInitScript(() => {
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_share_001");
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { __copiedShareUrl?: string }).__copiedShareUrl = value;
        },
      },
    });
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
        fm_token: "fm_e2e_share_guest_token_001",
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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: "attempt-start-share-001",
        scale_code: "MBTI",
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiReportFixture()),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/share`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        share_id: shareId,
        share_url: shareUrl,
      }),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(shareSummary),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}/click`, async (route) => {
    shareClickBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        id: shareClickId,
        share_id: shareId,
        recorded_at: "2026-03-12T00:00:00.000Z",
      }),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}/compare-invites`, async (route) => {
    compareInviteBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        invite_id: compareInviteId,
        share_id: shareId,
        scale_code: "MBTI",
        locale: "en",
        status: "pending",
        take_path: takePath,
        compare_path: `/en/compare/mbti/${compareInviteId}`,
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();

  await page.getByTestId("mbti-footer-cta").getByRole("button", { name: "Share result" }).click();

  await expect
    .poll(async () => page.evaluate(() => (window as typeof window & { __copiedShareUrl?: string }).__copiedShareUrl ?? ""))
    .toBe(shareUrl);
  await expect(page.getByText("Result link copied.")).toBeVisible();

  await page.goto(`${shareUrl}?utm_source=wechat&utm_medium=organic&utm_campaign=mbti`, {
    referer: `http://127.0.0.1:3000/en/result/${attemptId}`,
  });
  await expect(page.getByTestId("mbti-share-summary-card")).toBeVisible();
  await expect(page.getByTestId("mbti-share-carryover-entry")).toContainText("Start next with Career next step");
  await expect(page.getByTestId("mbti-share-carryover-cta")).toHaveAttribute(
    "href",
    /carryover_focus_key=career.next_step/
  );
  await expect(page.getByTestId("mbti-share-carryover-cta")).toHaveAttribute(
    "href",
    /current_intent_cluster=clarify_type/
  );
  await expect(page.getByRole("heading", { name: "ENFP-T" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^ENFP$/ })).toHaveCount(0);
  await expect(page.getByTestId("mbti-share-summary-card").getByText("Campaigner")).toBeVisible();
  await expect(page.getByTestId("share-embed-surface")).toContainText("Embeddable insight graph");
  await expect(page.getByTestId("share-embed-node-list")).toContainText("Continue path");
  await expect(page.getByRole("button", { name: "Invite a friend to compare" })).toBeVisible();
  await expect(page.getByText("Legacy name should be ignored")).toHaveCount(0);
  await expect(page.getByText("Legacy summary should be ignored")).toHaveCount(0);
  await expect(page.getByText("Legacy tag should be ignored")).toHaveCount(0);
  await expect(page.getByText("Unlock full report")).toHaveCount(0);
  await expect(page.getByText("Paid-only reading")).toHaveCount(0);
  await expect(page.getByText("type:ENFP-T")).toHaveCount(0);

  await expect.poll(() => shareClickBodies.length).toBe(1);
  expect(shareClickBodies[0]).toMatchObject({
    anon_id: "anon_e2e_share_001",
    meta: {
      entrypoint: "share_page",
      landing_path: `/en/share/${shareId}?utm_source=wechat&utm_medium=organic&utm_campaign=mbti`,
      compare_intent: false,
      utm: {
        source: "wechat",
        medium: "organic",
        campaign: "mbti",
        term: null,
        content: null,
      },
    },
  });
  expect(String((shareClickBodies[0].meta as Record<string, unknown>).referrer ?? "")).toContain(`/en/result/${attemptId}`);

  await page.getByRole("button", { name: "Invite a friend to compare" }).click();

  await expect.poll(() => compareInviteBodies.length).toBe(1);
  expect(compareInviteBodies[0]).toMatchObject({
    anon_id: "anon_e2e_share_001",
    entrypoint: "share_page",
    landing_path: `/en/share/${shareId}?utm_source=wechat&utm_medium=organic&utm_campaign=mbti`,
    compare_intent: true,
    utm: {
      source: "wechat",
      medium: "organic",
      campaign: "mbti",
      term: null,
      content: null,
    },
    meta: {
      share_click_id: shareClickId,
    },
  });
  expect(String(compareInviteBodies[0].referrer ?? "")).toContain(`/en/result/${attemptId}`);

  await expect(page).toHaveURL(
    new RegExp(`/en/tests/mbti-personality-test-16-personality-types/take\\?(.+&)?share_id=${shareId}(&|$)`)
  );

  const targetUrl = new URL(page.url());
  expect(targetUrl.pathname).toBe(takePath);
  expect(targetUrl.searchParams.get("share_id")).toBe(shareId);
  expect(targetUrl.searchParams.get("compare_invite_id")).toBe(compareInviteId);
  expect(targetUrl.searchParams.get("share_click_id")).toBe(shareClickId);
  expect(targetUrl.searchParams.get("entrypoint")).toBe("share_compare_invite");
  expect(targetUrl.searchParams.get("compare_intent")).toBe("true");
  expect(targetUrl.searchParams.get("utm_source")).toBe("wechat");
  expect(targetUrl.searchParams.get("utm_medium")).toBe("organic");
  expect(targetUrl.searchParams.get("utm_campaign")).toBe("mbti");
});
