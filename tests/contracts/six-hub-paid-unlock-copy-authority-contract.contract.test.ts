import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSixHubPaidUnlockCopyAuthorityContract01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract.v1.json";
const REPORT_PATH = "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract-2026-06-25.md";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const EXPECTED_ALLOWED_FILES = [
  "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract-2026-06-25.md",
  "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract.v1.json",
  "tests/contracts/six-hub-paid-unlock-copy-authority-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function changedFiles(): string[] {
  const entries = [...asRecordArray(readJson(STATE_PATH).prs), ...asRecordArray(readJson(STATE_PATH).items)];
  const pr = entries.find((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01");
  return asStringArray(asRecord(asRecord(pr).scope_validation).changed_files);
}

describe("Six Hub paid-unlock copy authority contract", () => {
  const contract = readJson(CONTRACT_PATH);
  const report = readText(REPORT_PATH);
  const train = readText(TRAIN_PATH);
  const state = readJson(STATE_PATH);

  it("declares the authorized agents, scales, locales, URL count, and verdict", () => {
    expect(contract.schema_version).toBe("fermatmind.six_hub_paid_unlock_copy_authority_contract.v1");
    expect(contract.task_id).toBe("SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01");
    expect(contract.verdict).toBe("READY_FOR_FRONTEND_CONSUMER_GUARD");
    expect(contract.producing_agent).toBe("seo_geo_control");
    expect(asStringArray(contract.collaborating_agents)).toEqual([
      "assessment_hub",
      "claim_privacy_safety_gate",
      "runtime_qa",
    ]);
    expect(asStringArray(contract.affected_scales)).toEqual(["BIG5_OCEAN", "RIASEC", "EQ_60", "ENNEAGRAM"]);
    expect(asStringArray(contract.affected_locales)).toEqual(["en", "zh"]);
    expect(contract.affected_url_count).toBe(8);
  });

  it("defines the backend public lookup authority predicate and optional markers", () => {
    expect(asRecord(contract.backend_authority_predicates)).toEqual({
      "paywall_mode": "free_only",
      "commercial.price_tier": "FREE",
      "report_unlock_sku": null,
      "upgrade_sku": null,
      "upgrade_sku_anchor": null,
      "offers": [],
    });
    expect(asRecord(contract.optional_backend_authority_predicates)).toEqual({
      free_full_report_mode: true,
      paywall_suppressed: true,
      commercial_state: "disabled_by_free_full_report_mode",
    });
  });

  it("locks the forbidden public Hub copy families and safe copy direction", () => {
    expect(asStringArray(contract.forbidden_public_hub_copy_families)).toEqual(
      expect.arrayContaining([
        "Only the free report preview is available right now.",
        "Paid unlock is temporarily disabled.",
        "当前仅开放免费报告预览",
        "付费解锁暂未开放",
        "free preview only",
        "preview-only report",
        "paid unlock later",
        "full report locked",
        "upgrade required for full report",
        "pay to see full result",
      ])
    );
    expect(asStringArray(contract.allowed_copy_direction)).toEqual(
      expect.arrayContaining([
        "full result/report available after completion when backend authority supports it",
        "neutral availability state",
        "method boundary",
        "no hidden paywall implication",
        "no final CMS copy in this contract",
      ])
    );
    expect(asStringArray(contract.disallowed_copy_direction)).toEqual(
      expect.arrayContaining(["paid unlock disabled", "preview-only", "future paid unlock", "paid upgrade implication"])
    );
  });

  it("keeps scale-specific claim boundaries explicit", () => {
    const boundaries = asRecord(contract.claim_boundaries);
    expect(asStringArray(boundaries.BIG5_OCEAN)).toEqual(
      expect.arrayContaining(["no diagnosis", "no hiring claim", "no salary claim", "no fixed identity claim"])
    );
    expect(asStringArray(boundaries.RIASEC)).toEqual(
      expect.arrayContaining(["examples only", "no deterministic career recommendation", "no admission claim"])
    );
    expect(asStringArray(boundaries.EQ_60)).toEqual(
      expect.arrayContaining(["non-clinical", "no relationship guarantee", "no employment guarantee"])
    );
    expect(asStringArray(boundaries.ENNEAGRAM)).toEqual(
      expect.arrayContaining(["no final fixed type certainty", "no clinical claim", "no relationship verdict"])
    );
  });

  it("preserves hard HOLD and negative guarantees", () => {
    expect(asStringArray(contract.readiness_statuses)).toEqual(
      expect.arrayContaining([
        "READY_FOR_FRONTEND_CONSUMER_GUARD",
        "NEEDS_BACKEND_MARKER_FIRST",
        "NEEDS_CMS_COPY_FIX",
        "BLOCKED_PRIVATE_LEAK",
        "HOLD_DEPLOY_RUNTIME_QA",
      ])
    );
    expect(asStringArray(contract.hard_hold)).toEqual(
      expect.arrayContaining([
        "no CMS",
        "no publish",
        "no search submission",
        "no provider calls",
        "no deploy",
        "no runtime QA before deploy",
        "no private data",
        "no payment/order/benefit mutation",
      ])
    );
    expect(Object.values(asRecord(contract.negative_guarantees)).every((value) => value === false)).toBe(true);
  });

  it("aligns markdown, manifest, and state with the two authorized PR ids only", () => {
    expect(report).toContain("Task: `SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01`");
    expect(report).toContain("Verdict: `READY_FOR_FRONTEND_CONSUMER_GUARD`");
    expect(report).toContain("`SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01`");
    expect(report).toContain("no runtime QA before deploy");

    expect(train).toContain("id: SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01");
    expect(train).toContain("id: SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01");
    expect(train).not.toContain("id: SIX-HUB-PAID-UNLOCK-COPY-RUNTIME-QA-READONLY-01");

    const entries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    expect(entries.some((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01")).toBe(true);
    expect(entries.some((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01")).toBe(true);
    expect(entries.some((entry) => entry.id === "SIX-HUB-PAID-UNLOCK-COPY-RUNTIME-QA-READONLY-01")).toBe(false);
  });

  it("keeps recorded PR1 changed files inside the PR1 scope", () => {
    for (const file of EXPECTED_ALLOWED_FILES) {
      expect(isSixHubPaidUnlockCopyAuthorityContract01AllowedFile(file), file).toBe(true);
    }

    const files = changedFiles();
    expect(files.every(isSixHubPaidUnlockCopyAuthorityContract01AllowedFile), files.join("\n")).toBe(true);
  });
});
