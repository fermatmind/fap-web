import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hasFreeFullReportCommercialAuthority } from "@/lib/rollout/scaleRollout";
import { isSixHubPaidUnlockFrontendConsumerGuard01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PAGE_PATH = "app/(localized)/[locale]/tests/[slug]/page.tsx";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const TARGETS = [
  ["BIG5_OCEAN", "en"],
  ["BIG5_OCEAN", "zh"],
  ["RIASEC", "en"],
  ["RIASEC", "zh"],
  ["EQ_60", "en"],
  ["EQ_60", "zh"],
  ["ENNEAGRAM", "en"],
  ["ENNEAGRAM", "zh"],
] as const;

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readText(relativePath)) as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function changedFiles(): string[] {
  const commands = [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only", "HEAD~1..HEAD"],
  ];

  for (const args of commands) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      const files = output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (files.length > 0) {
        return files;
      }
    } catch {
      // GitHub pull_request merge checkouts can omit origin/main in fetch-depth=1 clones.
    }
  }

  const entries = [...asRecordArray(readJson(STATE_PATH).prs), ...asRecordArray(readJson(STATE_PATH).items)];
  const pr = entries.find((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01");
  const scope = asRecord(asRecord(pr).scope_validation);
  return Array.isArray(scope.changed_files) ? scope.changed_files.map(String) : [];
}

function freeAuthorityPayload() {
  return {
    capabilities: {
      paywall_mode: "free_only",
    },
    commercial: {
      price_tier: "FREE",
      report_unlock_sku: null,
      upgrade_sku: null,
      upgrade_sku_anchor: null,
      offers: [],
    },
  };
}

describe("Six Hub paid-unlock frontend consumer guard", () => {
  it("treats the 4 target scales across en/zh as free-full-report authority when public lookup is FREE/no SKU/no offers", () => {
    for (const [scaleCode, locale] of TARGETS) {
      expect(
        hasFreeFullReportCommercialAuthority(freeAuthorityPayload()),
        `${scaleCode}:${locale}`
      ).toBe(true);
    }
  });

  it("does not suppress paid or ambiguous commercial states for future scales", () => {
    expect(
      hasFreeFullReportCommercialAuthority({
        capabilities: { paywall_mode: "full" },
        commercial: { price_tier: "FREE", report_unlock_sku: null, upgrade_sku: null, upgrade_sku_anchor: null, offers: [] },
      })
    ).toBe(false);
    expect(
      hasFreeFullReportCommercialAuthority({
        capabilities: { paywall_mode: "free_only" },
        commercial: {
          price_tier: "PAID",
          report_unlock_sku: "SKU_BIG5_FULL_REPORT_299",
          upgrade_sku: "SKU_BIG5_FULL_REPORT_299",
          upgrade_sku_anchor: "BIG5_FULL_REPORT",
          offers: [{ sku: "SKU_BIG5_FULL_REPORT_299" }],
        },
      })
    ).toBe(false);
    expect(
      hasFreeFullReportCommercialAuthority({
        capabilities: { paywall_mode: "free_only" },
        commercial: { price_tier: "FREE", report_unlock_sku: null, upgrade_sku: null, upgrade_sku_anchor: null, offers: [{ sku: "PAID" }] },
      })
    ).toBe(false);
  });

  it("guards the stale paid-unlock disabled Hub card behind backend free-full-report authority", () => {
    const source = readText(PAGE_PATH);

    expect(source).toContain("hasFreeFullReportCommercialAuthority");
    expect(source).toContain("const hasFreeFullReportAuthority = hasFreeFullReportCommercialAuthority(lookup);");
    expect(source).toContain('!hasFreeFullReportAuthority && (rollout.paywallMode === "free_only" || !rollout.commerceEnabled)');
    expect(source).toContain("Only the free report preview is available right now. Paid unlock is temporarily disabled.");
    expect(source).toContain("当前仅开放免费报告预览，付费解锁暂未开放。");
    expect(source).not.toContain("SKU_BIG5_FULL_REPORT_299");
  });

  it("uses neutral full-result fallback copy under free-full-report authority without changing metadata or schema", () => {
    const source = readText(PAGE_PATH);
    const metadataSegment = source.slice(source.indexOf("export async function generateMetadata"), source.indexOf("export default async function"));
    const schemaSegment = source.slice(source.indexOf("const webPageJsonLd"), source.indexOf("return ("));

    expect(source).toContain("提交后可查看完整结果报告。");
    expect(source).toContain("Submit answers and review the full result report.");
    expect(source).toContain("结果用于理解与探索，不作保证性结论。");
    expect(source).toContain("Use the result for reflection and exploration, not as a guarantee.");
    expect(metadataSegment).not.toContain("hasFreeFullReportAuthority");
    expect(schemaSegment).not.toContain("hasFreeFullReportAuthority");
  });

  it("keeps train metadata scoped and excludes the runtime QA task from this PR", () => {
    const train = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const entries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const pr = entries.find((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01");

    expect(train).toContain("id: SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01");
    expect(train).not.toContain("id: SIX-HUB-PAID-UNLOCK-COPY-RUNTIME-QA-READONLY-01");
    expect(asRecord(pr).status).toEqual(
      expect.stringMatching(/^(pending_dependency|in_progress|local_checks_passed_ready_to_push|pr_open_pending_github_checks|ready_to_merge|merged_reconciled_post_merge_cleanup_complete)$/)
    );
  });

  it("keeps current PR changed files inside the PR2 frontend guard scope", () => {
    const files = changedFiles();

    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isSixHubPaidUnlockFrontendConsumerGuard01AllowedFile), files.join("\n")).toBe(true);
  });
});
