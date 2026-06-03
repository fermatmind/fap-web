#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "seo_issue_queue_generator.v1";
const CONTRACT_VERSION = "seo_issue_queue.v1";
const DEFAULT_CONTRACT = "docs/seo/generated/seo-issue-queue.v1.json";
const DEFAULT_URL_INVENTORY = "docs/seo/generated/url-inventory.v1.json";
const DEFAULT_COMPETITOR_INVENTORY = "docs/seo/generated/competitor-url-inventory-generator.v1.json";
const DEFAULT_GENERATED_AT = "offline-reproducible";
const PRIVATE_PATH_PATTERN = /(?:^|\/)(account|auth|checkout|order|orders|payment|pay|result|results|share|token|login|signup|admin)(?:\/|$)/i;

function parseArgs(argv) {
  const args = {
    contract: DEFAULT_CONTRACT,
    urlInventory: DEFAULT_URL_INVENTORY,
    competitorInventory: DEFAULT_COMPETITOR_INVENTORY,
    output: "",
    csv: "",
    pretty: false,
    maxUrlTruthIssues: 3,
    maxCompetitorIssues: 2,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--contract=")) {
      args.contract = arg.slice("--contract=".length);
    } else if (arg === "--contract") {
      args.contract = argv[++index] || args.contract;
    } else if (arg.startsWith("--url-inventory=")) {
      args.urlInventory = arg.slice("--url-inventory=".length);
    } else if (arg === "--url-inventory") {
      args.urlInventory = argv[++index] || args.urlInventory;
    } else if (arg.startsWith("--competitor-inventory=")) {
      args.competitorInventory = arg.slice("--competitor-inventory=".length);
    } else if (arg === "--competitor-inventory") {
      args.competitorInventory = argv[++index] || args.competitorInventory;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || "";
    } else if (arg.startsWith("--max-url-truth-issues=")) {
      args.maxUrlTruthIssues = Number(arg.slice("--max-url-truth-issues=".length));
    } else if (arg === "--max-url-truth-issues") {
      args.maxUrlTruthIssues = Number(argv[++index] || args.maxUrlTruthIssues);
    } else if (arg.startsWith("--max-competitor-issues=")) {
      args.maxCompetitorIssues = Number(arg.slice("--max-competitor-issues=".length));
    } else if (arg === "--max-competitor-issues") {
      args.maxCompetitorIssues = Number(argv[++index] || args.maxCompetitorIssues);
    }
  }

  for (const [name, value] of [
    ["--max-url-truth-issues", args.maxUrlTruthIssues],
    ["--max-competitor-issues", args.maxCompetitorIssues],
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative number`);
    }
  }

  return args;
}

function resolvePath(value) {
  return path.resolve(ROOT, value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(resolvePath(filePath), "utf8"));
}

function stableIssueId(parts) {
  const digest = crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
  return `seo_issue_${digest}`;
}

function entityTypeForRouteFamily(routeFamily) {
  const map = {
    home: "home",
    tests_hub: "test_hub",
    test_category: "test_hub",
    test_detail: "test_detail",
    article_detail: "article",
    articles_hub: "landing_page",
    topic_detail: "topic",
    topics_hub: "landing_page",
    personality_detail: "personality",
    personality_hub: "landing_page",
    career_job_detail: "career_job",
    career_guide_detail: "career_job",
    career_hub: "landing_page",
    career_guides_hub: "landing_page",
    help_detail: "landing_page",
    static_legal_help: "landing_page",
  };
  return map[routeFamily] || "landing_page";
}

function slugFromUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "home";
  } catch {
    return "unknown";
  }
}

function normalizeLocale(locale) {
  return ["zh", "en"].includes(locale) ? locale : "unknown";
}

function baseIssue({ canonicalUrl, locale, pageEntityType, entityIdOrSlug, sourceSignal, issueType, severity, status, evidenceSummary, recommendationSummary, ownerRole, releaseEvidenceId = null }) {
  return {
    issue_id: stableIssueId([canonicalUrl, locale, issueType, sourceSignal]),
    canonical_url: canonicalUrl,
    locale,
    page_entity_type: pageEntityType,
    entity_id_or_slug: entityIdOrSlug,
    source_signal: sourceSignal,
    issue_type: issueType,
    severity,
    status,
    detected_at: DEFAULT_GENERATED_AT,
    last_seen_at: DEFAULT_GENERATED_AT,
    evidence_summary: evidenceSummary,
    recommendation_summary: recommendationSummary,
    owner_role: ownerRole,
    cms_resource_link: null,
    release_evidence_id: releaseEvidenceId,
    suppression_reason: null,
    risk_boundary: {
      read_only: true,
      sample_only: true,
      cms_write_allowed: false,
      publish_allowed: false,
      search_submission_allowed: false,
      content_generation_allowed: false,
    },
    sample_only: true,
  };
}

function buildUrlTruthIssues(urlInventory, limit) {
  const rows = Array.isArray(urlInventory.rows) ? urlInventory.rows : [];
  return rows
    .filter((row) => row.inSitemap && row.expectedLlmsState === "not_exposed")
    .slice(0, limit)
    .map((row) =>
      baseIssue({
        canonicalUrl: row.url,
        locale: normalizeLocale(row.locale),
        pageEntityType: entityTypeForRouteFamily(row.routeFamily),
        entityIdOrSlug: slugFromUrl(row.url),
        sourceSignal: "url_truth",
        issueType: "llms_exposure_gap",
        severity: "info",
        status: "open",
        evidenceSummary: `URL truth row is sitemap-visible while expected llms state is ${row.expectedLlmsState}.`,
        recommendationSummary: "Review whether this URL family should remain excluded from llms surfaces; do not mutate sitemap or llms from this queue.",
        ownerRole: "seo_operator",
      })
    );
}

function buildCompetitorIssues(competitorInventory, limit) {
  const records = Array.isArray(competitorInventory.records) ? competitorInventory.records : [];
  return records
    .filter((record) => record.eligible_for_opportunity && record.status !== "excluded_private_target")
    .slice(0, limit)
    .map((record) =>
      baseIssue({
        canonicalUrl: `https://fermatmind.com/ops/seo-opportunities/${record.target_route_family || "unknown"}`,
        locale: normalizeLocale(record.locale),
        pageEntityType: record.target_route_family === "test_detail" ? "test_detail" : "landing_page",
        entityIdOrSlug: `${record.competitor_domain}:${slugFromUrl(record.normalized_url)}`,
        sourceSignal: "competitor_url_inventory",
        issueType: "competitor_gap_candidate",
        severity: "low",
        status: "open",
        evidenceSummary: `Competitor sample ${record.competitor_domain} has ${record.url_family} URL ${record.normalized_url}.`,
        recommendationSummary: "Treat as a research candidate only; do not generate CMS drafts or content from this queue.",
        ownerRole: "seo_operator",
      })
    );
}

function sampleSignalIssues() {
  return [
    baseIssue({
      canonicalUrl: "https://fermatmind.com/en/articles/sample-draft-public-check",
      locale: "en",
      pageEntityType: "article",
      entityIdOrSlug: "sample-draft-public-check",
      sourceSignal: "cms_draft",
      issueType: "draft_public_leak",
      severity: "high",
      status: "open",
      evidenceSummary: "Mock CMS draft absence check represents a draft URL that must stay absent from public API, sitemap, and llms.",
      recommendationSummary: "Verify draft fail-closed behavior in CMS/API before publication; queue cannot publish or unpublish.",
      ownerRole: "cms_editor",
      releaseEvidenceId: "mock_release_evidence_draft_absence",
    }),
    baseIssue({
      canonicalUrl: "https://fermatmind.com/zh/articles/sample-post-publish-smoke",
      locale: "zh",
      pageEntityType: "article",
      entityIdOrSlug: "sample-post-publish-smoke",
      sourceSignal: "cms_release",
      issueType: "post_publish_smoke_failure",
      severity: "medium",
      status: "open",
      evidenceSummary: "Mock release checklist smoke signal indicates rendered preview, revalidate, or public absence evidence needs review.",
      recommendationSummary: "Route to release operator for checklist review; queue must not run revalidation or submit search URLs.",
      ownerRole: "release_operator",
      releaseEvidenceId: "mock_release_evidence_post_publish_smoke",
    }),
    baseIssue({
      canonicalUrl: "https://fermatmind.com/en/tests/personality-test",
      locale: "en",
      pageEntityType: "test_detail",
      entityIdOrSlug: "personality-test",
      sourceSignal: "gsc",
      issueType: "noindex_public_mismatch",
      severity: "medium",
      status: "open",
      evidenceSummary: "Mock GSC sample shows an indexability mismatch for a public test detail URL.",
      recommendationSummary: "Compare GSC observation with backend URL truth; do not treat GSC as content authority.",
      ownerRole: "seo_operator",
    }),
    baseIssue({
      canonicalUrl: "https://fermatmind.com/zh/tests/mbti-personality-test",
      locale: "zh",
      pageEntityType: "test_detail",
      entityIdOrSlug: "mbti-personality-test",
      sourceSignal: "baidu",
      issueType: "missing_from_sitemap",
      severity: "low",
      status: "open",
      evidenceSummary: "Mock Baidu sample represents a public URL that needs channel-specific inclusion review.",
      recommendationSummary: "Use URL truth and sitemap policy before any search-channel action; queue cannot submit URLs.",
      ownerRole: "seo_operator",
    }),
    baseIssue({
      canonicalUrl: "https://fermatmind.com/en/articles/sample-tracking-gap",
      locale: "en",
      pageEntityType: "article",
      entityIdOrSlug: "sample-tracking-gap",
      sourceSignal: "ga4",
      issueType: "tracking_gap",
      severity: "info",
      status: "open",
      evidenceSummary: "Mock GA4 sample indicates article CTA traffic lacks expected article_to_test_click continuity.",
      recommendationSummary: "Review tracking instrumentation only after consent boundaries remain intact; queue cannot infer purchase truth.",
      ownerRole: "analytics_operator",
    }),
  ];
}

function sanitizeIssues(issues) {
  const seen = new Set();
  return issues
    .filter((issue) => {
      try {
        return !PRIVATE_PATH_PATTERN.test(new URL(issue.canonical_url).pathname);
      } catch {
        return false;
      }
    })
    .filter((issue) => {
      const key = [issue.canonical_url, issue.locale, issue.issue_type, issue.source_signal].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const value = item[field] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function toCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(contract, issues) {
  const headers = contract.fields?.csv_export_fields || [
    "issue_id",
    "canonical_url",
    "locale",
    "page_entity_type",
    "entity_id_or_slug",
    "source_signal",
    "issue_type",
    "severity",
    "status",
    "detected_at",
    "last_seen_at",
    "owner_role",
    "cms_resource_link",
    "release_evidence_id",
    "suppression_reason",
  ];
  return [headers.join(","), ...issues.map((issue) => headers.map((header) => toCsvValue(issue[header])).join(","))].join("\n");
}

function riskBoundary() {
  return {
    read_only: true,
    cms_writes: false,
    cms_draft_creation: false,
    publish_actions: false,
    revalidation_execution: false,
    search_submission: false,
    sitemap_mutation: false,
    llms_mutation: false,
    auto_content_generation: false,
    gsc_integration: false,
    baidu_integration: false,
    ga4_integration: false,
    dataforseo_integration: false,
    apify_integration: false,
    production_deploy: false,
    env_reads: false,
    cookie_reads: false,
    token_reads: false,
  };
}

function buildQueue(args) {
  const contract = readJson(args.contract);
  if (contract.version !== CONTRACT_VERSION) {
    throw new Error(`Unsupported issue queue contract version: ${contract.version}`);
  }

  const urlInventory = readJson(args.urlInventory);
  const competitorInventory = readJson(args.competitorInventory);
  const issues = sanitizeIssues([
    ...buildUrlTruthIssues(urlInventory, args.maxUrlTruthIssues),
    ...buildCompetitorIssues(competitorInventory, args.maxCompetitorIssues),
    ...sampleSignalIssues(),
  ]);

  return {
    ...contract,
    generated_queue: {
      version: VERSION,
      scope: "SEO-ISSUE-QUEUE-01",
      generated_at: DEFAULT_GENERATED_AT,
      run_mode: "offline_sample",
      read_only: true,
      live_data_collected: false,
      network_access_enabled: false,
      sources: {
        issue_queue_contract: args.contract,
        url_inventory: args.urlInventory,
        competitor_url_inventory: args.competitorInventory,
        cms_release: "mock_sample",
        cms_draft: "mock_sample",
        gsc: "mock_sample",
        baidu: "mock_sample",
        ga4: "mock_sample",
      },
      summary: {
        total_issues: issues.length,
        issues_by_source_signal: countBy(issues, "source_signal"),
        issues_by_type: countBy(issues, "issue_type"),
        issues_by_severity: countBy(issues, "severity"),
        issues_by_status: countBy(issues, "status"),
        sample_only_issues: issues.filter((issue) => issue.sample_only).length,
      },
      risk_boundary: riskBoundary(),
      deferred_integrations: ["seo_intel_db", "cms_api", "gsc_api", "baidu_api", "ga4_api", "dashboard_adapter"],
    },
    sample_issues: issues,
    recommended_follow_up: "SEO-ISSUE-QUEUE-02 wire read-only dashboard adapter after explicit authorization",
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const queue = buildQueue(args);
  const json = JSON.stringify(queue, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(resolvePath(args.output)), { recursive: true });
    fs.writeFileSync(resolvePath(args.output), `${json}\n`);
  }

  if (args.csv) {
    fs.mkdirSync(path.dirname(resolvePath(args.csv)), { recursive: true });
    fs.writeFileSync(resolvePath(args.csv), `${buildCsv(queue, queue.sample_issues)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

try {
  main();
} catch (error) {
  console.error(`[seo-issue-queue] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
