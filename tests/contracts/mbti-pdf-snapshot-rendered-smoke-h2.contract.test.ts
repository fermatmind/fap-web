import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isMbtiPdfSnapshotRenderedSmokeH2AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/ops/check-mbti-result-page-pdf-smoke.mjs";

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI PDF snapshot rendered smoke H2", () => {
  it("exposes render version, print asset hash, and page-count policy in dry-run output", () => {
    const output = execFileSync("node", [SCRIPT_PATH, "--json"], {
      cwd: ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        MBTI_RESULT_PAGE_PDF_SMOKE_ATTEMPT_ID: "",
        MBTI_RESULT_PAGE_PDF_SMOKE_ACCESS_TOKEN: "",
      },
    });
    const payload = JSON.parse(output) as {
      ok: boolean;
      executed: boolean;
      surface_version: string;
      render_version: string;
      print_asset_hash: string;
      page_count_range: [number, number];
      pdf: unknown;
    };

    expect(payload.ok).toBe(true);
    expect(payload.executed).toBe(false);
    expect(payload.surface_version).toBe("mbti.result_page_snapshot.v4");
    expect(payload.render_version).toBe("mbti.snapshot.print_layout.v1");
    expect(payload.print_asset_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(payload.page_count_range).toEqual([8, 14]);
    expect(payload.pdf).toBeNull();
    expect(output).not.toContain("result_access_token=");
    expect(output).not.toContain("private_url");
  });

  it("requires the backend render-source headers before accepting a live PDF", () => {
    const source = read(SCRIPT_PATH);

    expect(source).toContain('const SNAPSHOT_RENDER_VERSION = "mbti.snapshot.print_layout.v1"');
    expect(source).toContain('const SNAPSHOT_PRINT_ASSET_HASH = "sha256:');
    expect(source).toContain('["x-pdf-render-version", SNAPSHOT_RENDER_VERSION]');
    expect(source).toContain('["x-pdf-print-asset-hash", SNAPSHOT_PRINT_ASSET_HASH]');
    expect(source).toContain("failures.push(`header:${header}`)");
  });

  it("audits rendered PDF metadata without writing raw PDF artifacts", () => {
    const source = read(SCRIPT_PATH);

    expect(source).toContain('execFileSync("pdfinfo", ["-"]');
    expect(source).toContain("parsePdfMetadataFallback");
    expect(source).toContain("pdf_metadata_producer");
    expect(source).toContain("pdf_metadata_mpdf");
    expect(source).toContain("pdf_page_count_range");
    expect(source).toContain("pdf_page_size_a4");
    expect(source).toContain("DEFAULT_MIN_PAGES = 8");
    expect(source).toContain("DEFAULT_MAX_PAGES = 14");
    expect(source).toContain("isA4PageSize");
    expect(source).not.toContain("writeFileSync");
    expect(source).not.toContain("mkdtempSync");
    expect(source).not.toContain("createWriteStream");
    expect(source).not.toContain("tmpdir");
  });

  it("keeps H2 scope limited to the rendered smoke gate", () => {
    for (const file of [
      SCRIPT_PATH,
      "tests/contracts/mbti-pdf-snapshot-rendered-smoke-h2.contract.test.ts",
      "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isMbtiPdfSnapshotRenderedSmokeH2AllowedFile(file)).toBe(true);
    }

    for (const file of [
      "components/result/mbti/clone/mbtiDesktopClone.module.css",
      "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx",
      "backend/app/Services/Report/Pdf/ReportPdfDocumentService.php",
      "public/sitemap.xml",
    ]) {
      expect(isMbtiPdfSnapshotRenderedSmokeH2AllowedFile(file)).toBe(false);
    }
  });
});
