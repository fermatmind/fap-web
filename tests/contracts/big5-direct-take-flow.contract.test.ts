import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE_PATH = "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx";

describe("Big Five direct take flow", () => {
  const source = readFileSync(SOURCE_PATH, "utf8");

  it("renders answer options immediately without a disclaimer consent gate", () => {
    expect(source).toContain("<V2LikertScale");
    expect(source).not.toContain("BigFiveDisclaimerGate");
    expect(source).not.toContain("big5-disclaimer-consent");
    expect(source).not.toContain("Agree and start");
    expect(source).not.toContain("同意并开始");
    expect(source).not.toContain("hasAcceptedCurrentDisclaimer");
  });

  it("primes the server attempt on the first answer without fabricating acceptance metadata", () => {
    expect(source).toContain("const requestMeta: Record<string, unknown> = { slug };");
    expect(source).toContain("void ensureAttempt();");
    expect(source).not.toContain("accepted_version");
    expect(source).not.toContain("accepted_hash");
    expect(source).not.toContain("accepted_at");
  });
});
