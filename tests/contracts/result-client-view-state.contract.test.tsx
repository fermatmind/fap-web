import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";
import { ApiError } from "@/lib/api-client";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { buildMbtiCareerRecommendationHref } from "@/lib/mbti/publicProjection";
import { buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
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
  accessProjection?: {
    unlockStage?: string | null;
    unlockSource?: string | null;
  } | null;
};

function cloneFixture<T>(fixture: T): T {
  return structuredClone(fixture);
}

const hoisted = vi.hoisted(() => ({
  fetchAttemptReportAccess: vi.fn(),
  fetchAttemptInviteUnlockProgress: vi.fn(),
  fetchAttemptReport: vi.fn(),
  fetchAttemptResult: vi.fn(),
  fetchAttemptSubmission: vi.fn(),
  bindAttemptEmail: vi.fn(),
  getFmToken: vi.fn<() => string | null>(() => "fm_result_test_token"),
  setFmToken: vi.fn(),
  ensureFmTokenReady: vi.fn(),
  linkAnonAttemptsOnceOnLoginSuccess: vi.fn(),
  shouldLinkAnonAttemptsOnLoginSuccess: vi.fn(() => false),
  pendingAnonLinkAttempts: [] as string[],
  search: "",
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
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/components/design/AnticipationSkeleton", () => ({
  AnticipationSkeleton: () => <div data-testid="skeleton">processing-skeleton</div>,
}));

vi.mock("@/components/result/RichResultReport", () => ({
  canRenderRichResultReport: (
    report: {
      summary?: string;
      big5_public_projection_v1?: unknown;
      mbti_public_projection_v1?: unknown;
      report?: { sections?: unknown; profile?: unknown };
    } | null
  ) =>
    Boolean(
      report?.mbti_public_projection_v1
      || report?.big5_public_projection_v1
      || report?.summary
      || report?.report?.sections
      || report?.report?.profile
    ),
  isGeneratingReportResponse: (report: { generating?: boolean } | null) => report?.generating === true,
  resolveReportScaleCode: (report: { report?: { scale_code?: string } } | null) =>
    report?.report?.scale_code === "MBTI"
      ? "MBTI"
      : report?.report?.scale_code === "BIG5_OCEAN"
        ? "BIG5_OCEAN"
        : null,
  RichResultReport: ({ reportData, accessProjection }: RichResultReportProps) => (
    <div
      data-testid="rich-result-report"
      data-unlock-stage={accessProjection?.unlockStage ?? ""}
      data-unlock-source={accessProjection?.unlockSource ?? ""}
    >
      {reportData?.mbti_public_projection_v1?.summary_card?.summary
        ?? (reportData as { big5_public_projection_v1?: { explainability_summary?: { headline?: string } } } | undefined)
          ?.big5_public_projection_v1?.explainability_summary?.headline
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
  readPendingAnonLinkAttempts: () => hoisted.pendingAnonLinkAttempts,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: hoisted.ensureFmTokenReady,
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenRequestError: () => false,
  getFmToken: hoisted.getFmToken,
  setFmToken: hoisted.setFmToken,
}));

vi.mock("@/lib/api/v0_3", () => ({
  bindAttemptEmail: hoisted.bindAttemptEmail,
  fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
  fetchAttemptInviteUnlockProgress: hoisted.fetchAttemptInviteUnlockProgress,
  fetchAttemptReport: hoisted.fetchAttemptReport,
  fetchAttemptResult: hoisted.fetchAttemptResult,
  fetchAttemptSubmission: hoisted.fetchAttemptSubmission,
  linkAnonAttemptsOnceOnLoginSuccess: hoisted.linkAnonAttemptsOnceOnLoginSuccess,
  shouldLinkAnonAttemptsOnLoginSuccess: hoisted.shouldLinkAnonAttemptsOnLoginSuccess,
}));

function createAccessProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attempt_id: "attempt-123",
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    unlock_stage: "locked",
    unlock_source: "none",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: "/result/attempt-123",
      pdf_href: "/api/v0.3/attempts/attempt-123/report.pdf",
      history_href: "/history/mbti",
      lookup_href: "/orders/lookup",
    },
    meta: {
      produced_at: "2026-03-22T10:00:00Z",
      refreshed_at: "2026-03-22T10:00:00Z",
    },
    ...overrides,
  };
}

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
  localizedPath: (path: string) => `/en${path.startsWith("/") ? path : `/${path}`}`,
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
    hoisted.search = "";
    hoisted.pendingAnonLinkAttempts = [];
    hoisted.getFmToken.mockReturnValue("fm_result_test_token");
    hoisted.ensureFmTokenReady.mockResolvedValue("issued");
    hoisted.linkAnonAttemptsOnceOnLoginSuccess.mockResolvedValue(undefined);
    hoisted.shouldLinkAnonAttemptsOnLoginSuccess.mockReturnValue(false);
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.fetchAttemptInviteUnlockProgress.mockResolvedValue({
      ok: true,
      invite_code: "invite_result_test_001",
      required_invitees: 2,
      completed_invitees: 0,
    });
    hoisted.fetchAttemptResult.mockResolvedValue(cloneFixture(resultReadyMbtiFreeFixture) as ResultResponse);
    hoisted.fetchAttemptSubmission.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-123",
      submission: {
        id: "sub_123",
        state: "succeeded",
      },
      generating: false,
    });
    hoisted.bindAttemptEmail.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-123",
      status: "active",
      result_url: "/en/result/attempt-123",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("routes the public career next step through the runtime 32-type slug", () => {
    expect(buildMbtiCareerRecommendationHref("en", "ENFP-T")).toBe("/en/career/recommendations/mbti/enfp-t");
    expect(buildMbtiCareerRecommendationHref("zh", "INTJ-A")).toBe("/zh/career/recommendations/mbti/intj-a");
  });

  it("does not persist or link from a raw result URL bearer token", async () => {
    hoisted.search = "token=fm_url_bearer_result_123456";
    hoisted.pendingAnonLinkAttempts = ["attempt_pending_from_queue"];
    hoisted.getFmToken.mockReturnValue(null);
    hoisted.fetchAttemptReport.mockResolvedValue(cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.setFmToken).not.toHaveBeenCalled();
    expect(hoisted.shouldLinkAnonAttemptsOnLoginSuccess).not.toHaveBeenCalled();
    expect(hoisted.linkAnonAttemptsOnceOnLoginSuccess).not.toHaveBeenCalled();
  });

  it("passes result lookup access_token through result read APIs", async () => {
    hoisted.search = "access_token=result_lookup_token_123";
    hoisted.fetchAttemptReport.mockResolvedValue(cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: "attempt-123",
        accessToken: "result_lookup_token_123",
      })
    );
    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: "attempt-123",
        accessToken: "result_lookup_token_123",
      })
    );
  });

  it("links pending result attempts with an existing stored auth token", async () => {
    hoisted.pendingAnonLinkAttempts = ["attempt_pending_from_queue"];
    hoisted.getFmToken.mockReturnValue("fm_stored_result_link_123456");
    hoisted.shouldLinkAnonAttemptsOnLoginSuccess.mockReturnValue(true);
    hoisted.fetchAttemptReport.mockResolvedValue(cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(hoisted.linkAnonAttemptsOnceOnLoginSuccess).toHaveBeenCalledWith({
        authToken: "fm_stored_result_link_123456",
        anonId: "anon_result_test",
        attemptIds: ["attempt-123", "attempt_pending_from_queue"],
      });
    });

    expect(hoisted.setFmToken).not.toHaveBeenCalled();
    expect(hoisted.shouldLinkAnonAttemptsOnLoginSuccess).toHaveBeenCalledWith({
      authToken: "fm_stored_result_link_123456",
      anonId: "anon_result_test",
      attemptIds: ["attempt-123", "attempt_pending_from_queue"],
    });
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
      locale: "en",
    });
    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_result_test",
      forceRefresh: true,
      locale: "en",
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledTimes(1);
    expect(hoisted.fetchAttemptReport).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-stage", "locked");
    expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-source", "none");
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dimension-bars")).not.toBeInTheDocument();
  });

  it("shows the email gate for EMAIL_BIND_REQUIRED and reloads after binding", async () => {
    hoisted.fetchAttemptReportAccess.mockRejectedValueOnce(
      new ApiError({
        status: 428,
        errorCode: "EMAIL_BIND_REQUIRED",
        message: "email binding required to view this result.",
        details: {
          attempt_id: "attempt-123",
          bind_endpoint: "/api/v0.3/attempts/attempt-123/email-bind",
        },
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-email-gate")).toHaveTextContent(
        "输入邮箱即可查看并找回该邮箱下保存的结果，请使用你自己的邮箱。"
      );
    });

    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId("result-email-gate-input"), {
      target: { value: "Owner@Example.Test" },
    });
    fireEvent.submit(screen.getByTestId("result-email-gate-submit").closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(hoisted.bindAttemptEmail).toHaveBeenCalledWith({
        attemptId: "attempt-123",
        email: "owner@example.test",
        anonId: "anon_result_test",
        locale: "en",
        surface: "result_gate",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledTimes(2);
  });

  it("keeps MBTI continue-test attribution params for recommendation scene links", () => {
    const recommendationAttribution = buildMbtiEntryTrackingPayload({
      locale: "en",
      formCode: "mbti_144",
      entrySurface: "mbti_career_recommendation_detail",
      sourcePageType: "recommendation_detail",
      targetAction: "start_mbti_test_recommendation_intp_team",
      sourcePath: "/en/career/recommendations/mbti/intp-a",
    });

    expect(recommendationAttribution).toMatchObject({
      form_code: "mbti_144",
      entry_surface: "mbti_career_recommendation_detail",
      source_page_type: "recommendation_detail",
      target_action: "start_mbti_test_recommendation_intp_team",
      test_slug: "mbti-personality-test-16-personality-types",
      locale: "en",
      landing_path: "/en/career/recommendations/mbti/intp-a",
    });
  });

  it("keeps the page on the rich report path when report access is locked but the report page is ready", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        access_state: "locked",
        report_state: "ready",
        pdf_state: "missing",
        actions: {
          page_href: "/result/attempt-123",
          pdf_href: null,
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
  });

  it("keeps BIG5 on the rich report path when report access and report payload are both ready", async () => {
    const reportFixture = {
      locked: false,
      variant: "full",
      quality: { level: "A" },
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
        },
      },
      report: {
        scale_code: "BIG5_OCEAN",
        profile: {
          type_name: "Openness-led profile",
        },
        sections: [
          {
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [{ kind: "paragraph", body: "Big Five overview block." }],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } as ReportResponse;

    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        attempt_id: "attempt-big5-123",
        actions: {
          page_href: "/result/attempt-big5-123",
          pdf_href: "/api/v0.3/attempts/attempt-big5-123/report.pdf",
          history_href: "/history/big5",
          lookup_href: "/orders/lookup",
        },
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-big5-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveTextContent(
        "This profile is primarily driven by Openness."
      );
    });

    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt-big5-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-big5-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptInviteUnlockProgress).not.toHaveBeenCalled();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
  });

  it("keeps the page in processing state when the report endpoint is still generating", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiFreeFixture) as ReportResponse;
    reportFixture.generating = true;
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        report_state: "pending",
        pdf_state: "unavailable",
        reason_code: "projection_pending",
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is still generating.");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByTestId("rich-result-report")).not.toBeInTheDocument();
  });

  it("shows MBTI critical-surface loading shell early after access projection is identified", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        report_state: "pending",
        pdf_state: "unavailable",
        reason_code: "projection_pending",
        mbti_form_v1: {
          form_code: "mbti_93",
          scale_code: "MBTI",
        },
      })
    );
    hoisted.fetchAttemptReport.mockReset();

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-loading-critical-surface")).toBeInTheDocument();
    });

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_report_loading_phase",
      expect.objectContaining({
        scale_code: "MBTI",
        phase: "result_bootstrap_start",
        stage_detail: "access_projection_loaded",
      })
    );
    expect(hoisted.fetchAttemptReport).not.toHaveBeenCalled();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("shows an actionable failure state instead of MBTI loading shell when submission ended with different answers conflict", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        access_state: "unavailable",
        report_state: "unavailable",
        pdf_state: "unavailable",
        reason_code: "report_unavailable",
        mbti_form_v1: {
          form_code: "mbti_93",
          scale_code: "MBTI",
        },
      })
    );
    hoisted.fetchAttemptResult.mockRejectedValue(
      new ApiError({
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
        message: "result not found.",
      })
    );
    hoisted.fetchAttemptSubmission.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-123",
      generating: false,
      submission: {
        id: "sub_conflict_123",
        state: "failed",
        error_message: "attempt already submitted with different answers.",
      },
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("already submitted with different answers");
    });

    const restartLink = screen.getByTestId("mbti-result-force-retake-link");
    expect(restartLink).toHaveAttribute(
      "href",
      expect.stringContaining("force_new_attempt=1&reason=submission_conflict")
    );
    expect(screen.queryByTestId("mbti-loading-critical-surface")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("keeps the page in processing state when report access is 404 but submission is still pending", async () => {
    hoisted.fetchAttemptReportAccess.mockRejectedValue(
      new ApiError({
        status: 404,
        errorCode: "ATTEMPT_NOT_FOUND",
        message: "attempt not found.",
      })
    );
    hoisted.fetchAttemptResult.mockRejectedValue(
      new ApiError({
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
        message: "result not found.",
      })
    );
    hoisted.fetchAttemptSubmission.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-123",
      generating: true,
      submission: {
        id: "sub_pending_123",
        state: "pending",
      },
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is still generating.");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledTimes(2);
    expect(hoisted.fetchAttemptSubmission).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
  });

  it("retries report-access without auth/anon once when ATTEMPT_NOT_FOUND is returned", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess
      .mockRejectedValueOnce(
        new ApiError({
          status: 404,
          errorCode: "ATTEMPT_NOT_FOUND",
          message: "attempt not found.",
        })
      )
      .mockResolvedValueOnce(createAccessProjection());
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.fetchAttemptReportAccess).toHaveBeenNthCalledWith(1, {
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenNthCalledWith(2, {
      attemptId: "attempt-123",
      locale: "en",
      skipAuth: true,
      includeAnonId: false,
    });
    expect(hoisted.fetchAttemptReport).toHaveBeenCalledTimes(1);
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
  });

  it("retries report without auth/anon once when ATTEMPT_NOT_FOUND is returned", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.fetchAttemptReport
      .mockRejectedValueOnce(
        new ApiError({
          status: 404,
          errorCode: "ATTEMPT_NOT_FOUND",
          message: "attempt not found.",
        })
      )
      .mockResolvedValueOnce(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenNthCalledWith(1, {
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptReport).toHaveBeenNthCalledWith(2, {
      attemptId: "attempt-123",
      locale: "en",
      skipAuth: true,
      includeAnonId: false,
    });
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
  });

  it("retries invite-unlocks without auth/anon once when ATTEMPT_NOT_FOUND is returned", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);
    hoisted.fetchAttemptInviteUnlockProgress
      .mockRejectedValueOnce(
        new ApiError({
          status: 404,
          errorCode: "ATTEMPT_NOT_FOUND",
          message: "attempt not found.",
        })
      )
      .mockResolvedValueOnce({
        ok: true,
        invite_code: "invite_retry_001",
        required_invitees: 2,
        completed_invitees: 0,
      });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenCalledTimes(2);
    });

    expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenNthCalledWith(1, {
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenNthCalledWith(2, {
      attemptId: "attempt-123",
      locale: "en",
      skipAuth: true,
      includeAnonId: false,
    });
  });

  it("applies invite-unlocks polling updates from partial to full on the visible report state", async () => {
    const intervalCallbacks: Array<() => void> = [];
    const setIntervalSpy = vi
      .spyOn(window, "setInterval")
      .mockImplementation(((callback: TimerHandler) => {
        if (typeof callback === "function") {
          intervalCallbacks.push(callback as () => void);
        }
        return 1 as unknown as ReturnType<typeof setInterval>;
      }) as unknown as typeof window.setInterval);
    const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(() => {});

    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        unlock_stage: "partial",
        unlock_source: "invite",
        payload: {
          scale_code: "MBTI",
          unlock_stage: "partial",
          unlock_source: "invite",
        },
        invite_unlock_diag_v1: {
          status: "partial_unlock",
          status_reason: "unlock_stage_partial",
          progress_percent: 50,
        },
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);
    hoisted.fetchAttemptInviteUnlockProgress
      .mockResolvedValueOnce({
        ok: true,
        status: "in_progress",
        required_invitees: 2,
        completed_invitees: 1,
        unlock_stage: "partial",
        unlock_source: "invite",
        invite_unlock_diag_v1: {
          status: "partial_unlock",
          status_reason: "unlock_stage_partial",
          remaining_invitees: 1,
          progress_percent: 50,
          snapshot_at: "2026-04-06T06:00:00+00:00",
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: "completed",
        required_invitees: 2,
        completed_invitees: 2,
        unlock_stage: "full",
        unlock_source: "invite",
        invite_unlock_diag_v1: {
          status: "full_unlock",
          status_reason: "unlock_stage_full",
          remaining_invitees: 0,
          progress_percent: 100,
          snapshot_at: "2026-04-06T06:00:15+00:00",
        },
      });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-stage", "partial");
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-source", "invite");
    });

    expect(intervalCallbacks.length).toBeGreaterThan(0);
    intervalCallbacks.forEach((callback) => {
      callback();
    });

    await waitFor(() => {
      expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-stage", "full");
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-source", "invite");
    });

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("keeps report-access as unlock authority when invite-unlocks snapshots are locked", async () => {
    const intervalCallbacks: Array<() => void> = [];
    const setIntervalSpy = vi
      .spyOn(window, "setInterval")
      .mockImplementation(((callback: TimerHandler) => {
        if (typeof callback === "function") {
          intervalCallbacks.push(callback as () => void);
        }
        return 1 as unknown as ReturnType<typeof setInterval>;
      }) as unknown as typeof window.setInterval);
    const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(() => {});

    const reportFixture = cloneFixture(reportReadyMbtiProjectionFixture) as ReportResponse;
    reportFixture.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-123");
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        unlock_stage: "full",
        unlock_source: "payment",
        payload: {
          scale_code: "MBTI",
          unlock_stage: "full",
          unlock_source: "payment",
        },
      })
    );
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);
    hoisted.fetchAttemptInviteUnlockProgress
      .mockResolvedValueOnce({
        ok: true,
        has_invite: false,
        required_invitees: 2,
        completed_invitees: 0,
        unlock_stage: "locked",
        unlock_source: "mixed",
      })
      .mockResolvedValueOnce({
        ok: true,
        has_invite: false,
        required_invitees: 2,
        completed_invitees: 0,
        unlock_stage: "locked",
        unlock_source: "mixed",
      });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-stage", "full");
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-source", "payment");
    });

    expect(intervalCallbacks.length).toBeGreaterThan(0);
    intervalCallbacks.forEach((callback) => callback());

    await waitFor(() => {
      expect(hoisted.fetchAttemptInviteUnlockProgress).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-stage", "full");
      expect(screen.getByTestId("rich-result-report")).toHaveAttribute("data-unlock-source", "payment");
    });

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_progress_advanced",
      expect.objectContaining({
        attempt_id: "attempt-123",
        completed_invitees: 0,
        required_invitees: 2,
        unlock_stage: "locked",
        unlock_source: "mixed",
      })
    );

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("does not trigger auth-mismatch retry for non-ATTEMPT_NOT_FOUND 404", async () => {
    hoisted.fetchAttemptReportAccess.mockRejectedValue(
      new ApiError({
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
        message: "result not found.",
      })
    );
    hoisted.fetchAttemptResult.mockResolvedValue(cloneFixture(resultReadyMbtiFreeFixture) as ResultResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-summary")).toHaveTextContent("ENFP-T");
    });

    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledTimes(1);
    expect(hoisted.fetchAttemptReport).not.toHaveBeenCalled();
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

    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);
    hoisted.fetchAttemptResult.mockResolvedValue(cloneFixture(resultReadyMbtiFreeFixture) as ResultResponse);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-summary")).toHaveTextContent("ENFP-T");
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptResult).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
      locale: "en",
    });
    expect(screen.getByTestId("dimension-bars")).toHaveTextContent("dimensions:5");
    expect(screen.queryByTestId("rich-result-report")).not.toBeInTheDocument();
  });

  it("falls back to the legacy result view when the report endpoint is unavailable", async () => {
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
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
      locale: "en",
    });
    expect(screen.getByTestId("dimension-bars")).toHaveTextContent("dimensions:5");
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
