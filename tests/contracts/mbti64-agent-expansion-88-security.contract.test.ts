import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/generate-mbti64-agent-expansion-88.mjs";

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI64 agent expansion 88 security contract", () => {
  it("fetches live surfaces from the canonical site origin plus node.path", () => {
    const source = readSource(SCRIPT_PATH);

    expect(source).toContain("const targetUrl = fullUrl(node.path);");
    expect(source).toContain("const response = await fetch(targetUrl, {");
    expect(source).not.toContain("fetch(node.url");
  });

  it("keeps this CodeQL hygiene repair within the registered scope guard files", () => {
    const allowedFiles = [SCRIPT_PATH, "tests/contracts/helpers/currentPrScope.ts", "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts"];

    for (const file of allowedFiles) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
