import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EnneagramHistoryClient from "@/app/(localized)/[locale]/(app)/history/enneagram/EnneagramHistoryClient";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/history/enneagram",
  fetchEnneagramHistory: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
}));

vi.mock("@/lib/i18n/locales", () => ({
  getLocaleFromPathname: (pathname: string) => (pathname.startsWith("/zh") ? "zh" : "en"),
  localizedPath: (path: string, locale: "en" | "zh") => `/${locale}${path.startsWith("/") ? path : `/${path}`}`,
}));

vi.mock("@/lib/enneagram/api", () => ({
  fetchEnneagramHistory: hoisted.fetchEnneagramHistory,
}));

describe("enneagram secondary surfaces contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/enneagram";
  });

  it("renders history rows from backend summaries and access/pdf state without report readbacks", async () => {
    hoisted.fetchEnneagramHistory.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      items: [
        {
          attempt_id: "attempt-enneagram-105",
          submitted_at: "2026-04-20T00:00:00Z",
          enneagram_form_v1: {
            form_code: "enneagram_likert_105",
            label: "105-question Likert",
            short_label: "105Q Likert",
            question_count: 105,
            estimated_minutes: 12,
            scale_code: "ENNEAGRAM",
          },
          enneagram_summary_v1: {
            primary_type: {
              code: "T1",
              label: "Type 1",
              score: 88,
              rank: 1,
            },
            top_types: [
              { code: "T1", label: "Type 1", score: 88, rank: 1 },
              { code: "T5", label: "Type 5", score: 73, rank: 2 },
            ],
            confidence_label: "stable",
          },
          quality_summary: {
            level: "A",
          },
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "ready",
            access_level: "full",
            variant: "full",
            actions: {
              page_href: "/en/result/attempt-enneagram-105",
              pdf_href: "/api/v0.3/attempts/attempt-enneagram-105/report.pdf",
              history_href: "/en/history/enneagram",
            },
          },
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<EnneagramHistoryClient />);

    const row = await screen.findByTestId("enneagram-history-row-attempt-enneagram-105");
    expect(within(row).getByTestId("enneagram-history-row-form-attempt-enneagram-105")).toHaveTextContent(
      "Enneagram · 105-question Likert"
    );
    expect(within(row).getByTestId("enneagram-history-row-primary-attempt-enneagram-105")).toHaveTextContent(
      "Primary type: Type 1"
    );
    expect(within(row).getByTestId("enneagram-history-row-top-attempt-enneagram-105")).toHaveTextContent(
      "Ranked types: #1 Type 1, #2 Type 5"
    );
    expect(within(row).getByText("Formal result ready")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-enneagram-105"
    );
    expect(within(row).getByTestId("enneagram-history-row-pdf-attempt-enneagram-105")).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(hoisted.fetchEnneagramHistory).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      locale: "en",
    });
  });

  it("keeps 144 forced-choice history on the same Enneagram history surface", async () => {
    hoisted.fetchEnneagramHistory.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      items: [
        {
          attempt_id: "attempt-enneagram-144",
          submitted_at: "2026-04-20T00:00:00Z",
          enneagram_form_v1: {
            form_code: "enneagram_forced_choice_144",
            label: "144-question Forced-Choice",
            short_label: "144Q Forced",
            question_count: 144,
            estimated_minutes: 18,
            scale_code: "ENNEAGRAM",
          },
          enneagram_summary_v1: {
            primary_type: {
              code: "T5",
              label: "Type 5",
              score: 41,
              rank: 1,
            },
            top_types: [{ code: "T5", label: "Type 5", score: 41, rank: 1 }],
          },
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "unavailable",
            actions: {
              page_href: "/en/result/attempt-enneagram-144",
              pdf_href: null,
            },
          },
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<EnneagramHistoryClient />);

    const row = await screen.findByTestId("enneagram-history-row-attempt-enneagram-144");
    expect(within(row).getByTestId("enneagram-history-row-form-attempt-enneagram-144")).toHaveTextContent(
      "Enneagram · 144-question Forced-Choice"
    );
    expect(within(row).getByRole("link", { name: "Open formal result" })).toHaveAttribute(
      "href",
      "/en/result/attempt-enneagram-144"
    );
    expect(within(row).queryByTestId("enneagram-history-row-pdf-attempt-enneagram-144")).not.toBeInTheDocument();
  });
});
