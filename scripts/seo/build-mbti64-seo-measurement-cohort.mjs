#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = "2026-06-22";
const SITE_ORIGIN = "https://fermatmind.com";
const MBTI_TYPES = [
  "intj",
  "intp",
  "entj",
  "entp",
  "infj",
  "infp",
  "enfj",
  "enfp",
  "istj",
  "isfj",
  "estj",
  "esfj",
  "istp",
  "isfp",
  "estp",
  "esfp",
];
const LOCALES = ["en", "zh"];
const VARIANTS = ["a", "t"];

const GRAPH_PATH = path.join(ROOT, "docs/seo/personality/internal-link-graph-2026-06-18.json");
const OUTPUT_JSON = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-${GENERATED_DATE}.md`,
);

const TMP_ARTIFACTS = {
  promoted88Smoke:
    "/tmp/MBTI64-CMS-PROJECTION-PROMOTE-88-POST-WRITE-SMOKE-02-CONTENT-RECHECK-2026-06-22.json",
  pilotIndexnowObservation:
    "/tmp/MBTI64-INDEXNOW-LIVE-SUBMIT-24H-OBSERVATION-01-2026-06-21.json",
  expansionIndexnowSubmit:
    "/tmp/MBTI64-INDEXNOW-EXPANSION-LIVE-SUBMIT-88-01-2026-06-21.json",
  expansionIndexnowPostSmoke:
    "/tmp/MBTI64-INDEXNOW-EXPANSION-LIVE-SUBMIT-POST-SMOKE-88-01-2026-06-21.json",
  llmsFullRecheck:
    "/tmp/MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-RECHECK-04-2026-06-19.json",
};

const PRIVATE_PATTERNS = [
  "/results",
  "/orders",
  "/pay",
  "/payment",
  "/history",
  "/private",
  "/account",
  "token=",
  "session=",
  "result_id=",
  "report_id=",
  "order_no=",
];

const PILOT_URLS = new Set([
  `${SITE_ORIGIN}/en/personality/intj-a-vs-intj-t`,
  `${SITE_ORIGIN}/zh/personality/istj-a`,
  `${SITE_ORIGIN}/en/personality/intp-a-vs-intp-t`,
  `${SITE_ORIGIN}/zh/personality/infp-t`,
  `${SITE_ORIGIN}/en/personality/intj-a`,
  `${SITE_ORIGIN}/en/personality/intj-t`,
  `${SITE_ORIGIN}/zh/personality/intj-a`,
  `${SITE_ORIGIN}/zh/personality/intj-t`,
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value ?? "").digest("hex");
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeUrl(value) {
  const url = new URL(value, SITE_ORIGIN);
  url.hash = "";
  url.search = "";
  const pathname = url.pathname !== "/" ? url.pathname.replace(/\/+$/, "") : "/";
  return `${url.origin}${pathname}`;
}

function extractFirst(html, regex) {
  const match = html.match(regex);
  return normalizeWhitespace(match?.[1] ?? "");
}

function extractHtmlSurface(html) {
  return {
    title: extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: extractFirst(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    ),
    h1: extractFirst(html, /<h1[^>]*>([^<]*)<\/h1>/i),
    canonical: extractFirst(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i,
    ),
    robots: extractFirst(
      html,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    ),
  };
}

function scanPrivatePatterns(text) {
  const hits = [];
  const haystack = String(text ?? "");
  for (const pattern of PRIVATE_PATTERNS) {
    const sameOriginNeedle = pattern.startsWith("/") ? `${SITE_ORIGIN}${pattern}` : pattern;
    if (haystack.includes(sameOriginNeedle) || haystack.includes(`href="${pattern}`)) {
      hits.push(pattern);
    }
  }
  return Array.from(new Set(hits));
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function fetchText(url) {
  const started = Date.now();
  const response = await fetch(url, {
    headers: {
      "user-agent": "FermatMind MBTI64 measurement cohort audit/1.0",
      accept: "text/html,text/plain,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  const text = await response.text();
  return {
    url,
    status: response.status,
    elapsed_ms: Date.now() - started,
    bytes: Buffer.byteLength(text),
    sha256: sha256(text),
    text,
  };
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

function buildExpectedNodes() {
  const nodes = [];
  for (const locale of LOCALES) {
    for (const type of MBTI_TYPES) {
      for (const variant of VARIANTS) {
        const slug = `${type}-${variant}`;
        nodes.push({
          url: `${SITE_ORIGIN}/${locale}/personality/${slug}`,
          path: `/${locale}/personality/${slug}`,
          locale,
          page_type: "variant",
          mbti_type: type.toUpperCase(),
          variant: variant.toUpperCase(),
          is_pilot: PILOT_URLS.has(`${SITE_ORIGIN}/${locale}/personality/${slug}`),
        });
      }

      const comparisonSlug = `${type}-a-vs-${type}-t`;
      nodes.push({
        url: `${SITE_ORIGIN}/${locale}/personality/${comparisonSlug}`,
        path: `/${locale}/personality/${comparisonSlug}`,
        locale,
        page_type: "comparison",
        mbti_type: type.toUpperCase(),
        variant: null,
        is_pilot: PILOT_URLS.has(`${SITE_ORIGIN}/${locale}/personality/${comparisonSlug}`),
      });
    }
  }

  return nodes.sort((a, b) => a.url.localeCompare(b.url));
}

function collectPilotQueueState(pilotObservation) {
  const items = pilotObservation?.queue_state_observation?.items ?? [];
  return new Map(
    items.map((item) => [
      normalizeUrl(item.canonical_url),
      {
        channel: item.channel,
        queue_item_id: item.id,
        approval_state: item.approval_state,
        execution_state: item.execution_state,
        eligibility_state: item.eligibility_state,
        indexability_state: item.indexability_state,
        claim_boundary_state: item.claim_boundary_state,
        source_artifact: TMP_ARTIFACTS.pilotIndexnowObservation,
      },
    ]),
  );
}

function expansionQueueStateFor(url, expansionSubmit, expansionPostSmoke) {
  const finalDecision =
    expansionPostSmoke?.final_decision ?? expansionSubmit?.final_decision ?? "EVIDENCE_PENDING";
  const submitted =
    finalDecision === "PASS_INDEXNOW_LIVE_SUBMITTED_88" ||
    finalDecision === "PASS_INDEXNOW_LIVE_SUBMITTED_88_PENDING_POST_SMOKE";
  return {
    channel: "indexnow",
    queue_item_id: null,
    approval_state: submitted ? "approved" : "EVIDENCE_PENDING",
    execution_state: submitted ? "submitted" : "EVIDENCE_PENDING",
    eligibility_state: "eligible",
    indexability_state: "indexable",
    claim_boundary_state: "claim_safe",
    source_artifact: TMP_ARTIFACTS.expansionIndexnowPostSmoke,
    note: `Non-pilot expansion URL covered by 88-item IndexNow submission artifact: ${url}`,
  };
}

function classifyPriority() {
  return {
    tier: "PENDING_GSC_BASELINE",
    reason: "GSC query/click/impression evidence is not attached to this artifact; do not infer zero.",
  };
}

function summarizeCounts(records) {
  const count = (predicate) => records.filter(predicate).length;
  return {
    total: records.length,
    variants: count((record) => record.page_type === "variant"),
    comparisons: count((record) => record.page_type === "comparison"),
    pilot: count((record) => record.is_pilot),
    expansion: count((record) => !record.is_pilot),
    http_200: count((record) => record.live.status === 200),
    canonical_self: count((record) => record.live.canonical_ok),
    index_follow: count((record) => record.live.index_follow_ok),
    sitemap_present: count((record) => record.index_surfaces.sitemap_exact_present),
    llms_present: count((record) => record.index_surfaces.llms_exact_present),
    llms_full_present: count((record) => record.index_surfaces.llms_full_exact_present),
    private_route_clean: count((record) => record.private_route_scan.hit_count === 0),
    indexnow_submitted: count(
      (record) => record.search_queue.indexnow?.execution_state === "submitted",
    ),
    gsc_pending: count((record) => record.analytics.gsc.status === "GSC_EVIDENCE_PENDING"),
  };
}

async function main() {
  const graph = await readJsonIfExists(GRAPH_PATH);
  if (!graph?.nodes?.length) {
    throw new Error(`Missing graph nodes at ${GRAPH_PATH}`);
  }

  const promoted88Smoke = await readJsonIfExists(TMP_ARTIFACTS.promoted88Smoke);
  const pilotObservation = await readJsonIfExists(TMP_ARTIFACTS.pilotIndexnowObservation);
  const expansionSubmit = await readJsonIfExists(TMP_ARTIFACTS.expansionIndexnowSubmit);
  const expansionPostSmoke = await readJsonIfExists(TMP_ARTIFACTS.expansionIndexnowPostSmoke);
  const llmsFullRecheck = await readJsonIfExists(TMP_ARTIFACTS.llmsFullRecheck);

  const graphUrls = new Set(graph.nodes.map((node) => normalizeUrl(node.url)));
  const nodes = buildExpectedNodes();
  const graphMissingUrls = nodes.map((node) => node.url).filter((url) => !graphUrls.has(url));

  const surfaces = {};
  for (const [key, surfacePath] of Object.entries({
    sitemap: "/sitemap.xml",
    llms: "/llms.txt",
    llms_full: "/llms-full.txt",
  })) {
    const surface = await fetchText(`${SITE_ORIGIN}${surfacePath}`);
    const normalizedUrlSet = new Set(
      Array.from(surface.text.matchAll(/https:\/\/fermatmind\.com\/[^\s<>"')]+/g)).map((match) =>
        normalizeUrl(match[0]),
      ),
    );
    surfaces[key] = {
      url: surface.url,
      status: surface.status,
      bytes: surface.bytes,
      sha256: surface.sha256,
      private_route_hits: scanPrivatePatterns(surface.text),
      normalized_url_set: normalizedUrlSet,
    };
  }

  const livePages = await mapWithConcurrency(nodes, 8, async (node) => {
    const html = await fetchText(node.url);
    return { node, html, surface: extractHtmlSurface(html.text) };
  });

  const pilotQueue = collectPilotQueueState(pilotObservation);

  const records = livePages.map(({ node, html, surface }) => {
    const canonical = surface.canonical ? normalizeUrl(surface.canonical) : "";
    const robots = surface.robots.toLowerCase();
    const canonicalOk = canonical === node.url;
    const indexFollowOk = !robots.includes("noindex") && !robots.includes("nofollow");
    const privateHits = scanPrivatePatterns(html.text);
    const indexnow = node.is_pilot
      ? pilotQueue.get(node.url) ?? { channel: "indexnow", execution_state: "EVIDENCE_PENDING" }
      : expansionQueueStateFor(node.url, expansionSubmit, expansionPostSmoke);

    return {
      url: node.url,
      path: node.path,
      locale: node.locale,
      page_type: node.page_type,
      mbti_type: node.mbti_type,
      variant: node.variant ?? null,
      is_pilot: node.is_pilot,
      cohort_group: node.is_pilot ? "pilot_8" : "expansion_88",
      live: {
        status: html.status,
        canonical: canonical || null,
        canonical_ok: canonicalOk,
        robots: surface.robots || null,
        index_follow_ok: indexFollowOk,
        title: surface.title,
        description: surface.description,
        h1: surface.h1,
        title_hash: sha256(surface.title),
        description_hash: sha256(surface.description),
        h1_hash: sha256(surface.h1),
        html_sha256: html.sha256,
        html_bytes: html.bytes,
      },
      index_surfaces: {
        sitemap_exact_present: surfaces.sitemap.normalized_url_set.has(node.url),
        llms_exact_present: surfaces.llms.normalized_url_set.has(node.url),
        llms_full_exact_present: surfaces.llms_full.normalized_url_set.has(node.url),
      },
      content_state: {
        state: node.is_pilot
          ? "optimized_pilot_live"
          : promoted88Smoke?.final_decision === "PASS_PROMOTED_CONTENT_LIVE_FOR_88"
            ? "agent_projection_promoted_live"
            : "EVIDENCE_PENDING",
        evidence_artifact: node.is_pilot
          ? "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json"
          : TMP_ARTIFACTS.promoted88Smoke,
      },
      search_queue: {
        gsc_readiness: {
          status: "readiness_only_channel",
          note: "Retained as readiness evidence; not a live submission channel.",
        },
        indexnow,
      },
      analytics: {
        gsc: {
          status: "GSC_EVIDENCE_PENDING",
          impressions: null,
          clicks: null,
          ctr: null,
          average_position: null,
          queries: [],
        },
        ga4: {
          status: "GA4_EVIDENCE_PENDING",
          sessions: null,
        },
      },
      prioritization: classifyPriority(),
      private_route_scan: {
        hit_count: privateHits.length,
        hits: privateHits,
      },
    };
  });

  const counts = summarizeCounts(records);
  const blockers = [];
  const warnings = [];

  if (counts.total !== 96) blockers.push(`expected_96_records_found_${counts.total}`);
  if (counts.variants !== 64) blockers.push(`expected_64_variants_found_${counts.variants}`);
  if (counts.comparisons !== 32) blockers.push(`expected_32_comparisons_found_${counts.comparisons}`);
  if (counts.pilot !== 8) blockers.push(`expected_8_pilot_found_${counts.pilot}`);
  if (counts.http_200 !== 96) blockers.push(`http_200_count_${counts.http_200}_of_96`);
  if (counts.canonical_self !== 96) blockers.push(`canonical_self_count_${counts.canonical_self}_of_96`);
  if (counts.index_follow !== 96) blockers.push(`index_follow_count_${counts.index_follow}_of_96`);
  if (counts.sitemap_present !== 96) blockers.push(`sitemap_membership_${counts.sitemap_present}_of_96`);
  if (counts.llms_present !== 96) blockers.push(`llms_membership_${counts.llms_present}_of_96`);
  if (counts.llms_full_present !== 96) blockers.push(`llms_full_membership_${counts.llms_full_present}_of_96`);
  if (counts.private_route_clean !== 96) blockers.push("private_route_hits_present");
  if (counts.gsc_pending === 96) warnings.push("GSC_EVIDENCE_PENDING for all 96 URLs; this is a baseline cohort, not a performance conclusion.");
  if (graphMissingUrls.length > 0) blockers.push(`graph_missing_expected_urls_${graphMissingUrls.length}`);
  if (!pilotObservation) warnings.push(`missing input artifact: ${TMP_ARTIFACTS.pilotIndexnowObservation}`);
  if (!expansionSubmit && !expansionPostSmoke) warnings.push("missing expansion IndexNow submit evidence artifact");
  if (llmsFullRecheck?.final_decision && llmsFullRecheck.final_decision !== "PASS_GO_FOR_SEARCH_QUEUE_DRY_RUN_RECHECK") {
    warnings.push(`llms-full recheck decision was ${llmsFullRecheck.final_decision}`);
  }

  const output = {
    artifact: "MBTI64-SEO-MEASUREMENT-COHORT-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_BASELINE_CREATED_GSC_PENDING"
        : "NO_GO_BASELINE_HAS_TECHNICAL_BLOCKERS",
    input_artifacts: {
      graph: "docs/seo/personality/internal-link-graph-2026-06-18.json",
      graph_expected_url_missing_count: graphMissingUrls.length,
      optimized_pilot_reference_pack:
        "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json",
      promoted88Smoke: promoted88Smoke ? TMP_ARTIFACTS.promoted88Smoke : null,
      pilotIndexnowObservation: pilotObservation ? TMP_ARTIFACTS.pilotIndexnowObservation : null,
      expansionIndexnowSubmit: expansionSubmit ? TMP_ARTIFACTS.expansionIndexnowSubmit : null,
      expansionIndexnowPostSmoke: expansionPostSmoke ? TMP_ARTIFACTS.expansionIndexnowPostSmoke : null,
      llmsFullRecheck: llmsFullRecheck ? TMP_ARTIFACTS.llmsFullRecheck : null,
    },
    summary: counts,
    surface_snapshots: Object.fromEntries(
      Object.entries(surfaces).map(([key, surface]) => [
        key,
        {
          url: surface.url,
          status: surface.status,
          bytes: surface.bytes,
          sha256: surface.sha256,
          exact_present_count: records.filter((record) => {
            if (key === "sitemap") return record.index_surfaces.sitemap_exact_present;
            if (key === "llms") return record.index_surfaces.llms_exact_present;
            return record.index_surfaces.llms_full_exact_present;
          }).length,
          private_route_hits: surface.private_route_hits,
        },
      ]),
    ),
    records,
    blockers,
    warnings,
    recommended_next_task: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-01",
    safety_boundary: {
      repo_artifact_only: true,
      cms_write_attempted: false,
      search_queue_enqueue_attempted: false,
      search_queue_approve_attempted: false,
      search_live_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
    },
  };

  const markdown = [
    "# MBTI64 SEO Measurement Cohort",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    "",
    "## Coverage",
    "",
    `- Total URLs: ${counts.total}`,
    `- Variant pages: ${counts.variants}`,
    `- Comparison pages: ${counts.comparisons}`,
    `- Pilot pages: ${counts.pilot}`,
    `- Expansion pages: ${counts.expansion}`,
    "",
    "## Live Surface",
    "",
    `- HTTP 200: ${counts.http_200}/96`,
    `- Canonical self: ${counts.canonical_self}/96`,
    `- Index/follow: ${counts.index_follow}/96`,
    `- Same-origin private route clean: ${counts.private_route_clean}/96`,
    "",
    "## Discoverability Surface",
    "",
    `- Sitemap exact membership: ${counts.sitemap_present}/96`,
    `- llms.txt exact membership: ${counts.llms_present}/96`,
    `- llms-full.txt exact membership: ${counts.llms_full_present}/96`,
    "",
    "## Search Queue State",
    "",
    `- IndexNow submitted evidence: ${counts.indexnow_submitted}/96`,
    "- gsc_readiness is retained as readiness evidence only and is not treated as a live submit channel.",
    "",
    "## Analytics Boundary",
    "",
    "- GSC and GA4 performance fields are initialized as evidence-pending. This artifact does not infer zero impressions, clicks, CTR, or sessions.",
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
    "- Artifact-only repo output.",
    "- No CMS write, queue enqueue, queue approval, live submit, sitemap/llms mutation, or frontend runtime change was performed.",
    "",
  ].join("\n");

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, markdown);
  console.log(JSON.stringify({ output_json: OUTPUT_JSON, output_md: OUTPUT_MD, final_decision: output.final_decision }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
