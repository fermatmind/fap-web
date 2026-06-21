import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isCurrentRiasecPack12AllowedFile,
  isSeoCmsDraftPackageContract01AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PACKAGE_PATH = "docs/seo/agent/examples/seo-cms-draft-package-contract.example.json";

type CmsDraftPackageFixture = {
  mode: string;
  proposed_draft: {
    media_policy: {
      media_library_required: boolean;
      local_public_asset_write_allowed: boolean;
    };
  };
  claim_gate: {
    protocol: string;
    claims: Array<{
      risk_level: string;
      verdict: string;
      evidence_ids: string[];
    }>;
  };
  approvals_required: string[];
  forbidden_actions: string[];
};

function readPackage(): CmsDraftPackageFixture {
  return JSON.parse(fs.readFileSync(path.join(ROOT, PACKAGE_PATH), "utf8")) as CmsDraftPackageFixture;
}

function writeTempPackage(draftPackage: CmsDraftPackageFixture): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-cms-draft-package-contract-"));
  const filePath = path.join(tempDir, "draft-package.json");
  fs.writeFileSync(filePath, JSON.stringify(draftPackage, null, 2));
  return filePath;
}

function runChecker(packagePath: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync("node", ["scripts/seo/check-seo-cms-draft-package-contract.mjs", packagePath], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || "") };
  }
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("SEO CMS draft package contract", () => {
  it("accepts the example as dry-run only without CMS writes", () => {
    const result = runChecker(PACKAGE_PATH);
    const report = JSON.parse(result.stdout);

    expect(result.status).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.boundaries).toMatchObject({
      cms_writes_attempted: false,
      draft_created: false,
      media_upload_attempted: false,
      provider_calls_attempted: false,
      runtime_seo_changes_attempted: false,
      network_calls_attempted: false,
    });
  });

  it("requires media library policy and blocks local public asset writes", () => {
    const draftPackage = readPackage();
    draftPackage.proposed_draft.media_policy.media_library_required = false;
    draftPackage.proposed_draft.media_policy.local_public_asset_write_allowed = true;
    const result = runChecker(writeTempPackage(draftPackage));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("media_library_required");
    expect(result.stdout).toContain("local_public_asset_write_allowed");
  });

  it("enforces claim gate protocol, evidence, and high-risk review", () => {
    const draftPackage = readPackage();
    draftPackage.claim_gate.protocol = "SOFT_REVIEW";
    draftPackage.claim_gate.claims[0].risk_level = "high";
    draftPackage.claim_gate.claims[0].verdict = "APPROVED_FOR_DRY_RUN";
    draftPackage.claim_gate.claims[0].evidence_ids = ["unknown-evidence"];
    const result = runChecker(writeTempPackage(draftPackage));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("CLAIM_GATE_PROTOCOL");
    expect(result.stdout).toContain("unknown evidence_id");
    expect(result.stdout).toContain("high risk claim cannot be auto-approved");
  });

  it("requires exact approval boundaries before any CMS mutation", () => {
    const draftPackage = readPackage();
    draftPackage.approvals_required = ["APPROVE_ALL"];
    const result = runChecker(writeTempPackage(draftPackage));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("AUTHORIZE_CMS_MUTATION");
    expect(result.stdout).toContain("APPROVE_CLAIM_GATE");
    expect(result.stdout).toContain("APPROVE_DRAFT_PACKAGE_HASH");
  });

  it("documents dry-run boundaries and package script", () => {
    const docs = fs.readFileSync(path.join(ROOT, "docs/seo/agent/CMS_DRAFT_PACKAGE_CONTRACT.md"), "utf8");
    const script = fs.readFileSync(path.join(ROOT, "scripts/seo/check-seo-cms-draft-package-contract.mjs"), "utf8");
    const pkg = fs.readFileSync(path.join(ROOT, "package.json"), "utf8");

    expect(docs).toContain("does not write CMS");
    expect(docs).toContain("The first CMS-write-capable consumer must be a later explicitly approved PR");
    expect(script).toContain("draft_created: false");
    expect(pkg).toContain("\"seo:cms-draft-package-contract\"");
  });

  it("keeps current PR changed files inside the approved CMS draft package contract scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every(
        (file) => isSeoCmsDraftPackageContract01AllowedFile(file) || isCurrentRiasecPack12AllowedFile(file),
      ),
      files.join("\n"),
    ).toBe(true);
  });
});
