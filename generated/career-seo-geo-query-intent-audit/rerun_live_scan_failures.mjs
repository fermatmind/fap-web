import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const AUDIT_DIR = path.resolve("generated/career-seo-geo-query-intent-audit");
const RELEASE_DIR = path.resolve("generated/career-seo-geo-release-gate");
const LIVE_SCAN_PATH = path.join(AUDIT_DIR, "live_page_scan.csv");
const REPAIR_PLAN_PATH = path.join(AUDIT_DIR, "live_scan_repair_plan.csv");
const QUERY_AUDIT_PATH = path.join(AUDIT_DIR, "query_intent_audit.json");
const CONCURRENCY = Number(process.env.RERUN_CONCURRENCY || 6);
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 12000);

const INTENTS = [
  "what-is",
  "salary",
  "career-path",
  "skills",
  "AI-impact",
  "fit",
  "adjacent",
  "education",
  "certification",
];
const INTERNAL_PATTERN =
  /(?:evidence_id|source_id|source_trace_id|row_hash|search_projection|audit_fields|compile_refs|crosswalk_ids|import_run_id|compile_run_id|index_state_id)/i;

function parseCsv(text) {
  const lines = text.trimEnd().split("\n");
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function stripElementBlocks(html, tagName) {
  let output = String(html || "");
  const openNeedle = `<${tagName}`;
  const closeNeedle = `</${tagName}`;
  while (true) {
    const lower = output.toLowerCase();
    const start = lower.indexOf(openNeedle);
    if (start < 0) return output;
    const closeStart = lower.indexOf(closeNeedle, start + openNeedle.length);
    if (closeStart < 0) return `${output.slice(0, start)} `;
    const closeEnd = output.indexOf(">", closeStart + closeNeedle.length);
    output = `${output.slice(0, start)} ${closeEnd < 0 ? "" : output.slice(closeEnd + 1)}`;
  }
}

function stripScripts(html) {
  return stripElementBlocks(stripElementBlocks(html, "script"), "style");
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function textOnly(html) {
  return decodeEntities(stripScripts(html).replace(/<[^>]+>/g, " "));
}

function firstMatch(html, regex) {
  return decodeEntities(html.match(regex)?.[1] || "");
}

function allMatches(html, regex) {
  return [...html.matchAll(regex)].map((match) => decodeEntities(match[1])).filter(Boolean);
}

function getMetaDescription(html) {
  return firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
}

function getTitle(html) {
  return firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
}

function getH1(html) {
  return firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
}

function getCanonical(html) {
  return firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
}

function getRobots(html) {
  return firstMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
}

function getFaqSignals(html) {
  return allMatches(html, /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi)
    .filter((text) => /(?:FAQ|常见问题|问题|适合|准备|路径|技能|薪资|AI|相邻|来源|边界|education|certification|salary|skills|path|fit|adjacent)/i.test(text))
    .slice(0, 12);
}

function getSourceSignals(html, apiPayload) {
  const visible = textOnly(html);
  const signals = [];
  for (const label of ["O*NET", "SOC", "BLS", "Bureau of Labor Statistics", "FermatMind", "RIASEC", "Big Five", "MBTI"]) {
    if (visible.includes(label)) signals.push(label);
  }
  const serialized = JSON.stringify(apiPayload || {});
  for (const label of ["sources", "source", "reviewValidity", "career_page_assembly_v1", "displaySurfaceV1"]) {
    if (serialized.includes(label)) signals.push(`api:${label}`);
  }
  return [...new Set(signals)];
}

function inferIntentCoverage(text, title) {
  return {
    "what-is": /(?:是什么|职业|occupation|career|what|does|definition|职责|工作)/i.test(`${title}\n${text}`),
    salary: /(?:薪资|工资|salary|wage|pay|employment)/i.test(text),
    "career-path": /(?:路径|入行|准备|career path|entry|prepare|next step)/i.test(text),
    skills: /(?:技能|能力|skills|tool|knowledge|competenc)/i.test(text),
    "AI-impact": /(?:AI|人工智能|automation|exposure)/i.test(text),
    fit: /(?:适合|匹配|RIASEC|霍兰德|Big Five|MBTI|personality|fit|interest)/i.test(text),
    adjacent: /(?:相邻|相关职业|adjacent|similar|related career)/i.test(text),
    education: /(?:学历|教育|学位|education|degree|school)/i.test(text),
    certification: /(?:证书|资格|认证|certification|license|licensure|credential)/i.test(text),
  };
}

async function fetchText(url, accept = "text/html,application/json;q=0.9,*/*;q=0.8") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        accept,
        "user-agent": "FermatMind-CareerQueryIntentRepairRerun/1.0",
      },
      signal: controller.signal,
    });
    return { status: response.status, text: await response.text(), ok: response.ok };
  } catch (error) {
    return { status: 0, text: String(error?.message || error), ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const result = await fetchText(url, "application/json,text/plain;q=0.8,*/*;q=0.5");
  try {
    return { ...result, json: JSON.parse(result.text) };
  } catch {
    return { ...result, json: null };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index]);
      completed += 1;
      if (completed % 50 === 0 || completed === items.length) console.log(`rerun: ${completed}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, limit) }, worker));
  return results;
}

function repairCategory(row) {
  if (row.page_status === "0" || row.api_status === "0") return "transient_live_scan_timeout_or_rate_limit";
  if (row.page_status === "404") return "live_page_route_or_authority_review";
  if (["500", "502", "503", "504"].includes(row.api_status)) return "career_detail_api_health_review";
  if (row.canonical_ok !== "true") return "canonical_scan_review";
  if (row.noindex === "true") return "indexability_review";
  if (row.internal_leakage === "true") return "projection_leakage_review";
  return "unknown_review";
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function refreshShaManifest() {
  const dirs = [
    "generated/career-seo-geo-query-intent-audit",
    "generated/career-query-intent-projection-candidates",
    "generated/career-seo-geo-release-gate",
  ];
  const files = dirs
    .flatMap((dir) => fs.readdirSync(dir).map((name) => path.join(dir, name)))
    .filter((file) => fs.statSync(file).isFile() && !file.endsWith("sha256_manifest.json"))
    .sort();
  fs.writeFileSync(
    path.join(RELEASE_DIR, "sha256_manifest.json"),
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        file_count: files.length,
        files: files.map((file) => ({ path: file, sha256: sha256File(file), bytes: fs.statSync(file).size })),
      },
      null,
      2,
    )}\n`,
  );
}

async function main() {
  const liveRows = parseCsv(fs.readFileSync(LIVE_SCAN_PATH, "utf8"));
  const repairRows = parseCsv(fs.readFileSync(REPAIR_PLAN_PATH, "utf8"));
  const headers = parseCsvLine(fs.readFileSync(LIVE_SCAN_PATH, "utf8").split("\n")[0]);
  const byKey = new Map(liveRows.map((row) => [`${row.slug}|${row.locale}`, row]));
  console.log(`Rerunning ${repairRows.length} failed rows with concurrency=${CONCURRENCY}`);
  const updatedRows = await mapLimit(repairRows, CONCURRENCY, async (repair) => {
    const existing = byKey.get(`${repair.slug}|${repair.locale}`);
    const [page, api] = await Promise.all([fetchText(repair.page_url), fetchJson(repair.api_url)]);
    const html = page.text || "";
    const visibleText = textOnly(html);
    const title = getTitle(html);
    const description = getMetaDescription(html);
    const h1 = getH1(html);
    const canonical = getCanonical(html);
    const robots = getRobots(html);
    const faqSignals = getFaqSignals(html);
    const sourceSignals = getSourceSignals(html, api.json);
    const coverage = inferIntentCoverage(visibleText, title);
    const next = {
      ...existing,
      page_status: String(page.status),
      api_status: String(api.status),
      title,
      description,
      h1,
      canonical,
      canonical_ok: String(canonical === repair.page_url),
      noindex: String(/noindex/i.test(robots)),
      faq_signals: faqSignals.join("|"),
      source_signals: sourceSignals.join("|"),
      present_intents: INTENTS.filter((intent) => coverage[intent]).join("|"),
      missing_intents: INTENTS.filter((intent) => !coverage[intent]).join("|"),
      internal_leakage: String(INTERNAL_PATTERN.test(visibleText) || INTERNAL_PATTERN.test(JSON.stringify(api.json || {}))),
    };
    byKey.set(`${repair.slug}|${repair.locale}`, next);
    return next;
  });

  const mergedRows = liveRows.map((row) => byKey.get(`${row.slug}|${row.locale}`) || row);
  writeCsv(LIVE_SCAN_PATH, mergedRows, headers);

  const nextRepairRows = mergedRows
    .filter((row) => row.page_status !== "200" || row.api_status !== "200" || row.internal_leakage === "true" || row.canonical_ok !== "true" || row.noindex === "true")
    .map((row) => ({
      slug: row.slug,
      locale: row.locale,
      page_status: row.page_status,
      api_status: row.api_status,
      repair_category: repairCategory(row),
      page_url: row.page_url,
      api_url: row.api_url,
    }));
  writeCsv(REPAIR_PLAN_PATH, nextRepairRows, ["slug", "locale", "page_status", "api_status", "repair_category", "page_url", "api_url"]);

  const summary = JSON.parse(fs.readFileSync(QUERY_AUDIT_PATH, "utf8"));
  const livePage200 = mergedRows.filter((row) => row.page_status === "200").length;
  const api200 = mergedRows.filter((row) => row.api_status === "200").length;
  const internalLeakageCount = mergedRows.filter((row) => row.internal_leakage === "true").length;
  const canonicalFailureCount = mergedRows.filter((row) => row.canonical_ok !== "true").length;
  const noindexCount = mergedRows.filter((row) => row.noindex === "true").length;
  summary.generated_at = new Date().toISOString();
  summary.live_page_200 = livePage200;
  summary.api_200 = api200;
  summary.internal_leakage_count = internalLeakageCount;
  summary.canonical_failure_count = canonicalFailureCount;
  summary.noindex_count = noindexCount;
  summary.live_failure_count = nextRepairRows.length;
  summary.live_scan_repair_plan_rows = nextRepairRows.length;
  summary.final_conclusion =
    livePage200 === 2092 && api200 === 2092 && internalLeakageCount === 0 && canonicalFailureCount === 0 && noindexCount === 0
      ? "CAREER_QUERY_INTENT_LIVE_SCAN_REPAIRED"
      : "CAREER_QUERY_INTENT_LIVE_SCAN_REVIEW_REQUIRED";
  fs.writeFileSync(QUERY_AUDIT_PATH, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(
    path.join(AUDIT_DIR, "live_scan_rerun_report.json"),
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        rerun_input_rows: repairRows.length,
        rerun_updated_rows: updatedRows.length,
        live_page_200: livePage200,
        api_200: api200,
        remaining_repair_rows: nextRepairRows.length,
        remaining_categories: nextRepairRows.reduce((acc, row) => {
          acc[row.repair_category] = (acc[row.repair_category] || 0) + 1;
          return acc;
        }, {}),
        candidate_regenerated: false,
        runtime_modified: false,
        seo_runtime_modified: false,
        cms_written: false,
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(AUDIT_DIR, "live_scan_rerun_report.md"),
    `# Live Scan Failure Rerun\n\n- Rerun input rows: \`${repairRows.length}\`\n- Live page 200: \`${livePage200}/2092\`\n- Detail API 200: \`${api200}/2092\`\n- Remaining repair rows: \`${nextRepairRows.length}\`\n- Candidate regenerated: \`false\`\n- Runtime modified: \`false\`\n- SEO runtime modified: \`false\`\n- CMS written: \`false\`\n\nThis rerun only refreshed failed live/API scan rows. It did not regenerate search projection candidates or modify runtime SEO surfaces.\n`,
  );
  refreshShaManifest();
  console.log(JSON.stringify({ live_page_200: livePage200, api_200: api200, remaining_repair_rows: nextRepairRows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
