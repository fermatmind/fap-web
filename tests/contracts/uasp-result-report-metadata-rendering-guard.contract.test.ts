import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/result-report-metadata-rendering-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/result-report-metadata-rendering-guard.md");
const ENVELOPE_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-runtime-metadata-envelope.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type GuardArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  envelopeArtifact: string;
  runtimeEnvelopePresent: boolean;
  runtimeDataAttributesAdded: boolean;
  runtimeDataAttributesDeferred: boolean;
  frontendArtifactSynthesisAllowed: boolean;
  allowedDataAttributesIfBackedByRuntimeEnvelope: string[];
  runtimeScan: { command: string; matches: number; status: string };
  pageFamilyGuards: Array<{
    pageFamily: string;
    evidence: string[];
    guardStatus: string;
    visibleCopyChange: boolean;
  }>;
  noVisibleCopyRules: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function collectRuntimeMatches(): string[] {
  const needles = /uasp_signal_v1|data-uasp|uaspSignal|uasp_signal/;
  const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
  const matches: string[] = [];

  function visitDirectory(relativeDirectory: string) {
    if (ignoredDirectories.has(path.basename(relativeDirectory))) {
      return;
    }

    for (const entry of fs.readdirSync(path.join(ROOT, relativeDirectory), { withFileTypes: true })) {
      const childPath = path.join(relativeDirectory, entry.name);

      if (entry.isDirectory()) {
        visitDirectory(childPath);
        continue;
      }

      if (!entry.isFile() || !/\.(cjs|js|jsx|mjs|ts|tsx)$/.test(childPath)) {
        continue;
      }

      const content = fs.readFileSync(path.join(ROOT, childPath), "utf8");
      if (needles.test(content)) {
        matches.push(childPath);
      }
    }
  }

  for (const directory of ["app", "components", "lib"]) {
    visitDirectory(directory);
  }

  return matches;
}

describe("UASP result/report metadata rendering guard", () => {
  it("registers PR-UASP2B-02 after the envelope contract", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; mode: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-UASP2B-01")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP2B-02")).toMatchObject({
      branch: "codex/pr-uasp2b-02-result-report-metadata-guard",
      depends_on: ["PR-UASP2B-01"],
      mode: "guard_only",
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP2B-02")?.status);
  });

  it("keeps the guard contract-only because runtime envelope data is absent", () => {
    const guard = readJson<GuardArtifact>(GUARD_PATH);

    expect(fs.existsSync(ENVELOPE_PATH)).toBe(true);
    expect(guard.version).toBe("uasp.result_report_metadata_rendering_guard.v1");
    expect(guard.scope).toBe("PR-UASP2B-02");
    expect(guard.dependsOn).toEqual(["PR-UASP2B-01"]);
    expect(guard.runtimeBehaviorChanged).toBe(false);
    expect(guard.executionMode).toBe("guard_only_contract_only");
    expect(guard.runtimeEnvelopePresent).toBe(false);
    expect(guard.runtimeDataAttributesAdded).toBe(false);
    expect(guard.runtimeDataAttributesDeferred).toBe(true);
    expect(guard.frontendArtifactSynthesisAllowed).toBe(false);
  });

  it("allows only non-visible data attributes after a real runtime envelope exists", () => {
    const guard = readJson<GuardArtifact>(GUARD_PATH);

    expect(guard.allowedDataAttributesIfBackedByRuntimeEnvelope).toEqual([
      "data-uasp-signal-type",
      "data-uasp-result-shape",
      "data-uasp-claim-level",
      "data-uasp-envelope-state",
    ]);
    expect(guard.runtimeDataAttributesAdded).toBe(false);
  });

  it("proves app, components, and lib do not currently contain UASP runtime payload or data attributes", () => {
    const guard = readJson<GuardArtifact>(GUARD_PATH);
    expect(collectRuntimeMatches()).toEqual([]);
    expect(guard.runtimeScan.matches).toBe(0);
    expect(guard.runtimeScan.status).toBe("no_runtime_envelope_found");
  });

  it("keeps result/report page families deferred without visible copy changes", () => {
    const guard = readJson<GuardArtifact>(GUARD_PATH);

    expect(guard.pageFamilyGuards.map((entry) => entry.pageFamily)).toEqual([
      "MBTI result/report",
      "Big Five result/report",
      "RIASEC result/report",
      "Enneagram result/report",
    ]);

    for (const entry of guard.pageFamilyGuards) {
      expect(entry.guardStatus, entry.pageFamily).toBe("deferred_until_runtime_envelope");
      expect(entry.visibleCopyChange, entry.pageFamily).toBe(false);
      for (const evidencePath of entry.evidence) {
        expect(fs.existsSync(path.join(ROOT, evidencePath)), evidencePath).toBe(true);
      }
    }
  });

  it("blocks visible copy, shell routing, entitlement, profile, and recommendation changes", () => {
    const guard = readJson<GuardArtifact>(GUARD_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(guard.noVisibleCopyRules).toEqual(
      expect.arrayContaining([
        "no_signal_badge_text",
        "no_new_translated_copy",
        "no_user_facing_signal_explanation",
        "no_paywall_copy_change",
        "no_report_prose_change",
      ])
    );
    expect(guard.mustNotChange).toEqual(
      expect.arrayContaining([
        "result/report components",
        "visible copy",
        "shell routing",
        "scoring",
        "report content",
        "report entitlement",
        "PDF",
        "profile runtime",
        "recommendation runtime",
        "runtime payloads",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR does not add them because the runtime envelope is not present.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
