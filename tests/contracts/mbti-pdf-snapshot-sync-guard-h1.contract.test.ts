import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const HASH_SCRIPT = "scripts/ops/check-mbti-pdf-print-asset-hash.mjs";

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI PDF snapshot sync guard H1", () => {
  it("keeps a deterministic print asset hash for MBTI result snapshot inputs", () => {
    const output = execFileSync("node", [HASH_SCRIPT, "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const payload = JSON.parse(output) as {
      ok: boolean;
      expected_hash: string;
      actual_hash: string;
      file_count: number;
      inputs: string[];
    };

    expect(payload.ok).toBe(true);
    expect(payload.expected_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(payload.actual_hash).toBe(payload.expected_hash);
    expect(payload.file_count).toBeGreaterThan(20);
    expect(payload.inputs).toEqual(
      expect.arrayContaining([
        "app/(localized)/[locale]/(app)/result/[id]",
        "app/globals.css",
        "components/result/RichResultReport.tsx",
        "components/result/mbti",
        "lib/result/pdfSurface.ts",
        "proxy.ts",
      ])
    );
  });

  it("documents the print-impact path set and fails closed when the hash drifts", () => {
    const source = read(HASH_SCRIPT);

    expect(source).toContain('const EXPECTED_PRINT_ASSET_HASH = "sha256:');
    expect(source).toContain('"components/result/mbti"');
    expect(source).toContain('"components/result/RichResultReport.tsx"');
    expect(source).toContain('"app/(localized)/[locale]/(app)/result/[id]"');
    expect(source).toContain('"app/globals.css"');
    expect(source).toContain('"lib/result/pdfSurface.ts"');
    expect(source).toContain('"proxy.ts"');
    expect(source).toContain('args.has("--check")');
    expect(source).toContain("process.exit(1)");
  });
});
