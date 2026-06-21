#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DATE = process.env.AUDIT_DATE || "2026-06-21";
const SITE_ORIGIN = "https://fermatmind.com";
const DEFAULT_PACKAGE_PATH =
  "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json";
const DEFAULT_FRONTEND_CONSUME_PATH = "docs/seo/personality/frontend-seo-consume-2026-06-18.json";
const DEFAULT_INTERNAL_LINK_GRAPH_PATH = "docs/seo/personality/internal-link-graph-2026-06-18.json";
const DEFAULT_MEASUREMENT_COHORT_PATH = "docs/seo/personality/mbti64-seo-measurement-cohort-2026-06-19.json";
const DEFAULT_JSON_OUTPUT = `docs/seo/personality/mbti64-optimized-pilot-reference-pack-${AUDIT_DATE}.json`;
const DEFAULT_MD_OUTPUT = `docs/seo/personality/mbti64-optimized-pilot-reference-pack-${AUDIT_DATE}.md`;

const PILOT_URLS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
];

const PRIVATE_ROUTE_PATTERNS = [
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?results?\b/i,
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?orders?\b/i,
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?pay(?:ment)?\b/i,
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?history\b/i,
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?private\b/i,
  /https?:\/\/fermatmind\.com\/(?:[^/\s"'>]+\/)?account\b/i,
  /href=["']\/(?:[^/"']+\/)?results?\b/i,
  /href=["']\/(?:[^/"']+\/)?orders?\b/i,
  /href=["']\/(?:[^/"']+\/)?pay(?:ment)?\b/i,
  /href=["']\/(?:[^/"']+\/)?history\b/i,
  /href=["']\/(?:[^/"']+\/)?private\b/i,
  /href=["']\/(?:[^/"']+\/)?account\b/i,
  /token=/i,
  /session=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

const TRADEMARK_CLAIM_PATTERNS = [
  /\bofficial\s+MBTI\b/i,
  /\bofficial\s+Myers[-\s]?Briggs\b/i,
  /\bMyers[-\s]?Briggs\s+certified\b/i,
  /\bMBTI\s+certified\b/i,
  /官方\s*MBTI/i,
  /迈尔斯.?布里格斯.?官方/i,
  /官方\s*32\s*型/i,
];

function parseArgs(argv) {
  const args = {
    packagePath: DEFAULT_PACKAGE_PATH,
    frontendConsumePath: DEFAULT_FRONTEND_CONSUME_PATH,
    internalLinkGraphPath: DEFAULT_INTERNAL_LINK_GRAPH_PATH,
    measurementCohortPath: DEFAULT_MEASUREMENT_COHORT_PATH,
    output: DEFAULT_JSON_OUTPUT,
    markdown: DEFAULT_MD_OUTPUT,
    fetchLive: true,
    pretty: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--no-live") args.fetchLive = false;
    else if (arg === "--compact") args.pretty = false;
    else if (arg.startsWith("--package=")) args.packagePath = arg.slice("--package=".length);
    else if (arg === "--package") args.packagePath = argv[++index] || args.packagePath;
    else if (arg.startsWith("--frontend-consume=")) args.frontendConsumePath = arg.slice("--frontend-consume=".length);
    else if (arg === "--frontend-consume") args.frontendConsumePath = argv[++index] || args.frontendConsumePath;
    else if (arg.startsWith("--internal-link-graph=")) args.internalLinkGraphPath = arg.slice("--internal-link-graph=".length);
    else if (arg === "--internal-link-graph") args.internalLinkGraphPath = argv[++index] || args.internalLinkGraphPath;
    else if (arg.startsWith("--measurement-cohort=")) args.measurementCohortPath = arg.slice("--measurement-cohort=".length);
    else if (arg === "--measurement-cohort") args.measurementCohortPath = argv[++index] || args.measurementCohortPath;
    else if (arg.startsWith("--output=")) args.output = arg.slice("--output=".length);
    else if (arg === "--output") args.output = argv[++index] || "";
    else if (arg.startsWith("--markdown=")) args.markdown = arg.slice("--markdown=".length);
    else if (arg === "--markdown") args.markdown = argv[++index] || "";
  }

  return args;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relativePath), "utf8"));
}

function writeFile(relativePath, content) {
  const absolute = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    "#39": "'",
    nbsp: " ",
  };
  return String(value || "").replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match, entity) => entities[entity] || match);
}

function firstMatch(html, regex) {
  const match = String(html || "").match(regex);
  return decodeHtml(match?.[1] || "").trim();
}

function allMatches(html, regex) {
  return [...String(html || "").matchAll(regex)]
    .map((match) => decodeHtml(stripTags(match[1] || "")))
    .filter(Boolean);
}

function normalizePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, SITE_ORIGIN);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return raw.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  }
}

function fullUrl(pagePath) {
  return `${SITE_ORIGIN}${normalizePath(pagePath)}`;
}

function scanPatterns(text, patterns) {
  const haystack = String(text || "");
  return patterns
    .filter((pattern) => pattern.test(haystack))
    .map((pattern) => pattern.toString());
}

async function fetchLiveSurface(pagePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const url = fullUrl(pagePath);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "FermatMind MBTI64 reference pack audit" },
    });
    const html = await response.text();
    return {
      url,
      status: response.status,
      ok: response.ok,
      title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      description: firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i),
      canonical: firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i),
      robots: firstMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i),
      h1: firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      h2: allMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi),
      html_sha256: sha256(html),
      private_route_matches: scanPatterns(html, PRIVATE_ROUTE_PATTERNS),
      trademark_claim_matches: scanPatterns(stripTags(html), TRADEMARK_CLAIM_PATTERNS),
    };
  } catch (error) {
    return {
      url,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      private_route_matches: [],
      trademark_claim_matches: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

function sectionTitle(sectionValue, fallbackKey) {
  if (typeof sectionValue === "string") return fallbackKey;
  if (Array.isArray(sectionValue)) return fallbackKey;
  if (sectionValue && typeof sectionValue === "object") {
    return sectionValue.h2 || sectionValue.title || fallbackKey;
  }
  return fallbackKey;
}

function sectionShape(sectionValue) {
  if (typeof sectionValue === "string") return "paragraph";
  if (Array.isArray(sectionValue)) return "list";
  if (sectionValue && typeof sectionValue === "object") {
    const keys = Object.keys(sectionValue);
    if (keys.some((key) => Array.isArray(sectionValue[key]))) return "structured_with_rows";
    return "structured";
  }
  return "unknown";
}

function excerpt(value, limit = 260) {
  const text = stripTags(typeof value === "string" ? value : JSON.stringify(value || ""));
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function buildContentStructure(row) {
  return Object.entries(row.content || {}).map(([key, value], index) => ({
    order: index + 1,
    key,
    title: sectionTitle(value, key),
    shape: sectionShape(value),
    excerpt: excerpt(value),
  }));
}

function linkSummary(row, graph) {
  const packageLinks = (row.internal_links || []).map((link) => ({
    role: link.role || "",
    href: link.href || "",
    anchor_text: link.anchor_text || link.anchor || "",
    safe_public_route: link.safe_public_route === true,
  }));
  const recommendedGraphEdges = (graph.recommendedEdges || [])
    .filter((edge) => edge.source_path === row.url || normalizePath(edge.source_url) === row.url)
    .map((edge) => ({
      target_url: edge.target_url,
      edge_type: edge.edge_type,
      anchor_text_suggestion: edge.anchor_text_suggestion,
      priority: edge.priority,
      safe_public_route: edge.safe_public_route === true,
      publish_blocker_if_any: edge.publish_blocker_if_any || "",
    }));
  return { package_links: packageLinks, recommended_graph_edges: recommendedGraphEdges };
}

function buildPageReference(row, liveSurface, measurementPage, graph) {
  const contentStructure = buildContentStructure(row);
  const pageTextForClaimScan = JSON.stringify({
    seo: row.seo,
    content: row.content,
    faq: row.faq,
    method_boundary: row.method_boundary,
    trademark_boundary: row.trademark_boundary,
  });

  return {
    url: row.url,
    canonical_url: fullUrl(row.url),
    locale: row.locale,
    page_type: row.page_type,
    target_intent: row.target_intent,
    primary_query: row.primary_query,
    secondary_queries: row.secondary_queries || [],
    excluded_queries: row.excluded_queries || [],
    seo_surface: {
      title: row.seo?.seo_title || "",
      description: row.seo?.seo_description || "",
      h1: row.seo?.h1 || "",
      quick_answer_summary: row.seo?.quick_answer_summary || "",
      breadcrumb_title: row.seo?.breadcrumb_title || "",
    },
    live_surface: liveSurface || null,
    measurement_baseline: measurementPage || null,
    quick_answer: row.content?.quick_answer || row.seo?.quick_answer_summary || "",
    body_structure: contentStructure,
    faq: {
      count: (row.faq || []).length,
      items: row.faq || [],
    },
    internal_links: linkSummary(row, graph),
    claim_boundary: {
      method_boundary: row.method_boundary || "",
      trademark_boundary: row.trademark_boundary || "",
      claim_risk_notes: row.claim_risk_notes || [],
      package_trademark_claim_matches: scanPatterns(pageTextForClaimScan, TRADEMARK_CLAIM_PATTERNS),
      live_trademark_claim_matches: liveSurface?.trademark_claim_matches || [],
    },
    private_route_safety: {
      package_route_safety: row.route_safety || null,
      package_private_route_matches: scanPatterns(JSON.stringify(row), PRIVATE_ROUTE_PATTERNS),
      live_private_route_matches: liveSurface?.private_route_matches || [],
    },
    duplicate_differentiation_pattern: {
      signature_sha256: sha256(JSON.stringify({
        title: row.seo?.seo_title,
        h1: row.seo?.h1,
        quick_answer: row.content?.quick_answer,
        faq_questions: (row.faq || []).map((item) => item.question),
        content_keys: Object.keys(row.content || {}),
      })),
      information_gain: row.information_gain || "",
      optimization_notes: row.v2_optimization || [],
      structure_family: row.page_type === "comparison" ? "a_vs_t_comparison" : "variant_profile",
    },
    agent_reference_notes: {
      imitate: [
        "Use page-specific A/T behavior, stress, work, relationship, and self-check angles.",
        "Keep the MBTI-like framework descriptive; do not imply official MBTI affiliation.",
        "Keep related-test links on safe public test routes only.",
        "Keep quick answers answer-first and distinct from sibling pages.",
      ],
      do_not_copy_verbatim_to_expansion: true,
    },
  };
}

function buildReusablePatterns(pages) {
  const variantPages = pages.filter((page) => page.page_type === "variant");
  const comparisonPages = pages.filter((page) => page.page_type === "comparison");
  return {
    variant_profile_structure: {
      observed_pages: variantPages.length,
      canonical_section_order: [
        "quick_answer",
        "meaning",
        "a_t_difference",
        "core_traits",
        "strengths_blind_spots",
        "careers_work_style",
        "relationships_communication",
        "common_misreads",
        "similar_types",
      ],
      reusable_rule: "Use the same section purposes, but rewrite every page around its own type, A/T pole, locale, and query intent.",
    },
    a_vs_t_comparison_structure: {
      observed_pages: comparisonPages.length,
      canonical_section_order: [
        "quick_answer",
        "side_by_side_summary",
        "core_traits_comparison",
        "stress_confidence",
        "career_work_style",
        "relationships_love",
        "which_one_fits",
      ],
      reusable_rule: "Comparison pages must compare A and T variants directly; they must not be two variant pages pasted together.",
    },
    faq_rule: "Use at least 5 visible FAQ candidates per page; questions must address page-specific search intent and avoid deterministic claims.",
    internal_link_rule:
      "Use same-locale A/T sibling, A-vs-T comparison, safe public MBTI test, Big Five test, and RIASEC/Holland test links when relevant.",
    claim_boundary_rule:
      "Describe A/T as an added identity/confidence-style layer used by this public profile system; do not present it as official MBTI or as clinical, hiring, relationship, or career determinism.",
  };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push(`# MBTI64 Optimized Pilot Reference Pack`);
  lines.push("");
  lines.push(`Generated: ${report.generated_at}`);
  lines.push(`Status: ${report.status}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Pilot pages: ${report.summary.pilot_page_count}`);
  lines.push(`- Live fetch OK: ${report.summary.live_fetch_ok_count}/${report.summary.pilot_page_count}`);
  lines.push(`- Private-route live hits: ${report.summary.live_private_route_hit_count}`);
  lines.push(`- Trademark/official-claim hits: ${report.summary.trademark_claim_hit_count}`);
  lines.push(`- Next task: ${report.recommended_next_task}`);
  lines.push("");
  lines.push("## Pilot Pages");
  lines.push("");
  lines.push("| URL | Type | Title | H1 | FAQ | Private hits |");
  lines.push("| --- | --- | --- | --- | ---: | ---: |");
  for (const page of report.pages) {
    lines.push(
      `| ${page.url} | ${page.page_type} | ${page.seo_surface.title.replaceAll("|", "\\|")} | ${page.seo_surface.h1.replaceAll("|", "\\|")} | ${page.faq.count} | ${page.private_route_safety.live_private_route_matches.length} |`,
    );
  }
  lines.push("");
  lines.push("## Reusable Patterns");
  lines.push("");
  lines.push(`- Variant section order: ${report.reusable_patterns.variant_profile_structure.canonical_section_order.join(", ")}`);
  lines.push(`- Comparison section order: ${report.reusable_patterns.a_vs_t_comparison_structure.canonical_section_order.join(", ")}`);
  lines.push(`- FAQ rule: ${report.reusable_patterns.faq_rule}`);
  lines.push(`- Internal-link rule: ${report.reusable_patterns.internal_link_rule}`);
  lines.push(`- Claim boundary: ${report.reusable_patterns.claim_boundary_rule}`);
  lines.push("");
  lines.push("## Agent Handoff");
  lines.push("");
  lines.push("Use this pack as examples for structure, safety, and differentiation. Do not copy the pilot wording verbatim into the 88-page expansion.");
  lines.push("");
  lines.push("## Blockers");
  lines.push("");
  if (report.blockers.length === 0) lines.push("- None.");
  else report.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  lines.push("");
  lines.push("## Warnings");
  lines.push("");
  if (report.warnings.length === 0) lines.push("- None.");
  else report.warnings.forEach((warning) => lines.push(`- ${warning}`));
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const contentPackage = readJson(args.packagePath);
  const frontendConsume = readJson(args.frontendConsumePath);
  const internalLinkGraph = readJson(args.internalLinkGraphPath);
  const measurementCohort = readJson(args.measurementCohortPath);
  const packageRows = Array.isArray(contentPackage.rows) ? contentPackage.rows : [];
  const rowsByUrl = new Map(packageRows.map((row) => [row.url, row]));
  const measurementByPath = new Map((measurementCohort.pages || []).map((page) => [page.path, page]));
  const blockers = [];
  const warnings = [];

  if (contentPackage.version !== "pilot-v2.1") blockers.push(`Expected V2.1 content package, found ${contentPackage.version}`);
  if (frontendConsume.status !== "pass") warnings.push(`Frontend consume artifact status is ${frontendConsume.status}`);
  if (internalLinkGraph.status !== "pass") warnings.push(`Internal-link graph status is ${internalLinkGraph.status}`);
  if (!String(measurementCohort.status || "").includes("baseline")) warnings.push(`Measurement cohort status is ${measurementCohort.status}`);

  const missingRows = PILOT_URLS.filter((url) => !rowsByUrl.has(url));
  if (missingRows.length) blockers.push(`Missing pilot rows in V2.1 package: ${missingRows.join(", ")}`);

  const liveSurfaces = new Map();
  if (args.fetchLive) {
    for (const pilotUrl of PILOT_URLS) {
      liveSurfaces.set(pilotUrl, await fetchLiveSurface(pilotUrl));
    }
  }

  const pages = PILOT_URLS.map((pilotUrl) => {
    const row = rowsByUrl.get(pilotUrl);
    if (!row) return null;
    return buildPageReference(row, liveSurfaces.get(pilotUrl), measurementByPath.get(pilotUrl), internalLinkGraph);
  }).filter(Boolean);

  for (const page of pages) {
    const live = page.live_surface;
    if (live && !live.ok) warnings.push(`${page.url}: live fetch not OK (${live.status || live.error})`);
    if (live?.canonical && live.canonical !== page.canonical_url) warnings.push(`${page.url}: live canonical differs from expected ${page.canonical_url}`);
    if (page.private_route_safety.package_private_route_matches.length > 0) blockers.push(`${page.url}: package contains private-route pattern`);
    if (page.private_route_safety.live_private_route_matches.length > 0) blockers.push(`${page.url}: live HTML contains private-route pattern`);
    if (page.claim_boundary.package_trademark_claim_matches.length > 0) blockers.push(`${page.url}: package contains official/trademark claim pattern`);
    if (page.claim_boundary.live_trademark_claim_matches.length > 0) blockers.push(`${page.url}: live HTML contains official/trademark claim pattern`);
    if (page.faq.count < 5) warnings.push(`${page.url}: FAQ count below 5`);
    if (page.internal_links.package_links.some((link) => link.safe_public_route !== true)) {
      warnings.push(`${page.url}: package internal link without safe_public_route=true`);
    }
  }

  const signatureCounts = new Map();
  for (const page of pages) {
    const signature = page.duplicate_differentiation_pattern.signature_sha256;
    signatureCounts.set(signature, (signatureCounts.get(signature) || 0) + 1);
  }
  const duplicateSignatures = [...signatureCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateSignatures.length) blockers.push(`Duplicate content signatures detected: ${duplicateSignatures.length}`);

  const report = {
    artifact: "MBTI64-OPTIMIZED-PILOT-REFERENCE-PACK-01",
    version: "mbti64.optimized_pilot_reference_pack.v1",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    scope:
      "Artifact-only reference pack for the already optimized 8 MBTI64 pilot pages. No CMS write, frontend runtime change, publish, index, sitemap, llms, queue enqueue, approval, or search submission.",
    inputs: {
      content_package_v21: args.packagePath,
      frontend_consume: args.frontendConsumePath,
      internal_link_graph: args.internalLinkGraphPath,
      measurement_cohort: args.measurementCohortPath,
      live_fetch_enabled: args.fetchLive,
    },
    summary: {
      pilot_page_count: pages.length,
      comparison_pages: pages.filter((page) => page.page_type === "comparison").length,
      variant_pages: pages.filter((page) => page.page_type === "variant").length,
      live_fetch_ok_count: pages.filter((page) => page.live_surface?.ok).length,
      live_private_route_hit_count: pages.reduce(
        (count, page) => count + page.private_route_safety.live_private_route_matches.length,
        0,
      ),
      package_private_route_hit_count: pages.reduce(
        (count, page) => count + page.private_route_safety.package_private_route_matches.length,
        0,
      ),
      trademark_claim_hit_count: pages.reduce(
        (count, page) =>
          count +
          page.claim_boundary.package_trademark_claim_matches.length +
          page.claim_boundary.live_trademark_claim_matches.length,
        0,
      ),
      unique_content_signatures: signatureCounts.size,
    },
    pages,
    reusable_patterns: buildReusablePatterns(pages),
    qa_boundary: {
      no_cms_write: true,
      no_publish: true,
      no_indexability_change: true,
      no_search_release: true,
      private_route_patterns_scanned: PRIVATE_ROUTE_PATTERNS.map((pattern) => pattern.toString()),
      official_claim_patterns_scanned: TRADEMARK_CLAIM_PATTERNS.map((pattern) => pattern.toString()),
    },
    blockers,
    warnings,
    recommended_next_task: "PERSONALITY-PUBLIC-PROFILE-AGENT-RUNNER-01",
  };

  writeFile(args.output, `${JSON.stringify(report, null, args.pretty ? 2 : 0)}\n`);
  writeFile(args.markdown, buildMarkdown(report));

  if (blockers.length) {
    console.error(`Generated ${args.output} with ${blockers.length} blocker(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Generated ${args.output}`);
    console.log(`Generated ${args.markdown}`);
  }
}

await main();
