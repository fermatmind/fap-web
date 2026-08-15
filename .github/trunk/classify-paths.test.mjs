import assert from "node:assert/strict";
import test from "node:test";

import { classifyPaths } from "./classify-paths.mjs";

const has = (paths, flag) => classifyPaths(paths).flags[flag];

test("classifies docs-only without deployment", () => {
  const result = classifyPaths(["AGENTS.md", "docs/ops/trunk.md", "tests/contracts/payment.contract.test.ts"]);
  assert.deepEqual(result.categories, ["docs_rules_tests_only"]);
  assert.equal(result.deploy, false);
  assert.equal(result.tests_changed, true);
});
test("classifies application/UI", () => assert.equal(has(["app/[locale]/page.tsx"], "application_ui"), true));
test("classifies content adapter/contract", () => assert.equal(has(["lib/cms/content-adapter.ts"], "content_adapter_contract"), true));
test("classifies ingress/runtime config", () => assert.equal(has(["deploy/openresty/fap-web-public.conf"], "ingress_runtime_config"), true));
test("classifies deployment infrastructure", () => assert.equal(has([".github/workflows/deploy.yml"], "deployment_infrastructure"), true));

test("mixed scope returns the validation union", () => {
  const result = classifyPaths(["app/[locale]/page.tsx", "deploy/openresty/fap-web-public.conf"]);
  assert.equal(result.mixed, true);
  assert.equal(result.flags.application_ui, true);
  assert.equal(result.flags.ingress_runtime_config, true);
});

test("refuses an indeterminate empty diff", () => assert.throws(() => classifyPaths([]), /must not be empty/));
