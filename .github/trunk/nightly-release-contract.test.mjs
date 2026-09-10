import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../workflows/nightly.yml", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("nightly exercises both default and production release browser suites", () => {
  assert.match(workflow, /- run: pnpm test:e2e\n/);
  assert.match(workflow, /- run: pnpm test:e2e:release\n        env:\n          NEXT_PUBLIC_API_URL: http:\/\/127\.0\.0\.1:8000/);
  assert.match(pkg.scripts["test:e2e:release"], /PLAYWRIGHT_SERVER_MODE=production.*--grep @release/);
});
