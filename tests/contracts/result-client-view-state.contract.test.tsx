import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import resultReadyMbtiFreeFixture from "@/tests/fixtures/result_ready.mbti.free.json";

type ChildrenProps = {
  children?: ReactNode;
};

type RichResultReportProps = {
  reportData?: {
    summary?: string;
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
  canRenderRichResultReport: (report: { summary?: string; report?: { sections?: unknown; profile?: unknown } } | null) =>
    Boolean(report?.summary || report?.report?.sections || report?.report?.profile),
  isGeneratingReportResponse: (report: { generating?: boolean } | null) => report?.generating === true,
  resolveReportScaleCode: (report: { report?: { scale_code?: string } } | null) =>
    report?.report?.scale_code === "MBTI" ? "MBTI" : null,
  RichResultReport: ({ reportData }: RichResultReportProps) => (
    <div data-testid="rich-result-report">
      {reportData?.report?.profile?.short_summary ?? reportData?.summary ?? reportData?.report?.profile?.type_code ?? "rich-report"}
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

  it("renders the rich report view when the report endpoint is ready", async () => {
    const reportFixture = cloneFixture(reportReadyMbtiFreeFixture) as ReportResponse;
    hoisted.fetchAttemptReport.mockResolvedValue(reportFixture);

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveTextContent("你像一团既明亮又敏感的火焰");
    });

    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
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
