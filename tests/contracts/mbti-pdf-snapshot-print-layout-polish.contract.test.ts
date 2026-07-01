import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isMbtiResultPagePdfVisualPaginationAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI PDF snapshot print layout polish contract", () => {
  it("keeps the print route on the real result snapshot tree instead of the summary shell", () => {
    const printRoute = read("app/(localized)/[locale]/(app)/result/[id]/print/page.tsx");
    const shell = read("components/result/mbti/clone/MbtiDesktopCloneShell.tsx");

    expect(printRoute).toContain('data-private-result-print-root="true"');
    expect(printRoute).toContain('data-gotenberg-result-print-root="true"');
    expect(printRoute).toContain('data-pdf-mode="true"');
    expect(printRoute).toContain("<ResultClient");
    expect(shell).toContain('data-testid="mbti-desktop-clone-shell"');
    expect(shell).toContain('data-pdf-content-ready={snapshotMode ? (snapshotContentReady ? "true" : "false") : undefined}');

    expect(printRoute).not.toContain("MbtiResultPdfShell");
    expect(shell).not.toContain("FERMATMIND MBTI RESULT");
    expect(shell).not.toContain("PDF 保留当前结果页的核心阅读内容");
    expect(shell).not.toContain('data-testid="mbti-result-pdf-shell"');
  });

  it("marks narrative section media as decorative for print without hiding real content sections", () => {
    const assetSlot = read("components/result/mbti/clone/MbtiCloneAssetSlot.tsx");
    const narrativeSection = read("components/result/mbti/clone/MbtiCloneNarrativeSection.tsx");

    expect(assetSlot).toContain("printDecorative?: boolean");
    expect(assetSlot).toContain('data-pdf-decorative-media={printDecorative ? "true" : undefined}');
    expect(assetSlot).toContain('data-pdf-section-visual={printDecorative ? "true" : undefined}');
    expect(narrativeSection).toContain("printDecorative");
    expect(narrativeSection).toContain('data-pdf-section={pdfSection}');
    expect(narrativeSection).toContain('"career-path"');
    expect(narrativeSection).toContain('"personal-growth"');
    expect(narrativeSection).toContain('"relationships"');
    expect(narrativeSection).toContain("<MbtiCloneInfluentialTraitsCard");
    expect(narrativeSection).toContain("<MbtiCloneStrengthWeaknessBlock");
  });

  it("compresses decorative section visuals and relaxes only large card page-break rules", () => {
    const css = read("components/result/mbti/clone/mbtiDesktopClone.module.css");
    const printCss = css.slice(css.indexOf("@media print"));

    expect(printCss).toContain("--clone-section-gap: 6.5mm;");
    expect(printCss).toContain("--clone-card-padding: 4mm;");
    expect(printCss).toContain("min-height: 42mm;");
    expect(printCss).toContain("width: 34mm;");
    expect(printCss).toContain("height: 24mm;");

    expect(printCss).toContain('.illustrationSlot[data-pdf-decorative-media="true"]');
    expect(printCss).toContain("height: 6mm;");
    expect(printCss).toContain("linear-gradient(90deg");
    expect(printCss).toContain('.illustrationSlot[data-pdf-decorative-media="true"] .assetSlotImage');
    expect(printCss).toContain("display: none;");

    expect(printCss).toMatch(/\.influentialCard,\s*\.traitsUnlockPanel\s*\{[\s\S]*?break-inside:\s*auto;/);
    expect(printCss).toMatch(/\.influentialCard,\s*\.traitsUnlockPanel\s*\{[\s\S]*?page-break-inside:\s*auto;/);
    expect(printCss).toMatch(/\.traitsUnlockItem,[\s\S]*?\.listItem,[\s\S]*?\{[\s\S]*?break-inside:\s*avoid-page;/);
    expect(printCss).toMatch(/\.traitsUnlockItem,[\s\S]*?\.listItem,[\s\S]*?\{[\s\S]*?page-break-inside:\s*avoid;/);
  });

  it("keeps PR-G scope file validation available for the layout polish branch", () => {
    for (const file of [
      "components/result/mbti/clone/MbtiCloneAssetSlot.tsx",
      "components/result/mbti/clone/MbtiCloneNarrativeSection.tsx",
      "components/result/mbti/clone/mbtiDesktopClone.module.css",
      "tests/contracts/mbti-pdf-snapshot-print-layout-polish.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isMbtiResultPagePdfVisualPaginationAllowedFile(file), file).toBe(true);
    }
  });
});
