import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const SIDECAR_BRANCH = "codex/mbti-contract-sidecar-fixes-1388-1292";
const SIDECAR_SCOPE_BRANCHES = new Set([SIDECAR_BRANCH, "codex/mbti-contract-sidecar-main-revalidate-fix"]);

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function currentBranch(): string {
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

describe("release freeze harness", () => {
  it("exposes package aliases matching the GitHub contract-freeze job names", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["verify-big5-contract-freeze"]).toBe(
      "pnpm exec vitest run tests/contracts/big5.contract.test.ts tests/contracts/big5-result-assembler.contract.test.ts tests/contracts/big5-secondary-surfaces.contract.test.tsx"
    );
    expect(packageJson.scripts?.["verify-enneagram-contract-freeze"]).toBe(
      "pnpm exec vitest run tests/contracts/enneagram-api.contract.test.ts tests/contracts/enneagram-take-flow.contract.test.tsx tests/contracts/enneagram-result-assembler.contract.test.ts tests/contracts/enneagram-rich-result-report.contract.test.tsx tests/contracts/enneagram-secondary-surfaces.contract.test.tsx"
    );
  });

  it("keeps Playwright release-freeze smoke checks explicitly opt-in", () => {
    const script = read("scripts/release_freeze_verify.sh");

    expect(script).toContain('${RELEASE_FREEZE_E2E:-0}');
    expect(script).toContain("set RELEASE_FREEZE_E2E=1 to run Playwright smoke freeze checks");
    expect(script.indexOf("RELEASE_FREEZE_E2E")).toBeLessThan(script.indexOf("pnpm exec playwright test"));
  });

  it("limits this sidecar harness PR to package, release-freeze script, scope helper, and its contract", () => {
    if (!SIDECAR_SCOPE_BRANCHES.has(currentBranch())) {
      expect(SIDECAR_SCOPE_BRANCHES.has(currentBranch())).toBe(false);
      return;
    }

    const allowed = [
      "package.json",
      "scripts/release_freeze_verify.sh",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/release-freeze-harness.contract.test.ts",
    ];

    for (const file of allowed) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }

    expect(isCurrentRiasecPack12AllowedFile("app/(localized)/[locale]/personality/[type]/page.tsx")).toBe(false);
  });
});
