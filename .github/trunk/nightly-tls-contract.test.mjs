import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../workflows/nightly.yml", import.meta.url),
  "utf8",
);

test("nightly checks all public TLS certificates at documented thresholds", () => {
  assert.match(workflow, /^  certificate-expiry:\n/m);
  assert.match(workflow, /timeout-minutes: 3/);
  assert.match(
    workflow,
    /--hosts fermatmind\.com,api\.fermatmind\.com,staging\.fermatmind\.com,staging-api\.fermatmind\.com/,
  );
  assert.match(workflow, /--alert-days 21,14,7/);
  assert.match(
    workflow,
    /needs: \[full-regression, codeql, certificate-expiry\]/,
  );
});
