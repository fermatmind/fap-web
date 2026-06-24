import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

function read(path: string): string {
  return readFileSync(path, "utf8");
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
