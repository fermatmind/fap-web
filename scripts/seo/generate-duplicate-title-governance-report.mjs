#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape, resolveOutputPath, resolveRepoPath } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const VERSION = "seo_foundation.duplicate_title_governance.v1";
const DEFAULT_SOURCE = "docs/seo/generated/duplicate-seo-entities.v1.json";
const DEFAULT_OUTPUT = "docs/seo/generated/duplicate-title-governance.v1.json";
const DEFAULT_CSV = "docs/seo/generated/duplicate-title-governance.v1.csv";

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    output: DEFAULT_OUTPUT,
    csv: DEFAULT_CSV,
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg === "--source") {
      args.source = argv[++index] || args.source;
    } else if (arg.startsWith("--source=")) {
      args.source = arg.slice("--source=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || args.output;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || args.csv;
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    }
  }

  return args;
}

function readJson(relOrAbsPath) {
  return JSON.parse(fs.readFileSync(resolveRepoPath(ROOT, relOrAbsPath, "source path"), "utf8"));
}

function includesAny(values, needles) {
  return needles.some((needle) => values.includes(needle));
}

function classifyCluster(cluster) {
  const routeFamilies = Array.isArray(cluster.routeFamilies) ? cluster.routeFamilies : [];

  if (cluster.type === "duplicate_canonical") {
    return {
      classification: "migration_required",
      reason: "Duplicate canonical clusters can collapse distinct public entities and must be reviewed before SEO expansion.",
    };
  }

  if (cluster.type === "career_family_variant") {
    return {
      classification: "semantic_entity_risk",
      reason: "Career family variants may represent the same semantic family with multiple public URLs.",
    };
  }

  if (cluster.type === "duplicate_semantic_entity") {
    return {
      classification: "semantic_entity_risk",
      reason: "Multiple URLs map to the same derived semantic entity key.",
    };
  }

  if (includesAny(routeFamilies, ["career_family", "career_industry_detail"])) {
    return {
      classification: "CMS_remediation_required",
      reason: "Career family or industry title repetition should be remediated through backend/CMS authority before expansion.",
    };
  }

  if (includesAny(routeFamilies, ["article_detail", "topic_detail"])) {
    return {
      classification: "CMS_remediation_required",
      reason: "Article/topic duplicate titles or descriptions must be remediated through CMS editorial metadata.",
    };
  }

  if (cluster.type === "duplicate_title" && cluster.count === 2 && cluster.locales?.length === 2 && routeFamilies.length === 1) {
    return {
      classification: "acceptable_duplicate",
      reason: "Locale-paired duplicate derived titles are acceptable until CMS-authored localized metadata is available.",
    };
  }

  return {
    classification: "watchlist",
    reason: "Duplicate signal is visible but does not yet prove a canonical or semantic ownership conflict.",
  };
}

function byClassification(clusters) {
  return clusters.reduce((acc, cluster) => {
    acc[cluster.classification] = (acc[cluster.classification] || 0) + 1;
    return acc;
  }, {});
}

function normalizeCluster(cluster, index) {
  const governance = classifyCluster(cluster);

  return {
    id: `duplicate-governance-${String(index + 1).padStart(3, "0")}`,
    type: cluster.type,
    severity: cluster.severity,
    classification: governance.classification,
    reason: governance.reason,
    key: cluster.key,
    count: cluster.count,
    routeFamilies: cluster.routeFamilies ?? [],
    locales: cluster.locales ?? [],
    urls: cluster.urls ?? [],
    source: cluster.source,
  };
}

function buildReport(sourcePath) {
  const sourceReport = readJson(sourcePath);
  const sourceClusters = Array.isArray(sourceReport.clusters) ? sourceReport.clusters : [];
  const clusters = sourceClusters.map(normalizeCluster);
  const highRiskClassifications = new Set(["migration_required", "CMS_remediation_required", "semantic_entity_risk"]);
  const highRiskClusters = clusters.filter((cluster) => highRiskClassifications.has(cluster.classification));

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    source: {
      duplicateEntityReport: sourcePath,
      duplicateEntityReportVersion: sourceReport.version ?? "",
      totalUrls: sourceReport.summary?.totalUrls ?? 0,
    },
    summary: {
      totalClusters: clusters.length,
      duplicateTitleClusters: clusters.filter((cluster) => cluster.type === "duplicate_title").length,
      duplicateDescriptionClusters: clusters.filter((cluster) => cluster.type === "duplicate_description").length,
      duplicateCanonicalClusters: clusters.filter((cluster) => cluster.type === "duplicate_canonical").length,
      semanticEntityClusters: clusters.filter((cluster) => cluster.type === "duplicate_semantic_entity").length,
      careerFamilyVariantClusters: clusters.filter((cluster) => cluster.type === "career_family_variant").length,
      highRiskClusters: highRiskClusters.length,
      byClassification: byClassification(clusters),
    },
    classificationDefinitions: {
      acceptable_duplicate: "Known duplicate pattern that does not currently imply SEO authority drift.",
      watchlist: "Visible duplicate signal that should be monitored before content expansion.",
      migration_required: "Must be migrated or reconciled before affected page families expand.",
      CMS_remediation_required: "Should be fixed through backend/CMS metadata or entity ownership, not frontend title changes.",
      semantic_entity_risk: "Possible duplicate entity family requiring canonical ownership decisions.",
    },
    highRiskClusters,
    clusters,
  };
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return csvEscape(text);
}

function buildCsv(clusters) {
  const headers = ["id", "type", "severity", "classification", "key", "count", "routeFamilies", "locales", "urls"];
  return [
    headers.join(","),
    ...clusters.map((cluster) => headers.map((header) => toCsvValue(cluster[header])).join(",")),
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args.source);
  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);

  if (args.output) {
    const outputPath = resolveOutputPath(ROOT, args.output, "output path");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${json}\n`);
  }
  if (args.csv) {
    const csvPath = resolveOutputPath(ROOT, args.csv, "CSV output path");
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, `${buildCsv(report.clusters)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
