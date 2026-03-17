import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { buildMbtiCareerRecommendationHref } from "@/lib/mbti/publicProjection";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";
import resultReadyMbtiFreeFixture from "@/tests/fixtures/result_ready.mbti.free.json";

type ChildrenProps = {
  children?: ReactNode;
};

type RichResultReportProps = {
  reportData?: {
    summary?: string;
    mbti_public_projection_v1?: {
      summary_card?: {
        summary?: string;
      };
    };
    report?: {
      profile?: {
        type_code?: string;
        short_summary?: string;
      };
    };
  };
};

function cloneFixture<T>(fixture: T): T {
  return structuredClone(fixture);
}

const hoisted = vi.hoisted(() => ({
  fetchAttemptReport: vi.fn(),
  fetchAttemptResult: vi.fn(),
  trackEvent: vi.fn(),
  captureError: vi.fn(),
  classifyApiError: vi.fn(() => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  })),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

vi.mock("@/components/design/AnticipationSkeleton", () => ({
  AnticipationSkeleton: () => <div data-testid="skeleton">processing-skeleton</div>,
}));

vi.mock("@/components/result/RichResultReport", () => ({
  canRenderRichResultReport: (
    report: {
      summary?: string;
      mbti_public_projection_v1?: unknown;
      report?: { sections?: unknown; profile?: unknown };
    } | null
  ) => Boolean(report?.mbti_public_projection_v1 || report?.summary || report?.report?.sections || report?.report?.profile),
  isGeneratingReportResponse: (report: { generating?: boolean } | null) => report?.generating === true,
  resolveReportScaleCode: (report: { report?: { scale_code?: string } } | null) =>
    report?.report?.scale_code === "MBTI" ? "MBTI" : null,
  RichResultReport: ({ reportData }: RichResultReportProps) => (
    <div data-testid="rich-result-report">
      {reportData?.mbti_public_projection_v1?.summary_card?.summary
        ?? reportData?.report?.profile?.short_summary
        ?? reportData?.summary
        ?? reportData?.report?.profile?.type_code
        ?? "rich-report"}
    </div>
  ),
}));

vi.mock("@/components/result/DimensionBars", () => ({
  DimensionBars: ({ dimensions }: { dimensions: unknown[] }) => (
    <div data-testid="dimension-bars">dimensions:{dimensions.length}</div>
  ),
}));

vi.mock("@/components/result/ResultSummary", () => ({
  ResultSummary: ({ typeCode, summary }: { typeCode?: string; summary?: string }) => (
    <div data-testid="result-summary">
      <span>{typeCode ?? ""}</span>
      <span>{summary ?? ""}</span>
    </div>
  ),
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: ChildrenProps) => <div role="alert">{children}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_result_test",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenRequestError: () => false,
}));

vi.mock("@/lib/api/v0_3", () => ({
  fetchAttemptReport: hoisted.fetchAttemptReport,
  fetchAttemptResult: hoisted.fetchAttemptResult,
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    loading: {
      phases: ["phase-1", "phase-2"],
    },
    orders: {
      reportGenerating: "Report is still generating.",
    },
    result: {
      title: "Result title",
      reportUnavailable: "Report unavailable.",
    },
  }),
}));

vi.mock("@/lib/i18n/locales", () => ({
  getLocaleFromPathname: () => "en",
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: hoisted.classifyApiError,
}));

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

describe("ResultClient view-state contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes the public career next step through the runtime 32-type slug", () => {
    expect(buildMbtiCareerRecommendationHref("en", "ENFP-T")).toBe("/en/career/recommendations/mbti/enfp-t");
    expect(buildMbtiCareerRecommendationHref("zh", "INTJ-A")).toBe("/zh/career/recommendations/mbti/intj-a");
  });

  it("keeps the MBTI page on the rich report path when projection is ready even if legacy hero fields are thin", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    expect(reportFixture.mbti_public_projection_v1?.canonical_type_code).toBe("ENFP");
    expect(reportFixture.mbti_access_hub_v1?.report_access?.attempt_id).toBe("attempt-123");
    expect(reportFixture.cta).toMatchObject({
      visible: true,
      kind: "upsell",
      target_sku: "MBTI_REPORT_FULL",
      target_sku_effective: "MBTI_REPORT_FULL_199",
    });
    expect(reportFixture.modules_offered).toEqual(["career", "relationships", "core_full"]);
    expect(reportFixture.modules_preview).toEqual(["career", "relationships", "core_full"]);
    expect(Array.isArray(reportFixture.report?.recommended_reads)).toBe(true);
    expect(reportFixture.report?.layers?.identity).toMatchObject({
      title: "Legacy authored overview title",
      subtitle: "Legacy authored overview subtitle",
    });
    reportFixture.summary = undefined;
    if (reportFixture.report) {
      reportFixture.report.identity_card = {
        type_code: "ENFP-T",
      };
      reportFixture.report.profile = {
        type_code: "ENFP-T",
      };
    }
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveTextContent(
        "Projection-first summary that should replace the legacy hero copy on result pages."
      );
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
    expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dimension-bars")).not.toBeInTheDocument();
  });

  it("keeps the page in processing state when the report endpoint is still generating", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiFreeFixture) as ReportResponse;
    reportFixture.generating = true;
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is still generating.");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByTestId("rich-result-report")).not.toBeInTheDocument();
  });

  it("falls back to the legacy result view only when the report payload is not renderable", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiFreeFixture) as ReportResponse;
    expect(reportFixture.cta?.kind).toBe("upsell");
    expect(Array.isArray(reportFixture.report?.recommended_reads)).toBe(true);
    expect(reportFixture.report?.layers?.identity).toBeTruthy();
    expect(reportFixture.modules_offered).toEqual(["career", "relationships", "core_full"]);
    expect(reportFixture.modules_preview).toEqual(["career", "relationships", "core_full"]);

    reportFixture.summary = undefined;
    reportFixture.report = {
      recommended_reads: reportFixture.report?.recommended_reads ?? [],
      layers: reportFixture.report?.layers,
      axis_states: reportFixture.report?.axis_states,
      tags: reportFixture.report?.tags,
      highlights: reportFixture.report?.highlights,
    };

    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);
    hoisted.fetchAttemptResult.mockResolvedValue(cloneFixture(resultReadyMbtiFreeFixture) as ResultResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-summary")).toHaveTextContent("ENFP-T");
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
    expect(hoisted.fetchAttemptResult).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
    expect(screen.getByTestId("dimension-bars")).toHaveTextContent("dimensions:0");
    expect(screen.queryByTestId("rich-result-report")).not.toBeInTheDocument();
  });

  it("falls back to the legacy result view when the report endpoint is unavailable", async () => {
    hoisted.fetchAttemptReport.mockRejectedValue(new Error("Report missing."));
    hoisted.fetchAttemptResult.mockResolvedValue(cloneFixture(resultReadyMbtiFreeFixture) as ResultResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-summary")).toHaveTextContent("ENFP-T");
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledTimes(1);
    expect(hoisted.fetchAttemptResult).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
    expect(screen.getByTestId("dimension-bars")).toHaveTextContent("dimensions:0");
    expect(screen.queryByTestId("rich-result-report")).not.toBeInTheDocument();
  });
});

function createMbtiAccessHubRaw(attemptId: string): MbtiAccessHubV1Raw {
  return {
    access_state: "locked",
    report_access: {
      can_view_report: true,
      attempt_id: attemptId,
      order_no: "ord_result_view_state_001",
      report_url: `/api/v0.3/attempts/${attemptId}/report`,
      source: "report_gate",
    },
    pdf_access: {
      can_download_pdf: false,
      report_pdf_url: null,
      source: "none",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: false,
      can_resend: false,
      attempt_id: attemptId,
      share_id: null,
      compare_invite_id: null,
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}
