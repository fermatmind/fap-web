import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE_DIRECTORY = path.join(
  ROOT,
  "generated/en-content-parity/W3-editorial-cms/articles",
);
const EXPECTED_FILES = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "sha256_manifest.json",
  "master_manifest_patch.candidate.json",
  "handoff.md",
];
const IMMUTABLE_FILES = EXPECTED_FILES.filter(
  (file) => !["sha256_manifest.json", "master_manifest_patch.candidate.json"].includes(file),
);
const EXPECTED_SOURCE_REVISIONS = new Map([
  [1, 446],
  [2, 445],
  [3, 383],
  [4, 58],
  [5, 444],
  [6, 443],
  [7, 442],
  [8, 72],
  [9, 441],
  [10, 440],
  [50, 57],
  [51, 73],
  [52, 64],
  [53, 65],
  [55, 75],
  [58, 78],
  [59, 79],
]);
const PERMISSION_KEYS = [
  "cms_write_authorized",
  "staging_write_authorized",
  "production_import_authorized",
  "public_release_authorized",
  "seo_runtime_release_authorized",
  "search_submission_authorized",
  "master_manifest_write_authorized",
];

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIRECTORY, file), "utf8"));
}

function sha256(value: string | Buffer) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

describe("W3 Article English candidate package", () => {
  it("contains the exact standard handoff files and a package_in_progress-only candidate", () => {
    const scope = readJson("scope_manifest.json");
    const candidate = readJson("master_manifest_patch.candidate.json");

    expect(scope.artifact_files).toEqual(EXPECTED_FILES);
    expect(scope.lane_id).toBe("W3");
    expect(scope.subscope_id).toBe("W3-ARTICLES");
    expect(scope.status).toBe("package_in_progress");
    expect(candidate.proposed_status).toBe("package_in_progress");
    expect(candidate.gate_evidence).toMatchObject({
      gate: "package_in_progress",
      report_path: "source_ledger.json",
      report_in_package: true,
      owner_lane_id: "W3",
      verdict: null,
      row_count: 17,
    });
    expect(Object.keys(candidate.permissions).sort()).toEqual([...PERMISSION_KEYS].sort());
    expect(Object.values(candidate.permissions)).toEqual(Array(PERMISSION_KEYS.length).fill(false));
  });

  it("binds exactly 17 candidate Articles to their frozen ids and revisions", () => {
    const ledger = readJson("source_ledger.json");

    expect(ledger.rows).toHaveLength(17);
    expect(new Set(ledger.rows.map((row: { row_id: string }) => row.row_id)).size).toBe(17);
    expect(
      ledger.rows.map((row: { source_article_id: number }) => row.source_article_id).sort((a: number, b: number) => a - b),
    ).toEqual([...EXPECTED_SOURCE_REVISIONS.keys()]);

    for (const row of ledger.rows) {
      expect(row.asset_id).toBe("ENPARITY-W3-ARTICLES");
      expect(row.stable_asset_identity).toBe(`Article:${row.source_article_id}`);
      expect(row.source_revision_id).toBe(EXPECTED_SOURCE_REVISIONS.get(row.source_article_id));
      expect(row.source_locale).toBe("zh-CN");
      expect(row.target_locale).toBe("en");
      expect(row.target_publication_status).toBe("candidate_only_not_imported");
      expect(row.import_ready).toBe(false);
      expect(row.candidate_title.trim()).not.toBe("");
      expect(row.candidate_excerpt.trim()).not.toBe("");
      expect(row.candidate_content_md.trim()).not.toBe("");
      expect(row.structure_review.heading_count_matches).toBe(true);
      expect(row.language_review.chinese_han_leakage_detected).toBe(false);
      expect(row.language_review.generator_control_text_detected).toBe(false);
      expect(row.language_review.independent_naturalness_review).toBe("pending_W9");
      expect(row.media_review.candidate_cover_image_reference).toBeNull();
    }
  });

  it("records unresolved producer reviews without claiming import or independent QA readiness", () => {
    const ledger = readJson("source_ledger.json");
    const editorial = readJson("editorial_review.json");
    const dryRun = readJson("dry_run_readiness.json");

    expect(ledger.reconciliation.link_review_pending_rows).toBeGreaterThan(0);
    expect(
      ledger.rows.some(
        (row: { internal_link_review: { parity_status: string } }) =>
          row.internal_link_review.parity_status === "pending_editorial_link_review",
      ),
    ).toBe(true);
    expect(editorial.verdict).toBe("PENDING_INDEPENDENT_QA");
    expect(editorial.review_kind).toContain("not independent W9 QA");
    expect(dryRun.ready).toBe(false);
    expect(dryRun.status).toBe("package_in_progress_candidate_only");
  });

  it("hashes the eight immutable payload files in repository-defined order", () => {
    const manifest = readJson("sha256_manifest.json");

    expect(manifest.files.map((entry: { path: string }) => entry.path)).toEqual(IMMUTABLE_FILES);
    for (const entry of manifest.files) {
      expect(entry.sha256).toBe(sha256(fs.readFileSync(path.join(PACKAGE_DIRECTORY, entry.path))));
    }
    expect(manifest.package_sha256).toBe(
      sha256(
        manifest.files
          .map((entry: { path: string; sha256: string }) => `${entry.path}:${entry.sha256}`)
          .join("\n"),
      ),
    );
  });
});
