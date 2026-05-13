import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAttemptShare,
  fetchAttemptReport,
  fetchAttemptReportAccess,
  fetchAttemptReportPdfWithMeta,
  fetchAttemptResult,
  fetchRiasecTechnicalNote,
  getMyAttempts,
  getShareSummary,
  type ReportResponse,
} from "@/lib/api/v0_3";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json");

const hoisted = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_riasec_smoke",
  removePendingAnonLinkAttempts: vi.fn(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  getFmToken: () => null,
}));

vi.mock("@/lib/api-client", () => ({
  ApiError: class ApiError extends Error {
    status = 500;
    errorCode = "MOCK";
  },
  apiClient: {
    get: hoisted.get,
    post: hoisted.post,
  },
}));

type TrustedFixture = {
  scale_code: "RIASEC";
  projection: Record<string, unknown>;
};

function readFixture(): TrustedFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as TrustedFixture;
}

function projection(): Record<string, unknown> {
  return readFixture().projection;
}

function reportPayload(): ReportResponse {
  const payload = projection();

  return {
    ok: true,
    attempt_id: "attempt-riasec-smoke",
    scale_code: "RIASEC",
    type_code: String((payload.holland_code as { code?: unknown }).code ?? "IAS"),
    riasec_public_projection_v2: payload,
  } as ReportResponse;
}

function assertNoRawFeedbackOrUnsupportedClaims(payload: unknown): void {
  const text = JSON.stringify(payload);

  expect(text).not.toContain("feedback_text");
  expect(text).not.toContain('"raw_feedback_included":true');
  expect(text).not.toContain('"raw_feedback_public_exposure_allowed":true');
  expect(text).not.toContain("更准确");
  expect(text).not.toContain("more accurate");
  expect(text).not.toContain("raw delta");
  expect(text).not.toContain("score increased");
  expect(text).not.toContain("score decreased");
  expect(text).not.toContain("Matches");
  expect(text).not.toContain("career match");
  expect(text).not.toContain("occupation match");
  expect(text).not.toContain("job fit");
  expect(text).not.toContain("fit score");
  expect(text).not.toContain("success prediction");
  expect(text).not.toContain('"feedback_is_career_match":true');
  expect(text).not.toContain('"feedback_is_success_prediction":true');
  expect(text).not.toContain("recommended career");
}

describe("RIASEC Trusted Result v1.5 smoke acceptance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    hoisted.get.mockImplementation(async (url: string) => {
      if (url.startsWith("/v0.3/attempts/attempt-riasec-smoke/result")) {
        return reportPayload();
      }

      if (url.startsWith("/v0.3/attempts/attempt-riasec-smoke/report-access")) {
        return {
          ok: true,
          attempt_id: "attempt-riasec-smoke",
          scale_code: "RIASEC",
          report_state: "snapshot_bound",
          snapshot_bound: true,
          pdf_state: "ready",
        };
      }

      if (url.startsWith("/v0.3/attempts/attempt-riasec-smoke/report")) {
        return reportPayload();
      }

      if (url === "/v0.3/shares/share-riasec-smoke") {
        return {
          ok: true,
          share_id: "share-riasec-smoke",
          attempt_id: "attempt-riasec-smoke",
          scale_code: "RIASEC",
          riasec_public_projection_v2: projection(),
        };
      }

      if (url.startsWith("/v0.3/me/attempts")) {
        return {
          ok: true,
          scale_code: "RIASEC",
          items: [
            {
              attempt_id: "attempt-riasec-smoke",
              scale_code: "RIASEC",
              report_state: "snapshot_bound",
              riasec_public_projection_v2: projection(),
            },
          ],
          history_compare: {
            scale_code: "RIASEC",
            can_compare: false,
            reason: "cross_form_raw_score_delta_disabled",
          },
        };
      }

      if (url === "/v0.3/scales/RIASEC/technical-note") {
        return {
          ok: true,
          scale_code: "RIASEC",
          technical_note_v1: {
            schema_version: "riasec.technical_note.v0.1",
            scale_code: "RIASEC",
            method_boundary: {
              measures: ["vocational_interest"],
              does_not_measure: ["ability", "personality", "career_outcome_probability"],
            },
            sections: [],
          },
        };
      }

      throw new Error(`Unhandled GET ${url}`);
    });

    hoisted.post.mockImplementation(async (url: string) => {
      if (url === "/v0.3/attempts/attempt-riasec-smoke/share") {
        return {
          ok: true,
          share_id: "share-riasec-smoke",
          share_url: "https://www.fermatmind.com/zh/share/share-riasec-smoke",
          attempt_id: "attempt-riasec-smoke",
          scale_code: "RIASEC",
        };
      }

      throw new Error(`Unhandled POST ${url}`);
    });
  });

  it("smokes result, report, report-access, share, history, and Technical Note read paths", async () => {
    const result = await fetchAttemptResult({
      attemptId: "attempt-riasec-smoke",
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const report = await fetchAttemptReport({
      attemptId: "attempt-riasec-smoke",
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const reportAccess = await fetchAttemptReportAccess({
      attemptId: "attempt-riasec-smoke",
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const share = await createAttemptShare({
      attemptId: "attempt-riasec-smoke",
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const shareSummary = await getShareSummary({
      shareId: "share-riasec-smoke",
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const history = await getMyAttempts({
      scaleCode: "RIASEC",
      pageSize: 10,
      anonId: "anon_riasec_smoke",
      locale: "zh",
    });
    const technicalNote = await fetchRiasecTechnicalNote();

    expect(result.riasec_public_projection_v2?.schema_version).toBe("riasec.public_projection.v2");
    expect(report.riasec_public_projection_v2?.schema_version).toBe("riasec.public_projection.v2");
    expect(reportAccess).toMatchObject({ scale_code: "RIASEC", snapshot_bound: true, pdf_state: "ready" });
    expect(share).toMatchObject({ share_id: "share-riasec-smoke", scale_code: "RIASEC" });
    expect(shareSummary.riasec_public_projection_v2?.schema_version).toBe("riasec.public_projection.v2");
    expect((history.items?.[0]?.riasec_public_projection_v2 as Record<string, unknown> | undefined)?.schema_version).toBe(
      "riasec.public_projection.v2",
    );
    expect(history.history_compare).toMatchObject({
      can_compare: false,
      reason: "cross_form_raw_score_delta_disabled",
    });
    expect(technicalNote).toMatchObject({
      scale_code: "RIASEC",
      technical_note_v1: {
        scale_code: "RIASEC",
      },
    });

    expect(hoisted.get).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-riasec-smoke/result?locale=zh",
      expect.objectContaining({ headers: { "X-Anon-Id": "anon_riasec_smoke" } }),
    );
    expect(hoisted.get).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-riasec-smoke/report?locale=zh",
      expect.objectContaining({ headers: { "X-Anon-Id": "anon_riasec_smoke" } }),
    );
    expect(hoisted.get).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-riasec-smoke/report-access?locale=zh",
      expect.objectContaining({ headers: { "X-Anon-Id": "anon_riasec_smoke" } }),
    );
    expect(hoisted.post).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-riasec-smoke/share",
      { anon_id: "anon_riasec_smoke" },
      expect.objectContaining({ headers: { "X-Anon-Id": "anon_riasec_smoke" }, locale: "zh" }),
    );
    expect(hoisted.get).toHaveBeenCalledWith(
      "/v0.3/me/attempts?scale=RIASEC&page_size=10&locale=zh",
      expect.objectContaining({ headers: { "X-Anon-Id": "anon_riasec_smoke" } }),
    );
    expect(hoisted.get).toHaveBeenCalledWith("/v0.3/scales/RIASEC/technical-note", { skipAuth: true });

    for (const payload of [result, report, shareSummary, history, technicalNote]) {
      assertNoRawFeedbackOrUnsupportedClaims(payload);
    }
  });

  it("keeps the formal result view snapshot-bound and examples-only", () => {
    const viewModel = assembleRiasecResultViewModel(reportPayload());

    expect(viewModel.trustedResultCard).toMatchObject({
      projectionVersion: "riasec.public_projection.v2",
      snapshotBound: true,
      crossFormComparable: false,
      rawScoreDeltaAllowed: false,
      occupationExamplesPolicy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
    expect(viewModel.activityExplorer).toMatchObject({
      status: "content_examples_only",
      sourceStatus: "content_example_not_registry_match",
      registrySourceConnected: false,
      fitScoreAllowed: false,
      successPredictionAllowed: false,
    });
    expect(viewModel.feedbackOverlay).toMatchObject({
      snapshotBound: true,
      measuredResultGuard: {
        scoresMutationAllowed: false,
        hollandCodeMutationAllowed: false,
      },
      surfacePolicy: {
        sharePdfExposureAllowed: false,
        rawFeedbackPublicExposureAllowed: false,
      },
    });

    assertNoRawFeedbackOrUnsupportedClaims(viewModel);
  });

  it("smokes the RIASEC PDF read path without exposing feedback payloads", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toContain("/v0.3/attempts/attempt-riasec-smoke/report.pdf?inline=1");
      expect(init?.method).toBe("GET");
      expect(init?.headers).toBeInstanceOf(Headers);
      expect((init?.headers as Headers).get("Accept")).toBe("application/pdf");
      expect((init?.headers as Headers).get("X-Anon-Id")).toBe("anon_riasec_smoke");

      return new Response(new Uint8Array([0x25, 0x50, 0x44, 0x46]), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "X-Report-Filename-Hint": "fermatmind-riasec-snapshot.pdf",
          "X-Report-Form-Label": "RIASEC 60Q",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const pdf = await fetchAttemptReportPdfWithMeta({
      attemptId: "attempt-riasec-smoke",
      anonId: "anon_riasec_smoke",
      inline: true,
    });

    expect(pdf.filenameHint).toBe("fermatmind-riasec-snapshot.pdf");
    expect(pdf.formLabel).toBe("RIASEC 60Q");
    expect(pdf.blob.type).toBe("application/pdf");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
