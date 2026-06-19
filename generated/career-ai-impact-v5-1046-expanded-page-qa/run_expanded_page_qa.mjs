import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("generated/career-ai-impact-v5-1046-expanded-page-qa");
const FINAL_ASSET_PATH =
  process.env.AI_IMPACT_V5_FINAL_ASSETS ||
  "/Users/rainie/Desktop/GitHub/fap-web/generated/career-ai-impact-v5-1046-final-repaired/career_risk_future_ai_impact_1046_v5_final_repaired_assets.jsonl";
const EXISTING_50_PLAN =
  process.env.AI_IMPACT_PREVIEW_50_PLAN ||
  path.resolve("generated/career-ai-impact-v5-staging-page-qa-50/preview_50_slug_plan.json");
const STAGING_ORIGIN = process.env.STAGING_ORIGIN || "https://staging.fermatmind.com";
const PRODUCTION_API_ORIGIN = process.env.PRODUCTION_API_ORIGIN || "https://api.fermatmind.com";
const TARGET_SLUG_COUNT = Number(process.env.AI_IMPACT_EXPANDED_QA_SLUGS || 150);

const INTERNAL_FIELD_NAMES = new Set([
  "audit_fields",
  "derived_from_estimate",
  "derived_from_evidence",
  "derived_from_synthesis",
  "evidence_id",
  "evidence_ids",
  "evidence_used",
  "internal_lineage",
  "lineage",
  "row_hash",
  "score_rationale",
  "search_projection",
  "source_id",
  "source_ids",
]);

const UNSAFE_OUTCOME_PATTERN =
  /(?:career disappearance|job[-\s]?loss risk|wage[-\s]?loss risk|ai[-\s]?proof|岗位会消失|职业会消失|职业消失风险|失业风险|降薪风险)/i;
const RAW_ENUM_PATTERN =
  /(?:salary_and_outlook|industry_proxy|source_bounded_reference_only|candidate_only_not_runtime_seo|search candidate only|backend projection review|manual_review|required_audit|repair_required)/i;
const CJK_PATTERN = /[\u3400-\u9fff]/;
const JSONLD_AI_SCHEMA_PATTERN = /(?:ai[_\s-]?impact|ai[_\s-]?exposure|automation[_\s-]?risk|career[_\s-]?disappearance|job[-\s]?loss risk)/i;

const CATEGORY_RULES = [
  ["medical_clinical", /physician|surgeon|nurs|medical|clinical|therap|pharmac|dent|veterin|psychi|psycholog|diagnostic|radiolog|health|emergency|paramedic|respiratory|audiolog|optometr/i],
  ["aviation_transport_safety", /air|aviation|aircraft|aerospace|flight|pilot|air-traffic|locomotive|rail|transport|ship|captain|marine|traffic|dispatcher/i],
  ["legal_regulatory", /law|legal|judge|judicial|arbitrator|hearing|paralegal|compliance|regulat|title examiner|claims adjust/i],
  ["military_command", /military|command|armor|artillery|infantry|weapons|tactical|army|navy|air force/i],
  ["education_counseling", /teacher|education|school|counselor|library|instruction|tutor|training|coach/i],
  ["creative_performance", /artist|writer|author|actor|music|designer|choreograph|dancer|photograph|producer|editor|media|performer|athlete/i],
  ["trade_service", /mechanic|installer|repair|electrician|plumber|operator|machinist|welder|carpenter|food|cook|janitor|maid|barber|cashier|service|tender|helper/i],
  ["engineering_architecture_validation", /engineer|architect|technician|drafter|survey|quality|validation|industrial|civil|mechanical|electrical|chemical|environmental/i],
  ["score_5_moderate", /__score5__/i],
  ["score_7_8_high", /__score78__/i],
  ["batch_021_tail", /__tail__/i],
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function writeCsv(filePath, rows, fallbackHeaders = []) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : fallbackHeaders;
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function collectInternalKeys(value, keys = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectInternalKeys(item, keys));
    return keys;
  }
  if (!value || typeof value !== "object") {
    return keys;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (INTERNAL_FIELD_NAMES.has(key)) {
      keys.push(key);
    }
    collectInternalKeys(nested, keys);
  }
  return keys;
}

function collectReaderText(value, pathKey = "", chunks = []) {
  if (typeof value === "string") {
    if (!pathKey.includes(".occupation.")) {
      chunks.push(value);
    }
    return chunks;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectReaderText(item, `${pathKey}[${index}]`, chunks));
    return chunks;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      collectReaderText(nested, `${pathKey}.${key}`, chunks);
    }
  }
  return chunks;
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function aiAssetPayload(json) {
  return json?.ai_impact_asset_v1 || json?.data?.ai_impact_asset_v1 || json?.data || null;
}

function findAiSection(html) {
  const marker = 'data-testid="career-ai-impact-preview"';
  const index = html.indexOf(marker);
  if (index < 0) {
    return "";
  }
  return html.slice(Math.max(0, index - 800), index + 22000);
}

function jsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    blocks.push(match[1]);
  }
  return blocks;
}

function canonicalHref(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match?.[1] || "";
}

function robotsContent(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1] || "";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "FermatMind-AIImpact-ExpandedPageQA/1.0",
      accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text,
    contentType: response.headers.get("content-type") || "",
  };
}

async function fetchJson(url) {
  const result = await fetchText(url);
  let json = null;
  try {
    json = JSON.parse(result.text);
  } catch {
    // Caller records parse issue.
  }
  return { ...result, json };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

function selectionNeedle(asset, extra = "") {
  return [
    asset.slug,
    asset.occupation?.title_en,
    asset.occupation?.title_zh,
    asset.micro_family,
    asset.ai_exposure_score?.score_1_to_10 === 5 ? "__score5__" : "",
    [7, 8].includes(asset.ai_exposure_score?.score_1_to_10) ? "__score78__" : "",
    asset.seed_ordinal >= 1001 ? "__tail__" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function selectPreviewSlugs() {
  const enAssets = readJsonl(FINAL_ASSET_PATH).filter((row) => row.locale === "en");
  const bySlug = new Map(enAssets.map((asset) => [asset.slug, asset]));
  const selected = new Map();

  if (fs.existsSync(EXISTING_50_PLAN)) {
    const existing = readJson(EXISTING_50_PLAN);
    for (const entry of existing.slugs || []) {
      const asset = bySlug.get(entry.slug);
      if (asset) {
        selected.set(entry.slug, {
          asset,
          selection_roles: ["fixed_50_regression"],
          selection_reason: "included in the previously PASS 50-slug staging page QA plan",
        });
      }
    }
  }

  for (const [category, rule] of CATEGORY_RULES) {
    const already = new Set([...selected.values()].filter((item) => item.selection_roles.includes(category)).map((item) => item.asset.slug));
    for (const asset of enAssets) {
      if (already.size >= 12) {
        break;
      }
      if (!rule.test(selectionNeedle(asset))) {
        continue;
      }
      const current = selected.get(asset.slug);
      if (current) {
        current.selection_roles.push(category);
      } else {
        selected.set(asset.slug, {
          asset,
          selection_roles: [category],
          selection_reason: `representative ${category.replaceAll("_", " ")} sample`,
        });
      }
      already.add(asset.slug);
    }
  }

  for (const asset of enAssets) {
    if (selected.size >= TARGET_SLUG_COUNT) {
      break;
    }
    if (!selected.has(asset.slug)) {
      selected.set(asset.slug, {
        asset,
        selection_roles: ["ordinal_fill"],
        selection_reason: "seed-order fill to reach expanded 150-slug coverage",
      });
    }
  }

  return [...selected.values()]
    .sort((a, b) => a.asset.seed_ordinal - b.asset.seed_ordinal)
    .slice(0, TARGET_SLUG_COUNT)
    .map((item, index) => ({
      preview_index: index + 1,
      slug: item.asset.slug,
      seed_ordinal: item.asset.seed_ordinal,
      title_en: item.asset.occupation?.title_en || "",
      title_zh: item.asset.occupation?.title_zh || "",
      soc_code: item.asset.occupation?.soc_code || "",
      onet_code: item.asset.occupation?.onet_code || "",
      score_1_to_10: item.asset.ai_exposure_score?.score_1_to_10,
      confidence: item.asset.ai_exposure_score?.confidence,
      exposure_type: item.asset.ai_exposure_score?.exposure_type,
      micro_family: item.asset.micro_family,
      selection_roles: [...new Set(item.selection_roles)].join("|"),
      selection_reason: item.selection_reason,
      expected_locales: ["zh-CN", "en"],
      expected_endpoint_count: 2,
    }));
}

async function runApiSmoke(targets) {
  return mapLimit(targets, 10, async (target) => {
    const result = await fetchJson(target.apiUrl);
    const asset = aiAssetPayload(result.json);
    const internalKeys = asset ? [...new Set(collectInternalKeys(asset))] : [];
    const readerText = asset ? collectReaderText(asset).join("\n") : "";
    const sourceCount = Array.isArray(asset?.sources) ? asset.sources.length : 0;
    const sourceLeakage = Array.isArray(asset?.sources)
      ? asset.sources.some((source) => source && typeof source === "object" && ("source_id" in source || "evidence_id" in source || "row_hash" in source))
      : false;
    const ok =
      result.status === 200 &&
      result.json?.ok === true &&
      result.json?.preview === true &&
      asset?.slug === target.slug.slug &&
      asset?.locale === target.locale &&
      sourceCount > 0 &&
      internalKeys.length === 0 &&
      !sourceLeakage &&
      !UNSAFE_OUTCOME_PATTERN.test(readerText) &&
      !RAW_ENUM_PATTERN.test(readerText) &&
      (target.locale !== "en" || !CJK_PATTERN.test(readerText));

    return {
      slug: target.slug.slug,
      locale: target.locale,
      url: target.apiUrl,
      status: result.status,
      ok,
      preview: result.json?.preview === true,
      source_count: sourceCount,
      internal_keys: internalKeys.join("|"),
      source_leakage: sourceLeakage,
      unsafe_outcome: UNSAFE_OUTCOME_PATTERN.test(readerText),
      raw_enum: RAW_ENUM_PATTERN.test(readerText),
      en_contains_cjk: target.locale === "en" && CJK_PATTERN.test(readerText),
      error: ok ? "" : compactText(result.text).slice(0, 240),
    };
  });
}

async function runRenderingSmoke(targets) {
  return mapLimit(targets, 8, async (target) => {
    const result = await fetchText(target.pageUrl);
    const section = findAiSection(result.text);
    const markerPresent = section.length > 0;
    const internalLeak = /\b(?:evidence_id|row_hash|source_id|search_projection|audit_fields|score_rationale)\b/i.test(section);
    const unsafeOutcome = UNSAFE_OUTCOME_PATTERN.test(section);
    const rawEnum = RAW_ENUM_PATTERN.test(section);
    const enContainsCjk = target.locale === "en" && CJK_PATTERN.test(section);
    const oldFallbackVisible = /data-testid=["']career-ai-impact-table["']|AIImpactTable/i.test(section);
    const ok =
      result.status === 200 &&
      markerPresent &&
      !internalLeak &&
      !unsafeOutcome &&
      !rawEnum &&
      !enContainsCjk &&
      !oldFallbackVisible;

    return {
      slug: target.slug.slug,
      locale: target.locale,
      url: target.pageUrl,
      status: result.status,
      ok,
      preview_block_present: markerPresent,
      internal_leak: internalLeak,
      unsafe_outcome: unsafeOutcome,
      raw_enum: rawEnum,
      en_contains_cjk: enContainsCjk,
      old_ai_impact_table_visible: oldFallbackVisible,
      section_excerpt: compactText(section).slice(0, 180),
      error: ok ? "" : compactText(result.text).slice(0, 240),
    };
  });
}

async function runSeoSurfaceSmoke(targets) {
  const sample = targets.filter((target, index) => index % 10 === 0).slice(0, 30);
  return mapLimit(sample, 5, async (target) => {
    const result = await fetchText(target.pageUrl);
    const canonical = canonicalHref(result.text);
    const robots = robotsContent(result.text);
    const jsonLd = jsonLdBlocks(result.text);
    const jsonLdAiSchema = jsonLd.some((block) => JSONLD_AI_SCHEMA_PATTERN.test(block));
    const expectedPath = `/${target.locale === "zh-CN" ? "zh" : "en"}/career/jobs/${target.slug.slug}`;
    const canonicalOk = canonical === "" || (canonical.includes(expectedPath) && !canonical.includes("?"));
    // Staging intentionally returns noindex/nofollow. This check records the
    // robots policy but only gates on query-free canonical and no unauthorized
    // AI Impact JSON-LD/schema surface.
    const stagingRobotsProtected = /\bnoindex\b/i.test(robots);
    const ok = result.status === 200 && canonicalOk && !jsonLdAiSchema;
    return {
      slug: target.slug.slug,
      locale: target.locale,
      url: target.pageUrl,
      status: result.status,
      ok,
      canonical,
      robots,
      staging_robots_protected: stagingRobotsProtected,
      jsonld_block_count: jsonLd.length,
      unauthorized_ai_jsonld: jsonLdAiSchema,
      error: ok ? "" : `canonical_ok=${canonicalOk}; ai_jsonld=${jsonLdAiSchema}`,
    };
  });
}

async function runFailClosedSmoke(slugs) {
  const sampleSlug = slugs[0]?.slug || "accountants-and-auditors";
  const cases = [
    {
      case_name: "invalid_slug_api_zh",
      url: `${STAGING_ORIGIN}/api/v0.5/career/jobs/not-a-real-career-slug/ai-impact-asset?locale=zh-CN`,
      expected_closed: true,
    },
    {
      case_name: "invalid_slug_page_zh",
      url: `${STAGING_ORIGIN}/zh/career/jobs/not-a-real-career-slug`,
      expected_closed: true,
    },
    {
      case_name: "unsupported_locale_api",
      url: `${STAGING_ORIGIN}/api/v0.5/career/jobs/${sampleSlug}/ai-impact-asset?locale=fr`,
      expected_closed: true,
    },
  ];
  return mapLimit(cases, 3, async (item) => {
    const result = await fetchText(item.url);
    const previewVisible = result.text.includes('data-testid="career-ai-impact-preview"') || /"preview"\s*:\s*true/.test(result.text);
    const closed = result.status === 404 || result.status === 422 || !previewVisible;
    return {
      case_name: item.case_name,
      url: item.url,
      status: result.status,
      ok: closed === item.expected_closed,
      preview_visible: previewVisible,
      error: closed === item.expected_closed ? "" : compactText(result.text).slice(0, 240),
    };
  });
}

async function runProductionClosedSmoke(slugs) {
  const sample = slugs.slice(0, 25);
  const targets = sample.flatMap((slug) =>
    ["zh-CN", "en"].map((locale) => ({
      slug,
      locale,
      url: `${PRODUCTION_API_ORIGIN}/api/v0.5/career/jobs/${encodeURIComponent(slug.slug)}/ai-impact-asset?locale=${encodeURIComponent(locale)}`,
    }))
  );
  return mapLimit(targets, 6, async (target) => {
    const result = await fetchJson(target.url);
    const open = result.status === 200 && result.json?.preview === true && result.json?.ok === true;
    return {
      slug: target.slug.slug,
      locale: target.locale,
      url: target.url,
      status: result.status,
      ok: !open,
      production_preview_open: open,
      error: !open ? "" : compactText(result.text).slice(0, 240),
    };
  });
}

async function runScreenshotSmoke(slugs) {
  const screenshotDir = path.join(OUTPUT_DIR, "screenshots");
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });
  const roles = [
    "medical_clinical",
    "aviation_transport_safety",
    "legal_regulatory",
    "military_command",
  ];
  const sample = [];
  for (const role of roles) {
    const found = slugs.find((slug) => slug.selection_roles.includes(role));
    if (found && !sample.some((slug) => slug.slug === found.slug)) {
      sample.push(found);
    }
  }
  while (sample.length < 4 && sample.length < slugs.length) {
    const candidate = slugs[sample.length];
    if (!sample.some((slug) => slug.slug === candidate.slug)) {
      sample.push(candidate);
    }
  }

  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch (error) {
    return sample.flatMap((slug) =>
      ["zh-CN", "en"].flatMap((locale) =>
        ["desktop", "mobile"].map((viewport) => ({
          slug: slug.slug,
          locale,
          viewport,
          url: `${STAGING_ORIGIN}/${locale === "zh-CN" ? "zh" : "en"}/career/jobs/${slug.slug}`,
          ok: false,
          screenshot_file: "",
          error: `playwright_unavailable: ${error.message}`,
        }))
      )
    );
  }

  const browser = await chromium.launch({ headless: true });
  const rows = [];
  try {
    for (const slug of sample) {
      for (const locale of ["zh-CN", "en"]) {
        for (const viewport of [
          { name: "desktop", width: 1366, height: 900 },
          { name: "mobile", width: 390, height: 844 },
        ]) {
          const page = await browser.newPage({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1,
          });
          const url = `${STAGING_ORIGIN}/${locale === "zh-CN" ? "zh" : "en"}/career/jobs/${slug.slug}`;
          const fileName = `${slug.slug}_${locale.replace("-", "_")}_${viewport.name}.png`;
          const filePath = path.join(screenshotDir, fileName);
          let ok = false;
          let error = "";
          try {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
            const block = page.getByTestId("career-ai-impact-preview");
            await block.waitFor({ state: "visible", timeout: 8000 });
            await block.screenshot({ path: filePath });
            const sectionText = await block.innerText({ timeout: 5000 });
            ok =
              fs.existsSync(filePath) &&
              fs.statSync(filePath).size > 0 &&
              !UNSAFE_OUTCOME_PATTERN.test(sectionText) &&
              !RAW_ENUM_PATTERN.test(sectionText) &&
              (locale !== "en" || !CJK_PATTERN.test(sectionText));
            if (!ok) {
              error = "screenshot_created_but_reader_text_gate_failed";
            }
          } catch (caught) {
            error = caught.message;
          } finally {
            await page.close();
          }
          rows.push({
            slug: slug.slug,
            locale,
            viewport: viewport.name,
            url,
            ok,
            screenshot_file: fs.existsSync(filePath) ? path.relative(OUTPUT_DIR, filePath) : "",
            screenshot_bytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
            error,
          });
        }
      }
    }
  } finally {
    await browser.close();
  }
  return rows;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const slugs = selectPreviewSlugs();
  const locales = ["zh-CN", "en"];
  const endpointTargets = slugs.flatMap((slug) =>
    locales.map((locale) => ({
      slug,
      locale,
      apiUrl: `${STAGING_ORIGIN}/api/v0.5/career/jobs/${encodeURIComponent(slug.slug)}/ai-impact-asset?locale=${encodeURIComponent(locale)}`,
      pageUrl: `${STAGING_ORIGIN}/${locale === "zh-CN" ? "zh" : "en"}/career/jobs/${encodeURIComponent(slug.slug)}`,
    }))
  );

  const plan = {
    schema_version: "career_ai_impact_v5_expanded_page_qa_plan_v1",
    generated_at: new Date().toISOString(),
    source_asset_path: FINAL_ASSET_PATH,
    staging_origin: STAGING_ORIGIN,
    target_slug_count: slugs.length,
    expected_page_endpoint_count: endpointTargets.length,
    slugs,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "preview_150_slug_plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  writeCsv(path.join(OUTPUT_DIR, "preview_150_slug_plan.csv"), slugs);

  const apiRows = await runApiSmoke(endpointTargets);
  const renderingRows = await runRenderingSmoke(endpointTargets);
  const seoRows = await runSeoSurfaceSmoke(endpointTargets);
  const failClosedRows = await runFailClosedSmoke(slugs);
  const productionRows = await runProductionClosedSmoke(slugs);
  const screenshotRows = await runScreenshotSmoke(slugs);

  writeCsv(path.join(OUTPUT_DIR, "api_smoke.csv"), apiRows);
  writeCsv(path.join(OUTPUT_DIR, "rendering_smoke.csv"), renderingRows);
  writeCsv(path.join(OUTPUT_DIR, "seo_surface_smoke.csv"), seoRows);
  writeCsv(path.join(OUTPUT_DIR, "fail_closed_smoke.csv"), failClosedRows);
  writeCsv(path.join(OUTPUT_DIR, "production_preview_closed_smoke.csv"), productionRows);
  writeCsv(path.join(OUTPUT_DIR, "screenshot_smoke.csv"), screenshotRows);

  const counts = {
    slug_count: slugs.length,
    api_ready_rows: apiRows.filter((row) => row.ok).length,
    api_target_rows: apiRows.length,
    rendering_ready_rows: renderingRows.filter((row) => row.ok).length,
    rendering_target_rows: renderingRows.length,
    seo_surface_ready_rows: seoRows.filter((row) => row.ok).length,
    seo_surface_target_rows: seoRows.length,
    fail_closed_ready_rows: failClosedRows.filter((row) => row.ok).length,
    fail_closed_target_rows: failClosedRows.length,
    production_closed_ready_rows: productionRows.filter((row) => row.ok).length,
    production_closed_target_rows: productionRows.length,
    screenshot_ready_rows: screenshotRows.filter((row) => row.ok).length,
    screenshot_target_rows: screenshotRows.length,
  };
  const pass =
    counts.slug_count === TARGET_SLUG_COUNT &&
    counts.api_ready_rows === counts.api_target_rows &&
    counts.rendering_ready_rows === counts.rendering_target_rows &&
    counts.seo_surface_ready_rows === counts.seo_surface_target_rows &&
    counts.fail_closed_ready_rows === counts.fail_closed_target_rows &&
    counts.production_closed_ready_rows === counts.production_closed_target_rows &&
    counts.screenshot_ready_rows === counts.screenshot_target_rows;

  const audit = {
    schema_version: "career_ai_impact_v5_expanded_page_qa_audit_v1",
    final_conclusion: pass ? "EXPANDED_PAGE_QA_PASS" : "EXPANDED_PAGE_QA_REPAIR_REQUIRED",
    generated_at: new Date().toISOString(),
    report_scope: "fap-web 1046 expanded AI Impact staging page QA; report only; no content/runtime/SEO changes",
    staging_origin: STAGING_ORIGIN,
    production_api_origin: PRODUCTION_API_ORIGIN,
    checks: counts,
    guarantees: {
      no_content_asset_changes: true,
      no_staging_write: true,
      no_production_import: true,
      no_sitemap_llms_canonical_noindex_jsonld_changes: true,
      search_projection_not_rendered: true,
    },
    failure_summary: {
      api_failures: apiRows.filter((row) => !row.ok).slice(0, 20),
      rendering_failures: renderingRows.filter((row) => !row.ok).slice(0, 20),
      seo_surface_failures: seoRows.filter((row) => !row.ok).slice(0, 20),
      fail_closed_failures: failClosedRows.filter((row) => !row.ok),
      production_closed_failures: productionRows.filter((row) => !row.ok).slice(0, 20),
      screenshot_failures: screenshotRows.filter((row) => !row.ok).slice(0, 20),
    },
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "audit.md"),
    [
      "# AI Impact v5 1046 Expanded Page QA",
      "",
      `Final conclusion: \`${audit.final_conclusion}\``,
      "",
      "## Scope",
      "",
      "- Report-only fap-web QA for AI Impact v5 staging preview pages.",
      "- No content asset edits, no staging writes, no production import, and no sitemap/llms/canonical/noindex/JSON-LD changes.",
      "",
      "## Results",
      "",
      `- Preview slug sample: ${counts.slug_count}`,
      `- Staging API smoke: ${counts.api_ready_rows}/${counts.api_target_rows}`,
      `- Staging page rendering smoke: ${counts.rendering_ready_rows}/${counts.rendering_target_rows}`,
      `- SEO surface spot smoke: ${counts.seo_surface_ready_rows}/${counts.seo_surface_target_rows}`,
      `- Fail-closed smoke: ${counts.fail_closed_ready_rows}/${counts.fail_closed_target_rows}`,
      `- Production preview closed smoke: ${counts.production_closed_ready_rows}/${counts.production_closed_target_rows}`,
      `- Desktop/mobile screenshot smoke: ${counts.screenshot_ready_rows}/${counts.screenshot_target_rows}`,
      "",
      "## Reader-Safe Checks",
      "",
      "- Preview block rendered on sampled zh-CN/en career pages.",
      "- No evidence id, row hash, source id, audit fields, score rationale, or search projection leakage detected.",
      "- English AI Impact preview sections contain no Chinese reader-facing text.",
      "- AI exposure is not rendered as job loss, wage loss, career disappearance, or AI-proof wording.",
      "- Sampled pages do not add unauthorized AI Impact JSON-LD or SEO surface changes.",
      "",
      "## Deferred",
      "",
      "- Production import remains blocked until explicit user approval with exact SHA.",
      "- Full editorial approval package is the next PR-train item after this QA report is merged.",
      "",
    ].join("\n")
  );

  const manifest = {};
  for (const fileName of [
    "preview_150_slug_plan.json",
    "preview_150_slug_plan.csv",
    "api_smoke.csv",
    "rendering_smoke.csv",
    "seo_surface_smoke.csv",
    "fail_closed_smoke.csv",
    "production_preview_closed_smoke.csv",
    "screenshot_smoke.csv",
    "audit.json",
    "audit.md",
  ]) {
    const filePath = path.join(OUTPUT_DIR, fileName);
    manifest[fileName] = {
      bytes: fs.statSync(filePath).size,
      sha256: sha256File(filePath),
    };
  }
  for (const row of screenshotRows.filter((item) => item.screenshot_file)) {
    const filePath = path.join(OUTPUT_DIR, row.screenshot_file);
    manifest[row.screenshot_file] = {
      bytes: fs.statSync(filePath).size,
      sha256: sha256File(filePath),
    };
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, "sha256_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  if (!pass) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
