import { expect, test } from "@playwright/test";

test("protected team workspace renders team dynamics and manager loop", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fm_auth_token", "fm_team_workspace_owner_token");
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.4/orgs/41/assessments/7/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        assessment_id: 7,
        summary: {
          completion_rate: {
            completed: 2,
            total: 3,
          },
          team_dynamics_v1: {
            version: "team_dynamics.v1",
            team_focus_key: "team.communication.energy_translation",
            team_member_count: 3,
            analyzed_member_count: 2,
            supporting_scales: ["MBTI"],
            communication_fit_keys: ["team.communication.energy_translation"],
            decision_mix_keys: ["team.decision.logic_empathy_mix"],
            stress_pattern_keys: ["team.stress.stability_gap"],
            team_blindspot_keys: ["team.blindspot.execution_alignment"],
            team_action_prompt_keys: ["team.action.sync_communication_cadence"],
          },
          workspace_surface_v1: {
            version: "workspace.surface.v1",
            workspace_focus_key: "team.communication.energy_translation",
            manager_action_keys: ["team.action.sync_communication_cadence", "check_member_progress"],
            member_drill_in_keys: ["completed_assignments", "pending_assignments"],
            workspace_surface_fingerprint: "workspace-fingerprint-e2e",
            workspace_scope: "tenant_protected",
            supporting_scales: ["MBTI"],
            team_member_count: 3,
            analyzed_member_count: 2,
          },
          partner_read_v1: {
            version: "partner.read.v1",
            graph_scope: "tenant_protected",
            graph_contract_version: "insight.graph.v1",
            graph_fingerprint: "workspace-graph-fingerprint-e2e",
            supporting_scales: ["MBTI"],
            allowed_node_ids: ["result_summary", "team_dynamics", "workspace_surface", "member_progress", "continue_reading"],
            allowed_edge_types: ["enriches", "recommended_next", "continues_to"],
            read_scope: "partner_tenant_read",
            subject_scope: "tenant_aggregate_only",
            attribution_scope: "workspace_partner_surface",
          },
        },
      }),
    });
  });

  await page.route("**/api/v0.4/orgs/41/assessments/7/progress", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        assessment_id: 7,
        total: 3,
        completed: 2,
        pending: 1,
        completed_list: [
          {
            subject_type: "email",
            subject_value: "alpha@team.test",
            attempt_id: "attempt-1",
            completed_at: "2026-03-21T09:00:00.000Z",
          },
        ],
        pending_list: [
          {
            subject_type: "email",
            subject_value: "beta@team.test",
            started_at: "2026-03-21T08:00:00.000Z",
          },
        ],
      }),
    });
  });

  await page.goto("/en/workspace/team/41/assessments/7");

  await expect(page.getByTestId("team-workspace-hero")).toBeVisible();
  await expect(page.getByTestId("team-workspace-partner-read")).toContainText("tenant_protected");
  await expect(page.getByTestId("team-workspace-manager-loop")).toContainText("Manager loop");
  await expect(page.getByTestId("team-workspace-progress")).toContainText("Completed members");

  await page.getByTestId("team-workspace-progress-cta").click();
  await expect(page).toHaveURL(/#team-member-progress$/);

  await page.getByTestId("team-workspace-member-toggle-completed_members").click();
  await expect(page.getByTestId("team-workspace-member-details-completed_members")).toBeVisible();
});
