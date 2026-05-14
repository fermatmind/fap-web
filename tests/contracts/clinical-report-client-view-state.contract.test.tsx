import type { ButtonHTMLAttributes, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClinicalReportClient from "@/components/clinical/report/ClinicalReportClient";
import pilotEnvelope from "@/tests/fixtures/big5/result_page_v2/pilot_o59_staging_payload_v0_1.payload.json";

type ChildrenProps = {
  children?: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

type OfferCardProps = {
  offer?: {
    sku?: string;
  };
};

type SectionProps = {
  section?: {
    key?: string;
  };
};

type AnimatedCounterProps = {
  value: number;
};

type LinkProps = {
  children?: ReactNode;
  href: string;
  className?: string;
};

const hoisted = vi.hoisted(() => ({
  fetchAttemptReportAccess: vi.fn(),
  fetchAttemptReportForRichResult: vi.fn(),
  fetchClinicalReport: vi.fn(),
  createCheckoutOrOrder: vi.fn(),
  fetchAttemptResult: vi.fn(),
  trackEvent: vi.fn(),
  captureError: vi.fn(),
  classifyApiError: vi.fn(() => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  })),
  resolveScaleRollout: vi.fn(() => ({
    paywallMode: "default",
    commerceEnabled: true,
  })),
  routerPush: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, className }: LinkProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/attempts/attempt-456/report",
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
}));

vi.mock("@/components/big5/paywall/OfferCard", () => ({
  OfferCard: ({ offer }: OfferCardProps) => <div data-testid="offer-card">{offer?.sku ?? "offer-card"}</div>,
}));

vi.mock("@/components/clinical/report/CrisisOverlay", () => ({
  CrisisOverlay: () => <div data-testid="crisis-overlay">crisis-overlay</div>,
}));

vi.mock("@/components/clinical/report/ReportSectionRenderer", () => ({
  ReportSectionRenderer: ({ section }: SectionProps) => <div data-testid="report-section">{section?.key ?? "section"}</div>,
}));

vi.mock("@/components/clinical/report/SdsFactorPanel", () => ({
  SdsFactorPanel: () => <div data-testid="sds-factor-panel">sds-factor-panel</div>,
}));

vi.mock("@/components/commerce/UnlockCTA", () => ({
  UnlockCTA: () => <div data-testid="unlock-cta">unlock-cta</div>,
}));

vi.mock("@/components/design/AnimatedCounter", () => ({
  AnimatedCounter: ({ value }: AnimatedCounterProps) => <span data-testid="animated-counter">{value}</span>,
}));

vi.mock("@/components/design/AnticipationSkeleton", () => ({
  AnticipationSkeleton: () => <div data-testid="skeleton">processing-skeleton</div>,
}));

vi.mock("@/components/result/RichResultReport", () => ({
  canRenderRichResultReport: (
    report: {
      scale_code?: string;
      big5_result_page_v2?: unknown;
      riasec_public_projection_v2?: unknown;
      report?: { scale_code?: string } | unknown[];
    } | null
  ) => Boolean(report?.big5_result_page_v2 || report?.riasec_public_projection_v2),
  RichResultReport: ({ reportData }: { reportData?: { big5_result_page_v2?: unknown; riasec_public_projection_v2?: unknown } }) => (
    <div data-testid="rich-result-report">
      {reportData?.riasec_public_projection_v2 ? "riasec-snapshot-rich-report" : "big5-v2-rich-report"}
    </div>
  ),
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: ChildrenProps) => <div role="alert">{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonProps) => <button {...props}>{children}</button>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_clinical_test",
}));

vi.mock("@/lib/api/v0_3", () => ({
  createCheckoutOrOrder: hoisted.createCheckoutOrOrder,
  fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
  fetchAttemptResult: hoisted.fetchAttemptResult,
}));

function createAccessProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attempt_id: "attempt-456",
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: "/attempts/attempt-456/report",
      pdf_href: "/api/v0.3/attempts/attempt-456/report.pdf",
      wait_href: "/pay/wait?order_no=ord_clinical_1",
      lookup_href: "/orders/lookup",
    },
    meta: {
      produced_at: "2026-03-22T10:00:00Z",
      refreshed_at: "2026-03-22T10:00:00Z",
    },
    ...overrides,
  };
}

vi.mock("@/lib/clinical/api", () => ({
  fetchAttemptReportForRichResult: hoisted.fetchAttemptReportForRichResult,
  fetchClinicalReport: hoisted.fetchClinicalReport,
}));

vi.mock("@/lib/clinical/errors", () => ({
  mapClinicalError: (error: unknown) => ({
    message: error instanceof Error ? error.message : "Clinical report unavailable.",
  }),
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    loading: {
      phases: ["phase-1", "phase-2"],
    },
    result: {
      reportNotFoundFallback: "Report sync fallback.",
    },
  }),
}));

vi.mock("@/lib/i18n/locales", () => ({
  getLocaleFromPathname: () => "en",
  localizedPath: (path: string) => path,
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: hoisted.classifyApiError,
}));

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

vi.mock("@/lib/rollout/scaleRollout", () => ({
  resolveScaleRollout: hoisted.resolveScaleRollout,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("ClinicalReportClient view-state contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    hoisted.createCheckoutOrOrder.mockResolvedValue({ kind: "redirect", url: "/checkout" });
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
    hoisted.fetchAttemptReportForRichResult.mockResolvedValue({
      ok: true,
      meta: {
        scale_code: "SDS_20",
      },
      report: {
        scale_code: "SDS_20",
      },
    });
  });

  it("renders processing as processing-only ui when the report is generating", async () => {
    hoisted.fetchClinicalReport.mockResolvedValue({
      ok: true,
      generating: true,
      meta: {
        generating: true,
        scale_code: "SDS_20",
      },
      report: {
        scale_code: "SDS_20",
      },
    });
    hoisted.fetchAttemptReportAccess.mockResolvedValue(
      createAccessProjection({
        access_state: "pending",
        report_state: "pending",
        pdf_state: "unavailable",
      })
    );

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is generating. Please wait...");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("report-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("offer-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unlock-cta")).not.toBeInTheDocument();
  });

  it("renders ready as final-report-only ui", async () => {
    hoisted.fetchClinicalReport.mockResolvedValue({
      ok: true,
      locked: false,
      quality: {
        level: "trusted",
      },
      report: {
        scale_code: "SDS_20",
        sections: [{ key: "result_summary_free" }],
      },
      meta: {
        scale_code: "SDS_20",
      },
    });

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("report-section")).toHaveTextContent("result_summary_free");
    });

    expect(screen.queryByText("Report is generating. Please wait...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("renders Big Five V2 payload reports even when legacy generation remains pending", async () => {
    hoisted.fetchAttemptReportForRichResult.mockResolvedValue({
      ok: true,
      generating: true,
      meta: {
        generating: true,
        scale_code: "BIG5_OCEAN",
      },
      report: [],
      scale_code: "BIG5_OCEAN",
      big5_result_page_v2: structuredClone(pilotEnvelope).big5_result_page_v2,
    });
    hoisted.fetchClinicalReport.mockResolvedValue({
      ok: true,
      generating: true,
      meta: {
        generating: true,
        scale_code: "BIG5_OCEAN",
      },
      report: [],
      scale_code: "BIG5_OCEAN",
      big5_result_page_v2: structuredClone(pilotEnvelope).big5_result_page_v2,
    });

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveTextContent("big5-v2-rich-report");
    });

    expect(screen.queryByText("Report is generating. Please wait...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("routes RIASEC reports through the rich result renderer without clinical validation", async () => {
    hoisted.fetchAttemptReportForRichResult.mockResolvedValue({
      ok: true,
      meta: {
        scale_code: "RIASEC",
      },
      report: {
        scale_code: "RIASEC",
      },
      riasec_public_projection_v2: {
        schema_version: "riasec.public_projection.v2",
        measurement_evidence: {
          snapshot_bound: true,
        },
      },
    });

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("rich-result-report")).toHaveTextContent("riasec-snapshot-rich-report");
    });

    expect(hoisted.fetchAttemptReportForRichResult).toHaveBeenCalledWith({
      attemptId: "attempt-456",
      anonId: "anon_clinical_test",
      refresh: false,
    });
    expect(hoisted.fetchClinicalReport).not.toHaveBeenCalled();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
    expect(screen.queryByText("Report is generating. Please wait...")).not.toBeInTheDocument();
  });

  it("keeps the report page report-only and never calls the result endpoint", async () => {
    hoisted.fetchClinicalReport.mockResolvedValue({
      ok: true,
      locked: false,
      report: {
        scale_code: "CLINICAL_COMBO_68",
        sections: [{ key: "quick_overview" }],
      },
      meta: {
        scale_code: "CLINICAL_COMBO_68",
      },
    });

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByTestId("report-section")).toHaveTextContent("quick_overview");
    });

    expect(hoisted.fetchClinicalReport).toHaveBeenCalled();
    expect(hoisted.fetchAttemptResult).not.toHaveBeenCalled();
  });

  it("renders failed as failed-only ui when snapshot loading fails", async () => {
    hoisted.fetchClinicalReport.mockResolvedValue({
      ok: true,
      meta: {
        scale_code: "SDS_20",
        snapshot_error: true,
      },
      report: {
        scale_code: "SDS_20",
        sections: [{ key: "should_not_render" }],
      },
    });

    render(<ClinicalReportClient attemptId="attempt-456" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report snapshot failed. Please retry.");
    });

    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("report-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("offer-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unlock-cta")).not.toBeInTheDocument();
  });
});
