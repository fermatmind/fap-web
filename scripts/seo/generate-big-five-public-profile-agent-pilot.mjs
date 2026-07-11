#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const GENERATED_DATE = process.env.GENERATED_DATE || "2026-06-24";
const GENERATED_AT = process.env.GENERATED_AT || `${GENERATED_DATE}T00:00:00.000Z`;
const SITE_ORIGIN = "https://fermatmind.com";
const INPUT_ROOT = "generated/public-profile-assets/big-five-v1-editorial-repair-01";
const PACKAGE_ROOT = `${INPUT_ROOT}/packages`;
const QA_ROOT = `${INPUT_ROOT}/qa`;
const IMPORT_MAP_PATH = `${INPUT_ROOT}/handoff/backend-import-map.preview.json`;
const RUN_MANIFEST_PATH = `${INPUT_ROOT}/run-manifest.json`;
const SCHEMA_PATH = ".agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json";
const OUTPUT_JSON = `docs/seo/personality/big-five-public-profile-agent-pilot-${GENERATED_DATE}.json`;
const OUTPUT_MD = `docs/seo/personality/big-five-public-profile-agent-pilot-${GENERATED_DATE}.md`;

const QA_REQUIRED = [
  "schema_validation",
  "trademark_claim_gate",
  "claim_risk_gate",
  "duplicate_template_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "seo_projection_gate",
  "bilingual_consistency_gate",
];

const PRIVATE_ROUTE_PATTERN = /\/(private|results?|orders?|pay|payment|history|account)(\/|\b|\?)/i;
const PRIVATE_SECRET_PATTERN = /\b(token|session|result_id|order_id|payment_id)=/i;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relativePath), "utf8"));
}

function writeFile(relativePath, content) {
  const absolute = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function isPathInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

export function authoritativePackageFiles({
  root = ROOT,
  inputRoot = INPUT_ROOT,
  importMapPath = IMPORT_MAP_PATH,
  runManifestPath = RUN_MANIFEST_PATH,
} = {}) {
  const readFromRoot = (relativePath) => JSON.parse(fs.readFileSync(path.resolve(root, relativePath), "utf8"));
  const importMap = readFromRoot(importMapPath);
  const runManifest = readFromRoot(runManifestPath);
  const assets = Array.isArray(importMap.assets) ? importMap.assets : [];

  if (importMap.package_count !== 34 || assets.length !== 34 || importMap.package_count !== assets.length) {
    throw new Error("Big Five import map must authorize exactly 34 packages");
  }
  if (runManifest.package_count !== 34 || runManifest.locales?.en !== 17 || runManifest.locales?.["zh-CN"] !== 17) {
    throw new Error("Big Five run manifest must declare 34 packages with 17 per locale");
  }

  const packageRoot = path.resolve(root, inputRoot, "packages");
  const seenPaths = new Set();
  const rows = assets.map((asset) => {
    if (!asset || typeof asset.path !== "string" || !asset.path.endsWith(".content-package.json")) {
      throw new Error("Big Five import map contains an invalid package path");
    }
    if (asset.entity_type === "facet_detail" || /OCEAN_32/i.test(String(asset.code || ""))) {
      throw new Error(`Forbidden Big Five entity in import map: ${asset.path}`);
    }

    const absolutePath = path.resolve(root, inputRoot, asset.path);
    if (!isPathInside(packageRoot, absolutePath)) {
      throw new Error(`Big Five package path escapes the authorized package root: ${asset.path}`);
    }
    if (seenPaths.has(absolutePath)) {
      throw new Error(`Duplicate Big Five package path in import map: ${asset.path}`);
    }
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      throw new Error(`Missing Big Five package authorized by import map: ${asset.path}`);
    }
    seenPaths.add(absolutePath);

    return {
      asset,
      packagePath: path.relative(root, absolutePath),
    };
  }).sort((left, right) => left.packagePath.localeCompare(right.packagePath));

  const localeCounts = rows.reduce((counts, row) => {
    counts[row.asset.locale] = (counts[row.asset.locale] || 0) + 1;
    return counts;
  }, {});
  const logicalEntities = new Set(rows.map((row) => row.asset.code));
  if (localeCounts.en !== 17 || localeCounts["zh-CN"] !== 17 || logicalEntities.size !== 17) {
    throw new Error("Big Five import map must cover 17 logical entities in both en and zh-CN");
  }

  return rows;
}

function localePath(locale) {
  return locale === "zh-CN" ? "zh" : "en";
}

function text(value) {
  return String(value || "").trim();
}

function firstSection(packageJson, key) {
  return packageJson.sections?.find((section) => section.key === key);
}

function shortBody(value, max = 320) {
  const normalized = text(value).replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}.`;
}

function sourceHashSource(packageJson) {
  return [
    packageJson.package_id,
    packageJson.last_reviewed_at,
    packageJson.title,
    packageJson.summary,
    packageJson.seo?.title,
    packageJson.seo?.description,
  ].filter(Boolean).join("|");
}

function stableHash(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function recommendedTitle(packageJson) {
  const suffix = packageJson.locale === "zh-CN" ? " | 费马测试" : " | FermatMind";
  const current = text(packageJson.seo?.title || packageJson.title);
  if (current.endsWith(suffix)) return current;
  return `${packageJson.title}${suffix}`;
}

function recommendedDescription(packageJson) {
  const summary = shortBody(packageJson.seo?.description || packageJson.summary, 155);
  if (packageJson.locale === "zh-CN") {
    return `${summary} 适合自我理解与沟通反思，不用于诊断、招聘或确定性判断。`;
  }
  return `${summary} Use it for self-understanding and communication reflection, not diagnosis, hiring or deterministic decisions.`;
}

function recommendedQuickAnswer(packageJson) {
  const quick = firstSection(packageJson, "quick_answer")?.body || packageJson.summary;
  return shortBody(quick, 420);
}

function faq(packageJson) {
  return (packageJson.faq || []).slice(0, 5).map((item) => ({
    question: text(item.question),
    answer: shortBody(item.answer, 260),
    reason: "Reuses reviewed public package FAQ intent while preserving Big Five method boundaries.",
  }));
}

function internalLinks(packageJson) {
  return (packageJson.internal_links || [])
    .filter((link) => typeof link.href === "string" && link.href.startsWith(`/${localePath(packageJson.locale)}/`))
    .filter((link) => !PRIVATE_ROUTE_PATTERN.test(link.href))
    .slice(0, 6)
    .map((link) => ({
      href: link.href,
      anchor_text: text(link.label),
      reason: `Reviewed package relationship: ${text(link.relationship || "related_public_route")}.`,
      safe_public_route: true,
    }));
}

function recommendationFromPackage(packagePath, expectedAsset) {
  const packageJson = readJson(packagePath);
  const targetPath = packageJson.canonical?.path;
  if (!targetPath || !targetPath.startsWith(`/${localePath(packageJson.locale)}/personality/`)) {
    throw new Error(`Invalid canonical path in ${packagePath}`);
  }
  if (packageJson.framework !== "big_five") {
    throw new Error(`Unexpected framework in ${packagePath}`);
  }
  if (packageJson.entity_type === "facet_detail" || /OCEAN_32/i.test(packageJson.code)) {
    throw new Error(`Forbidden Big Five entity in ${packagePath}`);
  }
  for (const key of ["locale", "code", "entity_type"]) {
    if (packageJson[key] !== expectedAsset[key]) {
      throw new Error(`Big Five package ${key} does not match import map: ${packagePath}`);
    }
  }
  if (targetPath !== expectedAsset.canonical) {
    throw new Error(`Big Five package canonical does not match import map: ${packagePath}`);
  }

  const recommendation = {
    recommendation_id: `big-five-public-profile-agent-pilot:${targetPath}`,
    target_url: `${SITE_ORIGIN}${targetPath}`,
    framework: "big_five",
    locale: packageJson.locale,
    source_inputs: {
      cms_or_api_snapshot: packagePath,
      reference_pack: `${INPUT_ROOT}/handoff/backend-import-map.preview.json`,
      seo_signal: "GSC_EVIDENCE_PENDING",
      source_ledger: `${INPUT_ROOT}/run-manifest.json`,
    },
    current_surface: {
      title: text(packageJson.seo?.title || packageJson.title),
      description: text(packageJson.seo?.description || packageJson.summary),
      h1: text(packageJson.title),
      quick_answer: text(firstSection(packageJson, "quick_answer")?.body || ""),
      faq_count: Array.isArray(packageJson.faq) ? packageJson.faq.length : 0,
      internal_link_count: Array.isArray(packageJson.internal_links) ? packageJson.internal_links.length : 0,
    },
    observed_signal: {
      evidence_state: "gsc_pending",
      impressions: null,
      clicks: null,
      ctr: null,
      average_position: null,
      notes: ["GSC URL/query evidence is pending for this artifact-only Big Five public profile pilot."],
    },
    reference_patterns_used: [
      {
        pattern_id: "big_five_reviewed_package_projection",
        source_url: `${SITE_ORIGIN}${targetPath}`,
        how_used: "Used the reviewed noindex Big Five package as the current surface and projected draft-only recommendation fields.",
      },
      {
        pattern_id: "public_profile_agent_runner_contract",
        source_url: SCHEMA_PATH,
        how_used: "Kept output compatible with the shared public profile agent recommendation schema.",
      },
    ],
    recommendations: {
      title: {
        current: text(packageJson.seo?.title || packageJson.title),
        recommended: recommendedTitle(packageJson),
        reason: "Normalize the title as a public Big Five profile recommendation while preserving noindex draft status.",
      },
      description: {
        current: text(packageJson.seo?.description || packageJson.summary),
        recommended: recommendedDescription(packageJson),
        reason: "Keep SERP-oriented summary bounded by public education and method-safety language.",
      },
      h1: {
        current: text(packageJson.title),
        recommended: text(packageJson.title),
        reason: "The reviewed package already provides a concise public H1 candidate.",
      },
      quick_answer: {
        current: text(firstSection(packageJson, "quick_answer")?.body || ""),
        recommended: recommendedQuickAnswer(packageJson),
        reason: "Use the reviewed public quick-answer section as the draft recommendation source.",
      },
      faq: faq(packageJson),
      internal_links: internalLinks(packageJson),
      differentiation_notes: [
        `Entity type ${packageJson.entity_type} is treated as a dimensional Big Five public profile, not an official type page.`,
        "High/low wording must remain descriptive and context-dependent, never good/bad ranking.",
        "Draft recommendation is blocked from CMS write, publish, indexability, sitemap, llms and search release until later gates.",
      ],
    },
    qa_required: QA_REQUIRED,
    blocked_reason: null,
    status: "qa_ready",
  };

  return {
    recommendation,
    coverage: {
      recommendation_id: recommendation.recommendation_id,
      target_url: recommendation.target_url,
      package_id: packageJson.package_id,
      locale: packageJson.locale,
      code: packageJson.code,
      slug: packageJson.slug,
      entity_type: packageJson.entity_type,
      source_package_hash: stableHash(sourceHashSource(packageJson)),
      index_eligible: packageJson.index_eligible === true,
      sitemap_eligible: packageJson.sitemap_eligible === true,
      llms_eligible: packageJson.llms_eligible === true,
      launch_state: packageJson.launch_state,
    },
  };
}

function validateRecommendationShape(row, schema) {
  for (const key of schema.required) {
    if (!(key in row)) throw new Error(`Recommendation missing required key ${key}: ${row.recommendation_id}`);
  }
  if (!/^https:\/\/fermatmind\.com\/(en|zh)\/personality\//.test(row.target_url)) {
    throw new Error(`Invalid target_url: ${row.target_url}`);
  }
  if (row.framework !== "big_five") throw new Error(`Invalid framework: ${row.framework}`);
  if (!["en", "zh-CN"].includes(row.locale)) throw new Error(`Invalid locale: ${row.locale}`);
  if (row.status !== "qa_ready") throw new Error(`Invalid status: ${row.status}`);
  const serialized = JSON.stringify(row);
  if (PRIVATE_ROUTE_PATTERN.test(serialized) || PRIVATE_SECRET_PATTERN.test(serialized)) {
    throw new Error(`Forbidden private route or secret marker in ${row.recommendation_id}`);
  }
}

function buildArtifact() {
  const schema = readJson(SCHEMA_PATH);
  const files = authoritativePackageFiles();
  const generatedRows = files.map(({ packagePath, asset }) => recommendationFromPackage(packagePath, asset));
  const recommendations = generatedRows.map((row) => row.recommendation);
  const coverageRows = generatedRows.map((row) => row.coverage);
  for (const row of recommendations) validateRecommendationShape(row, schema);

  const localeCounts = {};
  const entityTypeCounts = {};
  const logicalEntities = new Set();
  for (const row of coverageRows) {
    localeCounts[row.locale] = (localeCounts[row.locale] || 0) + 1;
    entityTypeCounts[row.entity_type] = (entityTypeCounts[row.entity_type] || 0) + 1;
    logicalEntities.add(row.code);
  }

  return {
    artifact: "BIG-FIVE-PUBLIC-PROFILE-AGENT-PILOT-01",
    version: "big_five.public_profile_agent_pilot.v1",
    generated_at: GENERATED_AT,
    status: "pass_ready_for_qa_gates",
    scope: "Artifact-only draft recommendations for Big Five V1 public personality profiles. No CMS write, frontend runtime change, publish, indexability, sitemap/llms mutation, Search Queue, or search submission.",
    inputs: {
      package_root: PACKAGE_ROOT,
      qa_root: QA_ROOT,
      runner_schema: SCHEMA_PATH,
      run_manifest: `${INPUT_ROOT}/run-manifest.json`,
    },
    summary: {
      recommendation_count: recommendations.length,
      logical_entity_count: logicalEntities.size,
      locale_counts: {
        en: localeCounts.en || 0,
        "zh-CN": localeCounts["zh-CN"] || 0,
      },
      entity_type_counts: {
        hub: entityTypeCounts.hub || 0,
        domain: entityTypeCounts.domain || 0,
        polarity: entityTypeCounts.polarity || 0,
        facet_hub: entityTypeCounts.facet_hub || 0,
        facet_detail: entityTypeCounts.facet_detail || 0,
        OCEAN_32: entityTypeCounts.OCEAN_32 || 0,
      },
      gsc_evidence_state: "GSC_EVIDENCE_PENDING",
      qa_gate_required_count: QA_REQUIRED.length,
    },
    negative_guarantees: {
      cms_write: false,
      frontend_runtime_change: false,
      publish: false,
      indexability_change: false,
      sitemap_mutation: false,
      llms_mutation: false,
      search_queue: false,
      search_submission: false,
    },
    coverage: {
      rows: coverageRows,
    },
    recommendations,
  };
}

function markdownTableCell(value) {
  return text(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ")
    .replaceAll("|", "\\|");
}

function markdown(artifact) {
  const sampleRows = artifact.recommendations.slice(0, 12).map((row) => {
    const url = new URL(row.target_url).pathname;
    const coverage = artifact.coverage.rows.find((item) => item.recommendation_id === row.recommendation_id);
    return `| ${url} | ${row.locale} | ${coverage?.entity_type || ""} | ${markdownTableCell(row.recommendations.title.recommended)} |`;
  }).join("\n");

  return `# Big Five Public Profile Agent Pilot

Generated: ${artifact.generated_at}
Status: ${artifact.status}

## Summary

- Recommendation rows: ${artifact.summary.recommendation_count}
- Logical entities: ${artifact.summary.logical_entity_count}
- Locale counts: en=${artifact.summary.locale_counts.en}, zh-CN=${artifact.summary.locale_counts["zh-CN"]}
- Entity type counts: hub=${artifact.summary.entity_type_counts.hub}, domain=${artifact.summary.entity_type_counts.domain}, polarity=${artifact.summary.entity_type_counts.polarity}, facet_hub=${artifact.summary.entity_type_counts.facet_hub}
- Facet detail rows: ${artifact.summary.entity_type_counts.facet_detail}
- OCEAN_32 rows: ${artifact.summary.entity_type_counts.OCEAN_32}
- GSC evidence state: ${artifact.summary.gsc_evidence_state}

## Sample Rows

| URL | Locale | Entity type | Recommended title |
| --- | --- | --- | --- |
${sampleRows}

## Boundary

- Draft recommendations only.
- No CMS write, frontend runtime change, publish, indexability change, sitemap/llms mutation, Search Queue action, or search submission.
- Failed or unreviewed recommendations must not enter the later approval queue or CMS draft path.

## Next Task

BIG-FIVE-PUBLIC-PROFILE-AGENT-QA-01
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const artifact = buildArtifact();
  writeFile(OUTPUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFile(OUTPUT_MD, markdown(artifact));

  console.log(JSON.stringify({
    ok: true,
    output_json: OUTPUT_JSON,
    output_md: OUTPUT_MD,
    recommendation_count: artifact.summary.recommendation_count,
    logical_entity_count: artifact.summary.logical_entity_count,
    locale_counts: artifact.summary.locale_counts,
    entity_type_counts: artifact.summary.entity_type_counts,
  }, null, 2));
}
