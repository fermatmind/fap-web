import { render, screen, waitFor } from "@testing-library/react";
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
}));

describe("BIG5 secondary surfaces contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/big5";
    hoisted.search = "";
  });

  it("keeps BIG5 history lightweight and links each attempt into the formal result page", async () => {
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
    expect(screen.getAllByRole("link", { name: "View full result" })[0]).toHaveAttribute(
      "href",
      "/en/result/attempt-latest"
    );
    expect(screen.getByRole("link", { name: "Compare latest two" })).toHaveAttribute(
      "href",
      "/en/history/big5/compare?current=attempt-latest&previous=attempt-previous"
    );
    expect(hoisted.fetchBig5Report).not.toHaveBeenCalled();
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

  it("renders BIG5 compare from shared normalized report data instead of page-local section parsing", async () => {
    hoisted.pathname = "/en/history/big5/compare";
    hoisted.search = "current=attempt-current&previous=attempt-previous";
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
  });
});
