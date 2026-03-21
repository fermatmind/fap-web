import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeamWorkspaceClient from "@/app/(localized)/[locale]/(app)/workspace/team/[orgId]/assessments/[assessmentId]/TeamWorkspaceClient";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/workspace/team/41/assessments/7",
  getOrgAssessmentSummary: vi.fn(),
  getOrgAssessmentProgress: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
}));

vi.mock("@/lib/api/v0_4", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_4")>("@/lib/api/v0_4");

  return {
    ...actual,
    getOrgAssessmentSummary: hoisted.getOrgAssessmentSummary,
    getOrgAssessmentProgress: hoisted.getOrgAssessmentProgress,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("team workspace contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/workspace/team/41/assessments/7";
  });

  it("renders backend-owned team workspace authority and supports the manager loop", async () => {
    hoisted.getOrgAssessmentSummary.mockResolvedValue({
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
          workspace_surface_fingerprint: "workspace-fingerprint-1",
          workspace_scope: "tenant_protected",
          supporting_scales: ["MBTI"],
          team_member_count: 3,
          analyzed_member_count: 2,
        },
        partner_read_v1: {
          version: "partner.read.v1",
          graph_scope: "tenant_protected",
          graph_contract_version: "insight.graph.v1",
          graph_fingerprint: "workspace-graph-fingerprint-1",
          supporting_scales: ["MBTI"],
          allowed_node_ids: ["result_summary", "team_dynamics", "workspace_surface", "member_progress", "continue_reading"],
          allowed_edge_types: ["enriches", "recommended_next", "continues_to"],
          read_scope: "partner_tenant_read",
          subject_scope: "tenant_aggregate_only",
          attribution_scope: "workspace_partner_surface",
        },
      },
    });

    hoisted.getOrgAssessmentProgress.mockResolvedValue({
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
    });

    render(<TeamWorkspaceClient orgId="41" assessmentId="7" />);

    await waitFor(() => {
      expect(screen.getByTestId("team-workspace-hero")).toBeInTheDocument();
    });

    expect(screen.getByText("Team dynamics workspace")).toBeInTheDocument();
    expect(screen.getByTestId("team-workspace-communication")).toHaveTextContent("Energy translation");
    expect(screen.getByTestId("team-workspace-partner-read")).toHaveTextContent("tenant_protected");
    expect(screen.getByTestId("team-workspace-partner-read")).toHaveTextContent("partner_tenant_read");
    expect(screen.getByTestId("team-workspace-manager-action-0")).toHaveAttribute(
      "href",
      "/en/workspace/team/41/assessments/7#team-member-progress"
    );
    expect(screen.getByTestId("team-workspace-member-completed_members")).toHaveTextContent("al***@team.test");

    fireEvent.click(screen.getByTestId("team-workspace-member-toggle-completed_members"));

    await waitFor(() => {
      expect(screen.getByTestId("team-workspace-member-details-completed_members")).toBeInTheDocument();
    });

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
        expect.objectContaining({
          visual_kind: "team_workspace_surface",
          entrySurface: "protected_team_workspace",
          graphScope: "tenant_protected",
          readScope: "partner_tenant_read",
        })
      );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "team_member_drill_in",
        ctaKey: "member_drill_in_open",
        continueTarget: "member_progress_detail",
      })
    );
  });
});
