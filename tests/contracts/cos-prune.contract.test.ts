import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("cos prune contract", () => {
  it("runs COS prune after static upload in postbuild", () => {
    const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string> };
    const postbuild = packageJson.scripts?.postbuild ?? "";

    expect(postbuild).toContain("scripts/upload-next-static-to-cos.mjs");
    expect(postbuild).toContain("scripts/prune-next-static-in-cos.mjs");
  });

  it("documents prune env controls", () => {
    const envExample = read(".env.example");

    expect(envExample).toContain("COS_PRUNE_ENABLED=false");
    expect(envExample).toContain("COS_PRUNE_MIN_AGE_DAYS=3");
    expect(envExample).toContain("COS_PRUNE_DRY_RUN=false");
  });

  it("protects current build assets and only deletes aged stale objects", () => {
    const source = read("scripts/prune-next-static-in-cos.mjs");

    expect(source).toContain("currentKeys.has(object.Key)");
    expect(source).toContain("lastModifiedMs < pruneCutoffMs");
    expect(source).toContain("deleteMultipleObject");
  });
});
