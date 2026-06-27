import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Gotenberg result print route contract", () => {
  it("adds a private noindex result print route without changing the report PDF API route", () => {
    const printRoutePath = "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx";
    const printRoute = read(printRoutePath);
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const accessNormalizer = read("lib/access/unifiedAccess.ts");

    expect(existsSync(path.join(ROOT, printRoutePath))).toBe(true);
    expect(printRoute).toContain("robots: NOINDEX_ROBOTS");
    expect(printRoute).toContain('export const dynamic = "force-dynamic"');
    expect(printRoute).toContain("export const revalidate = 0");
    expect(printRoute).toContain('data-private-result-print-root="true"');
    expect(printRoute).toContain('data-gotenberg-result-print-root="true"');
    expect(printRoute).toContain("<ResultClient key={id} attemptId={id} rolloutEnv={rolloutEnv} printMode />");
    expect(printRoute).toContain('className="w-full bg-white');
    expect(resultPage).toContain('data-private-result-print-root="true"');
    expect(accessNormalizer).toContain('normalizeReportActionHref(raw.actions?.pdf_href, locale, "pdf")');
  });

  it("keeps print mode on the shared result renderer and removes interactive recovery chrome", () => {
    const resultClient = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");

    expect(resultClient).toContain("printMode = false");
    expect(resultClient).toContain("printMode?: boolean");
    expect(resultClient).toContain("if (printMode) {");
    expect(resultClient).toContain("renderOptionalEmailRecoveryCard");
    expect(resultClient).toContain("printMode ? null : renderEmailRecoveryCard()");
    expect(resultClient).toContain("installPrivateResultPrintUrlRedaction(locale)");
  });

  it("keeps the MBTI result modules available to the print route through the shared renderer", () => {
    const richReport = read("components/result/RichResultReport.tsx");
    const mbtiRail = read("components/result/mbti/MbtiStickyRail.tsx");
    const mbtiChapter = read("components/result/mbti/MbtiChapterSection.tsx");

    expect(richReport).toContain("<MbtiResultShell");
    expect(mbtiRail).toContain("1 Personality Traits");
    expect(mbtiRail).toContain("2 Your Career Path");
    expect(mbtiRail).toContain("3 Your Personal Growth");
    expect(mbtiRail).toContain("4 Your Relationships");
    expect(mbtiChapter).toContain('anchor: "traits"');
    expect(mbtiChapter).toContain('anchor: "career"');
    expect(mbtiChapter).toContain('anchor: "growth"');
    expect(mbtiChapter).toContain('anchor: "relationships"');
  });
});
