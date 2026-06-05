import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDailyGivingRecords } from "@/lib/foundation/dailyGiving";
import { apiClient } from "@/lib/api-client";
import { isDailyGivingProofPublicUrlFrontendAdapter01AllowedFile } from "./helpers/currentPrScope";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("DAILY-GIVING-PROOF-PUBLIC-URL-FRONTEND-ADAPTER-01", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("maps backend proof_public_url to the DailyGiving evidence link field", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ok: true,
      items: [
        {
          record_code: "FM-GIVING-2026-06-001",
          donation_date: "2026-06-05",
          recipient_name: "UNICEF",
          proof_status: "redacted_available",
          proof_public_url: "https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-05.pdf",
          proof_private_path: "daily-giving/private/2026-06-05/raw-receipt.pdf",
          proof_redaction_notes: "admin-only reviewer note",
        },
      ],
      pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
    });

    const records = await fetchDailyGivingRecords({ locale: "en" });

    expect(records.records[0]).toMatchObject({
      code: "FM-GIVING-2026-06-001",
      evidenceUrl: "https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-05.pdf",
    });
    expect(JSON.stringify(records.records[0])).not.toContain("raw-receipt.pdf");
    expect(JSON.stringify(records.records[0])).not.toContain("admin-only reviewer note");
  });

  it("supports camelCase proofPublicUrl without adding frontend fallback proof records", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ok: true,
      items: [
        {
          recordCode: "FM-GIVING-2026-06-002",
          proofPublicUrl: "https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-06.pdf",
        },
      ],
      pagination: { currentPage: 1, perPage: 20, total: 1, lastPage: 1 },
    });

    const records = await fetchDailyGivingRecords({ locale: "zh" });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/v0.5/foundation/giving-records?locale=zh-CN",
      expect.objectContaining({ skipAuth: true })
    );
    expect(records.records).toHaveLength(1);
    expect(records.records[0].evidenceUrl).toBe("https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-06.pdf");
  });

  it("limits this PR to the approved adapter scope", () => {
    const changedFiles = [
      "lib/foundation/dailyGiving.ts",
      "tests/contracts/daily-giving-proof-public-url-frontend-adapter-01.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of changedFiles) {
      expect(isDailyGivingProofPublicUrlFrontendAdapter01AllowedFile(file), file).toBe(true);
    }
  });
});
