import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/signal-to-domain-role-matrix.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/signal-to-domain-role-matrix.md");
const OVERLAY_PATH = path.join(ROOT, "docs/assessment/domains/generated/core-decision-domain-v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-cdd-state.json");

const ROLE_ENUM = ["primary", "secondary", "supporting", "future", "blocked"];
const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
const SIGNALS = ["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM", "future_DISC", "future_EQ", "future_career_values", "future_ability_tests"];
const STATUS_ENUM = [
  "ready_for_domain_v1",
  "partial",
  "artifact_only",
  "backend_ready",
  "frontend_partial",
  "blocked",
  "dangerous_if_expanded",
  "requires_human_decision",
  "safe_to_defer",
  "unknown",
];

type MatrixArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  roleEnum: string[];
  domainStatusEnum: string[];
  domains: string[];
  signals: string[];
  matrix: Array<{
    signal: string;
    signal_type: string;
    roles: Record<string, string>;
    status: string;
    eligibilityGrantedByRole: boolean;
    evidence: string[];
  }>;
  hardRules: string[];
  mustNotChange: string[];
};

function readArtifact(): MatrixArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as MatrixArtifact;
}

describe("Signal-to-Domain role matrix", () => {
  it("depends on the merged domain registry overlay and updates train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("core-decision-domain-governance-train");
    expect(byId.get("PR-CDD-01")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/736",
    });
    expect(byId.get("PR-CDD-02")).toMatchObject({
      status: "merged",
      branch: "codex/pr-cdd-02-signal-to-domain-role-matrix",
      depends_on: ["PR-CDD-01"],
      pr_url: "https://github.com/fermatmind/fap-web/pull/737",
    });
    expect(fs.existsSync(OVERLAY_PATH)).toBe(true);
  });

  it("uses only approved domains, signals, roles, and status values", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("core_decision_domain.signal_to_domain_role_matrix.v1");
    expect(artifact.scope).toBe("PR-CDD-02");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.dependsOn).toEqual(["PR-CDD-01"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.roleEnum).toEqual(ROLE_ENUM);
    expect(artifact.domainStatusEnum).toEqual(STATUS_ENUM);
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.signals).toEqual(SIGNALS);
    expect(artifact.matrix.map((row) => row.signal)).toEqual(SIGNALS);

    for (const row of artifact.matrix) {
      expect(STATUS_ENUM).toContain(row.status);
      expect(Object.keys(row.roles)).toEqual(DOMAINS);
      for (const role of Object.values(row.roles)) {
        expect(ROLE_ENUM).toContain(role);
      }
      expect(row.eligibilityGrantedByRole).toBe(false);
      expect(row.evidence.length, row.signal).toBeGreaterThan(0);
    }
  });

  it("keeps first-batch signal types aligned with the UASP registry", () => {
    const artifact = readArtifact();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<{ scale_code: string; signal_type: string }>;
    };
    const byScale = new Map(scaleRegistry.entries.map((entry) => [entry.scale_code, entry.signal_type]));

    for (const row of artifact.matrix.filter((entry) => ["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM"].includes(entry.signal))) {
      expect(row.signal_type, row.signal).toBe(byScale.get(row.signal));
    }
  });

  it("enforces the requested first-batch role mapping and blocked cases", () => {
    const artifact = readArtifact();
    const bySignal = new Map(artifact.matrix.map((row) => [row.signal, row]));

    expect(bySignal.get("MBTI")?.roles).toEqual({
      self_understanding: "primary",
      career_decision: "supporting",
      workstyle_decision: "secondary",
    });
    expect(bySignal.get("BIG5_OCEAN")?.roles).toEqual({
      self_understanding: "primary",
      career_decision: "supporting",
      workstyle_decision: "primary",
    });
    expect(bySignal.get("RIASEC")?.roles).toEqual({
      self_understanding: "supporting",
      career_decision: "primary",
      workstyle_decision: "blocked",
    });
    expect(bySignal.get("ENNEAGRAM")?.roles).toEqual({
      self_understanding: "supporting",
      career_decision: "blocked",
      workstyle_decision: "supporting",
    });
    expect(bySignal.get("future_ability_tests")?.roles.career_decision).toBe("blocked");
    expect(bySignal.get("future_ability_tests")?.roles.workstyle_decision).toBe("blocked");
  });

  it("does not let roles grant runtime eligibility or future-signal readiness", () => {
    const artifact = readArtifact();
    const futureRows = artifact.matrix.filter((row) => row.signal.startsWith("future_"));

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "RIASEC cannot enter Workstyle Decision.",
        "Big Five career role is supporting only, not recommender.",
        "Enneagram cannot enter Career Decision.",
        "Future signals cannot be marked ready.",
        "No signal role grants recommendation eligibility automatically.",
        "No signal role grants profile contribution automatically.",
        "No signal role grants SEO/GEO eligibility automatically.",
        "No signal role grants freemium eligibility automatically.",
      ])
    );
    for (const row of futureRows) {
      expect(row.status, row.signal).not.toBe("ready_for_domain_v1");
      expect(row.eligibilityGrantedByRole, row.signal).toBe(false);
    }
    expect(artifact.mustNotChange).toEqual(expect.arrayContaining(["recommendation runtime", "profile runtime", "SEO/GEO output", "freemium runtime"]));
  });

  it("documents the matrix without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("| MBTI | primary | supporting | secondary |");
    expect(doc).toContain("Big Five Career Decision role is supporting only");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
