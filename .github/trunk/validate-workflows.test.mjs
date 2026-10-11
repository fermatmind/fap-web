import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateWorkflowSet } from "./validate-workflows.mjs";

function fixture(extra = false) {
  const root = mkdtempSync(join(tmpdir(), "trunk-workflows-"));
  const dir = join(root, ".github/workflows");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "ci.yml"), "on:\n  push:\n");
  writeFileSync(join(dir, "deploy.yml"), "on:\n  workflow_run:\n");
  writeFileSync(join(dir, "nightly.yml"), "on:\n  schedule:\n");
  writeFileSync(join(dir, "recovery.yml"), "on:\n  workflow_dispatch:\n");
  if (extra) writeFileSync(join(dir, "legacy.yml"), "on:\n  workflow_dispatch:\n");
  return root;
}

test("accepts exactly four final workflows with recovery as the only manual entry", () => {
  assert.equal(validateWorkflowSet(fixture(), "final").valid, true);
});

test("allows legacy entries only during transition", () => {
  const root = fixture(true);
  assert.equal(validateWorkflowSet(root, "transition").valid, true);
  assert.equal(validateWorkflowSet(root, "final").valid, false);
});


test("every selected contract shard installs pinned Node before dependencies", () => {
  const ci = readFileSync(new URL("../workflows/ci.yml", import.meta.url), "utf8");
  const shard = ci.split("  contract-shards:\n")[1].split("\n  contracts:\n")[0];
  assert.match(shard, /if: needs\.classify\.outputs\.contracts_required == 'true'/);
  const nodeStep = shard.match(/      - uses: actions\/setup-node[^\n]*\n([\s\S]*?)(?=      - )/)[1];
  assert.match(nodeStep, /node-version: 24/);
  assert.doesNotMatch(nodeStep, /\bif:/, "docs-only selected contracts also need Node 24");
  assert.ok(shard.indexOf("actions/setup-node") < shard.indexOf("install-dependencies.sh"));
});


test("browser modes retain selected scenarios in isolated jobs after fast failures", () => {
  const ci = readFileSync(new URL("../workflows/ci.yml", import.meta.url), "utf8");
  const build = ci.split("  build:\n")[1].split("\n  browser-tests:\n")[0];
  const browser = ci.split("  browser-tests:\n")[1].split("\n  contract-shards:\n")[0];
  assert.doesNotMatch(build, /playwright|run-changed-tests/);
  assert.match(browser, /needs: \[classify, build, contracts\]/);
  assert.match(browser, /if: contains\(needs\.classify\.outputs\.classification, 'tests\/e2e\/'\)/);
  assert.match(browser, /server_mode: \[default, production\]/);
  assert.match(browser, /PLAYWRIGHT_SERVER_MODE: \$\{\{ matrix\.server_mode \}\}/);
  assert.match(browser, /NEXT_PUBLIC_API_URL: http:\/\/127\.0\.0\.1:8000/);
  assert.doesNotMatch(browser, /concurrency:|fap-web-production-api-read|continue-on-error|--grep/);
  assert.match(browser, /run-changed-tests\.mjs '[^'\n]+' '[^'\n]+' e2e\n/);
  assert.equal((browser.match(/run-changed-tests\.mjs/g) ?? []).length, 1);
});

test("exact-SHA receipt rejects failed, cancelled or missing selected browser modes", () => {
  const ci = readFileSync(new URL("../workflows/ci.yml", import.meta.url), "utf8");
  const receipt = ci.split("  validation-receipt:\n")[1];
  assert.match(receipt, /needs: \[classify, build, contracts, browser-tests\]/);
  assert.match(receipt, /BROWSER_TESTS_REQUIRED: \$\{\{ contains\(needs\.classify\.outputs\.classification, 'tests\/e2e\/'\) \}\}/);
  const filter = receipt.match(/jq -e --argjson browsers "\$BROWSER_TESTS_REQUIRED" '([^']+)'/)[1];
  const evaluate = (required, browser, overrides = {}) => spawnSync("jq", [
    "-e", "--argjson", "browsers", JSON.stringify(required), filter,
  ], {input: JSON.stringify({
    classify: {result: "success"}, build: {result: "success"}, contracts: {result: "success"},
    "browser-tests": {result: browser}, ...overrides,
  }), encoding: "utf8"}).status === 0;
  assert.equal(evaluate(true, "success"), true);
  assert.equal(evaluate(false, "skipped"), true);
  for (const result of ["failure", "cancelled", "skipped", undefined]) {
    assert.equal(evaluate(true, result), false, `required browser result: ${result}`);
  }
  for (const result of ["success", "failure", "cancelled", undefined]) {
    assert.equal(evaluate(false, result), false, `unselected browser result: ${result}`);
  }
  for (const job of ["classify", "build", "contracts"]) {
    for (const result of ["failure", "cancelled", "skipped"]) {
      assert.equal(evaluate(true, "success", {[job]: {result}}), false);
    }
  }
});
