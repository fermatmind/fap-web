import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyGivingLedgerPage } from "@/components/foundation/DailyGivingLedgerPage";
import { fetchDailyGivingRecords } from "@/lib/foundation/dailyGiving";
import { apiClient } from "@/lib/api-client";
import { isPrFdnSocialLinkDisplayImplementation01AllowedFile } from "./helpers/currentPrScope";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("PR-FDN-SOCIAL-LINK-DISPLAY-IMPLEMENTATION-01", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("normalizes existing backend social URL fields without adding frontend fallback social records", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ok: true,
      items: [
        {
          record_code: "fdn-2026-06-001",
          title: "Backend authored giving record",
          year_month: "2026-06",
          amount_minor: 5000,
          currency: "usd",
          recipient_name: "Recipient",
          social_x_url: "https://x.com/fermatmind/status/1",
          social_linkedin_url: "https://www.linkedin.com/posts/fermatmind-1",
          social_weibo_url: "https://weibo.com/8337437164/1",
          social_xiaohongshu_url: "https://www.xiaohongshu.com/explore/1",
          social_other_links: [
            { label: "Mirror", url: "https://example.com/social/mirror" },
            { label: "Unsafe", url: "javascript:alert(1)" },
          ],
        },
      ],
      pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
    });

    const records = await fetchDailyGivingRecords({ locale: "en" });

    expect(records.records).toHaveLength(1);
    expect(records.records[0].socialLinks).toEqual([
      { platform: "x", label: "X", url: "https://x.com/fermatmind/status/1" },
      { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/posts/fermatmind-1" },
      { platform: "weibo", label: "Weibo", url: "https://weibo.com/8337437164/1" },
      { platform: "xiaohongshu", label: "Xiaohongshu", url: "https://www.xiaohongshu.com/explore/1" },
      { platform: "other", label: "Mirror", url: "https://example.com/social/mirror" },
    ]);
  });

  it("renders backend-provided manual social links only when links are present", () => {
    render(
      <DailyGivingLedgerPage
        locale="en"
        months={[]}
        records={[
          {
            code: "fdn-2026-06-001",
            title: "Backend authored giving record",
            description: "",
            month: "2026-06",
            donatedOn: "2026-06-01",
            amountMinor: 5000,
            currency: "USD",
            recipientName: "Recipient",
            recipientUrl: null,
            evidenceUrl: null,
            status: "published",
            socialLinks: [
              { platform: "x", label: "X", url: "https://x.com/fermatmind/status/1" },
              { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/posts/fermatmind-1" },
            ],
          },
        ]}
      />
    );

    expect(screen.getByTestId("daily-giving-social-links")).toHaveTextContent("Social posts");
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute("href", "https://x.com/fermatmind/status/1");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/posts/fermatmind-1");
  });

  it("keeps empty API responses and records without social links free of fallback social links", () => {
    render(
      <DailyGivingLedgerPage
        locale="en"
        months={[]}
        records={[
          {
            code: "fdn-2026-06-002",
            title: "Backend authored giving record",
            description: "",
            month: "2026-06",
            donatedOn: null,
            amountMinor: null,
            currency: "USD",
            recipientName: "Recipient",
            recipientUrl: null,
            evidenceUrl: null,
            status: "published",
            socialLinks: [],
          },
        ]}
      />
    );

    expect(screen.queryByTestId("daily-giving-social-links")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "X" })).not.toBeInTheDocument();
  });

  it("limits this implementation PR to the approved fap-web scope", () => {
    const changedFiles = [
      "components/foundation/DailyGivingLedgerPage.tsx",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/pr-fdn-social-link-display-implementation-01.v1.json",
      "docs/seo/pr-fdn-social-link-display-implementation-01.md",
      "lib/foundation/dailyGiving.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-social-link-display-implementation-01.contract.test.tsx",
    ];

    for (const file of changedFiles) {
      expect(isPrFdnSocialLinkDisplayImplementation01AllowedFile(file), file).toBe(true);
    }
  });
});
