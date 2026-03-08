import type { ButtonHTMLAttributes, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClinicalReportClient from "@/components/clinical/report/ClinicalReportClient";

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
  fetchAttemptResult: hoisted.fetchAttemptResult,
}));

vi.mock("@/lib/clinical/api", () => ({
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
