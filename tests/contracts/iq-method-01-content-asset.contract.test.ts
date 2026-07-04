import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isIqMethod01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PACKAGE_DIR = "generated/iq-method-pages-zh-cn-v0.2";
const PAGE_DIR = `${PACKAGE_DIR}/pages/01-what-is-iq-style-reasoning-test`;
const SLUG = "what-is-iq-style-reasoning-test";
const CANONICAL = `https://fermatmind.com/zh/articles/${SLUG}`;
const TEST_PATH = "/zh/tests/iq-test-intelligence-quotient-assessment";

const REQUIRED_PAGE_FILES = [
  "article.md",
  "article.cms.json",
  "seo.json",
  "answer_surface_v1.json",
  "landing_surface_v1.json",
  "faq.json",
  "geo_answer_block.json",
  "claim_audit.json",
  "internal_links.json",
  "media_brief.json",
  "qa_checklist.md",
];

const FORBIDDEN_PUBLISHABLE_PATTERNS = [
  /\bIQ score\b/i,
  /\bIQ estimate\b/i,
  /\bpercentile\b/i,
  /population percentile/i,
  /百分位/,
  /真实智商/,
  /官方\s*IQ/i,
  /认证\s*IQ/i,
  /智商证书/,
  /\bMensa\b/i,
  /临床诊断/,
  /诊断级/,
  /薪资预测/,
  /固定智力/,
];

const PRIVATE_FLOW_PATTERNS = [
  /\/take(?:\/|$|\?)/i,
  /\/results?(?:\/|$|\?)/i,
  /\/orders?(?:\/|$|\?)/i,
  /\/pay(?:\/|$|\?)/i,
  /\/share(?:\/|$|\?)/i,
  /\/history(?:\/|$|\?)/i,
  /access[_-]?token/i,
  /answer_key/i,
  /correct_answer/i,
];

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
  const files = [
    ...(committed ? committed.split("\n") : []),
    ...(staged ? staged.split("\n") : []),
  ];
  return Array.from(new Set(files)).filter(Boolean);
}

describe("IQ-METHOD-01 content asset package", () => {
  it("keeps the PR diff inside the approved content-asset scope", () => {
    const files = changedFiles();

    if (files.length === 0 && process.env.GITHUB_ACTIONS === "true") {
      return;
    }

    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isIqMethod01AllowedFile), files.join("\n")).toBe(true);
  });

  it("includes exactly the definition page artifacts for this PR", () => {
    for (const file of [
      `${PACKAGE_DIR}/README.md`,
      `${PACKAGE_DIR}/GLOBAL_CLAIM_POLICY.md`,
      `${PACKAGE_DIR}/GLOBAL_SEO_GEO_STANDARD.md`,
      `${PACKAGE_DIR}/DUPLICATE_CANNIBALIZATION_MAP.md`,
      `${PACKAGE_DIR}/PR_TRAIN_INDEX.json`,
      ...REQUIRED_PAGE_FILES.map((file) => `${PAGE_DIR}/${file}`),
    ]) {
      expect(fs.existsSync(path.join(ROOT, file)), file).toBe(true);
    }

    const index = readJson<{
      status: string;
      current_pr: string;
      included_pages: string[];
      planned_pages: Array<{ pr_id: string; slug: string }>;
      publish_gate: Record<string, unknown>;
    }>(`${PACKAGE_DIR}/PR_TRAIN_INDEX.json`);

    expect(index.status).toBe("draft_review_only");
    expect(index.current_pr).toBe("IQ-METHOD-01");
    expect(index.included_pages).toEqual([SLUG]);
    expect(index.planned_pages).toHaveLength(7);
    expect(index.publish_gate).toMatchObject({
      cms_write_attempted: false,
      production_import_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_activation_attempted: false,
    });
  });

  it("maps the page to a CMS Article draft without public discoverability", () => {
    const article = readJson<{
      status: string;
      locale: string;
      slug: string;
      title: string;
      content_md: string;
      related_test_slug: string;
      category_suggestion: string;
      is_public: boolean;
      is_indexable: boolean;
      sitemap_eligible: boolean;
      llms_eligible: boolean;
      reviewer_status: string;
      canonical_url: string;
      robots: string;
      schema_json?: { editorial_package_v1?: Record<string, unknown> };
    }>(`${PAGE_DIR}/article.cms.json`);
    const seo = readJson<{
      status: string;
      seo_title: string;
      seo_description: string;
      canonical_url: string;
      robots: string;
      sitemap_eligible: boolean;
      llms_eligible: boolean;
      structured_data_candidates: string[];
      structured_data_forbidden: string[];
    }>(`${PAGE_DIR}/seo.json`);

    expect(article).toMatchObject({
      status: "draft_review_only",
      locale: "zh-CN",
      slug: SLUG,
      title: "什么是 IQ 风格推理测试？",
      related_test_slug: "iq-test-intelligence-quotient-assessment",
      category_suggestion: "测评方法与边界",
      is_public: false,
      is_indexable: false,
      sitemap_eligible: false,
      llms_eligible: false,
      reviewer_status: "method_and_claim_review_required",
      canonical_url: CANONICAL,
      robots: "noindex,follow",
    });
    expect(article.content_md.trim()).toBe(read(`${PAGE_DIR}/article.md`).trim());
    expect(article.schema_json?.editorial_package_v1).toMatchObject({
      content_authority_note: "CMS/backend authoritative; frontend fallback forbidden",
      review_required_before_publish: true,
    });
    expect(seo).toMatchObject({
      status: "draft_review_only",
      canonical_url: CANONICAL,
      robots: "noindex,follow",
      sitemap_eligible: false,
      llms_eligible: false,
    });
    expect(seo.seo_title).toContain("IQ 风格推理测试");
    expect(seo.seo_description).toContain("非官方、非临床、非认证");
    expect(seo.structured_data_candidates).toEqual(["Article", "BreadcrumbList", "FAQPage"]);
    expect(seo.structured_data_forbidden).toEqual(
      expect.arrayContaining(["Product", "SoftwareApplication", "Certificate", "Course", "MedicalWebPage"]),
    );
  });

  it("keeps the article body answer-first, visible, and free of H1 duplication", () => {
    const article = read(`${PAGE_DIR}/article.md`);

    expect(article.startsWith("#")).toBe(false);
    expect(article).toContain("IQ 风格推理测试是一类用图形、矩阵和规律补全任务观察推理表现的在线测试。");
    expect(article).toContain("FermatMind IQ V1 使用原创 30 题，约 20 分钟");
    expect(article).toContain("## 这是什么 / 这不是什么");
    expect(article).toContain("## 可以理解什么");
    expect(article).toContain("## 不能据此推断什么");
    expect(article).toContain("## FAQ");
  });

  it("keeps GEO, FAQ, and internal links aligned to the definition-page intent", () => {
    const answer = readJson<{
      status: string;
      quick_answer: string;
      definition_or_scope: string;
      boundary_caveat: string;
      facts: string[];
      faq_items: Array<{ question: string; answer: string }>;
      related_links: Array<{ label: string; href: string }>;
    }>(`${PAGE_DIR}/answer_surface_v1.json`);
    const faq = readJson<{ status: string; items: Array<{ question: string; answer: string }> }>(`${PAGE_DIR}/faq.json`);
    const internalLinks = readJson<{
      links_out: Array<{ label: string; href: string }>;
      private_flow_guard: { status: string };
    }>(`${PAGE_DIR}/internal_links.json`);

    expect(answer.status).toBe("draft_review_only");
    expect(answer.quick_answer).toContain("原创 30 题");
    expect(answer.definition_or_scope).toContain("图形、矩阵、规律变化和空间关系判断");
    expect(answer.boundary_caveat).toContain("非官方、非临床、非认证");
    expect(answer.facts).toEqual(expect.arrayContaining([
      "FermatMind IQ V1 为原创 30 题。",
      "预计完成时间约 20 分钟。",
    ]));
    expect(faq).toMatchObject({ status: "draft_review_only" });
    expect(faq.items).toHaveLength(4);
    expect(internalLinks.private_flow_guard.status).toBe("passed_planning_check");
    expect(internalLinks.links_out.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        TEST_PATH,
        "/zh/articles/online-iq-test-vs-professional-assessment",
        "/zh/articles/iq-test-score-meaning-boundary",
      ]),
    );
  });

  it("passes claim and private-flow guards for publishable page assets", () => {
    const publishableFiles = [
      "article.md",
      "article.cms.json",
      "answer_surface_v1.json",
      "landing_surface_v1.json",
      "faq.json",
      "geo_answer_block.json",
      "internal_links.json",
      "media_brief.json",
    ].map((file) => `${PAGE_DIR}/${file}`);
    const combined = publishableFiles.map(read).join("\n");
    const claimAudit = readJson<{
      status: string;
      page_slug: string;
      forbidden_terms_found: string[];
      human_review_required: boolean;
    }>(`${PAGE_DIR}/claim_audit.json`);

    for (const pattern of FORBIDDEN_PUBLISHABLE_PATTERNS) {
      expect(combined).not.toMatch(pattern);
    }
    for (const pattern of PRIVATE_FLOW_PATTERNS) {
      expect(combined).not.toMatch(pattern);
    }
    expect(claimAudit).toMatchObject({
      status: "draft_review_only",
      page_slug: SLUG,
      forbidden_terms_found: [],
      human_review_required: true,
    });
  });
});
