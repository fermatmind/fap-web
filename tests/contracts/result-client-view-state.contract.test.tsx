import type { ButtonHTMLAttributes, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";

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

const hoisted = vi.hoisted(() => ({
  getAttemptReport: vi.fn(),
  fetchAttemptResult: vi.fn(),
  getScaleLookup: vi.fn(),
  createCheckoutOrOrder: vi.fn(),
  resendOrderDelivery: vi.fn(),
  trackEvent: vi.fn(),
  trackBig5Event: vi.fn(),
  buildBig5TrackingContext: vi.fn(async () => ({})),
  clearBig5ClientCaches: vi.fn(),
  computeManifestHash: vi.fn(async () => "manifest-hash"),
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
  setManifestFingerprint: vi.fn(),
  big5Store: {
    manifestFingerprint: null as string | null,
    setManifestFingerprint: vi.fn(),
    disclaimerVersion: "disclaimer-v1",
    disclaimerHash: "disclaimer-h1",
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
}));

vi.mock("@/components/big5/paywall/OfferCard", () => ({
  OfferCard: ({ offer }: OfferCardProps) => <div data-testid="offer-card">{offer?.sku ?? "offer-card"}</div>,
}));

vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({
  PdfDownloadButton: () => <button data-testid="pdf-download">pdf-download</button>,
}));

vi.mock("@/components/big5/report/SectionRenderer", () => ({
  SectionRenderer: ({ section }: SectionProps) => <div data-testid="section-renderer">{section?.key ?? "section"}</div>,
}));

vi.mock("@/components/clinical/report/ClinicalReportClient", () => ({
  default: () => <div data-testid="clinical-report-client">clinical-report-client</div>,
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

vi.mock("@/components/result/DimensionBars", () => ({
  DimensionBars: () => <div data-testid="dimension-bars">dimension-bars</div>,
}));

vi.mock("@/components/result/ResultSummary", () => ({
  ResultSummary: ({ summary }: { summary?: string }) => <div data-testid="result-summary">{summary}</div>,
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: ChildrenProps) => <div role="alert">{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonProps) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: ChildrenProps) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: ChildrenProps) => <div>{children}</div>,
  CardContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  CardTitle: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_result_test",
}));

vi.mock("@/lib/auth/authRetry", () => ({
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenRequestError: () => false,
}));

vi.mock("@/lib/api/v0_3", () => ({
  createCheckoutOrOrder: hoisted.createCheckoutOrOrder,
  fetchAttemptResult: hoisted.fetchAttemptResult,
  getScaleLookup: hoisted.getScaleLookup,
  getAttemptReport: hoisted.getAttemptReport,
  resendOrderDelivery: hoisted.resendOrderDelivery,
}));

vi.mock("@/lib/big5/analytics", () => ({
  buildBig5TrackingContext: hoisted.buildBig5TrackingContext,
  trackBig5Event: hoisted.trackBig5Event,
}));

vi.mock("@/lib/big5/attemptStore", () => ({
  useBig5AttemptStore: (selector: (store: typeof hoisted.big5Store) => unknown) => selector(hoisted.big5Store),
}));

vi.mock("@/lib/big5/manifest", () => ({
  clearBig5ClientCaches: hoisted.clearBig5ClientCaches,
  computeManifestHash: hoisted.computeManifestHash,
}));

vi.mock("@/lib/commerce/checkoutAction", () => ({
  buildOrderWaitPath: () => "/orders/wait",
  regionFromLocale: () => "US",
  resolveCheckoutAction: () => ({
    kind: "redirect",
    url: "/checkout",
  }),
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
      paymentUnavailable: "Payment unavailable.",
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

describe("ResultClient view-state contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.getScaleLookup.mockResolvedValue({ capabilities: {} });
    hoisted.createCheckoutOrOrder.mockResolvedValue({ kind: "redirect", url: "/checkout" });
    hoisted.resendOrderDelivery.mockResolvedValue({ message: "sent" });
    hoisted.big5Store.manifestFingerprint = null;
    hoisted.big5Store.setManifestFingerprint = hoisted.setManifestFingerprint;
  });

  it("renders processing as processing-only ui", async () => {
    hoisted.getAttemptReport.mockResolvedValue({
      ok: true,
      generating: true,
      meta: {
        generating: true,
        scale_code: "MBTI",
      },
      report: {
        scale_code: "MBTI",
      },
    });
    hoisted.fetchAttemptResult.mockResolvedValue({
      ok: true,
      result: {
        summary: "fallback summary",
      },
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Report is still generating.");
    });

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByText("fallback summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("section-renderer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("offer-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unlock-cta")).not.toBeInTheDocument();
  });

  it("renders ready as final-result-only ui", async () => {
    hoisted.getAttemptReport.mockResolvedValue({
      ok: true,
      locked: true,
      generating: false,
      variant: "free",
      summary: "Ready summary",
      norms: {
        status: "CALIBRATED",
      },
      quality: {
        level: "trusted",
      },
      offers: [
        {
          sku: "sku_ready",
        },
      ],
      report: {
        scale_code: "MBTI",
        sections: [{ key: "section_ready" }],
      },
      meta: {
        scale_code: "MBTI",
      },
    });
    hoisted.fetchAttemptResult.mockResolvedValue({
      ok: true,
    });

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByText("Ready summary")).toBeInTheDocument();
    });

    expect(screen.queryByText("Report is still generating.")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(screen.getByTestId("section-renderer")).toHaveTextContent("section_ready");
    expect(screen.getByTestId("offer-card")).toHaveTextContent("sku_ready");
    expect(screen.getByTestId("unlock-cta")).toBeInTheDocument();
  });

  it("renders failed as failed-only ui", async () => {
    hoisted.getAttemptReport.mockRejectedValue(new Error("Result load failed."));
    hoisted.fetchAttemptResult.mockRejectedValue(new Error("Fallback failed."));

    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Result load failed.");
    });

    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("section-renderer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("offer-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unlock-cta")).not.toBeInTheDocument();
  });
});
