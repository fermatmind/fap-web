import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isIqMethodPagesCmsDryRun01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PACKAGE_DIR = "generated/iq-method-pages-zh-cn-v0.2";
const DRY_RUN_DIR = `${PACKAGE_DIR}/cms-dry-run`;
const PR_ID = "IQ-METHOD-PAGES-ZH-CN-CMS-DRY-RUN-01";
const EXPECTED_SLUGS = [
  "what-is-iq-style-reasoning-test",
  "online-iq-test-vs-professional-assessment",
  "iq-test-score-meaning-boundary",
  "matrix-reasoning-pattern-recognition-guide",
  "why-fermatmind-iq-v1-not-certification",
  "iq-test-privacy-data-boundary",
  "iq-expert-review-disclosure",
];
const PRIVATE_FLOW_PATTERNS = [
  /\/take(?:\/|$|\?)/i,
  /\/results?(?:\/|$|\?)/i,
  /\/orders?(?:\/|$|\?)/i,
  /\/pay(?:\/|$|\?)/i,
  /\/share(?:\/|$|\?)/i,
  /\/history(?:\/|$|\?)/i,
  /\/recover(?:\/|$|\?)/i,
  /\/restore(?:\/|$|\?)/i,
  /"answer_key"\s*:/i,
  /"correct_answer"\s*:/i,
  /"score_formula"\s*:/i,
  /"scoring_rubric"\s*:/i,
];
const FULL_CONTRACT_RUN_SIDE_EFFECT_FILES = new Set([
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
]);

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

function changedFiles(): string[] {
  let committed = "";
  for (const base of ["origin/main...HEAD", "main...HEAD"]) {
    try {
      committed = execFileSync("git", ["diff", "--name-only", base], {
        cwd: ROOT,
        encoding: "utf8",
      }).trim();
      break;
    } catch {
      // Local explicit scope validation is the fallback in shallow CI checkouts.
    }
  }
  const staged = execFileSync("git", ["diff", "--cached", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const unstaged = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const files = [
    ...(committed ? committed.split("\n") : []),
    ...(staged ? staged.split("\n") : []),
    ...(unstaged ? unstaged.split("\n") : []),
    ...(untracked ? untracked.split("\n") : []),
  ];
  return Array.from(new Set(files)).filter((file) => file.length > 0 && !FULL_CONTRACT_RUN_SIDE_EFFECT_FILES.has(file));
}

describe("IQ method pages CMS dry-run package", () => {
  it("keeps the PR diff inside the approved dry-run scope", () => {
    const files = changedFiles();

    if (files.length === 0 && process.env.GITHUB_ACTIONS === "true") {
      return;
    }

    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isIqMethodPagesCmsDryRun01AllowedFile), files.join("\n")).toBe(true);
  });

  it("publishes a dry-run-only manifest for all seven IQ method Article drafts", () => {
    const manifest = readJson<{
      schema_version: string;
      pr_id: string;
      mode: string;
      content_authority: string;
      mutation_policy: Record<string, boolean>;
      required_default_publish_state: {
        status: string;
        is_public: boolean;
        is_indexable: boolean;
        robots: string;
        sitemap_eligible: boolean;
        llms_eligible: boolean;
      };
      article_imports: Array<{
        operation: string;
        locale: string;
        slug: string;
        canonical_url: string;
        route: string;
        source_files: Record<string, string>;
        publish_state: {
          status: string;
          is_public: boolean;
          is_indexable: boolean;
          robots: string;
          sitemap_eligible: boolean;
          llms_eligible: boolean;
        };
        gates: Record<string, boolean>;
      }>;
    }>(`${DRY_RUN_DIR}/cms_import_manifest.json`);

    expect(manifest.schema_version).toBe("fermatmind.iq_method_pages.cms_dry_run_manifest.v1");
    expect(manifest.pr_id).toBe(PR_ID);
    expect(manifest.mode).toBe("cms_dry_run_contract_only");
    expect(manifest.content_authority).toContain("fap-api CMS/backend authoritative");
    expect(manifest.mutation_policy).toMatchObject({
      cms_write_attempted: false,
      production_import_attempted: false,
      publish_attempted: false,
      sitemap_llms_activation_attempted: false,
      frontend_runtime_change_attempted: false,
    });
    expect(manifest.required_default_publish_state).toMatchObject({
      status: "draft_review_only",
      is_public: false,
      is_indexable: false,
      robots: "noindex,follow",
      sitemap_eligible: false,
      llms_eligible: false,
    });
    expect(manifest.article_imports.map((row) => row.slug)).toEqual(EXPECTED_SLUGS);

    for (const row of manifest.article_imports) {
      expect(row.operation).toBe("upsert_draft_only");
      expect(row.locale).toBe("zh-CN");
      expect(row.route).toBe(`/zh/articles/${row.slug}`);
      expect(row.canonical_url).toBe(`https://fermatmind.com/zh/articles/${row.slug}`);
      expect(row.publish_state).toMatchObject(manifest.required_default_publish_state);
      expect(row.gates).toMatchObject({
        human_method_review_required: true,
        human_claim_review_required: true,
        cms_dry_run_required: true,
        cms_readback_required: true,
        private_url_guard_required: true,
        production_publish_allowed_in_this_pr: false,
        sitemap_llms_activation_allowed_in_this_pr: false,
      });
      for (const sourceFile of Object.values(row.source_files)) {
        expect(fs.existsSync(path.join(ROOT, sourceFile)), sourceFile).toBe(true);
      }
    }
  });

  it("maps the pages to IQ topic and landing/page_blocks authority without frontend fallback", () => {
    const topic = readJson<{
      target_topic: { route: string; cms_resource_type: string };
      required_display_policy: {
        split_mixed_group: boolean;
        iq_group_label: string;
        eq_group_label: string;
        do_not_render_single_mixed_label: string;
        frontend_hardcode_allowed: boolean;
      };
      entry_groups: Array<{ group_key: string; label: string; items: Array<{ slug: string; href: string; is_public: boolean; is_indexable: boolean }> }>;
    }>(`${DRY_RUN_DIR}/topic_iq_articles_mapping.json`);
    const landing = readJson<{
      target_landing_surface: { route: string; related_test_slug: string; cms_resource_type: string };
      proposed_page_blocks: Array<{ block_type: string; items: Array<{ slug: string; href: string }> }>;
      guardrails: Record<string, boolean>;
    }>(`${DRY_RUN_DIR}/landing_page_blocks_mapping.json`);

    expect(topic.target_topic).toMatchObject({
      route: "/zh/topics/iq-eq",
      cms_resource_type: "Topic",
    });
    expect(topic.required_display_policy).toMatchObject({
      split_mixed_group: true,
      iq_group_label: "IQ 文章",
      eq_group_label: "EQ 文章",
      do_not_render_single_mixed_label: "IQ / EQ 文章",
      frontend_hardcode_allowed: false,
    });
    const iqGroup = topic.entry_groups.find((group) => group.group_key === "iq_articles");
    expect(iqGroup?.items.map((item) => item.slug)).toEqual(EXPECTED_SLUGS);
    expect(iqGroup?.items.every((item) => item.href === `/zh/articles/${item.slug}`)).toBe(true);
    expect(iqGroup?.items.every((item) => item.is_public === false && item.is_indexable === false)).toBe(true);

    expect(landing.target_landing_surface).toMatchObject({
      route: "/zh/tests/iq-test-intelligence-quotient-assessment",
      related_test_slug: "iq-test-intelligence-quotient-assessment",
      cms_resource_type: "landing_surfaces/page_blocks",
    });
    expect(landing.guardrails).toMatchObject({
      frontend_hardcode_allowed: false,
      private_flow_links_allowed: false,
      result_or_order_links_allowed: false,
      publish_or_indexing_change_allowed_in_this_pr: false,
    });
    expect(landing.proposed_page_blocks[0]?.block_type).toBe("article_link_cluster");
    expect(landing.proposed_page_blocks[0]?.items.map((item) => item.slug)).toEqual(EXPECTED_SLUGS);
  });

  it("keeps SEO/GEO activation blocked until a later publish and activation PR", () => {
    const seoGate = readJson<{
      status: string;
      default_gate: {
        is_public: boolean;
        is_indexable: boolean;
        robots: string;
        sitemap_eligible: boolean;
        llms_eligible: boolean;
      };
      sitemap_llms_policy: {
        current_pr_activation_allowed: boolean;
        activation_pr_required: string;
        before_activation_requirements: string[];
      };
      pages: Array<{ slug: string; sitemap_eligible: boolean; llms_eligible: boolean; robots: string }>;
    }>(`${DRY_RUN_DIR}/seo_geo_gate.json`);
    const report = readJson<{
      status: string;
      summary: Record<string, boolean | number>;
      pass_fail: Record<string, boolean>;
    }>(`${DRY_RUN_DIR}/dry_run_report.json`);

    expect(seoGate.status).toBe("hold_noindex_until_human_and_cms_readback_pass");
    expect(seoGate.default_gate).toMatchObject({
      is_public: false,
      is_indexable: false,
      robots: "noindex,follow",
      sitemap_eligible: false,
      llms_eligible: false,
    });
    expect(seoGate.sitemap_llms_policy).toMatchObject({
      current_pr_activation_allowed: false,
      activation_pr_required: "IQ-METHOD-PAGES-ZH-CN-SEO-GEO-ACTIVATE-01",
    });
    expect(seoGate.sitemap_llms_policy.before_activation_requirements).toContain("private URL and scoring-secret guard passes");
    expect(seoGate.pages.map((page) => page.slug)).toEqual(EXPECTED_SLUGS);
    expect(seoGate.pages.every((page) => page.robots === "noindex,follow" && page.sitemap_eligible === false && page.llms_eligible === false)).toBe(true);

    expect(report.status).toBe("prepared_not_imported");
    expect(report.summary).toMatchObject({
      article_count: 7,
      cms_write_attempted: false,
      production_import_attempted: false,
      publish_attempted: false,
      sitemap_llms_activation_attempted: false,
    });
    expect(Object.values(report.pass_fail).every(Boolean)).toBe(true);
  });

  it("summarizes clean claim scans and readback guards without private flow leakage", () => {
    const claim = readJson<{
      status: string;
      gate_result: string;
      pages: Array<{ slug: string; forbidden_terms_found: string[]; human_review_required: boolean }>;
      global_forbidden_public_claims: string[];
    }>(`${DRY_RUN_DIR}/claim_audit_summary.json`);
    const index = readJson<{
      cms_dry_run?: {
        pr_id: string;
        status: string;
        cms_write_attempted: boolean;
        production_import_attempted: boolean;
        publish_attempted: boolean;
        sitemap_llms_activation_attempted: boolean;
        frontend_runtime_change_attempted: boolean;
        files: string[];
      };
    }>(`${PACKAGE_DIR}/PR_TRAIN_INDEX.json`);
    const readback = read(`${DRY_RUN_DIR}/readback_checklist.md`);
    const manifest = readJson<{ article_imports: Array<{ route: string; canonical_url: string }> }>(`${DRY_RUN_DIR}/cms_import_manifest.json`);
    const topic = readJson<{ entry_groups: Array<{ items: Array<{ href: string }> }> }>(`${DRY_RUN_DIR}/topic_iq_articles_mapping.json`);
    const landing = readJson<{ proposed_page_blocks: Array<{ items: Array<{ href: string }> }> }>(`${DRY_RUN_DIR}/landing_page_blocks_mapping.json`);
    const actualUrls = [
      ...manifest.article_imports.flatMap((row) => [row.route, row.canonical_url]),
      ...topic.entry_groups.flatMap((group) => group.items.map((item) => item.href)),
      ...landing.proposed_page_blocks.flatMap((block) => block.items.map((item) => item.href)),
    ];

    expect(claim.status).toBe("automated_text_scan_passed_human_review_required");
    expect(claim.gate_result).toBe("pass_with_human_review_required");
    expect(claim.pages.map((page) => page.slug)).toEqual(EXPECTED_SLUGS);
    expect(claim.pages.every((page) => page.forbidden_terms_found.length === 0 && page.human_review_required === true)).toBe(true);
    expect(claim.global_forbidden_public_claims).toContain("answer keys, correct answers, item rules, scoring formulas, private result/order/payment/recovery links");

    expect(index.cms_dry_run).toMatchObject({
      pr_id: PR_ID,
      status: "prepared_not_imported",
      cms_write_attempted: false,
      production_import_attempted: false,
      publish_attempted: false,
      sitemap_llms_activation_attempted: false,
      frontend_runtime_change_attempted: false,
    });
    expect(index.cms_dry_run?.files).toContain(`${DRY_RUN_DIR}/cms_import_manifest.json`);

    for (const value of actualUrls) {
      for (const pattern of PRIVATE_FLOW_PATTERNS) {
        expect(value).not.toMatch(pattern);
      }
    }
    expect(readback).toContain("status 为 draft_review_only");
    expect(readback).toContain("进入单独 SEO/GEO activation PR 后才允许 sitemap/llms eligibility");
  });
});
