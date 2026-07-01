import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isMbtiResultPagePdfSmokeQualityGateAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/ops/check-mbti-result-page-pdf-smoke.mjs";

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("MBTI result-page PDF smoke quality gate", () => {
  it("keeps the dry-run non-networked, secret-free, and redacted", () => {
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
      required_operator_inputs: string[];
      fixture: { attempt_hash: string | null; access_token_present: boolean };
      pdf: unknown;
    };

    expect(payload.ok).toBe(true);
    expect(payload.executed).toBe(false);
    expect(payload.required_operator_inputs).toEqual(["attempt_id", "result_access_token"]);
    expect(payload.fixture).toEqual({ attempt_hash: null, access_token_present: false });
    expect(payload.pdf).toBeNull();
    expect(output).not.toContain("attempt_id=");
    expect(output).not.toContain("access_token=");
    expect(output).not.toContain("result_access_token=");
  });

  it("targets the strict v3 result-page PDF endpoint with required Gotenberg headers", () => {
    const source = read(SCRIPT_PATH);

    expect(source).toContain("/attempts/${encodeURIComponent(attemptId)}/result-page.pdf");
    expect(source).toContain('accept: "application/pdf"');
    expect(source).toContain("authorization: `Bearer ${accessToken}`");
    expect(source).toContain('"x-result-access-token": accessToken');
    expect(source).toContain('const SNAPSHOT_SURFACE_VERSION = "mbti.result_page_snapshot.v3"');
    expect(source).toContain('const SNAPSHOT_SURFACE_KEY = "mbti_result_page_snapshot"');
    expect(source).toContain('const SNAPSHOT_ENGINE = "gotenberg_chromium"');
    expect(source).toContain('["x-report-pdf-engine", SNAPSHOT_ENGINE]');
    expect(source).toContain('["x-pdf-surface", SNAPSHOT_SURFACE_KEY]');
    expect(source).toContain('["x-pdf-surface-version", SNAPSHOT_SURFACE_VERSION]');
    expect(source).toContain('["x-legacy-mpdf-fallback", "false"]');
    expect(source).toContain("pdf_magic_missing");
    expect(source).toContain("pdf_too_small");
    expect(source).toContain("pdf_content_type");
  });

  it("extracts PDF text from stdin without writing raw PDF artifacts", () => {
    const source = read(SCRIPT_PATH);

    expect(source).toContain("pdftotext");
    expect(source).toContain('execFileSync("pdftotext", ["-", "-"]');
    expect(source).toContain("input: pdfBytes");
    expect(source).not.toContain("writeFileSync");
    expect(source).not.toContain("mkdtempSync");
    expect(source).not.toContain("createWriteStream");
    expect(source).not.toContain("tmpdir");
  });

  it("blocks known result-page snapshot pollutants and requires core MBTI sections", () => {
    const source = read(SCRIPT_PATH);

    for (const token of [
      "ON THIS PAGE",
      "TOOLS",
      "Cookie",
      "Placeholder trait slot",
      "占位槽位",
      "完整结果工作台",
      "下载 PDF",
      "我的 MBTI 报告",
      "订单找回",
      "工作台",
      "分享结果",
      "重新测试",
      "查看历史",
      "AttemptReadController",
      "payload",
      "registry",
      "PDF_READY",
      "data-pdf",
      "Gotenberg",
      "mbti\\.result_page_snapshot",
    ]) {
      expect(source).toContain(token);
    }

    for (const token of [
      "人格特质",
      "职业路径",
      "个人成长",
      "关系模式",
      "Personality Traits",
      "Career Path",
      "Personal Growth",
      "Relationships",
    ]) {
      expect(source).toContain(token);
    }
  });

  it("keeps smoke output redacted to hashes and status fields", () => {
    const source = read(SCRIPT_PATH);

    expect(source).toContain("attempt_hash");
    expect(source).toContain("hashId(options.attemptId)");
    expect(source).toContain("access_token_present");
    expect(source).toContain("forbidden_hits");
    expect(source).toContain("surface_version");
    expect(source).not.toContain("raw_payload");
    expect(source).not.toContain("private_url");
    expect(source).not.toContain("privateUrl");
    expect(source).not.toContain("console.log(options.attemptId)");
    expect(source).not.toContain("console.log(options.accessToken)");
  });

  it("keeps the current PR-D scope limited to the smoke gate", () => {
    const allowedFiles = [
      "package.json",
      SCRIPT_PATH,
      "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of allowedFiles) {
      expect(isMbtiResultPagePdfSmokeQualityGateAllowedFile(file)).toBe(true);
    }

    for (const file of [
      "app/(localized)/[locale]/layout.tsx",
      "components/result/mbti/clone/MbtiDesktopCloneShell.tsx",
      "lib/api/v0_3.ts",
      "public/sitemap.xml",
    ]) {
      expect(isMbtiResultPagePdfSmokeQualityGateAllowedFile(file)).toBe(false);
    }
  });
});
