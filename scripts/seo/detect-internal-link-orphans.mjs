#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "url_truth.internal_link_graph.v1";
const DEFAULT_INVENTORY_PATH = "docs/seo/generated/url-inventory.v1.json";
const DEFAULT_SCAN_DIRS = ["app", "components", "lib"];
const IGNORE_DIRS = new Set([".next", ".git", "node_modules", "public", "docs/seo/generated"]);
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx"]);
const INTENTIONAL_ISOLATION_FAMILIES = new Set(["static_legal_help", "dataset", "machine_readable_pointer"]);

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

function normalizePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  let pathname;
  try {
    const url = new URL(raw, "https://fermatmind.com");
    if (url.origin !== "https://fermatmind.com") return "";
    pathname = url.pathname;
  } catch {
    pathname = raw.split("?")[0]?.split("#")[0] ?? raw;
  }
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function walkFiles(startDir) {
  const absoluteStart = path.resolve(ROOT, startDir);
  if (!fs.existsSync(absoluteStart)) return [];
  const files = [];
  const stack = [absoluteStart];

  while (stack.length) {
    const current = stack.pop();
    const rel = path.relative(ROOT, current);
    if (IGNORE_DIRS.has(rel) || [...IGNORE_DIRS].some((dir) => rel.startsWith(`${dir}/`))) continue;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
    } else if (TEXT_EXTENSIONS.has(path.extname(current))) {
      files.push(current);
    }
  }

  return files;
}

function extractLinkedPaths(source) {
  const values = [
    ...source.matchAll(/(?:href|url|canonical|path)\s*[:=]\s*["'`]([^"'`]+)["'`]/gi),
    ...source.matchAll(/https:\/\/fermatmind\.com\/[^\s"'`<>)]+/gi),
    ...source.matchAll(/["'`](\/(?:en|zh)\/[^"'`?#]+)["'`]/gi),
  ].map((match) => match[1] ?? match[0]);

  return values.map(normalizePath).filter((value) => value && !value.includes("*"));
}

function buildLinkGraph(rows) {
  const inventoryPaths = new Set(rows.map((row) => normalizePath(row.path)));
  const inbound = new Map(rows.map((row) => [normalizePath(row.path), new Set()]));
  const sourceFiles = DEFAULT_SCAN_DIRS.flatMap(walkFiles);

  for (const file of sourceFiles) {
    const relFile = path.relative(ROOT, file);
    const links = new Set(extractLinkedPaths(fs.readFileSync(file, "utf8")));
    for (const linkedPath of links) {
      if (inventoryPaths.has(linkedPath)) {
        inbound.get(linkedPath)?.add(relFile);
      }
    }
  }

  return { inbound, scannedFiles: sourceFiles.length };
}

function classify(row, inboundCount) {
  if (INTENTIONAL_ISOLATION_FAMILIES.has(row.routeFamily)) return "intentional_isolation";
  if (inboundCount === 0) return "true_orphan";
  if (inboundCount <= 2) return "weakly_connected";
  return "connected";
}

function buildReport(inventoryPath) {
  const inventory = readJson(inventoryPath);
  const rows = Array.isArray(inventory.rows) ? inventory.rows : [];
  const { inbound, scannedFiles } = buildLinkGraph(rows);
  const items = rows
    .map((row) => {
      const sources = [...(inbound.get(normalizePath(row.path)) ?? [])].sort();
      const classification = classify(row, sources.length);
      return {
        url: row.url,
        path: row.path,
        locale: row.locale,
        routeFamily: row.routeFamily,
        exposureClassification: row.exposureClassification,
        inboundCount: sources.length,
        inboundSources: sources.slice(0, 20),
        graphClassification: classification,
      };
    })
    .sort((a, b) => a.inboundCount - b.inboundCount || a.routeFamily.localeCompare(b.routeFamily) || a.path.localeCompare(b.path));

  const trueOrphans = items.filter((item) => item.graphClassification === "true_orphan");
  const weaklyConnected = items.filter((item) => item.graphClassification === "weakly_connected");
  const lowLinkCareerPages = items.filter(
    (item) => item.routeFamily.startsWith("career_") && item.graphClassification !== "intentional_isolation" && item.inboundCount <= 2
  );

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    source: {
      inventory: inventoryPath,
      inventoryVersion: inventory.version ?? "",
      scannedDirs: DEFAULT_SCAN_DIRS,
      scannedFiles,
      limitation: "Static source scan only; CMS-rendered dynamic links are not inferred.",
    },
    summary: {
      totalUrls: rows.length,
      trueOrphans: trueOrphans.length,
      weaklyConnected: weaklyConnected.length,
      intentionalIsolation: items.filter((item) => item.graphClassification === "intentional_isolation").length,
      connected: items.filter((item) => item.graphClassification === "connected").length,
      lowLinkCareerPages: lowLinkCareerPages.length,
    },
    trueOrphans,
    weaklyConnected,
    lowLinkCareerPages,
    items,
  };
}

function toCsvValue(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(items) {
  const headers = ["path", "locale", "routeFamily", "inboundCount", "graphClassification", "inboundSources"];
  return [
    headers.join(","),
    ...items.map((item) => headers.map((header) => toCsvValue(item[header])).join(",")),
  ].join("\n");
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
    fs.writeFileSync(path.resolve(ROOT, args.csv), `${buildCsv(report.items)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
