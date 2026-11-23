import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../workflows/nightly.yml", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const regression = workflow.match(/^  full-regression:\n(?:^ {4}.*\n|^\n)*/m)?.[0] ?? "";
const steps = regression.split(/^      - /m).slice(1);

function stepWithCommand(command) {
  const index = steps.findIndex((step) => step.split("\n").some((line) => line.trim() === `run: ${command}`));
  assert.notEqual(index, -1, `missing full-regression step: ${command}`);
  return { index, source: steps[index] };
}

test("nightly full regression runs on the existing schedule with the CI Chromium setup", () => {
  assert.match(workflow, /^on:\n  push:\n    branches: \[main\]\n  schedule:\n    - cron: "31 18 \* \* \*"$/m);
  assert.match(regression, /^    if: github.event_name == 'schedule'\n    runs-on: ubuntu-24\.04$/m);
  assert.match(regression, /^          node-version: 24$/m);

  const dependencies = stepWithCommand("corepack enable && pnpm install --frozen-lockfile");
  const chromium = stepWithCommand("pnpm exec playwright install chromium");
  assert.match(dependencies.source, /^id: dependencies\n/);
  assert.match(chromium.source, /^id: chromium\n/);
  assert.doesNotMatch(chromium.source, /continue-on-error/);
  assert.ok(dependencies.index < chromium.index);
});

test("nightly runs both browser suites only after Chromium installs successfully", () => {
  const chromium = stepWithCommand("pnpm exec playwright install chromium");
  for (const command of ["pnpm test:e2e", "pnpm test:e2e:release"]) {
    const browser = stepWithCommand(command);
    assert.ok(chromium.index < browser.index);
    assert.match(browser.source, /^if: \$\{\{ !cancelled\(\) && steps\.chromium\.outcome == 'success' \}\}/);
  }
  assert.match(stepWithCommand("pnpm test:e2e:release").source, /env:\n          NEXT_PUBLIC_API_URL: http:\/\/127\.0\.0\.1:8000/);
  assert.match(pkg.scripts["test:e2e:release"], /PLAYWRIGHT_SERVER_MODE=production.*--grep @release/);
});

test("nightly keeps non-browser checks and diagnostics available after Chromium failure", () => {
  for (const command of ["pnpm audit --prod --audit-level high", "node --test .github/trunk/*.test.mjs"]) {
    assert.match(stepWithCommand(command).source, /^if: \$\{\{ !cancelled\(\) && steps\.dependencies\.outcome == 'success' \}\}/);
  }
  for (const command of ["pnpm test:a11y", "pnpm verify:pr", "pnpm perf:audit:public"]) {
    assert.match(stepWithCommand(command).source, /^if: \$\{\{ !cancelled\(\) \}\}/);
  }
  assert.match(pkg.scripts["test:a11y"], /vitest run tests\/a11y/);
  assert.match(pkg.scripts["verify:pr"], /^pnpm lint \. && /);
  assert.match(regression, /- if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@/);
});
