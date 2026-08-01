import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const PACKAGE_DIRECTORY = path.join(
  process.cwd(),
  "generated/en-content-parity/W3-editorial-cms/articles/rework-10/article-53-source-evidence",
);
const ARTICLE_PACKAGE_DIRECTORY = path.join(
  process.cwd(),
  "generated/en-content-parity/W3-editorial-cms/articles",
);
const PERMISSION_KEYS = [
  "cms_write_authorized",
  "staging_write_authorized",
  "production_import_authorized",
  "public_release_authorized",
  "seo_runtime_release_authorized",
  "search_submission_authorized",
  "master_manifest_write_authorized",
] as const;
const EXPECTED_FILES = [
  "source_evidence_ledger.json",
  "claim_disposition.json",
  "article_53_repair_patch.candidate.json",
  "handoff.md",
];

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIRECTORY, file), "utf8")) as Record<string, unknown>;
}

function sha256(value: string | Buffer) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function expectAllPermissionsFalse(value: Record<string, unknown>) {
  const permissions = value.permissions as Record<string, boolean>;
  expect(Object.keys(permissions).sort()).toEqual([...PERMISSION_KEYS].sort());
  expect(Object.values(permissions)).toEqual(Array(PERMISSION_KEYS.length).fill(false));
}

describe("W3 Article:53 official source-evidence repair", () => {
  it("is Article:53-only evidence, bound to the retained W9 failure and with no authority escalation", () => {
    const ledger = readJson("source_evidence_ledger.json");
    const disposition = readJson("claim_disposition.json");
    const patch = readJson("article_53_repair_patch.candidate.json");

    for (const artifact of [ledger, disposition, patch]) {
      expect(artifact.stable_asset_identity).toBe("Article:53");
      expect(artifact.source_identity).toBe("Article:53@revision:65");
      expect(artifact.translation_pair_identity).toBe(
        "tg_article_gaokao_score_major_shortlist_riasec_2026v1",
      );
      expectAllPermissionsFalse(artifact);
    }

    expect(ledger.base_failed_package_sha256).toBe(
      "2c228eae88ce6fc3edb32c1dda9aabf1e2d51d6a885ef7b90d4a7c1864c0e33e",
    );
    expect(patch.canonical_package_modified).toBe(false);
    expect(disposition.unsupported_2026_time_sensitive_claims_remaining).toBe(false);
  });

  it("maps every retained 2026 fact to a primary official source and records availability and fingerprints", () => {
    const ledger = readJson("source_evidence_ledger.json");
    const evidence = ledger.evidence as Array<Record<string, unknown>>;

    expect(evidence.map((entry) => entry.evidence_id)).toEqual([
      "EDU-2026-CLOUD-CONSULTATION-WEEK",
      "MOE-2026-UNDERGRADUATE-MAJOR-CATALOGUE",
    ]);
    for (const entry of evidence) {
      expect(entry.canonical_source_url).toMatch(/^https:\/\/(gaokao\.chsi\.com\.cn|www\.moe\.gov\.cn)\//);
      expect(entry.page_title).toEqual(expect.any(String));
      expect(entry.authority_owner).toEqual(expect.any(String));
      expect(entry.retrieved_at_utc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(entry.source_availability_status).toEqual(expect.any(String));
      const fingerprint = entry.source_content_fingerprint as Record<string, unknown>;
      expect(fingerprint.algorithm).toBe("sha256");
      expect(fingerprint.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.disposition).toBe("retain_with_primary_official_evidence");
      expect(entry.supports_claims).toEqual(expect.any(Array));
    }

    expect(evidence[0]?.source_availability_status).toContain("direct_http_retrieval_returned_412");
    expect(evidence[1]?.source_availability_status).toBe("official_page_available_http_200");
  });

  it("keeps Article:53 identity fixed, changes only the declared unsupported section, and preserves all 16 other projections", () => {
    const patch = readJson("article_53_repair_patch.candidate.json");
    const ledger = JSON.parse(
      fs.readFileSync(path.join(ARTICLE_PACKAGE_DIRECTORY, "source_ledger.json"), "utf8"),
    ) as { rows: Array<Record<string, unknown>> };
    const article53 = ledger.rows.find((row) => row.stable_asset_identity === "Article:53");
    const repair = patch.patch as Record<string, unknown>;
    const currentContent = article53?.candidate_content_md as string;

    expect(article53).toMatchObject({
      source_article_id: 53,
      source_revision_id: 65,
      slug: "gaokao-score-major-shortlist-riasec-checklist",
      expected_target_route: "/en/articles/gaokao-score-major-shortlist-riasec-checklist",
    });
    const currentSection = currentContent.match(
      /## The 2026 Context: (?:More Majors, More Anxiety|Start With Official Information)[\s\S]*?(?=## Eliminate These Six Categories First|$)/,
    )?.[0];
    const declaredSectionHashes = [
      repair.expected_previous_section_sha256,
      repair.replacement_section_sha256,
    ];
    expect([
      sha256(`${currentSection}\n`),
      sha256(`${currentSection?.trimEnd()}\n`),
    ].some((sectionHash) => declaredSectionHashes.includes(sectionHash))).toBe(true);
    expect(sha256(repair.replacement_section_md as string)).toBe(repair.replacement_section_sha256);
    expect(repair.replacement_section_md).not.toContain("capture the future");
    expect(repair.supporting_evidence_ids).toEqual([
      "EDU-2026-CLOUD-CONSULTATION-WEEK",
      "MOE-2026-UNDERGRADUATE-MAJOR-CATALOGUE",
    ]);

    const nonTargetProjection = ledger.rows
      .filter((row) => row.source_article_id !== 53)
      .map((row) => ({
        stable_asset_identity: row.stable_asset_identity,
        reader_visible_sha256: sha256(
          JSON.stringify({
            candidate_title: row.candidate_title,
            candidate_excerpt: row.candidate_excerpt,
            candidate_content_md: row.candidate_content_md,
          }),
        ),
      }));
    expect(nonTargetProjection).toHaveLength(16);
    expect(sha256(JSON.stringify(nonTargetProjection))).toBe(
      (patch.non_target_reader_visible_projection as Record<string, string>).sha256,
    );
  });

  it("recomputes the immutable evidence package SHA from the declared files", () => {
    const manifest = readJson("sha256_manifest.json");
    const files = manifest.files as Array<{ path: string; sha256: string }>;

    expect(files.map((entry) => entry.path)).toEqual(EXPECTED_FILES);
    for (const entry of files) {
      expect(entry.sha256).toBe(sha256(fs.readFileSync(path.join(PACKAGE_DIRECTORY, entry.path))));
    }
    expect(manifest.package_sha256).toBe(
      sha256(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")),
    );
  });
});
