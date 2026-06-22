#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = "2026-06-22";
const SITE_ORIGIN = "https://fermatmind.com";
const DEFAULT_COHORT_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-seo-measurement-cohort-2026-06-22.json",
);
const OUTPUT_JSON = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-${GENERATED_DATE}.md`,
);

function sha256(value) {
  return crypto.createHash("sha256").update(value ?? "").digest("hex");
}

function normalizeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value).trim(), SITE_ORIGIN);
    url.hash = "";
    url.search = "";
    const pathname = url.pathname !== "/" ? url.pathname.replace(/\/+$/, "") : "/";
    return `${url.origin}${pathname}`;
  } catch {
    return "";
  }
}

function parseNumber(value) {
  const raw = String(value ?? "").replaceAll(",", "").replaceAll("%", "").trim();
  if (raw === "") return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCtr(value) {
  const raw = String(value ?? "").trim();
  if (raw.endsWith("%")) return parseNumber(raw) / 100;
  const parsed = parseNumber(raw);
  return parsed > 1 ? parsed / 100 : parsed;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((cell) => cell.trim().toLowerCase());
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""])),
  );
}

function pick(row, candidates) {
  for (const key of candidates) {
    const normalized = key.toLowerCase();
    if (Object.hasOwn(row, normalized)) return row[normalized];
  }
  return "";
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readGscCsv(filePath) {
  if (!filePath) return null;
  const text = await fs.readFile(filePath, "utf8");
  const rows = parseCsv(text);
  const sourceKind =
    getArgValue("--source-kind") ??
    process.env.MBTI64_GSC_SOURCE_KIND ??
    (filePath.toLowerCase().includes("page-snapshot")
      ? "gsc_browser_page_table_snapshot"
      : "gsc_performance_csv_export");
  return {
    path: filePath,
    source_kind: sourceKind,
    sha256: sha256(text),
    row_count: rows.length,
    rows,
  };
}

function aggregateGscRows(rows, cohortUrlSet) {
  const byUrl = new Map();
  const unmatchedRows = [];

  for (const row of rows) {
    const url = normalizeUrl(
      pick(row, ["page", "url", "landing page", "pages", "top pages", "canonical url"]),
    );
    const query = pick(row, ["query", "queries", "top queries", "search query"]);
    const clicks = parseNumber(pick(row, ["clicks", "click"]));
    const impressions = parseNumber(pick(row, ["impressions", "impression"]));
    const ctr = parseCtr(pick(row, ["ctr"]));
    const position = parseNumber(pick(row, ["position", "avg position", "average position"]));

    if (!cohortUrlSet.has(url)) {
      unmatchedRows.push({ url, query, clicks, impressions, ctr, position });
      continue;
    }

    const item =
      byUrl.get(url) ??
      {
        clicks: 0,
        impressions: 0,
        weighted_position_sum: 0,
        position_weight: 0,
        queries: new Map(),
      };
    item.clicks += clicks;
    item.impressions += impressions;
    if (position > 0 && impressions > 0) {
      item.weighted_position_sum += position * impressions;
      item.position_weight += impressions;
    }
    if (query) {
      const existing = item.queries.get(query) ?? { query, clicks: 0, impressions: 0, ctr: 0, position: 0 };
      existing.clicks += clicks;
      existing.impressions += impressions;
      existing.ctr = existing.impressions > 0 ? existing.clicks / existing.impressions : ctr;
      existing.position = position || existing.position;
      item.queries.set(query, existing);
    }
    byUrl.set(url, item);
  }

  return {
    byUrl,
    unmatchedRows,
  };
}

function classifyOpportunity(metrics) {
  if (metrics.status === "GSC_IMPORTED_NO_ROW_FOR_URL") {
    return {
      tier: "P3_NO_GSC_VISIBILITY_YET",
      reason: "The attached GSC page-level snapshot contains no row for this URL in the selected window.",
    };
  }
  if (metrics.status !== "GSC_IMPORTED") {
    return {
      tier: "PENDING_GSC_EXPORT",
      reason: "No verified GSC export was attached to this import run.",
    };
  }
  if (metrics.impressions >= 100 && metrics.ctr < 0.005) {
    return {
      tier: "P0_HIGH_IMPRESSIONS_LOW_CTR",
      reason: "High impressions with near-zero CTR; prioritize title/description hypothesis review.",
    };
  }
  if (metrics.impressions >= 30 && metrics.clicks === 0) {
    return {
      tier: "P1_VISIBLE_NO_CLICKS",
      reason: "Visible in search but no clicks; inspect query-title alignment.",
    };
  }
  if (metrics.impressions > 0) {
    return {
      tier: "P2_EARLY_VISIBILITY_OBSERVE",
      reason: "Some visibility exists; observe trend before rewriting.",
    };
  }
  return {
    tier: "P3_NO_GSC_VISIBILITY_YET",
    reason: "No GSC impressions in the attached export window.",
  };
}

function buildExportInstructions() {
  return {
    source: "Google Search Console Performance > Search results",
    property: "sc-domain:fermatmind.com",
    date_window_recommended: "last_7_days_or_last_28_days",
    filters: [
      "Page contains /personality/",
      "Export table including page, query, clicks, impressions, CTR, and position where available.",
    ],
    accepted_csv_columns: {
      page: ["page", "url", "landing page", "top pages", "canonical url"],
      query: ["query", "queries", "top queries", "search query"],
      clicks: ["clicks"],
      impressions: ["impressions"],
      ctr: ["ctr"],
      position: ["position", "avg position", "average position"],
    },
    rerun_command:
      "node scripts/seo/import-mbti64-gsc-measurement-cohort.mjs --gsc-csv=/absolute/path/to/gsc-export.csv",
  };
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

async function main() {
  const cohort = await readJson(DEFAULT_COHORT_PATH);
  const gscCsvPath = getArgValue("--gsc-csv") ?? process.env.MBTI64_GSC_CSV ?? null;
  const gsc = await readGscCsv(gscCsvPath);
  const cohortUrlSet = new Set(cohort.records.map((record) => normalizeUrl(record.url)));
  const aggregate = gsc ? aggregateGscRows(gsc.rows, cohortUrlSet) : null;

  const records = cohort.records.map((record) => {
    const url = normalizeUrl(record.url);
    const gscItem = aggregate?.byUrl.get(url);
    const clicks = gscItem?.clicks ?? null;
    const impressions = gscItem?.impressions ?? null;
    const averagePosition =
      gscItem && gscItem.position_weight > 0
        ? Number((gscItem.weighted_position_sum / gscItem.position_weight).toFixed(2))
        : null;
    const ctr = impressions && impressions > 0 ? Number((clicks / impressions).toFixed(6)) : null;
    const metrics = gscItem
      ? {
          status: "GSC_IMPORTED",
          clicks,
          impressions,
          ctr,
          average_position: averagePosition,
          source_kind: gsc.source_kind,
          queries: Array.from(gscItem.queries.values())
            .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
            .slice(0, 10),
        }
      : {
          status: gsc ? "GSC_IMPORTED_NO_ROW_FOR_URL" : "GSC_EVIDENCE_PENDING",
          clicks,
          impressions,
          ctr,
          average_position: averagePosition,
          source_kind: gsc?.source_kind ?? null,
          queries: [],
        };

    return {
      url,
      path: record.path,
      locale: record.locale,
      page_type: record.page_type,
      mbti_type: record.mbti_type,
      variant: record.variant,
      cohort_group: record.cohort_group,
      live_hashes: {
        title_hash: record.live.title_hash,
        description_hash: record.live.description_hash,
        h1_hash: record.live.h1_hash,
      },
      index_surfaces: record.index_surfaces,
      search_queue: record.search_queue,
      gsc: metrics,
      opportunity: classifyOpportunity(metrics),
    };
  });

  const counts = {
    total: records.length,
    with_gsc_rows: records.filter((record) => record.gsc.status === "GSC_IMPORTED").length,
    pending_gsc: records.filter((record) => record.gsc.status === "GSC_EVIDENCE_PENDING").length,
    imported_no_row: records.filter((record) => record.gsc.status === "GSC_IMPORTED_NO_ROW_FOR_URL").length,
    p0: records.filter((record) => record.opportunity.tier === "P0_HIGH_IMPRESSIONS_LOW_CTR").length,
    p1: records.filter((record) => record.opportunity.tier === "P1_VISIBLE_NO_CLICKS").length,
    p2: records.filter((record) => record.opportunity.tier === "P2_EARLY_VISIBILITY_OBSERVE").length,
    p3: records.filter((record) => record.opportunity.tier === "P3_NO_GSC_VISIBILITY_YET").length,
  };

  const blockers = [];
  const warnings = [];
  if (records.length !== 96) blockers.push(`expected_96_records_found_${records.length}`);
  if (!gsc) warnings.push("NO_GSC_EXPORT_ATTACHED");
  if (gsc?.source_kind === "gsc_browser_page_table_snapshot") {
    warnings.push("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_UNAVAILABLE");
  }
  if (aggregate && aggregate.unmatchedRows.length > 0) {
    warnings.push(`GSC_EXPORT_UNMATCHED_ROWS_${aggregate.unmatchedRows.length}`);
  }

  const output = {
    artifact: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision: gsc
      ? blockers.length === 0
        ? "PASS_GSC_IMPORTED_PRIORITY_READY"
        : "NO_GO_GSC_IMPORT_BLOCKED"
      : "PASS_IMPORTER_READY_GSC_EXPORT_REQUIRED",
    input_artifacts: {
      cohort: "docs/seo/personality/mbti64-seo-measurement-cohort-2026-06-22.json",
      gsc_csv: gsc
        ? {
            path: gsc.path,
            source_kind: gsc.source_kind,
            sha256: gsc.sha256,
            row_count: gsc.row_count,
          }
        : null,
    },
    summary: counts,
    records,
    unmatched_gsc_rows: aggregate?.unmatchedRows.slice(0, 50) ?? [],
    export_instructions: buildExportInstructions(),
    blockers,
    warnings,
    safety_boundary: {
      repo_artifact_only: true,
      gsc_api_call_attempted: false,
      read_only_browser_table_snapshot_used: gsc?.source_kind === "gsc_browser_page_table_snapshot",
      cms_write_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
    },
    recommended_next_task: gsc
      ? "MBTI64-AGENT-OPTIMIZATION-PRIORITY-SELECTION-01"
      : "MBTI64-SEO-MEASUREMENT-COHORT-GSC-EXPORT-ATTACH-01",
  };

  const md = [
    "# MBTI64 SEO Measurement Cohort GSC Import",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    "",
    "## Summary",
    "",
    `- Cohort URLs: ${counts.total}`,
    `- URLs with imported GSC rows: ${counts.with_gsc_rows}`,
    `- URLs pending GSC evidence: ${counts.pending_gsc}`,
    `- URLs with imported export but no row: ${counts.imported_no_row}`,
    `- P0 high impressions low CTR: ${counts.p0}`,
    `- P1 visible no clicks: ${counts.p1}`,
    `- P2 early visibility observe: ${counts.p2}`,
    `- P3 no GSC visibility yet: ${counts.p3}`,
    "",
    "## GSC Source",
    "",
    gsc
      ? `- Imported CSV: ${gsc.path}\n- Source kind: ${gsc.source_kind}\n- CSV SHA256: ${gsc.sha256}\n- CSV rows: ${gsc.row_count}`
      : "- No verified GSC Performance export or browser table snapshot was attached. This artifact provides the importer and preserves the evidence boundary.",
    gsc?.source_kind === "gsc_browser_page_table_snapshot"
      ? "\nSource limitation: this is a GSC page-dimension browser table snapshot, so query-level rows are not available in this artifact."
      : "",
    "",
    "## Required Export",
    "",
    "- Source: Google Search Console Performance > Search results",
    "- Property: sc-domain:fermatmind.com",
    "- Suggested filter: Page contains `/personality/`",
    "- Required fields: page/url, query if available, clicks, impressions, CTR, position.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Safety Boundary",
    "",
    gsc?.source_kind === "gsc_browser_page_table_snapshot"
      ? "- Read-only Chrome/GSC table capture was used. No GSC API call, Request Indexing, CMS write, Search Queue mutation, live submit, sitemap/llms mutation, or frontend runtime change was performed."
      : "- No GSC API call, CMS write, Search Queue mutation, live submit, sitemap/llms mutation, or frontend runtime change was performed.",
    "",
  ].join("\n");

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  console.log(JSON.stringify({ output_json: OUTPUT_JSON, output_md: OUTPUT_MD, final_decision: output.final_decision }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
