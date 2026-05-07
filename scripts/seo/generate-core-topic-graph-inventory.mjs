#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "core_topic_graph.inventory.v1";
const DEFAULT_URL_INVENTORY_PATH = "docs/seo/generated/url-inventory.v1.json";
const DEFAULT_INTERNAL_LINK_GRAPH_PATH = "docs/seo/generated/internal-link-graph.v1.json";
const DEFAULT_DUPLICATE_REPORT_PATH = "docs/seo/generated/duplicate-seo-entities.v1.json";
const DEFAULT_CAREER_AUTHORITY_AUDIT_PATH = "docs/seo/generated/career-family-authority-audit.v1.json";

const LOCALES = ["en", "zh"];
const CORE_TOPIC_SLUGS = ["mbti", "big-five", "riasec"];
const CORE_TEST_SLUGS = {
  mbti: "mbti-personality-test-16-personality-types",
  "big-five": "big-five-personality-test-ocean-model",
  riasec: "holland-career-interest-test-riasec",
};
const BIG_FIVE_TRAITS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
const RIASEC_TYPES = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"];

function parseArgs(argv) {
  const args = {
    urlInventory: DEFAULT_URL_INVENTORY_PATH,
    internalLinkGraph: DEFAULT_INTERNAL_LINK_GRAPH_PATH,
    duplicateReport: DEFAULT_DUPLICATE_REPORT_PATH,
    careerAuthorityAudit: DEFAULT_CAREER_AUTHORITY_AUDIT_PATH,
    output: "",
    csv: "",
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--url-inventory=")) {
      args.urlInventory = arg.slice("--url-inventory=".length);
    } else if (arg === "--url-inventory") {
      args.urlInventory = argv[++index] || args.urlInventory;
    } else if (arg.startsWith("--internal-link-graph=")) {
      args.internalLinkGraph = arg.slice("--internal-link-graph=".length);
    } else if (arg === "--internal-link-graph") {
      args.internalLinkGraph = argv[++index] || args.internalLinkGraph;
    } else if (arg.startsWith("--duplicate-report=")) {
      args.duplicateReport = arg.slice("--duplicate-report=".length);
    } else if (arg === "--duplicate-report") {
      args.duplicateReport = argv[++index] || args.duplicateReport;
    } else if (arg.startsWith("--career-authority-audit=")) {
      args.careerAuthorityAudit = arg.slice("--career-authority-audit=".length);
    } else if (arg === "--career-authority-audit") {
      args.careerAuthorityAudit = argv[++index] || args.careerAuthorityAudit;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || "";
    }
  }

  return args;
}

function readJson(relOrAbsPath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relOrAbsPath), "utf8"));
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

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getRowsByPath(rows) {
  return new Map(rows.map((row) => [normalizePath(row.path), row]));
}

function getLinksByPath(items) {
  return new Map(items.map((item) => [normalizePath(item.path), item]));
}

function getDuplicateRiskForUrl(url, duplicateReport) {
  const clusters = [
    ...(duplicateReport.titleClusters || []),
    ...(duplicateReport.descriptionClusters || []),
    ...(duplicateReport.canonicalClusters || []),
    ...(duplicateReport.semanticEntityClusters || []),
    ...(duplicateReport.careerFamilyVariantClusters || []),
  ];
  const hits = clusters.filter((cluster) => (cluster.urls || []).includes(url));
  if (!hits.length) return { level: "none", clusters: [] };
  if (hits.some((cluster) => cluster.severity === "P1" || cluster.type === "career_family_variant")) {
    return { level: "p1", clusters: hits.map((cluster) => cluster.key).sort() };
  }
  return { level: "p2", clusters: hits.map((cluster) => cluster.key).sort() };
}

function readinessFor({ urls, routeRows, linkItems, duplicateLevel, authorityRisk }) {
  if (!urls.length) return "blocked";
  if (authorityRisk === "p1" || duplicateLevel === "p1") return "dangerous";
  if (linkItems.some((item) => item?.graphClassification === "true_orphan")) return "weak";
  if (routeRows.some((row) => row?.evidenceContainerReadiness === "not_ready")) return "dangerous";
  if (routeRows.some((row) => row?.evidenceContainerReadiness === "partial")) return "partial";
  return "ready";
}

function buildEntity({ id, type, cluster, label, paths, rowsByPath, linksByPath, duplicateReport, authorityRisk = "none" }) {
  const routeRows = paths.map((itemPath) => rowsByPath.get(itemPath)).filter(Boolean);
  const urls = routeRows.map((row) => row.url);
  const linkItems = paths.map((itemPath) => linksByPath.get(itemPath)).filter(Boolean);
  const duplicateHits = urls.map((url) => getDuplicateRiskForUrl(url, duplicateReport));
  const duplicateLevel = duplicateHits.some((hit) => hit.level === "p1")
    ? "p1"
    : duplicateHits.some((hit) => hit.level === "p2")
      ? "p2"
      : "none";

  return {
    id,
    type,
    cluster,
    label,
    paths,
    urls,
    locales: [...new Set(routeRows.map((row) => row.locale))].sort(),
    routeFamilies: [...new Set(routeRows.map((row) => row.routeFamily))].sort(),
    discoverabilityState: routeRows.length ? "public_inventory" : "missing_public_route",
    canonicalState: routeRows.length ? [...new Set(routeRows.map((row) => row.canonicalState))].sort() : [],
    llmsState: routeRows.length ? [...new Set(routeRows.map((row) => row.expectedLlmsState))].sort() : [],
    evidenceReadiness: routeRows.length ? [...new Set(routeRows.map((row) => row.evidenceContainerReadiness))].sort() : [],
    orphanState: linkItems.length ? countBy(linkItems, "graphClassification") : {},
    duplicateEntityRisk: duplicateLevel,
    duplicateRiskClusters: [...new Set(duplicateHits.flatMap((hit) => hit.clusters))].sort(),
    authorityRisk,
    graphReadiness: readinessFor({ urls, routeRows, linkItems, duplicateLevel, authorityRisk }),
  };
}

function localizedPaths(slug, prefix) {
  return LOCALES.map((locale) => `/${locale}/${prefix}/${slug}`);
}

function groupedSlugs(rows, routeFamily) {
  return [
    ...new Set(
      rows
        .filter((row) => row.routeFamily === routeFamily)
        .map((row) => normalizePath(row.path).split("/").pop())
        .filter(Boolean)
    ),
  ].sort();
}

function buildReport(args) {
  const inventory = readJson(args.urlInventory);
  const internalLinkGraph = readJson(args.internalLinkGraph);
  const duplicateReport = readJson(args.duplicateReport);
  const careerAuthorityAudit = readJson(args.careerAuthorityAudit);
  const rows = Array.isArray(inventory.rows) ? inventory.rows : [];
  const rowsByPath = getRowsByPath(rows);
  const linksByPath = getLinksByPath(internalLinkGraph.items || []);

  const topicEntities = CORE_TOPIC_SLUGS.map((slug) =>
    buildEntity({
      id: `topic:${slug}`,
      type: "topic",
      cluster: slug,
      label: slug,
      paths: localizedPaths(slug, "topics"),
      rowsByPath,
      linksByPath,
      duplicateReport,
    })
  );

  const testEntities = Object.entries(CORE_TEST_SLUGS).map(([cluster, slug]) =>
    buildEntity({
      id: `test:${slug}`,
      type: "test",
      cluster,
      label: slug,
      paths: localizedPaths(slug, "tests"),
      rowsByPath,
      linksByPath,
      duplicateReport,
    })
  );

  const personalityEntities = groupedSlugs(rows, "personality_detail")
    .filter((slug) => /^[a-z]{4}-[at]$/i.test(slug))
    .map((slug) =>
      buildEntity({
        id: `personality:${slug}`,
        type: "personality_type",
        cluster: "mbti",
        label: slug,
        paths: localizedPaths(slug, "personality"),
        rowsByPath,
        linksByPath,
        duplicateReport,
      })
    );

  const traitEntities = BIG_FIVE_TRAITS.map((trait) =>
    buildEntity({
      id: `trait:${trait}`,
      type: "trait_dimension",
      cluster: "big-five",
      label: trait,
      paths: localizedPaths(trait, "personality/traits"),
      rowsByPath,
      linksByPath,
      duplicateReport,
    })
  );

  const riasecEntities = RIASEC_TYPES.map((code) =>
    buildEntity({
      id: `riasec:${code}`,
      type: "riasec_type",
      cluster: "riasec",
      label: code,
      paths: localizedPaths(code, "career/interests"),
      rowsByPath,
      linksByPath,
      duplicateReport,
    })
  );

  const careerFamilyAuthorityRisk = (careerAuthorityAudit.summary?.p1Clusters || 0) > 0 ? "p1" : "none";
  const careerFamilyEntities = groupedSlugs(rows, "career_family").map((slug) =>
      buildEntity({
        id: `career_family:${slug}`,
        type: "career_family",
        cluster: "career",
        label: slug,
        paths: localizedPaths(slug, "career/family"),
        rowsByPath,
        linksByPath,
        duplicateReport,
        authorityRisk: careerFamilyAuthorityRisk,
      })
  );

  const careerJobEntities = groupedSlugs(rows, "career_job_detail").map((slug) =>
      buildEntity({
        id: `career_job:${slug}`,
        type: "career_job",
        cluster: "career",
        label: slug,
        paths: localizedPaths(slug, "career/jobs"),
        rowsByPath,
        linksByPath,
        duplicateReport,
      })
  );

  const articleEntities = groupedSlugs(rows, "article_detail").map((slug) =>
      buildEntity({
        id: `article:${slug}`,
        type: "article",
        cluster: "article",
        label: slug,
        paths: localizedPaths(slug, "articles"),
        rowsByPath,
        linksByPath,
        duplicateReport,
      })
  );

  const entities = [
    ...topicEntities,
    ...testEntities,
    ...personalityEntities,
    ...traitEntities,
    ...riasecEntities,
    ...careerFamilyEntities,
    ...careerJobEntities,
    ...articleEntities,
  ].sort((a, b) => a.type.localeCompare(b.type) || a.cluster.localeCompare(b.cluster) || a.id.localeCompare(b.id));

  const graphReadinessMatrix = CORE_TOPIC_SLUGS.map((cluster) => {
    const clusterEntities = entities.filter((entity) => entity.cluster === cluster);
    return {
      cluster,
      entityCount: clusterEntities.length,
      readinessCounts: countBy(clusterEntities, "graphReadiness"),
      missingPublicRoutes: clusterEntities.filter((entity) => entity.discoverabilityState === "missing_public_route").length,
      trueOrphanEntities: clusterEntities.filter((entity) => (entity.orphanState.true_orphan || 0) > 0).length,
      duplicateRiskEntities: clusterEntities.filter((entity) => entity.duplicateEntityRisk !== "none").length,
    };
  });

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    source: {
      urlInventory: args.urlInventory,
      urlInventoryVersion: inventory.version || "",
      internalLinkGraph: args.internalLinkGraph,
      internalLinkGraphVersion: internalLinkGraph.version || "",
      duplicateReport: args.duplicateReport,
      duplicateReportVersion: duplicateReport.version || "",
      careerAuthorityAudit: args.careerAuthorityAudit,
      careerAuthorityAuditVersion: careerAuthorityAudit.version || "",
      limitation: "Read-only graph inventory. Static link graph does not infer CMS-rendered runtime links.",
    },
    scope: {
      clusters: CORE_TOPIC_SLUGS,
      entityTypes: ["topic", "test", "personality_type", "trait_dimension", "riasec_type", "career_family", "career_job", "article"],
      forbiddenRuntimeEffects: [
        "no route changes",
        "no SEO exposure changes",
        "no generated graph rendering",
        "no Topic Graph expansion",
      ],
    },
    summary: {
      totalEntities: entities.length,
      entityTypeCounts: countBy(entities, "type"),
      readinessCounts: countBy(entities, "graphReadiness"),
      missingPublicRoutes: entities.filter((entity) => entity.discoverabilityState === "missing_public_route").length,
      trueOrphanEntities: entities.filter((entity) => (entity.orphanState.true_orphan || 0) > 0).length,
      duplicateRiskEntities: entities.filter((entity) => entity.duplicateEntityRisk !== "none").length,
      careerFamilyP1AuthorityClusters: careerAuthorityAudit.summary?.p1Clusters || 0,
    },
    graphReadinessMatrix,
    entities,
  };
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(entities) {
  const headers = [
    "id",
    "type",
    "cluster",
    "label",
    "discoverabilityState",
    "graphReadiness",
    "duplicateEntityRisk",
    "authorityRisk",
    "paths",
    "routeFamilies",
    "evidenceReadiness",
    "orphanState",
  ];
  return [
    headers.join(","),
    ...entities.map((entity) => headers.map((header) => toCsvValue(entity[header])).join(",")),
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args);
  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.output)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.output), `${json}\n`);
  }
  if (args.csv) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.csv)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.csv), `${buildCsv(report.entities)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
