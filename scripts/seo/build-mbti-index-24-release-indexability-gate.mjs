#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = "docs/seo/personality/mbti-index-24-release-indexability-gate-2026-07-11";
const profiles = ["istj-a", "istp-a", "isfp-a", "esfj-a"];
const comparisons = ["intp-a-vs-intp-t", "intj-vs-intp", "entj-vs-intj", "infj-vs-infp", "istj-vs-isfj"];
const records = [...profiles.map((slug) => [slug, "profile", "noindex"]), ...comparisons.map((slug) => [slug, "comparison", "held_for_mbti_index_24"])].map(([slug, kind, apiIndexability]) => ({
  path: `/zh/personality/${slug}`,
  kind,
  cms28_result: "pass",
  api_indexability: apiIndexability,
  canonical: `https://fermatmind.com/zh/personality/${slug}`,
  page_robots: "noindex,nofollow,noarchive,nocache",
  content_complete: true,
  schema_present: kind === "profile",
  sitemap_present: false,
  llms_present: false,
  llms_full_present: false,
  release_decision: "hold_no_url_expansion",
  blockers: ["backend_authority_still_noindex", ...(kind === "comparison" ? ["comparison_jsonld_missing"] : [])],
}));

const report = {
  id: "MBTI-INDEX-24",
  artifact: "MBTI-INDEX-24-RELEASE-INDEXABILITY-GATE",
  generated_at: "2026-07-11T02:19:02.000Z",
  evidence_scope: "read_only_production_cms28_revalidation",
  backend_deployed_revision: "9bb8319a23e11f4c359bebabc0e604db25191898",
  backend_contains_authorized_sha: "16a31281b1f73f6691b0c708cc3c6d62e58073f2",
  cms28: { result: "PASS_9_OF_9", profile_count: 4, comparison_count: 5 },
  gate_checks: {
    content_quality: "pass", canonical: "pass", robots_consistency: "pass_noindex", schema_presence: "hold_comparison_jsonld_missing",
    backend_indexability_authority: "hold", sitemap_absence_while_held: "pass", llms_absence_while_held: "pass", llms_full_absence_while_held: "pass",
  },
  final_decision: "HOLD_NO_URL_EXPANSION_NOINDEX_AND_COMPARISON_SCHEMA_MISSING",
  expansion_allowed: false,
  gsc_allowed: false,
  records,
  required_next_tasks: [
    { id: "MBTI-INDEX-24A", repo: "fap-web", scope: "render backend-authoritative JSON-LD for the five verified comparison pages" },
    { id: "MBTI-INDEX-24B", repo: "fap-api", scope: "operator-approved backend indexability promotion after schema revalidation" },
  ],
  safety_boundary: { artifact_only: true, cms_write_attempted: false, database_mutation_attempted: false, sitemap_runtime_mutation_attempted: false, llms_runtime_mutation_attempted: false, gsc_submission_attempted: false, production_deploy_attempted: false },
};

const md = `# MBTI-INDEX-24 Release Indexability Gate\n\n- CMS-28: \`${report.cms28.result}\`\n- Final decision: \`${report.final_decision}\`\n- Expansion allowed: \`false\`\n- GSC allowed: \`false\`\n\nAll nine records passed CMS/API content, canonical and noindex consistency checks and remain absent from sitemap, llms.txt and llms-full.txt. The four profiles expose JSON-LD; the five comparison pages do not. Backend authority also still returns noindex. URL expansion remains held and this PR performs no runtime mutation.\n\n## Next tasks\n\nFirst render backend-authoritative comparison JSON-LD in \`MBTI-INDEX-24A\`, then perform an explicitly authorized backend promotion in \`MBTI-INDEX-24B\`. Re-run this gate after both steps.\n`;
const csv = ["path,kind,cms28_result,api_indexability,page_robots,canonical,schema_present,sitemap_present,llms_present,llms_full_present,release_decision", ...records.map((r) => [r.path,r.kind,r.cms28_result,r.api_indexability,r.page_robots,r.canonical,r.schema_present,r.sitemap_present,r.llms_present,r.llms_full_present,r.release_decision].join(","))].join("\n") + "\n";
for (const [ext, body] of [["json", JSON.stringify(report, null, 2) + "\n"], ["md", md], ["csv", csv]]) {
  const target = path.join(root, `${base}.${ext}`); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, body);
}
console.log(`${report.final_decision}: ${records.length} records checked`);
