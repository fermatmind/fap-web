import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageDir = path.join(root, "generated/en-content-parity/W3-editorial-cms/articles");
const evidenceDir = path.join(packageDir, "rework-10/article-53-source-evidence");
const packageId = "EN-PARITY-W3-ARTICLE-ASSETS-PRODUCER-REWORK-10-2026-08-01";
const immutableFiles = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "handoff.md",
];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(packageDir, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(packageDir, file), `${JSON.stringify(value, null, 2)}\n`);
const readEvidence = (file) => JSON.parse(fs.readFileSync(path.join(evidenceDir, file), "utf8"));

const evidenceManifest = readEvidence("sha256_manifest.json");
const evidencePackageSha = sha256(
  evidenceManifest.files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"),
);
if (evidencePackageSha !== evidenceManifest.package_sha256) {
  throw new Error("Article:53 source evidence package SHA does not recompute");
}
const patch = readEvidence("article_53_repair_patch.candidate.json");
if (patch.consumer_pr_id !== "EN-PARITY-W3-ARTICLE-PACKAGE-REWORK-10-01") {
  throw new Error("Article:53 repair patch is not bound to this consumer PR");
}

const scope = readJson("scope_manifest.json");
const translation = readJson("translation_map.json");
const ledger = readJson("source_ledger.json");
const boundary = readJson("claim_boundary_report.json");
const editorial = readJson("editorial_review.json");
const dryRun = readJson("dry_run_readiness.json");
const candidate = readJson("master_manifest_patch.candidate.json");

const article53 = ledger.rows.find((row) => row.stable_asset_identity === "Article:53");
if (!article53 || article53.source_revision_id !== 65 || article53.translation_pair_identity !== patch.translation_pair_identity) {
  throw new Error("Article:53 identity invariants do not match the repair patch");
}
const visible = (row) => ({
  candidate_title: row.candidate_title,
  candidate_excerpt: row.candidate_excerpt,
  candidate_content_md: row.candidate_content_md,
});
const nonTargetProjection = ledger.rows
  .filter((row) => row.stable_asset_identity !== "Article:53")
  .map((row) => ({ stable_asset_identity: row.stable_asset_identity, reader_visible_sha256: sha256(JSON.stringify(visible(row))) }));
if (sha256(JSON.stringify(nonTargetProjection)) !== patch.non_target_reader_visible_projection.sha256) {
  throw new Error("One or more non-Article:53 reader-visible fields drifted before rebuild");
}

const sectionPattern = /## The 2026 Context: More Majors, More Anxiety[\s\S]*?(?=## Eliminate These Six Categories First|$)/;
const previousSection = article53.candidate_content_md.match(sectionPattern)?.[0];
if (sha256(patch.patch.replacement_section_md) !== patch.patch.replacement_section_sha256) {
  throw new Error("Article:53 replacement section SHA does not match");
}
if (previousSection) {
  if (sha256(`${previousSection}\n`) !== patch.patch.expected_previous_section_sha256) {
    throw new Error("Article:53 source section does not match the exact repair precondition");
  }
  article53.candidate_content_md = article53.candidate_content_md.replace(sectionPattern, patch.patch.replacement_section_md);
} else if (!article53.candidate_content_md.includes(patch.patch.replacement_section_md)) {
  throw new Error("Article:53 has neither the exact pre-repair nor exact repaired section");
}
article53.translation_method = "local Qwen3-4B-Instruct-2507-4bit draft plus producer review; rework-10 primary-source evidence repair for the Article:53 2026 boundary";
article53.claim_boundary_status = "producer_preflight_pass_with_rework_10_primary_source_evidence_independent_W9_pending";
article53.external_claim_evidence = {
  artifact_path: "generated/en-content-parity/W3-editorial-cms/articles/rework-10/article-53-source-evidence/sha256_manifest.json",
  package_sha256: evidenceManifest.package_sha256,
  repair_patch_sha256: evidenceManifest.files.find((entry) => entry.path === "article_53_repair_patch.candidate.json").sha256,
  applied_claim_ids: ["cloud-consultation-week-dates", "catalogue-and-new-entries", "emerging-major-outcome-warning"],
  producer_disposition: "official_source_evidence_consumed_and_predictive_framing_removed",
};
ledger.package_id = packageId;
ledger.rework_10 = {
  producer_pr_id: "EN-PARITY-W3-ARTICLE-PACKAGE-REWORK-10-01",
  repaired_row: "Article:53",
  source_evidence_package_sha256: evidenceManifest.package_sha256,
  non_target_reader_visible_projection_sha256: patch.non_target_reader_visible_projection.sha256,
};

for (const artifact of [scope, translation, boundary, editorial, dryRun, candidate]) {
  artifact.package_id = packageId;
}
scope.status = "package_frozen";
boundary.scope = "producer claim-boundary preflight after W9-directed Article:53 primary-source evidence repair for 17 candidate English Article assets; not independent W9 QA";
boundary.findings = boundary.findings.filter(
  (finding) =>
    finding.finding !== "Producer rework-09 repaired only the authorized reader-visible language, grammar, punctuation, and en-US consistency defects across ten Article rows; a fresh independent W9 must review the complete rebuilt package." &&
    !finding.finding.startsWith("Article:53 consumes the exact primary-source evidence package"),
);
boundary.findings.unshift({
  severity: "gate_required",
  rows: [53],
  finding: `Article:53 consumes the exact primary-source evidence package ${evidenceManifest.package_sha256}; its 2026 factual statements are source-mapped and its unsupported predictive framing is removed. Fresh independent W9 must review the complete rebuilt package.`,
});
editorial.review_kind = "completed 17/17 producer re-review after rework-10 Article:53 primary-source evidence repair; not independent W9 QA and not human editorial approval";
editorial.completed_checks = [
  ...editorial.completed_checks.filter(
    (item) =>
      !item.includes("seven PASS rows retain byte-identical") &&
      !item.startsWith("Article:53 exact primary-source evidence package consumed") &&
      !item.startsWith("the other 16 Article reader-visible projections remain byte-identical"),
  ),
  "Article:53 exact primary-source evidence package consumed and the declared 2026 section replacement applied",
  "the other 16 Article reader-visible projections remain byte-identical",
];
dryRun.blockers[0] = "Fresh independent W9 QA has not reviewed every registered row and field in the rebuilt rework-10 package.";

writeJson("scope_manifest.json", scope);
writeJson("translation_map.json", translation);
writeJson("source_ledger.json", ledger);
writeJson("claim_boundary_report.json", boundary);
writeJson("editorial_review.json", editorial);
writeJson("dry_run_readiness.json", dryRun);
fs.writeFileSync(path.join(packageDir, "handoff.md"), `# W3 Article English candidate package\n\n## Scope\n\nThis producer package contains exactly 17 English Article candidates bound to the frozen CMS Article ids, translation identities, slugs, and published source revision ids. It proposes only package_in_progress → package_frozen.\n\n## Rework-10 repair\n\n- Consumes Article:53 primary-source evidence package ${evidenceManifest.package_sha256}.\n- Applies only the declared Article:53 2026-context section replacement; Article:53 identity, revision, translation group, slug, route, title, excerpt, headings, and link set remain fixed.\n- The other 16 Article reader-visible projections remain byte-identical.\n\n## Deferred gates\n\nFresh independent W9 review, CONTROL acceptance, CMS/import, publication, SEO/indexability, search, runtime, and deployment remain separately gated and unauthorized. The master manifest remains unchanged.\n`);

const files = immutableFiles.map((file) => ({ path: file, sha256: sha256(fs.readFileSync(path.join(packageDir, file))) }));
const packageSha = sha256(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));
writeJson("sha256_manifest.json", {
  schema_version: "fermatmind.en_content_parity_package_sha256_manifest.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-ARTICLES",
  package_id: packageId,
  files,
  package_sha256: packageSha,
});
const masterSha = sha256(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json")));
candidate.base_manifest_sha256 = masterSha;
candidate.package_sha256 = packageSha;
candidate.proposed_status = "package_frozen";
candidate.sha256_manifest_path = "generated/en-content-parity/W3-editorial-cms/articles/sha256_manifest.json";
candidate.gate_evidence.report_sha256 = files.find((entry) => entry.path === "editorial_review.json").sha256;
candidate.gate_evidence.rework_10_source_evidence_package_sha256 = evidenceManifest.package_sha256;
candidate.gate_evidence.repaired_stable_asset_identity = "Article:53";
writeJson("master_manifest_patch.candidate.json", candidate);
console.log(JSON.stringify({ packageSha, masterSha, evidencePackageSha, nonTargetReaderVisibleSha: patch.non_target_reader_visible_projection.sha256 }));
