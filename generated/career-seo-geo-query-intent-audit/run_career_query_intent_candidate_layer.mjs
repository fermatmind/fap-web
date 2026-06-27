import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const AUDIT_DIR = path.resolve("generated/career-seo-geo-query-intent-audit");
const CANDIDATE_DIR = path.resolve("generated/career-query-intent-projection-candidates");
const RELEASE_DIR = path.resolve("generated/career-seo-geo-release-gate");
const SLUG_PLAN =
  process.env.CAREER_SLUG_PLAN ||
  path.resolve("generated/career-content-1046-post-import-live-page-seo-qa/preview_1046_slug_plan.json");
const ALLOWED_LIVE_ORIGIN = "https://fermatmind.com";
const ALLOWED_API_ORIGIN = "https://api.fermatmind.com";
const CAREER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LIVE_ORIGIN = requireAllowedOrigin(process.env.LIVE_ORIGIN, ALLOWED_LIVE_ORIGIN, "LIVE_ORIGIN");
const API_ORIGIN = requireAllowedOrigin(process.env.API_ORIGIN, ALLOWED_API_ORIGIN, "API_ORIGIN");

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
const RUNTIME_SEO_PATTERN = /(?:canonical|noindex|sitemap|llms|robots|JSON-LD|schema\.org|rich result)/i;
const UNSUPPORTED_CLAIM_PATTERN =
  /(?:guaranteed|officially endorsed|will get hired|will increase salary|best career|must choose|一定|保证|官方背书|必然|排名第一)/i;
const CJK_PATTERN = /[\u3400-\u9fff]/;

function requireAllowedOrigin(value, expected, label) {
  const rawValue = value || expected;
  const origin = new URL(rawValue);
  const expectedOrigin = new URL(expected);
  if (origin.origin !== expectedOrigin.origin || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error(`${label} must be ${expected}`);
  }
  return expectedOrigin.origin;
}

function requireCareerSlug(value) {
  const slug = String(value || "").trim();
  if (!CAREER_SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid career slug in slug plan: ${slug}`);
  }
  return slug;
}

function buildCareerPageUrl(locale, slug) {
  const localePrefix = locale === "zh-CN" ? "zh" : "en";
  return new URL(`/${localePrefix}/career/jobs/${requireCareerSlug(slug)}`, LIVE_ORIGIN).toString();
}

function buildCareerApiUrl(locale, slug) {
  const url = new URL(`/api/v0.5/career/jobs/${requireCareerSlug(slug)}`, API_ORIGIN);
  url.searchParams.set("locale", locale);
  return url.toString();
}

function assertAllowedAuditRequestUrl(value) {
  const url = new URL(value);
  if (url.origin === LIVE_ORIGIN) {
    const match = url.pathname.match(/^\/(?:zh|en)\/career\/jobs\/([^/]+)$/);
    if (match && requireCareerSlug(match[1]) === match[1] && !url.search && !url.hash) return;
  }
  if (url.origin === API_ORIGIN) {
    const match = url.pathname.match(/^\/api\/v0\.5\/career\/jobs\/([^/]+)$/);
    const locale = url.searchParams.get("locale");
    const params = [...url.searchParams.keys()];
    if (match && requireCareerSlug(match[1]) === match[1] && params.length === 1 && (locale === "zh-CN" || locale === "en") && !url.hash) return;
  }
  throw new Error(`Blocked non-FermatMind career audit URL: ${url.origin}${url.pathname}`);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, headers = null) {
  const finalHeaders = headers || (rows[0] ? Object.keys(rows[0]) : []);
  const lines = [finalHeaders.join(",")];
  for (const row of rows) lines.push(finalHeaders.map((header) => csvEscape(row[header])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
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
  const headings = allMatches(html, /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi);
  const faqHeadings = headings.filter((text) => /(?:FAQ|常见问题|问题|适合|准备|路径|技能|薪资|AI|相邻|来源|边界|education|certification|salary|skills|path|fit|adjacent)/i.test(text));
  return faqHeadings.slice(0, 12);
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

async function fetchText(url, accept = "text/html,application/json;q=0.9,*/*;q=0.8") {
  assertAllowedAuditRequestUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.FETCH_TIMEOUT_MS || 8000));
  try {
    // lgtm[js/file-access-to-http] Audit requests are origin-pinned, path-limited, and slug-validated before fetch.
    const response = await fetch(url, {
      headers: {
        accept,
        "user-agent": "FermatMind-CareerQueryIntentCandidateAudit/1.0",
      },
      signal: controller.signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
      contentType: response.headers.get("content-type") || "",
    };
  } catch (error) {
    return { ok: false, status: 0, text: String(error?.message || error), contentType: "" };
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

async function mapLimit(items, limit, mapper, label = "items") {
  const results = new Array(items.length);
  let index = 0;
  let completed = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current]);
      completed += 1;
      if (completed % 100 === 0 || completed === items.length) {
        console.log(`${label}: ${completed}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

function readSlugPlan() {
  const parsed = JSON.parse(fs.readFileSync(SLUG_PLAN, "utf8"));
  if (!Array.isArray(parsed.slugs) || parsed.slugs.length !== 1046) {
    throw new Error(`Expected 1046 slugs in ${SLUG_PLAN}`);
  }
  return parsed.slugs.map((slug) => ({
    ...slug,
    slug: requireCareerSlug(slug.slug),
  }));
}

function inferIntentCoverage(text, title) {
  const fullText = `${title}\n${text}`;
  return {
    "what-is": /(?:是什么|职业|occupation|career|what|does|definition|职责|工作)/i.test(fullText),
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

function choosePrimaryIntent(coverage) {
  const priority = ["what-is", "skills", "career-path", "fit", "AI-impact", "salary", "adjacent", "education", "certification"];
  return priority.find((intent) => coverage[intent]) || "what-is";
}

function candidateFor(locale, intent, titles, pageSignals) {
  const title = locale === "zh-CN" ? titles.title_zh || titles.title_en : titles.title_en || titles.title_zh;
  const cleanTitle = String(title || titles.slug).replace(/\s+/g, " ").trim();
  const sectionHint = pageSignals.present_intents.split("|").filter(Boolean).slice(0, 4).join(locale === "zh-CN" ? "、" : ", ");
  if (locale === "zh-CN") {
    return {
      snippet: `${cleanTitle}页面已覆盖职业定义、工作内容、适配信号与风险变化，可作为“${cleanTitle}适不适合我”的候选搜索摘要。`,
      faq: [
        `${cleanTitle}主要做什么？`,
        `${cleanTitle}需要哪些技能和准备？`,
        `${cleanTitle}在 AI 时代哪些工作更容易被加速？`,
      ],
      anchors: [`${cleanTitle}职业介绍`, `${cleanTitle}技能与入行路径`, `${cleanTitle}AI 影响与职业匹配`],
      basis: sectionHint,
    };
  }
  return {
    snippet: `${cleanTitle} covers the occupation definition, work activities, fit signals, and AI-era risk context for readers comparing career options.`,
    faq: [
      `What does a ${cleanTitle} do?`,
      `What skills and preparation matter for ${cleanTitle}?`,
      `How does AI affect ${cleanTitle} work?`,
    ],
    anchors: [`${cleanTitle} career overview`, `${cleanTitle} skills and entry path`, `${cleanTitle} AI impact and fit`],
    basis: sectionHint,
  };
}

function validateCandidate(row) {
  const serialized = JSON.stringify(row);
  const findings = [];
  if (row.candidate_only !== true || row.runtime_approved !== false) findings.push("candidate_flags_invalid");
  if (RUNTIME_SEO_PATTERN.test(serialized)) findings.push("runtime_seo_instruction_present");
  if (INTERNAL_PATTERN.test(serialized)) findings.push("internal_field_present");
  if (UNSUPPORTED_CLAIM_PATTERN.test(serialized)) findings.push("unsupported_claim_risk");
  if (row.locale === "en" && CJK_PATTERN.test(`${row.snippet_candidate} ${JSON.stringify(row.faq_candidates)} ${JSON.stringify(row.internal_link_anchor_candidates)}`)) {
    findings.push("english_candidate_contains_chinese");
  }
  return findings;
}

function intentGapRows(matrixRows) {
  const gaps = [];
  for (const row of matrixRows) {
    for (const intent of INTENTS) {
      if (row[intent] !== true) {
        gaps.push({
          slug: row.slug,
          locale: row.locale,
          missing_intent: intent,
          priority: intent === "what-is" ? "high" : intent === "skills" || intent === "career-path" ? "medium" : "low",
        });
      }
    }
  }
  return gaps;
}

function sourceBlockRows(scanRows) {
  return scanRows.map((row) => ({
    slug: row.slug,
    locale: row.locale,
    page_status: row.page_status,
    api_status: row.api_status,
    h1_present: Boolean(row.h1),
    title_present: Boolean(row.title),
    description_present: Boolean(row.description),
    faq_signal_count: row.faq_signals ? row.faq_signals.split("|").filter(Boolean).length : 0,
    source_signals: row.source_signals,
    canonical_ok: row.canonical_ok,
    noindex: row.noindex,
  }));
}

function writeManifest() {
  const files = [
    ...fs.readdirSync(AUDIT_DIR).map((name) => path.join(AUDIT_DIR, name)),
    ...fs.readdirSync(CANDIDATE_DIR).map((name) => path.join(CANDIDATE_DIR, name)),
    ...fs.readdirSync(RELEASE_DIR).map((name) => path.join(RELEASE_DIR, name)),
  ]
    .filter((file) => fs.statSync(file).isFile())
    .sort();
  const manifest = {
    generated_at: new Date().toISOString(),
    file_count: files.length,
    files: files.map((file) => ({
      path: path.relative(process.cwd(), file),
      sha256: sha256File(file),
      bytes: fs.statSync(file).size,
    })),
  };
  fs.writeFileSync(path.join(RELEASE_DIR, "sha256_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.mkdirSync(CANDIDATE_DIR, { recursive: true });
  fs.mkdirSync(RELEASE_DIR, { recursive: true });
  const slugs = readSlugPlan();
  const targets = slugs.flatMap((slug) =>
    ["zh-CN", "en"].map((locale) => ({
      ...slug,
      locale,
      page_url: buildCareerPageUrl(locale, slug.slug),
      api_url: buildCareerApiUrl(locale, slug.slug),
    })),
  );

  console.log(`Scanning ${targets.length} live career pages and APIs`);
  const scanRows = await mapLimit(targets, Number(process.env.SCAN_CONCURRENCY || 48), async (target) => {
    const [page, api] = await Promise.all([fetchText(target.page_url), fetchJson(target.api_url)]);
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
    const expectedCanonical = buildCareerPageUrl(target.locale, target.slug);
    return {
      seed_ordinal: target.seed_ordinal,
      slug: target.slug,
      locale: target.locale,
      title_en: target.title_en || "",
      title_zh: target.title_zh || "",
      page_url: target.page_url,
      api_url: target.api_url,
      page_status: page.status,
      api_status: api.status,
      title,
      description,
      h1,
      canonical,
      canonical_ok: canonical === expectedCanonical,
      noindex: /noindex/i.test(robots),
      faq_signals: faqSignals.join("|"),
      source_signals: sourceSignals.join("|"),
      present_intents: INTENTS.filter((intent) => coverage[intent]).join("|"),
      missing_intents: INTENTS.filter((intent) => !coverage[intent]).join("|"),
      internal_leakage: INTERNAL_PATTERN.test(visibleText) || INTERNAL_PATTERN.test(JSON.stringify(api.json || {})),
    };
  }, "live+api scan");

  const matrixRows = scanRows.map((row) => {
    const present = new Set(row.present_intents.split("|").filter(Boolean));
    const coverage = Object.fromEntries(INTENTS.map((intent) => [intent, present.has(intent)]));
    return {
      seed_ordinal: row.seed_ordinal,
      slug: row.slug,
      locale: row.locale,
      title_en: row.title_en,
      title_zh: row.title_zh,
      primary_detected_intent: choosePrimaryIntent(coverage),
      secondary_detected_intents: INTENTS.filter((intent) => coverage[intent] && intent !== choosePrimaryIntent(coverage)).join("|"),
      ...coverage,
      page_status: row.page_status,
      api_status: row.api_status,
      h1: row.h1,
      title: row.title,
      description_present: Boolean(row.description),
      faq_signal_count: row.faq_signals ? row.faq_signals.split("|").filter(Boolean).length : 0,
      source_signal_count: row.source_signals ? row.source_signals.split("|").filter(Boolean).length : 0,
    };
  });

  const candidateRows = matrixRows.map((row) => {
    const secondary = row.secondary_detected_intents ? row.secondary_detected_intents.split("|").filter(Boolean) : [];
    const pageSignals = scanRows.find((scan) => scan.slug === row.slug && scan.locale === row.locale) || {};
    const candidate = candidateFor(row.locale, row.primary_detected_intent, row, pageSignals);
    const output = {
      slug: row.slug,
      locale: row.locale,
      primary_query_intent: row.primary_detected_intent,
      secondary_query_intents: secondary,
      snippet_candidate: candidate.snippet,
      faq_candidates: candidate.faq,
      internal_link_anchor_candidates: candidate.anchors,
      source_page_signals: {
        h1: row.h1,
        title: row.title,
        description_present: row.description_present,
        present_intents: pageSignals.present_intents || "",
        faq_signal_count: row.faq_signal_count,
        source_signal_count: row.source_signal_count,
        candidate_basis: candidate.basis,
      },
      candidate_only: true,
      runtime_approved: false,
      release_gate_required: "SEO_GEO_RELEASE_GATE_REQUIRED",
    };
    return { ...output, validation_findings: validateCandidate(output) };
  });

  const blockedCandidates = candidateRows
    .filter((row) => row.validation_findings.length > 0)
    .map((row) => ({
      slug: row.slug,
      locale: row.locale,
      findings: row.validation_findings.join("|"),
      primary_query_intent: row.primary_query_intent,
    }));
  const allowedRuntimeRows = candidateRows
    .filter((row) => row.validation_findings.length === 0)
    .map((row) => ({
      slug: row.slug,
      locale: row.locale,
      allowed_for_future_review: true,
      runtime_approved: false,
      allowed_fields_for_future_release_review: "primary_query_intent|secondary_query_intents|snippet_candidate|faq_candidates|internal_link_anchor_candidates",
      release_gate_required: "separate CMS/API runtime approval PR",
    }));

  const liveFailures = scanRows.filter((row) => row.page_status !== 200 || row.api_status !== 200 || row.internal_leakage || !row.canonical_ok || row.noindex);
  const gaps = intentGapRows(matrixRows);
  const sourceRows = sourceBlockRows(scanRows);
  const finalConclusion =
    scanRows.length === 2092 &&
    candidateRows.length === 2092 &&
    blockedCandidates.length === 0 &&
    scanRows.filter((row) => row.page_status === 200).length === 2092
      ? "CAREER_QUERY_INTENT_CANDIDATE_LAYER_READY"
      : "CAREER_QUERY_INTENT_CANDIDATE_LAYER_REVIEW_REQUIRED";

  writeCsv(path.join(AUDIT_DIR, "live_page_scan.csv"), scanRows);
  writeCsv(path.join(AUDIT_DIR, "per_slug_intent_matrix.csv"), matrixRows);
  writeCsv(path.join(AUDIT_DIR, "source_block_inventory.csv"), sourceRows);
  writeCsv(path.join(AUDIT_DIR, "intent_gap_report.csv"), gaps);
  fs.writeFileSync(
    path.join(AUDIT_DIR, "query_intent_audit.json"),
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        final_conclusion: finalConclusion,
        row_count: scanRows.length,
        slug_count: new Set(scanRows.map((row) => row.slug)).size,
        live_page_200: scanRows.filter((row) => row.page_status === 200).length,
        api_200: scanRows.filter((row) => row.api_status === 200).length,
        internal_leakage_count: scanRows.filter((row) => row.internal_leakage).length,
        canonical_failure_count: scanRows.filter((row) => !row.canonical_ok).length,
        noindex_count: scanRows.filter((row) => row.noindex).length,
        intent_gap_count: gaps.length,
        live_failure_count: liveFailures.length,
        candidate_only: true,
        runtime_modified: false,
        seo_runtime_modified: false,
        cms_written: false,
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(AUDIT_DIR, "query_intent_audit.md"),
    `# Career SEO/GEO Query Intent Audit\n\n- Final conclusion: \`${finalConclusion}\`\n- Rows scanned: \`${scanRows.length}\`\n- Unique slugs: \`${new Set(scanRows.map((row) => row.slug)).size}\`\n- Live page 200: \`${scanRows.filter((row) => row.page_status === 200).length}/2092\`\n- Detail API 200: \`${scanRows.filter((row) => row.api_status === 200).length}/2092\`\n- Internal leakage findings: \`${scanRows.filter((row) => row.internal_leakage).length}\`\n- Candidate layer only: \`true\`\n- Runtime SEO modified: \`false\`\n- CMS written: \`false\`\n\nThis audit classifies query intent coverage only. It does not change title, meta description, sitemap, llms, canonical, noindex, JSON-LD, CMS, or runtime APIs.\n`,
  );

  fs.writeFileSync(
    path.join(CANDIDATE_DIR, "search_projection_candidate.jsonl"),
    `${candidateRows.map((row) => JSON.stringify(row)).join("\n")}\n`,
  );
  writeCsv(
    path.join(CANDIDATE_DIR, "search_projection_candidate.csv"),
    candidateRows.map((row) => ({
      slug: row.slug,
      locale: row.locale,
      primary_query_intent: row.primary_query_intent,
      secondary_query_intents: row.secondary_query_intents.join("|"),
      snippet_candidate: row.snippet_candidate,
      faq_candidates: row.faq_candidates.join("|"),
      internal_link_anchor_candidates: row.internal_link_anchor_candidates.join("|"),
      candidate_only: row.candidate_only,
      runtime_approved: row.runtime_approved,
      validation_findings: row.validation_findings.join("|"),
    })),
  );
  writeCsv(
    path.join(CANDIDATE_DIR, "faq_candidate_review.csv"),
    candidateRows.flatMap((row) =>
      row.faq_candidates.map((faq, index) => ({
        slug: row.slug,
        locale: row.locale,
        candidate_index: index + 1,
        faq_candidate: faq,
        candidate_only: true,
        runtime_approved: false,
      })),
    ),
  );
  writeCsv(
    path.join(CANDIDATE_DIR, "internal_link_anchor_candidate.csv"),
    candidateRows.flatMap((row) =>
      row.internal_link_anchor_candidates.map((anchor, index) => ({
        slug: row.slug,
        locale: row.locale,
        candidate_index: index + 1,
        anchor_candidate: anchor,
        candidate_only: true,
        runtime_approved: false,
      })),
    ),
  );
  writeCsv(
    path.join(CANDIDATE_DIR, "snippet_candidate_review.csv"),
    candidateRows.map((row) => ({
      slug: row.slug,
      locale: row.locale,
      snippet_candidate: row.snippet_candidate,
      primary_query_intent: row.primary_query_intent,
      candidate_only: true,
      runtime_approved: false,
    })),
  );

  writeCsv(path.join(RELEASE_DIR, "allowed_runtime_fields.csv"), allowedRuntimeRows);
  writeCsv(path.join(RELEASE_DIR, "blocked_candidates.csv"), blockedCandidates, ["slug", "locale", "findings", "primary_query_intent"]);
  const seoSurfaceNochange = {
    generated_at: new Date().toISOString(),
    sitemap_modified: false,
    llms_modified: false,
    canonical_modified: false,
    noindex_modified: false,
    jsonld_modified: false,
    cms_written: false,
    runtime_api_modified: false,
    candidate_files_only: true,
  };
  fs.writeFileSync(path.join(RELEASE_DIR, "seo_surface_nochange_verification.json"), `${JSON.stringify(seoSurfaceNochange, null, 2)}\n`);
  fs.writeFileSync(
    path.join(RELEASE_DIR, "release_gate_report.json"),
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        final_conclusion: blockedCandidates.length === 0 ? "SEO_GEO_RELEASE_GATE_CANDIDATES_QUARANTINED" : "SEO_GEO_RELEASE_GATE_REVIEW_REQUIRED",
        candidate_rows: candidateRows.length,
        blocked_candidate_count: blockedCandidates.length,
        allowed_for_future_review_count: allowedRuntimeRows.length,
        runtime_approved_count: 0,
        runtime_modified: false,
        seo_runtime_modified: false,
        release_requires_separate_pr: true,
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(RELEASE_DIR, "release_gate_report.md"),
    `# SEO/GEO Release Gate\n\n- Candidate rows: \`${candidateRows.length}\`\n- Blocked candidates: \`${blockedCandidates.length}\`\n- Runtime approved rows: \`0\`\n- Runtime modified: \`false\`\n- SEO runtime modified: \`false\`\n\nAll candidate rows remain quarantined. A separate backend/CMS/API release PR is required before any field may enter runtime SEO, JSON-LD, sitemap, llms, canonical, noindex, or public API metadata.\n`,
  );
  writeManifest();
  console.log(finalConclusion);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
