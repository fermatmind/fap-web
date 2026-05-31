import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyGivingLedgerPage } from "@/components/foundation/DailyGivingLedgerPage";
import { fetchDailyGivingMonths, fetchDailyGivingRecords } from "@/lib/foundation/dailyGiving";
import { apiClient } from "@/lib/api-client";
import { isPrFdn02bDailyGivingFrontendPagesAllowedFile } from "./helpers/currentPrScope";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("PR-FDN-02B Foundation Daily Giving frontend pages", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("fetches ledger and archive data only from backend-authoritative public Foundation API endpoints", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        ok: true,
        items: [
          {
            record_code: "fdn-2026-05-001",
            title: "Daily giving record",
            year_month: "2026-05",
            amount_cents: 12345,
            currency: "usd",
            recipient_name: "Recipient",
            public_note: "Backend-authored note",
          },
        ],
        pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      })
      .mockResolvedValueOnce({
        ok: true,
        months: [{ year_month: "2026-05", record_count: 1, amount_cents: 12345, currency: "usd" }],
      });

    const records = await fetchDailyGivingRecords({ locale: "en" });
    const months = await fetchDailyGivingMonths("en");

    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      "/v0.5/foundation/giving-records?locale=en",
      expect.objectContaining({ skipAuth: true })
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2,
      "/v0.5/foundation/giving-records/months?locale=en",
      expect.objectContaining({ skipAuth: true })
    );
    expect(records.records).toHaveLength(1);
    expect(records.records[0]).toMatchObject({
      code: "fdn-2026-05-001",
      month: "2026-05",
      amountMinor: 12345,
      recipientName: "Recipient",
    });
    expect(months).toEqual([{ yearMonth: "2026-05", recordCount: 1, amountMinor: 12345, currency: "USD" }]);
  });

  it("fetches month archives through the bounded month archive endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ok: true,
      items: [],
      pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
    });

    await fetchDailyGivingRecords({ locale: "zh", yearMonth: "2026-05" });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/v0.5/foundation/giving-records/months/2026-05?locale=zh-CN",
      expect.objectContaining({ skipAuth: true })
    );
  });

  it("renders an empty state without frontend fallback records when the public API returns no items", () => {
    render(<DailyGivingLedgerPage locale="en" records={[]} months={[]} />);

    expect(screen.getByTestId("daily-giving-ledger-page")).toBeInTheDocument();
    expect(screen.getByTestId("daily-giving-empty-state")).toHaveTextContent("No public records yet");
    expect(screen.queryAllByTestId("daily-giving-record")).toHaveLength(0);
  });

  it("adds the daily giving routes as noindex pages and does not alter sitemap, llms, or footer exposure", () => {
    const indexRoute = read("app/(localized)/[locale]/foundation/daily-giving/page.tsx");
    const monthRoute = read("app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx");
    const sitemapSource = read("next-sitemap.config.js");
    const llmsSource = read("app/llms.txt/route.ts");
    const footerSource = read("components/layout/SiteFooter.tsx");

    expect(indexRoute).toContain('pathname: locale === "zh" ? "/zh/foundation/daily-giving"');
    expect(indexRoute).toContain("noindex: true");
    expect(monthRoute).toContain("normalizeYearMonth");
    expect(monthRoute).toContain("noindex: true");
    expect(sitemapSource).not.toContain("foundation/daily-giving");
    expect(llmsSource).not.toContain("foundation/daily-giving");
    expect(footerSource).not.toContain("daily-giving");
  });

  it("limits this PR to the approved fap-web scope", () => {
    const changedFiles = [
      "app/(localized)/[locale]/foundation/daily-giving/page.tsx",
      "app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx",
      "components/foundation/DailyGivingLedgerPage.tsx",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/metadata-surface-inventory.v1.csv",
      "docs/seo/generated/metadata-surface-inventory.v1.json",
      "lib/foundation/dailyGiving.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-02b-daily-giving-frontend-pages.contract.test.tsx",
    ];

    for (const file of changedFiles) {
      expect(isPrFdn02bDailyGivingFrontendPagesAllowedFile(file), file).toBe(true);
    }
  });
});
