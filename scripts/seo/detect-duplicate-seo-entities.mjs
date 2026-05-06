#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "url_truth.duplicate_entity_report.v1";
const DEFAULT_INVENTORY_PATH = "docs/seo/generated/url-inventory.v1.json";

function parseArgs(argv) {
  const args = {
    inventory: DEFAULT_INVENTORY_PATH,
    output: "",
    csv: "",
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--inventory=")) {
      args.inventory = arg.slice("--inventory=".length);
    } else if (arg === "--inventory") {
      args.inventory = argv[++index] || args.inventory;
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

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function lastPathSegment(pathname) {
  const segments = String(pathname || "").split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function getValue(row, keys) {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => {
      if (!acc || typeof acc !== "object") return undefined;
      return acc[part];
    }, row);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function titleKeyForRow(row) {
  const explicit = getValue(row, ["title", "metadata.title", "seo.title"]);
  if (explicit) return normalizeText(explicit);
  return normalizeText(lastPathSegment(row.path));
}

function descriptionKeyForRow(row) {
  return normalizeText(getValue(row, ["description", "metadata.description", "seo.description"]));
}

function canonicalKeyForRow(row) {
  return getValue(row, ["canonicalUrl", "canonical", "metadata.canonical", "seo.canonical"]) || row.url;
}

function stripLocalePrefix(pathname) {
  return String(pathname || "").replace(/^\/(?:en|zh)(?=\/|$)/i, "");
}

function semanticEntityKeyForRow(row) {
  const explicit = getValue(row, ["entityKey", "semanticEntityKey"]);
  if (explicit) return normalizeText(explicit);

  const stripped = stripLocalePrefix(row.path);
  const slug = lastPathSegment(stripped);
  if (row.routeFamily === "career_family") {
    return `career-family:${normalizeCareerFamilySlug(slug)}`;
  }
  if (row.routeFamily === "career_industry_detail") {
    return `career-family:${normalizeText(slug)}`;
  }
  if (row.routeFamily === "personality_detail") {
    return `personality:${normalizeText(slug.replace(/-[at]$/i, ""))}`;
  }
  if (row.routeFamily === "topic_detail") {
    return `topic:${normalizeText(slug)}`;
  }
  if (row.routeFamily === "test_detail") {
    return `test:${normalizeText(slug)}`;
  }
  if (row.routeFamily === "career_job_detail") {
    return `career-job:${normalizeText(slug)}`;
  }

  return `${row.routeFamily}:${normalizeText(stripped || row.path)}`;
}

function normalizeCareerFamilySlug(slug) {
  return normalizeText(String(slug || "").replace(/-[0-9a-f]{8}$/i, ""));
}

function clusterBy(rows, keyFn, { type, severity, skipEmpty = false, source }) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (skipEmpty && !key) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(row);
  }

  return [...buckets.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => ({
      type,
      severity,
      key,
      source,
      count: values.length,
      routeFamilies: [...new Set(values.map((row) => row.routeFamily))].sort(),
      locales: [...new Set(values.map((row) => row.locale))].sort(),
      urls: values.map((row) => row.url).sort(),
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function careerFamilyVariantClusters(rows) {
  const candidates = rows.filter((row) => row.routeFamily === "career_family" || row.routeFamily === "career_industry_detail");
  const clusters = clusterBy(candidates, semanticEntityKeyForRow, {
    type: "career_family_variant",
    severity: "P1",
    source: "path_semantic_entity_key",
  });

  return clusters.filter((cluster) => cluster.urls.some((url) => /\/career\/family\//i.test(url)));
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(clusters) {
  const headers = ["type", "severity", "key", "count", "routeFamilies", "locales", "urls"];
  return [
    headers.join(","),
    ...clusters.map((cluster) => headers.map((header) => toCsvValue(cluster[header])).join(",")),
  ].join("\n");
}

function buildReport(inventoryPath) {
  const inventory = readJson(inventoryPath);
  const rows = Array.isArray(inventory.rows) ? inventory.rows : [];
  const titleClusters = clusterBy(rows, titleKeyForRow, {
    type: "duplicate_title",
    severity: "P2",
    source: "metadata_or_path_derived_title",
    skipEmpty: true,
  });
  const descriptionClusters = clusterBy(rows, descriptionKeyForRow, {
    type: "duplicate_description",
    severity: "P2",
    source: "metadata_description",
    skipEmpty: true,
  });
  const canonicalClusters = clusterBy(rows, canonicalKeyForRow, {
    type: "duplicate_canonical",
    severity: "P1",
    source: "canonical_or_inventory_url",
    skipEmpty: true,
  });
  const semanticEntityClusters = clusterBy(rows, semanticEntityKeyForRow, {
    type: "duplicate_semantic_entity",
    severity: "P2",
    source: "route_family_semantic_entity_key",
    skipEmpty: true,
  });
  const careerFamilyClusters = careerFamilyVariantClusters(rows);
  const clusters = [
    ...canonicalClusters,
    ...descriptionClusters,
    ...titleClusters,
    ...semanticEntityClusters,
    ...careerFamilyClusters,
  ];

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    source: {
      inventory: inventoryPath,
      inventoryVersion: inventory.version ?? "",
      mode: inventory.mode ?? "unknown",
    },
    summary: {
      totalUrls: rows.length,
      duplicateTitleClusters: titleClusters.length,
      duplicateDescriptionClusters: descriptionClusters.length,
      duplicateCanonicalClusters: canonicalClusters.length,
      duplicateSemanticEntityClusters: semanticEntityClusters.length,
      careerFamilyVariantClusters: careerFamilyClusters.length,
      totalClusters: clusters.length,
    },
    titleClusters,
    descriptionClusters,
    canonicalClusters,
    semanticEntityClusters,
    careerFamilyVariantClusters: careerFamilyClusters,
    clusters,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args.inventory);
  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.output)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.output), `${json}\n`);
  }
  if (args.csv) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.csv)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.csv), `${buildCsv(report.clusters)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
