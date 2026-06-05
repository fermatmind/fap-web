import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/foundation/dailyGiving", () => ({
  fetchDailyGivingMonths: vi.fn(async () => [{ yearMonth: "2026-06", recordCount: 1, amountMinor: 1000, currency: "CNY" }]),
  fetchDailyGivingRecords: vi.fn(async () => ({ records: [] })),
}));

import {
  DAILY_GIVING_INDEXABILITY_ENABLED,
  listDailyGivingDiscoverabilityEntries,
} from "@/lib/foundation/dailyGivingSeo";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

describe("DAILY-GIVING-INDEXABILITY-GATE-01", () => {
  it("keeps DailyGiving indexability disabled in the source gate", async () => {
    expect(DAILY_GIVING_INDEXABILITY_ENABLED).toBe(false);
    await expect(listDailyGivingDiscoverabilityEntries("en")).resolves.toEqual([]);
    await expect(listDailyGivingDiscoverabilityEntries("zh")).resolves.toEqual([]);
  });

  it("keeps DailyGiving pages noindex regardless of public record presence", () => {
    const indexRoute = read("app/(localized)/[locale]/foundation/daily-giving/page.tsx");
    const monthRoute = read("app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx");

    expect(indexRoute).toContain("noindex: true");
    expect(monthRoute).toContain("noindex: true");
    expect(indexRoute).not.toContain("noindex: !hasRecords");
    expect(monthRoute).not.toContain("noindex: !hasRecords");
  });

  it("records no sitemap llms trust badge or publish expansion", () => {
    const artifact = readJson<Record<string, unknown>>("docs/seo/generated/daily-giving-indexability-gate.v1.json");

    expect(artifact.daily_giving_indexability_enabled).toBe(false);
    expect(artifact.sitemap_inclusion_allowed).toBe(false);
    expect(artifact.llms_inclusion_allowed).toBe(false);
    expect(artifact.llms_full_inclusion_allowed).toBe(false);
    expect(artifact.trust_badge_allowed_now).toBe(false);
    expect(artifact.public_amplification_allowed_now).toBe(false);
    expect(artifact.cms_mutation_performed).toBe(false);
    expect(artifact.publish_performed).toBe(false);
    expect(artifact.search_submission_performed).toBe(false);
    expect(artifact.deploy_performed).toBe(false);
    expect(artifact.next_pr).toBe("DAILY-GIVING-FIRST-RECORD-REVIEW-TEMPLATE-01");
  });
});
