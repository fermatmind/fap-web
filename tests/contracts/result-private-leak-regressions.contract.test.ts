import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("private result leak regression contracts", () => {
  it("keeps private result PDF entry points safety-disabled until a safe export path exists", () => {
    const pdfButton = read("components/big5/pdf/PdfDownloadButton.tsx");
    const big5Shell = read("components/result/big5/Big5ResultShell.tsx");
    const enneagramShell = read("components/result/enneagram/EnneagramResultShell.tsx");

    expect(pdfButton).toContain("safetyDisabled?: boolean");
    expect(pdfButton).toContain("if (safetyDisabled) return");
    expect(pdfButton).toContain("disabled={Boolean(safetyDisabled) || pdfLocked || loading}");
    expect(pdfButton).not.toMatch(/\b(?:access_token|result_lookup_token|privateUrl|private_url)\b/);

    for (const shell of [big5Shell, enneagramShell]) {
      expect(shell).toContain("safetyDisabled");
      expect(shell).toContain("private result links out of file footers");
    }
  });

  it("keeps internal debug payload keys and engine markers out of public result renderers", () => {
    const riasecShell = read("components/result/riasec/RiasecResultShell.tsx");
    const big5BlockRenderer = read("components/big5/report/BlockRenderer.tsx");
    const big5SectionRenderer = read("components/big5/report/SectionRenderer.tsx");

    expect(riasecShell).not.toMatch(/data-riasec-(?:score-space|scoring-policy|policy|snapshot|raw-score)/);

    for (const source of [big5BlockRenderer, big5SectionRenderer]) {
      expect(source).toContain("INTERNAL_DEBUG_PATTERNS");
      expect(source).toContain("AttemptReadController");
      expect(source).toContain("Big Five Report Engine");
      expect(source).toContain("PR(?:1|2|3A|3B)");
      expect(source).toContain("stripInternalDebugText");
    }
  });

  it("keeps Enneagram public text rendering scalar-only and object-safe", () => {
    const enneagramShell = read("components/result/enneagram/EnneagramResultShell.tsx");

    expect(enneagramShell).toContain("/\\[object Object\\]/i");
    expect(enneagramShell).toContain("/analyzer_close_call/i");
    expect(enneagramShell).toContain("function safePublicText(value: unknown): string");
    expect(enneagramShell).toContain('typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean"');
    expect(enneagramShell).toContain("function firstSafePublicText(...values: unknown[]): string");
  });

  it("keeps print chrome suppression scoped to private result pages only", () => {
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const siteHeader = read("components/layout/SiteHeader.tsx");
    const siteFooter = read("components/layout/SiteFooter.tsx");
    const globals = read("app/globals.css");

    expect(resultPage).toContain('data-private-result-print-root="true"');
    expect(siteHeader).toContain('data-private-result-print-hidden="true"');
    expect(siteFooter).toContain('data-private-result-print-hidden="true"');
    expect(globals).toContain('body:has([data-private-result-print-root="true"]) [data-private-result-print-hidden="true"]');
    expect(globals).toContain('body:has([data-private-result-print-root="true"]) :is(');
    expect(globals).toContain(".fm-site-footer-light");
    expect(globals).toContain(".fm-social-rail");
    expect(globals).toContain("display: none !important");
    expect(globals).not.toMatch(/@media print\s*\{[\s\S]*?(?:header|footer)\s*\{\s*display:\s*none\s*!important/);
  });

  it("keeps private result print URL redaction wired without exposing attempt ids", () => {
    const resultClient = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    const redaction = read("lib/result/privatePrintUrlRedaction.ts");

    expect(resultClient).toContain("installPrivateResultPrintUrlRedaction(locale)");
    expect(redaction).toContain("beforeprint");
    expect(redaction).toContain("afterprint");
    expect(redaction).toContain("window.history.replaceState(window.history.state, \"\", redactedPath)");
    expect(redaction).toContain("PRIVATE_RESULT_PRINT_TITLE");
    expect(redaction).not.toMatch(/attemptId|access_token|result_access_token|privateUrl|private_url/);
  });
});
