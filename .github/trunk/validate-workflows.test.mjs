import assert from "node:assert/strict";
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
