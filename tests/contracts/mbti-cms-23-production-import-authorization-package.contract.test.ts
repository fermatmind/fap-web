import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-23-production-import-authorization-package.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.csv";
const SOURCE_MERGE_COMMIT = "a3c10a2d2120e9ad0543656c699ac8749c123368";

type AuthorizationReport = {
  id: string;
  artifact: string;
  final_decision: string;
  source_artifact: {
    path: string;
    pr_url: string;
    merge_commit: string;
    package_sha256: string;
  };
  summary: {
    authorization_record_count: number;
    profile_record_count: number;
    comparison_record_count: number;
    verify_only_excluded_count: number;
    blocker_count: number;
    production_import_authorized: boolean;
  };
  import_scope: {
    mode: string;
    profiles: string[];
    comparisons: string[];
    excluded_verify_only: string[];
  };
  authorization_package: {
    status: string;
    production_import_authorized: boolean;
    exact_authorization_payload_sha256: string;
    source_package_sha256: string;
    source_merge_commit: string;
    records: Array<{
      target_path: string;
      kind: "profile" | "comparison";
      cms_resource: "personality_profile" | "personality_comparison";
      exact_payload_sha256: string;
      production_import_authorized: boolean;
      operator_review_required: boolean;
    }>;
  };
  operator_authorization_required: {
    required: boolean;
    accepted_decision_values: string[];
    required_fields: string[];
    exact_values: {
      source_merge_commit: string;
      source_package_sha256: string;
      authorization_payload_sha256: string;
      import_scope_mode: string;
      record_count: number;
    };
    production_import_command_allowed_after_authorization: boolean;
  };
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function changedScopeFiles(): string[] {
  const files = [
    ...execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
  ];
  const ignoredRunnerDrift = [
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
  ];
  return [...new Set(files.map((line) => line.trim()).filter(Boolean))]
    .filter((file) => !ignoredRunnerDrift.includes(file))
    .sort();
}

describe("MBTI-CMS-23 production import authorization package", () => {
  it("regenerates the no-write production import authorization package", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toEqual({
      ok: true,
      artifact: "MBTI-CMS-23-PRODUCTION-IMPORT-AUTHORIZATION-PACKAGE",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      final_decision: "READY_FOR_OPERATOR_AUTHORIZATION_NO_PRODUCTION_IMPORT_EXECUTED",
      authorization_record_count: 9,
      production_import_authorized: false,
    });
  });

  it("pins the exact CMS-22 source artifact, merge commit, and package hash", () => {
    const report = readJson<AuthorizationReport>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-23");
    expect(report.source_artifact).toMatchObject({
      path: "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.json",
      pr_url: "https://github.com/fermatmind/fap-web/pull/1617",
      merge_commit: SOURCE_MERGE_COMMIT,
    });
    expect(report.source_artifact.package_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.authorization_package.source_package_sha256).toBe(report.source_artifact.package_sha256);
    expect(report.authorization_package.source_merge_commit).toBe(SOURCE_MERGE_COMMIT);
  });

  it("keeps the import scope to the CMS-22 top blocker batch", () => {
    const report = readJson<AuthorizationReport>(JSON_PATH);

    expect(report.summary).toEqual({
      authorization_record_count: 9,
      profile_record_count: 4,
      comparison_record_count: 5,
      verify_only_excluded_count: 1,
      blocker_count: 0,
      production_import_authorized: false,
    });
    expect(report.import_scope).toEqual({
      mode: "top_blocker_batch_only",
      profiles: [
        "/zh/personality/istj-a",
        "/zh/personality/istp-a",
        "/zh/personality/isfp-a",
        "/zh/personality/esfj-a",
      ],
      comparisons: [
        "/zh/personality/intp-a-vs-intp-t",
        "/zh/personality/intj-vs-intp",
        "/zh/personality/entj-vs-intj",
        "/zh/personality/infj-vs-infp",
        "/zh/personality/istj-vs-isfj",
      ],
      excluded_verify_only: ["/zh/personality/intp-a"],
    });
  });

  it("marks every record as not authorized and still requiring operator review", () => {
    const report = readJson<AuthorizationReport>(JSON_PATH);

    expect(report.authorization_package.status).toBe("not_authorized");
    expect(report.authorization_package.production_import_authorized).toBe(false);
    expect(report.authorization_package.exact_authorization_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.authorization_package.records).toHaveLength(9);
    for (const record of report.authorization_package.records) {
      expect(record.production_import_authorized).toBe(false);
      expect(record.operator_review_required).toBe(true);
      expect(record.exact_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
      if (record.kind === "profile") {
        expect(record.cms_resource).toBe("personality_profile");
      } else {
        expect(record.cms_resource).toBe("personality_comparison");
      }
    }
  });

  it("requires exact operator authorization values before any later import task", () => {
    const report = readJson<AuthorizationReport>(JSON_PATH);

    expect(report.operator_authorization_required.required).toBe(true);
    expect(report.operator_authorization_required.accepted_decision_values).toEqual([
      "authorized_for_production_import",
      "needs_revision",
      "hold",
    ]);
    expect(report.operator_authorization_required.required_fields).toEqual([
      "decision",
      "source_merge_commit",
      "source_package_sha256",
      "authorization_payload_sha256",
      "import_scope_mode",
      "record_count",
    ]);
    expect(report.operator_authorization_required.exact_values).toMatchObject({
      source_merge_commit: SOURCE_MERGE_COMMIT,
      source_package_sha256: report.source_artifact.package_sha256,
      authorization_payload_sha256: report.authorization_package.exact_authorization_payload_sha256,
      import_scope_mode: "top_blocker_batch_only",
      record_count: 9,
    });
    expect(report.operator_authorization_required.production_import_command_allowed_after_authorization).toBe(false);
  });

  it("keeps CMS writes, API changes, indexability mutation, GSC, and deploy out of scope", () => {
    const report = readJson<AuthorizationReport>(JSON_PATH);

    expect(report.safety_boundary).toEqual({
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      fap_api_change_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_submission_attempted: false,
      deploy_attempted: false,
    });
    expect(report.blockers).toEqual([]);
  });

  it("emits readable markdown and CSV outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-23 Production Import Authorization Package");
    expect(md).toContain("Production import authorized: `false`");
    expect(md).toContain(SOURCE_MERGE_COMMIT);
    expect(md).toContain("decision: authorized_for_production_import");
    expect(csv.split("\n")[0]).toBe(
      [
        "target_path",
        "kind",
        "cms_resource",
        "locale",
        "slug",
        "code",
        "import_action",
        "payload_sha256",
        "production_import_authorized",
      ].join(","),
    );
  });

  it("keeps changed files inside the MBTI-CMS-23 scope", () => {
    const allowed = [
      "docs/codex/pr-train-state.json",
      "docs/codex/pr-train.yaml",
      "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.csv",
      "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.json",
      "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "scripts/seo/build-mbti-cms-23-production-import-authorization-package.mjs",
      "tests/contracts/mbti-cms-22-import-dry-run-final.contract.test.ts",
      "tests/contracts/mbti-cms-23-production-import-authorization-package.contract.test.ts",
    ];

    expect(changedScopeFiles()).toEqual(expect.arrayContaining([
      "scripts/seo/build-mbti-cms-23-production-import-authorization-package.mjs",
      "tests/contracts/mbti-cms-23-production-import-authorization-package.contract.test.ts",
    ]));
    expect(changedScopeFiles().filter((file) => !allowed.includes(file))).toEqual([]);
  });
});
