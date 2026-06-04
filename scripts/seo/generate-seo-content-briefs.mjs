#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "seo_content_briefs.v1";
const SCOPE = "SEO-BRIEF-01";
const DEFAULT_GENERATED_AT = "offline-reproducible";
const DEFAULT_CONTRACT = "docs/seo/generated/seo-content-brief-generator.v1.json";
const DEFAULT_ISSUE_QUEUE = "docs/seo/generated/seo-issue-queue.v1.json";
const DEFAULT_COMPETITOR_INVENTORY = "docs/seo/generated/competitor-url-inventory-generator.v1.json";
const DEFAULT_URL_INVENTORY = "docs/seo/generated/url-inventory.v1.json";
const DEFAULT_INTERNAL_LINK_GRAPH = "docs/seo/generated/internal-link-graph.v1.json";
const PRIVATE_PATH_PATTERN = /(?:^|\/)(account|auth|checkout|order|orders|payment|pay|result|results|share|token|login|signup|admin)(?:\/|$)/i;

function parseArgs(argv) {
  const args = {
    contract: DEFAULT_CONTRACT,
    issueQueue: DEFAULT_ISSUE_QUEUE,
    competitorInventory: DEFAULT_COMPETITOR_INVENTORY,
    urlInventory: DEFAULT_URL_INVENTORY,
    internalLinkGraph: DEFAULT_INTERNAL_LINK_GRAPH,
    output: "",
    markdown: "",
    pretty: false,
    maxBriefs: 4,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--contract=")) {
      args.contract = arg.slice("--contract=".length);
    } else if (arg === "--contract") {
      args.contract = argv[++index] || args.contract;
    } else if (arg.startsWith("--issue-queue=")) {
      args.issueQueue = arg.slice("--issue-queue=".length);
    } else if (arg === "--issue-queue") {
      args.issueQueue = argv[++index] || args.issueQueue;
    } else if (arg.startsWith("--competitor-inventory=")) {
      args.competitorInventory = arg.slice("--competitor-inventory=".length);
    } else if (arg === "--competitor-inventory") {
      args.competitorInventory = argv[++index] || args.competitorInventory;
    } else if (arg.startsWith("--url-inventory=")) {
      args.urlInventory = arg.slice("--url-inventory=".length);
    } else if (arg === "--url-inventory") {
      args.urlInventory = argv[++index] || args.urlInventory;
    } else if (arg.startsWith("--internal-link-graph=")) {
      args.internalLinkGraph = arg.slice("--internal-link-graph=".length);
    } else if (arg === "--internal-link-graph") {
      args.internalLinkGraph = argv[++index] || args.internalLinkGraph;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--markdown=")) {
      args.markdown = arg.slice("--markdown=".length);
    } else if (arg === "--markdown") {
      args.markdown = argv[++index] || "";
    } else if (arg.startsWith("--max-briefs=")) {
      args.maxBriefs = Number(arg.slice("--max-briefs=".length));
    } else if (arg === "--max-briefs") {
      args.maxBriefs = Number(argv[++index] || args.maxBriefs);
    }
  }

  if (!Number.isFinite(args.maxBriefs) || args.maxBriefs <= 0) {
    throw new Error("--max-briefs must be a positive number");
  }

  return args;
}

function resolvePath(value) {
  return path.resolve(ROOT, value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(resolvePath(filePath), "utf8"));
}

function stableId(parts) {
  const digest = crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
  return `seo_brief_${digest}`;
}

function safeUrlPath(value) {
  try {
    const parsed = new URL(String(value || ""), "https://fermatmind.com");
    return PRIVATE_PATH_PATTERN.test(parsed.pathname) ? "" : parsed.pathname || "/";
  } catch {
    return "";
  }
}

function slugFromText(value) {
  return String(value || "seo")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "seo";
}

function normalizeLocale(locale) {
  return ["en", "zh"].includes(locale) ? locale : "en";
}

function pageFamilyFromIssue(issue) {
  const map = {
    article: "article",
    topic: "topic",
    test_detail: "test_detail",
    career_job: "career_job",
    landing_page: "article",
  };
  return map[issue.page_entity_type] || "article";
}

function pageFamilyFromCompetitor(record) {
  const map = {
    test_detail: "test_detail",
    career_guide: "career_guide",
    career_job: "career_job",
    career_job_detail: "career_job",
    career_guide_detail: "career_guide",
    article_detail: "article",
    topic_detail: "topic",
    help_detail: "support",
    tool: "tool",
  };
  return map[record?.target_route_family] || map[record?.url_family] || "";
}

function keywordFromIssue(issue, competitorRecord) {
  if (competitorRecord?.url_family === "career_guide") return "career interest test content gap";
  if (competitorRecord?.url_family === "test_detail") return "personality test comparison";
  if (issue.issue_type === "tracking_gap") return `${issue.entity_id_or_slug} conversion tracking review`;
  if (issue.issue_type === "noindex_public_mismatch") return `${issue.entity_id_or_slug} indexability review`;
  if (issue.issue_type === "missing_from_sitemap") return `${issue.entity_id_or_slug} sitemap inclusion review`;
  if (issue.issue_type === "llms_exposure_gap") return `${issue.entity_id_or_slug} discoverability review`;
  return `${issue.entity_id_or_slug || "seo"} brief review`;
}

function intentForFamily(family, issueType) {
  if (family === "career_guide" || family === "career_job") return "career_exploration";
  if (family === "test_detail") return "pre_test_education";
  if (issueType === "tracking_gap") return "post_test_guidance";
  if (family === "support") return "support";
  return "informational";
}

function schemaHintsForFamily(family) {
  if (family === "test_detail") return ["WebPage", "SoftwareApplication", "BreadcrumbList"];
  if (family === "career_guide" || family === "career_job") return ["Article", "BreadcrumbList"];
  if (family === "support") return ["FAQPage", "BreadcrumbList"];
  return ["Article", "BreadcrumbList"];
}

function riskFlagsForBrief({ family, keyword, locale }) {
  const flags = new Set(["cms_authority_required"]);
  if (locale === "unknown") flags.add("locale_parity_required");
  if (/personality|mbti|riasec|career interest|test/i.test(`${family} ${keyword}`)) {
    flags.add("psychology_or_assessment_boundary");
  }
  if (/iq|ability|intelligence/i.test(keyword)) {
    flags.add("ability_or_iq_sensitive");
  }
  return [...flags].sort();
}

function manualSerpSamples() {
  return [
    {
      sample_id: "manual_mock_test_detail_en",
      locale: "en",
      target_page_family: "test_detail",
      result_themes: ["plain-language test overview", "method boundary", "result interpretation limits"],
      schema_signals: ["WebPage", "BreadcrumbList"],
    },
    {
      sample_id: "manual_mock_career_guide_en",
      locale: "en",
      target_page_family: "career_guide",
      result_themes: ["career decision support", "interest versus skill framing", "next-step checklist"],
      schema_signals: ["Article", "BreadcrumbList"],
    },
    {
      sample_id: "manual_mock_article_en",
      locale: "en",
      target_page_family: "article",
      result_themes: ["definition and context", "safe usage boundary", "related internal navigation"],
      schema_signals: ["Article", "BreadcrumbList"],
    },
  ];
}

function findManualSerpSample({ family, locale }) {
  const samples = manualSerpSamples();
  return (
    samples.find((sample) => sample.target_page_family === family && sample.locale === locale) ||
    samples.find((sample) => sample.target_page_family === family) ||
    samples.find((sample) => sample.target_page_family === "article")
  );
}

function buildInternalLinkSuggestions({ family, locale, urlInventory, internalLinkGraph }) {
  const graphRows = Array.isArray(internalLinkGraph.rows) ? internalLinkGraph.rows : [];
  const graphSuggestions = graphRows
    .filter((row) => normalizeLocale(row.locale) === locale || !row.locale)
    .slice(0, 2)
    .map((row) => ({
      target_path: safeUrlPath(row.target_url || row.url),
      reason: "Read-only internal-link graph candidate.",
      source: "internal_link_graph",
    }))
    .filter((entry) => entry.target_path);

  if (graphSuggestions.length > 0) return graphSuggestions;

  const routePreferences = family === "career_guide" || family === "career_job"
    ? ["career_hub", "career_guides_hub", "test_detail"]
    : family === "test_detail"
      ? ["tests_hub", "test_category", "topic_detail"]
      : ["articles_hub", "topics_hub", "test_detail"];

  const rows = Array.isArray(urlInventory.rows) ? urlInventory.rows : [];
  return rows
    .filter((row) => row.inSitemap && normalizeLocale(row.locale) === locale && routePreferences.includes(row.routeFamily))
    .slice(0, 2)
    .map((row) => ({
      target_path: safeUrlPath(row.url),
      reason: "Fallback read-only URL Truth candidate; internal-link graph had no rows.",
      source: "url_truth_fallback",
    }))
    .filter((entry) => entry.target_path);
}

function competitorByIssue(issue, competitorInventory) {
  const records = Array.isArray(competitorInventory.records) ? competitorInventory.records : [];
  if (issue.source_signal !== "competitor_url_inventory") return null;
  return records.find((record) => String(issue.evidence_summary || "").includes(record.competitor_domain)) || null;
}

function isBriefCandidate(issue) {
  return ["competitor_gap_candidate", "llms_exposure_gap", "noindex_public_mismatch", "missing_from_sitemap", "tracking_gap"].includes(
    issue.issue_type
  );
}

function issuePriority(issue) {
  const map = {
    competitor_gap_candidate: 0,
    noindex_public_mismatch: 1,
    missing_from_sitemap: 2,
    tracking_gap: 3,
    llms_exposure_gap: 4,
  };
  return map[issue.issue_type] ?? 9;
}

function tableStakesFor({ issue, serpSample }) {
  const stakes = (serpSample?.result_themes || []).map((theme) => `Cover SERP-observed theme: ${theme}.`);
  stakes.push(`Reference source issue ${issue.issue_id} without resolving or mutating it.`);
  stakes.push("State operational and assessment safety boundaries before any CMS handoff.");
  return stakes;
}

function valueAddsFor({ issue, family }) {
  const values = [
    "Connect URL Truth, sitemap, and issue queue evidence in one editorial planning view.",
    "Add locale parity notes before any backend-owned CMS draft path is considered.",
  ];
  if (family === "career_guide" || family === "career_job") {
    values.push("Frame career guidance as decision support rather than a deterministic recommendation.");
  }
  if (issue.source_signal === "competitor_url_inventory") {
    values.push("Use competitor observation as a gap signal only, not as source copy.");
  }
  return values;
}

function buildBriefs({ contract, issueQueue, competitorInventory, urlInventory, internalLinkGraph, maxBriefs }) {
  if (contract.version !== "seo_content_brief_generator.v1") {
    throw new Error(`Unsupported brief contract version: ${contract.version}`);
  }

  const allowedFamilies = new Set(contract.brief_record_schema?.allowed_target_page_families || []);
  const issues = Array.isArray(issueQueue.sample_issues) ? issueQueue.sample_issues : [];
  return issues
    .filter(isBriefCandidate)
    .sort((a, b) => issuePriority(a) - issuePriority(b) || String(a.issue_id).localeCompare(String(b.issue_id)))
    .slice(0, maxBriefs)
    .map((issue) => {
      const competitorRecord = competitorByIssue(issue, competitorInventory);
      const competitorFamily = pageFamilyFromCompetitor(competitorRecord);
      const family = allowedFamilies.has(competitorFamily) ? competitorFamily : pageFamilyFromIssue(issue);
      const locale = normalizeLocale(issue.locale);
      const keyword = keywordFromIssue(issue, competitorRecord);
      const serpSample = findManualSerpSample({ family, locale });
      const briefId = stableId([issue.issue_id, keyword, family, locale]);

      return {
        brief_id: briefId,
        target_keyword: keyword,
        locale,
        intent: intentForFamily(family, issue.issue_type),
        target_page_family: family,
        target_url_or_path: safeUrlPath(issue.canonical_url) || `/ops/seo-briefs/${briefId}`,
        source_issue_ids: [issue.issue_id],
        competitor_source_domains: competitorRecord?.competitor_domain ? [competitorRecord.competitor_domain] : [],
        serp_sample_source: serpSample?.sample_id || "manual_mock_article_en",
        table_stakes: tableStakesFor({ issue, serpSample }),
        value_add_opportunities: valueAddsFor({ issue, family }),
        internal_link_suggestions: buildInternalLinkSuggestions({ family, locale, urlInventory, internalLinkGraph }),
        schema_hints: [...new Set([...(serpSample?.schema_signals || []), ...schemaHintsForFamily(family)])],
        risk_flags: riskFlagsForBrief({ family, keyword, locale }),
        editorial_review_required: true,
        sample_only: true,
      };
    });
}

function riskBoundary() {
  return {
    read_only: true,
    sample_only: true,
    cms_writes: false,
    cms_draft_creation: false,
    publish_actions: false,
    rollback_actions: false,
    revalidation_execution: false,
    search_submission: false,
    sitemap_mutation: false,
    llms_mutation: false,
    live_serp_api: false,
    scraping: false,
    gsc_integration: false,
    baidu_integration: false,
    ga4_integration: false,
    dataforseo_integration: false,
    apify_integration: false,
    production_deploy: false,
    env_reads: false,
    cookie_reads: false,
    token_reads: false,
    final_article_body_generation: false,
  };
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const value = item[field] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function buildArtifact(args) {
  const contract = readJson(args.contract);
  const issueQueue = readJson(args.issueQueue);
  const competitorInventory = readJson(args.competitorInventory);
  const urlInventory = readJson(args.urlInventory);
  const internalLinkGraph = readJson(args.internalLinkGraph);
  const briefs = buildBriefs({
    contract,
    issueQueue,
    competitorInventory,
    urlInventory,
    internalLinkGraph,
    maxBriefs: args.maxBriefs,
  });

  return {
    version: VERSION,
    scope: SCOPE,
    generated_at: DEFAULT_GENERATED_AT,
    run_mode: "offline_sample",
    read_only: true,
    live_data_collected: false,
    network_access_enabled: false,
    source_artifacts: {
      contract: args.contract,
      issue_queue: args.issueQueue,
      competitor_url_inventory: args.competitorInventory,
      url_inventory: args.urlInventory,
      internal_link_graph: args.internalLinkGraph,
      manual_serp_sample: "embedded_sanitized_mock_sample",
      cms_status_sample: "mock_sample_from_issue_queue",
    },
    summary: {
      total_briefs: briefs.length,
      briefs_by_locale: countBy(briefs, "locale"),
      briefs_by_target_page_family: countBy(briefs, "target_page_family"),
      sample_only_briefs: briefs.filter((brief) => brief.sample_only).length,
      editorial_review_required: briefs.filter((brief) => brief.editorial_review_required).length,
    },
    briefs,
    risk_boundary: riskBoundary(),
    deferred_work: [
      "backend brief-to-CMS handoff contract",
      "approval-gated live SERP provider integration",
      "human editorial workflow",
    ],
  };
}

function renderMarkdown(artifact) {
  const lines = [
    "# SEO Content Briefs v1",
    "",
    `Scope: ${artifact.scope}`,
    `Run mode: ${artifact.run_mode}`,
    `Read only: ${artifact.read_only}`,
    `Sample only: ${artifact.risk_boundary.sample_only}`,
    "",
    "This markdown is an advisory brief outline export. It is not publishable article copy, CMS payload, FAQ, CTA, or search automation.",
    "",
  ];

  for (const brief of artifact.briefs) {
    lines.push(`## ${brief.brief_id}`);
    lines.push("");
    lines.push(`- Target keyword: ${brief.target_keyword}`);
    lines.push(`- Locale: ${brief.locale}`);
    lines.push(`- Intent: ${brief.intent}`);
    lines.push(`- Target page family: ${brief.target_page_family}`);
    lines.push(`- Source issues: ${brief.source_issue_ids.join(", ")}`);
    lines.push(`- SERP sample source: ${brief.serp_sample_source}`);
    lines.push(`- Editorial review required: ${brief.editorial_review_required}`);
    lines.push("");
    lines.push("### Table Stakes");
    for (const item of brief.table_stakes) lines.push(`- ${item}`);
    lines.push("");
    lines.push("### Value-Add Opportunities");
    for (const item of brief.value_add_opportunities) lines.push(`- ${item}`);
    lines.push("");
    lines.push("### Internal Link Suggestions");
    if (brief.internal_link_suggestions.length === 0) {
      lines.push("- No read-only internal link candidate available in current artifacts.");
    } else {
      for (const item of brief.internal_link_suggestions) lines.push(`- ${item.target_path} (${item.source}): ${item.reason}`);
    }
    lines.push("");
    lines.push(`Risk flags: ${brief.risk_flags.join(", ")}`);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildArtifact(args);
  const json = JSON.stringify(artifact, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(resolvePath(args.output)), { recursive: true });
    fs.writeFileSync(resolvePath(args.output), `${json}\n`);
  }

  if (args.markdown) {
    fs.mkdirSync(path.dirname(resolvePath(args.markdown)), { recursive: true });
    fs.writeFileSync(resolvePath(args.markdown), renderMarkdown(artifact));
  }

  process.stdout.write(`${json}\n`);
}

try {
  main();
} catch (error) {
  console.error(`[seo-content-briefs] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
