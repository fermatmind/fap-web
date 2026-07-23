import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-cross-approval-48-package.mjs";
const PACKAGE = "docs/seo/personality/mbti-cross-approval-48-package-2026-07-23.json";
const HASH_MANIFEST = "docs/seo/personality/mbti-cross-approval-48-hash-manifest-2026-07-23.json";
const CONTRACT = "docs/seo/personality/mbti-cross-approval-48-rollback-readback-2026-07-23.md";
const SOURCES = [
  "docs/seo/personality/mbti-cross-approval-48-source-enfp-vs-entp-2026-07-02.json",
  "docs/seo/personality/mbti-cross-approval-48-source-estj-vs-entj-2026-07-02.json",
  "docs/seo/personality/mbti-cross-approval-48-source-isfp-vs-infp-2026-07-02.json",
];
const SLUGS = ["enfp-vs-entp", "estj-vs-entj", "isfp-vs-infp"];
const SECTION_IDS = [
  "quick_answer",
  "why_they_are_confused",
  "shared_traits",
  "core_difference",
  "work_and_learning",
  "communication_and_relationships",
  "stress_and_growth",
  "misconceptions",
];

type ApprovalRecord = {
  slug: string;
  content_sha256: string;
  source: { raw_file_sha256: string; stale_source_manifest_declared_sha256: string; declared_hash_matches_snapshot: boolean };
  expected_content_contract: { section_count: number; section_ids: string[]; section_sha256: string; faq_count: number; faq_sha256: string; internal_links_sha256: string };
  expected_seo_contract: { canonical_url: string; content_phase_robots: string; indexability_phase_robots: string };
  rollback_contract: Record<string, boolean>;
  content_phase_readback_contract: Record<string, unknown>;
  manual_review: { operator_editorial_approval: string; previously_approved_pending_package_sha256: string; previous_approval_statement_sha256: string; content_release_authorized: boolean; indexability_release_authorized: boolean };
  candidate_payload: Record<string, unknown>;
};

type Report = {
  schema_version: string;
  status: string;
  final_decision: string;
  summary: { record_count: number; exact_slugs: string[]; source_hash_drift_count: number; approved_count: number; pending_count: number };
  editorial_approval: Record<string, unknown> & { decision: string; previously_approved_pending_package_sha256: string; previous_approval_statement_sha256: string };
  records: ApprovalRecord[];
  content_release_candidate: { payload_sha256: string; authorization_status: string };
  indexability_release_template: { template_sha256: string; authorization_status: string };
  safety_boundary: Record<string, boolean>;
  package_sha256: string;
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, stable(record[key])]));
  }
  return value;
}

function sha256Json(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function generate(cwd = ROOT): { stdout: Record<string, unknown>; report: Report } {
  const expectedArtifacts = [PACKAGE, HASH_MANIFEST, CONTRACT];
  const missingArtifacts = expectedArtifacts.filter((artifact) => !existsSync(path.join(cwd, artifact)));
  if (missingArtifacts.length > 0) {
    throw new Error(`missing committed approval artifact(s): ${missingArtifacts.join(", ")}`);
  }
  const committedArtifacts = expectedArtifacts
    .map((artifact) => [artifact, readFileSync(path.join(cwd, artifact), "utf8")] as const);
  const stdout = JSON.parse(execFileSync("node", [SCRIPT], { cwd, encoding: "utf8" }));
  for (const [artifact, committedBytes] of committedArtifacts) {
    const generatedBytes = readFileSync(path.join(cwd, artifact), "utf8");
    if (generatedBytes !== committedBytes) {
      throw new Error(`${artifact}: committed artifact does not match deterministic generator output`);
    }
  }
  const report = JSON.parse(readFileSync(path.join(cwd, PACKAGE), "utf8")) as Report;
  return { stdout, report };
}

describe("MBTI-CROSS-APPROVAL-48 exact approval package", () => {
  it("builds only the exact three repaired records pending editorial reapproval deterministically", () => {
    const first = generate();
    const firstBytes = readFileSync(path.join(ROOT, PACKAGE), "utf8");
    const second = generate();
    const secondBytes = readFileSync(path.join(ROOT, PACKAGE), "utf8");

    expect(first.stdout).toMatchObject({ ok: true, record_count: 3, approval_status: "pending_operator_editorial_reapproval" });
    expect(first.report.schema_version).toBe("mbti.cross_type_comparison.approval.v1");
    expect(first.report.summary).toEqual({ record_count: 3, exact_slugs: SLUGS, source_hash_drift_count: 3, approved_count: 0, pending_count: 3 });
    expect(first.report.records.map((record) => record.slug)).toEqual(SLUGS);
    expect(new Set(first.report.records.map((record) => record.slug)).size).toBe(3);
    expect(firstBytes).toBe(secondBytes);
    expect(second.report.package_sha256).toBe(first.report.package_sha256);
  });

  it("locks schema, source provenance, content hashes, sections, FAQ, SEO, and initial noindex state", () => {
    const { report } = generate();
    for (const record of report.records) {
      expect(record.source.raw_file_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.source.stale_source_manifest_declared_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.source.raw_file_sha256).not.toBe(record.source.stale_source_manifest_declared_sha256);
      expect(record.source.declared_hash_matches_snapshot).toBe(false);
      expect(record.content_sha256).toBe(sha256Json(record.candidate_payload));
      expect(record.expected_content_contract).toMatchObject({ section_count: 8, section_ids: SECTION_IDS, faq_count: 8 });
      expect(record.expected_content_contract.section_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.expected_content_contract.faq_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.expected_content_contract.internal_links_sha256).toMatch(/^[a-f0-9]{64}$/);
      const candidate = record.candidate_payload as {
        comparison_contract_version: string;
        comparison_slug: string;
        comparison_type: string;
        base_type_code: string;
        left_type: string;
        right_type: string;
        base_type_codes: string[];
        scale_code: string;
        locale: string;
        public_route_type: string;
        canonical_url: string;
        sections: Array<{ body: string[] }>;
        internal_links: Array<{ label: string; href: string; reason: string }>;
      };
      expect(candidate).toMatchObject({
        comparison_contract_version: "mbti.cross_type_comparison.public.v1",
        comparison_slug: record.slug,
        comparison_type: "mbti_cross_type",
        base_type_code: candidate.left_type,
        base_type_codes: [candidate.left_type, candidate.right_type],
        scale_code: "MBTI",
        locale: "zh-CN",
        public_route_type: "cross-type-comparison",
        canonical_url: `https://fermatmind.com/zh/personality/${record.slug}`,
      });
      expect(candidate).not.toHaveProperty("slug");
      expect(candidate.sections.every((section) => Array.isArray(section.body) && section.body.length > 0)).toBe(true);
      expect(candidate.internal_links).toHaveLength(7);
      expect(candidate.internal_links.every((link) => link.label && link.href && link.reason)).toBe(true);
      expect(candidate.internal_links.every((link) => !/^\/zh\/personality\/[a-z]{4}$/.test(link.href))).toBe(true);
      expect(record.expected_seo_contract).toMatchObject({
        canonical_url: `https://fermatmind.com/zh/personality/${record.slug}`,
        content_phase_robots: "noindex,follow",
        indexability_phase_robots: "index,follow",
      });
      expect(record.content_phase_readback_contract).toMatchObject({ authority_must_be_db_or_cms: true, robots: "noindex,follow", is_indexable: false, sitemap_eligible: false, llms_eligible: false });
    }
  });

  it("fails closed when a checked-in source snapshot is tampered", () => {
    const sandbox = mkdtempSync(path.join(tmpdir(), "mbti-cross-approval-48-"));
    mkdirSync(path.join(sandbox, "scripts/seo"), { recursive: true });
    mkdirSync(path.join(sandbox, "docs/seo/personality"), { recursive: true });
    copyFileSync(path.join(ROOT, SCRIPT), path.join(sandbox, SCRIPT));
    for (const source of SOURCES) copyFileSync(path.join(ROOT, source), path.join(sandbox, source));
    appendFileSync(path.join(sandbox, SOURCES[0]), "\n");
    expect(() => execFileSync("node", [SCRIPT], { cwd: sandbox, encoding: "utf8", stdio: "pipe" })).toThrow(/source snapshot raw SHA drift/);
  });

  it("detects package tampering through the package hash", () => {
    const { report } = generate();
    const { package_sha256: packageSha256, ...core } = report;
    expect(sha256Json(core)).toBe(packageSha256);
    const tampered = structuredClone(core);
    tampered.records[0].candidate_payload.title = "tampered";
    expect(sha256Json(tampered)).not.toBe(packageSha256);
  });

  it("fails when checked-in artifacts differ from deterministic generator output", () => {
    const sandbox = mkdtempSync(path.join(tmpdir(), "mbti-cross-approval-48-artifact-"));
    mkdirSync(path.join(sandbox, "scripts/seo"), { recursive: true });
    mkdirSync(path.join(sandbox, "docs/seo/personality"), { recursive: true });
    copyFileSync(path.join(ROOT, SCRIPT), path.join(sandbox, SCRIPT));
    for (const source of SOURCES) copyFileSync(path.join(ROOT, source), path.join(sandbox, source));
    execFileSync("node", [SCRIPT], { cwd: sandbox, encoding: "utf8" });
    appendFileSync(path.join(sandbox, PACKAGE), "\n");
    expect(() => generate(sandbox)).toThrow(/committed artifact does not match deterministic generator output/);
  });

  it("fails before generation when any required approval artifact is absent", () => {
    const sandbox = mkdtempSync(path.join(tmpdir(), "mbti-cross-approval-48-missing-artifact-"));
    mkdirSync(path.join(sandbox, "scripts/seo"), { recursive: true });
    mkdirSync(path.join(sandbox, "docs/seo/personality"), { recursive: true });
    copyFileSync(path.join(ROOT, SCRIPT), path.join(sandbox, SCRIPT));
    for (const source of SOURCES) copyFileSync(path.join(ROOT, source), path.join(sandbox, source));
    expect(() => generate(sandbox)).toThrow(/missing committed approval artifact/);
    expect(existsSync(path.join(sandbox, PACKAGE))).toBe(false);
  });

  it("requires atomic rollback and exact DB/CMS readback for every record", () => {
    const { report } = generate();
    for (const record of report.records) {
      expect(record.rollback_contract).toMatchObject({
        capture_prewrite_revision_and_payload_hash: true,
        atomic_exact_three_required: true,
        rollback_all_three_on_any_write_or_readback_failure: true,
        restore_only_exact_slug_prewrite_state: true,
        preserve_publication_and_indexability_state: true,
        prohibit_fourth_record: true,
      });
      expect(record.content_phase_readback_contract).toMatchObject({ api_http_status: 200, page_http_status: 200, authority_must_be_db_or_cms: true });
    }
    expect(readFileSync(path.join(ROOT, CONTRACT), "utf8")).toContain("A local approval asset or frontend fallback cannot satisfy readback.");
  });

  it("invalidates the prior approval after runtime-shape repair and keeps every release blocked", () => {
    const { report } = generate();
    expect(report.status).toBe("pending_operator_editorial_reapproval");
    expect(report.final_decision).toBe("PENDING_EXACT_THREE_EDITORIAL_REAPPROVAL_AFTER_RUNTIME_SHAPE_REPAIR_NO_PRODUCTION_ACTION_AUTHORIZED");
    expect(report.editorial_approval).toMatchObject({
      decision: "reapproval_required_after_runtime_shape_repair",
      previously_approved_pending_package_sha256: "1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6",
      permits_pr_48_finalization_and_merge: false,
      permits_pr_49_implementation: false,
      production_content_write_authorized: false,
      publication_or_indexability_change_authorized: false,
      sitemap_or_llms_change_authorized: false,
      search_submission_authorized: false,
    });
    expect(report.editorial_approval.previous_approval_statement_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.records.every((record) => record.manual_review.operator_editorial_approval === "pending_reapproval_after_runtime_shape_repair")).toBe(true);
    expect(report.records.every((record) => record.manual_review.previously_approved_pending_package_sha256 === report.editorial_approval.previously_approved_pending_package_sha256)).toBe(true);
    expect(report.records.every((record) => record.manual_review.previous_approval_statement_sha256 === report.editorial_approval.previous_approval_statement_sha256)).toBe(true);
    expect(report.records.every((record) => !record.manual_review.content_release_authorized && !record.manual_review.indexability_release_authorized)).toBe(true);
    expect(report.content_release_candidate.authorization_status).toContain("blocked_pending_editorial_reapproval_and_separate_production_content_write_authorization");
    expect(report.indexability_release_template.authorization_status).toContain("blocked_until_content_promotion_and_readback_pass");
  });

  it("writes a matching hash manifest and contains no credential or user-data fields", () => {
    const { report } = generate();
    const manifest = JSON.parse(readFileSync(path.join(ROOT, HASH_MANIFEST), "utf8"));
    expect(manifest).toMatchObject({ record_count: 3, exact_slugs: SLUGS, package_sha256: report.package_sha256 });
    expect(manifest.records).toHaveLength(3);
    const serialized = JSON.stringify(report).toLowerCase();
    expect(serialized).not.toMatch(/"(?:token|secret|password|authorization|api_key|email|user_id)"\s*:/);
    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      frontend_runtime_authority: false,
      production_deploy_attempted: false,
      cms_or_database_write_attempted: false,
      publication_or_indexability_mutation_attempted: false,
      sitemap_or_llms_mutation_attempted: false,
      search_submission_attempted: false,
      credentials_or_user_data_included: false,
    });
  });
});
