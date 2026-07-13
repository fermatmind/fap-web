import { execFileSync } from "node:child_process";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  fetchDailyGivingMonths,
  fetchDailyGivingRecords,
  formatDailyGivingAmount,
} from "@/lib/foundation/dailyGiving";
import { proxy } from "@/proxy";
import { isSecurity122Web08AllowedFile } from "./helpers/currentPrScope";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const ROOT = process.cwd();
function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }

  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files;
}

describe("SECURITY-122-WEB-08 DailyGiving public API guards", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("rejects non-read methods before same-origin DailyGiving public API rewrites", () => {
    const response = proxy(
      new NextRequest("https://fermatmind.com/api/v0.5/foundation/giving-records/months/2026-06", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const headResponse = proxy(
      new NextRequest("https://fermatmind.com/api/v0.5/foundation/giving-records?locale=en", {
        method: "HEAD",
      }),
    );
    expect(headResponse.status).not.toBe(405);
  });

  it("normalizes malformed DailyGiving currencies without crashing amount rendering", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        ok: true,
        items: [
          {
            record_code: "FM-GIVING-2026-06-001",
            amount_cents: 12345,
            currency: "usd<script>",
          },
        ],
        pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      })
      .mockResolvedValueOnce({
        ok: true,
        months: [{ year_month: "2026-06", record_count: 1, amount_cents: 12345, currency: "人民" }],
      });

    const records = await fetchDailyGivingRecords({ locale: "en" });
    const months = await fetchDailyGivingMonths("en");

    expect(records.records[0]).toMatchObject({ currency: "USD", amountMinor: 12345 });
    expect(months[0]).toMatchObject({ currency: "USD", amountMinor: 12345 });
    expect(() => formatDailyGivingAmount({ amountMinor: 12345, currency: "usd<script>" }, "en")).not.toThrow();
  });

  it("accepts only safe backend public proof URLs and ignores private or signed proof fallbacks", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ok: true,
      items: [
        {
          record_code: "safe-proof",
          proof_public_url: "https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-05.pdf",
        },
        {
          record_code: "script-proof",
          proofPublicUrl: "javascript:alert(1)",
        },
        {
          record_code: "private-proof",
          evidence_url: "https://media.fermatmind.com/foundation/daily-giving/private/raw-receipt.pdf",
        },
        {
          record_code: "fallback-proof",
          receipt_url: "https://media.fermatmind.com/foundation/daily-giving/public/receipt.pdf",
          source_url: "https://media.fermatmind.com/foundation/daily-giving/public/source.pdf",
        },
        {
          record_code: "signed-proof",
          proof_public_url: "https://media.fermatmind.com/foundation/daily-giving/public/redacted.pdf?token=secret",
        },
      ],
      pagination: { current_page: 1, per_page: 20, total: 5, last_page: 1 },
    });

    const records = await fetchDailyGivingRecords({ locale: "en" });

    expect(records.records.map((record) => [record.code, record.evidenceUrl])).toEqual([
      ["safe-proof", "https://media.fermatmind.com/foundation/daily-giving/public/redacted-2026-06-05.pdf"],
      ["script-proof", null],
      ["private-proof", null],
      ["fallback-proof", null],
      ["signed-proof", null],
    ]);
  });

  it("keeps the WEB-08 diff inside the declared DailyGiving guard scope", () => {
    const files = changedFiles();
    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.filter((file) => !isSecurity122Web08AllowedFile(file))).toEqual([]);
  });
});
