import { ApiError, apiClient } from "@/lib/api-client";

export type TeamDynamicsV1Raw = {
  version?: string;
  team_focus_key?: string;
  team_member_count?: number;
  analyzed_member_count?: number;
  supporting_scales?: string[];
  communication_fit_keys?: string[];
  decision_mix_keys?: string[];
  stress_pattern_keys?: string[];
  team_blindspot_keys?: string[];
  team_action_prompt_keys?: string[];
  workspace_scope?: string;
};

export type WorkspaceSurfaceV1Raw = {
  version?: string;
  workspace_focus_key?: string;
  manager_action_keys?: string[];
  member_drill_in_keys?: string[];
  workspace_surface_fingerprint?: string;
  workspace_scope?: string;
  supporting_scales?: string[];
  team_member_count?: number;
  analyzed_member_count?: number;
};

export type AssessmentSummaryResponse = {
  ok: boolean;
  assessment_id?: number;
  summary?: {
    completion_rate?: {
      completed?: number;
      total?: number;
    };
    due_at?: string | null;
    window?: {
      start_at?: string | null;
      end_at?: string | null;
    };
    score_distribution?: Array<Record<string, unknown>>;
    dimension_means?: Record<string, number>;
    team_dynamics_v1?: TeamDynamicsV1Raw | null;
    workspace_surface_v1?: WorkspaceSurfaceV1Raw | null;
  };
};

export type AssessmentProgressListItem = {
  subject_type?: string;
  subject_value?: string;
  invite_token?: string;
  attempt_id?: string | null;
  completed_at?: string | null;
  started_at?: string | null;
};

export type AssessmentProgressResponse = {
  ok: boolean;
  assessment_id?: number;
  total?: number;
  completed?: number;
  pending?: number;
  completed_list?: AssessmentProgressListItem[];
  pending_list?: AssessmentProgressListItem[];
  completed_list_limit?: number;
  pending_list_limit?: number;
  completed_list_truncated?: boolean;
  pending_list_truncated?: boolean;
};

function orgScopedHeaders(orgId: number): { headers: Headers } {
  const headers = new Headers();
  headers.set("X-FM-Org-Id", String(orgId));
  return { headers };
}

function assertApiOk<T extends { ok?: boolean }>(response: T, message: string): T {
  if (!response?.ok) {
    throw new ApiError({
      status: 500,
      errorCode: "API_RESPONSE_INVALID",
      message,
      details: response,
    });
  }

  return response;
}

export async function getOrgAssessmentSummary({
  orgId,
  assessmentId,
}: {
  orgId: number;
  assessmentId: number;
}): Promise<AssessmentSummaryResponse> {
  const response = await apiClient.get<AssessmentSummaryResponse>(
    `/v0.4/orgs/${orgId}/assessments/${assessmentId}/summary`,
    orgScopedHeaders(orgId)
  );

  return assertApiOk(response, "Failed to load team workspace summary.");
}

export async function getOrgAssessmentProgress({
  orgId,
  assessmentId,
}: {
  orgId: number;
  assessmentId: number;
}): Promise<AssessmentProgressResponse> {
  const response = await apiClient.get<AssessmentProgressResponse>(
    `/v0.4/orgs/${orgId}/assessments/${assessmentId}/progress`,
    orgScopedHeaders(orgId)
  );

  return assertApiOk(response, "Failed to load team workspace progress.");
}
