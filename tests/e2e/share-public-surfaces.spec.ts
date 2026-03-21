import { expect, test } from "@playwright/test";

test("Big Five share page exposes only the public-safe acquisition surface", async ({ page }) => {
  const shareId = "share-big5-123";

  await page.addInitScript(() => {
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_share_big5_001");
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
      body: JSON.stringify({ ok: true, fm_token: "fm_e2e_big5_share_guest_token" }),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}/click`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        id: "click-big5-share-001",
        share_id: shareId,
        recorded_at: "2026-03-21T00:00:00.000Z",
      }),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        share_id: shareId,
        share_url: `http://127.0.0.1:3000/en/share/${shareId}`,
        id: shareId,
        scale_code: "BIG5_OCEAN",
        locale: "en",
        type_code: "BIG5",
        type_name: "Big Five personality",
        title: "Big Five public summary",
        subtitle: "This profile is primarily driven by Openness.",
        summary: "This public-safe Big Five summary keeps the dominant traits, relative position, and entry path visible.",
        primary_cta_label: "Take the test",
        primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
        big5_public_projection_v1: {
          trait_vector: [
            { key: "O", label: "Openness", percentile: 81, band_label: "exploratory" },
            { key: "C", label: "Conscientiousness", percentile: 58, band_label: "balanced" },
          ],
          dominant_traits: [{ key: "O", label: "Openness", percentile: 81, rank: 1 }],
          explainability_summary: {
            headline: "This profile is primarily driven by Openness.",
          },
        },
        controlled_narrative_v1: {
          narrative_summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
        },
        comparative_v1: {
          cohort_relative_position: {
            key: "upper_band",
            label: "Above about 81% of the cohort",
            summary: "In the current norming set, your Openness sits above roughly 81% of the anonymized cohort.",
          },
        },
        public_surface_v1: {
          version: "public.surface.v1",
          entry_surface: "big5_share_landing",
          public_summary_fingerprint: "share-big5-fingerprint",
          discoverability_keys: ["public_safe_summary", "share_landing", "big5_foundation_summary"],
          continue_reading_keys: ["traits.overview", "growth.next_actions"],
          canonical_url: `http://127.0.0.1:3000/en/share/${shareId}`,
          robots_policy: "noindex,follow",
          attribution_scope: "share_public_surface",
        },
        insight_graph_v1: {
          version: "insight.graph.v1",
          graph_contract_version: "insight.graph.v1",
          root_node: "result_summary",
          graph_fingerprint: "share-big5-graph-fingerprint",
          graph_scope: "public_share_safe",
          supporting_scales: ["BIG5_OCEAN"],
          nodes: [
            { id: "result_summary", kind: "result_summary", title: "Big Five public summary", summary: "This public-safe Big Five summary keeps the dominant traits, relative position, and entry path visible." },
            { id: "narrative", kind: "narrative", title: "Public summary", summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report." },
            { id: "comparative", kind: "comparative", title: "Above about 81% of the cohort", summary: "In the current norming set, your Openness sits above roughly 81% of the anonymized cohort." },
            { id: "continue_reading", kind: "continue_reading", title: "Continue path", summary: "traits.overview -> growth.next_actions" },
          ],
          edges: [{ from: "comparative", to: "result_summary", relation: "supports" }],
        },
        embed_surface_v1: {
          version: "embed.surface.v1",
          surface_key: "big5_share_embed_card",
          graph_scope: "public_share_safe",
          entry_surface: "big5_share_landing",
          title: "Big Five public summary",
          summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
          primary_cta_label: "Take the test",
          primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
          continue_target: "traits.overview",
          allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
          embed_fingerprint: "share-big5-embed-fingerprint",
          render_mode: "card",
        },
        widget_surface_v1: {
          version: "widget.surface.v1",
          widget_scope: "public_share_safe",
          widget_contract_version: "widget.surface.v1",
          surface_key: "big5_share_embed_card",
          host_mode: "card",
          slot_key: "public_share_primary",
          size_preset: "summary_card",
          entry_surface: "big5_share_landing",
          title: "Big Five public summary",
          summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
          primary_cta_label: "Take the test",
          primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
          continue_target: "traits.overview",
          allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
          allowed_edge_types: ["supports"],
          graph_fingerprint: "share-big5-graph-fingerprint",
          embed_fingerprint: "share-big5-embed-fingerprint",
          attribution_scope: "share_public_surface",
        },
        partner_read_v1: {
          version: "partner.read.v1",
          graph_scope: "public_share_safe",
          graph_contract_version: "insight.graph.v1",
          graph_fingerprint: "share-big5-graph-fingerprint",
          supporting_scales: ["BIG5_OCEAN"],
          allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
          allowed_edge_types: ["supports"],
          read_scope: "partner_public_read",
          subject_scope: "public_summary_only",
          attribution_scope: "share_public_surface",
        },
      }),
    });
  });

  await page.goto(`/en/share/${shareId}`);

  await expect(page.getByTestId("mbti-share-summary-card")).toBeVisible();
  await expect(page.getByRole("heading", { name: "BIG5" })).toBeVisible();
  await expect(page.getByTestId("mbti-share-summary-card").getByText("Big Five public summary")).toBeVisible();
  await expect(page.getByTestId("share-public-insight-grid")).toContainText(
    "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report."
  );
  await expect(page.getByTestId("share-widget-surface")).toContainText("Embeddable insight widget");
  await expect(page.getByTestId("share-partner-read-scope")).toContainText("partner_public_read");
  await expect(page.getByTestId("share-widget-node-list")).toContainText("Big Five public summary");
  await expect(page.getByTestId("share-widget-host-meta")).toContainText("public_share_primary");
  await expect(page.getByTestId("share-public-continue-entry")).toContainText("Continue into the full result path");
  await expect(page.getByTestId("share-public-continue-cta")).toHaveAttribute(
    "href",
    /\/en\/tests\/big-five-personality-test-ocean-model/
  );
  await expect(page.getByText("Unlock full report")).toHaveCount(0);
});
