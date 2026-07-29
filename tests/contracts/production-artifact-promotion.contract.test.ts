import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/release/staging-receipt.mjs");
const SHA = "0123456789abcdef0123456789abcdef01234567";
const DIGEST = `sha256:${"a".repeat(64)}`;

function verify(receipt: Record<string, unknown>) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fap-web-staging-receipt-"));
  const receiptPath = path.join(directory, "receipt.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
  const result = spawnSync(
    process.execPath,
    [
      SCRIPT,
      "verify",
      `--receipt=${receiptPath}`,
      `--expected-sha=${SHA}`,
      "--expected-staging-run-id=123",
      "--expected-staging-run-attempt=2",
    ],
    { encoding: "utf8" },
  );
  fs.rmSync(directory, { recursive: true, force: true });
  return result;
}

function validReceipt(): Record<string, unknown> {
  return {
    schema: "fermatmind.web.staging-receipt.v1",
    source_sha: SHA,
    artifact_digest: DIGEST,
    release_manifest_digest: `sha256:${"b".repeat(64)}`,
    ci_run_id: "456",
    ci_run_attempt: "1",
    deploy_run_id: "123",
    deploy_run_attempt: "2",
    environment: "staging",
    result: "success",
  };
}

describe("production artifact promotion receipt", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy-production.yml", "utf8");
  const receiptHelper = fs.readFileSync("scripts/release/staging-receipt.mjs", "utf8");

  it("accepts only the exact successful staging receipt identity", () => {
    const result = verify(validReceipt());
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      source_sha: SHA,
      artifact_digest: DIGEST,
      result: "success",
    });
  });

  it.each([
    ["wrong SHA", { source_sha: "f".repeat(40) }, "source SHA"],
    ["wrong artifact digest", { artifact_digest: `sha256:${"c".repeat(63)}` }, "artifact digest"],
    ["wrong manifest digest", { release_manifest_digest: "missing" }, "manifest digest"],
    ["failed result", { result: "failure" }, "staging success receipt"],
    ["wrong environment", { environment: "production" }, "staging success receipt"],
    ["wrong run", { deploy_run_id: "999" }, "deploy run identity"],
    ["extra field", { secret: "must-not-pass" }, "fields do not match"],
  ])("fails closed for %s", (_label, patch, expectedError) => {
    const result = verify({ ...validReceipt(), ...patch });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(expectedError);
  });

  it("promotes only the receipt-bound CI artifact and verifies it before SSH", () => {
    const verifyIndex = workflow.indexOf("- name: Verify promoted artifact before SSH");
    const sshIndex = workflow.indexOf("- name: Set up SSH");

    expect(workflow).toContain("fap-web-staging-receipt-${sha}");
    expect(receiptHelper).toContain("receipt.deploy_run_id !== expectedRunId");
    expect(workflow).toContain("artifact.digest !== process.env.ARTIFACT_DIGEST");
    expect(workflow).toContain('test "$actual_artifact_digest" = "$ARTIFACT_DIGEST"');
    expect(workflow).toContain('test "$actual_manifest_digest" = "$RELEASE_MANIFEST_DIGEST"');
    expect(workflow).toContain('--source-digest "$DEPLOY_SHA"');
    expect(workflow).toContain('--expected-git-sha="$DEPLOY_SHA"');
    expect(verifyIndex).toBeGreaterThan(-1);
    expect(sshIndex).toBeGreaterThan(verifyIndex);
  });

  it("contains no source rebuild, dependency install, or mutable artifact identity", () => {
    for (const forbidden of [
      "pnpm install",
      "npm install",
      "next build",
      "pnpm build",
      "git reset --hard '$DEPLOY_SHA'",
      "standalone-latest",
    ]) {
      expect(workflow).not.toContain(forbidden);
    }
    expect(workflow).toContain("Promote receipt-bound immutable release");
    expect(workflow).toContain("fap-web-production-receipt-${{ needs.policy-guard.outputs.deploy_sha }}");
  });
});
