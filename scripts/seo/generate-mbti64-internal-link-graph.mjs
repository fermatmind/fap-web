#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "mbti64.internal_link_graph.v1";
const AUDIT_DATE = process.env.AUDIT_DATE || "2026-06-18";
const DEFAULT_AUDIT_PATH = `docs/seo/personality/indexation-audit-${AUDIT_DATE}.json`;
const DEFAULT_PACKAGE_PATH = "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json";
const DEFAULT_STATIC_GRAPH_PATH = "docs/seo/generated/internal-link-graph.v1.json";
const DEFAULT_URL_INVENTORY_PATH = "docs/seo/generated/url-inventory.v1.json";
const DEFAULT_ROUTE_DECISION_PATH = `docs/seo/personality/related-test-route-scope-decision-${AUDIT_DATE}.json`;
const DEFAULT_JSON_OUTPUT = `docs/seo/personality/internal-link-graph-${AUDIT_DATE}.json`;
const DEFAULT_CSV_OUTPUT = `docs/seo/personality/internal-link-graph-${AUDIT_DATE}.csv`;
const DEFAULT_MD_OUTPUT = `docs/seo/personality/internal-link-graph-${AUDIT_DATE}.md`;

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

const FORBIDDEN_ROUTE_PATTERNS = [
  /\/result\b/i,
  /\/results\b/i,
  /\/results\/lookup\b/i,
  /\/orders\b/i,
  /\/orders\/lookup\b/i,
  /\/share\b/i,
  /\/pay\b/i,
  /\/payment\b/i,
  /\/history\b/i,
  /\/private\b/i,
  /\/account\b/i,
  /token=/i,
  /session=/i,
  /user=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

function parseArgs(argv) {
  const args = {
    audit: DEFAULT_AUDIT_PATH,
    package: DEFAULT_PACKAGE_PATH,
    staticGraph: DEFAULT_STATIC_GRAPH_PATH,
    urlInventory: DEFAULT_URL_INVENTORY_PATH,
    routeDecision: DEFAULT_ROUTE_DECISION_PATH,
    output: DEFAULT_JSON_OUTPUT,
    csv: DEFAULT_CSV_OUTPUT,
    markdown: DEFAULT_MD_OUTPUT,
    pretty: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") args.pretty = true;
    else if (arg === "--compact") args.pretty = false;
    else if (arg.startsWith("--audit=")) args.audit = arg.slice("--audit=".length);
    else if (arg === "--audit") args.audit = argv[++index] || args.audit;
    else if (arg.startsWith("--package=")) args.package = arg.slice("--package=".length);
    else if (arg === "--package") args.package = argv[++index] || args.package;
    else if (arg.startsWith("--static-graph=")) args.staticGraph = arg.slice("--static-graph=".length);
    else if (arg === "--static-graph") args.staticGraph = argv[++index] || args.staticGraph;
    else if (arg.startsWith("--url-inventory=")) args.urlInventory = arg.slice("--url-inventory=".length);
    else if (arg === "--url-inventory") args.urlInventory = argv[++index] || args.urlInventory;
    else if (arg.startsWith("--route-decision=")) args.routeDecision = arg.slice("--route-decision=".length);
    else if (arg === "--route-decision") args.routeDecision = argv[++index] || args.routeDecision;
    else if (arg.startsWith("--output=")) args.output = arg.slice("--output=".length);
    else if (arg === "--output") args.output = argv[++index] || "";
    else if (arg.startsWith("--csv=")) args.csv = arg.slice("--csv=".length);
    else if (arg === "--csv") args.csv = argv[++index] || "";
    else if (arg.startsWith("--markdown=")) args.markdown = arg.slice("--markdown=".length);
    else if (arg === "--markdown") args.markdown = argv[++index] || "";
  }

  return args;
}

function readJson(relOrAbsPath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relOrAbsPath), "utf8"));
}

function writeFile(relOrAbsPath, content) {
  if (!relOrAbsPath) return;
  const absolute = path.resolve(ROOT, relOrAbsPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function normalizePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, "https://fermatmind.com");
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return raw.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  }
}

function normalizeUrl(value) {
  const pathname = normalizePath(value);
  return pathname ? `https://fermatmind.com${pathname}` : "";
}

function localeFromPath(pagePath) {
  return normalizePath(pagePath).split("/")[1] || "";
}

function slugFromPath(pagePath) {
  return normalizePath(pagePath).split("/").pop() || "";
}

function isForbiddenRoute(value) {
  return FORBIDDEN_ROUTE_PATTERNS.some((pattern) => pattern.test(String(value || "")));
}

function parseVariantSlug(slug) {
  const match = /^([a-z]{4})-([at])$/i.exec(slug);
  if (!match) return null;
  return { typeCode: match[1].toLowerCase(), variant: match[2].toLowerCase() };
}

function parseComparisonSlug(slug) {
  const match = /^([a-z]{4})-a-vs-\1-t$/i.exec(slug);
  if (!match) return null;
  return { typeCode: match[1].toLowerCase() };
}

function variantPath(locale, typeCode, variant) {
  return `/${locale}/personality/${typeCode}-${variant}`;
}

function comparisonPath(locale, typeCode) {
  return `/${locale}/personality/${typeCode}-a-vs-${typeCode}-t`;
}

function pathToPackageLocale(pagePath) {
  const locale = localeFromPath(pagePath);
  if (locale === "zh") return "zh-CN";
  if (locale === "en") return "en";
  return "";
}

function anchorFor(locale, edgeType, targetPath, typeCode, variant) {
  const type = typeCode.toUpperCase();
  if (edgeType === "variant_at_pair") return `${type}-${variant.toUpperCase()}`;
  if (edgeType === "variant_to_comparison") {
    return locale === "zh" ? `${type}-A 与 ${type}-T 对比` : `${type}-A vs ${type}-T`;
  }
  if (edgeType === "comparison_to_variant") {
    return locale === "zh" ? `${type}-${variant.toUpperCase()} 人格` : `${type}-${variant.toUpperCase()} profile`;
  }
  return slugFromPath(targetPath);
}

function edgePriority(sourcePath, targetPath, edgeType, pilotPaths) {
  if (pilotPaths.has(sourcePath) || pilotPaths.has(targetPath)) return "P0";
  if (edgeType === "variant_to_comparison" || edgeType === "comparison_to_variant") return "P1";
  return "P2";
}

function buildEdge({ sourcePath, targetPath, locale, edgeType, anchorText, priority, reason, safePublicRoute, blocker = "" }) {
  return {
    source_url: normalizeUrl(sourcePath),
    target_url: normalizeUrl(targetPath),
    source_path: normalizePath(sourcePath),
    target_path: normalizePath(targetPath),
    locale: pathToPackageLocale(sourcePath) || locale,
    edge_type: edgeType,
    anchor_text_suggestion: anchorText,
    priority,
    reason,
    safe_public_route: safePublicRoute,
    publish_blocker_if_any: blocker,
  };
}

function collectSafeRelatedTestRoutes(routeDecision) {
  const routes = new Set();
  for (const bucket of ["en", "zh"]) {
    for (const route of routeDecision.safe_public_routes?.[bucket] || []) {
      routes.add(normalizePath(route));
    }
  }
  return routes;
}

function buildReport(args) {
  const audit = readJson(args.audit);
  const contentPackage = readJson(args.package);
  const staticGraph = readJson(args.staticGraph);
  const urlInventory = readJson(args.urlInventory);
  const routeDecision = fs.existsSync(path.resolve(ROOT, args.routeDecision)) ? readJson(args.routeDecision) : {};
  const auditRows = Array.isArray(audit.rows) ? audit.rows : [];
  const packageRows = Array.isArray(contentPackage.rows) ? contentPackage.rows : [];
  const staticGraphByPath = new Map((staticGraph.items || []).map((item) => [normalizePath(item.path), item]));
  const urlTruthPaths = new Set((urlInventory.rows || []).map((row) => normalizePath(row.path)));
  const auditPaths = new Set(auditRows.map((row) => normalizePath(row.path)));
  const validTargets = new Set([...auditPaths, ...urlTruthPaths]);
  const pilotPaths = new Set(PILOT_URLS.map(normalizePath));
  const safeRelatedTestRoutes = collectSafeRelatedTestRoutes(routeDecision);

  const nodes = auditRows
    .map((row) => {
      const pagePath = normalizePath(row.path);
      const slug = slugFromPath(pagePath);
      const variantInfo = parseVariantSlug(slug);
      const comparisonInfo = parseComparisonSlug(slug);
      const staticItem = staticGraphByPath.get(pagePath);
      return {
        url: row.url,
        path: pagePath,
        locale: row.locale,
        page_type: row.page_type,
        mbti_type: variantInfo?.typeCode || comparisonInfo?.typeCode || "",
        variant: variantInfo?.variant || "",
        is_pilot: pilotPaths.has(pagePath),
        index_directive: row.index_directive,
        follow_directive: row.follow_directive,
        in_sitemap: row.in_sitemap,
        in_llms: row.in_llms,
        in_llms_full: row.in_llms_full,
        internal_link_count: row.internal_link_count,
        outbound_private_url_seen: row.outbound_private_url_seen,
        static_graph_inbound_count: staticItem?.inboundCount ?? null,
        static_graph_classification: staticItem?.graphClassification || "missing_from_static_url_truth",
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const recommendedEdges = [];
  const blockedEdges = [];
  const existingEdges = [];

  for (const row of auditRows) {
    const sourcePath = normalizePath(row.path);
    const locale = localeFromPath(sourcePath);
    const slug = slugFromPath(sourcePath);
    const variantInfo = parseVariantSlug(slug);
    const comparisonInfo = parseComparisonSlug(slug);

    if (variantInfo) {
      const otherVariant = variantInfo.variant === "a" ? "t" : "a";
      const counterpart = variantPath(locale, variantInfo.typeCode, otherVariant);
      const comparison = comparisonPath(locale, variantInfo.typeCode);
      for (const [targetPath, edgeType, targetVariant] of [
        [counterpart, "variant_at_pair", otherVariant],
        [comparison, "variant_to_comparison", variantInfo.variant],
      ]) {
        const safe = validTargets.has(targetPath) && !isForbiddenRoute(targetPath) && sourcePath !== targetPath;
        recommendedEdges.push(
          buildEdge({
            sourcePath,
            targetPath,
            locale,
            edgeType,
            anchorText: anchorFor(locale, edgeType, targetPath, variantInfo.typeCode, targetVariant),
            priority: edgePriority(sourcePath, targetPath, edgeType, pilotPaths),
            reason:
              edgeType === "variant_at_pair"
                ? "Connect A/T sibling pages so readers can compare confidence-style variants without leaving the type cluster."
                : "Connect variant pages to the dedicated A-vs-T comparison page for the same MBTI code.",
            safePublicRoute: safe,
            blocker: safe ? "" : "target_missing_or_unsafe",
          })
        );
      }
    }

    if (comparisonInfo) {
      for (const variant of ["a", "t"]) {
        const targetPath = variantPath(locale, comparisonInfo.typeCode, variant);
        const safe = validTargets.has(targetPath) && !isForbiddenRoute(targetPath) && sourcePath !== targetPath;
        recommendedEdges.push(
          buildEdge({
            sourcePath,
            targetPath,
            locale,
            edgeType: "comparison_to_variant",
            anchorText: anchorFor(locale, "comparison_to_variant", targetPath, comparisonInfo.typeCode, variant),
            priority: edgePriority(sourcePath, targetPath, "comparison_to_variant", pilotPaths),
            reason: "Return comparison readers to the underlying A/T variant profile pages.",
            safePublicRoute: safe,
            blocker: safe ? "" : "target_missing_or_unsafe",
          })
        );
      }
    }

    for (const sample of row.private_url_samples || []) {
      blockedEdges.push(
        buildEdge({
          sourcePath,
          targetPath: normalizePath(sample),
          locale,
          edgeType: "forbidden_private_route_observed",
          anchorText: "",
          priority: "BLOCKED",
          reason: "Indexation audit observed a private/result/order/account style outbound URL; do not use as public internal-link graph target.",
          safePublicRoute: false,
          blocker: "forbidden_private_route",
        })
      );
    }
  }

  const packageRowsByPath = new Map(packageRows.map((row) => [normalizePath(row.url), row]));
  for (const row of packageRows) {
    const sourcePath = normalizePath(row.url);
    for (const link of row.internal_links || []) {
      const targetPath = normalizePath(link.href);
      const isSafeRelatedTest =
        link.role === "related_test" &&
        link.safe_public_route === true &&
        safeRelatedTestRoutes.has(targetPath) &&
        validTargets.has(targetPath) &&
        !isForbiddenRoute(targetPath);
      const packageEdge = buildEdge({
        sourcePath,
        targetPath,
        locale: localeFromPath(sourcePath),
        edgeType: link.role || "package_internal_link",
        anchorText: link.anchor_text || "",
        priority: "P0",
        reason: "V2.1 pilot package internal link.",
        safePublicRoute: link.safe_public_route === true && validTargets.has(targetPath) && !isForbiddenRoute(targetPath),
        blocker:
          link.safe_public_route === true && validTargets.has(targetPath) && !isForbiddenRoute(targetPath)
            ? ""
            : "package_link_target_missing_or_unsafe",
      });
      existingEdges.push(packageEdge);
      if (isSafeRelatedTest) {
        recommendedEdges.push({
          ...packageEdge,
          edge_type: "related_test",
          reason: "Safe public related-test route verified by V2.1 package and URL Truth.",
        });
      } else if (isForbiddenRoute(link.href) || link.safe_public_route === false) {
        blockedEdges.push({
          ...packageEdge,
          priority: "BLOCKED",
          safe_public_route: false,
          publish_blocker_if_any: "package_link_forbidden_or_unsafe",
        });
      }
    }
  }

  const uniqueRecommended = dedupeEdges(recommendedEdges).sort(edgeSort);
  const uniqueBlocked = dedupeEdges(blockedEdges).sort(edgeSort);
  const uniqueExisting = dedupeEdges(existingEdges).sort(edgeSort);
  const unsafeRecommendedEdges = uniqueRecommended.filter((edge) => !edge.safe_public_route || edge.publish_blocker_if_any);
  const selfLinks = uniqueRecommended.filter((edge) => edge.source_path === edge.target_path);
  const lowInboundCandidates = nodes
    .filter((node) => node.static_graph_classification !== "connected" || Number(node.static_graph_inbound_count || 0) <= 2)
    .map((node) => ({
      url: node.url,
      path: node.path,
      locale: node.locale,
      page_type: node.page_type,
      is_pilot: node.is_pilot,
      static_graph_inbound_count: node.static_graph_inbound_count,
      static_graph_classification: node.static_graph_classification,
      note:
        node.static_graph_classification === "missing_from_static_url_truth"
          ? "Not present in generic URL Truth internal-link graph; rely on MBTI64 audit artifact for this page."
          : "Low static inbound count in generic internal-link graph.",
    }))
    .sort((a, b) => Number(a.static_graph_inbound_count ?? 999) - Number(b.static_graph_inbound_count ?? 999) || a.path.localeCompare(b.path));

  const variantCount = nodes.filter((node) => node.page_type === "variant").length;
  const comparisonCount = nodes.filter((node) => node.page_type === "comparison").length;
  const pilotCoverage = PILOT_URLS.map((pilotPath) => ({
    path: pilotPath,
    present_in_audit: auditPaths.has(pilotPath),
    present_in_package: packageRowsByPath.has(pilotPath),
  }));

  const blockers = [];
  if (nodes.length !== 96) blockers.push(`Expected 96 MBTI64 pages, found ${nodes.length}.`);
  if (variantCount !== 64) blockers.push(`Expected 64 variant pages, found ${variantCount}.`);
  if (comparisonCount !== 32) blockers.push(`Expected 32 comparison pages, found ${comparisonCount}.`);
  if (pilotCoverage.some((item) => !item.present_in_audit || !item.present_in_package)) {
    blockers.push("Pilot URL coverage is incomplete.");
  }
  if (unsafeRecommendedEdges.length) blockers.push("Recommended edges include unsafe or missing targets.");
  if (selfLinks.length) blockers.push("Recommended edges include self-links.");

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    auditDate: AUDIT_DATE,
    status: blockers.length ? "fail" : "pass",
    source: {
      indexationAudit: args.audit,
      contentPackage: args.package,
      staticInternalLinkGraph: args.staticGraph,
      urlInventory: args.urlInventory,
      relatedTestRouteDecision: fs.existsSync(path.resolve(ROOT, args.routeDecision)) ? args.routeDecision : null,
      limitation:
        "Read-only artifact. Existing runtime outgoing links are not crawled here; existingEdges are package-proposed links and static graph signals are inbound inventory hints only.",
    },
    summary: {
      total_pages: nodes.length,
      variant_pages: variantCount,
      comparison_pages: comparisonCount,
      pilot_urls: pilotCoverage.length,
      pilot_urls_present_in_audit: pilotCoverage.filter((item) => item.present_in_audit).length,
      pilot_urls_present_in_package: pilotCoverage.filter((item) => item.present_in_package).length,
      recommended_edges: uniqueRecommended.length,
      blocked_edges: uniqueBlocked.length,
      existing_package_edges: uniqueExisting.length,
      low_inbound_or_missing_static_graph_candidates: lowInboundCandidates.length,
      unsafe_recommended_edges: unsafeRecommendedEdges.length,
      self_links: selfLinks.length,
      next_recommended_task: "MBTI64-CMS-INTERNAL-LINK-DRAFT-01",
    },
    pilotUrls: pilotCoverage,
    nodes,
    existingEdges: uniqueExisting,
    recommendedEdges: uniqueRecommended,
    blockedEdges: uniqueBlocked,
    lowInboundCandidates,
    blockers,
  };
}

function dedupeEdges(edges) {
  const seen = new Set();
  const out = [];
  for (const edge of edges) {
    const key = `${edge.source_path}|${edge.target_path}|${edge.edge_type}|${edge.anchor_text_suggestion}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}

function edgeSort(a, b) {
  return (
    String(a.locale).localeCompare(String(b.locale)) ||
    String(a.source_path).localeCompare(String(b.source_path)) ||
    String(a.edge_type).localeCompare(String(b.edge_type)) ||
    String(a.target_path).localeCompare(String(b.target_path))
  );
}

function csvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(report) {
  const headers = [
    "edge_status",
    "source_url",
    "target_url",
    "locale",
    "edge_type",
    "anchor_text_suggestion",
    "priority",
    "reason",
    "safe_public_route",
    "publish_blocker_if_any",
  ];
  const rows = [
    ...report.recommendedEdges.map((edge) => ({ edge_status: "recommended", ...edge })),
    ...report.blockedEdges.map((edge) => ({ edge_status: "blocked", ...edge })),
  ];
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n");
}

function buildMarkdown(report) {
  const lines = [
    "# MBTI64 Internal Link Graph",
    "",
    "## Summary",
    `- Status: \`${report.status}\``,
    `- Total MBTI64 pages: ${report.summary.total_pages}`,
    `- Variant pages: ${report.summary.variant_pages}`,
    `- Comparison pages: ${report.summary.comparison_pages}`,
    `- Pilot URLs: ${report.summary.pilot_urls}`,
    `- Recommended edges: ${report.summary.recommended_edges}`,
    `- Blocked edges: ${report.summary.blocked_edges}`,
    `- Low-inbound or missing static graph candidates: ${report.summary.low_inbound_or_missing_static_graph_candidates}`,
    "",
    "## Scope Boundary",
    "- Artifact-only; no CMS writes, no frontend runtime changes, no publish/index/search release.",
    "- Same-locale body links only; hreflang alternates are not counted as body internal links.",
    "- Existing runtime outgoing links are not crawled in this generator.",
    "",
    "## Edge Rules",
    "- Variant A/T sibling pages should link bidirectionally.",
    "- Variant pages should link to the matching A-vs-T comparison page.",
    "- Comparison pages should link back to both A and T variant pages.",
    "- V2.1 related-test links are allowed only when the route is URL-Truth present and marked safe public.",
    "- Private result/order/payment/account routes are blocked.",
    "",
    "## Blockers",
    report.blockers.length ? report.blockers.map((item) => `- ${item}`).join("\n") : "- None.",
    "",
    "## Next Recommended Task",
    `- \`${report.summary.next_recommended_task}\`: convert this graph into CMS draft/revision internal_links only after explicit approval.`,
  ];
  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args);
  writeFile(args.output, `${JSON.stringify(report, null, args.pretty ? 2 : 0)}\n`);
  writeFile(args.csv, `${buildCsv(report)}\n`);
  writeFile(args.markdown, buildMarkdown(report));
  process.stdout.write(`${JSON.stringify(report, null, args.pretty ? 2 : 0)}\n`);
}

main();
