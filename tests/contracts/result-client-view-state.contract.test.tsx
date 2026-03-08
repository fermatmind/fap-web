import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";

type ChildrenProps = {
  children?: ReactNode;
};

const hoisted = vi.hoisted(() => ({
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

vi.mock("@/components/result/DimensionBars", () => ({
  DimensionBars: ({ dimensions }: { dimensions: unknown[] }) => (
    <div data-testid="dimension-bars">dimensions:{dimensions.length}</div>
  ),
}));

vi.mock("@/components/result/ResultSummary", () => ({
  ResultSummary: ({ summary }: { summary?: string }) => <div data-testid="result-summary">{summary}</div>,
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

  it("enters ready when the result endpoint returns a result payload", async () => {
    hoisted.fetchAttemptResult.mockResolvedValue({
      ok: true,
      result: {
        type_code: "EQ_HIGH",
        summary: "Ready summary",
        dimensions: [{ code: "self_awareness", score: 0.82 }],
      },
      meta: {
        scale_code: "EQ_60",
      },
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("result-summary")).toHaveTextContent("Ready summary");
    });

    expect(hoisted.fetchAttemptResult).toHaveBeenCalledWith({
      attemptId: "attempt-123",
      anonId: "anon_result_test",
    });
    expect(screen.getByTestId("dimension-bars")).toHaveTextContent("dimensions:1");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("enters processing when the result endpoint returns no result payload", async () => {
    hoisted.fetchAttemptResult.mockResolvedValue({
      ok: true,
      meta: {
        scale_code: "EQ_60",
      },
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is still generating.");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dimension-bars")).not.toBeInTheDocument();
  });

  it("enters failed on terminal result endpoint errors", async () => {
    hoisted.fetchAttemptResult.mockRejectedValue(new Error("Result load failed."));

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Result load failed.");
    });

    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("result-summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dimension-bars")).not.toBeInTheDocument();
  });
});
