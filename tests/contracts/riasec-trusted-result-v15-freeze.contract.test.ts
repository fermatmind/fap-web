import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json");

type TrustedFixture = {
  schema_version: string;
  runtime_status: string;
  scale_code: "RIASEC";
  projection: Record<string, unknown>;
  analytics_contract: {
    events: string[];
    forbidden_event_fragments: string[];
    forbidden_payload_fields: string[];
  };
};

function readFixture(): TrustedFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as TrustedFixture;
}

function buildReport(fixture: TrustedFixture): ReportResponse {
  return {
    ok: true,
    scale_code: fixture.scale_code,
    type_code: String((fixture.projection.holland_code as { code?: unknown }).code ?? ""),
    riasec_public_projection_v2: fixture.projection,
  } as ReportResponse;
}

describe("RIASEC Trusted Result v1.5 freeze contract", () => {
  it("freezes the projection fixture with measurement, activity, and feedback boundaries", () => {
    const fixture = readFixture();
    const projection = fixture.projection as Record<string, unknown>;

    expect(fixture.schema_version).toBe("riasec.trusted_result_v1_5.fixture");
    expect(fixture.runtime_status).toBe("trusted_result_v1_5_contract_freeze");
    expect(projection.schema_version).toBe("riasec.public_projection.v2");
    expect(projection).toHaveProperty("measurement_evidence");
    expect(projection).toHaveProperty("interpretation_state");
    expect(projection).toHaveProperty("module_visibility_policy");
    expect(projection).toHaveProperty("activity_explorer_v0_1");
    expect(projection).toHaveProperty("exploration_feedback_overlay_v0_1");
    expect(JSON.stringify(projection)).not.toContain("更准确");
    expect(JSON.stringify(projection)).not.toContain("Matches");
    expect(JSON.stringify(projection)).not.toContain("fit_score\":");
    expect(JSON.stringify(projection)).not.toContain("career_success_probability\":");
  });

  it("keeps the frontend consumer aligned with backend overlay guards without exposing raw feedback", () => {
    const viewModel = assembleRiasecResultViewModel(buildReport(readFixture()));

    expect(viewModel.trustedResultCard).toMatchObject({
      projectionVersion: "riasec.public_projection.v2",
      scoreSpaceVersion: "riasec_60_likert5_activity_sum_space.v1",
      qualityState: "normal",
      snapshotBound: true,
      rawScoreDeltaAllowed: false,
      occupationExamplesPolicy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
    expect(viewModel.interpretationState).toMatchObject({
      interpretationRuleVersion: "riasec_interpretation_rule_spec_v2",
      profileShape: "clear_code",
      profileShapeVersion: "riasec_profile_shape_v2_0",
      clarityLabel: "high",
      readingStrength: "normal_reading",
      moduleVisibilityPolicyId: "riasec_module_visibility_policy_v1",
      fieldAuthority: {
        profile_shape: "backend_owned",
        near_tie_state: "backend_owned",
        alternate_code: "backend_owned",
        top_code_confidence: "backend_owned",
        reading_strength: "backend_owned",
      },
    });
    expect(viewModel.moduleVisibilityPolicy).toMatchObject({
      schemaVersion: "riasec.module_visibility_policy.v1",
      policyId: "riasec_module_visibility_policy_v1",
      qualityState: "normal",
      profileShape: "clear_code",
      fallbackPolicy: {
        unknownModule: "hidden",
        missingBackendState: "hidden",
        frontendInferenceAllowed: false,
      },
    });
    expect(viewModel.activityExplorer).toMatchObject({
      status: "content_examples_only",
      sourceStatus: "content_example_not_registry_match",
      registrySourceConnected: false,
      fitScoreAllowed: false,
      successPredictionAllowed: false,
    });
    expect(viewModel.activityExplorer?.codeActivityPack.activities[0]?.occupationExamples[0]).toMatchObject({
      sourceStatus: "content_example_not_registry_match",
      displayLabel: "内容示例，非职业数据库匹配",
      notARecommendation: true,
    });
    expect(viewModel.feedbackOverlay).toMatchObject({
      schemaVersion: "riasec.exploration_feedback_overlay.v0.1",
      status: "overlay_contract_only",
      feedbackStreamStatus: "not_connected_v0_1",
      snapshotBound: true,
      measuredResultGuard: {
        scoresMutationAllowed: false,
        hollandCodeMutationAllowed: false,
        reportSnapshotMutationAllowed: false,
        measurementEvidenceMutationAllowed: false,
      },
      surfacePolicy: {
        sharePdfExposureAllowed: false,
        rawFeedbackPublicExposureAllowed: false,
        formalReportMutationAllowed: false,
      },
      readModel: {
        hasFeedback: false,
        feedbackCount: 0,
        rawFeedbackIncluded: false,
      },
      claimBoundary: {
        feedbackIsMeasurement: false,
        feedbackChangesScores: false,
        feedbackChangesMeasuredHollandCode: false,
        feedbackIsCareerMatch: false,
        feedbackIsSuccessPrediction: false,
      },
    });
  });

  it("freezes analytics events as observation-only and strips recommender fields", () => {
    const fixture = readFixture();
    const eventValues = Object.values(TRACKING_EVENTS);

    for (const eventName of fixture.analytics_contract.events) {
      expect(eventValues).toContain(eventName);
      for (const fragment of fixture.analytics_contract.forbidden_event_fragments) {
        expect(eventName).not.toContain(fragment);
      }
    }

    const payload = {
      scale_code: "RIASEC",
      form_code: "riasec_60",
      score_space_version: "riasec_60_likert5_activity_sum_space.v1",
      projection_version: "riasec.public_projection.v2",
      snapshot_bound: true,
      activity_explorer_status: "content_examples_only",
      activity_source_status: "content_example_not_registry_match",
      feedback_overlay_status: "overlay_contract_only",
      feedback_stream_status: "not_connected_v0_1",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      locale: "zh",
      raw_scores: "forbidden",
      raw_feedback: "forbidden",
      feedback_text: "forbidden",
      fit_score: 99,
      match_score: 99,
      career_success_probability: 0.99,
      occupation_recommendation: "forbidden",
    };

    const filtered = filterTrackingPayload(TRACKING_EVENTS.RIASEC_FEEDBACK_OVERLAY_VIEW, payload);
    expect(filtered).toMatchObject({
      scale_code: "RIASEC",
      form_code: "riasec_60",
      score_space_version: "riasec_60_likert5_activity_sum_space.v1",
      feedback_overlay_status: "overlay_contract_only",
      feedback_stream_status: "not_connected_v0_1",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
    });

    for (const forbiddenField of fixture.analytics_contract.forbidden_payload_fields) {
      expect(filtered).not.toHaveProperty(forbiddenField);
    }
  });
});
