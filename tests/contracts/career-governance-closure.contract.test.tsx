import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerLaunchGovernanceClosure } from "@/lib/career/adapters/adaptCareerLaunchGovernanceClosure";
import { fetchCareerLaunchGovernanceClosure } from "@/lib/career/api/fetchCareerLaunchGovernanceClosure";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career launch governance closure contract", () => {
  it("requests the backend launch governance closure endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/launch-governance-closure?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          governance_kind: "career_launch_governance_closure",
          governance_version: "career.governance.v1",
          scope: "career_all_342",
          counts: {
            tracking_counts: {
              expected_total_occupations: 342,
              tracked_total_occupations: 342,
              tracking_complete: true,
            },
            summary: {
              mature_public_launch_count: 12,
              public_but_conservative_count: 120,
              strong_index_ready_count: 40,
              strong_operations_ready_count: 20,
              not_yet_ready_count: 210,
            },
          },
          members: [],
          public_statement: {
            can_claim_mature_public_launch: false,
            can_claim_strong_index_ready: false,
            can_claim_strong_operations_ready: false,
            allowed_external_statement: "cohort-qualified only",
          },
        });
      })
    );

    const payload = await fetchCareerLaunchGovernanceClosure({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts governance closure summary and member states into machine-readable frontend truth", () => {
    const adapted = adaptCareerLaunchGovernanceClosure({
      payload: {
        governance_kind: "career_launch_governance_closure",
        governance_version: "career.governance.v1",
        scope: "career_all_342",
        counts: {
          tracking_counts: {
            expected_total_occupations: 342,
            tracked_total_occupations: 342,
            tracking_complete: true,
          },
          summary: {
            mature_public_launch_count: 15,
            public_but_conservative_count: 140,
            strong_index_ready_count: 60,
            strong_operations_ready_count: 30,
            not_yet_ready_count: 187,
          },
        },
        members: [
          {
            canonical_slug: "registered-nurses",
            release_state: "public_detail_indexable",
            strong_index_state: "strong_index_ready",
            operations_state: "strong_operations_ready",
            governance_state: "mature_public_launch",
            strong_index_ready: true,
            strong_operations_ready: true,
            blocking_reasons: [],
          },
          {
            canonical_slug: "claims-adjusters",
            release_state: "review_needed",
            strong_index_state: "manual_only",
            operations_state: "not_strong_operations_ready",
            governance_state: "not_yet_mature",
            strong_index_ready: false,
            strong_operations_ready: false,
            blocking_reasons: ["crosswalk_backlog_not_converged"],
          },
        ],
        public_statement: {
          can_claim_mature_public_launch: false,
          can_claim_strong_index_ready: false,
          can_claim_strong_operations_ready: false,
          allowed_external_statement: "cohort-qualified external statement",
        },
      },
    });

    expect(adapted).not.toBeNull();
    expect(adapted?.trackingCounts.trackedTotalOccupations).toBe(342);
    expect(adapted?.summary.maturePublicLaunchCount).toBe(15);
    expect(adapted?.membersBySlug["registered-nurses"]?.governanceState).toBe(
      "mature_public_launch"
    );
    expect(adapted?.membersBySlug["claims-adjusters"]?.operationsState).toBe(
      "not_strong_operations_ready"
    );
    expect(adapted?.publicStatement.canClaimStrongOperationsReady).toBe(false);
  });
});

