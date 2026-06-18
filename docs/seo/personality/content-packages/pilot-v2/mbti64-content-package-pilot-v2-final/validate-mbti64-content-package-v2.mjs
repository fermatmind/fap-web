#!/usr/bin/env node
import { readFile } from "node:fs/promises";
const file = new URL("./mbti64-content-package-pilot-v2.json", import.meta.url);
const artifact = JSON.parse(await readFile(file, "utf8"));
const rows = artifact.rows;
const expected = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t"
];
const badHref = /\/(?:result|results|orders?|share|pay|payment|history|private|account)(?:\/|$)|(?:token|session|user|resultid|result_id|attemptid|attempt_id|reportid|report_id)=/i;
const forbiddenClaim = [/official\s+MBTI/i,/official\s+32/i,/certified\s+MBTI/i,/官方\s*MBTI/i,/官方\s*32\s*型/i,/职业.*保证/i,/certainty claim[s]?\s+(career|job|relationship)/i];
function assert(x,msg){if(!x) throw new Error(msg)}
assert(artifact.version === "pilot-v2", "version must be pilot-v2");
assert(Array.isArray(rows) && rows.length === 8, "must have exactly 8 rows");
assert(JSON.stringify(rows.map(r=>r.url)) === JSON.stringify(expected), "pilot URL order changed");
for (const r of rows) {
  assert(r.status === "draft_for_codex_qa", `${r.url} status must stay draft_for_codex_qa`);
  assert(r.seo && r.content && Array.isArray(r.faq) && r.internal_links, `${r.url} missing core fields`);
  assert(r.faq.length >= 5, `${r.url} needs at least 5 FAQ items`);
  assert(r.v2_optimization, `${r.url} missing v2_optimization`);
  assert(r.serp_ctr_package_v2, `${r.url} missing serp_ctr_package_v2`);
  assert(r.method_boundary && r.trademark_boundary && r.information_gain, `${r.url} missing boundary/information_gain`);
  assert(r.target_test_route === "/en/tests/mbti-personality-test-16-personality-types" || r.target_test_route === "/zh/tests/mbti-personality-test-16-personality-types", `${r.url} unsafe target_test_route`);
  for (const l of r.internal_links) {
    if (l.href !== "Unknown") assert(!badHref.test(l.href), `${r.url} bad internal href ${l.href}`);
  }
  const blob = JSON.stringify(r);
    for (const pat of forbiddenClaim) assert(!pat.test(blob), `${r.url} contains forbidden claim ${pat}`);
  if (r.page_type === "variant") {
    for (const k of ["quick_answer","meaning","a_t_difference","core_traits","strengths_blind_spots","careers_work_style","relationships_communication","common_misreads","similar_types"]) assert(r.content[k], `${r.url} missing variant section ${k}`);
  } else {
    for (const k of ["quick_answer","side_by_side_summary","core_traits_comparison","stress_confidence","career_work_style","relationships_love","which_one_fits"]) assert(r.content[k], `${r.url} missing comparison section ${k}`);
  }
}
console.log("mbti64-content-package-pilot-v2-validation-ok");
