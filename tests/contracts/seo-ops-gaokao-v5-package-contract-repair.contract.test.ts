import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isSeoOpsGaokaoV5PackageContractRepair01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPAIR_ROOT = "generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00";
const PACKAGE_ROOT = path.join(REPAIR_ROOT, "resolved-package-repaired");
const TARGET_SLUG = "gaokao-major-choice-parent-conflict-riasec-course-checklist";
const TARGET_CANONICAL = `/zh/articles/${TARGET_SLUG}`;

function readJson<T = Record<string, unknown>>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

function changedFiles(): string[] {
  const commands = [
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only", "HEAD^...HEAD"],
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
  ];

  return Array.from(
    new Set(
      commands.flatMap((args) => {
        try {
          return execFileSync("git", args, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          })
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        } catch {
          return [];
        }
      }),
    ),
  ).sort();
}

function currentFiles(): string[] {
  const files = changedFiles();

  if (files.length > 0) {
    return files;
  }

  return execFileSync("git", ["show", "--name-only", "--format=", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

describe("SEO-OPS-GAOKAO-V5-PACKAGE-CONTRACT-REPAIR-01", () => {
  it("keeps the PR scope limited to generated package repair evidence", () => {
    const files = currentFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isSeoOpsGaokaoV5PackageContractRepair01AllowedFile), files.join("\n")).toBe(true);
  });

  it("commits the repaired package copy with required contracts", () => {
    const requiredFiles = [
      `${PACKAGE_ROOT}/contracts/ROUTE_ALIAS_CONTRACT.json`,
      `${PACKAGE_ROOT}/contracts/SOCIAL_IMAGE_METADATA_REQUIREMENTS.json`,
      `${PACKAGE_ROOT}/contracts/DYNAMIC_CTA_CONTRACT.json`,
      `${PACKAGE_ROOT}/contracts/PRIVATE_URL_GUARD.json`,
      `${PACKAGE_ROOT}/cms/CMS_IMPORT_DRAFT_zh-CN_${TARGET_SLUG}.json`,
      `${REPAIR_ROOT}/REPAIRED_RESOLVED_PACKAGE_REPORT.md`,
      `${REPAIR_ROOT}/ARTICLE_TRANSLATION_MIGRATION_ATTEMPT_AND_DRY_RUN_PASS_REPORT.md`,
      `${REPAIR_ROOT}/dry_run_after_translation_attempt_manifest.json`,
    ];

    for (const file of requiredFiles) {
      expect(existsSync(path.join(ROOT, file)), file).toBe(true);
    }
  });

  it("preserves canonical, publish/search holds, and reader-facing category metadata", () => {
    const manifest = readJson<Record<string, unknown>>(`${PACKAGE_ROOT}/manifest.json`);
    const cmsImport = readJson<Record<string, unknown>>(`${PACKAGE_ROOT}/cms/CMS_IMPORT_DRAFT_zh-CN_${TARGET_SLUG}.json`);

    expect(manifest.slug).toBe(TARGET_SLUG);
    expect(manifest.canonical_url_draft).toBe(TARGET_CANONICAL);
    expect(manifest.locale).toBe("zh-CN");
    expect(manifest.publish_allowed).toBe(false);
    expect(manifest.schema_hold).toBe(true);
    expect(manifest.hreflang_hold).toBe(true);
    expect(manifest.sitemap_eligible).toBe(false);
    expect(manifest.llms_eligible).toBe(false);
    expect(manifest.search_submission_hold).toBe(true);
    expect(manifest.category).toBe("高考志愿");
    expect(manifest.category_name).toBe("高考志愿");
    expect(manifest.category_slug).toBe("gaokao-major-choice");

    expect(cmsImport.operation_type).toBe("new_article");
    expect(cmsImport.slug).toBe(TARGET_SLUG);
    expect(cmsImport.canonical_path).toBe(TARGET_CANONICAL);
    expect(cmsImport.publish_allowed).toBe(false);
    expect(cmsImport.category).toBe("高考志愿");
    expect(cmsImport.category_name).toBe("高考志愿");
    expect(cmsImport.category_slug).toBe("gaokao-major-choice");
    expect(cmsImport.hard_holds).toEqual(
      expect.arrayContaining(["publish", "search", "schema", "hreflang", "sitemap", "llms", "revalidation", "deploy"]),
    );
  });

  it("keeps private routes and sensitive keys only in guard-policy contract fields", () => {
    const guard = readJson<Record<string, unknown>>(`${PACKAGE_ROOT}/contracts/PRIVATE_URL_GUARD.json`);
    const routeAlias = readJson<Record<string, unknown>>(`${PACKAGE_ROOT}/contracts/ROUTE_ALIAS_CONTRACT.json`);
    const dynamicCta = readJson<Record<string, unknown>>(`${PACKAGE_ROOT}/contracts/DYNAMIC_CTA_CONTRACT.json`);

    expect(guard.schema_version).toBe("private_url_guard_v1");
    expect(guard).toHaveProperty("forbidden_private_routes");
    expect(guard).toHaveProperty("forbidden_sensitive_query_keys");
    expect(guard).toHaveProperty("forbidden_substrings");
    expect(guard).not.toHaveProperty("private_urls_forbidden");

    expect(routeAlias.schema_version).toBe("route_alias_contract_v1");
    expect(dynamicCta.schema_version).toBe("dynamic_cta_contract_v1");
    expect(JSON.stringify(routeAlias)).toContain(TARGET_CANONICAL);
    expect(JSON.stringify(dynamicCta)).toContain("/zh/tests/holland-career-interest-test-riasec");
  });

  it("records dry-run pass evidence without CMS or runtime mutation", () => {
    const rerunManifest = readJson<Record<string, unknown>>(`${REPAIR_ROOT}/dry_run_after_translation_attempt_manifest.json`);
    const report = read(`${REPAIR_ROOT}/ARTICLE_TRANSLATION_MIGRATION_ATTEMPT_AND_DRY_RUN_PASS_REPORT.md`);

    expect(rerunManifest.decision).toBe("CMS_DRAFT_IMPORT_DRY_RUN_OK_READY_FOR_OPERATOR_DRAFT_CREATE_GATE");
    expect(rerunManifest).toMatchObject({
      dry_run: {
        exit_code: 0,
        ok: true,
        dry_run: true,
        action: "would_create_draft",
        actual_write_executed: false,
        active_surface_guard: "passed",
        contract_integrity_scan: "passed",
      },
    });
    expect(report).toContain("no CMS write/import/draft creation");
    expect(report).toContain("no publish");
    expect(report).toContain("no URL Truth, sitemap/llms, schema/hreflang, search submission");
  });
});
