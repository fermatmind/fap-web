#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_ORIGIN = "https://fermatmind.com";
const OUTPUT_DIR = "docs/seo/personality";
const RUN_DATE = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const USER_AGENT = "FermatMind personality SEO indexation audit; read-only low-rate";

const TYPES = [
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

const PILOT_PATHS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
];

const PRIVATE_URL_PATTERN =
  /\/(?:result|results|order|orders|share|pay|payment|history|private|account|profile)(?:\/|$)|(?:resultid|result_id|attemptid|attempt_id|reportid|report_id|token|payment_id|order_no|orderno)=/i;

function allTargetPages() {
  const rows = [];
  for (const locale of ["en", "zh"]) {
    for (const type of TYPES) {
      for (const variant of ["a", "t"]) {
        rows.push({
          path: `/${locale}/personality/${type}-${variant}`,
          locale,
          page_type: "variant",
          type,
        });
      }
      rows.push({
        path: `/${locale}/personality/${type}-a-vs-${type}-t`,
        locale,
        page_type: "comparison",
        type,
      });
    }
  }
  return rows;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8",
    },
  });
  const text = await response.text();
  return { status: response.status, url: response.url, text };
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attrValue(tag, name) {
  const pattern = new RegExp(`${name}=["']([^"']*)["']`, "i");
  return tag.match(pattern)?.[1] || "";
}

function extractMeta(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const metaName = attrValue(tag, "name").toLowerCase();
    if (metaName === name.toLowerCase()) {
      return attrValue(tag, "content");
    }
  }
  return "";
}

function extractCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = attrValue(tag, "rel").toLowerCase();
    if (rel.split(/\s+/).includes("canonical")) {
      return attrValue(tag, "href");
    }
  }
  return "";
}

function extractHreflangs(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  return tags
    .map((tag) => {
      const rel = attrValue(tag, "rel").toLowerCase();
      const hreflang = attrValue(tag, "hreflang");
      const href = attrValue(tag, "href");
      if (!rel.split(/\s+/).includes("alternate") || !hreflang || !href) {
        return null;
      }
      return `${hreflang}:${href}`;
    })
    .filter(Boolean);
}

function extractHeadings(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  return [...html.matchAll(pattern)].map((match) => stripTags(match[1])).filter(Boolean);
}

function extractTitle(html) {
  return stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
}

function extractJsonLdTypes(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types = [];
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1].trim());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        collectJsonLdTypes(node, types);
      }
    } catch {
      types.push("invalid_jsonld");
    }
  }
  return [...new Set(types)].sort();
}

function collectJsonLdTypes(node, types) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdTypes(item, types);
    return;
  }
  const type = node["@type"];
  if (Array.isArray(type)) {
    for (const item of type) types.push(String(item));
  } else if (type) {
    types.push(String(type));
  }
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectJsonLdTypes(value, types);
  }
}

function extractLinks(html, finalUrl) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => {
      try {
        return new URL(match[1], finalUrl).toString();
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

function isSelfCanonical(canonical, expectedUrl) {
  if (!canonical) return "unknown";
  return normalizeUrl(canonical) === normalizeUrl(expectedUrl) ? "yes" : "no";
}

function normalizeUrl(value) {
  return value.replace(/\/$/, "");
}

function membership(text, url, pagePath) {
  if (!text) return "unknown";
  return text.includes(url) || text.includes(pagePath) ? "yes" : "no";
}

function robotsDirectives(raw) {
  const normalized = raw.toLowerCase();
  return {
    index_directive: normalized.includes("noindex") ? "noindex" : normalized.includes("index") ? "index" : "unknown",
    follow_directive: normalized.includes("nofollow") ? "nofollow" : normalized.includes("follow") ? "follow" : "unknown",
  };
}

function priorityFor(path, pageType) {
  if (
    path === "/en/personality/intj-a-vs-intj-t" ||
    path === "/zh/personality/istj-a" ||
    path === "/en/personality/intp-a-vs-intp-t" ||
    path === "/zh/personality/infp-t"
  ) {
    return "P0";
  }
  if (pageType === "comparison" || path.includes("/intj-")) return "P0";
  return "P1";
}

function notesFor(row) {
  const notes = [];
  if (row.gsc_24h_impressions === "Unknown") notes.push("GSC data unavailable in local audit; recorded as Unknown.");
  if (row.outbound_private_url_seen === "yes") notes.push("Private or user-specific URL pattern was detected in page links; inspect before release.");
  if (row.in_llms_full === "no" && row.page_type === "comparison") notes.push("Comparison URL not found in live llms-full snapshot.");
  return notes.join(" ");
}

function markdownTable(rows, columns) {
  const escapeCell = (value) =>
    String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => escapeCell(row[column.key])).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function isSameOriginUrl(link) {
  try {
    return new URL(link).origin === SITE_ORIGIN;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [sitemap, llms, llmsFull] = await Promise.all([
    fetchText(`${SITE_ORIGIN}/sitemap.xml`).catch((error) => ({ status: "error", url: `${SITE_ORIGIN}/sitemap.xml`, text: "", error })),
    fetchText(`${SITE_ORIGIN}/llms.txt`).catch((error) => ({ status: "error", url: `${SITE_ORIGIN}/llms.txt`, text: "", error })),
    fetchText(`${SITE_ORIGIN}/llms-full.txt`).catch((error) => ({
      status: "error",
      url: `${SITE_ORIGIN}/llms-full.txt`,
      text: "",
      error,
    })),
  ]);

  const rows = [];
  for (const page of allTargetPages()) {
    const url = `${SITE_ORIGIN}${page.path}`;
    const fetched = await fetchText(url).catch((error) => ({
      status: "error",
      url,
      text: "",
      error,
    }));
    const html = fetched.text || "";
    const canonical = extractCanonical(html);
    const hreflangs = extractHreflangs(html);
    const h1s = extractHeadings(html, "h1");
    const h2s = extractHeadings(html, "h2");
    const links = extractLinks(html, fetched.url || url);
    const privateLinks = links.filter((link) => isSameOriginUrl(link) && PRIVATE_URL_PATTERN.test(link));
    const jsonLdTypes = extractJsonLdTypes(html);
    const robots = extractMeta(html, "robots");
    const directives = robotsDirectives(robots);
    const row = {
      url,
      path: page.path,
      locale: page.locale,
      page_type: page.page_type,
      expected_http_status: 200,
      actual_http_status: fetched.status,
      ...directives,
      canonical_url: canonical || "Unknown",
      canonical_self_reference: isSelfCanonical(canonical, url),
      hreflang_present: hreflangs.length > 0 ? "yes" : "no",
      hreflang_targets: hreflangs.length > 0 ? hreflangs.join(" | ") : "Unknown",
      in_sitemap: membership(sitemap.text, url, page.path),
      in_llms: membership(llms.text, url, page.path),
      in_llms_full: membership(llmsFull.text, url, page.path),
      gsc_24h_impressions: "Unknown",
      gsc_7d_impressions: "Unknown",
      gsc_clicks: "Unknown",
      gsc_avg_position: "Unknown",
      title: extractTitle(html) || "Unknown",
      description: extractMeta(html, "description") || "Unknown",
      h1: h1s.join(" | ") || "Unknown",
      h1_count: h1s.length,
      h2_count: h2s.length,
      faq_visible: h2s.some((heading) => /quick answers|faq|常见问题|常见问答/i.test(heading)) ? "yes" : "unknown",
      faq_schema_present: jsonLdTypes.includes("FAQPage") ? "yes" : "no",
      webpage_schema_present: jsonLdTypes.includes("WebPage") || jsonLdTypes.includes("AboutPage") ? "yes" : "no",
      breadcrumb_schema_present: jsonLdTypes.includes("BreadcrumbList") ? "yes" : "no",
      schema_types: jsonLdTypes.join(" | ") || "Unknown",
      internal_link_count: links.filter((link) => isSameOriginUrl(link)).length,
      outbound_private_url_seen: privateLinks.length > 0 ? "yes" : "no",
      private_url_samples: privateLinks.slice(0, 5),
      notes: "",
    };
    row.notes = notesFor(row);
    rows.push(row);
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  const comparisons = rows.filter((row) => row.page_type === "comparison");
  const comparisonDiagnosis = comparisons.map((row) => {
    const observedGap = [];
    if (row.in_sitemap === "no") observedGap.push("missing_from_sitemap");
    if (row.in_llms === "no") observedGap.push("missing_from_llms");
    if (row.in_llms_full === "no") observedGap.push("missing_from_llms_full");
    return {
      comparison_url: row.url,
      locale: row.locale,
      in_sitemap: row.in_sitemap,
      in_llms: row.in_llms,
      in_llms_full: row.in_llms_full,
      expected_policy:
        "Read-only baseline. Do not expand llms-full before pilot content thickening and explicit release approval.",
      observed_gap: observedGap.length ? observedGap.join(" | ") : "none_observed",
      likely_reason:
        row.in_llms_full === "no"
          ? "llms-full appears budgeted or policy-limited for comparison surfaces; repair is intentionally deferred."
          : "No llms-full exposure gap observed in this snapshot.",
      should_repair_now: false,
      recommended_next_step:
        "Complete MBTI64 content package pilot and release approval before changing sitemap, llms, or llms-full exposure.",
      defer_until_pilot_release: "yes",
    };
  });

  const cohortLock = PILOT_PATHS.map((pagePath) => {
    const source = rows.find((row) => row.path === pagePath);
    return {
      URL: `${SITE_ORIGIN}${pagePath}`,
      locale: source?.locale || (pagePath.startsWith("/zh/") ? "zh" : "en"),
      page_type: source?.page_type || "unknown",
      title: source?.title || "Unknown",
      description: source?.description || "Unknown",
      H1: source?.h1 || "Unknown",
      H2_count: source?.h2_count ?? "Unknown",
      FAQ: source?.faq_visible || "Unknown",
      schema: source?.schema_types || "Unknown",
      internal_links: source?.internal_link_count ?? "Unknown",
      GSC_24h_impressions: "Unknown",
      GSC_7d_impressions: "Unknown",
      GSC_clicks: "Unknown",
      avg_position: "Unknown",
      priority: priorityFor(pagePath, source?.page_type || ""),
      baseline_source: "live_public_html_sitemap_llms_snapshot; GSC unavailable locally",
      notes:
        pagePath === "/en/personality/intj-a-vs-intj-t"
          ? "User screenshot showed 18 impressions in 24h snapshot."
          : pagePath === "/zh/personality/istj-a"
            ? "User screenshot showed 11 impressions in 24h snapshot."
            : pagePath === "/en/personality/intp-a-vs-intp-t"
              ? "User screenshot showed 10 impressions in 24h snapshot."
              : pagePath === "/zh/personality/infp-t"
                ? "User screenshot showed GSC recommendation: more impressions than usual."
                : "Pilot strategic URL; no local GSC data.",
    };
  });

  const summary = {
    run_date: RUN_DATE,
    site_origin: SITE_ORIGIN,
    scope:
      "Read-only post-deploy personality SEO indexation baseline for 64 A/T variant pages, 32 A-vs-T comparison pages, llms-full comparison diagnosis, and 8-URL pilot cohort lock.",
    no_production_behavior_changed: true,
    external_credentials: {
      gsc_access: "not_used",
      note: "GSC metrics are recorded as Unknown because the local audit does not use external credentials.",
    },
    source_snapshots: {
      sitemap: { url: sitemap.url, status: sitemap.status, bytes: sitemap.text.length },
      llms: { url: llms.url, status: llms.status, bytes: llms.text.length },
      llms_full: { url: llmsFull.url, status: llmsFull.status, bytes: llmsFull.text.length },
    },
    counts: {
      total_pages: rows.length,
      variant_pages: rows.filter((row) => row.page_type === "variant").length,
      comparison_pages: comparisons.length,
      http_200: rows.filter((row) => row.actual_http_status === 200).length,
      index_directive_index: rows.filter((row) => row.index_directive === "index").length,
      follow_directive_follow: rows.filter((row) => row.follow_directive === "follow").length,
      self_canonical_yes: rows.filter((row) => row.canonical_self_reference === "yes").length,
      hreflang_present_yes: rows.filter((row) => row.hreflang_present === "yes").length,
      in_sitemap_yes: rows.filter((row) => row.in_sitemap === "yes").length,
      in_llms_yes: rows.filter((row) => row.in_llms === "yes").length,
      in_llms_full_yes: rows.filter((row) => row.in_llms_full === "yes").length,
      outbound_private_url_seen_yes: rows.filter((row) => row.outbound_private_url_seen === "yes").length,
    },
  };

  await writeJson(`indexation-audit-${RUN_DATE}.json`, { summary, rows });
  await writeJson(`llms-full-comparison-diagnosis-${RUN_DATE}.json`, {
    summary: {
      run_date: RUN_DATE,
      comparison_pages: comparisonDiagnosis.length,
      should_repair_now: false,
      hard_rule: "No sitemap, llms, or llms-full repair in this PR.",
    },
    rows: comparisonDiagnosis,
  });
  await writeJson(`target-cohort-lock-${RUN_DATE}.json`, {
    summary: {
      run_date: RUN_DATE,
      pilot_url_count: cohortLock.length,
      queue_locked: true,
      note: "P0/P1 labels do not reduce or expand the 8-page pilot queue.",
    },
    rows: cohortLock,
  });

  await writeMarkdown(`indexation-audit-${RUN_DATE}.md`, indexationMarkdown(summary, rows));
  await writeMarkdown(
    `llms-full-comparison-diagnosis-${RUN_DATE}.md`,
    comparisonMarkdown(comparisonDiagnosis),
  );
  await writeMarkdown(`target-cohort-lock-${RUN_DATE}.md`, cohortMarkdown(cohortLock));

  console.log(JSON.stringify(summary, null, 2));
}

function indexationMarkdown(summary, rows) {
  const issueRows = rows
    .filter(
      (row) =>
        row.actual_http_status !== 200 ||
        row.index_directive !== "index" ||
        row.canonical_self_reference !== "yes" ||
        row.outbound_private_url_seen === "yes" ||
        row.in_llms_full === "no",
    )
    .slice(0, 40);
  return `# Personality SEO Post-Deploy Indexation Audit 01

## Scope

Read-only baseline for 64 MBTI A/T variant pages and 32 A-vs-T comparison pages. This artifact captures facts only. It does not repair sitemap, llms, llms-full, canonical, hreflang, schema, page content, CMS, scoring, or result-page behavior.

## Summary

- Run date: ${summary.run_date}
- Total pages audited: ${summary.counts.total_pages}
- Variant pages: ${summary.counts.variant_pages}
- Comparison pages: ${summary.counts.comparison_pages}
- HTTP 200: ${summary.counts.http_200}
- Index directive = index: ${summary.counts.index_directive_index}
- Follow directive = follow: ${summary.counts.follow_directive_follow}
- Self-canonical pages: ${summary.counts.self_canonical_yes}
- Hreflang present: ${summary.counts.hreflang_present_yes}
- In sitemap: ${summary.counts.in_sitemap_yes}
- In llms: ${summary.counts.in_llms_yes}
- In llms-full: ${summary.counts.in_llms_full_yes}
- Private/user-specific URL patterns detected: ${summary.counts.outbound_private_url_seen_yes}

## External Data

GSC data was not accessed from the local audit environment. All GSC metric fields are recorded as \`Unknown\`, not \`0\`.

## Notable Rows

${markdownTable(issueRows, [
  { key: "path", label: "Path" },
  { key: "page_type", label: "Type" },
  { key: "actual_http_status", label: "HTTP" },
  { key: "index_directive", label: "Index" },
  { key: "in_sitemap", label: "Sitemap" },
  { key: "in_llms", label: "llms" },
  { key: "in_llms_full", label: "llms-full" },
  { key: "outbound_private_url_seen", label: "Private URL" },
])}

## Machine-Readable Artifact

See \`indexation-audit-${summary.run_date}.json\`.
`;
}

function comparisonMarkdown(rows) {
  return `# Personality llms-full Comparison Diagnosis 01

## Scope

Diagnosis only for A-vs-T comparison URL exposure across sitemap, llms, and llms-full. This PR must not repair sitemap, llms, or llms-full.

## Policy

- \`should_repair_now\` is always \`false\`.
- llms-full expansion is deferred until pilot content thickening and release approval.

${markdownTable(rows, [
  { key: "comparison_url", label: "Comparison URL" },
  { key: "locale", label: "Locale" },
  { key: "in_sitemap", label: "Sitemap" },
  { key: "in_llms", label: "llms" },
  { key: "in_llms_full", label: "llms-full" },
  { key: "observed_gap", label: "Observed gap" },
  { key: "should_repair_now", label: "Repair now" },
])}
`;
}

function cohortMarkdown(rows) {
  return `# MBTI64 Target Cohort Lock 01

## Scope

Locks the first 8 pilot URLs for GPT 5.5 content package work. P0/P1 labels are prioritization notes only; they do not reduce or expand the 8-page pilot queue.

${markdownTable(rows, [
  { key: "URL", label: "URL" },
  { key: "locale", label: "Locale" },
  { key: "page_type", label: "Type" },
  { key: "priority", label: "Priority" },
  { key: "H2_count", label: "H2" },
  { key: "FAQ", label: "FAQ" },
  { key: "internal_links", label: "Internal links" },
  { key: "GSC_24h_impressions", label: "GSC 24h" },
  { key: "notes", label: "Notes" },
])}
`;
}

async function writeJson(filename, payload) {
  await writeFile(path.join(OUTPUT_DIR, filename), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function writeMarkdown(filename, payload) {
  await writeFile(path.join(OUTPUT_DIR, filename), payload, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
