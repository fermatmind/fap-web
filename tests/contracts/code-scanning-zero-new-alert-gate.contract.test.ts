import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveApprovedPerformanceTarget } from "../../scripts/performance/public-performance-target-policy.mjs";

const read = (pathname: string) => readFileSync(pathname, "utf8");

describe("code scanning zero-new-alert gate", () => {
  it("accepts only the code-owned public HTTPS performance targets", () => {
    const config = JSON.parse(read("scripts/performance/public-performance-targets.json"));

    for (const target of config.targets) {
      expect(resolveApprovedPerformanceTarget(target)).toBe(target.url);
      expect(new URL(target.url).protocol).toBe("https:");
      expect(["fermatmind.com", "api.fermatmind.com"]).toContain(new URL(target.url).hostname);
    }
  });

  it.each([
    ["unknown target", { id: "unknown", kind: "page", url: "https://fermatmind.com/" }],
    ["HTTP", { id: "home-zh", kind: "page", url: "http://fermatmind.com/" }],
    ["foreign host", { id: "home-zh", kind: "page", url: "https://example.com/" }],
    ["credentials", { id: "home-zh", kind: "page", url: "https://user:pass@fermatmind.com/" }],
    ["port", { id: "home-zh", kind: "page", url: "https://fermatmind.com:8443/" }],
    ["changed path", { id: "home-zh", kind: "page", url: "https://fermatmind.com/result/private" }],
  ])("rejects %s configuration before any network request", (_label, target) => {
    expect(() => resolveApprovedPerformanceTarget(target)).toThrow();
  });

  it("runs zero-warning lint on changed JS/TS files and gates the PR merge ref after CodeQL", () => {
    const ci = read(".github/workflows/ci.yml");
    const codeql = read(".github/workflows/codeql.yml");

    expect(ci).toContain("pnpm lint . --max-warnings=0");
    expect(ci).toContain("eslint --max-warnings=0");
    expect(ci).toContain("git diff --name-only --diff-filter=ACMR -z HEAD^1 HEAD");
    expect(codeql).toContain("needs: analyze");
    expect(codeql).toContain("no-new-code-scanning-alerts");
    expect(codeql).toContain("refs/pull/${context.issue.number}/merge");
    expect(codeql).toContain("listAlertsForRepo");
    expect(codeql).toContain("state: 'open'");
    expect(codeql).toContain("pr: context.issue.number");
  });

  it("does not suppress the outbound file-data CodeQL rule", () => {
    const audit = read("scripts/performance/audit-public-performance.mjs");
    const policy = read("scripts/performance/public-performance-target-policy.mjs");

    expect(audit).toContain("resolveApprovedPerformanceTarget(target)");
    expect(audit).toContain("fetch(requestUrl");
    expect(`${audit}\n${policy}`).not.toMatch(/codeql\[js\/file-access-to-http\]|lgtm\[js\/file-access-to-http\]/);
  });
});
