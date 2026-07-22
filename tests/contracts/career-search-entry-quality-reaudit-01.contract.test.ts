import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = "docs/seo/generated/career-quality-tiering-01.v1.json";
const REPORT_PATH = "docs/seo/career-quality-tiering-01.md";

type ReauditRow = {
  slug: string;
  dataset_publish_track: string;
  reviewer_status: string;
  indexable_bilingual: boolean;
  tier: string;
  risk_codes: string[];
};

type DetailSample = {
  slug: string;
  locale: "en" | "zh";
  detail_api_status: number | null;
  detail_enrichment_available: boolean;
  reviewer_status_detail: string;
};

type ReauditArtifact = {
  schema_version: string;
  task: string;
  generated_at: string;
  source: {
    career_dataset_api: string;
    career_directory_api: string[];
    optional_legacy_career_index_enrichment_api: string[];
  };
  scope_guard: {
    no_career_body_generated: boolean;
    no_cms_mutation: boolean;
    no_backend_mutation: boolean;
    no_publish: boolean;
    no_deploy: boolean;
    search_channel_action_performed: boolean;
    url_submission_performed: boolean;
    external_search_api_call_performed: boolean;
    pseo_blast_performed: boolean;
    strong_claims_added: boolean;
  };
  inventory_summary: {
    career_dataset_member_count: number;
    career_directory_en_count: number;
    career_directory_zh_count: number;
    career_index_en_count: number;
    career_index_zh_count: number;
    stable_detail_enrichment_count: number;
    stable_detail_zh_enrichment_count: number;
    unique_career_slugs: number;
    sitemap_career_detail_urls: number;
    sitemap_unique_career_slugs: number;
    optional_index_enrichment_gap: { en_missing: number; zh_missing: number };
  };
  tier_counts: Record<string, number>;
  risk_categories: {
    authority_gap: {
      career_index_en_item_missing: number;
      career_index_zh_item_missing: number;
    };
    dataset_publish_track: Record<string, number>;
  };
  career_api_samples: {
    stable_detail_enrichment: Array<{ slug: string; locale: string; ok: boolean }>;
  };
  sample_results: DetailSample[];
  sitemap_check: {
    observation_source: string;
    live_sitemap_status: number | null;
    live_sitemap_ok: boolean;
    backend_sitemap_source_status: number | null;
    backend_sitemap_source_ok: boolean | null;
  };
  go_no_go: {
    career_pseo_amplification: string;
    search_submission_allowed_by_this_artifact: boolean;
    career_body_generation_allowed_by_this_artifact: boolean;
  };
  rows: ReauditRow[];
};

type VersionedArtifact = {
  schema_version: string;
  task: string;
  generated_at: string;
  reaudited_at: string;
  reaudit: ReauditArtifact;
};

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("CAREER-SEARCH-ENTRY-QUALITY-REAUDIT-01", () => {
  const artifact = readJson<VersionedArtifact>(ARTIFACT_PATH);
  const reaudit = artifact.reaudit;

  it("preserves the frozen v1 baseline while adding a current v2 re-audit", () => {
    expect(artifact.schema_version).toBe("1.0");
    expect(artifact.task).toBe("CAREER-QUALITY-TIERING-01");
    expect(artifact.reaudited_at).toBe(reaudit.generated_at);
    expect(new Date(artifact.reaudited_at).getTime()).toBeGreaterThan(new Date(artifact.generated_at).getTime());
    expect(reaudit.schema_version).toBe("2.0");
    expect(reaudit.task).toBe("CAREER-SEARCH-ENTRY-QUALITY-REAUDIT-01");
  });

  it("uses current backend dataset and directory authority for exactly 1046 public career slugs", () => {
    expect(reaudit.source.career_dataset_api).toBe("/api/v0.5/career/datasets/occupations");
    expect(reaudit.source.career_directory_api).toHaveLength(2);
    expect(reaudit.inventory_summary).toMatchObject({
      career_dataset_member_count: 1046,
      career_directory_en_count: 1046,
      career_directory_zh_count: 1046,
      unique_career_slugs: 1046,
      sitemap_career_detail_urls: 2092,
      sitemap_unique_career_slugs: 1046,
    });
    expect(reaudit.rows).toHaveLength(1046);
    expect(new Set(reaudit.rows.map((row) => row.slug)).size).toBe(1046);
  });

  it("records the optional legacy job-index enrichment gap instead of treating it as 1046 authority", () => {
    expect(reaudit.source.optional_legacy_career_index_enrichment_api).toHaveLength(2);
    expect(reaudit.inventory_summary.career_index_en_count).toBeLessThan(1046);
    expect(reaudit.inventory_summary.career_index_zh_count).toBeLessThan(1046);
    expect(reaudit.inventory_summary.optional_index_enrichment_gap.en_missing).toBeGreaterThan(0);
    expect(reaudit.inventory_summary.optional_index_enrichment_gap.zh_missing).toBeGreaterThan(0);
    expect(reaudit.risk_categories.authority_gap.career_index_en_item_missing).toBeGreaterThan(0);
    expect(reaudit.risk_categories.authority_gap.career_index_zh_item_missing).toBeGreaterThan(0);
  });

  it("keeps broad runtime and hold cohorts out of bulk search amplification", () => {
    expect(Object.values(reaudit.tier_counts).reduce((sum, count) => sum + count, 0)).toBe(1046);
    expect(reaudit.risk_categories.dataset_publish_track.runtime_publish_projection).toBeGreaterThan(0);
    expect(reaudit.risk_categories.dataset_publish_track.hold).toBeGreaterThan(0);
    expect(
      reaudit.rows
        .filter((row) => row.dataset_publish_track === "runtime_publish_projection")
        .every((row) => row.tier !== "tier_a_controlled_search_entry_candidate")
    ).toBe(true);
    expect(reaudit.tier_counts.tier_d_hold_not_search_entry).toBeGreaterThan(0);
    expect(reaudit.go_no_go.career_pseo_amplification).toBe("NO_GO");
  });

  it("fails closed when either locale lacks SEO evidence or rendered HTML says noindex", () => {
    const heldForLocaleEvidence = reaudit.rows.filter((row) =>
      row.risk_codes.some((risk) =>
        [
          "locale_seo_evidence_en_missing",
          "locale_seo_evidence_zh_missing",
          "locale_html_noindex_en",
          "locale_html_noindex_zh",
        ].includes(risk)
      )
    );

    expect(heldForLocaleEvidence.length).toBeGreaterThan(0);
    expect(
      heldForLocaleEvidence.every(
        (row) => !row.indexable_bilingual && row.tier === "tier_d_hold_not_search_entry"
      )
    ).toBe(true);
  });

  it("feeds successful sampled detail enrichment back into the final locale rows", () => {
    const generator = readText("scripts/seo/generate-career-quality-tiering.mjs");
    expect(generator).toContain("target.set(sample.slug, sample._detail_enrichment_item)");

    for (const sample of reaudit.sample_results.filter((result) => result.detail_enrichment_available)) {
      const row = reaudit.rows.find((candidate) => candidate.slug === sample.slug);
      expect(row).toBeDefined();
      expect(row?.risk_codes).not.toContain(
        sample.locale === "zh" ? "career_index_zh_item_missing" : "career_index_en_item_missing"
      );
      if (sample.reviewer_status_detail !== "unavailable_from_current_directory_authority") {
        expect(row?.reviewer_status).not.toBe("unavailable_from_current_directory_authority");
      }
    }
  });

  it("samples stable details without granting search, CMS, runtime, publish, or deploy authority", () => {
    expect(reaudit.career_api_samples.stable_detail_enrichment).toHaveLength(10);
    expect(
      reaudit.career_api_samples.stable_detail_enrichment.filter((sample) => sample.ok).length
    ).toBe(
      reaudit.inventory_summary.stable_detail_enrichment_count +
        reaudit.inventory_summary.stable_detail_zh_enrichment_count
    );
    expect(reaudit.scope_guard).toMatchObject({
      no_career_body_generated: true,
      no_cms_mutation: true,
      no_backend_mutation: true,
      no_publish: true,
      no_deploy: true,
      search_channel_action_performed: false,
      url_submission_performed: false,
      external_search_api_call_performed: false,
      pseo_blast_performed: false,
      strong_claims_added: false,
    });
    expect(reaudit.go_no_go.search_submission_allowed_by_this_artifact).toBe(false);
    expect(reaudit.go_no_go.career_body_generation_allowed_by_this_artifact).toBe(false);
  });

  it("records whether the successful sitemap evidence came from public XML or backend authority fallback", () => {
    expect(["live_sitemap_xml", "backend_sitemap_source_fallback"]).toContain(
      reaudit.sitemap_check.observation_source
    );
    if (reaudit.sitemap_check.observation_source === "live_sitemap_xml") {
      expect(reaudit.sitemap_check.live_sitemap_status).toBe(200);
      expect(reaudit.sitemap_check.live_sitemap_ok).toBe(true);
    } else {
      expect(reaudit.sitemap_check.backend_sitemap_source_status).toBe(200);
      expect(reaudit.sitemap_check.backend_sitemap_source_ok).toBe(true);
    }

    const generator = readText("scripts/seo/generate-career-quality-tiering.mjs");
    expect(generator).toContain("OWNED_SITEMAP_HOSTS");
    expect(generator).toContain('url.protocol !== "https:"');
    expect(generator).toContain("url.search || url.hash");
  });

  it("documents the re-audit as evidence only with no runtime or sitemap-membership change", () => {
    const report = readText(REPORT_PATH);
    expect(report).toContain("CAREER-SEARCH-ENTRY-QUALITY-REAUDIT-01");
    expect(report).toContain("No runtime behavior change");
    expect(report).toContain("No sitemap membership change");
    expect(report).toContain("NO_GO");
  });
});
