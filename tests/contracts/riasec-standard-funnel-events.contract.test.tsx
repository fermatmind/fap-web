import fs from "node:fs";
import path from "node:path";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import {
  RIASEC_TRACKING_EVENTS,
  buildRiasecStartAttemptTrackingPayload,
  buildRiasecSubmitAttemptTrackingPayload,
} from "@/lib/riasec/tracking";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

const ROOT = process.cwd();
const TRUSTED_PROJECTION_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json"
);

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
  createAttemptShare: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
  trackObservableFunnelEvent: hoisted.trackObservableFunnelEvent,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");
  return {
    ...actual,
    createAttemptShare: hoisted.createAttemptShare,
  };
});

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function reportFromProjection(): ReportResponse {
  const fixture = readJson<Record<string, unknown>>(TRUSTED_PROJECTION_PATH);
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: "riasec_60",
      label: "RIASEC 60Q",
      question_count: 60,
      estimated_minutes: 8,
    },
    riasec_public_projection_v2: fixture.projection ?? fixture,
  } as unknown as ReportResponse;
}

describe("RIASEC standard funnel events contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds safe canonical start_attempt and submit_attempt payloads with SEO attribution", () => {
    const attribution = {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "seo_pilot_acceptance",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "holland-career-interest-test-can-and-cannot-tell-you",
      target_action: "seo_cta_start_test",
      target_test_slug: "holland-career-interest-test-riasec",
      cta_id: "primary_riasec_test",
      landing_path: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
      email: "person@example.com",
      unsafe_param: "drop-me",
    };

    const startPayload = buildRiasecStartAttemptTrackingPayload({
      slug: "holland-career-interest-test-riasec",
      formCode: "riasec_60",
      locale: "zh",
      attemptId: "attempt-riasec-standard-events",
      attribution,
    });
    const submitPayload = buildRiasecSubmitAttemptTrackingPayload({
      slug: "holland-career-interest-test-riasec",
      formCode: "riasec_60",
      locale: "zh",
      attemptId: "attempt-riasec-standard-events",
      answeredCount: 60,
      durationMs: 180000,
      attribution,
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, startPayload)).toMatchObject({
      slug: "holland-career-interest-test-riasec",
      test_slug: "holland-career-interest-test-riasec",
      scale_code: "RIASEC",
      form_code: "riasec_60",
      attempt_id: "attemp...ents",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "seo_pilot_acceptance",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "holland-career-interest-test-can-and-cannot-tell-you",
      target_action: "seo_cta_start_test",
      target_test_slug: "holland-career-interest-test-riasec",
      cta_id: "primary_riasec_test",
      landing_path: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
      locale: "zh",
    });
    expect(filterTrackingPayload(TRACKING_EVENTS.SUBMIT_ATTEMPT, submitPayload)).toMatchObject({
      scale_code: "RIASEC",
      form_code: "riasec_60",
      answered_count: 60,
      durationMs: 180000,
      duration_ms: 180000,
      locale: "zh",
    });
    expect(JSON.stringify([startPayload, submitPayload])).not.toContain("person@example.com");
    expect(JSON.stringify([startPayload, submitPayload])).not.toContain("unsafe_param");
  });

  it("dispatches canonical view_result and preserves RIASEC-specific result event as secondary", async () => {
    const viewModel = assembleRiasecResultViewModel(reportFromProjection());

    render(<RiasecResultShell locale="zh" attemptId="attempt-riasec-result-view" viewModel={viewModel} />);

    await waitFor(() => {
      expect(hoisted.trackObservableFunnelEvent).toHaveBeenCalledWith(
        TRACKING_EVENTS.VIEW_RESULT,
        expect.objectContaining({
          scale_code: "RIASEC",
          form_code: "riasec_60",
          attempt_id: "attempt-riasec-result-view",
          locale: "zh",
        })
      );
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        RIASEC_TRACKING_EVENTS.resultView,
        expect.objectContaining({
          scale_code: "RIASEC",
          form_code: "riasec_60",
          locale: "zh",
        })
      );
    });
    const canonicalPayload = hoisted.trackObservableFunnelEvent.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(canonicalPayload).not.toHaveProperty("result_type");
    expect(canonicalPayload).not.toHaveProperty("top_code");
    expect(canonicalPayload).not.toHaveProperty("typeCode");
    expect(canonicalPayload).not.toHaveProperty("identity");
  });

  it("keeps RIASEC take flow on canonical start_attempt and submit_attempt source paths", () => {
    const takeClient = readText("app/(localized)/[locale]/tests/[slug]/take/RiasecTakeClient.tsx");
    const resultShell = readText("components/result/riasec/RiasecResultShell.tsx");

    expect(takeClient).toContain("TRACKING_EVENTS.START_ATTEMPT");
    expect(takeClient).toContain("TRACKING_EVENTS.SUBMIT_ATTEMPT");
    expect(takeClient).toContain("trackObservableFunnelEvent");
    expect(resultShell).toContain("trackObservableFunnelEvent");
    expect(takeClient).toContain("buildRiasecStartAttemptTrackingPayload");
    expect(takeClient).toContain("buildRiasecSubmitAttemptTrackingPayload");
    expect(takeClient).not.toContain('"start_click"');
    expect(takeClient).not.toContain('"submit_click"');
  });
});
