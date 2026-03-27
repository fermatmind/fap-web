import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Big5HistoryClient from "@/app/(localized)/[locale]/(app)/history/big5/Big5HistoryClient";
import Big5CompareClient from "@/app/(localized)/[locale]/(app)/history/big5/compare/Big5CompareClient";
import { normalizeBig5CompareSnapshot, resolveBig5CompareAttemptPair } from "@/lib/big5/secondarySurfaceNormalizer";
import type { ReportResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/history/big5",
  search: "",
  fetchBig5History: vi.fn(),
  fetchBig5Report: vi.fn(),
  fetchBig5ReportAccess: vi.fn(),
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

describe("BIG5 secondary surfaces contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/big5";
    hoisted.search = "";
  });

  it("keeps BIG5 history lightweight while making each row access-aware without extra access requests", async () => {
    hoisted.fetchBig5History.mockResolvedValue({
      ok: true,
      items: [
        {
          attempt_id: "attempt-latest",
          submitted_at: "2026-03-25T00:00:00Z",
          result_summary: {
            domains_mean: {
              O: 88,
              A: 74,
              C: 69,
              E: 52,
              N: 41,
            },
          },
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "ready",
            access_level: "full",
            variant: "full",
            actions: {
              page_href: "/en/result/attempt-latest",
              pdf_href: "/api/v0.3/attempts/attempt-latest/report.pdf",
            },
          },
        },
        {
          attempt_id: "attempt-previous",
          submitted_at: "2026-03-18T00:00:00Z",
          result_summary: {
            domains_mean: {
              O: 72,
              C: 65,
              A: 61,
            },
          },
          access_summary: {
            access_state: "locked",
            report_state: "ready",
            pdf_state: "missing",
            access_level: "preview",
            variant: "free",
            actions: {
              page_href: "/en/result/attempt-previous",
              pdf_href: null,
            },
          },
        },
        {
          attempt_id: "attempt-processing",
          submitted_at: "2026-03-12T00:00:00Z",
          result_summary: {
            domains_mean: {
              E: 71,
              O: 69,
              C: 63,
            },
          },
          access_summary: {
            access_state: "locked",
            report_state: "pending",
            pdf_state: "missing",
            actions: {
              page_href: "/en/result/attempt-processing",
              pdf_href: null,
            },
          },
        },
        {
          attempt_id: "attempt-unavailable",
          submitted_at: "2026-03-09T00:00:00Z",
          result_summary: {
            domains_mean: {
              N: 67,
              A: 51,
              O: 48,
            },
          },
          access_summary: {
            access_state: "ready",
            report_state: "unavailable",
            pdf_state: "missing",
            actions: {
              page_href: null,
              pdf_href: null,
            },
          },
        },
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

    expect(await screen.findByText("Lead domains: Openness, Agreeableness, Conscientiousness")).toBeInTheDocument();
    const latestRow = screen.getByTestId("big5-history-row-attempt-latest");
    expect(within(latestRow).getByText("Formal result ready")).toBeInTheDocument();
    expect(within(latestRow).getByRole("link", { name: "Open formal result" })).toHaveAttribute("href", "/en/result/attempt-latest");
    expect(within(latestRow).getByRole("button", { name: "Download PDF" })).toBeEnabled();

    const lockedRow = screen.getByTestId("big5-history-row-attempt-previous");
    expect(within(lockedRow).getByText("Preview access only")).toBeInTheDocument();
    expect(within(lockedRow).getByRole("link", { name: "Open result preview" })).toHaveAttribute("href", "/en/result/attempt-previous");
    expect(within(lockedRow).getByRole("button", { name: "Unlock to download PDF" })).toBeDisabled();

    const processingRow = screen.getByTestId("big5-history-row-attempt-processing");
    expect(within(processingRow).getByText("Result still processing")).toBeInTheDocument();
    expect(within(processingRow).getByRole("link", { name: "Check result status" })).toHaveAttribute("href", "/en/result/attempt-processing");
    expect(within(processingRow).queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();

    const unavailableRow = screen.getByTestId("big5-history-row-attempt-unavailable");
    expect(within(unavailableRow).getByText("Result unavailable")).toBeInTheDocument();
    expect(within(unavailableRow).getByText("Formal result unavailable")).toBeInTheDocument();
    expect(within(unavailableRow).queryByRole("link", { name: "Open formal result" })).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Compare latest two" })).toHaveAttribute(
      "href",
      "/en/history/big5/compare?current=attempt-latest&previous=attempt-previous"
    );
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

    const snapshot = normalizeBig5CompareSnapshot({
      ok: true,
      big5_public_projection_v1: {
        trait_vector: [
          { key: "O", label: "Openness", percentile: 81 },
          { key: "C", label: "Conscientiousness", percentile: 64 },
        ],
        facet_vector: [
          { key: "O1", label: "O1 Imagination", domain: "O", percentile: 72, bucket: "high" },
        ],
      },
      report: {
        sections: [
          {
            key: "domains_overview",
            blocks: [{ metric_code: "O", title: "Openness", body: "Opaque body without percentile marker" }],
          },
          {
            key: "facet_table",
            blocks: [{ metric_code: "O1", title: "O1", body: "O1 percentile 60" }],
          },
        ],
      },
    } as ReportResponse);

    expect(snapshot.domainPercentiles).toMatchObject({
      O: 81,
      C: 64,
    });
    expect(snapshot.facetPercentiles).toMatchObject({
      O1: 72,
    });
  });

  it("renders BIG5 compare from shared normalized report data and formal result access state", async () => {
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
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [
            { key: "O", label: "Openness", percentile: 81 },
            { key: "C", label: "Conscientiousness", percentile: 60 },
          ],
          facet_vector: [
            { key: "O1", label: "O1 Imagination", domain: "O", percentile: 60, bucket: "mid" },
          ],
        },
        report: {
          sections: [
            {
              key: "facet_table",
              blocks: [{ metric_code: "O1", title: "O1", body: "O1 percentile 12" }],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [
            { key: "O", label: "Openness", percentile: 52 },
            { key: "C", label: "Conscientiousness", percentile: 65 },
          ],
          facet_vector: [
            { key: "O1", label: "O1 Imagination", domain: "O", percentile: 45, bucket: "mid" },
          ],
        },
        report: {
          sections: [
            {
              key: "facet_table",
              blocks: [{ metric_code: "O1", title: "O1", body: "O1 percentile 97" }],
            },
          ],
        },
      });

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
    expect(screen.getByText("Now 81")).toBeInTheDocument();
    expect(screen.getByText("Prev 52")).toBeInTheDocument();
    expect(screen.getByText("O1")).toBeInTheDocument();
    expect(screen.getByText("+15")).toBeInTheDocument();
    expect(hoisted.fetchBig5History).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hoisted.fetchBig5Report).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.fetchBig5ReportAccess).toHaveBeenCalledTimes(1);
  });

  it("keeps BIG5 compare access-aware when the current result is locked", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
    hoisted.fetchBig5ReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-current",
      access_state: "locked",
      report_state: "ready",
      pdf_state: "missing",
      actions: {
        page_href: "/en/result/attempt-current",
        pdf_href: null,
      },
    });
    hoisted.fetchBig5Report
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [{ key: "O", label: "Openness", percentile: 81 }],
          facet_vector: [{ key: "O1", label: "O1 Imagination", domain: "O", percentile: 60, bucket: "mid" }],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [{ key: "O", label: "Openness", percentile: 52 }],
          facet_vector: [{ key: "O1", label: "O1 Imagination", domain: "O", percentile: 45, bucket: "mid" }],
        },
      });

    render(<Big5CompareClient />);

    expect(await screen.findByText("Current result is still in preview")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open formal result preview" })).toHaveAttribute(
      "href",
      "/en/result/attempt-current"
    );
    expect(screen.getByRole("button", { name: "Unlock to download PDF" })).toBeDisabled();
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
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [{ key: "O", label: "Openness", percentile: 81 }],
          facet_vector: [{ key: "O1", label: "O1 Imagination", domain: "O", percentile: 60, bucket: "mid" }],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        big5_public_projection_v1: {
          trait_vector: [{ key: "O", label: "Openness", percentile: 52 }],
          facet_vector: [{ key: "O1", label: "O1 Imagination", domain: "O", percentile: 45, bucket: "mid" }],
        },
      });

    render(<Big5CompareClient />);

    expect(await screen.findByText("Formal result unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open formal result" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-compare-pdf-entry")).not.toBeInTheDocument();
  });
});
