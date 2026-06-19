import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

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

  it("keeps the Big Five V2 post-deploy PDF smoke redacted and token-focused", () => {
    const smoke = read("scripts/ops/check-big5-v2-live-result-pdf.mjs");

    expect(smoke).toContain("pdftotext");
    expect(smoke).toContain("extractPdfText");
    expect(smoke).toContain('execFileSync("pdftotext", ["-", "-"]');
    expect(smoke).toContain("input: pdfBytes");
    expect(smoke).not.toContain("writeFileSync");
    expect(smoke).not.toContain("mkdtempSync");
    expect(smoke).toContain("auditPdfText");
    expect(smoke).toContain("Big Five Report Engine");
    expect(smoke).toContain("PR3B");
    expect(smoke).toContain("AttemptReadController");
    expect(smoke).toContain("payload");
    expect(smoke).toContain("registry");
    expect(smoke).toContain("attempt_hash");
    expect(smoke).not.toContain("attempt_id=");
    expect(smoke).toContain("[big5-v2-post-deploy] attempt_hash=");
    expect(smoke).not.toContain("[big5-v2-post-deploy] attempt_id=");
    expect(smoke).not.toContain("private_url");
    expect(smoke).not.toContain("privateUrl");
    expect(smoke).not.toContain("raw_payload");
  });

  it("keeps private result route metadata out of public discovery surfaces", () => {
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");

    expect(resultPage).toContain("robots: NOINDEX_ROBOTS");
    expect(NOINDEX_ROBOTS).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
    });
    expect(resultPage).not.toMatch(/\b(?:canonical|alternates|openGraph|twitter|jsonLd|jsonLD|JSONLD|application\/ld\+json|hreflang)\b/);
  });

  it("keeps focused render contracts covering the known PDF leak token families", () => {
    const urlRedactionContract = read("tests/contracts/result-print-url-redaction.contract.test.ts");
    const printChromeContract = read("tests/contracts/result-private-print-chrome.contract.test.ts");
    const big5Contract = read("tests/contracts/big5-section-renderer.contract.test.tsx");
    const riasecContract = read("tests/contracts/riasec-trusted-result-shell.contract.test.tsx");
    const enneagramShell = read("components/result/enneagram/EnneagramResultShell.tsx");

    for (const token of ["access_token", "private-attempt-sample", "PRIVATE_RESULT_PRINT_TITLE", "beforeprint", "afterprint"]) {
      expect(urlRedactionContract).toContain(token);
    }

    for (const token of [
      "dict.header.tests",
      "dict.header.articles",
      "dict.header.personality",
      "dict.header.career",
      "dict.header.help",
      "dict.header.business",
      "footerGroupTitles.tests",
      "footerGroupTitles.articles",
      "footerGroupTitles.company",
      "footerGroupTitles.policies",
      "研究与方法",
    ]) {
      expect(printChromeContract).toContain(token);
    }

    for (const token of [
      "payload",
      "facet glossary",
      "precision anomaly rules",
      "sentence-level modifier",
      "scenario action rule",
      "N-only",
      "production 已接入",
      "production 接入",
    ]) {
      expect(big5Contract).toContain(`not.toContain("${token}")`);
    }

    for (const token of [
      "BUTTON LABEL",
      "BUT TON LABEL",
      "visible",
      "collapsed",
      "score space",
      "raw score",
      "riasec_60_likert5_activity_sum_space",
      "minimal_answer_completion_only",
      "content_example_not_registry_match",
      "content_example_not_registry_match_without_reviewed_registry_source",
      "physical_implementation",
      "tools_and_equipment",
      "field_troubleshooting",
      "prototypes_and_tangible_outputs",
      "hands_on_systems",
      "analyze_complex_problems",
      "organize_evidence_materials",
      "model_systems",
      "test_hypotheses",
      "research_and_explain",
    ]) {
      expect(riasecContract).toContain(`not.toContain(token)`);
      expect(riasecContract).toContain(token);
    }

    expect(enneagramShell).toContain("/\\[object Object\\]/i");
    expect(enneagramShell).toContain("/analyzer_close_call/i");
  });
});
