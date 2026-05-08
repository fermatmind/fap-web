import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/freemium-status-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/freemium-status-guard.md");
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const LEDGER_PATH = path.join(ROOT, "docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json");
const UASP_ELIGIBILITY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type FreemiumGuard = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  checkoutChanged: boolean;
  paymentChanged: boolean;
  skuChanged: boolean;
  entitlementChanged: boolean;
  reportAccessChanged: boolean;
  offerCardChanged: boolean;
  paywallUiChanged: boolean;
  commerceRuntimeChanged: boolean;
  sourceArtifacts: string[];
  fullLoopRequiredCapabilities: string[];
  guardRules: Array<{ id: string; rule: string; blocksWhen: string }>;
  firstBatchFreemiumStatus: Array<{
    scale_code: string;
    uaspFreemiumStatus: string;
    parityLedgerStatus: string;
    guardStatus: string;
    commerceBehaviorChange: string;
  }>;
  nonEquivalences: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("UASP freemium status guard", () => {
  it("registers PR-UASP2B-04 after SEO/GEO eligibility guard", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; mode: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-UASP2B-03")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP2B-04")).toMatchObject({
      branch: "codex/pr-uasp2b-04-freemium-guard",
      depends_on: ["PR-UASP2B-03"],
      mode: "contract_only",
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP2B-04")?.status);
  });

  it("is contract-only and records zero commerce/report behavior changes", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);

    expect(guard.version).toBe("uasp.freemium_status_guard.v1");
    expect(guard.scope).toBe("PR-UASP2B-04");
    expect(guard.trainName).toBe("uasp-runtime-metadata-integration-train");
    expect(guard.dependsOn).toEqual(["PR-UASP2B-03"]);
    expect(guard.runtimeBehaviorChanged).toBe(false);
    expect(guard.executionMode).toBe("contract_only");
    expect(guard.checkoutChanged).toBe(false);
    expect(guard.paymentChanged).toBe(false);
    expect(guard.skuChanged).toBe(false);
    expect(guard.entitlementChanged).toBe(false);
    expect(guard.reportAccessChanged).toBe(false);
    expect(guard.offerCardChanged).toBe(false);
    expect(guard.paywallUiChanged).toBe(false);
    expect(guard.commerceRuntimeChanged).toBe(false);
  });

  it("keeps source artifacts present and inherits full-loop proof requirements", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);
    const ledger = readJson<{ fullLoopRequiredCapabilities: string[] }>(LEDGER_PATH);
    const eligibility = readJson<{ freemiumGuards: Array<{ id: string; requiredProof?: string[] }> }>(
      UASP_ELIGIBILITY_PATH
    );

    for (const artifactPath of guard.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }

    expect(guard.fullLoopRequiredCapabilities).toEqual(ledger.fullLoopRequiredCapabilities);
    expect(guard.fullLoopRequiredCapabilities).toEqual(
      eligibility.freemiumGuards.find((rule) => rule.id === "full_loop_requires_parity_proof")?.requiredProof
    );
  });

  it("keeps first-batch freemium statuses aligned with UASP mapping and parity ledger", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);
    const registry = readJson<{ entries: Array<{ scale_code: string; freemium_status: string }> }>(REGISTRY_PATH);
    const ledger = readJson<{ scales: Array<{ scale: string; monetizationReadiness: string }> }>(LEDGER_PATH);
    const registryByScale = new Map(registry.entries.map((entry) => [entry.scale_code, entry.freemium_status]));
    const ledgerByScale = new Map(ledger.scales.map((entry) => [entry.scale, entry.monetizationReadiness]));

    for (const row of guard.firstBatchFreemiumStatus.filter((row) => row.scale_code !== "FUTURE_SCALE_PLACEHOLDER")) {
      expect(row.uaspFreemiumStatus, row.scale_code).toBe(registryByScale.get(row.scale_code));
      if (row.parityLedgerStatus !== "not_in_parity_ledger") {
        expect(row.parityLedgerStatus, row.scale_code).toBe(ledgerByScale.get(row.scale_code));
      }
      expect(row.commerceBehaviorChange, row.scale_code).toBe("none");
    }
  });

  it("allows only MBTI as full_loop and blocks future-scale monetization readiness", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);
    const byScale = new Map(guard.firstBatchFreemiumStatus.map((row) => [row.scale_code, row]));

    expect(byScale.get("MBTI")).toMatchObject({
      uaspFreemiumStatus: "full_loop",
      parityLedgerStatus: "full_loop",
      guardStatus: "reference_full_loop",
    });
    expect(byScale.get("BIG5_OCEAN")?.guardStatus).toBe("not_full_loop");
    expect(byScale.get("RIASEC")?.guardStatus).toBe("not_full_loop");
    expect(byScale.get("ENNEAGRAM")?.guardStatus).toBe("backend_ready_not_full_loop");
    expect(byScale.get("FUTURE_SCALE_PLACEHOLDER")).toMatchObject({
      uaspFreemiumStatus: "blocked",
      parityLedgerStatus: "blocked",
      guardStatus: "blocked_until_parity_proof",
    });

    for (const row of guard.firstBatchFreemiumStatus.filter((row) => row.scale_code !== "MBTI")) {
      expect(row.uaspFreemiumStatus, row.scale_code).not.toBe("full_loop");
      expect(row.guardStatus, row.scale_code).not.toBe("reference_full_loop");
    }
  });

  it("locks non-equivalences so SKU, offer, backend_ready, and entitlement do not imply full loop", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);
    const ruleById = new Map(guard.guardRules.map((rule) => [rule.id, rule]));

    expect(ruleById.get("sku_exists_not_full_loop")?.rule).toContain("not proof of full loop");
    expect(ruleById.get("offer_card_not_full_loop")?.rule).toContain("not proof of full loop");
    expect(ruleById.get("backend_ready_not_full_loop")?.rule).toContain("not monetization-ready");
    expect(ruleById.get("frontend_partial_not_full_loop")?.rule).toContain("not full-loop parity");
    expect(guard.nonEquivalences).toEqual(
      expect.arrayContaining([
        "offer_card_is_not_checkout_parity",
        "backend_sku_is_not_public_funnel_proof",
        "entitlement_is_not_full_conversion_loop_proof",
        "report_access_is_not_checkout_parity",
        "backend_ready_is_not_monetization_ready",
        "frontend_partial_is_not_full_loop",
      ])
    );
  });

  it("documents no commerce runtime changes", () => {
    const guard = readJson<FreemiumGuard>(GUARD_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(guard.mustNotChange).toEqual(
      expect.arrayContaining([
        "checkout",
        "payment",
        "SKU",
        "entitlement",
        "report access",
        "offer cards",
        "paywall UI",
        "commerce runtime",
        "report unlock behavior",
        "product catalog behavior",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract-only.");
    expect(doc).toContain("SKU existence is not full-loop proof.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
