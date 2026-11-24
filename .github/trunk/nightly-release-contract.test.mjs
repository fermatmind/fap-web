import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../workflows/nightly.yml", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

function job(name) {
  const source = workflow.match(new RegExp(`^  ${name}:\\n(?:^ {4}.*\\n|^\\n)*`, "m"))?.[0];
  assert.ok(source, `missing Nightly job: ${name}`);
  return source;
}

function stepWithCommand(source, command) {
  const steps = source.split(/^      - /m).slice(1);
  const index = steps.findIndex((step) => step.split("\n").some((line) => line.trim() === `run: ${command}`));
  assert.notEqual(index, -1, `missing Nightly step: ${command}`);
  return { index, source: steps[index] };
}

test("full Nightly checks keep their schedule and install from the frozen lockfile", () => {
  assert.match(workflow, /^on:\n  push:\n    branches: \[main\]\n  schedule:\n    - cron: "31 18 \* \* \*"$/m);
  for (const source of [job("full-regression"), job("browser-regression")]) {
    assert.match(source, /^    if: github.event_name == 'schedule'\n    runs-on: ubuntu-24\.04$/m);
    assert.match(source, /^          node-version: 24$/m);
    stepWithCommand(source, "corepack enable && pnpm install --frozen-lockfile");
  }
});

test("Nightly runs both complete browser modes in isolated shards only after Chromium installs", () => {
  const source = job("browser-regression");
  const deps = stepWithCommand(source, "corepack enable && pnpm install --frozen-lockfile");
  const chromium = stepWithCommand(source, "pnpm exec playwright install chromium");
  assert.match(chromium.source, /^name: Install Chromium for Nightly E2E\n        id: chromium\n/);
  assert.doesNotMatch(chromium.source, /continue-on-error/);
  assert.ok(deps.index < chromium.index);
  assert.match(source, /^      fail-fast: false\n      matrix:\n        mode: \[default, release\]$/m);
  const shards = JSON.parse(source.match(/^        shard: (\[.*\])$/m)[1]);
  const shardCount = Number(source.match(/^      PLAYWRIGHT_SHARD: \$\{\{ matrix\.shard \}\}\/(\d+)$/m)[1]);
  assert.ok(shardCount > 1);
  assert.deepEqual(shards, Array.from({ length: shardCount }, (_, index) => index + 1));
  for (const [mode, command] of [["default", "pnpm test:e2e"], ["release", "pnpm test:e2e:release"]]) {
    const browser = stepWithCommand(source, `${command} --shard="$PLAYWRIGHT_SHARD" --fully-parallel --workers=1`);
    assert.ok(chromium.index < browser.index);
    assert.ok(browser.source.startsWith(`if: \${{ !cancelled() && steps.chromium.outcome == 'success' && matrix.mode == '${mode}' }}\n`));
    assert.match(browser.source, /^        timeout-minutes: 80$/m);
  }
  assert.match(source, /NEXT_PUBLIC_API_URL: http:\/\/127\.0\.0\.1:8000/);
  assert.match(source, /name: nightly-browser-\$\{\{ matrix\.mode \}\}-\$\{\{ matrix\.shard \}\}-\$\{\{ github\.sha \}\}/);
  assert.match(source, /^            test-results\/\n            playwright-report\/$/m);
  assert.match(source, /- if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@/);
  assert.match(pkg.scripts["test:e2e:release"], /PLAYWRIGHT_SERVER_MODE=production.*--grep @release/);
});

test("Nightly runs full non-browser checks with the history the contracts require", () => {
  const source = job("full-regression");
  assert.match(source, /actions\/checkout@[^\n]+\n        with:\n(?:          #[^\n]+\n)?          fetch-depth: 0/);
  for (const command of ["pnpm audit --prod --audit-level high", "node --test .github/trunk/*.test.mjs"]) {
    assert.match(stepWithCommand(source, command).source, /^if: \$\{\{ !cancelled\(\) && steps\.dependencies\.outcome == 'success' \}\}/);
  }
  for (const command of ["pnpm test:a11y", "pnpm verify:pr", "pnpm perf:audit:public"]) {
    assert.match(stepWithCommand(source, command).source, /^if: \$\{\{ !cancelled\(\) \}\}/);
  }
  assert.match(pkg.scripts["test:a11y"], /vitest run tests\/a11y/);
  assert.match(pkg.scripts["verify:pr"], /^pnpm lint \. && /);
  assert.match(source, /- if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@/);
  assert.match(source, /^            generated\/performance\/$/m);
});
