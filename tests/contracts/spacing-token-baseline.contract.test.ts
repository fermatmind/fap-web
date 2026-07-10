import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts/check-spacing-tokens.mjs");
const BASELINE_RELATIVE_PATH = "scripts/spacing-token-baseline.v1.json";
const temporaryRoots: string[] = [];

function runGuard(cwd: string, args: string[] = []) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function createFixtureRoot(source: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "spacing-token-baseline-"));
  temporaryRoots.push(root);
  fs.mkdirSync(path.join(root, "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "components"), { recursive: true });
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(root, "app/example.tsx"), source);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("spacing token debt baseline", () => {
  it("matches the checked-in repository debt exactly", () => {
    const result = runGuard(ROOT);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/Spacing token guard passed \(\d+ known occurrence\(s\), \d+ locked signature\(s\)\)\./);

    const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, BASELINE_RELATIVE_PATH), "utf8"));
    expect(baseline.schema_version).toBe("spacing-token-baseline.v1");
    expect(baseline.violations.length).toBeGreaterThan(0);
    const signatures = baseline.violations.map(
      (item: { rule: string; file: string; snippet: string }) => `${item.rule}\u0000${item.file}\u0000${item.snippet}`
    );
    expect(signatures).toEqual([...signatures].sort((a, b) => a.localeCompare(b)));
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("fails on new or increased debt and on a stale over-permissive baseline", () => {
    const root = createFixtureRoot('export const Example = () => <div className="gap-1.5 p-[7px]" />;\n');
    const printed = runGuard(root, ["--print-baseline"]);
    expect(printed.status, printed.stderr).toBe(0);
    fs.writeFileSync(path.join(root, BASELINE_RELATIVE_PATH), printed.stdout);

    const exact = runGuard(root);
    expect(exact.status, exact.stderr).toBe(0);

    fs.writeFileSync(
      path.join(root, "app/example.tsx"),
      'export const Example = () => <div className="gap-1.5 p-[7px] mt-9" />;\n'
    );
    const increased = runGuard(root);
    expect(increased.status).toBe(1);
    expect(increased.stderr).toContain("[new-or-increased:disallowed-spacing-key]");
    expect(increased.stderr).toContain("mt-9");

    fs.writeFileSync(path.join(root, "app/example.tsx"), 'export const Example = () => <div className="gap-1.5" />;\n');
    const stale = runGuard(root);
    expect(stale.status).toBe(1);
    expect(stale.stderr).toContain("[stale-baseline:no-arbitrary-px-utility]");
    expect(stale.stderr).toContain("p-[7px]");
  });
});
