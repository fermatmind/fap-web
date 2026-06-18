#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const MAP_PATH = "docs/seo/personality/query-intent-map-pilot-v1.json";

const REQUIRED_FIELDS = [
  "url",
  "locale",
  "page_type",
  "primary_query",
  "secondary_queries",
  "excluded_queries",
  "target_intent",
  "snippet_angle",
  "internal_link_role",
  "target_test_route",
  "cannibalization_risk",
  "sibling_pages",
  "canonical_target",
  "sitemap_exposure_status",
  "llms_exposure_status",
  "llms_full_exposure_status",
  "content_gap_notes",
  "notes",
];

const PILOT_URLS = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
];

const FORBIDDEN_TARGET_ROUTE = /\/(?:result|results|orders?|share|pay|payment|history|private|account)(?:\/|$)|(?:token|session|user)/i;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const artifact = JSON.parse(await readFile(MAP_PATH, "utf8"));
const rows = artifact.rows;

assert(Array.isArray(rows), "rows must be an array");
assert(rows.length === 8, `expected exactly 8 rows, got ${rows.length}`);

const urls = rows.map((row) => row.url);
assert(JSON.stringify(urls) === JSON.stringify(PILOT_URLS), "pilot URL list/order changed");

const primaryQueries = new Map();
for (const [index, row] of rows.entries()) {
  for (const field of REQUIRED_FIELDS) {
    assert(Object.hasOwn(row, field), `row ${index + 1} missing field: ${field}`);
  }

  assert(row.locale === "en" || row.locale === "zh-CN", `row ${row.url} has invalid locale`);
  assert(row.page_type === "variant" || row.page_type === "comparison", `row ${row.url} has invalid page_type`);
  assert(typeof row.primary_query === "string" && row.primary_query.trim(), `row ${row.url} missing primary_query`);
  assert(Array.isArray(row.secondary_queries), `row ${row.url} secondary_queries must be an array`);
  assert(Array.isArray(row.excluded_queries) && row.excluded_queries.length > 0, `row ${row.url} must include excluded_queries`);
  assert(Array.isArray(row.sibling_pages), `row ${row.url} sibling_pages must be an array`);
  assert(row.target_test_route === "Unknown" || row.target_test_route.startsWith(`/${row.locale === "zh-CN" ? "zh" : "en"}/tests/`), `row ${row.url} has unsafe target_test_route`);
  assert(!FORBIDDEN_TARGET_ROUTE.test(row.target_test_route), `row ${row.url} has forbidden target_test_route`);

  const key = row.primary_query.toLowerCase();
  assert(!primaryQueries.has(key), `duplicate primary_query: ${row.primary_query}`);
  primaryQueries.set(key, row.url);

  if (row.page_type === "comparison") {
    assert(/vs|区别|difference|对比/i.test(row.primary_query), `comparison row ${row.url} must target comparison intent`);
    assert(row.excluded_queries.some((query) => /meaning|personality|人格特点|是什么人格/i.test(query)), `comparison row ${row.url} must exclude standalone profile queries`);
  } else {
    assert(!/ vs |difference|区别|对比/i.test(row.primary_query), `variant row ${row.url} must not target comparison intent`);
    assert(row.excluded_queries.some((query) => /vs|difference|区别|对比/i.test(query)), `variant row ${row.url} must exclude comparison queries`);
  }
}

console.log("mbti64-query-intent-map-validation-ok");
