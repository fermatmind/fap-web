import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("EN-PARITY-W9-W3-ARTICLES-INDEPENDENT-QA-01", () => {
  it("keeps the exact frozen package and records only the Article:53 BLOCKED repair", () => {
    execFileSync("node", ["scripts/seo/build-w3-articles-w9-qa.mjs"], { stdio: "pipe" });
    const result = JSON.parse(execFileSync("node", ["scripts/seo/validate-w3-articles-w9-qa.mjs"], { encoding: "utf8" }));
    expect(result).toMatchObject({ ok: true, rows: 17, pass_rows: 16, blocked_asset: "Article:53" });
  });
});
