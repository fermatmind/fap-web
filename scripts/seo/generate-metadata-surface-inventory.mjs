#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const VERSION = "seo_foundation.metadata_surface_inventory.v1";
const DEFAULT_OUTPUT = "docs/seo/generated/metadata-surface-inventory.v1.json";
const DEFAULT_CSV = "docs/seo/generated/metadata-surface-inventory.v1.csv";

const PRIVATE_ROUTE_RE = /\/(?:tests\/:slug\/take|test\/:slug\/take|result\/|results\/|orders\/|share\/|pay\/|payment\/|history\/|compare\/|relationships\/|attempts\/|workspace\/)/i;

const ROUTE_FAMILY_RULES = [
  [/^\/$/, "home"],
  [/^\/(?:en|zh)?$/, "home"],
  [/\/tests\/category\/:slug$/i, "test_category"],
  [/\/tests\/:slug\/take$/i, "test_take_private"],
  [/\/tests\/:slug\/technical-note$/i, "test_technical_note"],
  [/\/tests\/:slug$/i, "test_detail"],
  [/\/tests$/i, "tests_hub"],
  [/\/topics\/:slug$/i, "topic_detail"],
  [/\/topics$/i, "topics_hub"],
  [/\/articles\/:slug$/i, "article_detail"],
  [/\/articles$/i, "articles_hub"],
  [/\/help\/:slug$/i, "help_detail"],
  [/\/support\/(?:articles|guides)\/:slug$/i, "support_detail"],
  [/\/personality\/:type$/i, "personality_detail"],
  [/\/personality$/i, "personality_hub"],
  [/\/career\/jobs\/:slug$/i, "career_job_detail"],
  [/\/career\/jobs$/i, "career_jobs_hub"],
  [/\/career\/family\/:slug$/i, "career_family"],
  [/\/career\/guides\/:slug$/i, "career_guide_detail"],
  [/\/career\/guides$/i, "career_guides_hub"],
  [/\/career\/industries\/:slug$/i, "career_industry_detail"],
  [/\/career\/recommendations\/mbti\/:type$/i, "career_recommendation_detail"],
  [/\/career(?:\/|$)/i, "career_hub"],
  [/\/datasets\/occupations(?:\/method)?$/i, "dataset"],
  [/\/(?:privacy|terms|support|about|brand|business|careers|charter|foundation|policies)$/i, "static_content_page"],
  [/\/(?:pay|payment|orders|result|results|share|history|compare|relationships|attempts|workspace)(?:\/|$)/i, "private_flow"],
];

const AUTHORITY_OVERRIDES = {
  article_detail: {
    classification: "migration_required",
    ownership: "cms_backed",
    risk: "P1",
    reason: "Article detail can build frontend Article JSON-LD when CMS Article SEO JSON-LD is absent.",
  },
  topic_detail: {
    classification: "watchlist",
    ownership: "cms_backed",
    risk: "P1",
    reason: "Topic detail renders deterministic JSON-LD from CMS-visible content; schema key ownership must be settled before Topic Graph expansion.",
  },
  career_guide_detail: {
    classification: "watchlist",
    ownership: "cms_backed",
    risk: "P1",
    reason: "Career guide detail remains CMS-backed but should require backend schema completeness before expansion.",
  },
  career_job_detail: {
    classification: "backend_owned",
    ownership: "backend_owned",
    risk: "P2",
    reason: "Career job SEO metadata and Occupation JSON-LD are gated by backend seo.surface.v1 and structured data keys.",
  },
  career_family: {
    classification: "backend_owned",
    ownership: "backend_owned",
    risk: "P2",
    reason: "Career family metadata and structured data are sourced from backend family hub bundles.",
  },
  dataset: {
    classification: "backend_owned",
    ownership: "backend_owned",
    risk: "P2",
    reason: "Dataset structured data is rendered from backend dataset bundles.",
  },
  help_detail: {
    classification: "cms_backed",
    ownership: "cms_backed",
    risk: "P2",
    reason: "Help detail metadata and visible FAQ are governed by backend content pages.",
  },
  static_content_page: {
    classification: "safe_static",
    ownership: "cms_backed",
    risk: "P2",
    reason: "Static content pages should remain backend content-page authoritative.",
  },
};

function parseArgs(argv) {
  const args = { output: DEFAULT_OUTPUT, csv: DEFAULT_CSV, pretty: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") args.pretty = true;
    else if (arg === "--output") args.output = argv[++index] || args.output;
    else if (arg.startsWith("--output=")) args.output = arg.slice("--output=".length);
    else if (arg === "--csv") args.csv = argv[++index] || args.csv;
    else if (arg.startsWith("--csv=")) args.csv = arg.slice("--csv=".length);
  }
  return args;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (!/\.(tsx|ts)$/.test(entry.name)) return [];
    return [full];
  });
}

function normalizeRouteFromAppFile(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, "/");
  const withoutLeaf = rel.replace(/\/(?:page|layout|not-found)\.(tsx|ts)$/i, "");
  const parts = withoutLeaf
    .split("/")
    .filter(Boolean)
    .filter((part) => !(part.startsWith("(") && part.endsWith(")")))
    .map((part) => {
      if (part === "[locale]") return ":locale";
      return part.replace(/^\[(.+)\]$/, ":$1");
    })
    .filter((part) => part !== ":locale");

  return `/${parts.join("/")}`.replace(/\/+$/, "") || "/";
}

function routeFamilyFor(routePattern) {
  for (const [pattern, family] of ROUTE_FAMILY_RULES) {
    if (pattern.test(routePattern)) return family;
  }
  return "other";
}

function hasExportedMetadata(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source) ||
    /export\s+const\s+metadata\s*:?\s*(?:Metadata)?\s*=/.test(source);
}

function exportKind(source) {
  const hasGenerateMetadata = /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source);
  const hasDirectMetadata = /export\s+const\s+metadata\s*:?\s*(?:Metadata)?\s*=/.test(source);
  if (hasGenerateMetadata && hasDirectMetadata) return "generateMetadata_and_direct_metadata";
  if (hasGenerateMetadata) return "generateMetadata";
  return "direct_metadata";
}

function classify({ file, routePattern, routeFamily, source }) {
  if (PRIVATE_ROUTE_RE.test(routePattern)) {
    return {
      classification: "private_noindex",
      ownership: "private_noindex",
      risk: "P2",
      reason: "Private or transactional route family must remain noindex and excluded from sitemap/llms/JSON-LD.",
    };
  }

  const override = AUTHORITY_OVERRIDES[routeFamily];
  if (override) return override;

  if (source.includes("seoSurface") || source.includes("seo_surface_v1")) {
    return {
      classification: "backend_owned",
      ownership: "backend_owned",
      risk: "P2",
      reason: "Route consumes backend seo.surface.v1 or equivalent backend SEO bundle.",
    };
  }

  if (/contentPageRoute|content-pages|cms|listCms|getCms|fetch.*Cms/i.test(source)) {
    return {
      classification: "cms_backed",
      ownership: "cms_backed",
      risk: "P2",
      reason: "Route metadata is derived from CMS/public API data.",
    };
  }

  if (/privacy|terms|support|not-found|favicon|root\/layout/i.test(file)) {
    return {
      classification: "safe_static",
      ownership: "product_code_only",
      risk: "P2",
      reason: "Static or framework shell metadata with no CMS-backed public SEO expansion role.",
    };
  }

  return {
    classification: "product_code_only",
    ownership: "product_code_only",
    risk: "P2",
    reason: "Deterministic product-code metadata; keep out of CMS-backed SEO authority unless intentionally migrated.",
  };
}

function rowForFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  if (!hasExportedMetadata(source)) return null;

  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const routePattern = normalizeRouteFromAppFile(filePath);
  const routeFamily = routeFamilyFor(routePattern);
  const authority = classify({ file: rel, routePattern, routeFamily, source });

  return {
    file: rel,
    routePattern,
    routeFamily,
    exportKind: exportKind(source),
    usesBuildPageMetadata: source.includes("buildPageMetadata"),
    usesSeoSurface: source.includes("seoSurface") || source.includes("seo_surface_v1"),
    rendersJsonLd: source.includes("<JsonLd") || source.includes("JsonLd "),
    hasFrontendJsonLdBuilderFallback: /build[A-Za-z]+JsonLd\(/.test(source) || /buildFallback[A-Za-z]+JsonLd/.test(source),
    noindexSignal: /noindex|index:\s*false|robots:\s*{[^}]*index:\s*false/s.test(source),
    ownership: authority.ownership,
    classification: authority.classification,
    risk: authority.risk,
    reason: authority.reason,
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function toCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildCsv(rows) {
  const headers = [
    "file",
    "routePattern",
    "routeFamily",
    "exportKind",
    "ownership",
    "classification",
    "risk",
    "usesBuildPageMetadata",
    "usesSeoSurface",
    "rendersJsonLd",
    "hasFrontendJsonLdBuilderFallback",
    "noindexSignal",
  ];

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(",")),
  ].join("\n");
}

function buildReport() {
  const rows = walk(APP_DIR)
    .map(rowForFile)
    .filter(Boolean)
    .sort((left, right) => left.file.localeCompare(right.file));

  return {
    version: VERSION,
    scope: "PR-SEOF-01",
    runtimeBehaviorChanged: false,
    generatedAt: "offline-reproducible",
    source: {
      appDir: "app",
      scanner: "scripts/seo/generate-metadata-surface-inventory.mjs",
    },
    summary: {
      totalSurfaces: rows.length,
      byClassification: countBy(rows, "classification"),
      byOwnership: countBy(rows, "ownership"),
      byRouteFamily: countBy(rows, "routeFamily"),
      migrationRequiredSurfaces: rows.filter((row) => row.classification === "migration_required").length,
      watchlistSurfaces: rows.filter((row) => row.classification === "watchlist").length,
      privateNoindexSurfaces: rows.filter((row) => row.classification === "private_noindex").length,
      frontendJsonLdFallbackSurfaces: rows.filter((row) => row.hasFrontendJsonLdBuilderFallback).length,
    },
    rows,
    migrationRequired: rows.filter((row) => row.classification === "migration_required"),
    watchlist: rows.filter((row) => row.classification === "watchlist"),
    privateNoindex: rows.filter((row) => row.classification === "private_noindex"),
    blockedBeforeExpansion: [
      "Article JSON-LD frontend fallback must remain migration_required until backend/CMS structured data completeness is authoritative.",
      "llms topic fallback governance must be explicit before Topic Graph expansion.",
      "Topic and career guide schema ownership must be settled before broad SEO/GEO expansion.",
    ],
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport();
  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.output)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.output), `${json}\n`);
  }

  if (args.csv) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.csv)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.csv), `${buildCsv(report.rows)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
