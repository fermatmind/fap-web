import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Big5HistoryClient from "@/app/(localized)/[locale]/(app)/history/big5/Big5HistoryClient";
import Big5CompareClient from "@/app/(localized)/[locale]/(app)/history/big5/compare/Big5CompareClient";
import type { ReportResponse } from "@/lib/api/v0_3";
import { normalizeBig5CompareSnapshot, resolveBig5CompareAttemptPair } from "@/lib/big5/secondarySurfaceNormalizer";
import canonical120ReportFixture from "@/tests/fixtures/big5/report_canonical_120_readable.projection.json";
import canonical90ReportFixture from "@/tests/fixtures/big5/report_canonical_90_readable.projection.json";
import canonicalDegradedReportFixture from "@/tests/fixtures/big5/report_canonical_degraded.projection.json";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/history/big5",
  search: "",
  fetchBig5History: vi.fn(),
  fetchBig5Report: vi.fn(),
  fetchBig5ReportAccess: vi.fn(),
  createAttemptShare: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/lib/i18n/locales", () => ({
  getLocaleFromPathname: (pathname: string) => (pathname.startsWith("/zh") ? "zh" : "en"),
  localizedPath: (path: string, locale: "en" | "zh") => `/${locale}${path.startsWith("/") ? path : `/${path}`}`,
}));

vi.mock("@/lib/big5/api", () => ({
  fetchBig5History: hoisted.fetchBig5History,
  fetchBig5Report: hoisted.fetchBig5Report,
  fetchBig5ReportAccess: hoisted.fetchBig5ReportAccess,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    createAttemptShare: hoisted.createAttemptShare,
  };
});

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

function percentileByDomain(report: ReportResponse, domain: string): number | null {
  const traitVector = Array.isArray(report.big5_public_projection_v1?.trait_vector)
    ? report.big5_public_projection_v1.trait_vector
    : [];

  const matched = traitVector.find((trait) => String(trait?.key ?? "").toUpperCase() === domain.toUpperCase());
  const percentile = Number(matched?.percentile);
  return Number.isFinite(percentile) ? percentile : null;
}

function buildTopFacetSummaries(report: ReportResponse, limit = 2) {
  const facetVector = Array.isArray(report.big5_public_projection_v1?.facet_vector)
    ? report.big5_public_projection_v1.facet_vector
    : [];

  return facetVector.slice(0, limit).map((facet) => ({
    key: String(facet?.key ?? ""),
    label: String(facet?.label ?? facet?.key ?? ""),
    domain: String(facet?.domain ?? "").toUpperCase() || String(facet?.key ?? "").slice(0, 1).toUpperCase(),
    percentile: typeof facet?.percentile === "number" ? facet.percentile : Number(facet?.percentile ?? 0),
    bucket: String(facet?.bucket ?? ""),
    kind: "strength",
  }));
}

function buildHistoryItem(
  attemptId: string,
  submittedAt: string,
  report: ReportResponse,
  accessSummaryOverrides: Record<string, unknown> = {}
) {
  const domainsMean = {
    O: percentileByDomain(report, "O"),
    C: percentileByDomain(report, "C"),
    E: percentileByDomain(report, "E"),
    A: percentileByDomain(report, "A"),
    N: percentileByDomain(report, "N"),
  };

  const topFacets = buildTopFacetSummaries(report, 2);
  const normsVersion = String(report.norms?.norms_version ?? "");

  return {
    attempt_id: attemptId,
    submitted_at: submittedAt,
    big5_form_v1: report.big5_form_v1,
    result_summary: {
      domains_mean: domainsMean,
    },
    top_facets_summary_v1: {
      items: topFacets,
    },
    quality_summary: {
      level: String(report.quality?.level ?? "A"),
      grade: String(report.quality?.level ?? "A"),
    },
    norms_summary: {
      status: String(report.norms?.status ?? "CALIBRATED"),
      norms_version: normsVersion || null,
    },
    offer_summary: {
      primary_offer: null,
    },
    share_summary: {
      enabled: true,
      share_kind: "big5_result",
    },
    access_summary: {
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      access_level: "full",
      variant: "full",
      actions: {
        page_href: `/en/result/${attemptId}`,
        pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      },
      ...accessSummaryOverrides,
    },
  };
}

describe("BIG5 secondary surfaces contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/big5";
    hoisted.search = "";
  });

  it("keeps BIG5 history lightweight while making each row a result-center card without extra access requests", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    hoisted.createAttemptShare.mockResolvedValue({
      ok: true,
      share_url: "/en/share/share-big5",
    });

    const canonical120 = asReport(canonical120ReportFixture);
    const canonical90 = asReport(canonical90ReportFixture);
    const canonicalDegraded = asReport(canonicalDegradedReportFixture);
    const latestTopFacet = buildTopFacetSummaries(canonical120, 1)[0];

    hoisted.fetchBig5History.mockResolvedValue({
      ok: true,
      items: [
        buildHistoryItem("attempt-latest", "2026-03-25T00:00:00Z", canonical120),
        buildHistoryItem("attempt-previous", "2026-03-18T00:00:00Z", canonical90),
        buildHistoryItem("attempt-degraded", "2026-03-12T00:00:00Z", canonicalDegraded),
      ],
      history_compare: {
        current_attempt_id: "attempt-latest",
        previous_attempt_id: "attempt-previous",
        domains_delta: {
          O: { delta: 16, direction: "up" },
        },
      },
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<Big5HistoryClient />);

    const latestRow = await screen.findByTestId("big5-history-row-attempt-latest");
    expect(within(latestRow).getByText(/Lead domains:/)).toBeInTheDocument();
    expect(within(latestRow).getByText("Formal result ready")).toBeInTheDocument();
    expect(within(latestRow).getByTestId("big5-history-row-form-attempt-latest")).toHaveTextContent(
      "Big Five · 120-question full version"
    );
    expect(within(latestRow).getByTestId("big5-history-row-quality-attempt-latest")).toHaveTextContent("Quality ·");
    expect(within(latestRow).getByTestId("big5-history-row-norms-attempt-latest")).toHaveTextContent("Norms · CALIBRATED");
    if (latestTopFacet?.key) {
      expect(
        within(latestRow).getByTestId(`big5-history-row-facet-attempt-latest-${latestTopFacet.key}`)
      ).toHaveTextContent(`${latestTopFacet.label} · P${latestTopFacet.percentile}`);
    }
    expect(within(latestRow).getByRole("link", { name: "Open formal result" })).toHaveAttribute("href", "/en/result/attempt-latest");
    expect(within(latestRow).getByRole("link", { name: "Compare latest two" })).toHaveAttribute(
      "href",
      "/en/history/big5/compare?current=attempt-latest&previous=attempt-previous"
    );
    expect(within(latestRow).getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(within(latestRow).queryByTestId("big5-history-row-offer-attempt-latest")).not.toBeInTheDocument();
    expect(hoisted.createAttemptShare).not.toHaveBeenCalled();

    const previousRow = screen.getByTestId("big5-history-row-attempt-previous");
    expect(within(previousRow).getByText("Formal result ready")).toBeInTheDocument();
    expect(within(previousRow).getByTestId("big5-history-row-form-attempt-previous")).toHaveTextContent(
      "Big Five · 90-question standard version"
    );
    expect(within(previousRow).getByRole("link", { name: "Open formal result" })).toHaveAttribute("href", "/en/result/attempt-previous");
    expect(within(previousRow).getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(within(previousRow).queryByTestId("big5-history-row-offer-attempt-previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Preview access only")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlock to download PDF" })).not.toBeInTheDocument();

    const degradedRow = screen.getByTestId("big5-history-row-attempt-degraded");
    expect(within(degradedRow).getByText("Formal result ready")).toBeInTheDocument();
    expect(within(degradedRow).getByTestId("big5-history-row-quality-attempt-degraded")).toHaveTextContent("Quality · D");
    expect(within(degradedRow).getByRole("button", { name: "Download PDF" })).toBeEnabled();

    fireEvent.click(within(latestRow).getByRole("button", { name: "Share result" }));
    await waitFor(() => {
      expect(hoisted.createAttemptShare).toHaveBeenCalledWith({
        attemptId: "attempt-latest",
        locale: "en",
      });
    });
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/en/share/share-big5"));
    });
    expect(within(latestRow).getByRole("button", { name: "Link copied" })).toBeInTheDocument();

    expect(screen.getAllByRole("link", { name: "Compare latest two" })[0]).toHaveAttribute(
      "href",
      "/en/history/big5/compare?current=attempt-latest&previous=attempt-previous"
    );
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
    expect(hoisted.fetchBig5ReportAccess).not.toHaveBeenCalled();
  });

  it("keeps BIG5 history action links on internal report paths when backend URLs are not allowed", async () => {
    const canonical120 = asReport(canonical120ReportFixture);

    hoisted.fetchBig5History.mockResolvedValue({
      ok: true,
      items: [
        buildHistoryItem("attempt-external-action", "2026-03-25T00:00:00Z", canonical120, {
          actions: {
            page_href: "https://evil.example/result/attempt-external-action",
            pdf_href: "https://evil.example/report.pdf",
          },
        }),
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<Big5HistoryClient />);

    const row = await screen.findByTestId("big5-history-row-attempt-external-action");
    expect(within(row).getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-external-action"
    );
    expect(within(row).queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
    expect(hoisted.fetchBig5ReportAccess).not.toHaveBeenCalled();
  });

  it("does not render facet percentile chips for locked BIG5 history rows", async () => {
    const canonical120 = asReport(canonical120ReportFixture);
    const latestTopFacet = buildTopFacetSummaries(canonical120, 1)[0];
    if (!latestTopFacet) {
      throw new Error("Expected a fixture top facet");
    }

    hoisted.fetchBig5History.mockResolvedValue({
      ok: true,
      items: [
        buildHistoryItem("attempt-locked", "2026-03-25T00:00:00Z", canonical120, {
          access_state: "locked",
          report_state: "ready",
          pdf_state: "unavailable",
          access_level: "free",
          variant: "free",
          modules_allowed: ["big5_core"],
          actions: {
            page_href: "/en/result/attempt-locked",
            pdf_href: null,
          },
        }),
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<Big5HistoryClient />);

    const lockedRow = await screen.findByTestId("big5-history-row-attempt-locked");
    expect(within(lockedRow).getByText("Preview access only")).toBeInTheDocument();
    expect(within(lockedRow).queryByText(`${latestTopFacet.label} · P${latestTopFacet.percentile}`)).not.toBeInTheDocument();
    expect(within(lockedRow).queryByTestId(`big5-history-row-facet-attempt-locked-${latestTopFacet.key}`)).not.toBeInTheDocument();
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
    expect(hoisted.fetchBig5ReportAccess).not.toHaveBeenCalled();
  });

  it("resolves compare pairs from history_compare and normalizes compare data from structured projection fields", () => {
    const pair = resolveBig5CompareAttemptPair(
      {
        items: [
          { attempt_id: "fallback-current" },
          { attempt_id: "fallback-previous" },
        ],
        history_compare: {
          current_attempt_id: "history-current",
          previous_attempt_id: "history-previous",
          current_domains_mean: {
            O: 81,
          },
          previous_domains_mean: {
            O: 70,
          },
          domains_delta: {
            O: { delta: 11, direction: "up" },
          },
        },
      },
      "",
      ""
    );

    expect(pair).toEqual({
      current: "history-current",
      previous: "history-previous",
    });

    const snapshot = normalizeBig5CompareSnapshot(asReport(canonical120ReportFixture));

    expect(Object.keys(snapshot.domainPercentiles).sort()).toEqual(["A", "C", "E", "N", "O"]);
    expect(Object.keys(snapshot.facetPercentiles)).toHaveLength(30);
  });

  it("renders BIG5 compare from shared normalized report data and formal result access state", async () => {
    const currentReport = asReport(canonical120ReportFixture);
    const previousReport = asReport(canonical90ReportFixture);
    const currentO = percentileByDomain(currentReport, "O");
    const previousO = percentileByDomain(previousReport, "O");
    const expectedDelta = currentO !== null && previousO !== null ? Number((currentO - previousO).toFixed(2)) : null;

    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      actions: {
        page_href: "/en/result/attempt-current",
        pdf_href: "/api/v0.3/attempts/attempt-current/report.pdf",
      },
    });
    hoisted.fetchBig5Report
      .mockResolvedValueOnce(currentReport)
      .mockResolvedValueOnce(previousReport);

    render(<Big5CompareClient />);

    expect(await screen.findByText("Formal result ready")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-current"
    );
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(await screen.findByText("Domain percentile delta")).toBeInTheDocument();
    expect(screen.getByText("Current: attempt-current")).toBeInTheDocument();
    expect(screen.getByText("Previous: attempt-previous")).toBeInTheDocument();
    if (currentO !== null) {
      expect(screen.getByText(`Now ${currentO}`)).toBeInTheDocument();
    }
    if (previousO !== null) {
      expect(screen.getByText(`Prev ${previousO}`)).toBeInTheDocument();
    }
    if (expectedDelta !== null) {
      const expectedDeltaLabel = `${expectedDelta > 0 ? "+" : ""}${expectedDelta}`;
      expect(screen.getByText(expectedDeltaLabel)).toBeInTheDocument();
    }
    expect(screen.queryByText("Current result is still in preview")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlock to download PDF" })).not.toBeInTheDocument();
    expect(hoisted.fetchBig5History).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hoisted.fetchBig5Report).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.fetchBig5ReportAccess).toHaveBeenCalledTimes(1);
  });

  it("keeps BIG5 compare action links on internal report paths when backend URLs are not allowed", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      actions: {
        page_href: "https://evil.example/result/attempt-current",
        pdf_href: "https://evil.example/report.pdf",
      },
    });

    render(<Big5CompareClient />);

    expect(await screen.findByText("Continue to the formal result page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-current"
    );
    expect(screen.queryByTestId("big5-compare-pdf-entry")).not.toBeInTheDocument();
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
    expect(hoisted.fetchBig5ReportAccess).toHaveBeenCalledTimes(1);
  });

  it("keeps BIG5 compare readable for degraded quality reports without falling back to preview semantics", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      actions: {
        page_href: "/en/result/attempt-current",
        pdf_href: "/api/v0.3/attempts/attempt-current/report.pdf",
      },
    });
    hoisted.fetchBig5Report
      .mockResolvedValueOnce(asReport(canonicalDegradedReportFixture))
      .mockResolvedValueOnce(asReport(canonical90ReportFixture));

    render(<Big5CompareClient />);

    expect(await screen.findByText("Formal result ready")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-current"
    );
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(screen.queryByText("Current result is still in preview")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlock to download PDF" })).not.toBeInTheDocument();
  });

  it("hides compare result actions when the formal result is unavailable", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "ready",
      report_state: "unavailable",
      pdf_state: "missing",
      actions: {
        page_href: null,
        pdf_href: null,
      },
    });
    hoisted.fetchBig5Report
      .mockResolvedValueOnce(asReport(canonical120ReportFixture))
      .mockResolvedValueOnce(asReport(canonical90ReportFixture));

    render(<Big5CompareClient />);

    expect(await screen.findByText("Formal result unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open formal result" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-compare-pdf-entry")).not.toBeInTheDocument();
  });

  it("does not fetch or render BIG5 compare percentiles before formal result access is ready", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "locked",
      report_state: "ready",
      pdf_state: "unavailable",
      access_level: "free",
      variant: "free",
      modules_allowed: ["big5_core"],
      actions: {
        page_href: "/en/result/attempt-current",
        pdf_href: null,
      },
    });

    render(<Big5CompareClient />);

    expect(await screen.findByText("Current result is still in preview")).toBeInTheDocument();
    expect(screen.queryByText("Domain percentile delta")).not.toBeInTheDocument();
    expect(screen.queryByText("Top changed facets")).not.toBeInTheDocument();
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
  });
});
