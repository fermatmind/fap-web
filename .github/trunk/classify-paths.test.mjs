import assert from "node:assert/strict";
import test from "node:test";

import { classifyPaths } from "./classify-paths.mjs";

const has = (paths, flag) => classifyPaths(paths).flags[flag];

test("classifies docs-only without deployment", () => {
  const result = classifyPaths([
    "AGENTS.md",
    "docs/ops/trunk.md",
    ".agents/skills/fap-web-career-public-projection-renderer/SKILL.md",
    ".agents/skills/fap-web-career-public-projection-renderer/references/renderer-contract.md",
    ".github/trunk/classify-paths.mjs",
    ".github/trunk/classify-paths.test.mjs",
    "tests/contracts/career-public-projection-renderer-skill.contract.test.ts",
  ]);
  assert.deepEqual(result.categories, ["docs_rules_tests_only"]);
  assert.equal(result.deploy, false);
  assert.equal(result.tests_changed, true);
});
test("classifies application/UI", () => assert.equal(has(["app/[locale]/page.tsx"], "application_ui"), true));
test("does not mistake an application tests route for tests-only scope", () => {
  const result = classifyPaths(["app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx"]);
  assert.deepEqual(result.categories, ["application_ui"]);
  assert.equal(result.deploy, true);
  assert.equal(result.tests_changed, false);
});
test("classifies content adapter/contract", () => assert.equal(has(["lib/cms/content-adapter.ts"], "content_adapter_contract"), true));
test("classifies career display adapter as both UI and content contract", () => {
  const result = classifyPaths(["lib/career/displaySurface.ts"]);
  assert.equal(result.flags.application_ui, true);
  assert.equal(result.flags.content_adapter_contract, true);
});
test("classifies ingress/runtime config", () => assert.equal(has(["deploy/openresty/fap-web-public.conf"], "ingress_runtime_config"), true));
test("classifies content-release runtime control as deployment infrastructure", () => {
  const result = classifyPaths(["scripts/content_release_revalidation_runtime_config.sh"]);
  assert.equal(result.flags.ingress_runtime_config, false);
  assert.equal(result.flags.deployment_infrastructure, true);
});
test("classifies deployment infrastructure", () => assert.equal(has([".github/workflows/deploy.yml"], "deployment_infrastructure"), true));

test("mixed scope returns the validation union", () => {
  const result = classifyPaths(["app/[locale]/page.tsx", "deploy/openresty/fap-web-public.conf"]);
  assert.equal(result.mixed, true);
  assert.equal(result.flags.application_ui, true);
  assert.equal(result.flags.ingress_runtime_config, true);
});

test("refuses an indeterminate empty diff", () => assert.throws(() => classifyPaths([]), /must not be empty/));
