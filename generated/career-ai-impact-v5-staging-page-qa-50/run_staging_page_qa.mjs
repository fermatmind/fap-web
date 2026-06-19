import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("generated/career-ai-impact-v5-staging-page-qa-50");
const PLAN_PATH =
  process.env.AI_IMPACT_PREVIEW_50_PLAN ||
  "/Users/rainie/Desktop/GitHub/fap-web/generated/career-ai-impact-v5-staging-preview-design/preview_50_slug_plan.json";
const STAGING_ORIGIN = process.env.STAGING_ORIGIN || "https://staging.fermatmind.com";
const PRODUCTION_API_ORIGIN = process.env.PRODUCTION_API_ORIGIN || "https://api.fermatmind.com";
const PR_1224_MERGE_SHA = "8f8a69a044a90c891c90f01c4a3cc7094704c1ca";

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
const RAW_ENUM_PATTERN = /(?:salary_and_outlook|industry_proxy|source_bounded_reference_only|candidate_only_not_runtime_seo|search candidate only|backend projection review)/i;
const CJK_PATTERN = /[\u3400-\u9fff]/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function writeCsv(filePath, rows) {
  if (rows.length === 0) {
    fs.writeFileSync(filePath, "");
    return;
  }
  const headers = Object.keys(rows[0]);
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
    for (const item of value) {
      collectInternalKeys(item, keys);
    }
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

function findAiSection(html) {
  const marker = 'data-testid="career-ai-impact-preview"';
  const index = html.indexOf(marker);
  if (index < 0) {
    return "";
  }
  return html.slice(Math.max(0, index - 500), index + 18000);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "FermatMind-AIImpact-StagingQA/1.0",
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
    // Keep parse_error in caller.
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

async function getGitInfo() {
  const { execFileSync } = await import("node:child_process");
  function git(args) {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  }
  let originMainContainsPr1224 = false;
  try {
    git(["merge-base", "--is-ancestor", PR_1224_MERGE_SHA, "origin/main"]);
    originMainContainsPr1224 = true;
  } catch {
    originMainContainsPr1224 = false;
  }
  return {
    head_sha: git(["rev-parse", "HEAD"]),
    origin_main_sha: git(["rev-parse", "origin/main"]),
    pr_1224_merge_sha: PR_1224_MERGE_SHA,
    origin_main_contains_pr_1224: originMainContainsPr1224,
  };
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const plan = readJson(PLAN_PATH);
  const slugs = plan.slugs || [];
  const locales = ["zh-CN", "en"];

  fs.writeFileSync(path.join(OUTPUT_DIR, "preview_50_slug_plan.json"), JSON.stringify(plan, null, 2) + "\n");
  writeCsv(
    path.join(OUTPUT_DIR, "preview_50_slug_plan.csv"),
    slugs.map((slug) => ({
      preview_index: slug.preview_index,
      slug: slug.slug,
      seed_ordinal: slug.seed_ordinal,
      title_en: slug.title_en,
      title_zh: slug.title_zh,
      score_1_to_10: slug.score_1_to_10,
      confidence: slug.confidence,
      exposure_type: slug.exposure_type,
      micro_family: slug.micro_family,
      selection_role: slug.selection_role,
      risk_tags: (slug.risk_tags || []).join("|"),
    }))
  );

  const endpointTargets = slugs.flatMap((slug) =>
    locales.map((locale) => ({
      slug,
      locale,
      apiUrl: `${STAGING_ORIGIN}/api/v0.5/career/jobs/${encodeURIComponent(slug.slug)}/ai-impact-asset?locale=${encodeURIComponent(locale)}`,
      pageUrl: `${STAGING_ORIGIN}/${locale === "zh-CN" ? "zh" : "en"}/career/jobs/${encodeURIComponent(slug.slug)}`,
    }))
  );

  const apiRows = await mapLimit(endpointTargets, 8, async (target) => {
    const result = await fetchJson(target.apiUrl);
    const asset = result.json?.ai_impact_asset_v1;
    const internalKeys = asset ? [...new Set(collectInternalKeys(asset))] : [];
    const readerText = asset ? collectReaderText(asset).join("\n") : "";
    const sourceCount = Array.isArray(asset?.sources) ? asset.sources.length : 0;
    const sourceLeakage = Array.isArray(asset?.sources)
      ? asset.sources.some((source) => source && typeof source === "object" && ("source_id" in source || "evidence_id" in source))
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
      unsafe_outcome: UNSAFE_OUTCOME_PATTERN.test(readerText),
      raw_enum: RAW_ENUM_PATTERN.test(readerText),
      en_contains_cjk: target.locale === "en" && CJK_PATTERN.test(readerText),
      error: ok ? "" : result.text.slice(0, 240).replace(/\s+/g, " "),
    };
  });

  const pageRows = await mapLimit(endpointTargets, 6, async (target) => {
    const result = await fetchText(target.pageUrl);
    const aiSection = findAiSection(result.text);
    const hasPreviewBlock = aiSection.length > 0;
    const sectionText = aiSection.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
    const ok =
      result.status === 200 &&
      hasPreviewBlock &&
      !/evidence_id|row_hash|source_id|search_projection|audit_fields|score_rationale/.test(aiSection) &&
      !RAW_ENUM_PATTERN.test(sectionText) &&
      !UNSAFE_OUTCOME_PATTERN.test(sectionText) &&
      (target.locale !== "en" || !CJK_PATTERN.test(sectionText));
    return {
      slug: target.slug.slug,
      locale: target.locale,
      url: target.pageUrl,
      status: result.status,
      ok,
      has_preview_block: hasPreviewBlock,
      internal_leakage: /evidence_id|row_hash|source_id|search_projection|audit_fields|score_rationale/.test(aiSection),
      raw_enum: RAW_ENUM_PATTERN.test(sectionText),
      unsafe_outcome: UNSAFE_OUTCOME_PATTERN.test(sectionText),
      en_contains_cjk: target.locale === "en" && CJK_PATTERN.test(sectionText),
      snippet: sectionText.replace(/\s+/g, " ").trim().slice(0, 220),
    };
  });

  const failClosedTargets = [
    {
      slug: "acupuncturists",
      locale: "zh-CN",
      apiUrl: `${STAGING_ORIGIN}/api/v0.5/career/jobs/acupuncturists/ai-impact-asset?locale=zh-CN`,
      pageUrl: `${STAGING_ORIGIN}/zh/career/jobs/acupuncturists`,
      reason: "known career slug outside preview_50 plan",
    },
    {
      slug: "acupuncturists",
      locale: "en",
      apiUrl: `${STAGING_ORIGIN}/api/v0.5/career/jobs/acupuncturists/ai-impact-asset?locale=en`,
      pageUrl: `${STAGING_ORIGIN}/en/career/jobs/acupuncturists`,
      reason: "known career slug outside preview_50 plan",
    },
    {
      slug: "not-a-real-career-ai-impact-preview-slug",
      locale: "en",
      apiUrl: `${STAGING_ORIGIN}/api/v0.5/career/jobs/not-a-real-career-ai-impact-preview-slug/ai-impact-asset?locale=en`,
      pageUrl: `${STAGING_ORIGIN}/en/career/jobs/not-a-real-career-ai-impact-preview-slug`,
      reason: "missing career slug",
    },
  ];

  const failClosedRows = await mapLimit(failClosedTargets, 3, async (target) => {
    const [api, page] = await Promise.all([fetchJson(target.apiUrl), fetchText(target.pageUrl)]);
    const pageHasPreview = findAiSection(page.text).length > 0;
    const apiClosed = api.status === 404 || api.json?.preview === false || api.json?.ok === false;
    const pageClosed = page.status === 404 || page.status === 200 ? !pageHasPreview : !pageHasPreview;
    return {
      slug: target.slug,
      locale: target.locale,
      reason: target.reason,
      api_status: api.status,
      page_status: page.status,
      api_closed: apiClosed,
      page_closed: pageClosed,
      ok: apiClosed && pageClosed,
    };
  });

  const productionRows = await mapLimit(
    slugs.slice(0, 10).flatMap((slug) =>
      locales.map((locale) => ({
        slug: slug.slug,
        locale,
        url: `${PRODUCTION_API_ORIGIN}/api/v0.5/career/jobs/${encodeURIComponent(slug.slug)}/ai-impact-asset?locale=${encodeURIComponent(locale)}`,
      }))
    ),
    5,
    async (target) => {
      const result = await fetchJson(target.url);
      const closed = result.status === 404 || result.json?.ok === false || result.json?.preview === false;
      return {
        slug: target.slug,
        locale: target.locale,
        url: target.url,
        status: result.status,
        closed,
        ok: closed,
      };
    }
  );

  const gitInfo = await getGitInfo();
  const apiReady = apiRows.filter((row) => row.ok).length;
  const pageReady = pageRows.filter((row) => row.ok).length;
  const failClosedReady = failClosedRows.filter((row) => row.ok).length;
  const productionClosedReady = productionRows.filter((row) => row.ok).length;
  const finalConclusion =
    gitInfo.origin_main_contains_pr_1224 &&
    apiReady === apiRows.length &&
    pageReady === pageRows.length &&
    failClosedReady === failClosedRows.length &&
    productionClosedReady === productionRows.length
      ? "STAGING_PAGE_QA_50_PASS"
      : "STAGING_PAGE_QA_50_REPAIR_REQUIRED";

  const audit = {
    schema_version: "career_ai_impact_v5_staging_page_qa_50_v1",
    generated_at: new Date().toISOString(),
    final_conclusion: finalConclusion,
    staging_origin: STAGING_ORIGIN,
    production_api_origin: PRODUCTION_API_ORIGIN,
    git: gitInfo,
    staging_deploy_confirmation: {
      revision_endpoint_available: false,
      github_deployments_api_exposed_staging_revision: false,
      origin_main_contains_pr_1224: gitInfo.origin_main_contains_pr_1224,
      runtime_contains_preview_consumer_inferred_from_rendered_preview_block: pageReady === pageRows.length,
      note: "The staging app does not expose a REVISION endpoint in this environment; runtime confirmation is based on the PR #1224-only preview block rendering on all sampled pages.",
    },
    metrics: {
      preview_slug_count: slugs.length,
      expected_endpoint_count: endpointTargets.length,
      api_ready_rows: apiReady,
      api_failed_rows: apiRows.length - apiReady,
      page_ready_rows: pageReady,
      page_failed_rows: pageRows.length - pageReady,
      fail_closed_ready_rows: failClosedReady,
      fail_closed_failed_rows: failClosedRows.length - failClosedReady,
      production_preview_closed_ready_rows: productionClosedReady,
      production_preview_closed_failed_rows: productionRows.length - productionClosedReady,
      internal_leakage_count: apiRows.filter((row) => row.internal_keys || row.internal_leakage).length + pageRows.filter((row) => row.internal_leakage).length,
      unsafe_outcome_count: apiRows.filter((row) => row.unsafe_outcome).length + pageRows.filter((row) => row.unsafe_outcome).length,
      english_contains_chinese_count: apiRows.filter((row) => row.en_contains_cjk).length + pageRows.filter((row) => row.en_contains_cjk).length,
      raw_enum_count: apiRows.filter((row) => row.raw_enum).length + pageRows.filter((row) => row.raw_enum).length,
    },
    intentionally_not_changed: [
      "No staging data writes were performed by this QA.",
      "No production import was performed.",
      "No content asset, sitemap, llms.txt, canonical, noindex, or JSON-LD changes were made.",
    ],
  };

  writeCsv(path.join(OUTPUT_DIR, "api_smoke.csv"), apiRows);
  writeCsv(path.join(OUTPUT_DIR, "rendering_smoke.csv"), pageRows);
  writeCsv(path.join(OUTPUT_DIR, "fail_closed_smoke.csv"), failClosedRows);
  writeCsv(path.join(OUTPUT_DIR, "production_preview_closed_smoke.csv"), productionRows);
  fs.writeFileSync(path.join(OUTPUT_DIR, "audit.json"), JSON.stringify(audit, null, 2) + "\n");
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "audit.md"),
    [
      "# AI Impact v5 Staging Page QA - 50 Slugs",
      "",
      `Final conclusion: \`${finalConclusion}\``,
      "",
      "## Scope",
      "",
      "- Verified 50 selected AI Impact v5 preview slugs across `zh-CN` and `en`.",
      "- Checked staging API payloads and staging rendered career pages.",
      "- Confirmed production API remains closed for the sampled preview endpoint.",
      "- This PR includes a scoped frontend renderer fix plus QA report; no content asset, staging write, production import, or SEO surface change was performed.",
      "",
      "## Deployment Confirmation",
      "",
      `- origin/main contains PR #1224 merge commit: ${gitInfo.origin_main_contains_pr_1224 ? "yes" : "no"}`,
      `- origin/main SHA: \`${gitInfo.origin_main_sha}\``,
      `- PR #1224 merge SHA: \`${gitInfo.pr_1224_merge_sha}\``,
      "- Staging does not expose `/REVISION`; runtime confirmation is inferred from the preview block rendered on the sampled staging pages.",
      "",
      "## Results",
      "",
      `- Staging API preview rows ready: ${apiReady}/${apiRows.length}`,
      `- Staging page render rows ready: ${pageReady}/${pageRows.length}`,
      `- Fail-closed checks ready: ${failClosedReady}/${failClosedRows.length}`,
      `- Production preview endpoint closed checks: ${productionClosedReady}/${productionRows.length}`,
      `- Internal leakage count: ${audit.metrics.internal_leakage_count}`,
      `- Unsafe AI outcome wording count: ${audit.metrics.unsafe_outcome_count}`,
      `- English contains Chinese count: ${audit.metrics.english_contains_chinese_count}`,
      `- Raw enum count: ${audit.metrics.raw_enum_count}`,
      "",
      "## Output Files",
      "",
      "- `preview_50_slug_plan.json` / `.csv`",
      "- `api_smoke.csv`",
      "- `rendering_smoke.csv`",
      "- `fail_closed_smoke.csv`",
      "- `production_preview_closed_smoke.csv`",
      "- `audit.json`",
      "- `sha256_manifest.json`",
      "",
      "## Deferred",
      "",
      "- 1046 dry-run importer belongs to the next fap-api PR.",
      "- 1046 staging_preview import belongs to the following fap-api PR.",
      "- Production import remains blocked until explicit user approval with the exact asset SHA.",
      "",
    ].join("\n")
  );

  const manifest = {};
  for (const fileName of fs.readdirSync(OUTPUT_DIR).sort()) {
    if (fileName === "sha256_manifest.json") {
      continue;
    }
    const filePath = path.join(OUTPUT_DIR, fileName);
    if (fs.statSync(filePath).isFile()) {
      manifest[fileName] = sha256File(filePath);
    }
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, "sha256_manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  if (finalConclusion !== "STAGING_PAGE_QA_50_PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
