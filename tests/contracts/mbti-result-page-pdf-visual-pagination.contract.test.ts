import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isMbtiResultPagePdfVisualPaginationAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI result-page PDF visual pagination contract", () => {
  it("marks only the private print route with the dense A4 visual contract", () => {
    const printRoute = read("app/(localized)/[locale]/(app)/result/[id]/print/page.tsx");
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");

    expect(printRoute).toContain('data-private-result-print-root="true"');
    expect(printRoute).toContain('data-gotenberg-result-print-root="true"');
    expect(printRoute).toContain('data-pdf-mode="true"');
    expect(printRoute).toContain('data-pdf-layout="a4-report-dense"');
    expect(printRoute).toContain('data-pdf-visual-version="mbti-result-snapshot-a4-v1"');
    expect(resultPage).not.toContain("a4-report-dense");
    expect(resultPage).not.toContain("mbti-result-snapshot-a4-v1");
  });

  it("scopes A4 print page setup to the PDF snapshot root", () => {
    const globals = read("app/globals.css");

    expect(globals).toContain("@media print");
    expect(globals).toContain("@page fermat-result-snapshot");
    expect(globals).toContain("size: A4;");
    expect(globals).toContain("margin: 12mm 10mm 14mm;");
    expect(globals).toContain('[data-pdf-mode="true"][data-pdf-layout="a4-report-dense"]');
    expect(globals).toContain("page: fermat-result-snapshot;");
    expect(globals).toContain("width: 190mm;");
    expect(globals).toContain("print-color-adjust: exact;");
    expect(globals).toContain("-webkit-print-color-adjust: exact;");
    expect(globals).not.toMatch(/@media print\s*\{[\s\S]*?\bbody\s*\{\s*background:\s*#ffffff/i);
  });

  it("adds print-only dense report layout and break guards to the MBTI clone shell", () => {
    const css = read("components/result/mbti/clone/mbtiDesktopClone.module.css");
    const printCss = css.slice(css.indexOf("@media print"));

    expect(printCss).toContain(".cloneRoot");
    expect(printCss).toContain("--clone-shell-max: 190mm;");
    expect(printCss).toContain("--clone-main-col: 190mm;");
    expect(printCss).toContain("--clone-section-gap: 6.5mm;");
    expect(printCss).toContain("--clone-card-padding: 4mm;");
    expect(printCss).toContain(".shell");
    expect(printCss).toContain(".hero");
    expect(printCss).toContain("min-height: 42mm;");
    expect(printCss).toContain("clip-path: none;");
    expect(printCss).toContain("box-shadow: none;");
    expect(printCss).toContain(".pageGrid");
    expect(printCss).toContain("display: block;");
    expect(printCss).toContain(".sectionHeading");
    expect(printCss).toContain("break-after: avoid-page;");
    expect(printCss).toContain("page-break-after: avoid;");
    expect(printCss).toContain(".illustrationSlot[data-pdf-decorative-media=\"true\"]");
    expect(printCss).toContain("height: 6mm;");
    expect(printCss).toContain(".influentialCard,\n  .traitsUnlockPanel");
    expect(printCss).toContain("break-inside: auto;");
    expect(printCss).toContain("page-break-inside: auto;");
    expect(printCss).toContain("break-inside: avoid-page;");
    expect(printCss).toContain("page-break-inside: avoid;");
    expect(printCss).toContain(".traitsOverviewRow");
    expect(printCss).toContain(".twoColumnGrid");
    expect(printCss).toContain(".listItem");
  });

  it("keeps visual pagination scoped away from runtime pollutant cleanup and backend changes", () => {
    const allowedFiles = [
      "app/globals.css",
      "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx",
      "components/result/mbti/clone/MbtiCloneAssetSlot.tsx",
      "components/result/mbti/clone/MbtiCloneNarrativeSection.tsx",
      "components/result/mbti/clone/mbtiDesktopClone.module.css",
      "tests/contracts/mbti-pdf-snapshot-print-layout-polish.contract.test.ts",
      "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
      "tests/contracts/mbti-result-page-pdf-visual-pagination.contract.test.ts",
      "tests/contracts/result-private-print-chrome.contract.test.ts",
      "tests/contracts/mbti-desktop-shell-cta.contract.test.tsx",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of allowedFiles) {
      expect(isMbtiResultPagePdfVisualPaginationAllowedFile(file), file).toBe(true);
    }

    for (const file of [
      "scripts/ops/check-mbti-result-page-pdf-smoke.mjs",
      "public/sitemap.xml",
      "components/result/mbti/clone/MbtiDesktopCloneShell.tsx",
      "components/layout/SiteHeader.tsx",
    ]) {
      expect(isMbtiResultPagePdfVisualPaginationAllowedFile(file), file).toBe(false);
    }
  });
});
