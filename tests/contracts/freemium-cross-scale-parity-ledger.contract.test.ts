import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json");
const DOC_PATH = path.join(ROOT, "docs/freemium/freemium-cross-scale-parity-ledger.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b-state.json");

type FreemiumParityClassification =
  | "full_loop"
  | "backend_ready"
  | "frontend_partial"
  | "scale_specific"
  | "MBTI_only"
  | "cross_scale_partial"
  | "blocked"
  | "unknown";

type FreemiumCapability =
  | "free_result"
  | "locked_report"
  | "offer_card"
  | "SKU"
  | "checkout"
  | "order_wait"
  | "entitlement_unlock"
  | "PDF_report_access"
  | "history"
  | "invite_unlock"
  | "bundle_module_entitlement"
  | "email_capture"
  | "retention_lifecycle"
  | "attribution";

type SourceContract = {
  path: string;
  requiredTokens: string[];
};

type ScaleParityRow = {
  scale: string;
  scaleName: string;
  monetizationReadiness: FreemiumParityClassification;
  monetizationReady: boolean;
  summary: string;
  capabilities: Record<FreemiumCapability, FreemiumParityClassification>;
  evidence: SourceContract[];
  mustProveBeforeMonetizationClaims: string[];
};

type FreemiumParityLedger = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  commerceBehaviorChanged: boolean;
  reportBehaviorChanged: boolean;
  paymentBehaviorChanged: boolean;
  classificationEnum: FreemiumParityClassification[];
  capabilityEnum: FreemiumCapability[];
  fullLoopRequiredCapabilities: FreemiumCapability[];
  nonEquivalences: string[];
  scales: ScaleParityRow[];
  explicitFindings: Array<{ id: string; classification: FreemiumParityClassification; summary: string }>;
};

function readLedger(): FreemiumParityLedger {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as FreemiumParityLedger;
}

describe("freemium cross-scale parity ledger", () => {
  it("registers PR-PRA1B-06 after PR-PRA1B-05 in the Phase 1B train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(byId.get("PR-PRA1B-05")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-PRA1B-06")).toMatchObject({
      branch: "codex/pr-pra1b-06-freemium-cross-scale-parity-ledger",
      depends_on: ["PR-PRA1B-05"],
      status: "in_progress",
    });
  });

  it("uses the frozen parity classification and capability taxonomy", () => {
    const ledger = readLedger();
    const allowed = new Set(ledger.classificationEnum);

    expect(ledger.version).toBe("runtime.freemium_cross_scale_parity_ledger.v1");
    expect(ledger.scope).toBe("PR-PRA1B-06");
    expect(ledger.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(ledger.runtimeBehaviorChanged).toBe(false);
    expect(ledger.commerceBehaviorChanged).toBe(false);
    expect(ledger.reportBehaviorChanged).toBe(false);
    expect(ledger.paymentBehaviorChanged).toBe(false);
    expect(ledger.classificationEnum).toEqual([
      "full_loop",
      "backend_ready",
      "frontend_partial",
      "scale_specific",
      "MBTI_only",
      "cross_scale_partial",
      "blocked",
      "unknown",
    ]);

    for (const scale of ledger.scales) {
      expect(allowed.has(scale.monetizationReadiness), scale.scale).toBe(true);
      expect(Object.keys(scale.capabilities).sort(), scale.scale).toEqual([...ledger.capabilityEnum].sort());
      for (const value of Object.values(scale.capabilities)) {
        expect(allowed.has(value), scale.scale).toBe(true);
      }
    }
  });

  it("covers MBTI, Big Five, RIASEC, and the future-scale placeholder", () => {
    const ledger = readLedger();
    const byScale = new Map(ledger.scales.map((scale) => [scale.scale, scale]));

    expect([...byScale.keys()].sort()).toEqual(["BIG5_OCEAN", "FUTURE_SCALE", "MBTI", "RIASEC"]);
    expect(byScale.get("MBTI")).toMatchObject({ monetizationReadiness: "full_loop", monetizationReady: true });
    expect(byScale.get("BIG5_OCEAN")).toMatchObject({
      monetizationReadiness: "cross_scale_partial",
      monetizationReady: false,
    });
    expect(byScale.get("RIASEC")).toMatchObject({ monetizationReadiness: "frontend_partial", monetizationReady: false });
    expect(byScale.get("FUTURE_SCALE")).toMatchObject({ monetizationReadiness: "blocked", monetizationReady: false });
  });

  it("keeps full-loop monetization claims restricted to MBTI evidence", () => {
    const ledger = readLedger();
    const byScale = new Map(ledger.scales.map((scale) => [scale.scale, scale]));
    const mbti = byScale.get("MBTI");
    const big5 = byScale.get("BIG5_OCEAN");
    const riasec = byScale.get("RIASEC");
    const futureScale = byScale.get("FUTURE_SCALE");

    expect(mbti).toBeDefined();
    for (const capability of ledger.fullLoopRequiredCapabilities) {
      expect(mbti?.capabilities[capability], capability).toBe("full_loop");
    }

    expect(big5?.capabilities.checkout).toBe("blocked");
    expect(big5?.capabilities.SKU).not.toBe("full_loop");
    expect(big5?.capabilities.invite_unlock).toBe("blocked");
    expect(riasec?.capabilities.checkout).toBe("blocked");
    expect(riasec?.capabilities.offer_card).toBe("blocked");
    expect(riasec?.capabilities.SKU).toBe("blocked");
    expect(futureScale?.capabilities.checkout).toBe("blocked");
    expect(futureScale?.mustProveBeforeMonetizationClaims.length).toBeGreaterThan(0);
  });

  it("requires evidence before a scale can be marked monetization-ready", () => {
    const ledger = readLedger();

    for (const scale of ledger.scales) {
      expect(scale.evidence.length, scale.scale).toBeGreaterThan(0);
      if (scale.monetizationReady) {
        expect(scale.monetizationReadiness, scale.scale).toBe("full_loop");
        for (const capability of ledger.fullLoopRequiredCapabilities) {
          expect(scale.capabilities[capability], `${scale.scale}:${capability}`).toBe("full_loop");
        }
        expect(scale.mustProveBeforeMonetizationClaims, scale.scale).toEqual([]);
      } else {
        expect(scale.mustProveBeforeMonetizationClaims.length, scale.scale).toBeGreaterThan(0);
      }
    }
  });

  it("anchors parity rows to current source tokens", () => {
    const ledger = readLedger();

    for (const scale of ledger.scales) {
      for (const source of scale.evidence) {
        const absoluteSource = path.join(ROOT, source.path);
        expect(fs.existsSync(absoluteSource), `${scale.scale}: ${source.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of source.requiredTokens) {
          expect(sourceText, `${scale.scale}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents no runtime, commerce, report, or payment behavior change", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const ledger = readLedger();

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Commerce/report/payment behavior changed: no");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).toContain("Offer card existence is not checkout parity.");
    expect(ledger.nonEquivalences).toContain("offer_card_is_not_checkout_parity");
    expect(ledger.nonEquivalences).toContain("backend_sku_is_not_public_funnel_proof");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
