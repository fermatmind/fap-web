import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CodeQL generated artifact scan boundary", () => {
  it("loads the repository CodeQL config from the advanced setup workflow", () => {
    const workflow = readFileSync(".github/workflows/codeql.yml", "utf8");

    expect(workflow).toContain("uses: github/codeql-action/init@v4");
    expect(workflow).toContain("config-file: ./.github/codeql/codeql-config.yml");
  });

  it("keeps generated audit artifacts out of CodeQL source scanning", () => {
    const config = readFileSync(".github/codeql/codeql-config.yml", "utf8");

    expect(config).toContain("paths-ignore:");
    expect(config).toContain("generated/**");
    expect(config).toContain("docs/seo/generated/**");
  });
});
