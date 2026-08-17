import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveEnneagramPrivateResultAuthority } from "@/lib/enneagram/privateResultAuthority";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  bindCanonicalEnneagramReport,
  canonicalEnneagramAuthority,
} from "@/tests/contracts/helpers/enneagramCanonicalAuthority";

const ROOT = process.cwd();
const RENDERER_FILES = [
  "lib/enneagram/resultAssembler.ts",
  "lib/enneagram/shareSurface.ts",
  "components/result/enneagram/EnneagramResultShell.tsx",
  "components/share/EnneagramShareSummaryCard.tsx",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Enneagram canonical renderer authority", () => {
  it("fails closed when top-level and report metadata authorities disagree", () => {
    const report = bindCanonicalEnneagramReport({
      ok: true,
      locale: "en",
      scale_code: "ENNEAGRAM",
      enneagram_report_v2: {
        locale: "en",
        schema_version: "enneagram.report.v2",
        scale_code: "ENNEAGRAM",
        registry: {},
        provenance: {},
        pages: [],
      },
      report: {
        scale_code: "ENNEAGRAM",
        _meta: {},
      },
    } as ReportResponse, "en");
    (report.report!._meta! as Record<string, unknown>).enneagram_private_result_authority = {
      ...canonicalEnneagramAuthority("en"),
      compiled_hash: "c".repeat(64),
    };

    expect(resolveEnneagramPrivateResultAuthority(report, "en")).toBeNull();
  });

  it("keeps canonical authority and hash validation on every private renderer entry", () => {
    expect(read("lib/enneagram/resultAssembler.ts")).toContain("resolveEnneagramPrivateResultAuthority");
    expect(read("lib/enneagram/shareSurface.ts")).toContain("resolveEnneagramShareAuthority");
    expect(read("lib/enneagram/technicalNote.ts")).toContain("isCanonicalEnneagramTechnicalNote");
    expect(read("lib/enneagram/secondarySurfaceNormalizer.ts")).toContain("canonicalBindingMatches");
  });

  it("does not restore retired preview selectors or local editorial generators", () => {
    const source = RENDERER_FILES.map(read).join("\n");
    for (const forbidden of [
      "asset_backed_card",
      "methodology_boundary_card",
      "composeAssetPreview",
      "buildLead",
      "buildMethodologyBoundary",
      "stateLead",
      "localizeEnneagramPresentationValue",
      "当前模块使用通用渲染",
      "This module is using the generic renderer",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("keeps retired W5 candidate, receipt, freeze, and preview paths absent", () => {
    for (const retiredPath of [
      "generated/en-content-parity/v2/W5-enneagram-private-results",
      "generated/en-content-parity/W9-independent-qa/enneagram/w5-enneagram-private-results-8a1653b5",
      "scripts/seo/build-w5-enneagram-v2-lane-materialization.mjs",
      "tests/e2e/enneagram-phase1b-rendered-preview.spec.ts",
      "tests/e2e/enneagram-phase8c-production-equivalent-candidate-e2e.spec.ts",
    ]) {
      expect(fs.existsSync(path.join(ROOT, retiredPath)), retiredPath).toBe(false);
    }

    const currentControl = read("docs/seo/generated/en-content-parity-control-master.v2.json");
    expect(currentControl).not.toContain("enneagram_result_content");
    expect(currentControl).not.toContain("W5-enneagram-private-results");
  });
});
