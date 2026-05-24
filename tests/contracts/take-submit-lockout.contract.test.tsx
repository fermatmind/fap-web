import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const TAKE_CLIENTS = {
  big5: "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
  clinical: "app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx",
  quiz: "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
} as const;

function readClient(key: keyof typeof TAKE_CLIENTS): string {
  return readFileSync(TAKE_CLIENTS[key], "utf8");
}

function expectValidationReturnResetsSubmitGuard(source: string, validationMarker: string): void {
  const start = source.indexOf(validationMarker);
  expect(start, `Missing validation marker: ${validationMarker}`).toBeGreaterThanOrEqual(0);

  const snippet = source.slice(start, start + 900);
  expect(snippet).toContain("submitInFlightRef.current = false;");
  expect(snippet).toContain("return null;");
  expect(snippet.indexOf("submitInFlightRef.current = false;")).toBeLessThan(snippet.indexOf("return null;"));
}

describe("take submit lockout contract", () => {
  it("keeps duplicate-submit protection active before validation exits", () => {
    for (const source of Object.values(TAKE_CLIENTS).map((file) => readFileSync(file, "utf8"))) {
      expect(source).toContain("submitInFlightRef.current = true;");
    }
  });

  it("resets Big Five submit guard on cooldown and missing-answer validation exits", () => {
    const source = readClient("big5");

    expectValidationReturnResetsSubmitGuard(source, "if (inCooldown) {\n      if (isFlowActive(activeRunId))");
    expectValidationReturnResetsSubmitGuard(source, "if (firstMissingIndex >= 0) {");
  });

  it("resets Clinical submit guard on missing-answer validation exits", () => {
    expectValidationReturnResetsSubmitGuard(readClient("clinical"), "if (firstMissing >= 0) {");
  });

  it("resets shared Quiz submit guard on missing-answer validation exits", () => {
    expectValidationReturnResetsSubmitGuard(readClient("quiz"), "if (firstMissingIndex >= 0) {");
  });
});
