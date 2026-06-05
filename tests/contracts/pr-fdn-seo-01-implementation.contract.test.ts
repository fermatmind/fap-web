import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { isPrFdnSeo01ImplementationAllowedFile } from "./helpers/currentPrScope";
import type { DailyGivingRecord } from "@/lib/foundation/dailyGiving";

vi.mock("@/lib/foundation/dailyGiving", () => ({
  fetchDailyGivingMonths: vi.fn(),
  fetchDailyGivingRecords: vi.fn(),
}));

import { fetchDailyGivingMonths } from "@/lib/foundation/dailyGiving";
import { buildDailyGivingJsonLd, listDailyGivingDiscoverabilityEntries } from "@/lib/foundation/dailyGivingSeo";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/pr-fdn-seo-01-implementation.v1.json";

const FORBIDDEN_SCHEMA_TOKENS = ["DonateAction", "Offer", "Product", "AggregateOffer", "Dataset"];

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function schemaTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(schemaTypes);
  }
  if (!value || typeof value !== "object") {
    return [];
  }

  const source = value as Record<string, unknown>;
  const current = typeof source["@type"] === "string" ? [source["@type"]] : [];
  return [...current, ...Object.values(source).flatMap(schemaTypes)];
}

describe("PR-FDN-SEO-01-IMPLEMENTATION", () => {
  it("adds visible-page JSON-LD while gating ItemList on backend public records", () => {
    const emptyJsonLd = buildDailyGivingJsonLd({ locale: "en", records: [] });
    expect(emptyJsonLd.webPage["@type"]).toBe("WebPage");
    expect(emptyJsonLd.breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(emptyJsonLd.itemList).toBeNull();

    const record: DailyGivingRecord = {
      code: "2026-06-001",
      title: "June education support",
      description: "Backend-published public giving record.",
      month: "2026-06",
      donatedOn: "2026-06-01",
      amountMinor: 1000,
      currency: "USD",
      recipientName: "Public recipient",
      recipientUrl: null,
      evidenceUrl: null,
      status: "published",
      socialLinks: [],
    };
    const populatedJsonLd = buildDailyGivingJsonLd({ locale: "en", records: [record], yearMonth: "2026-06" });
    expect(populatedJsonLd.itemList?.["@type"]).toBe("ItemList");
    expect(populatedJsonLd.itemList?.numberOfItems).toBe(1);
    expect(populatedJsonLd.itemList?.itemListElement).toHaveLength(1);

    const serialized = JSON.stringify(populatedJsonLd);
    for (const token of FORBIDDEN_SCHEMA_TOKENS) {
      expect(serialized).not.toContain(token);
    }
    expect(new Set(schemaTypes(populatedJsonLd))).toEqual(new Set(["BreadcrumbList", "ItemList", "ListItem", "WebPage"]));
  });

  it("keeps llms Daily Giving exposure disabled until the indexability gate is reopened", async () => {
    vi.mocked(fetchDailyGivingMonths).mockResolvedValueOnce([]);
    await expect(listDailyGivingDiscoverabilityEntries("en")).resolves.toEqual([]);

    vi.mocked(fetchDailyGivingMonths).mockResolvedValueOnce([
      { yearMonth: "2026-06", recordCount: 2, amountMinor: 3000, currency: "USD" },
      { yearMonth: "2026-07", recordCount: 0, amountMinor: null, currency: "USD" },
    ]);

    await expect(listDailyGivingDiscoverabilityEntries("en")).resolves.toEqual([]);
  });

  it("records implementation boundaries and limits changed files to the declared scope", () => {
    const report = readJson<{
      final_decision?: string;
      no_frontend_fallback_content?: boolean;
      no_search_channel_action?: boolean;
      no_url_submission?: boolean;
      item_list_requires_public_records?: boolean;
      llms_exposure_requires_public_months?: boolean;
      next_task?: string;
    }>(REPORT_PATH);

    expect(report.final_decision).toBe("pr_fdn_seo_01_implementation_completed_ready_for_deploy_readiness");
    expect(report.item_list_requires_public_records).toBe(true);
    expect(report.llms_exposure_requires_public_months).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.next_task).toBe("FRONTEND-DEPLOY-READINESS");

    const changedFiles = [
      "app/(localized)/[locale]/foundation/daily-giving/page.tsx",
      "app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx",
      "app/llms.txt/route.ts",
      "app/llms-full.txt/route.ts",
      "lib/foundation/dailyGivingSeo.ts",
      "docs/seo/pr-fdn-seo-01-implementation.md",
      "docs/seo/generated/pr-fdn-seo-01-implementation.v1.json",
      "tests/contracts/pr-fdn-02b-daily-giving-frontend-pages.contract.test.tsx",
      "tests/contracts/pr-fdn-seo-01-implementation.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];
    for (const file of changedFiles) {
      expect(isPrFdnSeo01ImplementationAllowedFile(file), file).toBe(true);
    }
  });
});
