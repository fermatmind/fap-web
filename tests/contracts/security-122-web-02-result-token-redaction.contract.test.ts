import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSecurity122Web02AllowedFile } from "@/tests/contracts/helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("SECURITY-122-WEB-02 result token and private-link redaction", () => {
  it("keeps the scoped branch limited to result/report/PDF token redaction files", () => {
    for (const file of [
      "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
      "app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap.ts",
      "components/support/ResultEmailLookupForm.tsx",
      "lib/access/reportActionUrls.ts",
      "lib/api/v0_3.ts",
      "lib/commerce/redirectUrls.ts",
      "lib/result/pdfExportToken.ts",
      "lib/result/resultAccessTokenHandoff.ts",
      "tests/contracts/security-122-web-02-result-token-redaction.contract.test.ts",
    ]) {
      expect(isSecurity122Web02AllowedFile(file), file).toBe(true);
    }
  });

  it("keeps result lookup tokens out of frontend hrefs and API URL query strings", () => {
    const emailLookup = read("components/support/ResultEmailLookupForm.tsx");
    const api = read("lib/api/v0_3.ts");

    expect(emailLookup).toContain("stashResultAccessTokenForAttempt");
    expect(emailLookup).not.toContain("?access_token=${encodeURIComponent(resultAccessToken)}");
    expect(emailLookup).not.toContain("appendResultAccessToken");
    expect(api).toContain('"X-Result-Access-Token"');
    expect(api).not.toContain('params.set("access_token", normalizedAccessToken)');
  });

  it("keeps print bootstrap header-only and disables production PDF token fallback", () => {
    const printBootstrap = read("app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap.ts");
    const pdfExportToken = read("lib/result/pdfExportToken.ts");

    expect(printBootstrap).toContain('"X-Result-Access-Token": accessToken');
    expect(printBootstrap).not.toContain("access_token: accessToken");
    expect(pdfExportToken).toContain('process.env.NODE_ENV === "production" ? "" : "fap-result-page-pdf-local-key"');
    expect(pdfExportToken).toContain("if (!secret)");
  });
});
